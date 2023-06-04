import { Client } from "@notionhq/client";
import type {
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { z } from "zod";

import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type { NotionAuthRes } from "~/types";
import { getWeekKey } from "~/utils";

type HabitLogDate = {
  year: number;
  month: number;
  day?: number;
};

export const notionRouter = createTRPCRouter({
  notionAuth: protectedProcedure
    .input(z.object({ tempCode: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log("Beginning Notion Auth");

      const { tempCode } = input;

      const clientId = env.NOTION_CLIENT_ID;
      const clientSecret = env.NOTION_CLIENT_SECRET;
      const redirectUri = env.NOTION_REDIRECT_URI;

      const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
      );

      const response = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${encoded}`,
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code: tempCode,
          redirect_uri: redirectUri,
        }),
      });

      const responseData = (await response.json()) as NotionAuthRes;
      console.log("responseData", responseData);

      if (!response.ok) {
        throw new Error("Error fetching token");
      }

      const accessToken = responseData.access_token;
      console.log("accessToken", accessToken);

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { notionToken: accessToken },
      });

      return responseData;
    }),

  getDB: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { notionToken: true },
    });

    if (!user || !user.notionToken) {
      throw new Error("User not found");
    }

    const accessToken = user.notionToken;

    console.log("user: ", user);
    console.log("accessToken: ", accessToken);

    const notion = new Client({
      auth: accessToken,
    });

    const res = (
      await notion.search({
        filter: {
          value: "database",
          property: "object",
        },
        sort: {
          direction: "descending",
          timestamp: "last_edited_time",
        },
      })
    ).results as DatabaseObjectResponse[];

    if (!res) {
      throw new Error("Error fetching databases");
    }

    // res.map((db) => ({
    //   id: db.id,
    //   icon: db.icon && db.icon.type === "emoji" ? db.icon.emoji : undefined,
    //   name: db.title[0]?.plain_text,
    //   properties: Object.keys(db.properties).length,
    //   edited: new Date(db.last_edited_time),
    // }));

    return res.map((db) => ({
      id: db.id,
      icon:
        db.icon && db.icon.type === "emoji"
          ? db.icon.emoji.toString()
          : undefined,
      name: db.title[0]?.plain_text,
      properties: Object.keys(db.properties).length - 1,
      edited: new Date(db.last_edited_time),
      created: new Date(db.created_time),
    }));
  }),

  populateDB: protectedProcedure
    .input(
      z.object({
        dbIds: z.array(
          z.object({ dbName: z.string(), dbId: z.string(), year: z.number() })
        ),
      })
    )
    .query(async ({ input, ctx }) => {
      const { dbIds } = input;

      const accessToken = (
        await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { notionToken: true },
        })
      )?.notionToken;

      if (!accessToken) {
        throw new Error("User not found");
      }

      const habitsAdded = new Map<string, string>();

      const notion = new Client({ auth: accessToken });

      const logged = [];

      // for each month/database
      for (const { dbName, dbId, year } of dbIds) {
        const month = new Date(`${dbName} 1, ${year}`).getMonth();

        const dbRes = await notion.databases.query({
          database_id: dbId,
        });

        if (!dbRes) throw new Error("Error fetching database");

        // begin populating actual database
        const notionDB = dbRes.results as PageObjectResponse[];

        // get the first row and use it to get the properties to create the habits
        const firstRow = notionDB[0];

        if (!firstRow) throw new Error("Error fetching first row");

        const properties = firstRow.properties;
        for (const habitName in properties) {
          const value = properties[habitName];
          const sanitizedName = habitName.replace(/\s/g, "").toLowerCase();
          if (value?.type !== "checkbox" || habitsAdded.has(sanitizedName))
            continue;

          const habitData = {
            name: habitName,
            userId: ctx.session.user.id,
            emoji: "📓",
            frequency: 1,
          };

          const habit = await ctx.prisma.habit.create({ data: habitData });
          console.log("habit created: ", habit);
          habitsAdded.set(sanitizedName, habit.id);
        }

        // for each row of the Notion database
        for (const { properties: row } of notionDB) {
          // get the day and date of the row
          const date: HabitLogDate = { year, month };

          const dayValue = row["Day"] ?? row["day"];

          if (dayValue?.type === "title") {
            const day = dayValue.title[0]?.plain_text;
            date.day = parseInt(day ?? "0");
          }

          const logDate = new Date(date.year, date.month, date.day);

          // for each property/habit in the row
          for (const property in row) {
            const value = row[property];
            if (value?.type !== "checkbox") continue;

            const sanitizedName = property.replace(/\s/g, "").toLowerCase();

            const habitLogData = {
              habitId: habitsAdded.get(sanitizedName) as string,
              date: logDate,
              completed: value.checkbox,
              weekKey: getWeekKey(logDate),
            };

            logged.push(habitLogData);
          }
        }
      }

      // add all of the logs to database
      const log = await ctx.prisma.habitLog.createMany({
        data: logged,
      });

      console.log("total logs added: ", log.count);

      const res = {
        habitsAdded: Array.from(habitsAdded.values()),
        loggedEntries: log.count,
      };

      return res;
    }),

  getNotionAuthStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { notionToken: true },
    });

    if (!user || !user.notionToken) {
      return false;
    }

    return true;
  }),

  logOut: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.update({
      where: { id: ctx.session.user.id },
      data: { notionToken: null },
    });

    return true;
  }),
});

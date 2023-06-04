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
      for (const { dbName, dbId, year } of dbIds) {
        // console.log("processing notion db: ", dbName, dbId);
        const month = new Date(`${dbName} 1, ${year}`).getMonth();
        // console.log("month: ", month);

        const dbRes = await notion.databases.query({
          database_id: dbId,
        });

        if (!dbRes) {
          throw new Error("Error fetching database");
        }

        // begin populating actual database
        const notionDB = dbRes.results as PageObjectResponse[];

        // for each row/month of the Notion database
        for (const entry of notionDB) {
          // get the day and date of the row
          const date: HabitLogDate = {
            year,
            month,
          };

          // console.log("entry: ", entry);

          const title = entry.properties["Day"]
            ? entry.properties["Day"]
            : entry.properties["day"];
          // console.log("title: ", title);

          if (title?.type === "title") {
            const day = title.title[0]?.plain_text;
            // console.log("day: ", day);
            // console.log("passed day: ", parseInt(day ? day : "0"));

            date.day = parseInt(day ? day : "0");
          }

          // for each property/habit in the row
          for (const property in entry.properties) {
            // console.log("property: ", property);
            const value = entry.properties[property];
            const sanitizedName = property.replace(/\s/g, "").toLowerCase();

            if (value?.type !== "checkbox") continue;

            if (!habitsAdded.has(sanitizedName)) {
              // console.log("current set: ", habitsAdded);
              // console.log("new habit found: ", sanitizedName);

              const habitData = {
                name: property,
                userId: ctx.session.user.id,
                emoji: "📓",
                frequency: 1,
              };

              const habit = await ctx.prisma.habit.create({
                data: habitData,
              });
              // console.log("habit created: ", habit);

              habitsAdded.set(sanitizedName, habit.id);
              // console.log("habitsAdded: ", habitsAdded);
            }

            // after creating the habit or if habit exists, create the habit log for that day
            const logDate = new Date(date.year, date.month, date.day);
            // console.log("logDate: ", logDate);
            // console.log(
            //   "date year: ",
            //   date.year,
            //   "  date month: ",
            //   date.month,
            //   "  date day: ",
            //   date.day
            // );

            const habitLogData = {
              habitId: habitsAdded.get(sanitizedName) as string,
              date: logDate,
              completed: value.checkbox,
              weekKey: getWeekKey(logDate),
            };

            // console.log("habitLogData: ", habitLogData);

            // console.log("log created: ", log);
            logged.push(habitLogData);
            console.log(
              "Inserting log for: ",
              habitLogData.habitId,
              " on ",
              habitLogData.date,
              " with weekKey: ",
              habitLogData.weekKey
            );
          }
        }
      }
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

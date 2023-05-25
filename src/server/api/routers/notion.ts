import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env.mjs";
import type { NotionAuthRes } from "~/types";

import { Client } from "@notionhq/client";
import type {
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

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
      properties: Object.keys(db.properties).length,
      edited: new Date(db.last_edited_time),
    }));
  }),

  getDBRows: protectedProcedure
    .input(z.object({ dbIds: z.array(z.string()) }))
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

      const notion = new Client({ auth: accessToken });

      const dbRows = await Promise.all(
        dbIds.map(async (dbId) => {
          const dbRes = await notion.databases.query({
            database_id: dbId,
          });

          if (!dbRes) {
            throw new Error("Error fetching database");
          }

          return { dbId, data: dbRes.results };
        })
      );
      console.log("dbRows: ", dbRows);

      return dbRows;
    }),

  populateDB: protectedProcedure
    .input(z.object({ dbIds: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      const { dbIds } = input;
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

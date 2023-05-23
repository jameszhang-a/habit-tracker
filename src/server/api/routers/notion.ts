import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env.mjs";
import type { NotionAuthRes } from "~/types";

import { Client } from "@notionhq/client";
import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

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

    const res = await notion.search({
      filter: {
        value: "database",
        property: "object",
      },
      sort: {
        direction: "descending",
        timestamp: "last_edited_time",
      },
    });

    const allDB = res.results;

    return allDB as DatabaseObjectResponse[];
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
});

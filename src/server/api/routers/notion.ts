import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env.mjs";

interface User {
  object: string;
  id: string;
  name: string;
  avatar_url: string;
  type: string;
  person: object;
}

interface TokenData {
  access_token: string;
  token_type: string;
  bot_id: string;
  workspace_name: string;
  workspace_icon: string;
  workspace_id: string;
  owner: {
    type: string;
    user: User;
  };
  duplicated_template_id: string | null;
}

export const notionRouter = createTRPCRouter({
  notionAuth: protectedProcedure
    .input(z.object({ tempCode: z.string() }))
    .query(async ({ input }) => {
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

      const responseData = (await response.json()) as TokenData;
      console.log("responseData", responseData);

      if (!response.ok) {
        throw new Error("Error fetching token");
      }

      return responseData;
    }),
});

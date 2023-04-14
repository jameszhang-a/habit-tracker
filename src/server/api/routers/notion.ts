import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notionRouter = createTRPCRouter({
  /**
   * For a given habit, return the number of times it has been completed
   * @param hid - User ID
   */
  getDB: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const { code } = input;

      const res = await fetch("https://api.notion.com/v1/oauth/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Notion-Version": "2021-05-13",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code: code,
          redirect_uri:
            "https://www.notion.so/Notion-Auth-Redirect-Page-9f1e1e1e1e1e4e1e1e1e1e1e1e1e1e1e",
          client_id: "e0b9c9f0-1b1f-4b1f-9c9f-0e1b1f4b1f9c",
        }),
      });

      return "hi";
    }),
});

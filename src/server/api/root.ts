import { createTRPCRouter } from "./trpc";
import { habitRouter } from "./routers/habit";
import { statsRouter } from "./routers/stats";
import { notionRouter } from "./routers/notion";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  habit: habitRouter,
  stats: statsRouter,
  notion: notionRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

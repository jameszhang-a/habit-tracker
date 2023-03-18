import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const statsRouter = createTRPCRouter({
  /**
   * Returns all habits for the current user
   */
  getHabits: publicProcedure
    .input(z.object({ uid: z.string().optional() }))
    .query(({ ctx, input }) => {
      const habits = ctx.prisma.habit.findMany({
        where: { userId: input.uid },
      });

      return habits;
    }),

  /**
   * For a given habit, return the number of times it has been completed
   * @param hid - User ID
   */
  getHabitCompletionCount: protectedProcedure
    .input(z.object({ hid: z.string() }))
    .query(({ ctx, input }) => {
      const habitCompletionCount = ctx.prisma.habitLog.count({
        where: { habitId: input.hid, completed: true },
      });

      return habitCompletionCount;
    }),
});

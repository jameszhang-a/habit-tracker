import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { weekFromDate } from "~/utils";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const statsRouter = createTRPCRouter({
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

  /**
   * For a given habit, return the ratio of weeks were the habit was completed its frequency number of times over the total number of weeks since the habit has been created
   * @param hid - Habit ID
   * @param frequency - Number of times the habit should be completed per week
   */
  getCompletionRate: publicProcedure
    .input(z.object({ hid: z.string(), frequency: z.number() }))
    .query(async ({ ctx, input }) => {
      const { hid, frequency } = input;

      const habit = await ctx.prisma.habit.findUnique({
        where: { id: hid },
      });

      if (!habit) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Habit not found" });
      }

      const earliestLog = await ctx.prisma.habitLog.findFirst({
        where: { habitId: hid },
        orderBy: { date: "asc" },
        select: { date: true },
      });

      if (!earliestLog) {
        return 0;
      }

      const startWeek = weekFromDate(earliestLog.date);
      const currentWeek = weekFromDate(new Date());
      const totalWeeks = currentWeek - startWeek + 1;
      console.log("startWeek", startWeek);
      console.log("currentWeek", currentWeek);
      console.log("totalWeeks", totalWeeks);

      const logs = await ctx.prisma.habitLog.groupBy({
        by: ["weekKey"],
        where: { habitId: hid, completed: true },
        _count: {
          completed: true,
        },
      });

      let count = 0;

      for (const week of logs) {
        if (week._count.completed >= frequency) {
          count++;
        }
      }

      return count / totalWeeks;
    }),

  getGoalsMetCount: publicProcedure
    .input(z.object({ hid: z.string(), frequency: z.number() }))
    .query(async ({ ctx, input }) => {
      const { hid, frequency } = input;

      const logs = await ctx.prisma.habitLog.groupBy({
        by: ["weekKey"],
        where: { habitId: hid, completed: true },
        _count: {
          completed: true,
        },
      });

      let count = 0;

      console.log("logs", logs);

      for (const week of logs) {
        if (week._count.completed >= frequency) {
          count++;
        }
      }

      return count;
    }),
});

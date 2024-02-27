import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  convertWeekKeyToStartDate,
  getWeeks,
  totalWeeksBetween,
} from "@/utils";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { addMilliseconds, subDays, subMilliseconds } from "date-fns";
import { getTimezoneOffset, utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { getUserTime } from "./habit";

export const statsRouter = createTRPCRouter({
  /**
   * For a given habit, return the number of times it has been completed
   * @param hid - User ID
   */
  getHabitCompletionCount: publicProcedure
    .input(z.object({ hid: z.string() }))
    .query(({ ctx, input }) => {
      const habitCompletionCount = ctx.prisma.habitLog.count({
        where: { habitId: input.hid, completed: true },
      });

      return habitCompletionCount;
    }),

  getGoalsStats: publicProcedure
    .input(z.object({ hid: z.string(), frequency: z.number() }))
    .query(async ({ ctx, input }) => {
      const { hid, frequency } = input;

      const habit = await ctx.prisma.habit.findUnique({
        where: { id: hid },
      });

      if (!habit) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Habit not found" });
      }

      const inversedGoal = habit.inversedGoal;

      // get the earliest completed date
      const earliestLog = await ctx.prisma.habitLog.findFirst({
        where: { habitId: hid, completed: true },
        orderBy: { date: "asc" },
        select: { date: true },
      });

      const startDate = !!earliestLog ? earliestLog.date : habit.createdAt;
      const currDate = new Date();
      const totalWeeks = totalWeeksBetween(startDate, currDate) + 1;
      const allWeeks = getWeeks(startDate, currDate);

      const logs = await ctx.prisma.habitLog.groupBy({
        by: ["weekKey"],
        where: { habitId: hid, completed: true },
        _count: {
          completed: true,
        },
      });

      let count = 0;

      for (const weekKey of allWeeks) {
        const log = logs.find((log) => log.weekKey === weekKey);
        if (inversedGoal) {
          if (!log || (log && log._count.completed <= frequency)) {
            count++;
          }
        } else if (log && log._count.completed >= frequency) {
          count++;
        }
      }

      return {
        completionRate: count / totalWeeks,
        goalsMet: count,
        totalWeeks,
      };
    }),

  getCurrentStreak: publicProcedure
    .input(z.object({ hid: z.string() }))
    .query(async ({ ctx, input }) => {
      const { hid } = input;

      const logs = await ctx.prisma.habitLog.findMany({
        where: { habitId: hid },
        orderBy: { date: "desc" },
      });

      let count = 0;
      let lastDate = new Date();
      lastDate.setHours(0, 0, 0, 0); // Set the current date to midnight.

      for (const log of logs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);

        const diffInDays = Math.floor(
          (lastDate.getTime() - logDate.getTime()) / 86400000
        );

        // Stop if we encounter a day where the habit was not completed and it's not today.
        if (!log.completed && diffInDays !== 0) {
          break;
        }

        // Stop if the difference between two dates is more than 1 day (ignoring today).
        if (diffInDays > 1) {
          break;
        }

        // Only increment the count if the habit was completed, or if the habit was not completed today while the streak continued up until yesterday.
        if (
          log.completed ||
          (diffInDays === 0 && !log.completed && count > 0)
        ) {
          count++;
        }

        lastDate = logDate;
      }

      return {
        onStreak: count > 0,
        streak: count,
        msg: count > 4 ? "You're on a roll!" : "You can do it!",
      };
    }),

  getWeeklyCompletion: publicProcedure
    .input(z.object({ hid: z.string().array() }))
    .query(async ({ ctx, input }) => {
      const { hid } = input;
      const getLocalTime = await getUserTime(hid[0] ?? "");

      const res: { [key: string]: number[] } = {};

      for (const h of hid) {
        const logs = await ctx.prisma.habitLog.findMany({
          where: { habitId: h, completed: true },
          orderBy: { date: "desc" },
          select: { date: true },
        });

        if (!logs) continue;

        const data = Array<number>(7).fill(0);

        for (const log of logs) {
          // Get the day of the week (0-6) where 0 is monday and 6 is sunday.
          const day = (getLocalTime(log.date).getDay() + 6) % 7;

          data[day]++;
        }

        res[h] = data;
      }

      return res;
    }),

  /**
   * Get the number of times a habit was completed for the last 6 weeks.
   * return an array of objects where with the format { weekKey: string, count: number, startDate: Date}}
   */
  getWeeklyCount: publicProcedure
    .input(z.object({ hid: z.string() }))
    .query(async ({ ctx, input }) => {
      const { hid } = input;
      const user = await ctx.prisma.habit.findFirst({
        where: { id: hid },
        select: { user: true },
      });

      const timezone = "America/Los_Angeles";

      const currDate = new Date();

      const toUTC = zonedTimeToUtc(currDate, timezone);
      const toLoc = utcToZonedTime(currDate, timezone);
      const diff = getTimezoneOffset(timezone);
      const newDate = addMilliseconds(currDate, diff);

      console.log({
        currDate,
        toLoc,
        toUTC,
        diff,
        newDate,
      });

      const startDate = subDays(currDate, 42);
      const allWeeks = getWeeks(startDate, currDate);

      console.log("allWeeks", allWeeks);

      const logs = await ctx.prisma.habitLog.groupBy({
        by: ["weekKey"],
        where: { habitId: hid, completed: true, weekKey: { in: allWeeks } },
        _count: {
          completed: true,
        },
      });

      return allWeeks.map((week) => {
        const log = logs.find((log) => log.weekKey === week);
        console.log({
          weekKey: week,
          count: log ? log._count.completed : 0,
          startDate: convertWeekKeyToStartDate(week),
        });
        return {
          weekKey: week,
          count: log ? log._count.completed : 0,
          startDate: convertWeekKeyToStartDate(week),
        };
      });
    }),
});

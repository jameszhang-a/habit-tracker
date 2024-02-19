import { z } from "zod";
import { getWeekKey, getDateInterval } from "@/utils";

import {
  createInnerTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { getTimezoneOffset, utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { endOfDay, startOfDay } from "date-fns";

export async function getUserTimezoneOffsetFromHid(
  hid: string
): Promise<number> {
  const ctx = createInnerTRPCContext({ session: null });

  const res = await ctx.prisma.habit.findFirst({
    where: { id: hid },
    select: { user: true },
  });

  const timezone = !res ? "America/New_York" : res.user.timezone;

  return getTimezoneOffset(timezone);
}

type LoggedOnDateInput = {
  hid: string;
  date?: Date;
  startTime?: Date;
  endTime?: Date;
};

type LoggedOnDateRes = Promise<
  | {
      logExist: true;
      logged: boolean;
      logId: string;
    }
  | {
      logExist: false;
    }
  | null
>;

async function loggedOnDate({
  hid,
  date,
  startTime,
  endTime,
}: LoggedOnDateInput): LoggedOnDateRes {
  const ctx = createInnerTRPCContext({ session: null });

  if (startTime && endTime) {
    console.log("checking start and time: ", { startTime, endTime });
    const log = await ctx.prisma.habitLog.findFirst({
      where: {
        habitId: hid,
        date: {
          gte: startTime,
          lte: endTime,
        },
      },
    });

    return log
      ? { logged: log.completed, logId: log.id, logExist: true }
      : { logExist: false };
  }

  if (!date) {
    console.log("no date provided");
    return null;
  }

  const user = await ctx.prisma.habit.findFirst({
    where: { id: hid },
    select: { user: true },
  });

  const timezone = !user ? "America/New_York" : user.user.timezone;

  // Convert the UTC date to the user's local time zone
  const localDate = utcToZonedTime(date, timezone);

  // Determine the start and end of the day in the user's local time zone
  const startOfLocalDay = startOfDay(localDate);
  const endOfLocalDay = endOfDay(localDate);

  // Convert these times back to UTC
  const utcStart = zonedTimeToUtc(startOfLocalDay, timezone);
  const utcEnd = zonedTimeToUtc(endOfLocalDay, timezone);

  const log = await ctx.prisma.habitLog.findFirst({
    where: {
      habitId: hid,
      date: {
        gte: utcStart,
        lte: utcEnd,
      },
    },
  });

  return log
    ? { logged: log.completed, logId: log.id, logExist: true }
    : { logExist: false };
}

export const habitRouter = createTRPCRouter({
  /**
   * Returns all habits for the current user
   */
  getHabits: publicProcedure
    .input(z.object({ uid: z.string().optional() }))
    .query(({ ctx, input }) => {
      const habits = ctx.prisma.habit.findMany({
        where: { userId: input.uid, archived: false },
        select: {
          id: true,
          name: true,
          emoji: true,
          frequency: true,
          archived: true,
          order: true,
          inversedGoal: true,
          userId: true,
        },
        orderBy: { order: "asc" },
      });

      return habits;
    }),

  /**
   * Returns all archived habits for the current user
   */
  getArchivedHabits: publicProcedure
    .input(z.object({ uid: z.string().optional() }))
    .query(({ ctx, input }) => {
      const habits = ctx.prisma.habit.findMany({
        where: { userId: input.uid, archived: true },
        select: {
          id: true,
          name: true,
          emoji: true,
          frequency: true,
          archived: true,
          order: true,
          inversedGoal: true,
          userId: true,
        },
        orderBy: { updatedAt: "asc" },
      });

      return habits;
    }),

  /**
   * Creates a new habit for the current user, updating an existing habit if the habitId is provided
   */
  createEditHabit: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        emoji: z.string().regex(/\p{Emoji}/gu),
        frequency: z.number().min(1).max(7),
        inversedGoal: z.boolean(),
        habitId: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const habit = ctx.prisma.habit.upsert({
        where: { id: input.habitId },
        update: {
          name: input.name,
          emoji: input.emoji,
          frequency: input.frequency,
          inversedGoal: input.inversedGoal,
        },
        create: {
          userId: ctx.session.user.id,
          name: input.name,
          emoji: input.emoji,
          frequency: input.frequency,
          inversedGoal: input.inversedGoal,
        },
      });

      return habit;
    }),

  /**
   * Deletes a habit for the current user
   */
  deleteHabit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      const habit = ctx.prisma.habit.delete({
        where: { id: input.id },
      });

      return habit;
    }),

  loggedOnDate: publicProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.date(),
        startTime: z.date(),
        endTime: z.date(),
      })
    )
    .query(async ({ input }) => {
      const { id, startTime, endTime } = input;
      const res = await loggedOnDate({ hid: id, startTime, endTime });

      return res?.logExist ? res.logged : false;
    }),

  /**
   * Marks the current day as completed for the habit
   *
   * if the habit has already been logged today, it will be marked as not completed.
   * if the habit has not been logged today, it will be marked as completed.
   * if the habit doesn't exist, it will be created and marked as completed.
   */
  logHabitV3: publicProcedure
    .input(z.object({ hid: z.string().min(1), date: z.date() }))
    .mutation(async ({ ctx, input }) => {
      const { hid, date } = input;
      const res = await loggedOnDate({ hid, date });

      if (res?.logExist) {
        return ctx.prisma.habitLog.update({
          where: { id: res.logId },
          data: { completed: !res.logged },
        });
      } else {
        return ctx.prisma.habitLog.create({
          data: {
            habitId: hid,
            date,
            completed: true,
            weekKey: getWeekKey(date),
          },
        });
      }
    }),

  timeNow: publicProcedure.input(z.number()).query(({ input: offset }) => {
    const timeDiff = offset * 24 * 60 * 60 * 1000;
    const now = new Date();

    const newDate = new Date(Date.now() + timeDiff);

    const { dayStart, dayEnd, newDayEnd, newDayStart } =
      getDateInterval(newDate);

    return {
      now,
      newDate,
      dayStart,
      dayEnd,
      newDayStart,
      newDayEnd,
    };
  }),

  reorderHabits: protectedProcedure
    .input(
      z.object({
        habits: z.array(
          z.object({
            id: z.string(),
            userId: z.string(),
            name: z.string(),
            emoji: z.string(),
            frequency: z.number(),
            order: z.number(),
            archived: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // order of habits is determined from the order of the array sent from the frontend
      const { habits } = input;

      const res = await Promise.all(
        habits.map(async (habit, index) => {
          return await ctx.prisma.habit.update({
            where: { id: habit.id },
            data: { order: index },
          });
        })
      );

      return res;
    }),

  toggleArchiveHabit: protectedProcedure
    .input(z.object({ hid: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const habit = await ctx.prisma.habit.findUnique({
        where: { id: input.hid },
      });

      if (!habit) {
        throw new Error("Habit not found");
      }

      return await ctx.prisma.habit.update({
        where: { id: input.hid },
        data: { archived: !habit.archived },
      });
    }),

  /**
   * Nukes all habit logs for the current user
   */
  loggedDataNuke: protectedProcedure.mutation(({ ctx }) => {
    const habitLogs = ctx.prisma.habitLog.deleteMany({
      where: { createdAt: { gte: new Date("2023-05-25") } },
    });

    return habitLogs;
  }),

  habitNuke: protectedProcedure.mutation(({ ctx }) => {
    const habits = ctx.prisma.habit.deleteMany({});

    return habits;
  }),
});

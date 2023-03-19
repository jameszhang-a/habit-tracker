import { z } from "zod";
import { getWeekKey } from "~/utils";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const getDateInterval = (currDate?: Date) => {
  const now = currDate ? new Date(currDate) : new Date();

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(now);
  dayEnd.setHours(0, 0, 0, 0);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return { dayStart, dayEnd };
};

export const habitRouter = createTRPCRouter({
  /**
   * Returns all habits for the current user
   */
  getHabits: publicProcedure
    .input(z.object({ uid: z.string().optional() }))
    .query(({ ctx, input }) => {
      const habits = ctx.prisma.habit.findMany({
        where: { userId: input.uid },
        orderBy: { order: "asc" },
      });

      return habits;
    }),

  /**
   * Creates a new habit for the current user
   */
  createHabit: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        emoji: z.string().regex(/\p{Emoji}/gu),
        frequency: z.number().min(1).max(7),
      })
    )
    .mutation(({ ctx, input }) => {
      const habit = ctx.prisma.habit.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
          emoji: input.emoji,
          frequency: input.frequency,
        },
      });

      return habit;
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
        },
        create: {
          name: input.name,
          userId: ctx.session.user.id,
          emoji: input.emoji,
          frequency: input.frequency,
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

  /**
   * Marks the current day as completed for the habit
   *
   * if the habit has already been logged today, it will be marked as not completed.
   * if the habit has not been logged today, it will be marked as completed.
   * if the habit doesn't exist, it will be created and marked as completed.
   */
  logHabit: publicProcedure
    .input(z.object({ id: z.string().min(1), date: z.date() }))
    .mutation(async ({ ctx, input }) => {
      // check to see if the habit has already been logged for the date provided
      // to do this, we need to check that the date of the log is less than the beginning 00:00 of the next day and greater than the beginning of the last dat 00:00
      // this is because the date is stored as a timestamp in the database
      const { dayStart, dayEnd } = getDateInterval(input.date);

      const habitLog = await ctx.prisma.habitLog.findFirst({
        where: {
          habitId: input.id,
          date: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });

      if (!habitLog) {
        return ctx.prisma.habitLog.create({
          data: {
            habitId: input.id,
            date: input.date,
            completed: true,
            weekKey: getWeekKey(input.date),
          },
        });
      } else {
        // set the habit to completed if it's not already
        return ctx.prisma.habitLog.update({
          where: { id: habitLog.id },
          data: { completed: !habitLog.completed },
        });
      }
    }),

  /**
   * Returns the habit log for the current day if it's completed
   */
  loggedToday: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { dayStart, dayEnd } = getDateInterval();

      const habitLogs = ctx.prisma.habitLog.findFirst({
        where: {
          habitId: input.id,
          date: {
            gte: dayStart,
            lt: dayEnd,
          },
          completed: true,
        },
      });

      return habitLogs;
    }),

  loggedOnDate: publicProcedure
    .input(z.object({ id: z.string(), date: z.date() }))
    .query(({ ctx, input }) => {
      const { dayStart, dayEnd } = getDateInterval(input.date);

      const habitLogs = ctx.prisma.habitLog.findFirst({
        where: {
          habitId: input.id,
          date: {
            gte: dayStart,
            lt: dayEnd,
          },
          completed: true,
        },
      });

      return habitLogs;
    }),

  /**
   * Nukes all habit logs for the current user
   */
  loggedDataNuke: protectedProcedure.mutation(({ ctx }) => {
    const habitLogs = ctx.prisma.habitLog.deleteMany({});

    return habitLogs;
  }),

  habitNuke: protectedProcedure.mutation(({ ctx }) => {
    const habits = ctx.prisma.habit.deleteMany({});

    return habits;
  }),
});

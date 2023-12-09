import { z } from "zod";
import { getWeekKey, getDateInterval } from "@/utils";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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

      console.log(
        "mutating habit log",
        "start Date:",
        dayStart,
        "endDate:",
        dayEnd
      );
      console.log("habitlog:", habitLog);

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

  loggedOnDate: publicProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.date(),
        startTime: z.date(),
        endTime: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id, startTime, endTime } = input;

      const habitLogs = await ctx.prisma.habitLog.findFirst({
        where: {
          habitId: id,
          date: {
            gte: startTime,
            lte: endTime,
          },
          completed: true,
        },
      });

      if (id === "clfgo0daa0001l908fjyu0g39") {
        console.log("startTime", startTime);
        console.log("endTime", endTime);
        console.log("habitLogs", habitLogs);
      }

      return habitLogs;
    }),

  /**
   * Marks the current day as completed for the habit
   *
   * if the habit has already been logged today, it will be marked as not completed.
   * if the habit has not been logged today, it will be marked as completed.
   * if the habit doesn't exist, it will be created and marked as completed.
   */
  logHabitV2: publicProcedure
    .input(z.object({ id: z.string().min(1), offset: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const timeDiff = input.offset * 24 * 60 * 60 * 1000;
      const date = new Date(Date.now() + timeDiff);

      const { dayStart, dayEnd } = getDateInterval(date);

      const habitLog = await ctx.prisma.habitLog.findFirst({
        where: {
          habitId: input.id,
          date: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });

      console.log(
        "mutating habit log",
        "start Date:",
        dayStart,
        "endDate:",
        dayEnd
      );
      console.log("habitlog:", habitLog);

      if (!habitLog) {
        return ctx.prisma.habitLog.create({
          data: {
            habitId: input.id,
            date,
            completed: true,
            weekKey: getWeekKey(date),
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

  loggedOnDateV2: publicProcedure
    .input(
      z.object({
        id: z.string(),
        offset: z.number(),
      })
    )
    .query(({ ctx, input }) => {
      const { id, offset } = input;

      const timeDiff = offset * 24 * 60 * 60 * 1000;

      const date = new Date(Date.now() + timeDiff);

      const { dayStart, dayEnd } = getDateInterval(date);

      const habitLogs = ctx.prisma.habitLog.findFirst({
        where: {
          habitId: id,
          date: {
            gte: dayStart,
            lt: dayEnd,
          },
          completed: true,
        },
      });

      return habitLogs;
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

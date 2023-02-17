import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

// helper function to turn ISO date string into a date in the form of "2021-01-01"
const formatDate = (date: string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateInterval = () => {
  const now = new Date();

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(now);
  dayEnd.setHours(0, 0, 0, 0);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return { dayStart, dayEnd };
};

export const habitRouter = createTRPCRouter({
  getHabits: protectedProcedure.query(({ ctx }) => {
    const habits = ctx.prisma.habit.findMany({
      where: { userId: ctx.session.user.id },
    });

    return habits;
  }),

  createHabit: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ ctx, input }) => {
      const habit = ctx.prisma.habit.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
        },
      });

      return habit;
    }),

  deleteHabit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      const habit = ctx.prisma.habit.delete({
        where: { id: input.id },
      });

      return habit;
    }),

  logHabit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // check to see if the habit has already been logged today
      // to do this, we need to check that the date of the log is less than the beginning 00:00 of the next day and greater than the beginning of the last dat 00:00
      // this is because the date is stored as a timestamp in the database
      const { dayStart, dayEnd } = getDateInterval();

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
        console.log("No log today, creating new log");

        return ctx.prisma.habitLog.create({
          data: {
            habitId: input.id,
            date: new Date(),
            completed: true,
          },
        });
      } else if (!habitLog.completed) {
        // set the habit to completed
        console.log("have not completed, setting to completed");

        return ctx.prisma.habitLog.update({
          where: { id: habitLog.id },
          data: { completed: true },
        });
      } else {
        // set the habit to not completed
        console.log("have completed, setting to not completed");

        return ctx.prisma.habitLog.update({
          where: { id: habitLog.id },
          data: { completed: false },
        });
      }
    }),

  loggedToday: protectedProcedure
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
});

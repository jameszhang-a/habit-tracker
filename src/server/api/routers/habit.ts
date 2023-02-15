import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const habitRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getHabits: protectedProcedure.query(({ ctx }) => {
    const habits = ctx.prisma.habit.findMany({
      where: { userId: ctx.session.user.id },
    });

    console.log(habits);

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
});

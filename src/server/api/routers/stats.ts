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
});

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  /**
   * Returns the configuration for the current user
   */
  getConfiguration: publicProcedure
    .input(z.object({ uid: z.string() }))
    .query(({ ctx, input }) => {
      const configuration = ctx.prisma.user.findUnique({
        where: { id: input.uid },
        select: {
          id: true,
          name: true,
          theme: true,
          lightTheme: true,
        },
      });

      return configuration;
    }),
});

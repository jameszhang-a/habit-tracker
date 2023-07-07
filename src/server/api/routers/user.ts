import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  /**
   * Returns the configuration for the current user
   */
  getConfiguration: protectedProcedure.query(({ ctx }) => {
    const configuration = ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
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

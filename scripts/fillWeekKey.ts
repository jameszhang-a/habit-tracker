import { prisma } from "../src/server/utils/prisma";
import { weekFromDate } from "../src/utils";

const calculateWeekKey = async () => {
  const logs = await prisma.habitLog.findMany({
    select: {
      id: true,
      date: true,
    },
  });

  for (const log of logs) {
    const logWeek = weekFromDate(log.date);
    const logYear = log.date.getFullYear();

    await prisma.habitLog.update({
      where: {
        id: log.id,
      },
      data: {
        weekKey: `${logYear}-${logWeek}`,
      },
    });
  }
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
calculateWeekKey();

import { prisma } from "../src/server/utils/prisma";
import { getWeekKey } from "../src/utils";

const calculateWeekKey = async () => {
  const logs = await prisma.habitLog.findMany({
    select: {
      id: true,
      date: true,
    },
  });

  for (const log of logs) {
    const weekKey = getWeekKey(log.date);

    await prisma.habitLog.update({
      where: {
        id: log.id,
      },
      data: {
        weekKey,
      },
    });
  }
};

await calculateWeekKey();

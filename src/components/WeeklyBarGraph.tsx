import { useMemo } from "react";
import type { Habits } from "~/types";
import { weekDay } from "~/utils";
import { api } from "~/utils/api";

interface WeeklyBarGraphProps {
  habits: Habits;
}

const statsAPI = api.stats;

const maxWidth = 500;
const maxWidthPerHabit = 250;

const WeeklyBarGraph: React.FC<WeeklyBarGraphProps> = ({ habits }) => {
  const { data: weeklyCompletion } = statsAPI.getWeeklyCompletion.useQuery({
    hid: habits.map((habit) => habit.id),
  });

  const habitNames = habits.map((habit) => habit.name);

  const totalStats = useMemo(() => {
    if (!weeklyCompletion) return Array<number>(7).fill(0);

    return Object.values(weeklyCompletion).reduce((acc, val) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return acc.map((cnt, i) => cnt + val[i]!);
    }, Array<number>(7).fill(0));
  }, [weeklyCompletion]);

  const maxCnt = Math.max(...totalStats);

  const scale = useMemo(() => maxWidth / maxCnt, [maxCnt]);
  const scalePerHabit = useMemo(() => maxWidthPerHabit / maxCnt, [maxCnt]);

  return (
    <div>
      <div>Daily activity:</div>
      <ul>
        {totalStats.map((cnt, day) => (
          <li key={day}>
            <span className="mr-2 capitalize">{weekDay(day, "short")}:</span>
            <span
              className="bg-red-100"
              style={{
                width: `${cnt * scale}px`,

                display: "inline-block",
              }}
            >
              {cnt}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-6 overflow-scroll">
        {weeklyCompletion &&
          Object.entries(weeklyCompletion).map((habit, i) => {
            return (
              <div key={i} className="mb-4 min-w-[150px]">
                {habitNames[i]}
                <ul>
                  {habit[1].map((cnt, day) => (
                    <li key={day}>
                      <span className="mr-2 capitalize">
                        {weekDay(day, "short")}:
                      </span>
                      <span
                        className="bg-red-100"
                        style={{
                          width: `${cnt * scalePerHabit}px`,

                          display: "inline-block",
                        }}
                      >
                        {cnt}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default WeeklyBarGraph;

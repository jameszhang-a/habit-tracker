import ReactECharts from "echarts-for-react";

import useChartOptions from "@/hooks/useChartOptions";
import { api } from "@/utils/api";

import type { Habits } from "@/types";

const statsAPI = api.stats;

type Props = {
  habits: Habits;
};

const CompletionChart = ({ habits }: Props) => {
  const { data: weeklyCompletionData } = statsAPI.getWeeklyCompletion.useQuery({
    hid: habits.map((habit) => habit.id),
  });

  const habitNames = habits.map((habit) => habit.name);

  const data =
    weeklyCompletionData &&
    Object.keys(weeklyCompletionData)
      .map((key) => weeklyCompletionData[key])
      .filter((value): value is number[] => value !== undefined);

  const option = useChartOptions({
    type: "weeklyCompletion",
    habits: habitNames,
    data,
  });

  return <ReactECharts option={option} />;
};

export default CompletionChart;

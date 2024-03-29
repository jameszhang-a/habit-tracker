import { useMemo } from "react";
import { scramble } from "@/utils";

type ChartOptionsType = {
  type: "weeklyCompletion";
  habits: string[];
  data?: number[][];
};

export const useChartOptions = ({ type, habits, data }: ChartOptionsType) => {
  const WeeklyCompletionOptions = useMemo(() => {
    const series = habits.map((habit, i) => ({
      name: habit,
      type: "line",
      stack: "Total",
      smooth: true,
      lineStyle: {
        width: 0,
      },
      showSymbol: false,
      areaStyle: {
        opacity: 0.8,
      },
      emphasis: {
        focus: "series",
      },
      data: data?.[i],
    }));

    const options = {
      color: scramble([
        "#f6dbb2",
        "#b1e7d9",
        "#f0b1b1",
        "#bfdff6",
        "#dbbbd3",
        "#a4bde8",
      ]),
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
      },
      legend: {
        data: habits,
      },
      // toolbox: {
      //   feature: {
      //     saveAsImage: {},
      //   },
      // },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
      ],
      yAxis: [{ type: "value" }],
      series: series,
    };

    return options;
  }, [habits, data]);

  switch (type) {
    case "weeklyCompletion":
      return WeeklyCompletionOptions;

    default:
      break;
  }
};

export default useChartOptions;

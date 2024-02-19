import { format } from "date-fns";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
} from "recharts";

type ChartProps = {
  data?: {
    weekKey: string;
    count: number;
    startDate: Date;
  }[];
};

function weeklyCompletionChart({ data }: ChartProps) {
  if (!data) return null;

  const maxCount = Math.max(...data.map((week) => week.count));
  console.log("maxHeight", maxCount);
  return (
    <ResponsiveContainer width={500} height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: -30, bottom: 20 }} // Adjusted bottom margin
      >
        <XAxis
          dataKey="startDate"
          stroke="#000000"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          tickFormatter={(value: Date) => format(value, "MM/dd")}
        />
        <YAxis
          stroke="#000000"
          fontSize={12}
          allowDecimals={false}
          tickCount={maxCount}
          domain={[0, maxCount]}
        />
        <Tooltip content={<></>} cursor={false} />
        <Bar
          dataKey="count"
          fill="#FFFFFF"
          radius={[4, 4, 0, 0]}
          activeBar={{
            fill: "gray",
          }}
          background={{ fill: "transparent" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default weeklyCompletionChart;

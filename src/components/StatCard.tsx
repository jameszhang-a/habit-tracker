import { api } from "~/utils/api";

interface StatCardProps {
  habitName: string;
  hid: string;
}

const statsAPI = api.stats;

const StatCard: React.FC<StatCardProps> = ({ habitName, hid }) => {
  const { getHabitCompletionCount } = statsAPI;
  const completedCount = getHabitCompletionCount.useQuery({ hid }).data;

  return (
    <div className="h-[100px] w-fit rounded-lg border bg-white p-5 shadow-lg">
      {habitName}
      <div>Completed: {completedCount}</div>
    </div>
  );
};

export default StatCard;

import type { Habit } from "~/types";
import { api } from "~/utils/api";

interface StatCardProps {
  habit: Habit;
}

const statsAPI = api.stats;

const StatCard: React.FC<StatCardProps> = ({ habit }) => {
  const { getHabitCompletionCount, getGoalsMetCount, getCompletionRate } =
    statsAPI;
  const completedCount = getHabitCompletionCount.useQuery({
    hid: habit.id,
  }).data;
  const goalsMetCount = getGoalsMetCount.useQuery({
    hid: habit.id,
    frequency: habit.frequency,
  }).data;

  const completionRate = getCompletionRate.useQuery({
    hid: habit.id,
    frequency: habit.frequency,
  }).data;

  return (
    <div className="w-fit rounded-lg border bg-white p-5 shadow-lg">
      <div className="mb-2 border-b-2 border-b-slate-300">
        <span className="font-bold">{habit.name}</span> - Goal:
        <span className="font-bold text-red-400"> {habit.frequency}</span>/wk
      </div>

      <div>Completed: {completedCount}</div>
      <div>Rate: {toPercentage(completionRate || 0)}</div>
      <div>Badges: {goalsMetCount}</div>
    </div>
  );
};

export default StatCard;

const toPercentage = (num: number) => {
  return `${(num * 100).toFixed(2)}%`;
};

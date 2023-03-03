import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Habit from "~/Components/Habit";
import HabitLoading from "~/Components/HabitLoading";
import Refresh from "~/Components/Refresh";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";

const habitAPI = api.habit;

type Habits = RouterOutputs["habit"]["getHabits"];

const Tracker: NextPage = () => {
  const [habits, setHabits] = useState<Habits>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [page, setPage] = useState(0);

  const router = useRouter();
  const uid = router.query.uid as string;

  const { data: habitsData, isLoading } = habitAPI.getHabits.useQuery({
    uid,
  });

  useEffect(() => {
    if (habitsData) {
      setHabits(habitsData);
    }
  }, [habitsData]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-pink-300 to-blue-900">
      {/* actual component */}
      <div className="relative flex flex-col border border-gray-200 px-4 py-4 shadow-xl backdrop-blur sm:h-[300px] sm:w-[540px] sm:rounded-3xl">
        <ul className="flex flex-row gap-3">
          {isLoading
            ? Array.from({ length: 3 }, (_, i) => <HabitLoading key={i} />)
            : habits
                .slice(page * 3, page * 3 + 3)
                .map((habit) => (
                  <Habit key={habit.id} habit={habit} date={date} />
                ))}
        </ul>

        <Refresh />
      </div>
    </div>
  );
};

export default Tracker;

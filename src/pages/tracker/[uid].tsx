import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Habit from "~/Components/Habit";
import Refresh from "~/Components/Refresh";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";

const habitAPI = api.habit;

type Habits = RouterOutputs["habit"]["getHabits"];

const Tracker: NextPage = () => {
  const [habits, setHabits] = useState<Habits>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [reload, setReload] = useState<boolean>(false);

  console.log("reload", reload);

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
      <div className="flex flex-col border border-gray-200  px-4 py-10 shadow-xl backdrop-blur sm:rounded-3xl sm:p-20">
        <div>Tracker page</div>
        <div>User id: {uid}</div>

        <div>list of habits</div>
        {isLoading ? (
          <div>loading...</div>
        ) : (
          habits?.map((habit) => (
            <Habit key={habit.id} habit={habit} date={date} />
          ))
        )}

        <Refresh trigger={setReload} />
      </div>
    </div>
  );
};

export default Tracker;

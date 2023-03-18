import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import HeadWrapper from "~/components/HeadWrapper";
import StatCard from "~/components/StatCard";
import type { Habits } from "~/types";
import { api } from "~/utils/api";

const habitAPI = api.habit;

const Stats: NextPage = () => {
  const [habits, setHabits] = useState<Habits>([]);

  const router = useRouter();
  const uid = router.query.uid as string;

  const { data: habitsData } = habitAPI.getHabits.useQuery({
    uid,
  });

  useEffect(() => {
    if (habitsData) {
      setHabits(habitsData);
    }
  }, [habitsData]);

  return (
    <HeadWrapper
      title="Habit Completion Stats Widget"
      description="Check your habit completion stats, and embed into your Notion dashboard!"
    >
      <div className="h-screen w-screen">
        <div>Stats page</div>
        <div>User id: {uid}</div>
        <div className="container mx-auto h-[700px] rounded-xl border bg-violet-300">
          <div className="flex flex-col items-center justify-around gap-4 p-4">
            {habits.map((habit) => (
              <StatCard key={habit.id} hid={habit.id} habitName={habit.name} />
            ))}
          </div>
        </div>
      </div>
    </HeadWrapper>
  );
};

export default Stats;

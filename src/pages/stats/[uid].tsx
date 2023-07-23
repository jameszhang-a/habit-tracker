import { type NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import CompletionChart from "~/components/Charts/CompletionChart";
import HeadWrapper from "~/components/HeadWrapper";
import StatCard from "~/components/StatCard";
import { api } from "~/utils/api";

import type { Habits } from "~/types";

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
      <main className="mx-auto flex grow flex-col items-center gap-4 pt-4">
        <div>Stats page</div>
        <div>User id: {uid}</div>
        <div className="start-0 flex w-full"></div>
        <section
          className={`container relative mb-4 w-[90vw] flex-col items-center gap-4 rounded-xl border border-slate-300 bg-[#f4f5f6]/80 p-5 shadow`}
        >
          <h1 className="text-xl font-bold">Daily Completion</h1>
          <CompletionChart habits={habits} />
        </section>

        <div className="container mx-auto rounded-xl border bg-violet-300">
          <div className="flex h-[500px] flex-col items-center gap-4 overflow-scroll p-4">
            {habits.map((habit) => (
              <StatCard key={habit.id} habit={habit} />
            ))}
          </div>
        </div>
      </main>
    </HeadWrapper>
  );
};

export default Stats;

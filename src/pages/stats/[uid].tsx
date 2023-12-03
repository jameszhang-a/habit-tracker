import { type NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import CompletionChart from "@/components/Charts/CompletionChart";
import HeadWrapper from "@/components/HeadWrapper";
import StatCard from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { api } from "@/utils/api";

import type { Habits } from "@/types";
import { StatsContextProvider } from "@/context/StatsContext";

const habitAPI = api.habit;

const Stats: NextPage = () => {
  const [habits, setHabits] = useState<Habits>([]);
  const [selectedHabit, setSelectedHabit] = useState<string>("");

  const router = useRouter();
  const uid = router.query.uid as string;

  const { data: habitsData } = habitAPI.getHabits.useQuery({
    uid,
  });

  useEffect(() => {
    if (habitsData) {
      setHabits(habitsData);
      setSelectedHabit(habitsData[0]?.id ?? "");
    }
  }, [habitsData]);

  const tabs = useMemo(
    () =>
      habitsData &&
      habitsData.map((habit) => (
        <TabsTrigger key={habit.id} value={habit.id}>
          {habit.name}
        </TabsTrigger>
      )),
    [habitsData]
  );

  return (
    <HeadWrapper
      title="Habit Completion Stats Widget"
      description="Check your habit completion stats, and embed into your Notion dashboard!"
    >
      <StatsContextProvider
        value={{ setActiveHabit: setSelectedHabit, activeHabit: selectedHabit }}
      >
        <main className="mx-auto flex grow flex-col items-center gap-4 pt-4">
          <div>User id: {uid}</div>
          <div className="start-0 flex w-full"></div>

          <Tabs
            className="container flex flex-col items-center"
            value={selectedHabit}
            onValueChange={setSelectedHabit}
          >
            <TabsList className="mb-8">{tabs}</TabsList>

            <section
              className={`container relative mb-4 w-[90vw] flex-col items-center gap-4 rounded-xl border border-slate-300 bg-[#f4f5f6]/80 p-5 shadow`}
            >
              <h1 className="text-xl font-bold">Daily Completion</h1>
              <CompletionChart habits={habits} />
            </section>

            <div className="container mx-auto flex items-center justify-center rounded-xl border bg-violet-300 p-8">
              {habits.map((habit) => (
                <TabsContent key={habit.id} value={habit.id}>
                  <StatCard habit={habit} />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </main>
      </StatsContextProvider>
    </HeadWrapper>
  );
};

export default Stats;

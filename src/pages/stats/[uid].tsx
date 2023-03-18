import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import HeadWrapper from "~/components/HeadWrapper";
import type { Habits } from "~/types";
import { api } from "~/utils/api";

const habitAPI = api.habit;

const Stats: NextPage = () => {
  const [habits, setHabits] = useState<Habits>([]);

  const router = useRouter();
  const uid = router.query.uid as string;

  const { data: habitsData, isLoading } = habitAPI.getHabits.useQuery({
    uid,
  });

  return (
    <HeadWrapper
      title="Habit Completion Stats Widget"
      description="Check your habit completion stats, and embed into your Notion dashboard!"
    >
      <div className="h-screen w-screen bg-blue-200">
        <div>Stats page</div>
        <div>User id: {uid}</div>
      </div>
    </HeadWrapper>
  );
};

export default Stats;

import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

import { DateInput } from "@mantine/dates";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import WidgetLink from "~/Components/WidgetLink";

type Habits = RouterOutputs["habit"]["getHabits"];

const habitAPI = api.habit;

const Page = () => {
  const [habitForm, setHabitForm] = useState("");
  const [habits, setHabits] = useState<Habits>([]);
  const [date, setDate] = useState<Date | null>(null);
  const [parent] = useAutoAnimate();

  const { data: sessionData } = useSession();

  const { getHabits, createHabit, deleteHabit } = habitAPI;

  const { data: habitsData, isLoading } = getHabits.useQuery({
    uid: sessionData?.user.id,
  });

  useEffect(() => {
    if (habitsData) {
      setHabits(habitsData);
    }
  }, [habitsData]);

  const habitCreation = createHabit.useMutation({
    onSuccess(data) {
      setHabits((oldHabits) => [...oldHabits, data]);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    habitCreation.mutate({ name: habitForm });
    setHabitForm("");
  };

  const habitDeletion = deleteHabit.useMutation();

  const handleDelete = (id: string) => {
    habitDeletion.mutate({ id });
    setHabits((oldHabits) => oldHabits.filter((habit) => habit.id !== id));
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex w-screen flex-row justify-around">
        <Link
          className="max-w-xs  rounded-xl bg-gray-500 p-2 text-slate-200 hover:bg-gray-400"
          href="/"
        >
          <h3 className="text-l font-bold">← back</h3>
        </Link>
        <div className="text-center text-2xl text-black">
          {sessionData && (
            <span>
              Logged in as {sessionData.user?.name}, {sessionData.user.id}
            </span>
          )}
          <button
            className="rounded-full bg-sky-500 px-4 py-2 font-semibold text-white no-underline transition hover:bg-sky-400"
            onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            {sessionData ? "Sign out" : "Sign in"}
          </button>
        </div>
      </div>

      {sessionData && (
        <>
          <section>
            <h1 className="text-2xl text-sky-400">Dashboard</h1>
            <div className="mb-4 text-xl font-semibold">
              Get your embeddable links here!
            </div>
            <div>
              <WidgetLink to="tracker" uid={sessionData.user.id} />
              <WidgetLink to="stats" uid={sessionData.user.id} />
            </div>
          </section>

          <DateInput value={date} onChange={setDate} maxDate={new Date()} />
          <div ref={parent} className="mb-10 flex flex-col items-center gap-4">
            <h1 className="text-xl text-amber-400">Habits</h1>
            {isLoading ? (
              <div>loading...</div>
            ) : (
              habits?.map((habit) => (
                <div key={habit.id}>
                  {habit.name}

                  <span
                    onClick={() => handleDelete(habit.id)}
                    className="cursor-pointer"
                  >
                    x
                  </span>
                </div>
              ))
            )}
          </div>

          <div>
            <div>create habits</div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="habit"
                className="mr-5 rounded border-2 border-amber-500"
                value={habitForm}
                onChange={(e) => setHabitForm(e.target.value)}
              />
              <button type="submit">create</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;

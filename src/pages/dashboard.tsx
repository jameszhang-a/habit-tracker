import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import type { RouterOutputs } from "../utils/api";
import { api } from "../utils/api";

type Habits = RouterOutputs["habit"]["getHabits"];

const formatDate = (date: Date) => {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const Page = () => {
  const [habitForm, setHabitForm] = useState("");
  const [habits, setHabits] = useState<Habits>([]);

  const { data: sessionData } = useSession();

  const { data: habitsData, isLoading } = api.habit.getHabits.useQuery();

  useEffect(() => {
    if (habitsData) {
      setHabits(habitsData);
    }
  }, [habitsData]);

  const habitCreation = api.habit.createHabit.useMutation({
    onSuccess(data) {
      setHabits((oldHabits) => [...oldHabits, data]);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    habitCreation.mutate({ name: habitForm });
    setHabitForm("");
  };

  const habitDeletion = api.habit.deleteHabit.useMutation();

  const handleDelete = (id: string) => {
    habitDeletion.mutate({ id });
    setHabits((oldHabits) => oldHabits.filter((habit) => habit.id !== id));
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-black">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-sky-500 px-10 py-3 font-semibold text-white no-underline transition hover:bg-sky-400"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>

      <div className="mb-10 flex flex-col items-center gap-4">
        <h1 className="text-xl text-amber-400">Habits</h1>
        {isLoading ? (
          <div>loading...</div>
        ) : (
          habits?.map((habit) => (
            <div key={habit.id} className="flex flex-row gap-8">
              <div>{habit.name}</div>
              <div>{formatDate(habit.createdAt)}</div>
              <button
                className="rounded bg-red-400 px-2 hover:bg-red-200"
                onClick={() => handleDelete(habit.id)}
              >
                x
              </button>
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
    </div>
  );
};

export default Page;

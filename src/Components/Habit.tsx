import { useEffect, useState } from "react";
import type { RouterOutputs } from "../utils/api";
import { api } from "../utils/api";

type Habit = RouterOutputs["habit"]["getHabits"][0];

type Props = {
  habit: Habit;
  date: Date;
  handleDelete: (id: string) => void;
};

const formatDate = (date: Date) => {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const habitAPI = api.habit;

const Habit = ({ habit, date, handleDelete }: Props) => {
  const [showCheck, setShowCheck] = useState(false);

  const { logHabit, loggedOnDate } = habitAPI;

  const habitLogCreation = logHabit.useMutation({
    onSuccess(data) {
      setShowCheck(data.completed);
    },
  });

  const { data } = loggedOnDate.useQuery({ id: habit.id, date });

  const handleCheck = (habitID: string) => {
    // create a habit log for the day that it's checked
    // if it's already checked, then uncheck it
    habitLogCreation.mutate({ id: habitID });
  };

  useEffect(() => {
    setShowCheck(data ? true : false);
  }, [data]);

  return (
    <div className="flex flex-row gap-8">
      <div>
        <input
          type="checkbox"
          onChange={() => handleCheck(habit.id)}
          checked={showCheck}
        />
      </div>
      <div>{habit.name}</div>
      <div>{formatDate(habit.createdAt)}</div>
      <button
        className="rounded bg-red-400 px-2 hover:bg-red-200"
        onClick={() => handleDelete(habit.id)}
      >
        x
      </button>
    </div>
  );
};

export default Habit;

import { useEffect, useRef, useState } from "react";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import Gradient from "./Gradient";

type Habit = RouterOutputs["habit"]["getHabits"][0];

type Props = {
  habit: Habit;
  date: Date;
  handleDelete?: (id: string) => void;
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
  const { current: inputId } = useRef(`habit-${habit.id}`);

  const { logHabit, loggedOnDate } = habitAPI;
  const { data } = loggedOnDate.useQuery({ id: habit.id, date });

  useEffect(() => {
    setShowCheck(data ? true : false);
  }, [data]);

  const habitLogCreation = logHabit.useMutation({
    onSuccess(data) {
      setShowCheck(data.completed);
    },
  });

  const handleCheck = () => {
    // create a habit log for the day that it's checked
    // if it's already checked, then uncheck it
    habitLogCreation.mutate({ id: habit.id, date });
  };

  return (
    <div className="relative grid h-[100px] w-[150px] grid-cols-3 overflow-hidden rounded-2xl border border-gray-100/20 p-3 pl-4 shadow-lg">
      <Gradient />
      <div className={`text-4xl`}>🏋️‍♀️</div>

      <div className={`relative col-start-3`}>
        <input
          id={inputId}
          type="checkbox"
          onChange={() => handleCheck()}
          checked={showCheck}
          className="absolute hidden"
        />
        <label
          htmlFor={inputId}
          className={`absolute h-8 w-8 cursor-pointer rounded-full ${
            showCheck ? "bg-green-200" : "bg-red-200"
          }`}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      <div className={`col-span-3 self-center font-body text-xl`}>
        {habit.name}
      </div>
    </div>
  );
};

export default Habit;

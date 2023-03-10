import { useEffect, useRef, useState } from "react";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import Gradient from "./Gradient";

import { default as c } from "classnames";

export type Habit = RouterOutputs["habit"]["getHabits"][number];

type Props = {
  habit: Habit;
  date: Date;
  handleDelete?: (id: string) => void;
};

const habitAPI = api.habit;

const Habit = ({ habit, date }: Props) => {
  const [showCheck, setShowCheck] = useState(false);
  const [animateCheck, setAnimateCheck] = useState(false);
  const [animateUncheck, setAnimateUncheck] = useState(false);

  const { current: inputId } = useRef(`habit-${habit.id}`);

  const { logHabit, loggedOnDate } = habitAPI;
  const { data } = loggedOnDate.useQuery({ id: habit.id, date });

  useEffect(() => {
    setShowCheck(data ? true : false);
  }, [data]);

  const habitLogCreation = logHabit.useMutation({
    onError() {
      setShowCheck((prev) => !prev);
    },
  });

  const handleCheck = () => {
    setAnimateCheck(true);
    setShowCheck((prev) => !prev);

    // create a habit log for the day that it's checked
    // if it's already checked, then uncheck it
    habitLogCreation.mutate({ id: habit.id, date });

    setTimeout(() => {
      setAnimateCheck(false);
    }, 500);
  };

  const handleUnCheck = () => {
    setAnimateUncheck(true);
    setShowCheck((prev) => !prev);

    // create a habit log for the day that it's checked
    // if it's already checked, then uncheck it
    habitLogCreation.mutate({ id: habit.id, date });

    setTimeout(() => {
      setAnimateUncheck(false);
    }, 500);
  };

  const handleClick = () => {
    if (showCheck) {
      handleUnCheck();
    } else {
      handleCheck();
    }
  };

  const hoverEffect =
    "hover:scale-110 transition ease-in-out delay-50 duration-150";

  return (
    <div
      className={`${hoverEffect} grid h-[100px] min-w-[150px] max-w-[150px] transform grid-cols-3 overflow-hidden rounded-2xl border border-gray-100/20 p-3 pl-4 shadow-lg`}
    >
      <Gradient />
      <div
        className={c(
          {
            "rotate-[360deg] scale-[20]": animateCheck,
            "-rotate-[360deg] scale-[0.2]": animateUncheck,
          },
          `transform text-4xl duration-[500ms] ease-in-out`
        )}
      >
        {habit.emoji}
      </div>

      <div className={`relative col-start-3`}>
        <input
          id={inputId}
          type="checkbox"
          onChange={handleClick}
          checked={showCheck}
          className="absolute hidden"
        />
        <label
          htmlFor={inputId}
          className={c(
            {
              "animate-ping bg-green-300": habitLogCreation.isLoading,
              "bg-green-300 outline outline-green-200":
                !habitLogCreation.isLoading && showCheck,
              "bg-white": !showCheck,
            },
            ` absolute h-8 w-8 cursor-pointer rounded-full`
          )}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      <div
        className={`col-span-3 self-center font-body text-xl leading-none tracking-tighter`}
      >
        {habit.name}
      </div>
    </div>
  );
};

export default Habit;

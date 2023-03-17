import { useEffect, useRef, useState } from "react";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import Gradient from "./Gradient";

import { default as c } from "classnames";
import { useTrackerContext } from "~/context/TrackerContext";
import HabitLoading from "./HabitLoading";

export type Habit = RouterOutputs["habit"]["getHabits"][number];

type Props = {
  habit: Habit;
  handleDelete?: (id: string) => void;
};

const habitAPI = api.habit;

const HabitCard = ({ habit }: Props) => {
  const [showCheck, setShowCheck] = useState(false);
  const [animateCheck, setAnimateCheck] = useState(false);
  const [animateUncheck, setAnimateUncheck] = useState(false);

  const { activeDate } = useTrackerContext();

  const { logHabit, loggedOnDate } = habitAPI;
  const { data, isLoading, isSuccess, isFetched } = loggedOnDate.useQuery({
    id: habit.id,
    date: activeDate,
  });

  const habitLogCreation = logHabit.useMutation({
    onError() {
      setShowCheck((prev) => !prev);
    },
    onSuccess(data) {
      setShowCheck(data.completed);
      console.log("success", habit.name, data.completed);
    },
    onMutate() {
      if (showCheck) {
        setAnimateUncheck(true);
      } else {
        setAnimateCheck(true);
      }
    },
    onSettled() {
      if (showCheck) {
        setAnimateUncheck(false);
      } else {
        setAnimateCheck(false);
      }
    },
  });

  useEffect(() => {
    console.log("date changed", activeDate);

    if (data) {
      setShowCheck(data.completed);
    } else {
      setShowCheck(false);
    }
  }, [isFetched, data, activeDate]);

  const handleClick = () => {
    habitLogCreation.mutate({ id: habit.id, date: activeDate });
  };

  const hoverEffect =
    "hover:scale-110 transition ease-in-out delay-50 duration-150";

  const { current: inputId } = useRef(`habit-${habit.id}`);

  if (isLoading) {
    return <HabitLoading />;
  }

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

export default HabitCard;

import { useEffect, useMemo, useState } from "react";
import { api } from "@/utils/api";
import Gradient from "./Gradient";

import { default as c } from "classnames";
import { useTrackerContext } from "@/context/TrackerContext";
import type { Habit } from "@/types";

import { createStyles, Modal } from "@mantine/core";

import { DatePicker } from "@mantine/dates";
import { useTime } from "@/hooks/useTime";

import CheckMark from "./CheckMark";

type Props = {
  habit: Habit;
  handleDelete?: (id: string) => void;
  theme: string;
};

const habitAPI = api.habit;

const HabitCard = ({ habit, theme }: Props) => {
  const [showCheck, setShowCheck] = useState(false);
  const [animateCheck, setAnimateCheck] = useState(false);
  const [animateUncheck, setAnimateUncheck] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [value, setValue] = useState<Date[]>([]);

  const { activeDate, dayOffset } = useTrackerContext();

  const { classes } = useStyles();

  const { dayStart, dayEnd, isoEnd, isoStart } = useTime(activeDate);

  const { logHabit, loggedOnDate, logHabitV2, loggedOnDateV2 } = habitAPI;
  // const { data, isFetched, isLoading } = loggedOnDate.useQuery(
  //   {
  //     id: habit.id,
  //     date: activeDate,
  //     startTime: dayStart,
  //     endTime: dayEnd,
  //   },
  //   {
  //     // refetch every 5 minutes to avoid stale data
  //     refetchInterval: 1000 * 60 * 5,
  //   }
  // );
  const { data, isFetched, isLoading } = loggedOnDateV2.useQuery({
    id: habit.id,
    offset: dayOffset,
  });

  // const habitLogCreation = logHabit.useMutation({
  //   onError() {
  //     console.log("error");
  //     setShowCheck((prev) => !prev);
  //   },
  //   onSuccess(data) {
  //     console.log("success", data);
  //     setShowCheck(data.completed);
  //   },
  //   onMutate() {
  //     console.log("mutate!");
  //     if (showCheck) {
  //       console.log("uncheck");
  //       // setAnimateUncheck(true);
  //     } else {
  //       console.log("check");
  //       // setAnimateCheck(true);
  //     }
  //   },
  //   onSettled() {
  //     if (showCheck) {
  //       setAnimateUncheck(false);
  //     } else {
  //       setAnimateCheck(false);
  //     }
  //   },
  // });

  const habitLogCreation = logHabitV2.useMutation({
    onError() {
      console.log("error");
      setShowCheck((prev) => !prev);
    },
    onSuccess(data) {
      console.log("success", data);
      setShowCheck(data.completed);
    },
    onMutate() {
      console.log("mutate!");
      if (showCheck) {
        console.log("uncheck");
        // setAnimateUncheck(true);
      } else {
        console.log("check");
        // setAnimateCheck(true);
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
    if (data) {
      setShowCheck(data.completed);
    } else {
      setShowCheck(false);
    }
  }, [isFetched, data, activeDate]);

  const handleClick = () => {
    console.log("Clicking on habit:", {
      id: habit.id,
      name: habit.name,
      activeDate,
      dayOffSet: dayOffset,
    });
    habitLogCreation.mutate({ id: habit.id, offset: dayOffset });
  };

  const hoverEffect =
    "hover:scale-105 transition ease-in-out delay-50 duration-150";

  const Background = useMemo(() => {
    if (theme === "default") {
      return <Gradient />;
    }
  }, [theme]);

  // if (isLoading) {
  //   return <HabitLoading />;
  // }

  return (
    <div>
      <Modal
        opened={false}
        onClose={() => setShowOptionsModal(false)}
        size={"auto"}
        transitionProps={{ transition: "pop" }}
        withCloseButton={false}
        classNames={classes}
        centered
        overlayProps={{
          opacity: 0,
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex w-full flex-col gap-1 text-center">
            <div className="mx-[-1rem] px-[1rem] py-1 transition-colors hover:bg-blue-200">
              Calendar Edit
            </div>
            <div className="mx-[-1rem] px-[1rem] py-1 transition-colors hover:bg-violet-200">
              Options
            </div>
          </div>
          <div className="flex justify-around">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowOptionsModal(false)}
            >
              cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        opened={false}
        onClose={() => setShowOptionsModal(false)}
        size={"auto"}
        transitionProps={{ transition: "pop" }}
        withCloseButton={false}
        classNames={classes}
        centered
        overlayProps={{
          opacity: 0,
        }}
      >
        <DatePicker
          type="multiple"
          value={value}
          onChange={setValue}
          size="xs"
        />

        <div className="flex justify-around">
          <button
            type="button"
            className="rounded border-2 border-violet-300 px-1"
            onClick={() => setShowOptionsModal(false)}
          >
            Done
          </button>
        </div>
      </Modal>

      <div
        className={c(
          {
            [hoverEffect]: true,
            "border-2 border-white bg-gradient-to-br from-blue-400 to-sky-300":
              theme === "sky",
          },
          `grid h-[100px] min-w-[150px] max-w-[150px] transform grid-cols-3 overflow-hidden rounded-2xl border border-gray-100/20 p-3 pl-4 shadow-sm`
        )}
        onClick={() => setShowOptionsModal(true)}
      >
        {Background}

        <div
          className={c(
            {
              "rotate-[360deg] scale-[20]": animateCheck,
              "-rotate-[360deg] scale-[0.2]": animateUncheck,
            },
            `duration-[500ms] transform cursor-default text-4xl ease-in-out`
          )}
        >
          {habit.emoji}
        </div>

        {/* <div className={`relative col-start-3`}>
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
          ></label>
          <div className="absolute -translate-x-[30%] -translate-y-1/4 border border-red-500">
            {CheckAnimation}
          </div>
        </div> */}
        {isLoading || habitLogCreation.isLoading ? (
          <button
            type="button"
            disabled
            className="col-start-3 h-8 w-8 animate-pulse rounded-full bg-slate-700/25 disabled:cursor-progress"
          />
        ) : (
          <CheckMark
            className="col-start-3"
            id={habit.id}
            onCheck={handleClick}
            checked={showCheck}
          />
        )}
        <div
          className={`font-body col-span-3 cursor-default self-center text-xl leading-none tracking-tighter`}
        >
          {habit.name}
        </div>
      </div>

      {/* <ReactCanvasConfetti
        refConfetti={getInstance}
        style={{
          position: "fixed",
          pointerEvents: "none",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      /> */}
    </div>
  );
};

export default HabitCard;

const useStyles = createStyles(() => ({
  content: {
    borderRadius: 20,
  },
}));

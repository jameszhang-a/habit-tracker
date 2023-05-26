import { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import Gradient from "./Gradient";

import { default as c } from "classnames";
import { useTrackerContext } from "~/context/TrackerContext";
import HabitLoading from "./HabitLoading";
import type { Habit } from "~/types";

import { createStyles, Menu, Modal, Tooltip } from "@mantine/core";

import {
  EllipsisHorizontalIcon,
  Cog6ToothIcon,
  TrashIcon,
  ArchiveBoxIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { DatePicker } from "@mantine/dates";

type Props = {
  habit: Habit;
  handleDelete?: (id: string) => void;
};

const habitAPI = api.habit;

const HabitCard = ({ habit }: Props) => {
  const [showCheck, setShowCheck] = useState(false);
  const [animateCheck, setAnimateCheck] = useState(false);
  const [animateUncheck, setAnimateUncheck] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [value, setValue] = useState<Date[]>([]);

  const { activeDate } = useTrackerContext();

  const { classes } = useStyles();

  const { logHabit, loggedOnDate } = habitAPI;
  const { data, isLoading, isFetched } = loggedOnDate.useQuery({
    id: habit.id,
    date: activeDate,
  });

  const habitLogCreation = logHabit.useMutation({
    onError() {
      setShowCheck((prev) => !prev);
    },
    onSuccess(data) {
      setShowCheck(data.completed);
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
    <div className="border border-red-400">
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
          <div className="w-full text-center">
            <div className="mx-[-1rem] px-[1rem] transition-colors hover:bg-blue-200">
              Calendar Edit
            </div>
            <div className="mx-[-1rem] px-[1rem] transition-colors hover:bg-violet-200">
              Options
            </div>
          </div>
          <div className="flex justify-around">
            <button
              type="button"
              className="rounded border-2 border-violet-300 px-1"
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
        className={`${hoverEffect} grid h-[100px] min-w-[150px] max-w-[150px] transform grid-cols-3 overflow-hidden rounded-2xl border border-gray-100/20 p-3 pl-4 shadow-lg`}
        onClick={() => setShowOptionsModal(true)}
      >
        <Gradient />
        <div
          className={c(
            {
              "rotate-[360deg] scale-[20]": animateCheck,
              "-rotate-[360deg] scale-[0.2]": animateUncheck,
            },
            `transform cursor-default text-4xl duration-[500ms] ease-in-out`
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
          className={`font-body col-span-3 cursor-default self-center text-xl leading-none tracking-tighter`}
        >
          {habit.name}
        </div>
      </div>
    </div>
  );
};

export default HabitCard;

const useStyles = createStyles(() => ({
  content: {
    borderRadius: 20,
  },
}));

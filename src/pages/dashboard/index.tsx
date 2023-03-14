import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import WidgetLink from "~/Components/WidgetLink";
import HabitCreation from "~/Components/HabitCreation/HabitCreation";
import { createStyles, Menu, Modal } from "@mantine/core";
import {
  Cog6ToothIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

type Habits = RouterOutputs["habit"]["getHabits"];

const habitAPI = api.habit;

const Page = () => {
  const [habits, setHabits] = useState<Habits>([]);
  const [showCreation, setShowCreation] = useState(false);

  const [parent] = useAutoAnimate();

  const { data: sessionData } = useSession();
  const { classes } = useStyles();

  const { getHabits, deleteHabit } = habitAPI;

  const { data: habitsData, isLoading } = getHabits.useQuery({
    uid: sessionData?.user.id,
  });

  useEffect(() => {
    if (habitsData) {
      setHabits(habitsData);
    }
  }, [habitsData]);

  const habitDeletion = deleteHabit.useMutation();

  const handleDelete = (id: string) => {
    habitDeletion.mutate({ id });
    setHabits((oldHabits) => oldHabits.filter((habit) => habit.id !== id));
  };

  return (
    // background
    <div className="relative flex h-screen flex-col bg-[hsl(21,100%,87%)]">
      {/* header */}
      <div className="flex w-screen flex-row-reverse justify-between rounded-b-xl border-b bg-[#f4f5f6]/80 px-10 text-xl drop-shadow">
        <button
          className="my-1 rounded bg-sky-500 px-3 py-1 text-sm font-semibold text-white no-underline transition hover:bg-sky-400"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
        {sessionData && <span>Welcome {sessionData.user?.name}</span>}
      </div>

      {sessionData && (
        <main className="container mx-auto flex grow flex-col items-center gap-4 pt-4">
          <section className="flex w-[700px] flex-row rounded-xl border border-slate-300 bg-[#f4f5f6]/80 p-5 drop-shadow">
            <h1 className="flex flex-1 items-center justify-center text-2xl font-bold">
              Get your links!
            </h1>

            <div className="flex flex-1 flex-col gap-2">
              <WidgetLink to="tracker" uid={sessionData.user.id} />
              <WidgetLink to="stats" uid={sessionData.user.id} />
            </div>
          </section>

          <section className="container mx-auto mb-10 flex h-full w-[700px] flex-col items-center gap-4 rounded-xl border border-slate-300 bg-[#f4f5f6]/80 p-5 drop-shadow">
            <div className="relative w-full text-center">
              <h1 className="text-2xl font-bold text-slate-800">
                Your Habits
                <button
                  className="absolute right-[5px] top-0 rounded-xl bg-blue-600 p-2 text-base text-white hover:bg-blue-500"
                  onClick={() => setShowCreation((old) => !old)}
                >
                  create new
                </button>
              </h1>
            </div>

            <div
              ref={parent}
              className="flex w-2/3 flex-col divide-y divide-slate-400/25"
            >
              {isLoading ? (
                <div className="flex text-xl font-semibold tracking-wide">
                  loading
                  <div className="animate-bounce animation-delay-50">.</div>
                  <div className="animate-bounce animation-delay-100">.</div>
                  <div className="animate-bounce animation-delay-150">.</div>
                </div>
              ) : habits.length === 0 ? (
                <div className="text-center text-slate-700">
                  Start by making a habit!
                </div>
              ) : (
                habits?.map((habit) => (
                  <div key={habit.id} className="flex justify-between pt-4">
                    <div>{habit.name}</div>

                    <Menu shadow="md" width={125}>
                      <Menu.Target>
                        <div>
                          <EllipsisHorizontalIcon className="h-6 w-6 cursor-pointer rounded-l hover:border hover:border-slate-200 hover:bg-[#f4f5f6]/60 hover:shadow-inner" />
                        </div>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Label>{habit.name}</Menu.Label>
                        <Menu.Item
                          icon={<Cog6ToothIcon className="h-6 w-6" />}
                          disabled
                        >
                          Edit
                        </Menu.Item>

                        <Menu.Item
                          color="red"
                          icon={<TrashIcon className="h-6 w-6" />}
                          onClick={() => handleDelete(habit.id)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </div>
                ))
              )}
            </div>
          </section>

          <Modal
            opened={showCreation}
            onClose={() => setShowCreation(false)}
            size={"auto"}
            overlayProps={{
              color: "rgb(148 163 184)",
              opacity: 0.55,
              blur: 3,
            }}
            transitionProps={{ transition: "rotate-right" }}
            withCloseButton={false}
            classNames={classes}
          >
            <HabitCreation onClose={() => setShowCreation(false)} />
          </Modal>
        </main>
      )}
    </div>
  );
};

export default Page;

const useStyles = createStyles(() => ({
  content: {
    borderRadius: 20,
  },
}));

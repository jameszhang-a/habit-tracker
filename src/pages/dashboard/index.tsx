import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import WidgetLink from "~/Components/WidgetLink";
import HabitCreation from "~/Components/HabitCreation/HabitCreation";
import { createStyles, Modal } from "@mantine/core";
import { TrashIcon } from "@radix-ui/react-icons";

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
    <div className="relative flex h-screen flex-col bg-[#f4f5f6]">
      {/* header */}
      <div className="flex w-screen flex-row justify-around border border-red-600 bg-slate-600 text-xl">
        {sessionData && <span>Welcome {sessionData.user?.name}</span>}
        <button
          className="rounded-full bg-sky-500 px-4 py-2 font-semibold text-white no-underline transition hover:bg-sky-400"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </div>

      {sessionData && (
        <main className="container mx-auto flex grow flex-col items-center gap-4 bg-yellow-100 pt-4">
          <section className="flex w-[700px] flex-row rounded-xl border border-slate-400 bg-red-200 p-5">
            <h1 className="flex flex-1 items-center justify-center border border-red-500 text-2xl font-bold">
              Get your links!
            </h1>

            <div className="flex-1">
              <WidgetLink to="tracker" uid={sessionData.user.id} />
              <WidgetLink to="stats" uid={sessionData.user.id} />
            </div>
          </section>

          <section className="container mx-auto mb-10 flex h-full w-[700px] flex-col items-center gap-4 rounded-xl border border-slate-400 bg-green-100 p-5">
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
                <div>loading...</div>
              ) : (
                habits?.map((habit) => (
                  <div key={habit.id} className="flex justify-between pt-4">
                    <div>{habit.name}</div>

                    <div
                      onClick={() => handleDelete(habit.id)}
                      className="cursor-pointer"
                    >
                      <TrashIcon />
                    </div>
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

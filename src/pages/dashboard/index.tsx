import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import WidgetLink from "~/Components/WidgetLink";
import HabitCreation from "~/Components/HabitCreation/HabitCreation";
import { createStyles, Modal } from "@mantine/core";

import HabitRow from "~/Components/HabitRow";
import { HabitDataContext } from "./HabitDataContext";

type Habits = RouterOutputs["habit"]["getHabits"];

const habitAPI = api.habit;

const Page = () => {
  const [habits, setHabits] = useState<Habits>([]);
  const [showCreation, setShowCreation] = useState(false);

  const [parent] = useAutoAnimate();

  const { data: sessionData } = useSession();
  const { classes } = useStyles();

  const { getHabits, deleteHabit, createEditHabit } = habitAPI;

  const { data: habitsData, isLoading } = getHabits.useQuery({
    uid: sessionData?.user.id,
  });

  const editHabit = createEditHabit.useMutation({
    onSuccess: (data) => {
      // if habit exists, replace it, otherwise add it
      const habitIndex = habits.findIndex((habit) => habit.id === data.id);
      if (habitIndex !== -1) {
        setHabits((oldHabits) => {
          const newHabits = [...oldHabits];
          newHabits[habitIndex] = data;
          return newHabits;
        });
      } else {
        setHabits((oldHabits) => [...oldHabits, data]);
      }
    },
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

  const handleHabitCreation = (data: {
    name: string;
    emoji: string;
    frequency: number;
    habitId: string;
  }) => {
    editHabit.mutate({ ...data });
  };

  return (
    <HabitDataContext.Provider
      value={{ handleDelete, handleHabitCreation, habits }}
    >
      {/* background */}
      <div className="relative flex h-screen flex-col bg-[hsl(21,100%,87%)]">
        {/* header */}
        <div className="flex w-screen flex-row-reverse justify-between rounded-b-xl border-b bg-[#f4f5f6]/80 px-10 text-xl drop-shadow">
          <button
            className="my-1 rounded bg-gray-500 px-3 py-1 text-sm font-semibold text-white no-underline transition hover:bg-gray-600"
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
                  habits?.map((hData) => (
                    <HabitRow
                      key={hData.id}
                      habit={hData}
                      // editHabit={editHabit}
                    />
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
    </HabitDataContext.Provider>
  );
};

export default Page;

const useStyles = createStyles(() => ({
  content: {
    borderRadius: 20,
  },
}));

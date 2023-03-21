/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import { Loader, Modal } from "@mantine/core";
import { useSession, signOut, signIn } from "next-auth/react";

import { api } from "~/utils/api";
import WidgetLink from "~/components/WidgetLink";
import HabitCreation from "~/components/HabitCreation/HabitCreation";
import { HabitDataContextProvider } from "~/context/HabitDataContext";
import { useWindowSize } from "~/hooks/useWindowSize";

import type { Habits } from "~/types";

const HabitRows = dynamic(() => import("~/components/HabitRows/HabitRows"));

const habitAPI = api.habit;

const Page = () => {
  const [habits, setHabits] = useState<Habits>([]);
  const [archivedHabits, setArchivedHabits] = useState<Habits>([]);
  const [showCreation, setShowCreation] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [winReady, setWinReady] = useState(false);

  useEffect(() => {
    setWinReady(true);
  }, []);

  const { data: sessionData } = useSession();
  const winSize = useWindowSize();

  const {
    getHabits,
    deleteHabit,
    createEditHabit,
    reorderHabits,
    toggleArchiveHabit,
    getArchivedHabits,
  } = habitAPI;

  const { data: habitsData, isLoading: habitsLoading } = getHabits.useQuery({
    uid: sessionData?.user.id,
  });

  const { data: archivedHabitsData, isLoading: archiveHabitsLoading } =
    getArchivedHabits.useQuery({
      uid: sessionData?.user.id,
    });

  const { mutate: editHabitMutate, isLoading: editLoading } =
    createEditHabit.useMutation({
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
    if (archivedHabitsData) {
      setArchivedHabits(archivedHabitsData);
    }
  }, [habitsData, archivedHabitsData]);

  const { mutate: habitDeletionMutate, isLoading: deleteLoading } =
    deleteHabit.useMutation();
  const handleDelete = (id: string) => {
    habitDeletionMutate({ id });
    setHabits((oldHabits) => oldHabits.filter((habit) => habit.id !== id));
  };

  const handleHabitCreation = (data: {
    name: string;
    emoji: string;
    frequency: number;
    habitId: string;
  }) => {
    editHabitMutate({ ...data });
  };

  const reorder = reorderHabits.useMutation();
  const handleReorderHabits = (newHabits: Habits) => {
    reorder.mutate({ habits: newHabits });
    setHabits(newHabits);
  };

  const { mutate: archiveMutate, isLoading: archiveLoading } =
    toggleArchiveHabit.useMutation({
      onSuccess: (data) => {
        if (data.archived) {
          // move habit from habits to archivedHabits
          setHabits((oldHabits) =>
            oldHabits.filter((habit) => habit.id !== data.id)
          );
          setArchivedHabits((oldHabits) =>
            [...oldHabits, data].sort((a, b) => a.order - b.order)
          );
        } else {
          // remove habit from archivedHabits and add it to habits in order
          setHabits((oldHabits) =>
            [...oldHabits, data].sort((a, b) => a.order - b.order)
          );
        }
      },
    });

  const handleArchive = (hid: string) => {
    // close popup after the last habit is unarchived
    if (archivedHabits?.length === 1) setShowArchived(false);

    // instant update the state here instead of waiting for the mutation to finish
    // reason is better UX, the user will see the habit disappear from the archived list immediately
    setArchivedHabits((oldHabits) =>
      oldHabits.filter((habit) => habit.id !== hid)
    );
    archiveMutate({ hid });
  };

  const showLoading =
    habitsLoading ||
    editLoading ||
    deleteLoading ||
    archiveLoading ||
    archiveHabitsLoading;

  return (
    <HabitDataContextProvider
      value={{
        habits,
        setHabits,
        handleDelete,
        handleHabitCreation,
        handleReorderHabits,
        handleArchive,
      }}
    >
      {/* background */}
      <div className="flex min-h-screen flex-col bg-[hsl(269,95%,92%)]">
        {/* header */}
        <div className="flex h-12 w-screen flex-row-reverse items-center justify-between rounded-b-xl border-b bg-[#f4f5f6]/80 px-10 text-xl shadow">
          <button
            className="btn-secondary py-2 px-2 text-xs"
            onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            {sessionData ? "Sign out" : "Sign in"}
          </button>
          {sessionData && (
            <div className="flex gap-2">
              Welcome{" "}
              <span>
                {sessionData.user?.name}{" "}
                {sessionData.user?.image && (
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[hsl(269,95%,92%)]"
                    src={sessionData.user?.image}
                    alt="user avatar"
                  />
                )}
              </span>
            </div>
          )}
        </div>

        {sessionData && (
          <main className="mx-auto flex grow flex-col items-center gap-4 pt-4">
            {/* Links */}
            <section className="container flex w-[90vw] flex-col gap-2 rounded-xl border border-slate-300 bg-[#f4f5f6]/80 p-5 shadow sm:flex-row">
              <h1 className="flex flex-1 items-center justify-center text-2xl font-bold text-slate-800">
                Get your links!
              </h1>

              <div className="flex flex-1 flex-col gap-2">
                <WidgetLink to="tracker" uid={sessionData.user.id} />
                <WidgetLink to="stats" uid={sessionData.user.id} />
              </div>
            </section>

            {/* Habits section */}
            <section
              className={`container relative mb-4 flex w-[90vw] flex-col items-center gap-4 rounded-xl border border-slate-300 bg-[#f4f5f6]/80 p-5 ${
                showLoading ? "pb-12" : "pb-[100px]"
              } shadow`}
            >
              <h1 className="text-2xl font-bold text-slate-800">Your Habits</h1>
              <button
                className="btn-primary absolute top-4 right-4 text-white max-sm:h-8 max-sm:w-8 max-sm:p-1"
                onClick={() => setShowCreation((old) => !old)}
              >
                {winSize.width >= 640 ? "create new" : "+"}
              </button>
              <div className="flex w-5/6 flex-col divide-y divide-slate-400/25 sm:w-2/3">
                {winReady && !showLoading && habits.length === 0 ? (
                  <div className="text-center text-slate-700">
                    Start by making a habit!
                  </div>
                ) : (
                  <HabitRows />
                )}
              </div>

              {showLoading && (
                <Loader color="indigo" variant="bars" size={"md"} />
              )}

              {archivedHabits.length > 0 && (
                <button
                  onClick={() => setShowArchived(true)}
                  className="absolute bottom-2 left-4 cursor-pointer text-sm text-gray-800/50 hover:underline"
                >
                  Archived
                </button>
              )}
            </section>

            {/* Creation Modal */}
            <Modal
              opened={showCreation}
              onClose={() => setShowCreation(false)}
              size={"auto"}
              overlayProps={{
                color: "rgb(148 163 184)",
                opacity: 0.55,
                blur: 3,
              }}
              transitionProps={{ transition: "slide-left" }}
              withCloseButton={false}
              styles={{ content: { borderRadius: 20 } }}
            >
              <HabitCreation onClose={() => setShowCreation(false)} />
            </Modal>

            {/* Archive Modal, displaying list of all archived habits */}
            <Modal
              opened={showArchived}
              onClose={() => setShowArchived(false)}
              size={"auto"}
              overlayProps={{
                color: "rgb(148 163 184)",
                opacity: 0.55,
                blur: 3,
              }}
              transitionProps={{ transition: "slide-up" }}
              withCloseButton={false}
              styles={{ content: { borderRadius: 20 } }}
            >
              <div className="font-body flex w-[80vw] flex-col items-center overflow-clip rounded-lg bg-white backdrop-blur sm:w-[300px]">
                <h1 className="mb-4 text-2xl">Archived Habits</h1>

                <div className="flex w-full flex-col gap-2">
                  {archivedHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex w-full flex-col gap-2 rounded-lg bg-[hsl(269,95%,92%)]/80 p-4"
                    >
                      <div className="flex flex-row items-center justify-between">
                        <h2 className="text-lg font-semibold">{habit.name}</h2>
                        <button
                          onClick={() => handleArchive(habit.id)}
                          className="rounded border border-gray-600 px-3 py-2 text-sm hover:bg-indigo-700 hover:text-white"
                        >
                          {winSize.width >= 640 ? "unarchive" : "+"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Modal>
          </main>
        )}
      </div>
    </HabitDataContextProvider>
  );
};

export default Page;

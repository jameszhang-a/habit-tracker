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

  const { data: sessionData, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isLoggedOut = status === "unauthenticated";
  const authLoading = status === "loading";

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
            className="btn-secondary px-2 py-2 text-xs"
            onClick={
              isLoggedIn
                ? () => void signOut()
                : isLoggedOut
                ? () => void signIn()
                : () => void {}
            }
          >
            {isLoggedIn ? "Sign Out" : isLoggedOut ? "Sign In" : "Loading"}
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

        {authLoading ? (
          <div className="flex h-screen w-screen items-center justify-center">
            <Loader color="indigo" variant="bars" size={"md"} />
          </div>
        ) : (
          sessionData && (
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
                <h1 className="text-2xl font-bold text-slate-800">
                  Your Habits
                </h1>
                <button
                  className="btn-primary absolute right-4 top-4 text-white max-sm:h-8 max-sm:w-8 max-sm:p-1"
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
                          <h2 className="text-lg font-semibold">
                            {habit.name}
                          </h2>
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
          )
        )}
      </div>
    </HabitDataContextProvider>
  );
};

export default Page;

dbRows: [
  [
    {
      object: "page",
      id: "6118c196-bb0f-4035-85bb-c393554e2c93",
      created_time: "2023-05-23T02:48:00.000Z",
      last_edited_time: "2023-05-23T02:49:00.000Z",
      created_by: [Object],
      last_edited_by: [Object],
      cover: null,
      icon: null,
      parent: [Object],
      archived: false,
      properties: [Object],
      url: "https://www.notion.so/6-6118c196bb0f403585bbc393554e2c93",
    },
    {
      object: "page",
      id: "dc29eb6d-56e5-40ee-9982-5add39925df6",
      created_time: "2023-05-23T02:48:00.000Z",
      last_edited_time: "2023-05-23T02:49:00.000Z",
      created_by: [Object],
      last_edited_by: [Object],
      cover: null,
      icon: null,
      parent: [Object],
      archived: false,
      properties: [Object],
      url: "https://www.notion.so/5-dc29eb6d56e540ee99825add39925df6",
    },
    {
      object: "page",
      id: "766dda22-6ff5-4747-b7dd-54f636a2e19c",
      created_time: "2023-05-23T02:48:00.000Z",
      last_edited_time: "2023-05-23T02:48:00.000Z",
      created_by: [Object],
      last_edited_by: [Object],
      cover: null,
      icon: null,
      parent: [Object],
      archived: false,
      properties: [Object],
      url: "https://www.notion.so/4-766dda226ff54747b7dd54f636a2e19c",
    },
    {
      object: "page",
      id: "0418e491-a5a0-4de2-8d75-16d60e9844e1",
      created_time: "2023-05-23T02:47:00.000Z",
      last_edited_time: "2023-05-23T02:48:00.000Z",
      created_by: [Object],
      last_edited_by: [Object],
      cover: null,
      icon: null,
      parent: [Object],
      archived: false,
      properties: [Object],
      url: "https://www.notion.so/1-0418e491a5a04de28d7516d60e9844e1",
    },
    {
      object: "page",
      id: "17ce015b-ef76-417e-a1af-9e063064c488",
      created_time: "2023-05-23T02:47:00.000Z",
      last_edited_time: "2023-05-23T02:49:00.000Z",
      created_by: [Object],
      last_edited_by: [Object],
      cover: null,
      icon: null,
      parent: [Object],
      archived: false,
      properties: [Object],
      url: "https://www.notion.so/3-17ce015bef76417ea1af9e063064c488",
    },
    {
      object: "page",
      id: "f35ce08c-9915-41d4-a13f-cc9dd915700d",
      created_time: "2023-05-23T02:47:00.000Z",
      last_edited_time: "2023-05-23T02:48:00.000Z",
      created_by: [Object],
      last_edited_by: [Object],
      cover: null,
      icon: null,
      parent: [Object],
      archived: false,
      properties: [Object],
      url: "https://www.notion.so/2-f35ce08c991541d4a13fcc9dd915700d",
    },
  ],
  [
    {
      object: "page",
      id: "87d9b8d5-808b-42b8-b8e4-5ba69ac622d1",
      created_time: "2023-05-23T02:48:00.000Z",
      last_edited_time: "2023-05-23T02:49:00.000Z",
      created_by: [Object],
      last_edited_by: [Object],
      cover: null,
      icon: null,
      parent: [Object],
      archived: false,
      properties: [Object],
      url: "https://www.notion.so/4-87d9b8d5808b42b8b8e45ba69ac622d1",
    },
    {
      object: "page",
      id: "1722d5d9-8671-42ef-98b6-3bebddcaed21",
      created_time: "2023-05-23T02:44:00.000Z",
      last_edited_time: "2023-05-23T02:49:00.000Z",
      created_by: [Object],
      last_edited_by: [Object],
      cover: null,
      icon: null,
      parent: [Object],
      archived: false,
      properties: [Object],
      url: "https://www.notion.so/1-1722d5d9867142ef98b63bebddcaed21",
    },
    {
      object: "page",
      id: "38674f52-8576-42f3-89ef-aeadc017e8ca",
      created_time: "2023-05-23T02:44:00.000Z",
      last_edited_time: "2023-05-23T02:49:00.000Z",
      created_by: [Object],
      last_edited_by: [Object],
      cover: null,
      icon: null,
      parent: [Object],
      archived: false,
      properties: [Object],
      url: "https://www.notion.so/2-38674f52857642f389efaeadc017e8ca",
    },
    {
      object: "page",
      id: "736ca317-68f7-4863-8589-7d0bd299775a",
      created_time: "2023-05-23T02:44:00.000Z",
      last_edited_time: "2023-05-23T02:49:00.000Z",
      created_by: [Object],
      last_edited_by: [Object],
      cover: null,
      icon: null,
      parent: [Object],
      archived: false,
      properties: [Object],
      url: "https://www.notion.so/3-736ca31768f7486385897d0bd299775a",
    },
  ],
];
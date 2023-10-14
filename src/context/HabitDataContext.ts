import { createSafeContext } from "@mantine/utils";

import type { Habits } from "@/types";

interface HabitDataContext {
  habits: Habits;
  setHabits: (habits: Habits) => void;
  handleHabitCreation: (params: {
    name: string;
    emoji: string;
    frequency: number;
    habitId: string;
    inversedGoal: boolean;
  }) => void;
  handleDelete: (habitId: string) => void;
  handleReorderHabits: (newOrder: Habits) => void;
  handleArchive: (habitId: string) => void;
}

export const [HabitDataContextProvider, useHabitDataContext] =
  createSafeContext<HabitDataContext>("HabitDataContext is not provided");

import { createSafeContext } from "@mantine/utils";

import type { Habits } from "~/types";

interface HabitDataContext {
  habits: Habits;
  handleHabitCreation: (params: {
    name: string;
    emoji: string;
    frequency: number;
    habitId: string;
  }) => void;
  handleDelete: (habitId: string) => void;
}

export const [HabitDataContextProvider, useHabitDataContext] =
  createSafeContext<HabitDataContext>("HabitDataContext is not provided");

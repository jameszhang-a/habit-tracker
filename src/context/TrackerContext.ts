import { createSafeContext } from "@mantine/utils";

import type { RouterOutputs } from "~/utils/api";

type Habits = RouterOutputs["habit"]["getHabits"];

interface TrackerContext {
  habits?: Habits;
  handleHabitCreation?: (params: {
    name: string;
    emoji: string;
    frequency: number;
    habitId: string;
  }) => void;

  activeDate: Date;
  setActiveDate: (date: Date) => void;
}

export const [TrackerContextProvider, useTrackerContext] =
  createSafeContext<TrackerContext>("TrackerContext is not provided");

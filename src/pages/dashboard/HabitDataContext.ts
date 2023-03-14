import { createContext } from "react";
import type { RouterOutputs } from "~/utils/api";

type Habits = RouterOutputs["habit"]["getHabits"];

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

export const HabitDataContext = createContext<HabitDataContext | null>(null);

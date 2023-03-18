import type { RouterOutputs } from "~/utils/api";

type Habit = RouterOutputs["habit"]["getHabits"][number];
type Habits = Habit[];

export type { Habit, Habits };

import { createSafeContext } from "@mantine/utils";
import type { Dispatch, SetStateAction } from "react";

interface StatsContext {
  activeHabit: string;
  setActiveHabit: Dispatch<SetStateAction<string>>;
}

export const [StatsContextProvider, useStatsContext] =
  createSafeContext<StatsContext>("StatsContext is not provided");

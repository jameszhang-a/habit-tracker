import { createSafeContext } from "@mantine/utils";
import type { Dispatch, SetStateAction } from "react";

interface TrackerContext {
  activeDate: Date;
  setActiveDate: (date: Date) => void;
  dayOffset: number;
  setDayOffset: Dispatch<SetStateAction<number>>;
}

export const [TrackerContextProvider, useTrackerContext] =
  createSafeContext<TrackerContext>("TrackerContext is not provided");

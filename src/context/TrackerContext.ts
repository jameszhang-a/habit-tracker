import { createSafeContext } from "@mantine/utils";

interface TrackerContext {
  activeDate: Date;
  setActiveDate: (date: Date) => void;
}

export const [TrackerContextProvider, useTrackerContext] =
  createSafeContext<TrackerContext>("TrackerContext is not provided");

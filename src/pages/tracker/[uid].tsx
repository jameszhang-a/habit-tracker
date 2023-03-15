import { useEffect, useState } from "react";
import { type NextPage } from "next";
import { useRouter } from "next/router";

import { Carousel } from "@mantine/carousel";
import { createStyles, getStylesRef } from "@mantine/core";

import HabitCard from "~/components/HabitCard";
import HabitLoading from "~/components/HabitLoading";
import Refresh from "~/components/Refresh";
import { DatePicker } from "~/components/DatePicker";

import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { useWindowSize } from "~/hooks/useWindowSize";
import { TrackerContextProvider } from "~/context/TrackerContext";

type Habits = RouterOutputs["habit"]["getHabits"];

const habitAPI = api.habit;

const Tracker: NextPage = () => {
  const [habits, setHabits] = useState<Habits>([]);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [isHorizontal, setIsHorizontal] = useState(true);
  const { classes } = useStyles();

  const winSize = useWindowSize();

  useEffect(() => {
    if (winSize.width < 540) {
      setIsHorizontal(false);
    } else {
      setIsHorizontal(true);
    }
  }, [winSize]);

  const router = useRouter();
  const uid = router.query.uid as string;

  const { data: habitsData, isLoading } = habitAPI.getHabits.useQuery({
    uid,
  });

  if (isLoading) console.log("loading");

  useEffect(() => {
    if (habitsData) {
      setHabits(habitsData);
    }
  }, [habitsData]);

  const slides =
    !habitsData || isLoading
      ? Array.from({ length: 3 }, (_, i) => (
          <Carousel.Slide
            key={i}
            className="relative grid items-center justify-center"
          >
            <HabitLoading />
          </Carousel.Slide>
        ))
      : habits.map((habit) => (
          <Carousel.Slide
            key={habit.id}
            className="relative grid items-center justify-center"
          >
            <HabitCard key={habit.id} habit={habit} />
          </Carousel.Slide>
        ));

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-pink-300 to-blue-900">
      {/* actual component */}
      <TrackerContextProvider value={{ activeDate, setActiveDate }}>
        <div className="relative flex flex-col items-center justify-center rounded-3xl border border-gray-200 px-4 py-4 shadow-xl backdrop-blur sm:h-[250px] sm:w-[550px]">
          <DatePicker numDays={5} />
          <div className="min-w-[300px] max-w-[500px]">
            <Carousel
              slideSize={`${isHorizontal ? 33.333333 : 25}%`}
              align="start"
              slidesToScroll={isHorizontal ? 3 : 4}
              height={isHorizontal ? 150 : 500}
              controlsOffset={"-30px"}
              classNames={classes}
              withIndicators={habits.length > 3 && isHorizontal}
              orientation={isHorizontal ? "horizontal" : "vertical"}
            >
              {slides}
            </Carousel>
          </div>
          <Refresh />
        </div>
      </TrackerContextProvider>
    </div>
  );
};

export default Tracker;

const useStyles = createStyles(() => ({
  controls: {
    left: "-17px",
    right: "-17px",
  },

  control: {
    ref: getStylesRef("control"),
    transition: "opacity 150ms ease",
    opacity: 0.1,
    backgroundColor: "rgba(255, 255, 255, 0.5) !important",
  },

  indicator: {
    ref: getStylesRef("indicator"),
    transition: "opacity 150ms ease",
    opacity: 0.1,
    backgroundColor: "rgba(255, 255, 255, 0.5) !important",
  },

  root: {
    "&:hover": {
      [`& .${getStylesRef("control")}`]: {
        opacity: 1,
      },
    },
  },
}));

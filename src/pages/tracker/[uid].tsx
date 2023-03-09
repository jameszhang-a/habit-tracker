import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Carousel } from "@mantine/carousel";
import { createStyles, getStylesRef } from "@mantine/core";

import Habit from "~/Components/Habit";
import HabitLoading from "~/Components/HabitLoading";
import Refresh from "~/Components/Refresh";
import { DatePicker } from "~/Components/DatePicker";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";

type Habits = RouterOutputs["habit"]["getHabits"];

const habitAPI = api.habit;

const Tracker: NextPage = () => {
  const [habits, setHabits] = useState<Habits>([]);
  const [date, setDate] = useState<Date>(new Date());

  const router = useRouter();

  const { classes } = useStyles();

  const uid = router.query.uid as string;

  const { data: habitsData, isLoading } = habitAPI.getHabits.useQuery({
    uid,
  });

  useEffect(() => {
    if (habitsData) {
      setHabits(habitsData);
    }
  }, [habitsData]);

  const slides = !isLoading
    ? habits.map((habit) => (
        <Carousel.Slide
          key={habit.id}
          className="relative grid items-center justify-center"
        >
          <Habit key={habit.id} habit={habit} date={date} />
        </Carousel.Slide>
      ))
    : Array.from({ length: 3 }, (_, i) => (
        <Carousel.Slide
          key={i}
          className="relative grid items-center justify-center"
        >
          <HabitLoading />
        </Carousel.Slide>
      ));
  console.log("date", date);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-pink-300 to-blue-900">
      {/* actual component */}
      <div className="relative border border-gray-200 px-4 py-4 shadow-xl backdrop-blur sm:h-[300px] sm:w-[600px] sm:rounded-3xl">
        <DatePicker numDays={5} onDateChange={setDate} activeDate={date} />
        <Carousel
          slideSize={`33.333333%`}
          align="start"
          slidesToScroll={3}
          height={200}
          controlsOffset={"-10px"}
          classNames={classes}
          withIndicators={habits.length > 3}
        >
          {slides}
        </Carousel>

        <Refresh />
      </div>
    </div>
  );
};

export default Tracker;

const useStyles = createStyles(() => ({
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

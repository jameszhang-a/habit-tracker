import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import { Carousel } from "@mantine/carousel";
import { Box, createStyles, getStylesRef } from "@mantine/core";
import { default as c } from "classnames";

import HeadWrapper from "@/components/HeadWrapper";
import HabitCard from "@/components/HabitCard";
import HabitLoading from "@/components/HabitLoading";
import Refresh from "@/components/Refresh";
import TrackerBackground from "@/components/TrackerBackground";
import { DatePicker2 } from "@/components/ui/datepicker";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

import { api } from "@/utils/api";
import { useWindowSize } from "@/hooks/useWindowSize";
import useUserConfiguration from "@/hooks/useUserConfiguration";
import { TrackerContextProvider } from "@/context/TrackerContext";

import type { Habits } from "@/types";
import { type NextPage } from "next";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useTime } from "@/hooks/useTime";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import cat1 from "public/cats/cat01_gifs/cat01_walk_8fps.gif";
import { Pets } from "@/components/Pets/Pets";

const habitAPI = api.habit;

const Tracker: NextPage = () => {
  const [habits, setHabits] = useState<Habits>([]);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [isBigWidget, setIsBigWidget] = useState(true);

  console.log(
    "current date is",
    activeDate.toLocaleDateString(),
    "current dayOffset is",
    dayOffset
  );

  useEffect(() => {
    console.log("App Start");
    setActiveDate(new Date());
    setDayOffset(0);
  }, []);

  const { date } = useTime(activeDate);
  console.log("hook date is:", date);

  const { classes } = useStyles();

  const exceedsCount = useMemo(() => habits.length > 3, [habits]);

  const winSize = useWindowSize();

  useEffect(() => {
    if (winSize.width < 500) {
      setIsBigWidget(false);
    } else {
      setIsBigWidget(true);
    }
  }, [winSize]);

  const router = useRouter();
  const uid = router.query.uid as string;

  const { theme, lightTheme } = useUserConfiguration({ uid });
  // const theme = "default";
  // const lightTheme = "dark";
  const { data: habitsData, isLoading } = habitAPI.getHabits.useQuery({
    uid,
  });

  useEffect(() => {
    if (habitsData) {
      setHabits(habitsData);
    }
  }, [habitsData]);

  const slides = useMemo(
    () =>
      !habitsData || isLoading
        ? Array.from({ length: 4 }, (_, i) => (
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
              <HabitCard key={habit.id} habit={habit} theme={theme} />
            </Carousel.Slide>
          )),
    [habitsData, isLoading, habits, theme]
  );

  return (
    <HeadWrapper
      title="Tracker Widget"
      description="Custom habit tracker widget for Notion"
    >
      <ReactQueryDevtools />
      <div
        className={c(
          {
            "bg-[#ffffff]": lightTheme === "light",
            "bg-[#191919]": lightTheme === "dark",
          },
          "relative flex h-screen w-screen justify-center"
        )}
      >
        {/* actual component */}
        <TrackerContextProvider
          value={{ activeDate, setActiveDate, dayOffset, setDayOffset }}
        >
          <TrackerBackground theme={theme}>
            <DatePicker2 />

            <Carousel
              w={isBigWidget ? 515 : 320}
              slideSize={`${isBigWidget ? 33.333 : 50}%`}
              align="start"
              slidesToScroll={isBigWidget ? 3 : 2}
              height={150}
              controlsOffset={"-30px"}
              classNames={classes}
              withIndicators={exceedsCount}
              withControls={exceedsCount}
              draggable={exceedsCount}
            >
              {slides}
            </Carousel>
            <Refresh />
            <div className="absolute bottom-0 right-0 -z-50 h-[100%] w-[100%]">
              <Pets />
            </div>
            {/* <EllipsisHorizontalIcon className="h-6 w-6 cursor-pointer rounded-l text-gray-500 hover:border hover:border-slate-200 hover:bg-[#f4f5f6]/60 hover:shadow-inner" /> */}
          </TrackerBackground>
        </TrackerContextProvider>
      </div>
    </HeadWrapper>
  );
};

export default Tracker;

const useStyles = createStyles(() => ({
  controls: {
    left: "-15px",
    right: "-15px",
  },

  control: {
    ref: getStylesRef("control"),
    transition: "opacity 150ms ease",
    opacity: 0.1,
    backgroundColor: "rgba(255, 255, 255, 0.5) !important",
  },

  indicators: {
    bottom: "0.5rem",
  },

  indicator: {
    ref: getStylesRef("indicator"),
    transition: "opacity 150ms ease",
    border: "1px",
    opacity: 0.2,
    backgroundColor: "rgba(255, 255, 255, 0.5) !important",
    ":hover": {
      opacity: 1,
    },
  },

  root: {
    "&:hover": {
      [`& .${getStylesRef("control")}`]: {
        opacity: 1,
      },
    },
  },
}));

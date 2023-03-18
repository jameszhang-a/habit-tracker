import { useEffect, useMemo, useState } from "react";
import { type NextPage } from "next";
import { useRouter } from "next/router";

import { Carousel } from "@mantine/carousel";
import { createStyles, getStylesRef } from "@mantine/core";

import HabitCard from "~/components/HabitCard";
import HabitLoading from "~/components/HabitLoading";
import Refresh from "~/components/Refresh";
import { DatePicker } from "~/components/DatePicker";

import { api } from "~/utils/api";
import { useWindowSize } from "~/hooks/useWindowSize";
import { TrackerContextProvider } from "~/context/TrackerContext";
import { useColorScheme } from "@mantine/hooks";
import { default as c } from "classnames";
import HeadWrapper from "~/components/HeadWrapper";
import type { Habits } from "~/types";

const habitAPI = api.habit;

const Tracker: NextPage = () => {
  const [habits, setHabits] = useState<Habits>([]);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [isHorizontal, setIsHorizontal] = useState(true);
  const { classes } = useStyles();
  const colorScheme = useColorScheme();

  const exceedsCount = useMemo(() => habits.length > 3, [habits]);

  const winSize = useWindowSize();

  useEffect(() => {
    if (winSize.width < 450) {
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

  const fullScreen = "flex h-screen w-screen items-center justify-center";
  const widget = "w-screen h-screen flex justify-center";

  return (
    <HeadWrapper
      title="Tracker Widget"
      description="Custom habit tracker widget for Notion"
    >
      <div
        className={c({
          [fullScreen]: !isHorizontal,
          [widget]: isHorizontal,
          "bg-[#ffffff]": colorScheme === "light",
          "bg-[#191919]": colorScheme === "dark",
        })}
      >
        {/* actual component */}
        <TrackerContextProvider value={{ activeDate, setActiveDate }}>
          <div className="relative flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-gradient-to-br from-pink-300 to-blue-900 px-4 py-4 shadow-xl backdrop-blur xs:h-[250px] xs:w-[550px]">
            <DatePicker numDays={7} />
            <div className="w-[340px] max-w-[500px] xs:min-w-[500px]">
              <Carousel
                slideSize={`${
                  isHorizontal
                    ? Math.max((1 / 3) * 100, 100 / slides.length)
                    : 25
                }%`}
                align="start"
                slidesToScroll={isHorizontal ? 3 : 4}
                height={isHorizontal ? 150 : 500}
                controlsOffset={"-30px"}
                classNames={classes}
                withIndicators={exceedsCount && isHorizontal}
                withControls={exceedsCount}
                draggable={exceedsCount}
                orientation={isHorizontal ? "horizontal" : "vertical"}
              >
                {slides}
              </Carousel>
            </div>
            <Refresh />
          </div>
        </TrackerContextProvider>
      </div>
    </HeadWrapper>
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

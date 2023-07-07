import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import { Carousel } from "@mantine/carousel";
import { createStyles, getStylesRef } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { default as c } from "classnames";

import HeadWrapper from "~/components/HeadWrapper";
import HabitCard from "~/components/HabitCard";
import HabitLoading from "~/components/HabitLoading";
import Refresh from "~/components/Refresh";
import { DatePicker } from "~/components/DatePicker";

import { api } from "~/utils/api";
import { useWindowSize } from "~/hooks/useWindowSize";
import { TrackerContextProvider } from "~/context/TrackerContext";

import type { Habits } from "~/types";
import { type NextPage } from "next";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import useUserConfiguration from "~/hooks/useUserConfiguration";
import TrackerBackground from "~/components/TrackerBackground";

const habitAPI = api.habit;

const fullScreen = "flex h-screen w-screen items-center justify-center";
const widget = "flex w-screen h-screen justify-center";

const Tracker: NextPage = () => {
  const [habits, setHabits] = useState<Habits>([]);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [isHorizontal, setIsHorizontal] = useState(true);

  const { classes } = useStyles();

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

  const { theme, lightTheme } = useUserConfiguration({ uid });
  // const theme = "default";
  // const lightTheme = "light";
  const { data: habitsData, isLoading } = habitAPI.getHabits.useQuery({
    uid,
  });

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
            <HabitCard key={habit.id} habit={habit} theme={theme} />
          </Carousel.Slide>
        ));

  return (
    <HeadWrapper
      title="Tracker Widget"
      description="Custom habit tracker widget for Notion"
    >
      <div
        className={c({
          [fullScreen]: !isHorizontal,
          [widget]: isHorizontal,
          "bg-[#ffffff]": lightTheme === "light",
          "bg-[#191919]": lightTheme === "dark",
        })}
      >
        {/* actual component */}
        <TrackerContextProvider value={{ activeDate, setActiveDate }}>
          <TrackerBackground theme={theme}>
            <DatePicker numDays={7} theme={theme} />
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
            <EllipsisHorizontalIcon className="h-6 w-6 cursor-pointer rounded-l text-gray-500 hover:border hover:border-slate-200 hover:bg-[#f4f5f6]/60 hover:shadow-inner" />
          </TrackerBackground>
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

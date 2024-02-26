import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

import { Carousel } from "@mantine/carousel";
import { CopyButton, createStyles, getStylesRef } from "@mantine/core";
import { default as c } from "classnames";

import HeadWrapper from "@/components/HeadWrapper";
import HabitCard from "@/components/HabitCard";
import HabitLoading from "@/components/HabitLoading";
import Refresh from "@/components/Refresh";
import TrackerBackground from "@/components/TrackerBackground";
import { DatePicker2 } from "@/components/ui/datepicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PetsContainer } from "@/components/Pets/PetsContainer";

import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  CodeBracketSquareIcon,
} from "@heroicons/react/24/outline";

import { api } from "@/utils/api";
import { useWindowSize } from "@/hooks/useWindowSize";
import useUserConfiguration from "@/hooks/useUserConfiguration";
import { TrackerContextProvider } from "@/context/TrackerContext";

import type { Habits } from "@/types";
import { type NextPage } from "next";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useTime } from "@/hooks/useTime";

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

  const { date, dayStart, dayEnd } = useTime(activeDate);

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

  const { data: serverTime } = habitAPI.timeNow.useQuery(dayOffset);

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

  const debugValue = `
local: ${activeDate.toLocaleString()}
offset: ${dayOffset}
date: ${activeDate.toISOString()}
useDate: ${date !== undefined ? date.toISOString() : "undefined"}
S_Time: ${!!serverTime ? serverTime.now.toISOString() : "undefined"}
S_New: ${!!serverTime ? serverTime.newDate.toISOString() : "undefined"}
L_Start: ${!!dayStart ? dayStart.toISOString() : "undefined"}
L_End: ${!!dayEnd ? dayEnd.toISOString() : "undefined"}
SN_Start: ${!!serverTime ? serverTime.newDayStart.toISOString() : "undefined"}
SN_End: ${!!serverTime ? serverTime.newDayEnd.toISOString() : "undefined"}
`;

  const textRef = useRef<HTMLDivElement>(null);

  const handleCopy = (copy: () => void) => {
    const text = textRef.current;
    if (text) {
      // Select the text
      const range = document.createRange();
      range.selectNodeContents(text);
      const selection = window.getSelection();

      if (!selection) return;
      selection.removeAllRanges();
      selection.addRange(range);
    }
    copy();
  };

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
            {/* Debug info popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="align-center absolute bottom-3 right-11 flex grow justify-center rounded-md border border-input bg-background/[.2] p-1 align-middle hover:bg-accent hover:text-accent-foreground">
                  <CodeBracketSquareIcon className="h-4 w-4 place-self-center" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="absolute bottom-0 flex w-[300px] -translate-x-[130%] translate-y-8 flex-col gap-1 p-4 text-xs font-normal"
                align="center"
                sideOffset={-40}
              >
                <div ref={textRef}>
                  {/* {debugValue} */}
                  {debugValue.split("\n").map((str, i) => (
                    <div key={i}>{str}</div>
                  ))}
                </div>
                <CopyButton value={debugValue}>
                  {({ copied, copy }) => (
                    <button
                      className="align-center flex grow justify-center rounded-md border border-input bg-background/[.4] p-1 align-middle hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleCopy(copy)}
                    >
                      {copied ? (
                        <ClipboardDocumentCheckIcon className="h-4 w-4 place-self-center text-teal-600" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4 place-self-center" />
                      )}
                    </button>
                  )}
                </CopyButton>
              </PopoverContent>
            </Popover>

            <PetsContainer />
            {/* <div className="">
              <Pets name="cat5" />
              <Cat name="cat1" id="1" onClick={() => console.log("onClick")} />
            </div> */}
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

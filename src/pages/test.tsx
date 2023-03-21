import { useState, useEffect } from "react";
import { Carousel } from "@mantine/carousel";
import { createStyles, getStylesRef } from "@mantine/core";

import { type NextPage } from "next";

import dynamic from "next/dynamic";
const HabitRows = dynamic(() => import("../components/HabitRows/HabitRows"));

const useStyles = createStyles(() => ({
  button: {
    backgroundColor: "red",
  },

  control: {
    ref: getStylesRef("abc"),
    transition: "opacity 150ms ease",

    color: "#e78e8a",
    backgroundColor: "fff",
  },

  root: {
    "&:hover": {
      [`& .${getStylesRef("abc")}`]: {
        opacity: 1,
      },
    },
  },
}));

const slides = [1, 2, 3, 4, 5].map((item) => (
  <Carousel.Slide key={item}>
    <div className="h-full bg-blue-200">{item}</div>
  </Carousel.Slide>
));

const Test: NextPage = () => {
  const [winReady, setWinReady] = useState(false);

  useEffect(() => {
    setWinReady(true);
  }, []);

  const { classes } = useStyles();

  return (
    <div>
      <div>Example page</div>
      <Carousel
        slideSize="50%"
        slideGap="xl"
        align="start"
        height={200}
        maw={320}
        classNames={classes}
      >
        {slides}
      </Carousel>

      <div className="animate-gradient-x h-20 w-40 rounded border bg-gradient-full bg-huge"></div>

      <div className="mx-auto w-3/4"></div>
    </div>
  );
};

export default Test;

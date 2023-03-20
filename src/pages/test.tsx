import { Carousel } from "@mantine/carousel";
import { createStyles, getStylesRef } from "@mantine/core";

import { type NextPage } from "next";

import dynamic from "next/dynamic";
const HabitRows = dynamic(() => import("../components/HabitRows"));

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

      <div className="mx-auto w-3/4">
        <HabitRows
          data={[
            {
              position: 6,
              mass: 12.011,
              symbol: "C",
              name: "Carbon",
            },
            {
              position: 7,
              mass: 14.007,
              symbol: "N",
              name: "Nitrogen",
            },
            {
              position: 39,
              mass: 88.906,
              symbol: "Y",
              name: "Yttrium",
            },
            {
              position: 56,
              mass: 137.33,
              symbol: "Ba",
              name: "Barium",
            },
            {
              position: 58,
              mass: 140.12,
              symbol: "Ce",
              name: "Cerium",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Test;

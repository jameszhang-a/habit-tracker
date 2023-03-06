import { Carousel } from "@mantine/carousel";
import { createStyles, getStylesRef } from "@mantine/core";

import { type NextPage } from "next";
import Confetti from "~/Components/Confetti";
import RefreshButton from "~/Components/Refresh";

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

  console.log(classes);

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
    </div>
  );
};

export default Test;

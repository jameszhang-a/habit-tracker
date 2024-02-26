import cat1Walking from "public/cats/cat01_gifs/cat01_walk_8fps.gif";
import cat1Idle from "public/cats/cat01_gifs/cat01_idle_blink_8fps.gif";
import cat1Laying from "public/cats/cat01_gifs/cat01_liedown_8fps.gif";
import cat1Running from "public/cats/cat01_gifs/cat01_run_12fps.gif";

import cat5Walking from "public/cats/cat05_gifs/cat05_walk_8fps.gif";
import cat5Idle from "public/cats/cat05_gifs/cat05_idle_blink_8fps.gif";
import cat5Laying from "public/cats/cat05_gifs/cat05_liedown_8fps.gif";
import cat5Running from "public/cats/cat05_gifs/cat05_run_12fps.gif";

import type { StaticImageData } from "next/image";

export type Action = "idle" | "walking" | "laying" | "running";

export type CatType = {
  [K in Action]: StaticImageData;
};

const cat1: CatType = {
  walking: cat1Walking,
  idle: cat1Idle,
  laying: cat1Laying,
  running: cat1Running,
};

const cat5: CatType = {
  walking: cat5Walking,
  idle: cat5Idle,
  laying: cat5Laying,
  running: cat5Running,
};

// TODO: make very dramatic reminders to complete habits
const CatTalk = [
  "Meow",
  "Purrrrr",
  "Hi, I'm Puffin!",
  "I love you!",
  "Feed me!",
  "I'm hungry~",
];

export { cat1, cat5, CatTalk };

import { useCallback, useEffect, useRef, useState } from "react";

import type { Action, CatType } from "./Cats";
import { cat1, cat5, CatTalk } from "./Cats";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Image from "next/image";

// Pixels per second
const DEFAULT_SPEED = 30;
const RUNNING_SPEED = 60;

type CatProps = {
  id: string;
  name: string;
  onClick: () => void;
};

function Cat({ name }: CatProps) {
  let currPet: CatType;
  switch (name) {
    case "cat1":
      currPet = cat1;
      break;
    case "cat5":
      currPet = cat5;
      break;
    default:
      currPet = cat1;
  }
  const petRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<Action>("idle");

  const [position, setPosition] = useState({ x: 90, y: -4 });
  const [moveDuration, setMoveDuration] = useState(0);
  const [faceRight, setFaceRight] = useState(true);
  const [currAction, setCurrAction] = useState<Action>("laying");
  const [catSpeech, setCatSpeech] = useState("");

  const getRelativePosition = useCallback(() => {
    if (!petRef.current) return { x: 0, y: 0 };

    const petRect = petRef.current.getBoundingClientRect();
    const container = petRef.current.parentNode as HTMLElement;
    const containerRect = container.getBoundingClientRect();

    return {
      x: petRect.left - containerRect.left,
      y: petRect.top - containerRect.top,
    };
  }, []);

  const rest = useCallback(() => {
    actionRef.current = "idle";
    setCurrAction("idle");
    setMoveDuration(0);
  }, []);

  const move = useCallback(() => {
    if (actionRef.current === "walking") {
      return;
    }

    actionRef.current = "walking";

    // First determine the direction
    let direction = Math.random() > 0.5 ? 1 : -1;
    // Then determine the distance without running into the bounding box
    const currentPosition = getRelativePosition();
    const distance = Math.floor(Math.random() * 200 + 50);
    const futureX = currentPosition.x + direction * distance;

    // Collision detection with container boundaries
    const container = petRef.current?.parentNode as HTMLElement;
    if (container) {
      const containerWidth = container.offsetWidth;

      if (futureX < 0 || futureX > containerWidth - 40) {
        direction *= -1; // Reverse the direction
      }
    }
    // set new direction
    setFaceRight(direction === 1);

    const gottaRun = distance > 150;
    setCurrAction(gottaRun ? "running" : "walking");

    // Calculate duration
    const moveDuration = gottaRun
      ? distance / RUNNING_SPEED
      : distance / DEFAULT_SPEED;
    setMoveDuration(moveDuration);

    // Update position with possibly reversed direction
    setPosition((prev) => {
      return { x: prev.x + direction * distance, y: prev.y };
    });

    // Set a timeout to stop walking after the calculated duration
    setTimeout(() => {
      rest();
    }, moveDuration * 1000);
  }, [getRelativePosition, rest]);

  // Simulate some autonomous behavior
  useEffect(() => {
    // Interval to change the cat's behavior periodically

    const interval = setInterval(() => {
      if (actionRef.current === "walking" || actionRef.current === "running") {
        return;
      }
      const shouldMove = Math.random() > 0.5;
      if (shouldMove) {
        move();
      } else {
        rest();
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [move, rest]);

  const generateMessage = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * CatTalk.length);
    setCatSpeech(CatTalk[randomIndex] as string);
  }, []);

  return (
    <div
      className="absolute bottom-3 h-10 w-10 border-yellow-500"
      style={{
        left: position.x,
        bottom: position.y,
        transition: `all ${moveDuration}s linear`,
      }}
      ref={petRef}
    >
      <Image
        alt="cat"
        className="absolute inset-0 scale-150"
        style={{
          transform: `
              ${faceRight ? "scaleX(1)" : "scaleX(-1)"}
              scaleX(1.25) 
              scaleY(1.25)
            `,
        }}
        src={currPet[currAction]}
      />
      <TooltipProvider delayDuration={50}>
        <Tooltip
          onOpenChange={(open) => {
            if (open) {
              generateMessage();
            }
          }}
        >
          <TooltipTrigger>
            <div
              className="absolute bottom-0 left-1 right-2 top-3 m-auto cursor-pointer border-green-800"
              onClick={move}
            />
          </TooltipTrigger>
          <TooltipContent sideOffset={7} align="start">
            <p className="text-xs">{catSpeech}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default Cat;

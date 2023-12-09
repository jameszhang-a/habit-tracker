import { useRef, useState } from "react";
import cat1Walking from "public/cats/cat01_gifs/cat01_walk_8fps.gif";
import cat1Idle from "public/cats/cat01_gifs/cat01_sit_8fps.gif";
import Image from "next/image";

const speed = 30; // Pixels per second

export const Pets = () => {
  // State to manage pet's status and position
  const [isWalking, setIsWalking] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: -7 }); // Initial position
  const [duration, setDuration] = useState(0); // Add duration to state
  const [faceRight, setFaceRight] = useState(true); // Add faceRight to state

  const petRef = useRef<HTMLDivElement>(null);

  const handlePetClick = () => {
    setIsWalking(true);

    const currentPosition = getRelativePosition();
    const distance = Math.floor(Math.random() * 50 + 20);
    let direction = Math.random() > 0.5 ? 1 : -1; // Initial direction

    // Future position calculation
    const futureX = currentPosition.x + direction * distance;
    console.log("direction", direction);
    console.log("currentPosition", currentPosition);
    console.log("futureX", futureX);

    // Collision detection with container boundaries
    const container = petRef.current?.parentNode as HTMLElement;
    if (container) {
      const containerWidth = container.offsetWidth;
      console.log("containerWidth", containerWidth);
      if (futureX < 0 || futureX > containerWidth - 40) {
        console.log(
          "why are we flipping?",
          futureX < 0,
          futureX > containerWidth - 40,
          {
            futureX,
            containerWidth,
            petWidth: petRef.current?.offsetWidth,
          }
        );
        direction *= -1; // Reverse the direction
        console.log("reversing direction");
      }
    }

    if (direction === 1) {
      setFaceRight(true);
    } else {
      setFaceRight(false);
    }

    // Update position with possibly reversed direction
    const movementDuration = distance / speed; // Calculate duration
    setDuration(movementDuration);
    setPosition((prev) => ({ ...prev, x: prev.x + direction * distance }));

    // Set a timeout to stop walking after the calculated duration
    setTimeout(() => {
      setIsWalking(false);
    }, movementDuration * 1000); // Convert to milliseconds
  };

  const getRelativePosition = () => {
    if (!petRef.current) return { x: 0, y: 0 };

    const petRect = petRef.current.getBoundingClientRect();
    const container = petRef.current.parentNode as HTMLElement; // Type assertion
    const containerRect = container.getBoundingClientRect();

    return {
      x: petRect.left - containerRect.left,
      y: petRect.top - containerRect.top,
    };
  };

  console.log("position", position);
  // console.log("relative position", getRelativePosition());

  return (
    <div
      className="absolute right-20"
      style={{
        left: position.x,
        bottom: position.y,
        transition: `all ${duration}s linear`, // Apply dynamic duration
      }}
      ref={petRef}
    >
      <div className="relative h-10 w-10">
        <Image
          alt="cat"
          className="absolute inset-0"
          style={{
            transform: faceRight ? "scaleX(1)" : "scaleX(-1)",
          }}
          src={isWalking ? cat1Walking : cat1Idle}
        />
        <div
          className="absolute bottom-1 left-2 right-2 top-3 m-auto cursor-pointer"
          onClick={handlePetClick}
        />
      </div>
    </div>
  );
};

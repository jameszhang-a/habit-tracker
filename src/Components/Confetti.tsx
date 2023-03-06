import React, { useEffect, useState } from "react";

interface ConfettiProps {
  colors: string[];
  duration: number;
  numberOfConfetti: number;
}

type Confetti = {
  angle: number;
  distance: number;
  color: string;
};

const Confetti: React.FC<ConfettiProps> = ({
  colors,
  duration,
  numberOfConfetti,
}) => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    // Generate confetti
    const generateConfetti = () => {
      const newConfetti = Array.from(
        { length: numberOfConfetti },
        (_, index) => {
          const angle = Math.random() * 360;
          const distance = Math.random() * 40 + 10;
          const color = colors[index % colors.length] as string;
          return { angle, distance, color };
        }
      );
      setConfetti(newConfetti);
    };

    // Update confetti position
    const updateConfetti = () => {
      setConfetti((prevConfetti) =>
        prevConfetti.map((c) => {
          const newAngle = c.angle + 5;
          const newDistance = c.distance - 0.5;
          return { ...c, angle: newAngle, distance: newDistance };
        })
      );
    };

    // Start confetti animation
    const intervalId = setInterval(updateConfetti, 5);
    setTimeout(() => clearInterval(intervalId), duration);

    // Generate confetti on mount
    generateConfetti();

    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
      {confetti.map((c, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) rotate(${c.angle}deg) translate(${c.distance}px)`,
            width: "10px",
            height: "10px",
            backgroundColor: c.color,
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;

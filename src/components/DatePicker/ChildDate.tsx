import { useState, useMemo } from "react";
import { default as c } from "classnames";

import { useTrackerContext } from "~/context/TrackerContext";

interface ChildDateProps {
  date: Date;
}

export const ChildDate: React.FC<ChildDateProps> = ({ date }) => {
  const [hover, setHover] = useState(false);
  const { activeDate, setActiveDate } = useTrackerContext();

  const isActive = useMemo(
    () => activeDate.toDateString() === date.toDateString(),
    [activeDate, date]
  );

  const hoverClasses = `hover:-translate-y-1 ${
    isActive ? "hover:bg-cyan-300" : "hover:bg-cyan-100"
  } hover:text-gray-900 hover:shadow-lg`;

  return (
    <div
      onClick={() => setActiveDate(date)}
      className={c(
        {
          "bg-transparent p-4 text-white": !isActive,
          "bg-cyan-300 px-6 hover:bg-cyan-200": isActive,
          [hoverClasses]: hover,
        },
        "mx-1 flex h-10 w-7 cursor-pointer flex-col items-center justify-center rounded-lg border py-5 text-sm font-semibold leading-normal transition-all ease-in-out"
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span>{toDay(date)}</span>
      <span>{toDate(date)}</span>
    </div>
  );
};

const toDay = (date: Date) => {
  return date.toLocaleDateString("en-US", { weekday: "long" }).slice(0, 3);
};

const toDate = (date: Date) => {
  return date.toLocaleDateString("en-US", { day: "2-digit" });
};

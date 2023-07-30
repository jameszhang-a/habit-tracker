import { useMemo } from "react";
import { default as c } from "classnames";

import { useTrackerContext } from "~/context/TrackerContext";

interface ChildDateProps {
  date: Date;
  theme: string;
}

export const ChildDate: React.FC<ChildDateProps> = ({ date, theme }) => {
  const { activeDate, setActiveDate } = useTrackerContext();

  const isActive = useMemo(
    () => activeDate.toDateString() === date.toDateString(),
    [activeDate, date]
  );

  return (
    <DateButton
      setActiveDate={setActiveDate}
      date={date}
      theme={theme}
      isActive={isActive}
    >
      <span>{toDay(date)}</span>
      <span>{toDate(date)}</span>
    </DateButton>
  );
};

type DateButtonProps = {
  setActiveDate: (date: Date) => void;
  date: Date;
  theme: string;
  children: React.ReactNode;
  isActive: boolean;
};

const DateButton = ({
  setActiveDate,
  date,
  theme,
  children,
  isActive,
}: DateButtonProps) => {
  switch (theme) {
    case "sky":
      return (
        <div
          onClick={() => setActiveDate(date)}
          className={c(
            "mx-1 flex h-10 w-7 cursor-pointer flex-col items-center justify-center rounded-lg border border-white py-5 text-sm font-semibold leading-normal drop-shadow transition-all ease-in-out",
            {
              "bg-transparent p-4 hover:bg-green-100": !isActive,
              "bg-green-300 px-6 hover:bg-green-300": isActive,
            }
          )}
        >
          {children}
        </div>
      );
    default:
      return (
        <div
          onClick={() => setActiveDate(date)}
          className={c(
            {
              "bg-transparent p-4 text-white": !isActive,
              "bg-cyan-300 px-6 hover:bg-cyan-200": isActive,
            },
            `hover:-translate-y-1 ${
              isActive ? "hover:bg-cyan-300" : "hover:bg-cyan-100"
            } mx-1 flex h-10 w-7 cursor-pointer flex-col items-center justify-center rounded-lg border py-5 text-sm font-semibold leading-normal transition-all ease-in-out hover:text-gray-900 hover:shadow-lg`
          )}
        >
          {children}
        </div>
      );
  }
};

const toDay = (date: Date) => {
  return date.toLocaleDateString("en-US", { weekday: "long" }).slice(0, 3);
};

const toDate = (date: Date) => {
  return date.toLocaleDateString("en-US", { day: "2-digit" });
};

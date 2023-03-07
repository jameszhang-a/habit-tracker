import type { Dispatch, SetStateAction } from "react";
import { useMemo } from "react";

interface ChildDateProps {
  date: Date;
  onClick: Dispatch<SetStateAction<Date>>;
  activeDate: Date;
  children?: React.ReactNode;
}

export const ChildDate: React.FC<ChildDateProps> = ({
  date,
  onClick,
  activeDate,
}) => {
  const isActive = useMemo(
    () => activeDate.toDateString() === date.toDateString(),
    [activeDate, date]
  );

  return (
    <div
      onClick={() => onClick(date)}
      className={`${
        isActive ? "bg-red-300 hover:bg-red-200" : ""
      } mx-1 flex h-10 w-7 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-200 p-4 py-4 text-sm leading-tight text-gray-700 transition hover:scale-105 hover:bg-gray-300 hover:text-gray-900 hover:shadow-lg`}
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
  return date.getDate();
};

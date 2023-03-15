import { useMemo } from "react";
import { ChildDate } from "./ChildDate";

interface DatePickerProps {
  numDays: number;
}

export const DatePicker: React.FC<DatePickerProps> = ({ numDays }) => {
  // get the previous x days from today as date objects
  const days = useMemo(
    () =>
      Array.from({ length: numDays }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (numDays - 1 - i));
        return d;
      }),
    [numDays]
  );

  return (
    <div className="m-2 flex items-center justify-center">
      {days.map((d, i) => (
        <ChildDate key={i} date={d} />
      ))}
    </div>
  );
};

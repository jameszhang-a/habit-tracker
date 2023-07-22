import { ChildDate } from "./ChildDate";

interface DatePickerProps {
  numDays: number;
  theme: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ numDays, theme }) => {
  // get the previous x days from today as date objects
  const days = Array.from({ length: numDays }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (numDays - 1 - i));
    return d;
  });

  return (
    <div className="m-2 flex items-center justify-center">
      {days.map((d, i) => (
        <ChildDate key={i} date={d} theme={theme} />
      ))}
    </div>
  );
};

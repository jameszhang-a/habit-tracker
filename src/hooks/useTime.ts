import { endOfDay, startOfDay } from "date-fns";
import { useEffect, useState } from "react";

export function useTime(t: Date) {
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    const d = new Date();
    setDate(d);
  }, []);

  const start = startOfDay(t);
  const end = endOfDay(t);

  return {
    date: date,
    dayStart: start,
    dayEnd: end,
    isoStart: start.toISOString(),
    isoEnd: end.toISOString(),
  };
}

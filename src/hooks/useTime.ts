import { useEffect, useState } from "react";

export function useTime(t: Date) {
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    const d = new Date();
    setDate(d);
  }, []);

  const day = t.getDate();
  const month = t.getMonth();
  const year = t.getFullYear();

  const start = new Date(year, month, day, 0, 0, 0);
  const end = new Date(year, month, day, 23, 59, 59);

  return {
    date: date,
    dayStart: start,
    dayEnd: end,
    isoStart: start.toISOString(),
    isoEnd: end.toISOString(),
  };
}

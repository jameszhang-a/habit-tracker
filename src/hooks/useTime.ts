import { useMemo } from "react";

export function useTime(t: Date) {
  const day = t.getDate();
  const month = t.getMonth();
  const year = t.getFullYear();

  const res = useMemo(() => {
    const start = new Date(year, month, day, 0, 0, 0);
    const end = new Date(year, month, day, 23, 59, 59);

    return {
      dayStart: start,
      dayEnd: end,
      isoStart: start.toISOString(),
      isoEnd: end.toISOString(),
    };
  }, [day, month, year]);

  return res;
}

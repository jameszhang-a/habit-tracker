const formatDate = (date: Date) => {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const emojiLength = (text: string) => {
  const x = [...new Intl.Segmenter().segment(text)];

  return x.length;
};

const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;

const totalWeeksBetween = (startDate: Date, currDate: Date) => {
  // Get day of the week as number (0-6), with 0 as Sunday and 1 as Monday
  const dayOfWeek = startDate.getDay();

  // Calculate the number of days since the last Monday
  const daysSinceLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // "Round down" startDate to the last Monday
  startDate.setDate(startDate.getDate() - daysSinceLastMonday);

  return Math.floor(
    (currDate.getTime() - startDate.getTime()) / millisecondsPerWeek
  );
};

const weekDay = (n: number, mode: "full" | "short" | "first") => {
  const days = {
    full: [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ],
    short: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    first: ["s", "m", "t", "w", "t", "f", "s"],
  };

  return days[mode][n];
};

const getDateInterval = (currDate?: Date) => {
  const now = currDate ? new Date(currDate) : new Date();

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(now);
  dayEnd.setHours(0, 0, 0, 0);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return { dayStart, dayEnd };
};

export { formatDate, emojiLength, weekDay, getDateInterval, totalWeeksBetween };

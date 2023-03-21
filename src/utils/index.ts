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

const weekFromDate = (
  date: Date,
  weekStart: "monday" | "sunday" = "monday"
) => {
  const time = date.getTime();

  // Create a new Date object for the beginning of the year
  const startOfYear = new Date(time);
  startOfYear.setMonth(0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  // Calculate the difference between the input date and the beginning of the year in milliseconds
  const diff = time - startOfYear.getTime();

  // Convert the difference to days and add 1 to get the day number out of the year (starting at 1)
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

  // Offset the day of the year by the day of the week of the first day of the year
  const dayOfYearOffset =
    startOfYear.getDay() - (weekStart === "monday" ? 1 : 0);

  return Math.ceil((dayOfYear + dayOfYearOffset) / 7);
};

const getWeekKey = (date: Date) => {
  const year = date.getFullYear();
  const week = weekFromDate(date);

  return `${year}-${week}`;
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

export {
  formatDate,
  emojiLength,
  weekFromDate,
  getWeekKey,
  weekDay,
  getDateInterval,
};

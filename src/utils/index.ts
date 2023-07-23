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

const scramble = <T>(array: T[]) => {
  let currentIndex = array.length,
    temporaryValue: T,
    randomIndex: number;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex] as T;
    array[currentIndex] = array[randomIndex] as T;
    array[randomIndex] = temporaryValue;
  }

  return array;
};

export {
  formatDate,
  emojiLength,
  weekDay,
  getDateInterval,
  totalWeeksBetween,
  getWeekKey,
  weekFromDate,
  scramble,
};

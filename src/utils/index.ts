import { endOfDay, startOfDay, subMilliseconds } from "date-fns";

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

function getWeekKey(date: Date): string {
  // Getting ISO Week Number
  const dayNum = date.getUTCDay() || 7; // Adjusting for Sunday
  date.setUTCDate(date.getUTCDate() + 4 - dayNum); // Adjust to Thursday
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1)); // Getting the start of the year
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  // Determining the correct year for the ISO week
  const year = date.getUTCFullYear();
  let isoYear = year;
  if (weekNo === 1 && date.getUTCMonth() === 11) {
    isoYear = year + 1;
  }
  if (weekNo >= 52 && date.getUTCMonth() === 0) {
    isoYear = year - 1;
  }

  return `${isoYear}-${weekNo}`;
}

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

const getDateInterval = (currDate?: Date, offset?: number) => {
  const now = currDate ?? new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const newDayStart = startOfDay(now);
  const newDayEnd = endOfDay(now);

  const startAdjusted = subMilliseconds(newDayStart, offset ?? 0);
  const endAdjusted = subMilliseconds(newDayEnd, offset ?? 0);

  const timezoneAdjusted = subMilliseconds(now, offset ?? 0);
  const newnewDayStart = subMilliseconds(
    startOfDay(timezoneAdjusted),
    offset ?? 0
  );
  const newnewDayEnd = subMilliseconds(endOfDay(timezoneAdjusted), offset ?? 0);

  return {
    dayStart,
    dayEnd,
    newDayEnd,
    newDayStart,
    newnewDayStart,
    newnewDayEnd,
    startAdjusted,
    endAdjusted,
  };
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

const getWeeks = (startDate: Date, currDate: Date) => {
  const date = new Date(startDate);
  const weeks = [];

  while (date <= currDate) {
    weeks.push(getWeekKey(date)); // assuming getWeekKey is a function that gives you the weekKey for a date
    date.setDate(date.getDate() + 7);
  }

  return weeks;
};

// /**
//  * Converts a weekKey in the format 'YYYY-WW' to the start date of that week.
//  * @param {string} weekKey - The week key in 'YYYY-WW' format.
//  * @returns {Date} - The start date of the week.
//  */
// function convertWeekKeyToStartDate(weekKey: string): Date {
//   const [year, weekStr] = weekKey.split("-") as [string, string];
//   const week = parseInt(weekStr, 10);

//   // Parse the start of the year
//   const startOfYear = parseISO(`${year}-01-01`);

//   // Add the weeks to the start of the year
//   const weekDate = addWeeks(startOfYear, week);

//   console.log("weekDate", weekDate);

//   // Get the start of the week
//   return startOfWeek(weekDate, { weekStartsOn: 1 }); // Set weekStartsOn depending on your locale (0 for Sunday, 1 for Monday, etc.)
// }

function convertWeekKeyToStartDate(yearWeek: string): Date {
  const parts = yearWeek.split("-");
  const year = parseInt(parts[0], 10);
  const week = parseInt(parts[1], 10);

  // Getting the first day of the year
  const yearStart = new Date(Date.UTC(year, 0, 1));

  // Calculating the date of the first Monday of the year
  const dayNum = yearStart.getUTCDay();
  const diff = dayNum <= 4 ? dayNum - 1 : 7 - dayNum + 1;
  const firstMonday = new Date(yearStart.getTime());
  firstMonday.setUTCDate(yearStart.getUTCDate() - diff);

  // Adding the correct number of weeks
  const weekTime = (week - 1) * 7 * 24 * 60 * 60 * 1000;
  const date = new Date(firstMonday.getTime() + weekTime);

  return date;
}

export {
  formatDate,
  emojiLength,
  weekDay,
  getDateInterval,
  totalWeeksBetween,
  getWeekKey,
  weekFromDate,
  scramble,
  getWeeks,
  convertWeekKeyToStartDate,
};

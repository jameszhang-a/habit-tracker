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

function getWeekKey(date: Date): string {
  const dateCopy = new Date(date);
  // Getting ISO Week Number
  const dayNum = dateCopy.getUTCDay() || 7; // Adjusting for Sunday
  dateCopy.setUTCDate(dateCopy.getUTCDate() + 4 - dayNum); // Adjust to Thursday
  const yearStart = new Date(Date.UTC(dateCopy.getUTCFullYear(), 0, 1)); // Getting the start of the year
  const weekNo = Math.ceil(
    ((dateCopy.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  // Determining the correct year for the ISO week
  const year = dateCopy.getUTCFullYear();
  let isoYear = year;
  if (weekNo === 1 && dateCopy.getUTCMonth() === 11) {
    isoYear = year + 1;
  }
  if (weekNo >= 52 && dateCopy.getUTCMonth() === 0) {
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
    weeks.push(getWeekKey(date));
    date.setDate(date.getDate() + 7);
  }

  return weeks;
};

function convertWeekKeyToStartDate(weekKey: string): Date {
  // Parsing the year and week from the weekKey
  const parts = weekKey.split("-") as [string, string];
  const year = parseInt(parts[0], 10);
  const week = parseInt(parts[1], 10);

  // Getting the first day of the year
  const yearStart = new Date(Date.UTC(year, 0, 1));

  // Calculating the day number for 1st Jan of the year
  const dayNum = yearStart.getUTCDay() || 7;

  // Calculating the first Thursday of the year which is in week 1
  // If the 1st of January is Friday, Saturday or Sunday (5, 6, 7), then the first Thursday is in the next week
  const firstThursday = dayNum > 4 ? 1 + (7 - dayNum + 4) : 1 + (4 - dayNum);

  // Calculating the Monday of the requested week
  // The Monday of week 1 is 4 days before the first Thursday
  // Each week adds 7 days
  const mondayOfRequestedWeek = new Date(
    Date.UTC(year, 0, firstThursday + (week - 1) * 7 - 3)
  );

  return mondayOfRequestedWeek;
}

export {
  formatDate,
  emojiLength,
  weekDay,
  getDateInterval,
  totalWeeksBetween,
  getWeekKey,
  scramble,
  getWeeks,
  convertWeekKeyToStartDate,
};

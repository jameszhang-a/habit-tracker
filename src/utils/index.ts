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

const weekFromDate = (date: Date) => {
  const time = date.getTime();

  // Create a new Date object for the beginning of the year
  const startOfYear = new Date(time);
  startOfYear.setMonth(0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  // Calculate the difference between the input date and the beginning of the year in milliseconds
  const diff = time - startOfYear.getTime();

  // Convert the difference to days and add 1 to get the day number out of the year (starting at 1)
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

  const dayOfYearOffset = startOfYear.getDay() - 1;

  return Math.ceil((dayOfYear + dayOfYearOffset) / 7);
};
console.log(weekFromDate(new Date()));

export { formatDate, emojiLength, weekFromDate };

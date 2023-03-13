export const formatDate = (date: Date) => {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const emojiLength = (text: string) => {
  const x = [...new Intl.Segmenter().segment(text)];

  return x.length;
};

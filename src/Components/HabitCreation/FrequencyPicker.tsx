"use client";

import { createStyles, SegmentedControl, rem } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
    boxShadow: theme.shadows.md,
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[1]
    }`,
  },

  indicator: {
    backgroundImage: theme.fn.gradient({ from: "pink", to: "orange" }),
  },

  control: {
    border: "0 !important",
  },

  label: {
    "&, &:hover": {
      "&[data-active]": {
        color: theme.white,
      },
    },
  },
}));

export function FrequencyPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { classes } = useStyles();

  return (
    <SegmentedControl
      radius="xl"
      size="md"
      data={["1", "2", "3", "4", "5", "6", "7"]}
      classNames={classes}
      onChange={(value) => onChange(value)}
    />
  );
}

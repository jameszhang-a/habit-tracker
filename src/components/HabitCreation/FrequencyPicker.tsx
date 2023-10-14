import { useMemo, useState } from "react";
import { createStyles, SegmentedControl, rem } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
    boxShadow: theme.shadows.sm,
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[1]
    }`,
  },

  indicator: {
    backgroundImage: theme.fn.gradient({ from: "pink", to: "indigo" }),
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
  onChange,
  defaultValue,
  startAtZero,
}: {
  onChange: (value: string) => void;
  defaultValue?: string;
  startAtZero: boolean;
}) {
  const [value, setValue] = useState(defaultValue || "1");
  const { classes } = useStyles();

  const handleValueChange = (value: string) => {
    setValue(value);
    onChange(value);
  };

  const data = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const value = `${i + (startAtZero ? 0 : 1)}`;
        return { label: value, value };
      }),
    [startAtZero]
  );

  return (
    <SegmentedControl
      radius="xl"
      size="sm"
      value={value}
      data={data}
      classNames={classes}
      onChange={(value) => handleValueChange(value)}
    />
  );
}

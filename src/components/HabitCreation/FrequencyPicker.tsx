import { useState } from "react";
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
}: {
  onChange: (value: string) => void;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue || "1");
  const { classes } = useStyles();

  const handleValueChange = (value: string) => {
    setValue(value);
    onChange(value);
  };

  return (
    <SegmentedControl
      radius="xl"
      size="sm"
      value={value}
      data={[
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
        { label: "5", value: "5" },
        { label: "6", value: "6" },
        { label: "7", value: "7" },
      ]}
      classNames={classes}
      onChange={(value) => handleValueChange(value)}
    />
  );
}

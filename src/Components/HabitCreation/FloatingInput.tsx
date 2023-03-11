"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { TextInput, createStyles, rem } from "@mantine/core";

const useStyles = createStyles(
  (
    theme,
    {
      floating,
      carrot,
      emoji,
    }: { floating: boolean; carrot: boolean; emoji: boolean }
  ) => ({
    root: {
      position: "relative",
    },

    label: {
      position: "absolute",
      zIndex: 2,
      top: rem(7),
      left: theme.spacing.sm,
      pointerEvents: "none",
      color: floating
        ? theme.colorScheme === "dark"
          ? theme.white
          : theme.black
        : theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[5],
      transition:
        "transform 150ms ease, color 150ms ease, font-size 150ms ease",
      transform: floating
        ? `translate(-${theme.spacing.sm}, ${rem(-28)})`
        : "none",
      fontSize: floating ? theme.fontSizes.xs : theme.fontSizes.sm,
      fontWeight: floating ? 500 : 400,
    },

    required: {
      transition: "opacity 150ms ease",
      opacity: floating ? 1 : 0,
    },

    input: {
      "&::placeholder": {
        transition: "color 150ms ease",
        color: !floating ? "transparent" : "black",
        opacity: !floating ? 0 : 0.2,
      },
      caretColor: carrot ? "transparent" : "black",
      width: emoji ? "64px" : "100%",
      height: emoji ? "64px" : "100%",
    },
  })
);

export const FloatingLabelInput = ({
  onChange,
  value,
  label,
  placeholder,
  emoji = false,
  onFocus,
  buttonRef,
}: {
  onChange: Dispatch<SetStateAction<string>>;
  value: string;
  label: string;
  placeholder: string;
  emoji?: boolean;
  onFocus?: (arg0: boolean) => void;
  buttonRef?: RefObject<HTMLButtonElement>;
}) => {
  const [focused, setFocused] = useState(false);

  const { classes } = useStyles({
    floating: value.trim().length !== 0 || focused,
    carrot: emoji && value.length > 0,
    emoji,
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // If the click was inside the button, don't blur
      if (
        buttonRef?.current?.children &&
        buttonRef.current.contains(e.target as Node)
      ) {
        return;
      }
      setFocused(false);
      onFocus && onFocus(false);
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [buttonRef, onFocus]);

  const handleFocus = () => {
    setFocused(true);
    onFocus && onFocus(true);
  };

  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      // required
      classNames={classes}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      onFocus={handleFocus}
      // onBlur={handleBlur}
      mt="md"
      autoComplete="nope"
    />
  );
};

"use client";

import type { RefObject, ChangeEventHandler } from "react";
import { useState, useEffect } from "react";

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
      width: floating ? "200px" : "100%",
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
      width: emoji ? "66px" : "100%",
      height: emoji ? "66px" : "100%",
      fontSize: emoji ? "4rem" : "1rem",
      padding: emoji ? "0" : "0 0 0 0.5rem",
    },
  })
);

export interface FloatingInputProps {
  buttonRef?: RefObject<HTMLButtonElement>;
  value: string;
  label: string;
  placeholder: string;
  emoji?: boolean;
  float: boolean;

  onChange: ChangeEventHandler<HTMLInputElement>;
  onInputFocus: (b?: boolean) => void;
  onBlur?: () => void;
}

export const FloatingLabelInput: React.FC<FloatingInputProps> = ({
  buttonRef,
  value,
  label,
  placeholder,
  emoji = false,
  float,
  onChange,
  onInputFocus,
  onBlur,
}) => {
  const [focused, setFocused] = useState(false);

  const { classes } = useStyles({
    floating: float || value.trim().length !== 0 || focused,
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
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [buttonRef, onBlur]);

  const handleFocus = () => {
    setFocused(true);
    onInputFocus();
  };

  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      classNames={classes}
      value={value}
      onChange={onChange}
      onFocus={handleFocus}
      mt="md"
      autoComplete="nope"
    />
  );
};

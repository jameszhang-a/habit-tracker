"use client";

import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import { useState } from "react";

import { Popover, Text, Button, createStyles } from "@mantine/core";

import { FloatingLabelInput } from "./FloatingInput";
import { FrequencyPicker } from "./FrequencyPicker";

interface HabitCreationProps {
  children?: React.ReactNode;
}

const HabitCreation: React.FC<HabitCreationProps> = () => {
  const [habitForm, setHabitForm] = useState("");
  const [emojiForm, setEmojiForm] = useState("");
  const [frequency, setFrequency] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(habitForm, emojiForm, frequency);
  };

  return (
    <div className="flex h-[300px] w-[500px] flex-col items-center rounded-lg border bg-white font-body backdrop-blur">
      <div className="text-h1">Create a Habit!</div>
      <div>
        <form
          className="flex flex-col items-center justify-center gap-4"
          onSubmit={handleSubmit}
        >
          <FloatingLabelInput
            value={habitForm}
            onChange={setHabitForm}
            label={"Give it a name"}
            placeholder={"Working out"}
          />

          <EmojiPicker value={emojiForm} onChange={setEmojiForm} />
          <div>
            Times per week?
            <FrequencyPicker value={frequency} onChange={setFrequency} />
          </div>
          <button type="submit">create</button>
        </form>
      </div>
    </div>
  );
};

export default HabitCreation;

const EmojiPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
}) => {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative pr-5">
      <FloatingLabelInput
        value={value}
        onChange={onChange}
        label={"Pick an emoji"}
        placeholder={"🏋️‍♀️"}
        onFocus={(b: boolean) => setFocused(b)}
        buttonRef={ref}
      />

      {true && (
        <Popover width={100} position="right" withArrow shadow="md">
          <Popover.Target>
            <Button
              ref={ref}
              compact
              styles={() => ({
                root: {
                  position: "absolute",
                  bottom: "0",
                  left: "100%",
                  borderRadius: "10px",
                  backgroundImage:
                    "linear-gradient(to right, #fbc2eb 0%, #a6c1ee 100%)",
                  transition: "all 0.3s ease",
                  display: focused ? "block" : "none",
                },
              })}
            >
              pssst..
            </Button>
          </Popover.Target>

          <Popover.Dropdown>
            <Text size="sm">heyo</Text>
          </Popover.Dropdown>
        </Popover>
      )}
    </div>
  );
};

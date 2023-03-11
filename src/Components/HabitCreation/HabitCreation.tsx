import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import { useState } from "react";

import { Popover, Button, Tooltip } from "@mantine/core";

import { FloatingLabelInput } from "./FloatingInput";
import { FrequencyPicker } from "./FrequencyPicker";
import type { OS } from "@mantine/hooks";
import { useOs } from "@mantine/hooks";

import { api } from "~/utils/api";
import type { ZodError } from "zod";
import { z } from "zod";

interface HabitCreationProps {
  children?: React.ReactNode;
}

const habitAPI = api.habit;

const HabitData = z.object({
  name: z.string().min(1, { message: "Please enter a name" }),
  emoji: z
    .string()
    .regex(/\p{Emoji}/gu, { message: "Please enter a valid emoji" }),
  frequency: z.number().min(1).max(7),
});

const HabitCreation: React.FC<HabitCreationProps> = () => {
  const [habitForm, setHabitForm] = useState("");
  const [emojiForm, setEmojiForm] = useState("");
  const [frequency, setFrequency] = useState("1");
  const [nameError, setNameError] = useState("");
  const [emojiError, setEmojiError] = useState("");

  const { createHabit } = habitAPI;

  const habitCreation = createHabit.useMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsed = HabitData.safeParse({
      name: habitForm,
      emoji: emojiForm,
      frequency: parseInt(frequency),
    });

    if (parsed.success) {
      habitCreation.mutate(parsed.data);
      setHabitForm("");
      setEmojiForm("");
      setFrequency("1");
    } else {
      for (const e of parsed.error.issues) {
        if (e.path[0] === "name") {
          setNameError(e.message);
        } else if (e.path[0] === "emoji") {
          setEmojiError(e.message);
        }
      }
    }
  };

  return (
    <div className="flex w-[500px] flex-col items-center rounded-lg border bg-white font-body backdrop-blur">
      <div className="text-h1">Create a Habit!</div>
      <div>
        <form
          className="flex flex-col items-center justify-center gap-4"
          onSubmit={handleSubmit}
        >
          <Tooltip
            label={nameError}
            color="orange"
            position="right"
            withArrow
            opened={!!nameError}
          >
            <div>
              <FloatingLabelInput
                value={habitForm}
                onChange={setHabitForm}
                label={"Give it a name"}
                placeholder={"Working out"}
                onFocus={() => setNameError("")}
              />
            </div>
          </Tooltip>

          <Tooltip
            label={emojiError}
            color="orange"
            position="right"
            withArrow
            opened={!!emojiError}
          >
            <div>
              <EmojiPicker
                value={emojiForm}
                onChange={setEmojiForm}
                onFocus={() => setEmojiError("")}
              />
            </div>
          </Tooltip>

          <div className="my-4">
            <div>Times per week?</div>
            <FrequencyPicker onChange={setFrequency} />
          </div>
          <button type="submit">create</button>
        </form>
      </div>
    </div>
  );
};

export default HabitCreation;

const tipMessage = (os: OS) => {
  switch (os) {
    case "macos":
      return "⌘ + ctrl + space";
    case "windows":
      return "win + . (period)";
    case "linux":
      return "ctrl + . (period)";
  }
};

const EmojiPicker = ({
  value,
  onChange,
  onFocus,
}: {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
  onFocus: () => void;
}) => {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const os = useOs();

  const handleFocus = (b: boolean) => {
    onFocus();
    setFocused(b);
  };

  return (
    <div className="relative">
      <FloatingLabelInput
        value={value}
        onChange={onChange}
        label={"Pick an emoji"}
        placeholder={"🏋️‍♀️"}
        onFocus={handleFocus}
        buttonRef={ref}
        emoji
      />

      <Popover width={200} position="right" withArrow shadow="md">
        <Popover.Target>
          <Button
            ref={ref}
            compact
            styles={() => ({
              root: {
                position: "absolute",
                bottom: "0",
                left: "110%",
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
          <div className="text-xs font-bold leading-6">
            open emoji picker with{" "}
            <div className="w-fit rounded-lg border-b-2 border-blue-400 bg-blue-200 px-1">
              {tipMessage(os)}
            </div>
          </div>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};

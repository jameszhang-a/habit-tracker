import type { ChangeEvent, ChangeEventHandler } from "react";
import { useState, useRef } from "react";

import { Popover, Button, Tooltip } from "@mantine/core";
import type { OS } from "@mantine/hooks";
import { useOs } from "@mantine/hooks";
import { z } from "zod";

import { FloatingLabelInput } from "./FloatingInput";
import { FrequencyPicker } from "./FrequencyPicker";

import { api } from "~/utils/api";
import { emojiLength } from "~/utils";

interface HabitCreationProps {
  children?: React.ReactNode;
  onClose: (b: boolean) => void;
}

const habitAPI = api.habit;

const HabitData = z.object({
  name: z.string().min(1, { message: "Please enter a name" }),
  emoji: z
    .string()
    .regex(
      /\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu,
      { message: "Please enter a valid emoji" }
    ),
  frequency: z.number().min(1).max(7),
});

const HabitCreation: React.FC<HabitCreationProps> = ({ onClose }) => {
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
      onClose(true);
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

  const handleEmojiChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);

    if (emojiLength(e.target.value) > 1) {
      setEmojiForm(e.target.value.replace(emojiForm, ""));
    } else {
      setEmojiForm(e.target.value);
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setHabitForm(e.target.value);
  };

  return (
    <div
      className={`flex w-[500px] flex-col items-center rounded-lg bg-white font-body backdrop-blur`}
    >
      <div className="text-h1">Create a Habit!</div>
      <form
        className="flex w-full flex-col items-center justify-center gap-6"
        onSubmit={handleSubmit}
      >
        <div>
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
                onChange={handleNameChange}
                label={"Give it a name"}
                placeholder={"Working out"}
                onFocus={() => setNameError("")}
              />
            </div>
          </Tooltip>
        </div>

        <div>
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
                onChange={handleEmojiChange}
                onFocus={() => setEmojiError("")}
              />
            </div>
          </Tooltip>
        </div>

        <div className="">
          <div>Times per week?</div>
          <FrequencyPicker onChange={setFrequency} />
        </div>

        <div className="min-w-full gap-1 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold capitalize text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
          >
            create
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold capitalize text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          >
            cancel
          </button>
        </div>
      </form>
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
  onChange: ChangeEventHandler<HTMLInputElement>;
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

      <Popover width={200} position="bottom" withArrow shadow="md">
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

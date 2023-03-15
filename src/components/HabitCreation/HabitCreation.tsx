import { useState, useRef, useContext } from "react";

import { Popover, Button, Tooltip } from "@mantine/core";
import { useOs } from "@mantine/hooks";
import { z } from "zod";

import type { FloatingInputProps } from "./FloatingInput";
import { FloatingLabelInput } from "./FloatingInput";
import { FrequencyPicker } from "./FrequencyPicker";
import { emojiLength } from "~/utils";
import HabitDataContext from "~/context/HabitDataContext";

import type { ChangeEvent } from "react";
import type { Habit } from "../Habit";
import type { OS } from "@mantine/hooks";

interface HabitCreationProps {
  children?: React.ReactNode;
  onClose: (b: boolean) => void;
  edit?: boolean;
  habit?: Habit;
}

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

const HabitCreation: React.FC<HabitCreationProps> = ({
  onClose,
  edit = false,
  habit,
}) => {
  const [habitForm, setHabitForm] = useState("");
  const [emojiForm, setEmojiForm] = useState("");
  const [frequency, setFrequency] = useState("1");
  const [nameError, setNameError] = useState("");
  const [emojiError, setEmojiError] = useState("");

  const ctx = useContext(HabitDataContext);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let nameData = habitForm;
    let emojiData = emojiForm;

    // make it so that if the user doesn't change the habit name or emoji,
    // it will use the habit's current name and emoji
    if (edit && habit) {
      if (habitForm === "") {
        nameData = habit.name;
      }
      if (emojiForm === "") {
        emojiData = habit.emoji;
      }
    }

    const parsed = HabitData.safeParse({
      name: nameData,
      emoji: emojiData,
      frequency: parseInt(frequency),
    });

    if (parsed.success) {
      ctx?.handleHabitCreation({
        ...parsed.data,
        habitId: habit ? habit.id : "1",
      });

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

  /**
   * can't have more than one emoji
   * @param e
   */
  const handleEmojiChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (emojiLength(e.target.value) > 1) {
      setEmojiForm(e.target.value.replace(emojiForm, ""));
    } else {
      setEmojiForm(e.target.value);
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setHabitForm(e.target.value);
  };

  const handleNameFocus = () => {
    setNameError("");
    console.log("clear name error");
  };

  const handleEmojiFocus = () => {
    setEmojiError("");
  };

  return (
    <div
      className={`flex w-[500px] flex-col items-center rounded-lg bg-white font-body backdrop-blur`}
    >
      {edit ? (
        <div className="mb-3 text-2xl">Editing: {habit?.name}</div>
      ) : (
        <div className="text-h1">Create a Habit!</div>
      )}
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
                label={`Give it a ${edit ? "new" : ""} name`}
                placeholder={edit && habit ? habit.name : "Working out"}
                float={edit}
                onInputFocus={handleNameFocus}
                onChange={handleNameChange}
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
                label={`${edit ? "Update" : "Pick an"} emoji`}
                placeholder={edit && habit ? habit.emoji : "🏋️"}
                float={edit}
                onInputFocus={handleEmojiFocus}
                onChange={handleEmojiChange}
              />
            </div>
          </Tooltip>
        </div>

        <div className="">
          <div>Times per week?</div>
          <FrequencyPicker
            onChange={setFrequency}
            defaultValue={edit && habit ? habit.frequency.toString() : "1"}
          />
        </div>

        <div className="min-w-full gap-2 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          {edit ? (
            <button
              type="submit"
              // className="inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold capitalize text-white shadow-sm hover:bg-violet-700 sm:ml-3 sm:w-auto"
              className="btn-primary"
            >
              Save
            </button>
          ) : (
            <button
              type="submit"
              // className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold capitalize text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
              className="btn-primary"
            >
              done
            </button>
          )}
          <button
            type="button"
            onClick={() => onClose(false)}
            // className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold capitalize text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            className="btn-secondary"
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

const EmojiPicker: React.FC<FloatingInputProps> = ({
  value,
  placeholder,
  label,
  float,
  onChange,
  onInputFocus,
  onBlur,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const ref = useRef<HTMLButtonElement>(null);
  const os = useOs();

  const handleFocus = () => {
    onInputFocus();
    setShowTooltip(true);
  };

  return (
    <div className="relative">
      <FloatingLabelInput
        value={value}
        label={label}
        placeholder={placeholder}
        buttonRef={ref}
        emoji
        float={float}
        onInputFocus={handleFocus}
        onChange={onChange}
        onBlur={onBlur}
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
                display: showTooltip ? "block" : "none",
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

import { useState, useRef, useMemo } from "react";

import { Popover, Button, Tooltip } from "@mantine/core";
import { useOs } from "@mantine/hooks";
import { z } from "zod";

import type { FloatingInputProps } from "./FloatingInput";
import { FloatingLabelInput } from "./FloatingInput";
import { FrequencyPicker } from "./FrequencyPicker";
import { emojiLength } from "@/utils";
import { useHabitDataContext } from "@/context/HabitDataContext";

import type { ChangeEvent } from "react";
import type { Habit } from "@/types";
import type { OS } from "@mantine/hooks";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

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
  inversedGoal: z.boolean(),
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
  const [goalType, setGoalType] = useState<"atLeast" | "atMost">("atLeast");

  const ctx = useHabitDataContext();

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
      inversedGoal: goalType === "atMost",
    });

    if (parsed.success) {
      ctx.handleHabitCreation({
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
  };

  const handleEmojiFocus = () => {
    setEmojiError("");
  };

  const atLeastHint = useMemo(
    () =>
      `You aim to complete this goal at least ${frequency} time${
        parseInt(frequency) > 1 ? "s" : ""
      } a week`,
    [frequency]
  );

  const atMostHint = useMemo(
    () =>
      `You aim to complete this goal ${frequency} time${
        parseInt(frequency) === 1 ? "" : "s"
      } or less a week`,
    [frequency]
  );

  return (
    <div
      className={`font-body flex w-[80vw] flex-col items-center overflow-clip rounded-lg bg-white backdrop-blur sm:w-[500px]`}
    >
      {edit ? (
        <div className="mb-4 text-3xl">
          Editing:{" "}
          <span className="underline underline-offset-4">{habit?.name}</span>
        </div>
      ) : (
        <div className="mb-4 text-3xl">Create a Habit!</div>
      )}
      <form
        className="flex w-full flex-col items-center justify-center"
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

        <div className="mt-4">
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

        {/* GOAL setting */}
        <div className="mt-8 flex flex-col gap-2 transition-all">
          <div>Goal type?</div>
          <RadioGroup defaultValue="atLeast">
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="atLeast"
                id="r1"
                checked={goalType === "atLeast"}
                onClick={() => setGoalType("atLeast")}
              />
              <Label htmlFor="r1">At least</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="atMost"
                id="r2"
                checked={goalType === "atMost"}
                onClick={() => setGoalType("atMost")}
              />
              <Label htmlFor="r2">At most</Label>
            </div>
          </RadioGroup>
          <FrequencyPicker
            onChange={setFrequency}
            defaultValue={
              edit && habit
                ? habit.frequency.toString()
                : goalType === "atLeast"
                ? "1"
                : "0"
            }
            startAtZero={goalType === "atMost"}
          />
        </div>
        <div className="font-mono mb-6 mt-3 w-[80%] text-xs font-medium text-slate-500">
          {goalType === "atLeast" ? atLeastHint : atMostHint}
        </div>

        <div className="flex min-w-full flex-row-reverse gap-2 px-4 py-3 sm:px-6">
          {edit ? (
            <button type="submit" className="btn-primary">
              save
            </button>
          ) : (
            <button type="submit" className="btn-primary">
              done
            </button>
          )}
          <button
            type="button"
            onClick={() => onClose(false)}
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

const isMobile = (os: OS) => {
  return os === "ios" || os === "android";
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

      {!isMobile(os) && (
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
      )}
    </div>
  );
};

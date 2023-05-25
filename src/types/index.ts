import type { RouterOutputs } from "~/utils/api";

type Habit = RouterOutputs["habit"]["getHabits"][number];
type Habits = Habit[];

type NotionAuthRes = {
  access_token: string;
  bot_id: string;
  duplicated_template_id?: string | null;
  owner: {
    type?: string;
    user: User;
  };
  workspace_icon?: string;
  workspace_id: string;
  workspace_name: string;
};

type User = {
  object: string;
  id: string;
  type: string;
  name: string;
  avatar_url: string;
  person: {
    email: string;
  };
};

type TableRow = {
  id: string;
  icon?: string;
  name?: string;
  properties: number;
  habits?: string[];
  edited: Date;
};

export type { Habit, Habits, NotionAuthRes, TableRow };

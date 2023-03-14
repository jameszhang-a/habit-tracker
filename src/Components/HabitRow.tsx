import { useContext, useState } from "react";
import {
  EllipsisHorizontalIcon,
  Cog6ToothIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { createStyles, Menu, Modal } from "@mantine/core";

import { HabitDataContext } from "~/pages/dashboard/HabitDataContext";
import type { Habit } from "./Habit";
import HabitCreation from "./HabitCreation/HabitCreation";

interface HabitRowProps {
  children?: React.ReactNode;
  habit: Habit;
}

const HabitRow: React.FC<HabitRowProps> = ({ habit }) => {
  const [showModal, setShowModal] = useState(false);
  const ctx = useContext(HabitDataContext);

  const { classes } = useStyles();

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div key={habit.id} className="flex justify-between pt-4">
      <div>{habit.name}</div>

      <Menu shadow="md" width={125}>
        <Menu.Target>
          <div>
            <EllipsisHorizontalIcon className="h-6 w-6 cursor-pointer rounded-l hover:border hover:border-slate-200 hover:bg-[#f4f5f6]/60 hover:shadow-inner" />
          </div>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>{habit.name}</Menu.Label>
          <Menu.Item
            icon={<Cog6ToothIcon className="h-5 w-5" />}
            onClick={() => setShowModal(true)}
          >
            Edit
          </Menu.Item>

          <Menu.Item
            color="red"
            icon={<TrashIcon className="h-5 w-5" />}
            onClick={() => ctx?.handleDelete(habit.id)}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal
        opened={showModal}
        onClose={() => setShowModal(false)}
        size={"auto"}
        overlayProps={{
          color: "rgb(148 163 184)",
          opacity: 0.55,
          blur: 3,
        }}
        transitionProps={{ transition: "slide-up" }}
        withCloseButton={false}
        classNames={classes}
      >
        <HabitCreation onClose={handleModalClose} edit habit={habit} />
      </Modal>
    </div>
  );
};

export default HabitRow;

const useStyles = createStyles(() => ({
  content: {
    borderRadius: 20,
  },
}));

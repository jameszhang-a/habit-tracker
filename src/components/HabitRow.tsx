import { useState } from "react";
import {
  EllipsisHorizontalIcon,
  Cog6ToothIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { createStyles, Menu, Modal } from "@mantine/core";

import { useHabitDataContext } from "~/context/HabitDataContext";
import HabitCreation from "./HabitCreation/HabitCreation";

import type { Habit } from "~/types";

interface HabitRowProps {
  children?: React.ReactNode;
  habit: Habit;
}

const HabitRow: React.FC<HabitRowProps> = ({ habit }) => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const ctx = useHabitDataContext();

  const { classes } = useStyles();

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleConfirmDelete = (id: string) => {
    ctx.handleDelete(id);
    setShowDeleteModal(false);
  };

  return (
    <div key={habit.id} className="flex w-full justify-between py-2 px-2">
      <div className="flex gap-3">
        <div>{habit.emoji}</div>
        <div>{habit.name}</div>
      </div>

      <Menu shadow="md" width={125}>
        <Menu.Target>
          <div>
            <EllipsisHorizontalIcon className="h-6 w-6 cursor-pointer rounded-l hover:border hover:border-slate-200 hover:bg-[#f4f5f6]/60 hover:shadow-inner" />
          </div>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>{habit.name}</Menu.Label>
          <Menu.Item
            icon={<Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
            onClick={() => setShowModal(true)}
          >
            Edit
          </Menu.Item>

          <Menu.Item
            color="red"
            icon={<TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
            onClick={() => setShowDeleteModal(true)}
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

      <Modal
        opened={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size={"auto"}
        transitionProps={{ transition: "pop" }}
        withCloseButton={false}
        classNames={classes}
        centered
      >
        <div className="flex w-[250px] flex-col gap-4">
          <div className="text-center">
            you sure?? This action{" "}
            <span className="font-bold underline underline-offset-2">
              cannot
            </span>{" "}
            be undone, and you will lose{" "}
            <span className="font-bold underline underline-offset-2">all</span>{" "}
            data associated with this habit.
          </div>
          <div className="flex justify-around">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              cancel
            </button>
            <button
              type="submit"
              className="btn-danger"
              onClick={() => handleConfirmDelete(habit.id)}
            >
              delete
            </button>
          </div>
        </div>
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

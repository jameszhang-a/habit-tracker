import { useEffect, useState } from "react";
import Link from "next/link";

import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { Popover } from "@mantine/core";

const WidgetLink = ({ to, uid }: { to: string; uid: string }) => {
  const baseURL =
    process.env.NODE_ENV === "production"
      ? !process.env.NEXT_PUBLIC_URL
        ? ""
        : `${process.env.NEXT_PUBLIC_URL}`
      : "http://localhost:3000";

  const url = `${baseURL}/${to}/${uid}`;

  return (
    <div className="flex items-center justify-between rounded border p-1 shadow-sm">
      <div className="capitalize">{to}</div>

      <div className="flex flex-row items-center justify-between">
        <div className="ml-5 flex flex-row gap-2">
          <Link
            href={url}
            className="hover:animate-gradient-fast mr-1 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 px-4 py-1 text-center text-sm font-bold text-white drop-shadow-lg hover:drop-shadow-none focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            visit
          </Link>

          <CopyToClipboard url={url} />
        </div>
      </div>
    </div>
  );
};

export default WidgetLink;

const CopyToClipboard = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 750);

      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);

    setCopied(true);
  };

  return (
    <Popover
      opened={copied}
      width={55}
      position="top"
      withArrow
      shadow="md"
      transitionProps={{
        transition: "pop",
        timingFunction: "cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      <Popover.Target>
        <button
          className="drop-shadow-l h-fit rounded-lg border border-slate-200 p-1 shadow shadow-orange-600/40 transition-all hover:scale-105 active:scale-100 active:shadow-inner active:drop-shadow-none"
          onClick={() => void copyToClipboard()}
        >
          <ClipboardDocumentIcon className="w-5" />
        </button>
      </Popover.Target>
      <Popover.Dropdown
        style={{
          padding: 2,
        }}
      >
        <div className="w-[70px] text-xs">copied!</div>
      </Popover.Dropdown>
    </Popover>
  );
};

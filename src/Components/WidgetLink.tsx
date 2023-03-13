import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyIcon } from "@radix-ui/react-icons";

const WidgetLink = ({ to, uid }: { to: string; uid: string }) => {
  const baseURL =
    process.env.NODE_ENV === "production"
      ? !process.env.NEXT_PUBLIC_URL
        ? ""
        : `${process.env.NEXT_PUBLIC_URL}`
      : "http://localhost:3000";

  const url = `${baseURL}/${to}/${uid}`;

  return (
    <div className="flex items-center justify-between border border-green-700">
      <div className="font-bold capitalize">{to}</div>

      <div className="flex flex-row items-center justify-between">
        <div className="ml-5 flex flex-row gap-2">
          <Link
            href={url}
            className="mr-1 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 px-4 py-1 text-center text-sm font-medium text-white drop-shadow-lg transition-all hover:bg-gradient-to-bl hover:drop-shadow-none focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
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
    <button
      className="drop-shadow-l h-fit rounded-lg bg-slate-700 p-2 shadow-lg shadow-orange-600/40 transition-all hover:border-slate-700 hover:bg-slate-600 hover:shadow-none hover:drop-shadow-none"
      onClick={() => void copyToClipboard()}
    >
      <CopyIcon color="orange"></CopyIcon>
    </button>
  );
};

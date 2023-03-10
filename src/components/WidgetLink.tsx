import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

const WidgetLink = ({ to, uid }: { to: string; uid: string }) => {
  const baseURL =
    process.env.NODE_ENV === "production"
      ? !process.env.NEXT_PUBLIC_URL
        ? ""
        : `${process.env.NEXT_PUBLIC_URL}`
      : "http://localhost:3000";

  const url = `${baseURL}/${to}/${uid}`;

  return (
    <div className="flex items-center justify-between rounded border p-1 shadow">
      <div className="font-bold capitalize">{to}</div>

      <div className="flex flex-row items-center justify-between">
        <div className="ml-5 flex flex-row gap-2">
          <Link
            href={url}
            className="hover:animate-gradient-fast mr-1 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 px-4 py-1 text-center text-sm font-medium text-white drop-shadow-lg hover:drop-shadow-none focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
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
      className="drop-shadow-l h-fit rounded-lg border border-slate-200 p-1 shadow shadow-orange-600/40 transition-all hover:shadow-inner hover:drop-shadow-none"
      onClick={() => void copyToClipboard()}
    >
      <ClipboardDocumentIcon className="w-5"></ClipboardDocumentIcon>
    </button>
  );
};

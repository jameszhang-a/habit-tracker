import Link from "next/link";
import { useEffect, useState } from "react";

const WidgetLink = ({ to, uid }: { to: string; uid: string }) => {
  const baseURL =
    process.env.NODE_ENV === "production"
      ? !process.env.VERCEL_URL
        ? ""
        : `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const url = `${baseURL}/${to}/${uid}`;

  return (
    <div className="flex flex-row items-center justify-between pb-4">
      {url}

      <div className="ml-5 flex flex-row gap-2">
        <Link href={url}>
          <button className="inline-block rounded bg-blue-400 px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-blue-500 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-blue-500 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-blue-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]">
            visit
          </button>
        </Link>

        <CopyToClipboard text={url} />
      </div>
    </div>
  );
};

export default WidgetLink;

const CopyToClipboard = ({ text }: { text: string }) => {
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
    await navigator.clipboard
      .writeText(text)
      .then()
      .catch((err) => {
        console.error(err);
      });
    setCopied(true);
  };

  return (
    <button
      className="inline-block rounded bg-teal-400 px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-teal-500 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-teal-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-teal-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
      onClick={() => void copyToClipboard()}
    >
      {copied ? "copied!" : "copy"}
    </button>
  );
};

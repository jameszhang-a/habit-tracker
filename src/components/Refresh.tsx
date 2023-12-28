import { useRouter } from "next/router";

import { ArrowPathIcon } from "@heroicons/react/24/outline";

const RefreshButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.reload()}
      className="absolute bottom-3 right-3 rounded-md border border-input bg-background/[.4] p-1 align-middle transition duration-200 ease-in-out hover:bg-accent hover:text-accent-foreground"
    >
      <ArrowPathIcon className="h-4 w-4 place-self-center" />
    </button>
  );
};

export default RefreshButton;

import { useRouter } from "next/router";
import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const RefreshButton = () => {
  const [hover, setHover] = useState(false);
  const router = useRouter();

  return (
    <button
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => router.reload()}
      className="absolute bottom-3 right-5 rounded-md text-lg font-bold text-white transition duration-200 ease-in-out"
    >
      <ArrowPathIcon
        color={`${
          hover ? "rgba(37, 39, 46, 0.5)" : "rgba(149, 147, 217, 0.1)"
        }`}
        style={{ transition: "all .15s ease" }}
        height="25px"
        width="25px"
      />
    </button>
  );
};

export default RefreshButton;

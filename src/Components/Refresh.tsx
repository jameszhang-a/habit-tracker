import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/router";

import { RefreshCircleOutline } from "react-ionicons";

const RefreshButton = ({
  trigger,
}: {
  trigger: Dispatch<SetStateAction<boolean>>;
}) => {
  const [hover, setHover] = useState(false);
  const router = useRouter();

  return (
    <button
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => trigger((prev) => !prev)}
      className="absolute bottom-3 right-5 rounded-md text-lg font-bold text-white shadow-lg transition duration-200 ease-in-out hover:shadow-xl"
    >
      <RefreshCircleOutline
        color={`${
          hover ? "rgba(149, 147, 217, 1)" : "rgba(149, 147, 217, 0.1)"
        }`}
        height="25px"
        width="25px"
        rotate={hover}
      />
    </button>
  );
};

export default RefreshButton;

import { useEffect, useRef } from "react";
import { default as c } from "classnames";
import { useLottie } from "lottie-react";
import checkAnimation from "../../public/check_mark_json.json";

interface CheckMarkProps {
  children?: React.ReactNode;
  className: string;
  id: string;
  onCheck?: () => void;
  checked: boolean;
}

const CheckMark: React.FC<CheckMarkProps> = ({
  className,
  id,
  onCheck,
  checked,
}) => {
  const { current: inputId } = useRef(`check-${id}`);
  const ranOnceRef = useRef(false);

  const {
    View: CheckAnimation,
    stop,
    goToAndStop,
    goToAndPlay,
  } = useLottie(
    { animationData: checkAnimation, autoplay: checked, loop: false },
    { height: 90, width: 90, display: "block", background: "none" }
  );

  useEffect(() => {
    if (ranOnceRef.current) return;

    if (checked) {
      goToAndPlay(17, true);
      ranOnceRef.current = true;
    } else {
      stop();
    }
  }, [goToAndStop, checked, stop, goToAndPlay]);

  const handleClick = () => {
    console.log("clicked");
    if (checked) {
      stop();
    } else {
      goToAndPlay(17, true);
    }
    onCheck && onCheck();
  };

  return (
    <div className={c("relative flex border-green-400", className)}>
      <input
        id={inputId}
        type="checkbox"
        onChange={handleClick}
        checked={checked}
        className="absolute hidden"
      />
      <label
        htmlFor={inputId}
        className={c(
          "z-50 h-8 w-8 cursor-pointer rounded-full border-blue-600 outline outline-green-200",
          { "bg-white": !checked }
        )}
      />
      <div className="absolute z-0 -translate-x-[29px] -translate-y-[29px]">
        {CheckAnimation}
      </div>
    </div>
  );
};

export default CheckMark;

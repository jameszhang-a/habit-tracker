interface TrackerBackgroundProps {
  children?: React.ReactNode;
  theme: string;
}

const defaultClass =
  "relative flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gradient-to-br px-4 py-4 shadow backdrop-blur max-h-[300px]";

const TrackerBackground: React.FC<TrackerBackgroundProps> = ({
  theme,
  children,
}) => {
  switch (theme) {
    case "white":
      return (
        <div className={`${defaultClass} from-white to-gray-200`}>
          {children}
        </div>
      );
    case "sky":
      return (
        <div
          className={`${defaultClass} border-2 border-white from-sky-100 to-blue-200`}
        >
          {children}
        </div>
      );
    default:
      return (
        <div className={`${defaultClass} from-pink-300 to-blue-900`}>
          {children}
        </div>
      );
  }
};

export default TrackerBackground;

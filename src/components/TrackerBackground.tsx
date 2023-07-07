interface TrackerBackgroundProps {
  children?: React.ReactNode;
  theme: string;
}

const defaultClass =
  "relative flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-gradient-to-br px-4 py-4 shadow-xl backdrop-blur xs:h-[250px] xs:w-[550px]";

const TrackerBackground: React.FC<TrackerBackgroundProps> = ({
  theme,
  children,
}) => {
  console.log("background");

  switch (theme) {
    case "white":
      return (
        <div className={`${defaultClass} from-white to-gray-200`}>
          {children}
        </div>
      );
    case "sky":
      return <div className={`${defaultClass} bg-white`}>{children}</div>;
    default:
      return (
        <div className={`${defaultClass} from-pink-300 to-blue-900`}>
          {children}
        </div>
      );
  }
};

export default TrackerBackground;

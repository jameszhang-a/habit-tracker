import Gradient from "./Gradient";

const HabitLoading = () => {
  const hoverEffect =
    "hover:scale-110 transition ease-in-out delay-50 duration-150";

  return (
    <div
      className={`${hoverEffect} relative grid h-[100px] w-[150px] overflow-hidden rounded-2xl border-2 border-gray-100/40 p-3 pl-4 shadow-lg`}
    >
      {/* <Gradient /> */}
      <div className="flex space-x-4 pr-1 pt-2">
        <div className="flex-1 space-y-6 py-1">
          <div className="grid grid-cols-3 space-y-1">
            <div className="col-span-2 h-2 animate-pulse rounded bg-slate-700/50"></div>
            <div className="col-span-2"></div>
            <div className="col-span-2 h-2 animate-pulse rounded bg-slate-700/50 animation-delay-250"></div>
          </div>
          <div className="h-2 animate-pulse rounded bg-slate-700/50 animation-delay-500"></div>
        </div>
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-700/50 animation-delay-250"></div>
      </div>
    </div>
  );
};

export default HabitLoading;

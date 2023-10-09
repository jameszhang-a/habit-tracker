import { type NextPage } from "next";

import Link from "next/link";
import HeadWrapper from "@/components/HeadWrapper";

const Home: NextPage = () => {
  return (
    <HeadWrapper>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-400 to-cyan-400">
        <div className="flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Habit{" "}
            <span className="animate-gradient-x bg-gradient-to-br from-fuchsia-400 to-violet-600 bg-clip-text text-transparent">
              Genie
            </span>
            🧞
          </h1>
          <div className="grid">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="/dashboard"
            >
              <h3 className="text-2xl font-bold">Dashboard →</h3>
              <div className="text-lg">Start tracking your habits</div>
            </Link>
          </div>
        </div>
      </div>
    </HeadWrapper>
  );
};

export default Home;

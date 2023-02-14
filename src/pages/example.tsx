import React from "react";

type Props = {};

const Page = (props: Props) => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div>Example page</div>

      <div className="flex flex-col">
        <div className="flex flex-row">habit 1</div>
        <div className="flex flex-row">habit 2</div>
        <div className="flex flex-row">habit 3</div>
      </div>
    </div>
  );
};

export default Page;

import React from "react";

type Props = {
  when: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

const Show = ({ when, children, fallback }: Props) => {
  return <>{when ? <>{children}</> : <>{fallback}</>}</>;
};

export default Show;

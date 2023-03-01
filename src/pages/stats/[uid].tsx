import { type NextPage } from "next";
import { useRouter } from "next/router";

const Stats: NextPage = () => {
  const router = useRouter();
  const { uid } = router.query;

  return (
    <div>
      <div>Stats page</div>
      <div>User id: {uid}</div>
    </div>
  );
};

export default Stats;

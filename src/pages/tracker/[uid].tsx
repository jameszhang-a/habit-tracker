import { type NextPage } from "next";
import { useRouter } from "next/router";

const Tracker: NextPage = () => {
  const router = useRouter();
  const { uid } = router.query;

  return (
    <div>
      <div>Tracker page</div>
      <div>User id: {uid}</div>
    </div>
  );
};

export default Tracker;

import { type NextPage } from "next";
import { useRouter } from "next/router";

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { uid } = router.query;

  return (
    <div>
      <div>Dashboard page</div>
      <div>User id: {uid}</div>
    </div>
  );
};

export default Dashboard;

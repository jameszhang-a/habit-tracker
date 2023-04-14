import { api } from "~/utils/api";
import { useRouter } from "next/router";

const NotionPage = () => {
  const router = useRouter();
  const { code: notionAuthCode } = router.query;

  const { data, error, isLoading } = api.notion.getDB.useQuery({
    code: notionAuthCode as string,
  });
  if (error || isLoading)
    return (
      <a href="https://api.notion.com/v1/oauth/authorize?client_id=3b01cf04-2bb6-4cb0-a5e8-af7844264cfb&response_type=code&owner=user&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fnotion">
        Connect to Notion
      </a>
    );

  console.log("data", data);

  // useEffect(() => {
  //   if (!notionAuthCode) return;

  //   console.log("code", notionAuthCode);
  // }, [getNotionDB, router.query]);

  return <div>notion</div>;
};

export default NotionPage;

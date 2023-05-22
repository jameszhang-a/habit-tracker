import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const NotionPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [notionData, setNotionData] = useState<any>();
  const router = useRouter();
  const { code: notionAuthCode } = router.query;

  const { data, error, isLoading } = api.notion.notionAuth.useQuery(
    {
      tempCode: notionAuthCode as string,
    },
    { enabled: !!notionAuthCode && !notionData }
  );

  useEffect(() => {
    if (data) setNotionData(data);
  }, [data]);

  if (!notionData)
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

  return (
    <div>
      <p>Logged In!</p>
      <div></div>
    </div>
  );
};

export default NotionPage;

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { NotionAuthRes } from "~/types";
import { Loader } from "@mantine/core";
import Image from "next/image";
import { useLocalStorage } from "@mantine/hooks";

const DB = "e8d2aa68171641a0b104d7b7594a5622";

const NotionPage = () => {
  const [notionData, setNotionData] = useState<NotionAuthRes>();
  const [value, setValue, removeValue] = useLocalStorage<
    NotionAuthRes | undefined
  >({
    key: "notion-response",
    defaultValue: undefined,
  });

  const { data: userConnected } = api.notion.getNotionAuthStatus.useQuery();

  const router = useRouter();
  const { code: notionAuthCode } = router.query;

  const { data, error, isLoading } = api.notion.notionAuth.useQuery(
    {
      tempCode: notionAuthCode as string,
    },
    { enabled: !!notionAuthCode && !notionData && !value }
  );

  const { data: dbData } = api.notion.getDB.useQuery(undefined, {
    enabled: userConnected,
  });

  console.log("userConnected", userConnected);
  console.log("dbData", dbData);

  useEffect(() => {
    if (data) {
      setNotionData(data);
      setValue(data);
    }
  }, [data, setValue]);

  // console.log("data", data);
  // console.log("error", error);
  // console.log("isLoading", isLoading);

  if (!!notionAuthCode && isLoading && !value)
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader color="indigo" variant="bars" size={"md"} />
      </div>
    );

  if (value === undefined || value === null)
    return (
      <a href="https://api.notion.com/v1/oauth/authorize?client_id=3b01cf04-2bb6-4cb0-a5e8-af7844264cfb&response_type=code&owner=user&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fnotion">
        Connect to Notion
      </a>
    );
  console.log("value", value);

  console.log("data", data);

  // useEffect(() => {
  //   if (!notionAuthCode) return;

  //   console.log("code", notionAuthCode);
  // }, [getNotionDB, router.query]);

  const handleLogOut = async () => {
    removeValue();
    await router.push("/notion");
  };

  return (
    <div>
      <p>Logged In!</p>
      <button onClick={() => void handleLogOut()}>log out</button>
      <div>
        {value?.owner && (
          <div className="container flex flex-row items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full">
              <Image
                className="h-auto max-w-none"
                src={value?.owner.user.avatar_url}
                alt="User Avatar Image"
                width={40}
                height={100}
              ></Image>
            </div>

            <div>{value?.owner.user.name}</div>
          </div>
        )}

        {dbData?.map((db) => (
          <div key={db.id}>
            <div>{db.title[0]?.plain_text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotionPage;

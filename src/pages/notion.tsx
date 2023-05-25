import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

import { Loader } from "@mantine/core";
import {
  createStyles,
  Table,
  Checkbox,
  ScrollArea,
  Group,
  Text,
  rem,
} from "@mantine/core";

import { env } from "~/env.mjs";
import { api } from "~/utils/api";
import { formatDate } from "~/utils";
import type { TableRow } from "~/types";

const NotionPage = () => {
  const [userConnected, setUserConnected] = useState(false);
  const [dbList, setDbList] = useState<TableRow[]>([]);
  const [selection, setSelection] = useState<string[]>([]);

  const router = useRouter();
  const { code: notionAuthCode } = router.query;

  const { classes, cx } = useStyles();

  const { data: connected } = api.notion.getNotionAuthStatus.useQuery(
    undefined,
    { enabled: !userConnected }
  );

  useEffect(() => {
    setUserConnected(!!connected);
  }, [connected]);

  const {
    data: authData,
    isLoading: authLoading,
    isSuccess: authSuccess,
  } = api.notion.notionAuth.useQuery(
    { tempCode: notionAuthCode as string },
    { enabled: !!notionAuthCode }
  );

  useEffect(() => {
    const reroute = async () => {
      await router.push("/notion");
    };

    if (authSuccess) {
      reroute().catch((err) => console.error(err));
    }
  }, [authSuccess, router]);

  const { data: dbData, isLoading: dbLoading } = api.notion.getDB.useQuery(
    undefined,
    { enabled: !!userConnected && dbList.length < 1 }
  );

  useEffect(() => {
    if (dbData) {
      console.log("dbData", dbData);
      setDbList(dbData);
    }
  }, [dbData]);

  const { data: rowData, refetch } = api.notion.getDBRows.useQuery(
    { dbIds: selection },
    { enabled: false }
  );

  if (rowData && rowData.length > 0) {
    console.log("rowData", rowData);
    // console.log("stringified", JSON.stringify(rowData[0]?.data[0]));
  }

  const notionLogOut = api.notion.logOut.useMutation();

  const handleLogOut = () => {
    notionLogOut.mutate();
    router.reload();
  };

  const toggleRow = (id: string) =>
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const toggleAll = () => {
    if (!dbList) return;

    setSelection((current) =>
      current.length === dbList.length ? [] : dbList.map((item) => item.id)
    );
  };

  const rows = dbList?.map((item) => {
    const selected = selection.includes(item.id);
    return (
      <tr key={item.id} className={cx({ [classes.rowSelected]: selected })}>
        <td>
          <Checkbox
            checked={selection.includes(item.id)}
            onChange={() => toggleRow(item.id)}
            transitionDuration={0}
          />
        </td>
        <td>
          <Group spacing="sm">
            <div className="text-xl">{item.icon}</div>
            <Text size="sm" weight={500}>
              {item.name}
            </Text>
          </Group>
        </td>
        <td>{item.properties}</td>
        <td>{formatDate(item.edited)}</td>
      </tr>
    );
  });

  const handleDBSelect = async () => {
    await refetch();
  };

  if (!!notionAuthCode && authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader color="indigo" variant="bars" size={"md"} />
      </div>
    );
  }

  if (!userConnected) {
    return <a href={env.NEXT_PUBLIC_NOTION_AUTH_URL}>Connect to Notion</a>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(269,95%,92%)]">
      <div>
        <p>Logged In!</p>
        <button onClick={() => void handleLogOut()}>log out</button>
      </div>
      <div>
        {/* this stuff not working rn */}
        {authData?.owner && (
          <div className="container flex flex-row items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full">
              <Image
                className="h-auto max-w-none"
                src={authData?.owner.user.avatar_url}
                alt="User Avatar Image"
                width={40}
                height={100}
              ></Image>
            </div>

            <div>{authData?.owner.user.name}</div>
          </div>
        )}

        <div className="container flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold">Your Databases</h1>

          {dbLoading ? (
            <Loader color="indigo" variant="bars" size={"md"} />
          ) : dbList === undefined || dbList?.length === 0 ? (
            <div>There are no Databases on the page you selected...</div>
          ) : (
            <div>
              <ScrollArea>
                <Table miw={800} verticalSpacing="sm">
                  <thead>
                    <tr>
                      <th style={{ width: rem(40) }}>
                        <Checkbox
                          onChange={toggleAll}
                          checked={selection.length === dbList.length}
                          indeterminate={
                            selection.length > 0 &&
                            selection.length !== dbList.length
                          }
                          transitionDuration={0}
                        />
                      </th>
                      <th>DB Name</th>
                      <th># habits</th>
                      <th>Last Edited</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>
              </ScrollArea>
              <button
                className="btn-primary m-4"
                onClick={() => void handleDBSelect()}
              >
                Connect
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotionPage;

const useStyles = createStyles(() => ({
  rowSelected: {
    backgroundColor: "skyblue",
  },
}));

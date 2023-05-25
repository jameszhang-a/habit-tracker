import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { NotionAuthRes } from "~/types";
import { Loader } from "@mantine/core";
import Image from "next/image";

import { env } from "~/env.mjs";

import {
  createStyles,
  Table,
  Checkbox,
  ScrollArea,
  Group,
  Avatar,
  Text,
  rem,
} from "@mantine/core";
import { formatDate } from "~/utils";

const useStyles = createStyles(() => ({
  rowSelected: {
    backgroundColor: "skyblue",
  },
}));

type TableRow = {
  id: string;
  icon?: string;
  name?: string;
  properties: number;
  habits?: string[];
  edited: Date;
};

const input: TableRow[] = [
  {
    id: "1",
    icon: "🤓",
    name: "Robert Wolfkisser",
    properties: 21,
    edited: new Date(),
  },
  {
    id: "2",
    icon: "🤓",
    name: "Jill Jailbreaker",
    properties: 21,
    edited: new Date(),
  },
  {
    id: "3",
    icon: "🤓",
    name: "Henry Silkeater",
    properties: 21,
    edited: new Date(),
  },
  {
    id: "4",
    icon: "🤓",
    name: "Bill Horsefighter",
    properties: 21,
    edited: new Date(),
  },
  {
    id: "5",
    icon: "🤓",
    name: "Jeremy Footviewer",
    properties: 21,
    edited: new Date(),
  },
];

const NotionPage = () => {
  const [userConnected, setUserConnected] = useState(false);
  const [dbList, setDbList] = useState<TableRow[]>([]);
  const router = useRouter();
  const { code: notionAuthCode } = router.query;

  const { classes, cx } = useStyles();
  const [selection, setSelection] = useState<string[]>([]);

  const { data: connected } = api.notion.getNotionAuthStatus.useQuery(
    undefined,
    { enabled: !userConnected }
  );

  useEffect(() => {
    if (connected) {
      setUserConnected(true);
    }
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

  const {
    data: rowData,
    isLoading: rowLoading,
    refetch,
  } = api.notion.getDBRows.useQuery({ dbIds: selection }, { enabled: false });

  if (rowData && rowData.length > 0) {
    console.log("rowData", rowData);
    // console.log("stringified", JSON.stringify(rowData[0]?.data[0]));
  }

  useEffect(() => {
    if (dbData) {
      console.log("dbData", dbData);
      setDbList(dbData);
    }
  }, [dbData]);

  const notionLogOut = api.notion.logOut.useMutation();

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
    console.log("selected");

    await refetch();
    console.log("handleDBSelect");
    console.log("selected", selection);
  };

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
            // dbData.map((db) => (
            //   <ul key={db.id}>
            //     <li onClick={() => handleDBSelect()}>{db.name}</li>
            //   </ul>
            // ))
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

const x = {
  object: "database",
  id: "bc1211ca-e3f1-4939-ae34-5260b16f627c",
  created_time: "2021-07-08T23:50:00.000Z",
  last_edited_time: "2021-07-08T23:50:00.000Z",
  icon: {
    type: "emoji",
    emoji: "🎉",
  },
  cover: {
    type: "external",
    external: {
      url: "https://website.domain/images/image.png",
    },
  },
  url: "https://www.notion.so/bc1211cae3f14939ae34260b16f627c",
  title: [
    {
      type: "text",
      text: {
        content: "Grocery List",
        link: null,
      },
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
      plain_text: "Grocery List",
      href: null,
    },
  ],
  description: [
    {
      type: "text",
      text: {
        content: "Grocery list for just kale 🥬",
        link: null,
      },
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
      plain_text: "Grocery list for just kale 🥬",
      href: null,
    },
  ],
  properties: {
    "+1": {
      id: "Wp%3DC",
      name: "+1",
      type: "people",
      people: {},
    },
    "In stock": {
      id: "fk%5EY",
      name: "In stock",
      type: "checkbox",
      checkbox: {},
    },
    Price: {
      id: "evWq",
      name: "Price",
      type: "number",
      number: {
        format: "dollar",
      },
    },
    Description: {
      id: "V}lX",
      name: "Description",
      type: "rich_text",
      rich_text: {},
    },
    "Last ordered": {
      id: "eVnV",
      name: "Last ordered",
      type: "date",
      date: {},
    },
    Meals: {
      id: "%7DWA~",
      name: "Meals",
      type: "relation",
      relation: {
        database_id: "668d797c-76fa-4934-9b05-ad288df2d136",
        synced_property_name: "Related to Grocery List (Meals)",
      },
    },
    "Number of meals": {
      id: "Z\\Eh",
      name: "Number of meals",
      type: "rollup",
      rollup: {
        rollup_property_name: "Name",
        relation_property_name: "Meals",
        rollup_property_id: "title",
        relation_property_id: "mxp^",
        function: "count",
      },
    },
    "Store availability": {
      id: "s}Kq",
      name: "Store availability",
      type: "multi_select",
      multi_select: {
        options: [
          {
            id: "cb79b393-d1c1-4528-b517-c450859de766",
            name: "Duc Loi Market",
            color: "blue",
          },
          {
            id: "58aae162-75d4-403b-a793-3bc7308e4cd2",
            name: "Rainbow Grocery",
            color: "gray",
          },
          {
            id: "22d0f199-babc-44ff-bd80-a9eae3e3fcbf",
            name: "Nijiya Market",
            color: "purple",
          },
          {
            id: "0d069987-ffb0-4347-bde2-8e4068003dbc",
            name: "Gus's Community Market",
            color: "yellow",
          },
        ],
      },
    },
    Photo: {
      id: "yfiK",
      name: "Photo",
      type: "files",
      files: {},
    },
    "Food group": {
      id: "CM%3EH",
      name: "Food group",
      type: "select",
      select: {
        options: [
          {
            id: "6d4523fa-88cb-4ffd-9364-1e39d0f4e566",
            name: "🥦Vegetable",
            color: "green",
          },
          {
            id: "268d7e75-de8f-4c4b-8b9d-de0f97021833",
            name: "🍎Fruit",
            color: "red",
          },
          {
            id: "1b234a00-dc97-489c-b987-829264cfdfef",
            name: "💪Protein",
            color: "yellow",
          },
        ],
      },
    },
    Name: {
      id: "title",
      name: "Name",
      type: "title",
      title: {},
    },
  },
  parent: {
    type: "page_id",
    page_id: "98ad959b-2b6a-4774-80ee-00246fb0ea9b",
  },
  archived: false,
  is_inline: false,
};

const y = {
  object: "list",
  results: [
    {
      object: "page",
      id: "59833787-2cf9-4fdf-8782-e53db20768a5",
      created_time: "2022-03-01T19:05:00.000Z",
      last_edited_time: "2022-07-06T20:25:00.000Z",
      created_by: {
        object: "user",
        id: "ee5f0f84-409a-440f-983a-a5315961c6e4",
      },
      last_edited_by: {
        object: "user",
        id: "0c3e9826-b8f7-4f73-927d-2caaf86f1103",
      },
      cover: {
        type: "external",
        external: {
          url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg",
        },
      },
      icon: {
        type: "emoji",
        emoji: "🥬",
      },
      parent: {
        type: "database_id",
        database_id: "d9824bdc-8445-4327-be8b-5b47500af6ce",
      },
      archived: false,
      properties: {
        "Store availability": {
          id: "%3AUPp",
          type: "multi_select",
          multi_select: [
            {
              id: "t|O@",
              name: "Gus's Community Market",
              color: "yellow",
            },
            {
              id: "{Ml\\",
              name: "Rainbow Grocery",
              color: "gray",
            },
          ],
        },
        "Food group": {
          id: "A%40Hk",
          type: "select",
          select: {
            id: "5e8e7e8f-432e-4d8a-8166-1821e10225fc",
            name: "🥬 Vegetable",
            color: "pink",
          },
        },
        Price: {
          id: "BJXS",
          type: "number",
          number: 2.5,
        },
        "Responsible Person": {
          id: "Iowm",
          type: "people",
          people: [
            {
              object: "user",
              id: "cbfe3c6e-71cf-4cd3-b6e7-02f38f371bcc",
              name: "Cristina Cordova",
              avatar_url:
                "https://lh6.googleusercontent.com/-rapvfCoTq5A/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nDKmmUpkpFvWNBzvu9rnZEy7cbl8Q/photo.jpg",
              type: "person",
              person: {
                email: "cristina@makenotion.com",
              },
            },
          ],
        },
        "Last ordered": {
          id: "Jsfb",
          type: "date",
          date: {
            start: "2022-02-22",
            end: null,
            time_zone: null,
          },
        },
        "Cost of next trip": {
          id: "WOd%3B",
          type: "formula",
          formula: {
            type: "number",
            number: 0,
          },
        },
        Recipes: {
          id: "YfIu",
          type: "relation",
          relation: [
            {
              id: "90eeeed8-2cdd-4af4-9cc1-3d24aff5f63c",
            },
            {
              id: "a2da43ee-d43c-4285-8ae2-6d811f12629a",
            },
          ],
          has_more: false,
        },
        Description: {
          id: "_Tc_",
          type: "rich_text",
          rich_text: [
            {
              type: "text",
              text: {
                content: "A dark ",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "A dark ",
              href: null,
            },
            {
              type: "text",
              text: {
                content: "green",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "green",
              },
              plain_text: "green",
              href: null,
            },
            {
              type: "text",
              text: {
                content: " leafy vegetable",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: " leafy vegetable",
              href: null,
            },
          ],
        },
        "In stock": {
          id: "%60%5Bq%3F",
          type: "checkbox",
          checkbox: true,
        },
        "Number of meals": {
          id: "zag~",
          type: "rollup",
          rollup: {
            type: "number",
            number: 2,
            function: "count",
          },
        },
        Photo: {
          id: "%7DF_L",
          type: "url",
          url: "https://i.insider.com/612fb23c9ef1e50018f93198?width=1136&format=jpeg",
        },
        Name: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: "Tuscan kale",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "Tuscan kale",
              href: null,
            },
          ],
        },
      },
      url: "https://www.notion.so/Tuscan-kale-598337872cf94fdf8782e53db20768a5",
    },
  ],
  next_cursor: null,
  has_more: false,
  type: "page",
  page: {},
};

const res = {
  object: "list",
  results: [
    {
      object: "page",
      id: "6118c196-bb0f-4035-85bb-c393554e2c93",
      created_time: "2023-05-23T02:48:00.000Z",
      last_edited_time: "2023-05-23T02:49:00.000Z",
      created_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      last_edited_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      cover: null,
      icon: null,
      parent: {
        type: "database_id",
        database_id: "06e12438-b75d-4674-9e48-8aeb2a3e7c68",
      },
      archived: false,
      properties: {
        Gym: {
          id: "Xo%60X",
          type: "checkbox",
          checkbox: false,
        },
        TV: {
          id: "%60L%5BI",
          type: "checkbox",
          checkbox: true,
        },
        day: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: "6",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "6",
              href: null,
            },
          ],
        },
      },
      url: "https://www.notion.so/6-6118c196bb0f403585bbc393554e2c93",
    },
    {
      object: "page",
      id: "dc29eb6d-56e5-40ee-9982-5add39925df6",
      created_time: "2023-05-23T02:48:00.000Z",
      last_edited_time: "2023-05-23T02:49:00.000Z",
      created_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      last_edited_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      cover: null,
      icon: null,
      parent: {
        type: "database_id",
        database_id: "06e12438-b75d-4674-9e48-8aeb2a3e7c68",
      },
      archived: false,
      properties: {
        Gym: {
          id: "Xo%60X",
          type: "checkbox",
          checkbox: true,
        },
        TV: {
          id: "%60L%5BI",
          type: "checkbox",
          checkbox: true,
        },
        day: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: "5",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "5",
              href: null,
            },
          ],
        },
      },
      url: "https://www.notion.so/5-dc29eb6d56e540ee99825add39925df6",
    },
    {
      object: "page",
      id: "766dda22-6ff5-4747-b7dd-54f636a2e19c",
      created_time: "2023-05-23T02:48:00.000Z",
      last_edited_time: "2023-05-23T02:48:00.000Z",
      created_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      last_edited_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      cover: null,
      icon: null,
      parent: {
        type: "database_id",
        database_id: "06e12438-b75d-4674-9e48-8aeb2a3e7c68",
      },
      archived: false,
      properties: {
        Gym: {
          id: "Xo%60X",
          type: "checkbox",
          checkbox: false,
        },
        TV: {
          id: "%60L%5BI",
          type: "checkbox",
          checkbox: false,
        },
        day: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: "4",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "4",
              href: null,
            },
          ],
        },
      },
      url: "https://www.notion.so/4-766dda226ff54747b7dd54f636a2e19c",
    },
    {
      object: "page",
      id: "0418e491-a5a0-4de2-8d75-16d60e9844e1",
      created_time: "2023-05-23T02:47:00.000Z",
      last_edited_time: "2023-05-23T02:48:00.000Z",
      created_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      last_edited_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      cover: null,
      icon: null,
      parent: {
        type: "database_id",
        database_id: "06e12438-b75d-4674-9e48-8aeb2a3e7c68",
      },
      archived: false,
      properties: {
        Gym: {
          id: "Xo%60X",
          type: "checkbox",
          checkbox: false,
        },
        TV: {
          id: "%60L%5BI",
          type: "checkbox",
          checkbox: false,
        },
        day: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: "1",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "1",
              href: null,
            },
          ],
        },
      },
      url: "https://www.notion.so/1-0418e491a5a04de28d7516d60e9844e1",
    },
    {
      object: "page",
      id: "17ce015b-ef76-417e-a1af-9e063064c488",
      created_time: "2023-05-23T02:47:00.000Z",
      last_edited_time: "2023-05-23T02:49:00.000Z",
      created_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      last_edited_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      cover: null,
      icon: null,
      parent: {
        type: "database_id",
        database_id: "06e12438-b75d-4674-9e48-8aeb2a3e7c68",
      },
      archived: false,
      properties: {
        Gym: {
          id: "Xo%60X",
          type: "checkbox",
          checkbox: true,
        },
        TV: {
          id: "%60L%5BI",
          type: "checkbox",
          checkbox: false,
        },
        day: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: "3",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "3",
              href: null,
            },
          ],
        },
      },
      url: "https://www.notion.so/3-17ce015bef76417ea1af9e063064c488",
    },
    {
      object: "page",
      id: "f35ce08c-9915-41d4-a13f-cc9dd915700d",
      created_time: "2023-05-23T02:47:00.000Z",
      last_edited_time: "2023-05-23T02:48:00.000Z",
      created_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      last_edited_by: {
        object: "user",
        id: "0e08d950-0932-491e-9fe8-01ca140e425b",
      },
      cover: null,
      icon: null,
      parent: {
        type: "database_id",
        database_id: "06e12438-b75d-4674-9e48-8aeb2a3e7c68",
      },
      archived: false,
      properties: {
        Gym: {
          id: "Xo%60X",
          type: "checkbox",
          checkbox: false,
        },
        TV: {
          id: "%60L%5BI",
          type: "checkbox",
          checkbox: false,
        },
        day: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: "2",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "2",
              href: null,
            },
          ],
        },
      },
      url: "https://www.notion.so/2-f35ce08c991541d4a13fcc9dd915700d",
    },
  ],
  next_cursor: null,
  has_more: false,
  type: "page",
  page: {},
  developer_survey:
    "https://notionup.typeform.com/to/bllBsoI4?utm_source=postman",
};

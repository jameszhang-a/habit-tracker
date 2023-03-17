import Head from "next/head";

interface HeadWrapperProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
}

const HeadWrapper: React.FC<HeadWrapperProps> = ({
  title,
  children,
  description,
}) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content={
            description ||
            "Habit Genie allows you to create a custom habit tracking widget for your Notion dashboard."
          }
        />
        <link rel="icon" href="/favicon.ico" />
        <title>{title || "Habit Genie"}</title>
      </Head>

      <main>{children}</main>
    </>
  );
};

export default HeadWrapper;

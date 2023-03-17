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
        <title>{title || "Habit Genie"}</title>
        <meta
          name="description"
          content={
            description ||
            "Habit Genie allows you to create a custom habit tracking widget for your Notion dashboard."
          }
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>{children}</main>
    </>
  );
};

export default HeadWrapper;

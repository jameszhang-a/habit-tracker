import { SessionProvider } from "next-auth/react";
import { MantineProvider } from "@mantine/core";
import { ThemeProvider } from "@/components/theme-provider";

import "@/styles/globals.css";
import { api } from "@/utils/api";
import { styleCache } from "style-cache";

import type { AppType } from "next/app";
import type { Session } from "next-auth";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <MantineProvider emotionCache={styleCache}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Component {...pageProps} />
        </ThemeProvider>
      </MantineProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);

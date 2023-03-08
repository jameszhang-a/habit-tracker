import { createStylesServer, ServerStyles } from "@mantine/next";
import type { DocumentContext } from "next/document";
import Document from "next/document";

import { styleCache } from "style-cache";

const stylesServer = createStylesServer(styleCache);

export default class _Document extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      styles: [
        initialProps.styles,
        <ServerStyles
          html={initialProps.html}
          server={stylesServer}
          key="styles"
        />,
      ],
    };
  }
}

// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppWrapper } from "@/components/LoadingContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppWrapper>
      <Component {...pageProps} />
    </AppWrapper>
  );
}

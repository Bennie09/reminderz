import "./globals.css";

import "@fontsource/winky-sans/300.css";
import "@fontsource/winky-sans/400.css";
import "@fontsource/winky-sans/500.css";
import "@fontsource/winky-sans/600.css";
import "@fontsource/winky-sans/700.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { DarkModeProvider } from "@/contexts/DarkModeContext";

export const metadata = {
  title: "TaskWise",
  description: "Organize your life, a task at a time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="">
      <body className="font-winky">
        <DarkModeProvider>{children}</DarkModeProvider>
        <ToastContainer
          toastStyle={{
            fontFamily: "'Winky Sans', sans-serif",
          }}
          position="top-right"
          autoClose={3000}
        />
      </body>
    </html>
  );
}

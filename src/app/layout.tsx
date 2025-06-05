import "./globals.css";
import "@fontsource/winky-sans/300.css";
import "@fontsource/winky-sans/400.css";
import "@fontsource/winky-sans/500.css";
import "@fontsource/winky-sans/600.css";
import "@fontsource/winky-sans/700.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { ThemeProvider } from "@/components/ThemeProvider";
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#1E3A8A ", // Tailwind's gray-900
};

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
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors duration-300 font-winky bg-gray-900 text-gray-100 min-h-screen">
        {children}
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

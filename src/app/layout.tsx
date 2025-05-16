import "./globals.css";

import "@fontsource/winky-sans/300.css";
import "@fontsource/winky-sans/400.css";
import "@fontsource/winky-sans/500.css";
import "@fontsource/winky-sans/600.css";
import "@fontsource/winky-sans/700.css";

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
    <html lang="en">
      <body className="font-winky">{children}</body>
    </html>
  );
}

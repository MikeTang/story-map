import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Story Map — Corkboard",
  description: "A cozy corkboard for mapping out scenes in your story.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-screen w-screen overflow-hidden select-none bg-[#c8a96e]">
        {children}
      </body>
    </html>
  );
}

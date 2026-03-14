import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { ConditionalLayout } from "./ConditionalLayout";

export const metadata = {
  title: "ATSB - EloTracker",
  description: "Global leaderboard and tournament rankings for badminton.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-background-light dark:bg-background-dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}

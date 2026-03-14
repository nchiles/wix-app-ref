import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Disney Attractions Planner",
  description: "Plan your Disney World visit with personalized ride recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

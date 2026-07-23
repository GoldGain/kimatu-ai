import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kimatu AI — Autonomous Agent Workspace",
  description:
    "Multi-agent AI platform for chat, coding, research, testing, and deployment powered by DeepSeek.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

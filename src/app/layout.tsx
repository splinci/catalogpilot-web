import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";

import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Splinci — AI-Native Enterprise Commerce OS",
  description: "Splinci — Bringing your commerce operations together as one.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 antialiased overflow-x-hidden">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}

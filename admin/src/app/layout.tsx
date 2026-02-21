import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Referearn Admin Panel",
  description: "Telegram Bot Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-50 flex min-h-screen text-black`}>
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto w-full max-w-[100vw]">
          {children}
        </main>
      </body>
    </html>
  );
}

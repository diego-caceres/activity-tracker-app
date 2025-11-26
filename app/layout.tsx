import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daily Tracker",
  description: "Personal daily activity tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-gray-50 text-gray-900 min-h-screen")}>
        <main className="max-w-md mx-auto bg-white min-h-screen shadow-lg flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}

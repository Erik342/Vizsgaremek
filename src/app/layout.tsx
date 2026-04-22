import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { InboxProvider } from "@/context/InboxContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Valora - Több mint kiadáskövető",
  description: "Kövesd nyomon kiadásaidat egyszerűen és hatékonyan a Valora alkalmazással.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <InboxProvider>
            {children}
          </InboxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

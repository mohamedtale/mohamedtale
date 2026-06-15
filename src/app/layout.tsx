import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "الجهاز التنفيذي لحفر وصيانة آبار المياه",
  description: "نظام إدارة آبار المياه في ليبيا",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${notoSansArabic.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}

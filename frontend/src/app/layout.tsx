import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'نظام إدارة آبار المياه - وزارة الموارد المائية',
  description: 'الجهاز التنفيذي لحفر وصيانة آبار المياه - ليبيا',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

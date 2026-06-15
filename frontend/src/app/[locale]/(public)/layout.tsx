import { setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default async function PublicLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

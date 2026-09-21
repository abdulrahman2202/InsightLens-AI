import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ToastProvider } from '@/components/common/Toast';

export const metadata: Metadata = {
  title: 'InsightLens AI | European Robotic Surgery Expert Intelligence',
  description:
    'Turn expert interviews into evidence-backed insights. Advanced intelligence platform analyzing European robotic surgery adoption across France, Germany, and the UK.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-stone-900 selection:bg-[#FDF4D2] selection:text-[#12544F]">
        <ToastProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 md:pl-64 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 min-w-0">{children}</main>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}

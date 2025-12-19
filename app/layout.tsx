import { Toaster } from 'sonner';
import './globals.css'
import type { ReactNode } from 'react';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'QuickCart',
  description: 'QuickCart: An E-Commerce Solution.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-red-100 flex flex-col items-center">
        <Navbar />
        <main className="w-full max-w-7xl ">
          {children}
        </main>
        <Toaster visibleToasts={1} position="bottom-center" />
      </body>
    </html>
  );
}

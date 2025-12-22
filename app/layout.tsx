import { Toaster } from 'sonner';
import './globals.css';
import type { ReactNode } from 'react';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'QuickCart',
  description: 'QuickCart: An E-Commerce Solution.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-amazon-bg flex flex-col items-center">
        {/* Navbar */}
        <Navbar />

        {/* Main content area */}
        <main className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Toaster notifications */}
        <Toaster visibleToasts={1} position="bottom-center" />
      </body>
    </html>
  );
}

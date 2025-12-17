import './globals.css'
import type { ReactNode } from 'react';

export const metadata = {
  title: 'QuickCart',
  description: 'QuickCart: Easy-to-use e-commerce store with search and filters.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-amazon-bg text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
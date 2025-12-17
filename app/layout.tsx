import { Toaster } from 'sonner';
import './globals.css'
import type { ReactNode } from 'react';

export const metadata = {
  title: 'QuickCart',
  description: 'QuickCart: An E-Commerce Solution.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster visibleToasts={1} position="bottom-center" />
      </body>
    </html>
  );
}

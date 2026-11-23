import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '링크나무',
  description: '내 모든 링크를 한 페이지에 모아두는 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-full">
        {children}
      </body>
    </html>
  );
}

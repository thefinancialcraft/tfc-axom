import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Attendance System',
  description: 'Blank setup',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="mobile-frame-container">
          <div className="mobile-frame">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

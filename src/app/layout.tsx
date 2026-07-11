import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';

const lufga = localFont({
  src: [
    { path: '../../lufga_fonts/Lufga-Regular.otf', weight: '400', style: 'normal' },
    { path: '../../lufga_fonts/Lufga-Medium.otf', weight: '500', style: 'normal' },
    { path: '../../lufga_fonts/Lufga-SemiBold.otf', weight: '600', style: 'normal' },
    { path: '../../lufga_fonts/Lufga-Bold.otf', weight: '700', style: 'normal' }
  ],
  variable: '--font-lufga'
});

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
      <body className={lufga.className}>
        <div className="desktop-layout-wrapper">
          <div className="desktop-side-content">
            <div className="desktop-image-wrapper">
              <img src="/gt.png" alt="GT Logo" className="desktop-side-image" />
            </div>
            <h1>TFC Axom</h1>
            <p>Welcome to TFC Axom. The most reliable and efficient way to manage your tasks and attendance. Experience seamless integration and modern design tailored just for you.</p>
          </div>
          <div className="mobile-frame-container">
            <div className="mobile-frame">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

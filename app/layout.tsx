import type { Metadata } from 'next';
import './globals.css';
import "@fontsource-variable/lexend";
import { AuthProvider } from './contexts/AuthContext';

export const metadata: Metadata = {
  title: 'TimeMate',
  description: 'Project management and time tracking app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#111111] text-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

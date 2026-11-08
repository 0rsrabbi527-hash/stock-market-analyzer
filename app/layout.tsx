import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Stock Market Analyzer',
  description: 'Adobe Stock research and analytics dashboard'
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

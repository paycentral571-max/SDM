import './styles.css';
import type { ReactNode } from 'react';

export const metadata = { title: 'Secure Device Monitor', description: 'Consent-based device security operations' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

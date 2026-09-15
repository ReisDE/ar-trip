import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '../components/Nav';

export const metadata: Metadata = {
  title: 'AR Trip',
  description: 'Viagens de ônibus com destino certo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-linho text-tinta font-corpo">
        <Nav />
        {children}
      </body>
    </html>
  );
}

import './globals.css';

export const metadata = {
  title: 'Oman Petroleum WMS — Prototype',
  description: 'Warehouse management prototype for a petroleum company in Oman.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

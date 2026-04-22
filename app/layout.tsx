import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Comercial Partsec",
  description: "Portal interno para parceiros comerciais Partsec"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

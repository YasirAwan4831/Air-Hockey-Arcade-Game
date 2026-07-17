import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Air Hockey — Neon Arcade",
  description:
    "A fast-paced neon air hockey game built with Next.js, TypeScript and Canvas 2D — featuring responsive controls, dynamic physics, CPU AI, particle effects and procedural sound design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

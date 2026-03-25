import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const ruderPlakat = localFont({
  src: "../public/fonts/RuderPlakatLL.woff2",
  variable: "--font-display",
  display: "swap",
});

const neueMontreal = localFont({
  src: [
    { path: "../public/fonts/PPNeueMontreal-Regular.woff2", weight: "400" },
    { path: "../public/fonts/PPNeueMontreal-Medium.woff2", weight: "500" },
  ],
  variable: "--font-body",
  display: "swap",
});

const neueMontrealMono = localFont({
  src: "../public/fonts/PPNeueMontrealMono.woff2",
  variable: "--font-mono",
  weight: "500",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fjodor's Defence",
  description: "Defend Södermalm from invaders - a tower defence game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ruderPlakat.variable} ${neueMontreal.variable} ${neueMontrealMono.variable} h-full`}>
      <body className="h-full overflow-hidden m-0 p-0">{children}</body>
    </html>
  );
}

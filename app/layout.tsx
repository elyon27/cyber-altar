import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cyber Altar to the Lamb",
  description: "A personal digital sanctuary with engraved altar, candles, and prayer archive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
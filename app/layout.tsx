import type { Metadata } from "next";

import "./globals.css";
import {Lancelot} from "next/font/google";
import { Alegreya_Sans_SC } from "next/font/google";

const lancelot = Lancelot({
  subsets: ["latin"],
  variable: "--font-lancelot",
  weight: "400"
});

const alegreyaSc = Alegreya_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-alegreya-sc",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}

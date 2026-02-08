import type { Metadata } from "next";
import { Oswald, Inter_Tight } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SplashLoader from "@/components/SplashLoader";
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IMDb Reimagined",
  description: "A cinematic reimagining of IMDb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oswald.variable} ${interTight.variable}`}>
      <body className="font-body min-h-screen">
        <SplashLoader />
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}

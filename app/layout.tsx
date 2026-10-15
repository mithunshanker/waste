import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Compost Bin | Environmental Monitoring Dashboard",
  description:
    "An IoT-based compost monitoring system that tracks environmental conditions inside a compost bin and provides real-time guidance to support efficient decomposition.",
  keywords: ["compost", "IoT", "environmental monitoring", "Arduino", "sensors", "decomposition"],
  authors: [{ name: "Smart Compost Bin Project" }],
  openGraph: {
    title: "Smart Compost Bin | Environmental Monitoring Dashboard",
    description: "Real-time compost environmental monitoring and intelligent guidance system.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased bg-[#0a150a] text-slate-100">
        {children}
      </body>
    </html>
  );
}

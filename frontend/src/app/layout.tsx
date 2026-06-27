import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "IC50 FORGE | AI Chagas Drug Potency Predictor",
  description: "An AI-driven platform for predicting Chagas disease drug potency (pIC50 and IC50) using RDKit Morgan fingerprints and Deep Neural Networks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}

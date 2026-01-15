import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MLStudio Pro — Understand AI Visually",
  description: "Build intuition for AI systems through interactive visual exploration. Observe, interact, and understand before you write code.",
  keywords: ["AI", "Machine Learning", "Data Science", "Visual Learning", "Interactive"],
  openGraph: {
    title: "MLStudio Pro — Understand AI Visually",
    description: "Build intuition for AI systems through interactive visual exploration.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}

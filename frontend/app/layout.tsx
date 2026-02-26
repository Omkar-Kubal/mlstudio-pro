import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-sans selection:bg-primary/30 selection:text-white`}>
        <AuthProvider> {/* Wrapped children with AuthProvider */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


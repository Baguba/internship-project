import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Harari PCC Portal — Professional Competence Certificate",
  description:
    "Official Professional Competence Certificate (PCC) portal of the Harari People Regional State, Ethiopia. Apply, get reviewed, and receive your business competence certificate online.",
  keywords: [
    "Harari", "Harar", "Ethiopia", "PCC", "Professional Competence Certificate",
    "Business Licence", "Trade Bureau", "Harari Region",
  ],
  authors: [{ name: "Harari Region Trade, Industry & Tourism Development Bureau" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Harari PCC Portal",
    description: "Professional Competence Certificate portal for the Harari Region, Ethiopia",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

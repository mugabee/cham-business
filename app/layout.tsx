import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cham Business Ltd — Personal Loans in Rwanda",
  description:
    "Cham Business Ltd is a registered non-deposit lender offering fast, fair personal loans to individuals across Rwanda. Apply in minutes.",
  keywords: [
    "personal loans Rwanda",
    "individual loans Kigali",
    "non-deposit lender Rwanda",
    "Cham Business Ltd",
  ],
  openGraph: {
    title: "Cham Business Ltd — Personal Loans in Rwanda",
    description:
      "Fast, fair personal loans for individuals across Rwanda. Apply in minutes.",
    locale: "en_RW",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable}`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import Script from "next/script";
import { company } from "@/lib/site";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-4R6Z8TTX7L";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://chambusiness.org";
const SITE_TITLE = "Cham Business Ltd — Quick Personal Loans in Kigali, Rwanda";
const SITE_DESCRIPTION =
  "Cham Business Ltd offers fast personal loans in Kigali and across Rwanda -- 24-hour decisions, no hidden fees, RWF 300,000 to 20,000,000. Apply online in minutes.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — Cham Business Ltd",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "personal loans Rwanda",
    "quick loans Kigali",
    "emergency loan Rwanda",
    "salary loan Rwanda",
    "business loan Kigali",
    "non-deposit lender Rwanda",
    "Cham Business Ltd",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "aYmBXpLH2X60eAIekNJDws_7FPxRky0d6c_tyd9c9Dg",
  },
  openGraph: {
    title: SITE_TITLE,
    description:
      "Fast personal loans in Kigali and across Rwanda -- 24-hour decisions, no hidden fees. Apply in minutes.",
    url: "/",
    siteName: "Cham Business Ltd",
    locale: "en_RW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description:
      "Fast personal loans in Kigali and across Rwanda -- 24-hour decisions, no hidden fees. Apply in minutes.",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "Cham Business Ltd",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  areaServed: {
    "@type": "Country",
    name: "Rwanda",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "RW",
    addressLocality: "Kigali",
  },
  telephone: company.phone,
  email: company.email,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${inter.variable}`}>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}

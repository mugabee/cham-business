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
        <a
          href="https://wa.me/250780123779"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg hover:bg-[#1ebe5d] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="w-7 h-7 fill-white"
          >
            <path d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.7 5.4 2 7.7L.3 31.6l8.2-2.1A15.6 15.6 0 0 0 16 31.6C24.6 31.6 31.6 24.6 31.6 16S24.6.4 16 .4zm0 28.4a13 13 0 0 1-6.6-1.8l-.5-.3-4.9 1.3 1.3-4.7-.3-.5A13 13 0 1 1 16 28.8zm7.1-9.7c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.2-.5.3-.9.1a11 11 0 0 1-3.2-2 12 12 0 0 1-2.2-2.8c-.2-.4 0-.6.2-.8l.6-.7.4-.7v-.7l-1.2-2.9c-.3-.7-.6-.6-.9-.6h-.7c-.3 0-.7.1-1 .4-.4.4-1.4 1.4-1.4 3.3 0 2 1.5 3.9 1.7 4.1.2.3 2.9 4.4 7 6.2 1 .4 1.7.7 2.3.9.97.3 1.86.26 2.56.16.78-.12 2.3-.94 2.63-1.85.32-.9.32-1.68.22-1.85-.1-.16-.33-.26-.7-.46z" />
          </svg>
        </a>
      </body>
    </html>
  );
}

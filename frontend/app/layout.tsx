import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { themeInitScriptContent } from "@/components/theme-init-script";
import { publicSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const site = publicSiteUrl();
const defaultTitle = "sahib.chat — AI chat & live code";
const description =
  "sahib.chat: glassmorphic AI coding workspace—chat with the assistant, edit in Monaco, preview HTML/CSS/JS live. Ocean & sunset gradient brand.";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: defaultTitle,
    template: "%s | sahib.chat",
  },
  description,
  keywords: [
    "sahib.chat",
    "AI coding",
    "collaborative IDE",
    "Monaco",
    "AWS Bedrock",
    "glassmorphism",
  ],
  applicationName: "sahib.chat",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site,
    siteName: "sahib.chat",
    title: defaultTitle,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "sahib.chat",
    description,
  },
  alternates: {
    canonical: site,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <Script
          id="sahib-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScriptContent() }}
        />
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}

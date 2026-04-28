import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { themeInitScriptContent } from "@/components/theme-init-script";
import { publicSiteUrl } from "@/lib/site";
import "./globals.css";

const site = publicSiteUrl();
const defaultTitle = "صاحب يلا — AI coding workspace";
const description =
  "صاحب يلا — ورشة برمجة بالذكاء الاصطناعي. حوار ذكي، تحرير مباشر، ومعاينة فورية للكود.";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: defaultTitle,
    template: "%s | صاحب يلا",
  },
  description,
  keywords: [
    "صاحب يلا",
    "sahib yalla",
    "AI coding",
    "Arabic IDE",
    "Monaco",
    "vibe coding",
  ],
  applicationName: "صاحب يلا",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: site,
    siteName: "صاحب يلا",
    title: defaultTitle,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "صاحب يلا",
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
      lang="ar"
      dir="rtl"
      className="dark"
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

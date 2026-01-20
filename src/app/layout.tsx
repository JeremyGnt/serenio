import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
// import { SpeedInsights } from "@vercel/speed-insights/next" // Moved to AnalyticsGuard
import "./globals.css"
import { InterventionSubmissionProvider } from "@/components/providers/intervention-submission-provider"
import { CookieBanner } from "@/components/layout/cookie-banner"
import { AnalyticsGuard } from "@/components/layout/analytics-guard"
import { ScrollToTopOnNavigate } from "@/components/ui/scroll-to-top-on-navigate"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Serenio | Serrurier de confiance à Lyon",
  description:
    "Trouvez un serrurier vérifié à Lyon. Prix transparent, pas d'arnaque. Fourchette de prix avant intervention. Gratuit, 7j/7, réponse en 5 min.",
  keywords: [
    "serrurier Lyon",
    "serrurier urgence Lyon",
    "dépannage serrure Lyon",
    "ouverture porte Lyon",
    "serrurier pas cher Lyon",
    "serrurier de confiance",
  ],
  authors: [{ name: "Serenio" }],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Serenio | Serrurier de confiance à Lyon",
    description:
      "Trouvez un serrurier vérifié à Lyon. Prix transparent, pas d'arnaque.",
    type: "website",
    locale: "fr_FR",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ScrollToTopOnNavigate />
        <InterventionSubmissionProvider>
          {children}
        </InterventionSubmissionProvider>
        <CookieBanner />
        <AnalyticsGuard />
      </body>
    </html>
  )
}


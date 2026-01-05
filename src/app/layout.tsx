import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Playfair_Display, Crimson_Pro } from 'next/font/google'
import '@/styles/globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const crimson = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Blackjack Royale',
  description: 'A modern blackjack game with stunning 3D card mechanics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${crimson.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}




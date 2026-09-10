import type { Metadata } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['300', '400', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'University ERP',
    template: '%s | University ERP',
  },
  description:
    'Integrated university management system for admissions, academics, finance, and more.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif4.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { Toaster } from '@/components/ui/Toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ToolsChile — Herramientas Profesionales para Todo Chile',
    template: '%s | ToolsChile',
  },
  description:
    'Compra herramientas eléctricas, manuales, maquinaria y accesorios de las mejores marcas. Makita, DeWalt, Bosch, Milwaukee. Envíos a todo Chile con garantía oficial.',
  keywords: [
    'herramientas chile', 'taladros', 'esmeriles', 'makita chile',
    'dewalt chile', 'bosch chile', 'ferretería online', 'herramientas eléctricas',
  ],
  openGraph: {
    title: 'ToolsChile — Herramientas Profesionales',
    description: 'Las mejores marcas de herramientas con envío a todo Chile.',
    url: 'https://toolschile.cl',
    siteName: 'ToolsChile',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://toolschile.cl' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-sans bg-white text-gray-900 antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
        <Toaster />
      </body>
    </html>
  )
}

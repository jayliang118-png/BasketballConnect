import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClientProviders } from '@/components/providers/ClientProviders'
import { Header } from '@/components/layout/Header'
import { BreadcrumbsFromUrl } from '@/components/layout/BreadcrumbsFromUrl'
import { Footer } from '@/components/layout/Footer'
import { ChatPanel } from '@/components/chat/ChatPanel'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Basketball Hub',
    template: '%s | Basketball Hub',
  },
  description:
    'Queensland Basketball information hub - teams, players, fixtures, and stats',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('basketball-hub-theme');if(t==='light'){document.documentElement.classList.remove('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-court-dark text-gray-200 antialiased`}
        suppressHydrationWarning
      >
        <ClientProviders>
          <div className="min-h-screen flex flex-col bg-court-dark">
            <Header />
            <BreadcrumbsFromUrl />
            {children}
            <Footer />
          </div>
          <ChatPanel />
        </ClientProviders>
      </body>
    </html>
  )
}

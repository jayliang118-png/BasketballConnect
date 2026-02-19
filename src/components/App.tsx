'use client'

import { ThemeProvider } from '@/context/ThemeContext'
import { NavigationProvider } from '@/context/NavigationContext'
import { SearchProvider } from '@/context/SearchContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { GlobalSearchIndexProvider } from '@/context/GlobalSearchIndexContext'
import { ChatProvider } from '@/context/ChatContext'
import { Header } from '@/components/layout/Header'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Footer } from '@/components/layout/Footer'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { ChatPanel } from '@/components/chat/ChatPanel'

export default function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <SearchProvider>
          <GlobalSearchIndexProvider>
          <FavoritesProvider>
          <ChatProvider>
            <div className="min-h-screen flex flex-col bg-court-dark">
              <Header />
              <Breadcrumbs />

              <main className="container mx-auto px-4 py-6 flex-1">
                <Dashboard />
              </main>

              <Footer />
            </div>
            <ChatPanel />
          </ChatProvider>
          </FavoritesProvider>
          </GlobalSearchIndexProvider>
        </SearchProvider>
      </NavigationProvider>
    </ThemeProvider>
  )
}

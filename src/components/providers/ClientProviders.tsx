'use client'

import { ThemeProvider } from '@/context/ThemeContext'
import { SearchProvider } from '@/context/SearchContext'
import { GlobalSearchIndexProvider } from '@/context/GlobalSearchIndexContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { ChatProvider } from '@/context/ChatContext'
import { BreadcrumbNamesProvider } from '@/context/BreadcrumbNamesContext'
import { NavigationProvider } from '@/context/NavigationContext'

interface ClientProvidersProps {
  readonly children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider>
      <SearchProvider>
        <GlobalSearchIndexProvider>
          <FavoritesProvider>
            <NotificationProvider>
              <ChatProvider>
                <NavigationProvider>
                  <BreadcrumbNamesProvider>{children}</BreadcrumbNamesProvider>
                </NavigationProvider>
              </ChatProvider>
            </NotificationProvider>
          </FavoritesProvider>
        </GlobalSearchIndexProvider>
      </SearchProvider>
    </ThemeProvider>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import DebugAuth from './components/DebugAuth'

export const metadata: Metadata = {
  title: 'StyleSwipe - Find Your Perfect Stylist',
  description: 'StyleSwipe helps you discover and connect with fashion stylists tailored to your style preferences.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-bg text-dark-text-primary antialiased">
        <AuthProvider>
          <ToastProvider>
            {children}
            <DebugAuth />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 
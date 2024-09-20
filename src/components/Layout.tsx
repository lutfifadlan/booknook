import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { Book } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center justify-center space-x-2">
              <Book className="h-6 w-6" />
              <Link href="/" className="text-2xl font-bold text-black dark:text-white">
                Booknook
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {session ? (
                <>
                  <span className="text-gray-700 dark:text-gray-300">Hello, {session.user.name}</span>
                  <Button variant="outline" onClick={() => signOut()}>Logout</Button>
                </>
              ) : (
                <Link href="/login" passHref>
                  <Button>Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow container px-4 sm:px-6 lg:px-8 mt-4 mx-auto">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-800 py-3 mt-4 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
              © {new Date().getFullYear()} Booknook. All rights reserved.
            </p>
            <nav className="flex space-x-4">
              <Link href="/privacy-policy" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
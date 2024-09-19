import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg shadow-lg">
        <div className="max-w-7xl mx-auto px-5 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold text-blue-500 hover:text-blue-600 transition duration-300">
              Booknook
            </Link>
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-lg text-gray-700">Hello, {session.user.name}</span>
                <Button variant="outline" onClick={() => signOut()}>Logout</Button>
              </div>
            ) : (
              <Link href="/login" passHref>
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg shadow-lg mt-8">
        <div className="max-w-7xl mx-auto py-4 px-5 text-center text-gray-600">
          <p>Booknook &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
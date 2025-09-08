import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <Link to="/" className="font-semibold text-xl text-primary">RWH</Link>
          <nav>
            <Link to="/" className="text-sm text-primary">Home</Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4">{children}</main>
      <footer className="text-center text-sm p-4 text-gray-500">© RWH Assessment</footer>
    </div>
  )
}

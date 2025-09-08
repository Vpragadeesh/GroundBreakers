import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-semibold text-primary hover:opacity-90">RWH</Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-700 hover:text-primary">Home</Link>
          </nav>

          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen((v) => !v)}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white/95 border-t">
          <div className="px-4 pt-4 pb-6 space-y-3">
            <Link to="/" className="block text-base font-medium text-gray-800" onClick={() => setOpen(false)}>Home</Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

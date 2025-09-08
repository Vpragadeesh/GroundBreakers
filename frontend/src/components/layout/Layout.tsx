import React from 'react'
import Header from './Header'
import Footer from './Footer'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="pt-20 container mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout

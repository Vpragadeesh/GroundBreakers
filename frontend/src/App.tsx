import { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Layout from './components/layout/Layout'
import './styles/globals.css'

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Layout>
      </Suspense>
    </BrowserRouter>
  )
}

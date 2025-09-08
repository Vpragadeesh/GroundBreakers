import React from 'react'
import { Link } from 'react-router-dom'

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-gradient-to-br from-sky-600 via-indigo-600 to-emerald-500 text-white">
        <div className="container mx-auto px-4 py-28 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-md">Harvest Rain. Save Water. Build Resilience.</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-sky-100/90">Quickly estimate your rooftop's rainwater potential, design a capture system, and get tailored recommendations to reduce dependency on municipal supply.</p>

          <div className="mt-10 flex justify-center gap-4">
            <Link to="/" className="inline-flex items-center gap-3 px-6 py-3 bg-white text-sky-700 rounded-full font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition">Start Assessment</Link>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-3 border border-white/30 rounded-full text-white hover:bg-white/10 transition">Learn More</Link>
          </div>
        </div>
      </div>

      {/* decorative wave */}
      <div className="-mt-2">
        <svg viewBox="0 0 1440 64" className="w-full h-16" preserveAspectRatio="none">
          <path fill="#ffffff" d="M0,32L48,26.7C96,21,192,11,288,10.7C384,11,480,21,576,32C672,43,768,53,864,53.3C960,53,1056,43,1152,37.3C1248,32,1344,32,1392,32L1440,32L1440,64L1392,64C1344,64,1248,64,1152,64C1056,64,960,64,864,64C768,64,672,64,576,64C480,64,384,64,288,64C192,64,96,64,48,64L0,64Z"></path>
        </svg>
      </div>
    </section>
  )
}

export default HeroSection

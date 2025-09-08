import React from 'react'
import Card from '../ui/Card'
import { FaBolt, FaMapMarkedAlt, FaFileAlt } from 'react-icons/fa'

const FeaturesSection: React.FC = () => {
  const features = [
    { icon: <FaBolt className="w-6 h-6 text-sky-600" />, title: 'Instant Assessment', description: 'Enter your roof details or pick on the map and get immediate estimates.' },
    { icon: <FaMapMarkedAlt className="w-6 h-6 text-emerald-600" />, title: 'Map-based Picker', description: 'Select the property visually and let AI assist with roof area estimation.' },
    { icon: <FaFileAlt className="w-6 h-6 text-indigo-600" />, title: 'Reports & Export', description: 'Download PDF/Excel reports for implementation and funding applications.' },
  ]

  return (
    <section className="py-12 container mx-auto px-4">
      <h2 className="text-3xl font-semibold mb-6 text-center">What you can do</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {features.map((f) => (
          <Card key={f.title} className="hover:shadow-xl transform hover:-translate-y-1 transition">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-md shadow-sm">{f.icon}</div>
              <div>
                <h3 className="font-medium text-lg">{f.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{f.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection

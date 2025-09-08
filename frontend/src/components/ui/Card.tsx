import React from 'react'

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 bg-white rounded shadow ${className}`}>{children}</div>
)

export default Card

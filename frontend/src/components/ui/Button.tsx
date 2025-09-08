import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }

const Button: React.FC<Props> = ({ variant = 'primary', children, ...rest }) => {
  const base = 'px-4 py-2 rounded-md font-medium inline-flex items-center justify-center gap-2'
  const classes =
    variant === 'primary'
      ? `${base} bg-primary text-white shadow hover:shadow-lg transition transform hover:-translate-y-0.5`
      : `${base} border border-gray-200 text-gray-700 bg-white hover:bg-gray-50`
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}

export default Button

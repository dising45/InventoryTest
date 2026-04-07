import { ReactNode } from 'react'

interface PrimaryButtonProps {
  onClick: () => void
  children: ReactNode
  className?: string
}

export const PrimaryButton = ({ onClick, children, className = '' }: PrimaryButtonProps) => (
  <button
    onClick={onClick}
    className={`group relative inline-flex items-center justify-center px-4 py-2 
    text-sm font-bold text-white transition-all duration-200 
    bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 
    hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 
    focus:ring-offset-2 focus:ring-indigo-600 ${className}`}
  >
    {children}
  </button>
)
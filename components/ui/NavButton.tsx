import type { ViewState } from '../../types'
import type { LucideIcon } from 'lucide-react'

interface NavButtonProps {
  view: ViewState
  icon: LucideIcon
  label: string
  currentView: ViewState
  setCurrentView: (v: ViewState) => void
}

export const NavButton = ({ view, icon: Icon, label, currentView, setCurrentView }: NavButtonProps) => {
  const isActive = currentView === view
  return (
    <button
      onClick={() => setCurrentView(view)}
      className={`relative flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group
      ${isActive
          ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
        }`}
    >
      <Icon
        className={`w-5 h-5 mr-3.5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}
        strokeWidth={isActive ? 2.5 : 2}
      />
      <span className="text-sm">{label}</span>
      {isActive && (
        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-sm" />
      )}
    </button>
  )
}
import { Plus } from 'lucide-react'

interface FABProps {
  onClick: () => void
}

export const FloatingActionButton = ({ onClick }: FABProps) => (
  <button
    onClick={onClick}
    className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center z-40 active:scale-90 transition-transform"
  >
    <Plus className="w-6 h-6" />
  </button>
)
// MobileBottomNav.tsx — 5 tabs with "More" sheet for overflow items
import React, { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MoreHorizontal,
  Truck,
  Wallet,
  BarChart3,
  X,
} from 'lucide-react'

interface Props {
  currentView: string
  setCurrentView: (v: any) => void
}

const primaryTabs = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
  { id: 'inventory', icon: Package, label: 'Stock' },
  { id: 'sales', icon: ShoppingCart, label: 'Sales' },
  { id: 'customers', icon: Users, label: 'Customers' },
]

const moreItems = [
  { id: 'suppliers', icon: Truck, label: 'Suppliers' },
  { id: 'expenses', icon: Wallet, label: 'Expenses' },
  { id: 'pl', icon: BarChart3, label: 'Profit & Loss' },
]

const moreIds = moreItems.map(i => i.id)

const MobileBottomNav: React.FC<Props> = ({ currentView, setCurrentView }) => {
  const [showMore, setShowMore] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Close sheet when navigating away
  useEffect(() => {
    setShowMore(false)
  }, [currentView])

  // Close on outside tap
  useEffect(() => {
    if (!showMore) return
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setShowMore(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMore])

  const isMoreActive = moreIds.includes(currentView)

  return (
    <>
      {/* BACKDROP */}
      {showMore && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 md:hidden animate-in fade-in duration-200" />
      )}

      {/* MORE SHEET */}
      {showMore && (
        <div
          ref={sheetRef}
          className="fixed bottom-[4.5rem] left-3 right-3 bg-white rounded-2xl shadow-2xl border border-gray-200/60 z-50 md:hidden animate-in slide-in-from-bottom-4 fade-in duration-200 pb-safe"
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-sm font-bold text-gray-900">More</span>
            <button
              onClick={() => setShowMore(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="px-3 pb-3 space-y-0.5">
            {moreItems.map(({ id, icon: Icon, label }) => {
              const isActive = currentView === id
              return (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentView(id)
                    setShowMore(false)
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-150 active:scale-[0.98]
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* BOTTOM TAB BAR */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:hidden z-50 transition-all duration-300">
        <div className="flex justify-around items-center h-[4.5rem] px-2 pb-safe">
          {primaryTabs.map(({ id, icon: Icon, label }) => {
            const isActive = currentView === id
            return (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className="group relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 ease-out active:scale-90"
              >
                {isActive && (
                  <div className="absolute top-2 w-12 h-8 bg-indigo-50 rounded-2xl -z-10 animate-in zoom-in-75 duration-200" />
                )}
                <div className={`transition-all duration-200 ${isActive ? '-translate-y-1' : 'translate-y-0'}`}>
                  <Icon
                    className={`w-6 h-6 mb-0.5 transition-colors duration-200 ${
                      isActive
                        ? 'text-indigo-600 stroke-[2.5px]'
                        : 'text-gray-400 group-hover:text-gray-500 stroke-[2px]'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'font-bold text-indigo-600 translate-y-0 opacity-100'
                      : 'font-medium text-gray-500 translate-y-0.5'
                  }`}
                >
                  {label}
                </span>
              </button>
            )
          })}

          {/* MORE TAB */}
          <button
            onClick={() => setShowMore(prev => !prev)}
            className="group relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 ease-out active:scale-90"
          >
            {(isMoreActive || showMore) && (
              <div className="absolute top-2 w-12 h-8 bg-indigo-50 rounded-2xl -z-10 animate-in zoom-in-75 duration-200" />
            )}
            <div className={`transition-all duration-200 ${(isMoreActive || showMore) ? '-translate-y-1' : 'translate-y-0'}`}>
              <MoreHorizontal
                className={`w-6 h-6 mb-0.5 transition-colors duration-200 ${
                  (isMoreActive || showMore)
                    ? 'text-indigo-600 stroke-[2.5px]'
                    : 'text-gray-400 group-hover:text-gray-500 stroke-[2px]'
                }`}
              />
            </div>
            <span
              className={`text-[10px] tracking-wide transition-all duration-200 ${
                (isMoreActive || showMore)
                  ? 'font-bold text-indigo-600 translate-y-0 opacity-100'
                  : 'font-medium text-gray-500 translate-y-0.5'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default MobileBottomNav
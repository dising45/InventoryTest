// MobileBottomNav.tsx
import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
} from 'lucide-react';

interface Props {
  currentView: string;
  setCurrentView: (v: any) => void;
}

const MobileBottomNav: React.FC<Props> = ({
  currentView,
  setCurrentView,
}) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'inventory', icon: Package, label: 'Stock' },
    { id: 'sales', icon: ShoppingCart, label: 'Sales' },
    { id: 'customers', icon: Users, label: 'Users' },
    { id: 'pl', icon: BarChart3, label: 'P&L' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:hidden z-50 transition-all duration-300">
      {/* Container with Bottom Safe Area Padding */}
      <div className="flex justify-around items-center h-[4.5rem] px-2 pb-safe">
        {items.map(({ id, icon: Icon, label }) => {
          const isActive = currentView === id;
          
          return (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`group relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 ease-out active:scale-90`}
            >
              {/* Active Indicator Pill (Background) */}
              {isActive && (
                <div className="absolute top-2 w-12 h-8 bg-indigo-50 rounded-2xl -z-10 animate-in zoom-in-75 duration-200" />
              )}

              {/* Icon */}
              <div className={`transition-all duration-200 ${isActive ? '-translate-y-1' : 'translate-y-0'}`}>
                <Icon 
                  className={`w-6 h-6 mb-0.5 transition-colors duration-200 ${
                    isActive 
                      ? 'text-indigo-600 stroke-[2.5px]' 
                      : 'text-gray-400 group-hover:text-gray-500 stroke-[2px]'
                  }`} 
                />
              </div>

              {/* Label */}
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
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
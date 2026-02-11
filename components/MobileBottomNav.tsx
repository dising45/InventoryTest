// MobileBottomNav.tsx
import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3, // Using BarChart3 for P&L to match premium look
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
    <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 md:hidden z-50">
      {/* Container with Bottom Safe Area for modern mobile notches */}
      <div className="flex justify-around items-center pt-2 pb-safe-bottom h-16 px-2">
        {items.map(({ id, icon: Icon, label }) => {
          const isActive = currentView === id;
          
          return (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 active:scale-90 ${
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {/* Active Top Bar Indicator */}
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-indigo-600 rounded-b-full shadow-[0_1px_4px_rgba(79,70,229,0.4)]" />
              )}

              <div className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
                <Icon 
                  className={`w-6 h-6 mb-1 transition-all duration-300 ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'
                  }`} 
                />
              </div>

              <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${
                isActive ? 'text-indigo-600' : 'text-gray-500'
              }`}>
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
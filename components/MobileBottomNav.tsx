import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Wallet,
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
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'sales', icon: ShoppingCart, label: 'Sales' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'profit-loss', icon: Wallet, label: 'P&L' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex justify-around py-2 md:hidden z-50">
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setCurrentView(id)}
          className={`flex flex-col items-center text-xs ${
            currentView === id
              ? 'text-indigo-600'
              : 'text-gray-500'
          }`}
        >
          <Icon className="w-5 h-5 mb-1" />
          {label}
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;

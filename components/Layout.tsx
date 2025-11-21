import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, CheckCircle, Settings, LogOut, Dumbbell } from 'lucide-react';
import { AuthContext } from '../App';

const SidebarItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive
          ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    <Icon size={20} className="stroke-[1.5]" />
    <span>{label}</span>
  </NavLink>
);

export default function Layout() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Dumbbell size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">GymOS</h1>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Panel de Control</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <SidebarItem to="/" icon={LayoutDashboard} label="Resumen" />
          <SidebarItem to="/members" icon={Users} label="Socios" />
          <SidebarItem to="/checkin" icon={CheckCircle} label="Asistencias" />
          <SidebarItem to="/payments" icon={CreditCard} label="Pagos" />
          
          {user?.role === 'admin' && (
             <SidebarItem to="/settings" icon={Settings} label="Configuración" />
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role === 'staff' ? 'Recepción' : 'Administrador'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-7xl mx-auto p-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
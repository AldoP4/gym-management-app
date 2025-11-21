import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { gymService } from './services/gymService';
import { User } from './types';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import MemberDetail from './components/MemberDetail';
import CheckIn from './components/CheckIn';
import Payments from './components/Payments';

// Context for Auth
export const AuthContext = React.createContext<{
  user: User | null;
  login: (email: string) => boolean;
  logout: () => void;
}>({ user: null, login: () => false, logout: () => {} });

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) => {
  const { user } = React.useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is persisted in session (simulated)
    const storedUser = localStorage.getItem('gymos_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const foundUser = gymService.login(email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('gymos_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gymos_user');
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50">Cargando GymOS...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="members/:id" element={<MemberDetail />} />
            <Route path="checkin" element={<CheckIn />} />
            <Route path="payments" element={<Payments />} />
            
            {/* Admin Only Routes */}
            <Route path="settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="p-8 text-gray-500">Configuración (Solo Admin) - Próximamente</div>
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { Dumbbell } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      navigate(from, { replace: true });
    } else {
      setError('Usuario no encontrado en la demo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-8">
           <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4">
            <Dumbbell size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido a GymOS</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de gestión interna</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="tu@email.com"
              autoFocus
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            Ingresar
          </button>
        </form>

        {/* Demo Credentials Hint */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500">
          <p className="font-bold text-gray-700 mb-2">Credenciales Demo:</p>
          <div className="flex justify-between mb-1">
            <span>Admin:</span>
            <span className="font-mono">admin@gym.com</span>
          </div>
          <div className="flex justify-between">
            <span>Recepción:</span>
            <span className="font-mono">staff@gym.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
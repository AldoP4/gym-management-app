import React, { useState, useEffect, useContext } from 'react';
import { gymService } from '../services/gymService';
import { AuthContext } from '../App';
import { Search, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

export default function CheckIn() {
  const { user } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error', message: string } | null>(null);

  useEffect(() => {
    refreshList();
  }, []);

  const refreshList = () => {
    setTodayCheckIns(gymService.getTodayCheckIns());
  };

  useEffect(() => {
      if (search.length > 1) {
          setMembers(gymService.getMembers(search).filter(m => m.active)); // Only show active profiles
      } else {
          setMembers([]);
      }
  }, [search]);

  const handleCheckIn = (memberId: string) => {
      if (!user) return;
      
      const result = gymService.checkIn(memberId, user.id);
      
      if (result.success) {
          setFeedback({ 
              type: result.status === 'grace' ? 'warning' : 'success', 
              message: result.message 
          });
      } else {
          setFeedback({ type: 'error', message: result.message });
      }

      // Clear search and feedback after delay
      setSearch('');
      setMembers([]);
      refreshList();

      setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Registro de Asistencia</h2>
        <p className="text-gray-500">Busca al socio para registrar su entrada.</p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
          <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2 duration-300 ${
              feedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
              feedback.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
              'bg-red-100 text-red-800 border border-red-200'
          }`}>
              {feedback.type === 'success' && <CheckCircle size={24} />}
              {feedback.type === 'warning' && <AlertTriangle size={24} />}
              {feedback.type === 'error' && <XCircle size={24} />}
              <span className="font-semibold text-lg">{feedback.message}</span>
          </div>
      )}

      {/* Search Box */}
      <div className="relative">
          <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <div className="pl-3 text-gray-400"><Search size={24} /></div>
            <input
                autoFocus
                type="text"
                className="flex-1 p-3 text-lg outline-none bg-transparent placeholder:text-gray-300"
                placeholder="Escribe nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Search Results Dropdown */}
          {members.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
                  {members.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => handleCheckIn(m.id)}
                        className="w-full text-left px-6 py-4 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors flex justify-between items-center group"
                      >
                          <div>
                              <div className="font-bold text-gray-900 text-lg group-hover:text-blue-700">{m.firstName} {m.lastName}</div>
                              <div className="text-sm text-gray-500">{m.email}</div>
                          </div>
                          <div className="bg-gray-100 group-hover:bg-blue-200 group-hover:text-blue-700 px-3 py-1 rounded-lg text-sm font-medium text-gray-600">
                              Registrar
                          </div>
                      </button>
                  ))}
              </div>
          )}
      </div>

      {/* Today's List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Clock size={18} /> Entradas de Hoy
              </h3>
              <span className="bg-white px-2 py-1 rounded-md border border-gray-200 text-xs font-bold text-gray-600">
                  Total: {todayCheckIns.length}
              </span>
          </div>
          <div className="divide-y divide-gray-100">
              {todayCheckIns.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">Aún no hay entradas hoy.</div>
              ) : (
                  todayCheckIns.map(c => (
                      <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                  {c.memberName.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900">{c.memberName}</span>
                          </div>
                          <div className="flex items-center gap-4">
                              {c.statusAtCheckIn === 'grace_period' && (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full border border-yellow-200">
                                      Período Gracia
                                  </span>
                              )}
                              <span className="text-gray-500 font-mono text-sm">
                                  {new Date(c.timestamp).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
}
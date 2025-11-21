import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, MoreHorizontal, User as UserIcon } from 'lucide-react';
import { gymService } from '../services/gymService';
import { Member } from '../types';

const StatusBadge = ({ status, expiryDate }: { status: string, expiryDate?: string }) => {
    const config: Record<string, string> = {
        active: 'bg-green-100 text-green-700 border-green-200',
        expiring: 'bg-orange-100 text-orange-700 border-orange-200',
        expired: 'bg-red-100 text-red-700 border-red-200',
        none: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    
    const labels: Record<string, string> = {
        active: 'Activo',
        expiring: 'Por Vencer',
        expired: 'Vencido',
        none: 'Sin Membresía'
    };

    return (
        <div className="flex flex-col items-start">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${config[status] || config.none}`}>
                {labels[status] || status}
            </span>
            {status !== 'none' && expiryDate && (
                <span className="text-[10px] text-gray-400 mt-1 ml-1">
                    Vence: {new Date(expiryDate).toLocaleDateString('es-MX')}
                </span>
            )}
        </div>
    );
};

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newMember, setNewMember] = useState({ firstName: '', lastName: '', phone: '', email: '' });

  useEffect(() => {
    setMembers(gymService.getMembers(search));
  }, [search]);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    gymService.createMember(newMember);
    setShowModal(false);
    setNewMember({ firstName: '', lastName: '', phone: '', email: '' });
    setMembers(gymService.getMembers(search)); // Refresh
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Socios</h2>
        <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          Nuevo Socio
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-medium">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Estado Membresía</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        {member.photoUrl ? (
                            <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><UserIcon size={20} /></div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{member.firstName} {member.lastName}</div>
                        <div className="text-xs text-gray-500">{member.email || 'Sin email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium text-sm">{member.phone}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={member.computedStatus} expiryDate={member.expiryDate} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                        to={`/members/${member.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {members.length === 0 && (
            <div className="p-12 text-center text-gray-400">
                No se encontraron socios.
            </div>
        )}
      </div>

      {/* Simple Modal for New Member */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4">Registrar Nuevo Socio</h3>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input 
                    required
                    placeholder="Nombre" 
                    className="p-3 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMember.firstName}
                    onChange={e => setNewMember({...newMember, firstName: e.target.value})}
                />
                <input 
                    required
                    placeholder="Apellido" 
                    className="p-3 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMember.lastName}
                    onChange={e => setNewMember({...newMember, lastName: e.target.value})}
                />
              </div>
              <input 
                  required
                  placeholder="Teléfono" 
                  className="p-3 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMember.phone}
                  onChange={e => setNewMember({...newMember, phone: e.target.value})}
              />
              <input 
                  placeholder="Email (Opcional)" 
                  type="email"
                  className="p-3 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMember.email}
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
              />
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancelar</button>
                <button type="submit" className="flex-1 p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gymService } from '../services/gymService';
import { Member, MembershipPlan } from '../types';
import { ArrowLeft, Calendar, CreditCard, User, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../App';

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [member, setMember] = useState<any>(null);
  const [history, setHistory] = useState<any>({ memberships: [], payments: [], checkIns: [] });
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  
  // Renewal State
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  useEffect(() => {
    if (id) {
      const m = gymService.getMember(id);
      if (!m) {
        navigate('/members');
        return;
      }
      setMember(m);
      setHistory(gymService.getMemberHistory(id));
      setPlans(gymService.getPlans());
    }
  }, [id, navigate]);

  const handleRenew = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && id && selectedPlan) {
        gymService.createMembership(id, selectedPlan, user.id, paymentMethod as any);
        // Refresh data
        setMember(gymService.getMember(id));
        setHistory(gymService.getMemberHistory(id));
        setShowRenewModal(false);
    }
  };

  if (!member) return <div>Cargando...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <button onClick={() => navigate('/members')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4">
        <ArrowLeft size={18} />
        <span>Volver a Socios</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 overflow-hidden">
                     <img src={member.photoUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`} alt="" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{member.firstName} {member.lastName}</h2>
                <p className="text-gray-500 mb-4">{member.email || 'Sin email'}</p>
                
                <div className={`px-4 py-1 rounded-full text-sm font-medium mb-6 ${
                    member.computedStatus === 'active' ? 'bg-green-100 text-green-700' :
                    member.computedStatus === 'expiring' ? 'bg-orange-100 text-orange-700' :
                    member.computedStatus === 'expired' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                }`}>
                    {member.computedStatus === 'active' ? 'Membresía Activa' :
                     member.computedStatus === 'expiring' ? 'Por Vencer' :
                     member.computedStatus === 'expired' ? 'Vencido' : 'Sin Membresía'}
                </div>

                <div className="w-full space-y-3">
                    <button 
                        onClick={() => setShowRenewModal(true)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-sm"
                    >
                        Nueva Membresía / Renovar
                    </button>
                    <div className="grid grid-cols-2 gap-2 text-left text-sm w-full mt-4 pt-4 border-t border-gray-100">
                        <div>
                            <p className="text-gray-400 text-xs uppercase">Teléfono</p>
                            <p className="font-medium">{member.phone}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs uppercase">Miembro desde</p>
                            <p className="font-medium">{new Date(member.createdAt).toLocaleDateString('es-MX')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* History Tabs */}
        <div className="lg:col-span-2 space-y-6">
            {/* Active Membership Info */}
            {member.computedStatus !== 'none' && member.lastMembership && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Membresía Actual</p>
                                <h3 className="text-2xl font-bold">{member.lastMembership.planName}</h3>
                            </div>
                            <ShieldCheck size={32} className="text-green-400" />
                        </div>
                        <div className="flex gap-8">
                            <div>
                                <p className="text-gray-400 text-xs">Fecha Inicio</p>
                                <p className="font-medium">{new Date(member.lastMembership.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">Fecha Fin</p>
                                <p className="font-medium text-lg">{new Date(member.lastMembership.endDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                </div>
            )}

            {/* Tabs / Lists */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar size={18} className="text-gray-500"/> Historial de Membresías
                    </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                    {history.memberships.length === 0 ? (
                        <p className="p-4 text-gray-400 text-sm">Sin historial.</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Plan</th>
                                    <th className="px-4 py-2">Inicio</th>
                                    <th className="px-4 py-2">Fin</th>
                                    <th className="px-4 py-2">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.memberships.map((m: any) => (
                                    <tr key={m.id}>
                                        <td className="px-4 py-3 font-medium">{m.planName}</td>
                                        <td className="px-4 py-3 text-gray-500">{m.startDate}</td>
                                        <td className="px-4 py-3 text-gray-500">{m.endDate}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs ${
                                                m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>{m.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCard size={18} className="text-gray-500"/> Pagos Recientes
                    </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                    {history.payments.length === 0 ? (
                        <p className="p-4 text-gray-400 text-sm">Sin pagos registrados.</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Fecha</th>
                                    <th className="px-4 py-2">Monto</th>
                                    <th className="px-4 py-2">Método</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.payments.map((p: any) => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3 text-gray-500">{p.date}</td>
                                        <td className="px-4 py-3 font-medium">${p.amount}</td>
                                        <td className="px-4 py-3 capitalize text-gray-500">{p.method}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-2">Renovar Membresía</h3>
            <p className="text-gray-500 mb-6">Selecciona un plan para {member.firstName}.</p>
            
            <form onSubmit={handleRenew} className="space-y-6">
              <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Plan</label>
                  <div className="grid gap-3">
                      {plans.map(plan => (
                          <label key={plan.id} className={`
                             flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                             ${selectedPlan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}
                          `}>
                              <div className="flex items-center gap-3">
                                  <input 
                                    type="radio" 
                                    name="plan" 
                                    value={plan.id} 
                                    checked={selectedPlan === plan.id}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <span className="font-medium">{plan.name}</span>
                              </div>
                              <span className="font-bold text-gray-900">${plan.price}</span>
                          </label>
                      ))}
                  </div>
              </div>

              <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Método de Pago</label>
                  <select 
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                      <option value="transferencia">Transferencia</option>
                  </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRenewModal(false)} className="flex-1 p-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancelar</button>
                <button type="submit" disabled={!selectedPlan} className="flex-1 p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
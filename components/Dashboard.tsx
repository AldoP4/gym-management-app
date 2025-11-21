import React, { useEffect, useState } from 'react';
import { gymService } from '../services/gymService';
import { DashboardStats } from '../types';
import { Users, Clock, AlertCircle, DollarSign, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {subtext && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{subtext}</span>}
    </div>
    <h3 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">{value}</h3>
    <p className="text-sm text-gray-500 font-medium">{title}</p>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expiringMembers, setExpiringMembers] = useState<any[]>([]);
  const [incomeData, setIncomeData] = useState<any[]>([]);

  useEffect(() => {
    setStats(gymService.getStats());
    setExpiringMembers(gymService.getExpiringMemberships());
    
    // Mock chart data based on real payments would be better, but for this demo we structure the last 7 days
    const payments = gymService.getRecentPayments(50);
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const total = payments
            .filter(p => p.date === dateStr)
            .reduce((acc, curr) => acc + curr.amount, 0);
        
        data.push({
            name: d.toLocaleDateString('es-MX', { weekday: 'short' }),
            total: total
        });
    }
    setIncomeData(data);
  }, []);

  if (!stats) return <div>Cargando...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resumen General</h2>
          <p className="text-gray-500">Bienvenido de nuevo al panel de control.</p>
        </div>
        <span className="text-sm text-gray-400">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Socios Activos" 
            value={stats.activeMembers} 
            icon={Users} 
            color="bg-blue-500 text-blue-600" 
        />
        <StatCard 
            title="Por Vencer (7 días)" 
            value={stats.expiringSoon} 
            icon={Clock} 
            color="bg-orange-500 text-orange-600" 
        />
        <StatCard 
            title="Vencidos este mes" 
            value={stats.expiredThisMonth} 
            icon={AlertCircle} 
            color="bg-red-500 text-red-600" 
        />
        <StatCard 
            title="Ingresos del mes" 
            value={`$${stats.monthlyIncome.toLocaleString()}`} 
            icon={DollarSign} 
            color="bg-green-500 text-green-600" 
            subtext="+12%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expiring Soon Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Membresías por vencer</h3>
            <Link to="/members" className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
             {expiringMembers.length === 0 ? (
                 <div className="p-8 text-center text-gray-400">No hay membresías próximas a vencer.</div>
             ) : (
                <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                    <th className="px-6 py-3">Socio</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Vence</th>
                    <th className="px-6 py-3">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {expiringMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                            {m.member.firstName} {m.member.lastName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{m.planName}</td>
                        <td className="px-6 py-4 text-orange-600 font-medium">
                            {new Date(m.endDate).toLocaleDateString('es-MX')}
                        </td>
                        <td className="px-6 py-4">
                            <Link to={`/members/${m.memberId}`} className="text-blue-600 hover:underline font-medium">Renovar</Link>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
             )}
          </div>
        </div>

        {/* Simple Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-6">Ingresos (últimos 7 días)</h3>
          <div className="flex-1 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData}>
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#9CA3AF'}} 
                    dy={10}
                />
                <Tooltip 
                    cursor={{fill: '#F3F4F6'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {incomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === incomeData.length - 1 ? '#3B82F6' : '#E5E7EB'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
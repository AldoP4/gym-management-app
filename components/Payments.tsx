import React, { useState, useEffect } from 'react';
import { gymService } from '../services/gymService';
import { Download, Filter } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    // Fetch last 100 payments for this view
    setPayments(gymService.getRecentPayments(100));
  }, []);

  const handleExport = () => {
      const headers = ['Fecha', 'Socio', 'Monto', 'Metodo'];
      const csvContent = [
          headers.join(','),
          ...payments.map(p => `${p.date},"${p.memberName}",${p.amount},${p.method}`)
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `pagos_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Historial de Pagos</h2>
        <button 
            onClick={handleExport}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors border border-transparent hover:border-gray-200"
        >
            <Download size={18} />
            <span>Exportar CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="p-4 border-b border-gray-100 flex gap-2">
             {/* Simple placeholder filters */}
             <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-700">Todos</button>
             <button className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Efectivo</button>
             <button className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Tarjeta</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-medium">
                    <tr>
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4">Socio</th>
                        <th className="px-6 py-4">Método</th>
                        <th className="px-6 py-4 text-right">Monto</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {payments.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-500">{new Date(p.date).toLocaleDateString('es-MX')}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{p.memberName}</td>
                            <td className="px-6 py-4">
                                <span className="capitalize px-2 py-1 rounded bg-gray-100 text-xs text-gray-600">
                                    {p.method}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-gray-900">${p.amount.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
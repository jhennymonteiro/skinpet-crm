import React, { useState } from 'react';
import { Lead, STAGE_COLORS } from '../types';
import { formatCurrencyBRL } from '../lib/analytics';
import { MessageCircle } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(leads.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = leads.slice(startIndex, startIndex + itemsPerPage);

  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullNumber = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    return `https://wa.me/${fullNumber}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Table Header / Action Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Base de Leads ({leads.length})
          </h3>
          <p className="text-xs text-slate-500">
            Sincronizado diretamente com a planilha do Google Sheets
          </p>
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-3 px-4">Nome</th>
              <th className="py-3 px-4">WhatsApp</th>
              <th className="py-3 px-4">Origem</th>
              <th className="py-3 px-4">Queixa do Cliente</th>
              <th className="py-3 px-4">Valor Estimado</th>
              <th className="py-3 px-4">Fase do Funil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Nenhum lead encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => {
                const colors = STAGE_COLORS[lead.fase] || STAGE_COLORS['Entrada'];

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* Nome */}
                    <td className="py-3.5 px-4 text-slate-900 font-bold">
                      <div className="truncate max-w-[180px]" title={lead.nome}>
                        {lead.nome}
                      </div>
                      {lead.observacoes && (
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[180px]">
                          {lead.observacoes}
                        </div>
                      )}
                    </td>

                    {/* WhatsApp */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <a
                        href={getWhatsAppLink(lead.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                        title="Abrir no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lead.whatsapp || '-'}</span>
                      </a>
                    </td>

                    {/* Origem */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200">
                        {lead.origemLead || 'Outros'}
                      </span>
                    </td>

                    {/* Queixa */}
                    <td className="py-3.5 px-4 text-slate-700 max-w-[200px] truncate" title={lead.queixaCliente}>
                      {lead.queixaCliente || '-'}
                    </td>

                    {/* Valor Estimado */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrencyBRL(lead.valorEstimado)}
                    </td>

                    {/* Fase */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${colors.badgeBg}`}>
                        {lead.fase}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando {startIndex + 1} até {Math.min(startIndex + itemsPerPage, leads.length)} de {leads.length} leads
          </span>
          <div className="flex items-center gap-1 font-semibold">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="px-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

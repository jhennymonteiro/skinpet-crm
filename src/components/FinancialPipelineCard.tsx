import React from 'react';
import { formatCurrencyBRL } from '../lib/analytics';
import { DollarSign, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface FinancialPipelineCardProps {
  valorEntrada: number;
  valorConexao: number;
  valorOportunidade: number;
  valorFollowUp: number;
  valorFechado: number;
  valorPerdido: number;
  activePipeline: number;
  totalPipeline: number;
}

export const FinancialPipelineCard: React.FC<FinancialPipelineCardProps> = ({
  valorEntrada,
  valorConexao,
  valorOportunidade,
  valorFollowUp,
  valorFechado,
  valorPerdido,
  activePipeline,
  totalPipeline
}) => {
  const financialRows = [
    { label: 'Valor estimado na Entrada', value: valorEntrada, color: 'text-blue-600', badge: 'bg-blue-50 text-blue-700' },
    { label: 'Valor em Conexão', value: valorConexao, color: 'text-indigo-600', badge: 'bg-indigo-50 text-indigo-700' },
    { label: 'Valor em Oportunidade', value: valorOportunidade, color: 'text-violet-600', badge: 'bg-violet-50 text-violet-700' },
    { label: 'Valor em Follow Up', value: valorFollowUp, color: 'text-amber-600', badge: 'bg-amber-50 text-amber-700' },
    { label: 'Valor Fechado', value: valorFechado, color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-800 font-bold' },
    { label: 'Valor Perdido', value: valorPerdido, color: 'text-rose-600', badge: 'bg-rose-50 text-rose-700' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 lg:p-6 flex flex-col justify-between">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Pipeline Financeiro</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Valores Estimados</span>
        </div>

        {/* Rows */}
        <div className="space-y-2.5">
          {financialRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60"
            >
              <span className="text-xs font-semibold text-slate-700">
                {row.label}
              </span>
              <span className={`text-xs font-extrabold ${row.color}`}>
                {formatCurrencyBRL(row.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total Pipeline Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 block">Valor Total do Pipeline</span>
          <span className="text-xs text-emerald-400 font-semibold">
            Em aberto: {formatCurrencyBRL(activePipeline)}
          </span>
        </div>
        <div className="text-xl font-extrabold text-white tracking-tight">
          {formatCurrencyBRL(totalPipeline)}
        </div>
      </div>

    </div>
  );
};

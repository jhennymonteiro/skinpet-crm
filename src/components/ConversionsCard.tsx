import React from 'react';
import { ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';

interface ConversionStepData {
  from: string;
  to: string;
  title: string;
  countFrom: number;
  countTo: number;
  pct: number;
}

interface ConversionsCardProps {
  steps: ConversionStepData[];
  totalFunnelConversionPct: number;
  totalEntradas: number;
  totalFechados: number;
}

export const ConversionsCard: React.FC<ConversionsCardProps> = ({
  steps,
  totalFunnelConversionPct,
  totalEntradas,
  totalFechados
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 lg:p-6 flex flex-col justify-between">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Taxas de Conversão por Etapa</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Progresso do Funil</span>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step) => {
            const pct = Math.min(Math.max(step.pct, 0), 100);

            return (
              <div key={step.title} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>{step.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{step.to}</span>
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    <span>{step.countTo}</span>
                    <span className="text-slate-400 font-normal"> / {step.countFrom} leads</span>
                    <span className="ml-2 font-extrabold text-blue-600">({pct.toFixed(1)}%)</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: Conversão Total do Funil */}
      <div className="mt-6 pt-4 border-t border-slate-200 bg-linear-to-r from-blue-50/50 to-indigo-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Conversão Total do Funil</span>
            <span className="text-[11px] text-slate-500">
              {totalFechados} fechados de {totalEntradas} entradas
            </span>
          </div>
        </div>
        <div className="text-xl font-extrabold text-emerald-600 tracking-tight">
          {totalFunnelConversionPct.toFixed(1)}%
        </div>
      </div>

    </div>
  );
};

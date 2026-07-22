import React from 'react';
import { FunnelStage, STAGE_COLORS } from '../types';
import { StageFunnelMetrics, formatCurrencyBRL } from '../lib/analytics';
import { ArrowRight, ArrowDown, Filter, Users, TrendingUp, TrendingDown, Check } from 'lucide-react';

interface FunnelChartProps {
  funnelMetrics: StageFunnelMetrics[];
  selectedStage: FunnelStage | null;
  onSelectStage: (stage: FunnelStage | null) => void;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  funnelMetrics,
  selectedStage,
  onSelectStage
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 lg:p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Funil Comercial de Vendas</span>
            {selectedStage && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
                Filtro Ativo: {selectedStage}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500">
            Acompanhamento sequencial da jornada dos leads. Clique em qualquer etapa para filtrar o dashboard.
          </p>
        </div>

        {selectedStage && (
          <button
            onClick={() => onSelectStage(null)}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline self-start sm:self-auto cursor-pointer"
          >
            Limpar filtro de etapa
          </button>
        )}
      </div>

      {/* Visual Pipeline Funnel Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {funnelMetrics.map((item, idx) => {
          const colors = STAGE_COLORS[item.stage];
          const isSelected = selectedStage === item.stage;
          const isLast = idx === funnelMetrics.length - 1;

          return (
            <div key={item.stage} className="flex flex-col items-center">
              {/* Funnel Card */}
              <button
                onClick={() => onSelectStage(isSelected ? null : item.stage)}
                className={`w-full p-4 rounded-xl border text-left transition-all relative group cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/40 shadow-md'
                    : 'bg-slate-50/60 hover:bg-white hover:border-slate-300 border-slate-200 shadow-2xs'
                }`}
              >
                {/* Stage Header & Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${colors.badgeBg}`}>
                    {item.stage}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  )}
                </div>

                {/* Lead Count */}
                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {item.countCurrent}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1.5 font-medium">
                      leads atual
                    </span>
                  </div>
                </div>

                {/* Cumulative / Value info */}
                <div className="mt-2 text-[11px] text-slate-600 font-medium">
                  Valor: <span className="font-semibold text-slate-900">{formatCurrencyBRL(item.valueCurrent)}</span>
                </div>

                {/* Transition & Loss Stats */}
                {!isLast && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Avanço:
                      </span>
                      <span className="font-bold text-emerald-800">
                        {item.conversionToNextPct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-rose-600 font-medium flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Perda:
                      </span>
                      <span className="font-semibold text-rose-700">
                        {item.lossPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {isLast && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Conversão Final:
                      </span>
                      <span className="font-bold text-emerald-800">100%</span>
                    </div>
                  </div>
                )}
              </button>

              {/* Arrow Connector for Desktop/Mobile */}
              {!isLast && (
                <div className="my-2 md:hidden flex justify-center text-slate-400">
                  <ArrowDown className="w-5 h-5 text-slate-400 animate-bounce" />
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

import React from 'react';
import { AlertTriangle, TrendingDown, ArrowRight, Info } from 'lucide-react';

interface BottlenecksCardProps {
  worstStep: string;
  fromStage: string;
  toStage: string;
  lostQuantity: number;
  lostPct: number;
  summaryMessage: string;
}

export const BottlenecksCard: React.FC<BottlenecksCardProps> = ({
  worstStep,
  fromStage,
  toStage,
  lostQuantity,
  lostPct,
  summaryMessage
}) => {
  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-xs p-5 lg:p-6 flex flex-col justify-between bg-linear-to-br from-white via-white to-rose-50/20">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Gargalos do Funil</h3>
          </div>
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
            Maior Evasão
          </span>
        </div>

        {/* Highlighted Stage Box */}
        <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-900 flex items-center gap-1.5">
              <span>{fromStage}</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
              <span>{toStage}</span>
            </span>
            <span className="text-xs font-extrabold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
              -{lostPct.toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-rose-200/50">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Quantidade Perdida</span>
              <span className="text-lg font-extrabold text-slate-900">
                {lostQuantity} leads
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Taxa de Perda</span>
              <span className="text-lg font-extrabold text-rose-600">
                {lostPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Message Box */}
      <div className="mt-5 p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs flex items-start gap-2.5 shadow-xs">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          {summaryMessage}
        </p>
      </div>
    </div>
  );
};

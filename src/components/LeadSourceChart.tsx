import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, Filter } from 'lucide-react';

interface SourceItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface LeadSourceChartProps {
  sources: SourceItem[];
  selectedOrigem: string | null;
  onSelectOrigem: (origem: string | null) => void;
}

export const LeadSourceChart: React.FC<LeadSourceChartProps> = ({
  sources,
  selectedOrigem,
  onSelectOrigem
}) => {
  const total = sources.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 lg:p-6 flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-blue-600" />
            <span>Origem dos Leads</span>
          </h3>
          <p className="text-xs text-slate-500">Distribuição por canal de captação</p>
        </div>

        {selectedOrigem && (
          <button
            onClick={() => onSelectOrigem(null)}
            className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Chart & Legend Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        
        {/* Recharts Pie */}
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sources}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                onClick={(data) => {
                  if (data && data.name) {
                    onSelectOrigem(selectedOrigem === data.name ? null : data.name);
                  }
                }}
                className="cursor-pointer"
              >
                {sources.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    stroke={selectedOrigem === entry.name ? '#1e293b' : 'transparent'}
                    strokeWidth={selectedOrigem === entry.name ? 3 : 1}
                    opacity={selectedOrigem && selectedOrigem !== entry.name ? 0.4 : 1}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value} leads (${((Number(value) / (total || 1)) * 100).toFixed(1)}%)`,
                  name
                ]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  padding: '8px 12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900">{total}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase">Total</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {sources.map((src) => {
            const isSelected = selectedOrigem === src.name;
            return (
              <button
                key={src.name}
                onClick={() => onSelectOrigem(isSelected ? null : src.name)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border border-blue-200 text-blue-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: src.color }}
                  />
                  <span className="truncate">{src.name}</span>
                </div>
                <div className="font-mono text-slate-900 font-semibold shrink-0 ml-2">
                  {src.count} <span className="text-slate-400 text-[10px]">({src.percentage.toFixed(0)}%)</span>
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
};

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { MessageSquareWarning, Filter } from 'lucide-react';

interface ComplaintItem {
  queixa: string;
  count: number;
  percentage: number;
}

interface ComplaintsChartProps {
  complaints: ComplaintItem[];
  selectedQueixa: string | null;
  onSelectQueixa: (queixa: string | null) => void;
}

export const ComplaintsChart: React.FC<ComplaintsChartProps> = ({
  complaints,
  selectedQueixa,
  onSelectQueixa
}) => {
  const topComplaints = complaints.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 lg:p-6 flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="w-4 h-4 text-amber-600" />
            <span>Principais Queixas dos Clientes</span>
          </h3>
          <p className="text-xs text-slate-500">Agrupamento e ranking das maiores dores mencionadas</p>
        </div>

        {selectedQueixa && (
          <button
            onClick={() => onSelectQueixa(null)}
            className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Bar Chart Container */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topComplaints}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="queixa"
              width={140}
              tick={{ fontSize: 11, fill: '#475569' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: any) => [`${value} clientes`, 'Quantidade']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                color: '#fff',
                border: 'none',
                fontSize: '12px',
                padding: '8px 12px'
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 8, 8, 0]}
              onClick={(data) => {
                if (data && data.queixa) {
                  onSelectQueixa(selectedQueixa === data.queixa ? null : data.queixa);
                }
              }}
              className="cursor-pointer"
            >
              {topComplaints.map((entry) => {
                const isSelected = selectedQueixa === entry.queixa;
                return (
                  <Cell
                    key={entry.queixa}
                    fill={isSelected ? '#2563eb' : '#f59e0b'}
                    opacity={selectedQueixa && !isSelected ? 0.4 : 0.9}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranking Table List */}
      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 gap-1.5">
        {topComplaints.map((item, idx) => {
          const isSelected = selectedQueixa === item.queixa;
          return (
            <div
              key={item.queixa}
              onClick={() => onSelectQueixa(isSelected ? null : item.queixa)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                isSelected
                  ? 'bg-amber-50 border border-amber-200 text-amber-900 font-bold'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-4 text-center font-bold text-slate-400 text-[10px]">
                  #{idx + 1}
                </span>
                <span className="truncate">{item.queixa}</span>
              </div>
              <div className="font-semibold text-slate-900 shrink-0 ml-2">
                {item.count} leads <span className="text-slate-400 text-[10px]">({item.percentage.toFixed(0)}%)</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

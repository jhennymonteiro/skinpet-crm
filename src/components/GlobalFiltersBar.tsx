import React from 'react';
import { FilterState, FunnelStage, FUNNEL_STAGES } from '../types';
import { Filter, X, Search, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface GlobalFiltersBarProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onClearFilters: () => void;
  availableOrigens: string[];
  availableQueixas: string[];
}

export const GlobalFiltersBar: React.FC<GlobalFiltersBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  availableOrigens,
  availableQueixas
}) => {
  const hasActiveFilters =
    Boolean(filters.origem) ||
    Boolean(filters.fase) ||
    Boolean(filters.queixa) ||
    Boolean(filters.searchQuery) ||
    filters.valorMin !== null ||
    filters.valorMax !== null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-6 space-y-3">
      
      {/* Top Search & Filter Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search Field (Nome or WhatsApp) */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Pesquisar por Nome ou WhatsApp..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Origem Dropdown */}
          <select
            value={filters.origem || ''}
            onChange={(e) => onFilterChange({ origem: e.target.value || null })}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium"
          >
            <option value="">Todas as Origens</option>
            {availableOrigens.map((origem) => (
              <option key={origem} value={origem}>
                {origem}
              </option>
            ))}
          </select>

          {/* Fase Dropdown */}
          <select
            value={filters.fase || ''}
            onChange={(e) => onFilterChange({ fase: (e.target.value as FunnelStage) || null })}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium"
          >
            <option value="">Todas as Fases</option>
            {FUNNEL_STAGES.map((fase) => (
              <option key={fase} value={fase}>
                {fase}
              </option>
            ))}
          </select>

          {/* Queixa Dropdown */}
          <select
            value={filters.queixa || ''}
            onChange={(e) => onFilterChange({ queixa: e.target.value || null })}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium max-w-[180px] truncate"
          >
            <option value="">Todas as Queixas</option>
            {availableQueixas.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}

        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px]">Filtros ativos:</span>
          
          {filters.origem && (
            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              Origem: {filters.origem}
              <button onClick={() => onFilterChange({ origem: null })} className="hover:text-blue-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.fase && (
            <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              Fase: {filters.fase}
              <button onClick={() => onFilterChange({ fase: null })} className="hover:text-indigo-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.queixa && (
            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              Queixa: {filters.queixa}
              <button onClick={() => onFilterChange({ queixa: null })} className="hover:text-amber-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

    </div>
  );
};

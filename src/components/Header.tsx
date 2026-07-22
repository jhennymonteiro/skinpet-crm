import React, { useState } from 'react';
import { PeriodFilter, SheetsConfig } from '../types';
import { Calendar, RefreshCw, FileSpreadsheet, Plus, Sparkles, Filter } from 'lucide-react';

interface HeaderProps {
  period: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange: (start: string, end: string) => void;
  sheetsConfig: SheetsConfig;
  onOpenSheetsModal: () => void;
  onOpenNewLeadModal: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  viewMode: 'dashboard' | 'kanban';
  onViewModeChange: (mode: 'dashboard' | 'kanban') => void;
}

export const Header: React.FC<HeaderProps> = ({
  period,
  onPeriodChange,
  customStartDate = '',
  customEndDate = '',
  onCustomDateChange,
  sheetsConfig,
  onOpenSheetsModal,
  onOpenNewLeadModal,
  onRefreshData,
  isRefreshing,
  viewMode,
  onViewModeChange
}) => {
  const [showCustomInputs, setShowCustomInputs] = useState(period === 'personalizado');

  const periodOptions: { id: PeriodFilter; label: string }[] = [
    { id: 'hoje', label: 'Hoje' },
    { id: '7d', label: 'Últimos 7 dias' },
    { id: '30d', label: 'Últimos 30 dias' },
    { id: 'mes', label: 'Este mês' },
    { id: 'todos', label: 'Todo o Período' },
    { id: 'personalizado', label: 'Personalizado' },
  ];

  const handlePeriodSelect = (p: PeriodFilter) => {
    onPeriodChange(p);
    setShowCustomInputs(p === 'personalizado');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Dashboard Comercial
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Acompanhamento em tempo real do funil de vendas
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons & Sheet Status */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            
            {/* View Switcher: Dashboard / Kanban */}
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center text-xs font-medium">
              <button
                onClick={() => onViewModeChange('dashboard')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => onViewModeChange('kanban')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quadro Kanban
              </button>
            </div>

            {/* Google Sheets Connection Status Button */}
            <button
              onClick={onOpenSheetsModal}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                sheetsConfig.isConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">
                {sheetsConfig.isConnected ? 'Google Sheets Conectado' : 'Conectar Planilha'}
              </span>
              <span className="sm:hidden">Planilha</span>
              <span className={`w-2 h-2 rounded-full ${sheetsConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </button>

            {/* Manual Sync Refresh */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              title="Atualizar dados da planilha"
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* New Lead Button */}
            <button
              onClick={onOpenNewLeadModal}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Lead</span>
            </button>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mr-2 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              <span>Período:</span>
            </div>
            {periodOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handlePeriodSelect(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer ${
                  period === opt.id
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          {showCustomInputs && (
            <div className="flex items-center gap-2 text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => onCustomDateChange(e.target.value, customEndDate)}
                className="bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-700"
              />
              <span className="text-slate-400">até</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => onCustomDateChange(customStartDate, e.target.value)}
                className="bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-700"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

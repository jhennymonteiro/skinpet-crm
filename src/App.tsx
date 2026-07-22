import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { Lead, FilterState, PeriodFilter, FunnelStage, SheetsConfig, FUNNEL_STAGES } from './types';
import { INITIAL_MOCK_LEADS } from './data/mockLeads';
import {
  filterLeads,
  calculateKpis,
  calculateFunnelMetrics,
  calculateConversionSteps,
  calculateBottlenecks,
  calculateLeadSources,
  calculateComplaints,
  calculateFinancialPipeline
} from './lib/analytics';
import {
  extractSpreadsheetId,
  fetchLeadsFromGoogleSheet,
  syncLeadToAppsScript
} from './lib/sheetsService';

// UI Components
import { Header } from './components/Header';
import { TopKpiCards } from './components/TopKpiCards';
import { FunnelChart } from './components/FunnelChart';
import { ConversionsCard } from './components/ConversionsCard';
import { BottlenecksCard } from './components/BottlenecksCard';
import { LeadSourceChart } from './components/LeadSourceChart';
import { ComplaintsChart } from './components/ComplaintsChart';
import { FinancialPipelineCard } from './components/FinancialPipelineCard';
import { GlobalFiltersBar } from './components/GlobalFiltersBar';
import { LeadsTable } from './components/LeadsTable';
import { KanbanBoard } from './components/KanbanBoard';
import { SheetsModal } from './components/SheetsModal';
import { LeadModal } from './components/LeadModal';

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1kYnu0PDKn9oIOOQqYi2oN4qCt9C-da0sS2P4HuXBbTE/edit?gid=0#gid=0';
const DEFAULT_SPREADSHEET_ID = '1kYnu0PDKn9oIOOQqYi2oN4qCt9C-da0sS2P4HuXBbTE';

export default function App() {
  // Main Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'kanban'>('dashboard');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Google Sheets Config State
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig>({
    sheetUrl: DEFAULT_SHEET_URL,
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    appsScriptUrl: '',
    autoSync: true,
    syncIntervalSeconds: 30,
    lastSyncedAt: null,
    isConnected: true,
    sheetName: 'Sheet1'
  });

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    period: 'todos',
    origem: null,
    fase: null,
    queixa: null,
    searchQuery: '',
    valorMin: null,
    valorMax: null
  });

  // Modal States
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  // Sync / Refresh function to pull latest rows from Google Sheets
  const refreshSheetData = useCallback(async (overrideId?: string, overrideName?: string) => {
    const idToUse = overrideId || sheetsConfig.spreadsheetId || DEFAULT_SPREADSHEET_ID;
    const nameToUse = overrideName || sheetsConfig.sheetName || 'Sheet1';

    if (!idToUse) {
      setConnectionError('Nenhuma planilha configurada.');
      return false;
    }

    setIsRefreshing(true);
    try {
      const fetchedLeads = await fetchLeadsFromGoogleSheet(idToUse, nameToUse);

      if (fetchedLeads && Array.isArray(fetchedLeads)) {
        setLeads(fetchedLeads);
        setSheetsConfig((prev) => ({
          ...prev,
          spreadsheetId: idToUse,
          sheetName: nameToUse,
          isConnected: true,
          lastSyncedAt: new Date().toISOString()
        }));
        setConnectionError(null);

        // Sync with backend proxy
        fetch('/api/leads/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leads: fetchedLeads })
        }).catch(() => {});

        return true;
      } else {
        throw new Error('Nenhum dado retornado pela planilha.');
      }
    } catch (err: any) {
      console.error('Erro ao atualizar planilha:', err);
      setConnectionError(err?.message || 'A conexão com a planilha do Google Sheets falhou e os dados não puderam ser carregados.');
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [sheetsConfig.spreadsheetId, sheetsConfig.sheetName]);

  // Load initial backend server config & leads
  useEffect(() => {
    async function loadInitialData() {
      let currentId = DEFAULT_SPREADSHEET_ID;
      let currentName = 'Sheet1';

      try {
        const configRes = await fetch('/api/config');
        if (configRes.ok) {
          const cfg = await configRes.json();
          if (cfg.spreadsheetId) {
            setSheetsConfig(cfg);
            currentId = cfg.spreadsheetId;
            currentName = cfg.sheetName || 'Sheet1';
          }
        }
      } catch (e) {
        // ignore config fetch error
      }

      await refreshSheetData(currentId, currentName);
    }

    loadInitialData();
  }, [refreshSheetData]);

  // Auto Sync Interval
  useEffect(() => {
    if (!sheetsConfig.autoSync || !sheetsConfig.spreadsheetId || connectionError) return;

    const interval = setInterval(() => {
      refreshSheetData();
    }, (sheetsConfig.syncIntervalSeconds || 30) * 1000);

    return () => clearInterval(interval);
  }, [sheetsConfig.autoSync, sheetsConfig.spreadsheetId, sheetsConfig.syncIntervalSeconds, refreshSheetData, connectionError]);

  // Handle Save Config from Sheets Modal
  const handleSaveSheetsConfig = async (newConfig: Partial<SheetsConfig>) => {
    const extractedId = newConfig.sheetUrl ? extractSpreadsheetId(newConfig.sheetUrl) : sheetsConfig.spreadsheetId;
    
    const updated: SheetsConfig = {
      ...sheetsConfig,
      ...newConfig,
      spreadsheetId: extractedId || '',
      isConnected: Boolean(extractedId || newConfig.appsScriptUrl),
      lastSyncedAt: new Date().toISOString()
    };

    setSheetsConfig(updated);

    // Persist to server
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(() => {});

    // Trigger immediate fetch if spreadsheetId changed
    if (extractedId) {
      setTimeout(() => refreshSheetData(extractedId, newConfig.sheetName || sheetsConfig.sheetName), 100);
    }
  };

  // Test Connection helper for Sheets Modal
  const handleTestConnection = async (sheetUrl: string, sheetName: string) => {
    const id = extractSpreadsheetId(sheetUrl);
    if (!id) {
      return { success: false, message: 'URL ou ID da planilha inválido. Cole o link do Google Sheets.' };
    }

    try {
      const testLeads = await fetchLeadsFromGoogleSheet(id, sheetName || 'Sheet1');
      return {
        success: true,
        message: `Conexão efetuada com sucesso! ${testLeads.length} leads lidos da planilha.`,
        count: testLeads.length
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Falha ao acessar a planilha. Verifique se está compartilhada como pública.'
      };
    }
  };

  // Create or Edit Lead
  const handleSaveLead = async (leadData: Partial<Lead>) => {
    if (leadData.id) {
      // Edit existing
      const updatedList = leads.map((l) => (l.id === leadData.id ? ({ ...l, ...leadData } as Lead) : l));
      setLeads(updatedList);

      // Call API & Apps Script
      fetch(`/api/leads/${leadData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      }).catch(() => {});

      if (sheetsConfig.appsScriptUrl) {
        syncLeadToAppsScript(sheetsConfig.appsScriptUrl, 'UPDATE', leadData);
      }
    } else {
      // Create new
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        nome: leadData.nome || 'Novo Lead',
        whatsapp: leadData.whatsapp || '',
        fase: leadData.fase || 'Entrada',
        valorEstimado: leadData.valorEstimado || 0,
        queixaCliente: leadData.queixaCliente || 'Não informada',
        observacoes: leadData.observacoes || '',
        origemLead: leadData.origemLead || 'Outros',
        createdAt: new Date().toISOString().split('T')[0]
      };

      setLeads((prev) => [newLead, ...prev]);

      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      }).catch(() => {});

      if (sheetsConfig.appsScriptUrl) {
        syncLeadToAppsScript(sheetsConfig.appsScriptUrl, 'CREATE', newLead);
      }
    }
  };

  // Advance stage helper
  const handleAdvanceStage = (lead: Lead) => {
    const currentIndex = FUNNEL_STAGES.indexOf(lead.fase);
    if (currentIndex < FUNNEL_STAGES.length - 2) {
      const nextStage = FUNNEL_STAGES[currentIndex + 1];
      handleUpdateLeadStage(lead, nextStage);
    }
  };

  // Direct Stage Update
  const handleUpdateLeadStage = (lead: Lead, newStage: FunnelStage) => {
    const updatedLead = { ...lead, fase: newStage };
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? updatedLead : l)));

    fetch(`/api/leads/${lead.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fase: newStage })
    }).catch(() => {});

    if (sheetsConfig.appsScriptUrl) {
      syncLeadToAppsScript(sheetsConfig.appsScriptUrl, 'UPDATE', updatedLead);
    }
  };

  // Delete Lead
  const handleDeleteLead = (leadId: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (window.confirm(`Tem certeza que deseja excluir o lead "${targetLead?.nome || 'selecionado'}"?`)) {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));

      fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      }).catch(() => {});

      if (sheetsConfig.appsScriptUrl && targetLead) {
        syncLeadToAppsScript(sheetsConfig.appsScriptUrl, 'DELETE', targetLead);
      }
    }
  };

  // Derived Analytics Data
  const filteredLeads = useMemo(() => filterLeads(leads, filters), [leads, filters]);
  const kpis = useMemo(() => calculateKpis(filteredLeads), [filteredLeads]);
  const funnelMetrics = useMemo(() => calculateFunnelMetrics(filteredLeads), [filteredLeads]);
  const conversionSteps = useMemo(() => calculateConversionSteps(filteredLeads), [filteredLeads]);
  const bottlenecks = useMemo(() => calculateBottlenecks(filteredLeads), [filteredLeads]);
  const leadSources = useMemo(() => calculateLeadSources(filteredLeads), [filteredLeads]);
  const complaints = useMemo(() => calculateComplaints(filteredLeads), [filteredLeads]);
  const financialPipeline = useMemo(() => calculateFinancialPipeline(filteredLeads), [filteredLeads]);

  const availableOrigens = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.origemLead) set.add(l.origemLead);
    });
    return Array.from(set).sort();
  }, [leads]);

  const availableQueixas = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.queixaCliente) set.add(l.queixaCliente);
    });
    return Array.from(set).sort();
  }, [leads]);

  if (connectionError) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between">
        <Header
          period={filters.period}
          onPeriodChange={(period: PeriodFilter) => setFilters((f) => ({ ...f, period }))}
          customStartDate={filters.customStartDate}
          customEndDate={filters.customEndDate}
          onCustomDateChange={(customStartDate, customEndDate) =>
            setFilters((f) => ({ ...f, customStartDate, customEndDate }))
          }
          sheetsConfig={sheetsConfig}
          onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          onOpenNewLeadModal={() => {
            setLeadToEdit(null);
            setIsLeadModalOpen(true);
          }}
          onRefreshData={() => refreshSheetData()}
          isRefreshing={isRefreshing}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <main className="max-w-2xl mx-auto px-4 py-16 text-center my-auto">
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl mb-5 border border-rose-100">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              A conexão com a planilha falhou
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-md leading-relaxed">
              Não foi possível carregar os dados comercial da planilha do Google Sheets. Verifique sua conexão com a internet ou se a planilha permanece acessível.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => refreshSheetData()}
                disabled={isRefreshing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Tentar novamente</span>
              </button>

              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Reconectar planilha</span>
              </button>
            </div>
          </div>
        </main>

        {/* Reconnect Sheets Modal */}
        <SheetsModal
          isOpen={isSheetsModalOpen}
          onClose={() => setIsSheetsModalOpen(false)}
          config={sheetsConfig}
          onSaveConfig={handleSaveSheetsConfig}
          onTestConnection={handleTestConnection}
        />

        <LeadModal
          isOpen={isLeadModalOpen}
          onClose={() => {
            setIsLeadModalOpen(false);
            setLeadToEdit(null);
          }}
          onSave={handleSaveLead}
          leadToEdit={leadToEdit}
          availableOrigens={availableOrigens}
          availableQueixas={availableQueixas}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header Bar */}
      <Header
        period={filters.period}
        onPeriodChange={(period: PeriodFilter) => setFilters((f) => ({ ...f, period }))}
        customStartDate={filters.customStartDate}
        customEndDate={filters.customEndDate}
        onCustomDateChange={(customStartDate, customEndDate) =>
          setFilters((f) => ({ ...f, customStartDate, customEndDate }))
        }
        sheetsConfig={sheetsConfig}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenNewLeadModal={() => {
          setLeadToEdit(null);
          setIsLeadModalOpen(true);
        }}
        onRefreshData={refreshSheetData}
        isRefreshing={isRefreshing}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Global Search & Filters */}
        <GlobalFiltersBar
          filters={filters}
          onFilterChange={(updated) => setFilters((f) => ({ ...f, ...updated }))}
          onClearFilters={() =>
            setFilters({
              period: 'todos',
              origem: null,
              fase: null,
              queixa: null,
              searchQuery: '',
              valorMin: null,
              valorMax: null
            })
          }
          availableOrigens={availableOrigens}
          availableQueixas={availableQueixas}
        />

        {/* View Switch Condition */}
        {viewMode === 'dashboard' ? (
          <>
            {/* Top KPI Cards Row */}
            <TopKpiCards
              totalLeads={kpis.totalLeads}
              totalActiveCount={kpis.totalActiveCount}
              totalFechadosCount={kpis.totalFechadosCount}
              valorFechado={kpis.valorFechado}
              totalPerdidosCount={kpis.totalPerdidosCount}
              valorEmNegociacao={kpis.valorEmNegociacao}
              conversaoGeralPct={kpis.conversaoGeralPct}
            />

            {/* Funil Comercial Visual Component */}
            <FunnelChart
              funnelMetrics={funnelMetrics}
              selectedStage={filters.fase}
              onSelectStage={(fase) => setFilters((f) => ({ ...f, fase }))}
            />

            {/* Middle Analytics Grid: Card de Conversões & Card Gargalos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConversionsCard
                steps={conversionSteps.steps}
                totalFunnelConversionPct={conversionSteps.totalFunnelConversionPct}
                totalEntradas={conversionSteps.totalEntradas}
                totalFechados={conversionSteps.totalFechados}
              />

              <BottlenecksCard
                worstStep={bottlenecks.worstStep}
                fromStage={bottlenecks.fromStage}
                toStage={bottlenecks.toStage}
                lostQuantity={bottlenecks.lostQuantity}
                lostPct={bottlenecks.lostPct}
                summaryMessage={bottlenecks.summaryMessage}
              />
            </div>

            {/* Lower Analytics Grid: Origem dos Leads, Principais Queixas & Pipeline Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LeadSourceChart
                sources={leadSources}
                selectedOrigem={filters.origem}
                onSelectOrigem={(origem) => setFilters((f) => ({ ...f, origem }))}
              />

              <ComplaintsChart
                complaints={complaints}
                selectedQueixa={filters.queixa}
                onSelectQueixa={(queixa) => setFilters((f) => ({ ...f, queixa }))}
              />

              <FinancialPipelineCard
                valorEntrada={financialPipeline.valorEntrada}
                valorConexao={financialPipeline.valorConexao}
                valorOportunidade={financialPipeline.valorOportunidade}
                valorFollowUp={financialPipeline.valorFollowUp}
                valorFechado={financialPipeline.valorFechado}
                valorPerdido={financialPipeline.valorPerdido}
                activePipeline={financialPipeline.activePipeline}
                totalPipeline={financialPipeline.totalPipeline}
              />
            </div>

            {/* Leads Table */}
            <LeadsTable
              leads={filteredLeads}
              onEditLead={(lead) => {
                setLeadToEdit(lead);
                setIsLeadModalOpen(true);
              }}
              onDeleteLead={handleDeleteLead}
              onAdvanceStage={handleAdvanceStage}
              onOpenNewLeadModal={() => {
                setLeadToEdit(null);
                setIsLeadModalOpen(true);
              }}
            />
          </>
        ) : (
          /* Kanban Board Mode */
          <KanbanBoard
            leads={filteredLeads}
            onEditLead={(lead) => {
              setLeadToEdit(lead);
              setIsLeadModalOpen(true);
            }}
            onDeleteLead={handleDeleteLead}
            onUpdateStage={handleUpdateLeadStage}
            onOpenNewLeadModal={() => {
              setLeadToEdit(null);
              setIsLeadModalOpen(true);
            }}
          />
        )}

      </main>

      {/* Modals */}
      <SheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        config={sheetsConfig}
        onSaveConfig={handleSaveSheetsConfig}
        onTestConnection={handleTestConnection}
      />

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setLeadToEdit(null);
        }}
        onSave={handleSaveLead}
        leadToEdit={leadToEdit}
        availableOrigens={availableOrigens}
        availableQueixas={availableQueixas}
      />

    </div>
  );
}

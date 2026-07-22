import { Lead, FilterState, FunnelStage, FUNNEL_STAGES } from '../types';

export function filterLeads(leads: Lead[], filters: FilterState): Lead[] {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return leads.filter((lead) => {
    // 1. Period Filter
    if (lead.createdAt) {
      const leadDateStr = lead.createdAt.split('T')[0];
      
      if (filters.period === 'hoje') {
        if (leadDateStr !== todayStr) return false;
      } else if (filters.period === '7d') {
        const d7 = new Date();
        d7.setDate(d7.getDate() - 7);
        const d7Str = d7.toISOString().split('T')[0];
        if (leadDateStr < d7Str) return false;
      } else if (filters.period === '30d') {
        const d30 = new Date();
        d30.setDate(d30.getDate() - 30);
        const d30Str = d30.toISOString().split('T')[0];
        if (leadDateStr < d30Str) return false;
      } else if (filters.period === 'mes') {
        const currentMonth = todayStr.substring(0, 7); // YYYY-MM
        if (!leadDateStr.startsWith(currentMonth)) return false;
      } else if (filters.period === 'personalizado') {
        if (filters.customStartDate && leadDateStr < filters.customStartDate) return false;
        if (filters.customEndDate && leadDateStr > filters.customEndDate) return false;
      }
    }

    // 2. Origem do lead
    if (filters.origem && lead.origemLead !== filters.origem) {
      return false;
    }

    // 3. Fase
    if (filters.fase && lead.fase !== filters.fase) {
      return false;
    }

    // 4. Queixa
    if (filters.queixa && lead.queixaCliente !== filters.queixa) {
      return false;
    }

    // 5. Valor Estimado range
    if (filters.valorMin !== null && lead.valorEstimado < filters.valorMin) {
      return false;
    }
    if (filters.valorMax !== null && lead.valorEstimado > filters.valorMax) {
      return false;
    }

    // 6. Search Query (Nome or WhatsApp)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = lead.nome.toLowerCase().includes(q);
      const matchPhone = lead.whatsapp.toLowerCase().includes(q);
      const matchObs = lead.observacoes.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchObs) return false;
    }

    return true;
  });
}

/**
 * Top KPI Summary Metrics
 */
export function calculateKpis(leads: Lead[]) {
  const totalLeads = leads.length;

  const activeLeads = leads.filter((l) =>
    ['Entrada', 'Conexão', 'Oportunidade', 'Follow Up'].includes(l.fase)
  );
  const totalActiveCount = activeLeads.length;

  const fechadosLeads = leads.filter((l) => l.fase === 'Negócio Fechado');
  const totalFechadosCount = fechadosLeads.length;
  const valorFechado = fechadosLeads.reduce((sum, l) => sum + (l.valorEstimado || 0), 0);

  const perdidosLeads = leads.filter((l) => l.fase === 'Negócio Perdido');
  const totalPerdidosCount = perdidosLeads.length;

  const valorEmNegociacao = activeLeads.reduce(
    (sum, l) => sum + (l.valorEstimado || 0),
    0
  );

  // Conversão Geral = Fechados / Total Leads (ou Fechados / Entradas)
  const entradasCount = leads.filter(l => l.fase === 'Entrada').length;
  // If we calculate total entry base:
  const conversaoGeralPct = totalLeads > 0 ? (totalFechadosCount / totalLeads) * 100 : 0;

  return {
    totalLeads,
    totalActiveCount,
    totalFechadosCount,
    valorFechado,
    totalPerdidosCount,
    valorEmNegociacao,
    conversaoGeralPct,
    entradasCount
  };
}

/**
 * Funnel Stage Progressions & Conversions
 */
export interface StageFunnelMetrics {
  stage: FunnelStage;
  countCurrent: number;
  countPassed: number;
  valueCurrent: number;
  conversionToNextPct: number;
  lossPct: number;
}

export function calculateFunnelMetrics(leads: Lead[]) {
  // Stage order mapping index
  const stageIndexMap: Record<FunnelStage, number> = {
    'Entrada': 0,
    'Conexão': 1,
    'Oportunidade': 2,
    'Follow Up': 3,
    'Negócio Fechado': 4,
    'Negócio Perdido': 99 // Lost leads exit the main funnel pipeline
  };

  const countsCurrent: Record<FunnelStage, number> = {
    'Entrada': 0,
    'Conexão': 0,
    'Oportunidade': 0,
    'Follow Up': 0,
    'Negócio Fechado': 0,
    'Negócio Perdido': 0
  };

  const valuesCurrent: Record<FunnelStage, number> = {
    'Entrada': 0,
    'Conexão': 0,
    'Oportunidade': 0,
    'Follow Up': 0,
    'Negócio Fechado': 0,
    'Negócio Perdido': 0
  };

  leads.forEach((l) => {
    if (countsCurrent[l.fase] !== undefined) {
      countsCurrent[l.fase]++;
      valuesCurrent[l.fase] += l.valorEstimado || 0;
    }
  });

  // Cumulative leads that reached or passed stage i
  // Any lead in stage i or any higher stage (including Negócio Fechado) passed stage i.
  // Negócio Perdido leads passed stages up to their drop-off (we consider lost from pipeline)
  const countPassed: Record<FunnelStage, number> = {
    'Entrada': leads.length, // All leads entered
    'Conexão': countsCurrent['Conexão'] + countsCurrent['Oportunidade'] + countsCurrent['Follow Up'] + countsCurrent['Negócio Fechado'],
    'Oportunidade': countsCurrent['Oportunidade'] + countsCurrent['Follow Up'] + countsCurrent['Negócio Fechado'],
    'Follow Up': countsCurrent['Follow Up'] + countsCurrent['Negócio Fechado'],
    'Negócio Fechado': countsCurrent['Negócio Fechado'],
    'Negócio Perdido': countsCurrent['Negócio Perdido']
  };

  const mainPipelineStages: FunnelStage[] = [
    'Entrada',
    'Conexão',
    'Oportunidade',
    'Follow Up',
    'Negócio Fechado'
  ];

  const result: StageFunnelMetrics[] = mainPipelineStages.map((stage, idx) => {
    const passed = countPassed[stage];
    let conversionToNextPct = 0;
    let lossPct = 0;

    if (idx < mainPipelineStages.length - 1) {
      const nextStage = mainPipelineStages[idx + 1];
      const nextPassed = countPassed[nextStage];
      if (passed > 0) {
        conversionToNextPct = (nextPassed / passed) * 100;
        lossPct = 100 - conversionToNextPct;
      }
    } else {
      // For Negócio Fechado (final conversion)
      conversionToNextPct = passed > 0 ? 100 : 0;
      lossPct = 0;
    }

    return {
      stage,
      countCurrent: countsCurrent[stage],
      countPassed: passed,
      valueCurrent: valuesCurrent[stage],
      conversionToNextPct,
      lossPct
    };
  });

  return result;
}

/**
 * Stage-by-stage conversions for Conversions Card
 */
export function calculateConversionSteps(leads: Lead[]) {
  const funnel = calculateFunnelMetrics(leads);
  const entradaPassed = funnel.find(f => f.stage === 'Entrada')?.countPassed || 0;
  const conexaoPassed = funnel.find(f => f.stage === 'Conexão')?.countPassed || 0;
  const oportPassed = funnel.find(f => f.stage === 'Oportunidade')?.countPassed || 0;
  const followPassed = funnel.find(f => f.stage === 'Follow Up')?.countPassed || 0;
  const fechadoPassed = funnel.find(f => f.stage === 'Negócio Fechado')?.countPassed || 0;

  const steps = [
    {
      from: 'Entrada' as FunnelStage,
      to: 'Conexão' as FunnelStage,
      title: 'Entrada → Conexão',
      countFrom: entradaPassed,
      countTo: conexaoPassed,
      pct: entradaPassed > 0 ? (conexaoPassed / entradaPassed) * 100 : 0
    },
    {
      from: 'Conexão' as FunnelStage,
      to: 'Oportunidade' as FunnelStage,
      title: 'Conexão → Oportunidade',
      countFrom: conexaoPassed,
      countTo: oportPassed,
      pct: conexaoPassed > 0 ? (oportPassed / conexaoPassed) * 100 : 0
    },
    {
      from: 'Oportunidade' as FunnelStage,
      to: 'Follow Up' as FunnelStage,
      title: 'Oportunidade → Follow Up',
      countFrom: oportPassed,
      countTo: followPassed,
      pct: oportPassed > 0 ? (followPassed / oportPassed) * 100 : 0
    },
    {
      from: 'Follow Up' as FunnelStage,
      to: 'Negócio Fechado' as FunnelStage,
      title: 'Follow Up → Negócio Fechado',
      countFrom: followPassed,
      countTo: fechadoPassed,
      pct: followPassed > 0 ? (fechadoPassed / followPassed) * 100 : 0
    }
  ];

  const totalFunnelConversionPct = entradaPassed > 0 ? (fechadoPassed / entradaPassed) * 100 : 0;

  return {
    steps,
    totalFunnelConversionPct,
    totalEntradas: entradaPassed,
    totalFechados: fechadoPassed
  };
}

/**
 * Gargalos do Funil (Bottlenecks) Calculation
 */
export function calculateBottlenecks(leads: Lead[]) {
  const { steps } = calculateConversionSteps(leads);
  
  if (leads.length === 0) {
    return {
      worstStep: 'Entrada → Conexão',
      fromStage: 'Entrada' as FunnelStage,
      toStage: 'Conexão' as FunnelStage,
      lostQuantity: 0,
      lostPct: 0,
      summaryMessage: 'Nenhum lead cadastrado para análise de gargalos.'
    };
  }

  // Find step with lowest conversion (highest drop-off)
  let worst = steps[0];
  let highestLossCount = worst.countFrom - worst.countTo;
  let highestLossPct = 100 - worst.pct;

  steps.forEach(step => {
    const lossCount = step.countFrom - step.countTo;
    const lossPct = 100 - step.pct;
    
    // Evaluate combined impact (percentage drop and absolute volume lost)
    if (lossPct > highestLossPct && step.countFrom > 0) {
      worst = step;
      highestLossPct = lossPct;
      highestLossCount = lossCount;
    }
  });

  const summaryMessage = `A maior perda de leads ocorre na transição de ${worst.from} para ${worst.to}, com evasão de ${highestLossPct.toFixed(1)}% (${highestLossCount} leads perdidos).`;

  return {
    worstStep: worst.title,
    fromStage: worst.from,
    toStage: worst.to,
    lostQuantity: highestLossCount,
    lostPct: highestLossPct,
    summaryMessage
  };
}

/**
 * Lead Source Breakdown
 */
export function calculateLeadSources(leads: Lead[]) {
  const map: Record<string, number> = {};
  leads.forEach((l) => {
    const source = l.origemLead || 'Outros';
    map[source] = (map[source] || 0) + 1;
  });

  const total = leads.length;
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  const items = Object.entries(map).map(([name, count], index) => ({
    name,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    color: colors[index % colors.length]
  }));

  // Sort descending
  items.sort((a, b) => b.count - a.count);

  return items;
}

/**
 * Complaints Breakdown & Ranking
 */
export function calculateComplaints(leads: Lead[]) {
  const map: Record<string, number> = {};
  leads.forEach((l) => {
    const queixa = l.queixaCliente || 'Não informada';
    map[queixa] = (map[queixa] || 0) + 1;
  });

  const total = leads.length;
  const items = Object.entries(map).map(([queixa, count]) => ({
    queixa,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0
  }));

  items.sort((a, b) => b.count - a.count);

  return items;
}

/**
 * Pipeline Financeiro Breakdown
 */
export function calculateFinancialPipeline(leads: Lead[]) {
  const totals: Record<FunnelStage, number> = {
    'Entrada': 0,
    'Conexão': 0,
    'Oportunidade': 0,
    'Follow Up': 0,
    'Negócio Fechado': 0,
    'Negócio Perdido': 0
  };

  leads.forEach((l) => {
    if (totals[l.fase] !== undefined) {
      totals[l.fase] += l.valorEstimado || 0;
    }
  });

  const totalPipeline = Object.values(totals).reduce((sum, v) => sum + v, 0);
  const activePipeline = totals['Entrada'] + totals['Conexão'] + totals['Oportunidade'] + totals['Follow Up'];

  return {
    valorEntrada: totals['Entrada'],
    valorConexao: totals['Conexão'],
    valorOportunidade: totals['Oportunidade'],
    valorFollowUp: totals['Follow Up'],
    valorFechado: totals['Negócio Fechado'],
    valorPerdido: totals['Negócio Perdido'],
    activePipeline,
    totalPipeline
  };
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value || 0);
}

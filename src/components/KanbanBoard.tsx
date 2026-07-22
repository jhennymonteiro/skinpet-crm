import React from 'react';
import { Lead, FunnelStage, FUNNEL_STAGES, STAGE_COLORS } from '../types';
import { formatCurrencyBRL } from '../lib/analytics';
import { Trash2, MessageCircle } from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateStage: (lead: Lead, newStage: FunnelStage) => void;
  onOpenNewLeadModal: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onEditLead,
  onDeleteLead,
  onUpdateStage,
  onOpenNewLeadModal
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: FunnelStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    const lead = leads.find((l) => l.id === leadId);
    if (lead && lead.fase !== targetStage) {
      onUpdateStage(lead, targetStage);
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
  };

  return (
    <div className="overflow-x-auto pb-4 scrollbar-thin">
      <div className="flex gap-4 min-w-[1100px] items-start">
        {FUNNEL_STAGES.map((stage) => {
          const columnLeads = leads.filter((l) => l.fase === stage);
          const columnTotalValue = columnLeads.reduce((sum, l) => sum + (l.valorEstimado || 0), 0);
          const colors = STAGE_COLORS[stage];

          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="flex-1 bg-slate-100/70 rounded-2xl border border-slate-200 p-3 min-w-[220px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${colors.badgeBg}`}>
                  {stage}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {columnLeads.length}
                </span>
              </div>

              {/* Total Value */}
              <div className="text-[11px] text-slate-500 font-medium mb-3 pb-2 border-b border-slate-200 flex justify-between">
                <span>Total:</span>
                <span className="font-bold text-slate-900">{formatCurrencyBRL(columnTotalValue)}</span>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-2.5 min-h-[300px]">
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-slate-900 leading-tight">
                        {lead.nome}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-extrabold text-blue-600 my-1">
                      {formatCurrencyBRL(lead.valorEstimado)}
                    </div>

                    <div className="text-[11px] text-slate-500 truncate" title={lead.queixaCliente}>
                      {lead.queixaCliente}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">
                        {lead.origemLead}
                      </span>
                      {lead.whatsapp && (
                        <a
                          href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline flex items-center gap-0.5"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Whats</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {columnLeads.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    Nenhum lead nesta fase
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Lead, FunnelStage, FUNNEL_STAGES } from '../types';
import { X, Save, User, Phone, DollarSign, HelpCircle, FileText, Tag } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Partial<Lead>) => void;
  leadToEdit?: Lead | null;
  availableOrigens: string[];
  availableQueixas: string[];
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  leadToEdit,
  availableOrigens,
  availableQueixas
}) => {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fase, setFase] = useState<FunnelStage>('Entrada');
  const [valorEstimado, setValorEstimado] = useState<number | ''>(0);
  const [queixaCliente, setQueixaCliente] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [origemLead, setOrigemLead] = useState('');
  const [customQueixa, setCustomQueixa] = useState('');
  const [customOrigem, setCustomOrigem] = useState('');

  useEffect(() => {
    if (leadToEdit) {
      setNome(leadToEdit.nome || '');
      setWhatsapp(leadToEdit.whatsapp || '');
      setFase(leadToEdit.fase || 'Entrada');
      setValorEstimado(leadToEdit.valorEstimado ?? 0);
      setQueixaCliente(leadToEdit.queixaCliente || '');
      setObservacoes(leadToEdit.observacoes || '');
      setOrigemLead(leadToEdit.origemLead || 'Anúncio Meta');
    } else {
      setNome('');
      setWhatsapp('');
      setFase('Entrada');
      setValorEstimado(0);
      setQueixaCliente(availableQueixas[0] || 'Preço elevado');
      setObservacoes('');
      setOrigemLead(availableOrigens[0] || 'Google Ads');
    }
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const finalOrigem = origemLead === 'OUTRO' ? customOrigem : origemLead;
    const finalQueixa = queixaCliente === 'OUTRO' ? customQueixa : queixaCliente;

    onSave({
      ...(leadToEdit ? { id: leadToEdit.id } : {}),
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      fase,
      valorEstimado: typeof valorEstimado === 'number' ? valorEstimado : 0,
      queixaCliente: finalQueixa || 'Não informada',
      observacoes: observacoes.trim(),
      origemLead: finalOrigem || 'Outros'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-base font-bold text-slate-900">
            {leadToEdit ? 'Editar Lead Comercial' : 'Cadastrar Novo Lead'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Cliente / Empresa *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silva"
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* WhatsApp & Valor Estimado Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp / Telefone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor Estimado (R$)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={valorEstimado}
                  onChange={(e) => setValorEstimado(e.target.value ? Number(e.target.value) : '')}
                  placeholder="10000"
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Fase & Origem Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Etapa do Funil
              </label>
              <select
                value={fase}
                onChange={(e) => setFase(e.target.value as FunnelStage)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold"
              >
                {FUNNEL_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Origem do Lead
              </label>
              <select
                value={origemLead}
                onChange={(e) => setOrigemLead(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              >
                {availableOrigens.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
                <option value="OUTRO">+ Nova Origem...</option>
              </select>
              {origemLead === 'OUTRO' && (
                <input
                  type="text"
                  placeholder="Nome do canal de origem"
                  value={customOrigem}
                  onChange={(e) => setCustomOrigem(e.target.value)}
                  className="w-full mt-2 text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Queixa do Cliente */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Queixa / Dor do Cliente
            </label>
            <select
              value={queixaCliente}
              onChange={(e) => setQueixaCliente(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              {availableQueixas.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
              <option value="OUTRO">+ Nova Queixa...</option>
            </select>
            {queixaCliente === 'OUTRO' && (
              <input
                type="text"
                placeholder="Descreva a queixa do cliente"
                value={customQueixa}
                onChange={(e) => setCustomQueixa(e.target.value)}
                className="w-full mt-2 text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Comercial
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações sobre a negociação, reuniões, próximos passos..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{leadToEdit ? 'Salvar Alterações' : 'Cadastrar Lead'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

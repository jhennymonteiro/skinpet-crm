import { Lead } from '../types';

function getFormattedDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysOffset);
  return d.toISOString().split('T')[0];
}

export const INITIAL_MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    nome: 'Carlos Eduardo Silva',
    whatsapp: '(11) 98765-4321',
    fase: 'Negócio Fechado',
    valorEstimado: 12500,
    queixaCliente: 'Preço elevado',
    observacoes: 'Fechou contrato anual de consultoria comercial com 10% de desconto à vista.',
    origemLead: 'Google Ads',
    createdAt: getFormattedDate(0) // Today
  },
  {
    id: 'lead-2',
    nome: 'Mariana Costa Ferreira',
    whatsapp: '(21) 99887-6543',
    fase: 'Follow Up',
    valorEstimado: 8000,
    queixaCliente: 'Falta de orçamento',
    observacoes: 'Aguardando aprovação da diretoria financeira na próxima terça-feira.',
    origemLead: 'Instagram',
    createdAt: getFormattedDate(1)
  },
  {
    id: 'lead-3',
    nome: 'Lucas Mendes Rocha',
    whatsapp: '(31) 97654-3210',
    fase: 'Oportunidade',
    valorEstimado: 15000,
    queixaCliente: 'Procura solução customizada',
    observacoes: 'Apresentação da proposta agendada. Interessado no módulo avançado de BI.',
    origemLead: 'Indicação',
    createdAt: getFormattedDate(2)
  },
  {
    id: 'lead-4',
    nome: 'Fernanda Lima Oliveira',
    whatsapp: '(41) 98877-1122',
    fase: 'Conexão',
    valorEstimado: 6500,
    queixaCliente: 'Demora na implantação',
    observacoes: 'Primeiro contato realizado por telefone. Pediu envio do portfólio.',
    origemLead: 'Anúncio Meta',
    createdAt: getFormattedDate(3)
  },
  {
    id: 'lead-5',
    nome: 'Rafael Albuquerque',
    whatsapp: '(51) 99123-4455',
    fase: 'Entrada',
    valorEstimado: 9500,
    queixaCliente: 'Integração com ERP atual',
    observacoes: 'Lead vindo de formulário no site. Aguardando qualificação inicial.',
    origemLead: 'Orgânico',
    createdAt: getFormattedDate(0) // Today
  },
  {
    id: 'lead-6',
    nome: 'Beatriz Vasconcelos',
    whatsapp: '(19) 98223-9988',
    fase: 'Negócio Fechado',
    valorEstimado: 22000,
    queixaCliente: 'Procura solução customizada',
    observacoes: 'Assinou contrato Enterprise. Início do onboarding na próxima semana.',
    origemLead: 'Indicação',
    createdAt: getFormattedDate(4)
  },
  {
    id: 'lead-7',
    nome: 'Thiago Nogueira',
    whatsapp: '(81) 99765-8899',
    fase: 'Negócio Perdido',
    valorEstimado: 5000,
    queixaCliente: 'Falta de orçamento',
    observacoes: 'Optou por concorrente com preço inferior e menor escopo.',
    origemLead: 'Google Ads',
    createdAt: getFormattedDate(5)
  },
  {
    id: 'lead-8',
    nome: 'Camila Santos Prado',
    whatsapp: '(11) 97112-3344',
    fase: 'Follow Up',
    valorEstimado: 18000,
    queixaCliente: 'Preço elevado',
    observacoes: 'Solicitou revisão comercial da proposta de implantação.',
    origemLead: 'Anúncio Meta',
    createdAt: getFormattedDate(6)
  },
  {
    id: 'lead-9',
    nome: 'Rodrigo Barbosa',
    whatsapp: '(27) 98811-2233',
    fase: 'Oportunidade',
    valorEstimado: 11000,
    queixaCliente: 'Sem tempo para implantar',
    observacoes: 'Reunião de alinhamento com a equipe técnica realizada.',
    origemLead: 'Instagram',
    createdAt: getFormattedDate(8)
  },
  {
    id: 'lead-10',
    nome: 'Juliana Paes de Souza',
    whatsapp: '(31) 99221-5566',
    fase: 'Negócio Fechado',
    valorEstimado: 14000,
    queixaCliente: 'Integração com ERP atual',
    observacoes: 'Fechou plano semestral corporativo.',
    origemLead: 'Google Ads',
    createdAt: getFormattedDate(10)
  },
  {
    id: 'lead-11',
    nome: 'Gabriel Antunes',
    whatsapp: '(48) 98443-2211',
    fase: 'Conexão',
    valorEstimado: 7500,
    queixaCliente: 'Falta de orçamento',
    observacoes: 'Mensagem enviada via WhatsApp. Aguardando resposta.',
    origemLead: 'Orgânico',
    createdAt: getFormattedDate(12)
  },
  {
    id: 'lead-12',
    nome: 'Patricia Duarte',
    whatsapp: '(61) 99654-7788',
    fase: 'Entrada',
    valorEstimado: 10000,
    queixaCliente: 'Demora na implantação',
    observacoes: 'Baixou e-book no site. Lead cadastrado no CRM.',
    origemLead: 'Anúncio Meta',
    createdAt: getFormattedDate(0) // Today
  },
  {
    id: 'lead-13',
    nome: 'Marcelo Ribeiro',
    whatsapp: '(11) 98334-5566',
    fase: 'Negócio Perdido',
    valorEstimado: 16000,
    queixaCliente: 'Preço elevado',
    observacoes: 'Achou o investimento fora do orçamento anual.',
    origemLead: 'Google Ads',
    createdAt: getFormattedDate(15)
  },
  {
    id: 'lead-14',
    nome: 'Aline Martins',
    whatsapp: '(71) 99345-6677',
    fase: 'Follow Up',
    valorEstimado: 13500,
    queixaCliente: 'Procura solução customizada',
    observacoes: 'Ajustando detalhes da proposta comercial.',
    origemLead: 'Indicação',
    createdAt: getFormattedDate(18)
  },
  {
    id: 'lead-15',
    nome: 'Felipe Camargo',
    whatsapp: '(85) 98711-4433',
    fase: 'Oportunidade',
    valorEstimado: 9000,
    queixaCliente: 'Sem tempo para implantar',
    observacoes: 'Demonstração do sistema concluída com sucesso.',
    origemLead: 'Instagram',
    createdAt: getFormattedDate(20)
  },
  {
    id: 'lead-16',
    nome: 'Vanessa Castro',
    whatsapp: '(11) 97445-8899',
    fase: 'Negócio Fechado',
    valorEstimado: 25000,
    queixaCliente: 'Preço elevado',
    observacoes: 'Fechou pacote completo com suporte dedicado 24/7.',
    origemLead: 'Indicação',
    createdAt: getFormattedDate(22)
  },
  {
    id: 'lead-17',
    nome: 'Bruno Carvalho',
    whatsapp: '(41) 99112-7788',
    fase: 'Negócio Perdido',
    valorEstimado: 6000,
    queixaCliente: 'Demora na implantação',
    observacoes: 'Precisava de implantação em menos de 48 horas.',
    origemLead: 'Orgânico',
    createdAt: getFormattedDate(25)
  },
  {
    id: 'lead-18',
    nome: 'Renata Farias',
    whatsapp: '(21) 98123-6655',
    fase: 'Conexão',
    valorEstimado: 8500,
    queixaCliente: 'Falta de orçamento',
    observacoes: 'Ligação realizada, agendado retorno para apresentação.',
    origemLead: 'Google Ads',
    createdAt: getFormattedDate(28)
  },
  {
    id: 'lead-19',
    nome: 'Eduardo Guimarães',
    whatsapp: '(31) 99876-1122',
    fase: 'Entrada',
    valorEstimado: 11500,
    queixaCliente: 'Integração com ERP atual',
    observacoes: 'Preencheu formulário de contato do site hoje.',
    origemLead: 'Anúncio Meta',
    createdAt: getFormattedDate(1)
  },
  {
    id: 'lead-20',
    nome: 'Larissa Gonzaga',
    whatsapp: '(19) 98776-5544',
    fase: 'Negócio Fechado',
    valorEstimado: 17500,
    queixaCliente: 'Procura solução customizada',
    observacoes: 'Contrato assinado digitalmente via ZapSign.',
    origemLead: 'Indicação',
    createdAt: getFormattedDate(29)
  }
];

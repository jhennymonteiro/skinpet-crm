import Papa from 'papaparse';
import { Lead, FunnelStage, FUNNEL_STAGES } from '../types';

export function extractSpreadsheetId(url: string): string | null {
  if (!url) return null;
  // Match standard spreadsheet ID pattern in Google Sheets URLs
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If the user pasted just the ID itself
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(url.trim())) {
    return url.trim();
  }
  return null;
}

export function buildCsvUrl(spreadsheetId: string, sheetName: string = 'Sheet1'): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

/**
 * Normalizes string header to standard property name
 */
function normalizeHeader(header: string): string {
  const clean = header.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove accents
  
  if (clean.includes('nome')) return 'nome';
  if (clean.includes('whatsapp') || clean.includes('telefone') || clean.includes('whats')) return 'whatsapp';
  if (clean.includes('fase') || clean.includes('etapa') || clean.includes('status')) return 'fase';
  if (clean.includes('valor')) return 'valorEstimado';
  if (clean.includes('queixa') || clean.includes('dor') || clean.includes('problema')) return 'queixaCliente';
  if (clean.includes('obs') || clean.includes('observacao') || clean.includes('observacoes')) return 'observacoes';
  if (clean.includes('origem') || clean.includes('canal') || clean.includes('fonte')) return 'origemLead';
  if (clean.includes('data') || clean.includes('criado') || clean.includes('created')) return 'createdAt';
  return header.trim();
}

/**
 * Clean & map raw string values to valid FunnelStage
 */
function parseFunnelStage(raw: string): FunnelStage {
  if (!raw) return 'Entrada';
  const clean = raw.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (clean.includes('entrada') || clean.includes('novo') || clean.includes('lead')) return 'Entrada';
  if (clean.includes('conexao') || clean.includes('contato') || clean.includes('agendad')) return 'Conexão';
  if (clean.includes('oportunidade') || clean.includes('proposta') || clean.includes('demo')) return 'Oportunidade';
  if (clean.includes('follow') || clean.includes('negociacao') || clean.includes('analise')) return 'Follow Up';
  if (clean.includes('fechado') || clean.includes('ganho') || clean.includes('venda')) return 'Negócio Fechado';
  if (clean.includes('perdido') || clean.includes('cancelado') || clean.includes('recusad')) return 'Negócio Perdido';
  
  // Direct match fallback
  const directMatch = FUNNEL_STAGES.find(s => s.toLowerCase() === raw.trim().toLowerCase());
  return directMatch || 'Entrada';
}

/**
 * Parse currency string or number to float
 */
function parseCurrency(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = String(val).replace('R$', '').replace(/\s/g, '');
  // Brazilian format 1.250,50 -> 1250.50 or US 1250.50
  if (str.includes(',') && str.includes('.')) {
    // 1.250,50
    const normalized = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  } else if (str.includes(',')) {
    const normalized = str.replace(',', '.');
    return parseFloat(normalized) || 0;
  }
  return parseFloat(str) || 0;
}

/**
 * Fetches and parses CSV from a public Google Sheets URL or CSV endpoint
 */
export async function fetchLeadsFromGoogleSheet(spreadsheetId: string, sheetName: string = 'Sheet1'): Promise<Lead[]> {
  const csvUrl = buildCsvUrl(spreadsheetId, sheetName);
  
  const response = await fetch(csvUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Não foi possível acessar a planilha. Verifique se o link está público ("Qualquer pessoa com o link pode ver"). Status HTTP: ${response.status}`);
  }
  
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const leads: Lead[] = results.data.map((row: any, idx: number) => {
            // Map raw row object using normalized keys
            const rowMap: Record<string, any> = {};
            Object.keys(row).forEach(key => {
              const normKey = normalizeHeader(key);
              rowMap[normKey] = row[key];
            });

            const nome = rowMap.nome || rowMap['Nome'] || `Lead #${idx + 1}`;
            const whatsapp = rowMap.whatsapp || rowMap['WhatsApp'] || '-';
            const fase = parseFunnelStage(rowMap.fase || rowMap['Fase'] || '');
            const valorEstimado = parseCurrency(rowMap.valorEstimado || rowMap['Valor estimado'] || 0);
            const queixaCliente = rowMap.queixaCliente || rowMap['Queixa do cliente'] || 'Não informada';
            const observacoes = rowMap.observacoes || rowMap['Observações'] || '';
            const origemLead = rowMap.origemLead || rowMap['Origem do lead'] || 'Outros';
            const createdAt = rowMap.createdAt || new Date().toISOString().split('T')[0];

            return {
              id: rowMap.id || `sheet-lead-${idx + 1}-${Date.now()}`,
              nome,
              whatsapp,
              fase,
              valorEstimado,
              queixaCliente,
              observacoes,
              origemLead,
              createdAt
            };
          });

          // Filter out header or corrupted empty rows
          const validLeads = leads.filter(l => l.nome && l.nome !== 'Nome');
          resolve(validLeads);
        } catch (err) {
          reject(err);
        }
      },
      error: (err: any) => {
        reject(err);
      }
    });
  });
}

/**
 * Sends a mutation request to Google Apps Script Web App (if configured) or Server Proxy
 */
export async function syncLeadToAppsScript(
  appsScriptUrl: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  lead: Partial<Lead>
): Promise<boolean> {
  if (!appsScriptUrl) return false;

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors', // Standard Google Apps Script Web App requirement for simple cross-origin POST
      body: JSON.stringify({
        action,
        lead
      }),
    });
    return true;
  } catch (err) {
    console.error('Erro ao sincronizar com Google Apps Script:', err);
    return false;
  }
}

/**
 * Code snippet template for Google Apps Script 2-way immediate sheet synchronization
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Código do Google Apps Script para Sincronização em Tempo Real do Dashboard Comercial
 * 
 * Instruções:
 * 1. Abra sua planilha do Google Sheets.
 * 2. Clique no menu "Extensões" > "Apps Script".
 * 3. Apague todo o código existente e cole este código completo.
 * 4. Clique em "Implantar" > "Nova implantação".
 * 5. Clique no ícone de engrenagem ao lado de "Selecione o tipo" e escolha "App da Web".
 * 6. Em "Quem pode acessar", selecione "Qualquer pessoa" (Qualquer um).
 * 7. Clique em "Implantar" e copie o URL do App da Web gerado.
 * 8. Cole o URL no campo "URL do Google Apps Script" no Dashboard Comercial.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var action = data.action;
    var lead = data.lead;
    
    var values = sheet.getDataRange().getValues();
    if (values.length === 0) {
      // Criar cabeçalhos se a planilha estiver vazia
      sheet.appendRow(["Nome", "WhatsApp", "Fase", "Valor estimado", "Queixa do cliente", "Observações", "Origem do lead"]);
    }
    
    if (action === "CREATE") {
      sheet.appendRow([
        lead.nome || "",
        lead.whatsapp || "",
        lead.fase || "Entrada",
        lead.valorEstimado || 0,
        lead.queixaCliente || "",
        lead.observacoes || "",
        lead.origemLead || "Outros"
      ]);
      return responseJSON({ status: "success", message: "Lead adicionado com sucesso" });
    }
    
    if (action === "UPDATE") {
      // Procurar pelo Nome ou WhatsApp para atualizar a linha
      for (var i = 1; i < values.length; i++) {
        var rowName = values[i][0];
        var rowPhone = values[i][1];
        if (rowName == lead.nome || (lead.id && rowName.indexOf(lead.id) !== -1)) {
          sheet.getRange(i + 1, 1, 1, 7).setValues([[
            lead.nome || values[i][0],
            lead.whatsapp || values[i][1],
            lead.fase || values[i][2],
            lead.valorEstimado !== undefined ? lead.valorEstimado : values[i][3],
            lead.queixaCliente || values[i][4],
            lead.observacoes || values[i][5],
            lead.origemLead || values[i][6]
          ]]);
          return responseJSON({ status: "success", message: "Lead atualizado" });
        }
      }
      // Se não encontrou para atualizar, cria
      sheet.appendRow([
        lead.nome || "",
        lead.whatsapp || "",
        lead.fase || "Entrada",
        lead.valorEstimado || 0,
        lead.queixaCliente || "",
        lead.observacoes || "",
        lead.origemLead || "Outros"
      ]);
      return responseJSON({ status: "success", message: "Lead inserido" });
    }
    
    if (action === "DELETE") {
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] == lead.nome || values[i][1] == lead.whatsapp) {
          sheet.deleteRow(i + 1);
          return responseJSON({ status: "success", message: "Lead removido" });
        }
      }
    }
    
    return responseJSON({ status: "ok" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

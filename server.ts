import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_MOCK_LEADS } from './src/data/mockLeads';
import { Lead } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data state acting as live sheet proxy/cache
  let storedLeads: Lead[] = [...INITIAL_MOCK_LEADS];
  let config = {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1kYnu0PDKn9oIOOQqYi2oN4qCt9C-da0sS2P4HuXBbTE/edit?gid=0#gid=0',
    spreadsheetId: '1kYnu0PDKn9oIOOQqYi2oN4qCt9C-da0sS2P4HuXBbTE',
    sheetName: 'Sheet1',
    appsScriptUrl: '',
    autoSync: true,
    syncIntervalSeconds: 30,
    lastSyncedAt: new Date().toISOString(),
    isConnected: true
  };

  // API Routes

  // GET Config
  app.get('/api/config', (req, res) => {
    res.json(config);
  });

  // POST Config
  app.post('/api/config', (req, res) => {
    const { sheetUrl, spreadsheetId, sheetName, appsScriptUrl, autoSync } = req.body;
    
    config = {
      ...config,
      sheetUrl: sheetUrl !== undefined ? sheetUrl : config.sheetUrl,
      spreadsheetId: spreadsheetId !== undefined ? spreadsheetId : config.spreadsheetId,
      sheetName: sheetName || config.sheetName || 'Sheet1',
      appsScriptUrl: appsScriptUrl !== undefined ? appsScriptUrl : config.appsScriptUrl,
      autoSync: autoSync !== undefined ? autoSync : config.autoSync,
      isConnected: Boolean(spreadsheetId || appsScriptUrl),
      lastSyncedAt: new Date().toISOString()
    };

    res.json({ status: 'ok', config });
  });

  // GET Leads
  app.get('/api/leads', (req, res) => {
    res.json(storedLeads);
  });

  // POST Leads (Bulk replace or Sync)
  app.post('/api/leads/sync', (req, res) => {
    if (Array.isArray(req.body.leads)) {
      storedLeads = req.body.leads;
      config.lastSyncedAt = new Date().toISOString();
      res.json({ status: 'ok', count: storedLeads.length });
    } else {
      res.status(400).json({ error: 'Array de leads inválido' });
    }
  });

  // CREATE Single Lead
  app.post('/api/leads', (req, res) => {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      nome: req.body.nome || 'Novo Lead',
      whatsapp: req.body.whatsapp || '',
      fase: req.body.fase || 'Entrada',
      valorEstimado: Number(req.body.valorEstimado) || 0,
      queixaCliente: req.body.queixaCliente || 'Não informada',
      observacoes: req.body.observacoes || '',
      origemLead: req.body.origemLead || 'Outros',
      createdAt: req.body.createdAt || new Date().toISOString().split('T')[0]
    };

    storedLeads.unshift(newLead);
    config.lastSyncedAt = new Date().toISOString();
    res.json({ status: 'ok', lead: newLead });
  });

  // UPDATE Single Lead
  app.put('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    const index = storedLeads.findIndex(l => l.id === id || l.nome === req.body.nome);

    if (index !== -1) {
      storedLeads[index] = {
        ...storedLeads[index],
        ...req.body
      };
      config.lastSyncedAt = new Date().toISOString();
      res.json({ status: 'ok', lead: storedLeads[index] });
    } else {
      res.status(404).json({ error: 'Lead não encontrado' });
    }
  });

  // DELETE Single Lead
  app.delete('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    storedLeads = storedLeads.filter(l => l.id !== id);
    config.lastSyncedAt = new Date().toISOString();
    res.json({ status: 'ok' });
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer();

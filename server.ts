import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// Initialize Database
const db = new Database('claims.db');

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL UNIQUE,
    network TEXT NOT NULL,
    amount INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL,
    ref_code TEXT
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_code TEXT NOT NULL UNIQUE,
    max_uses INTEGER NOT NULL,
    current_uses INTEGER DEFAULT 0,
    amount INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-admin';

// Middleware for Admin Auth
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// TCI Data Hub API Configuration
// Hardcoding the new URL and Key to bypass the old ones currently set in your AI Studio Secrets.
let TCI_API_URL = 'https://sabuss.com/vtu/api';

const TCI_API_KEY = '2IB6MAH7F4XNYUDbQEKZ3LJSdPGc1e8WC9a0fOVR5T6032CBEL5fJa8veAG0bbDj9kF';
const TCI_ACCOUNT_PIN = process.env.TCI_ACCOUNT_PIN;
const TCI_TRANSACTION_PIN = process.env.TCI_TRANSACTION_PIN;

// Helper to check balance
async function checkBalance() {
  if (!TCI_API_KEY) {
    console.warn('TCI_API_KEY not set. Simulating balance check.');
    return { balance: 5000 };
  }
  
  const url = `${TCI_API_URL}/balance/${TCI_API_KEY}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      // Truncate HTML error responses to avoid massive logs
      const errorSnippet = text.includes('<!DOCTYPE html>') ? '404 HTML Page Returned (Check API URL)' : text.slice(0, 200);
      throw new Error(`Failed to fetch balance from ${url}: ${response.status} ${errorSnippet}`);
    }
    const data = await response.json();
    return { balance: data.user?.wallet_balance || data.balance || 0 };
  } catch (error) {
    console.error('Balance check error:', error);
    throw error;
  }
}

// Helper to send airtime
async function sendAirtime(network: string, phone: string, amount: number) {
  if (!TCI_API_KEY) {
    console.warn('TCI_API_KEY not set. Simulating airtime send.');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, message: 'Simulated successful transaction' };
  }

  // Map network names to TCI network IDs (adjust as needed based on actual TCI docs)
  const networkMap: Record<string, number> = {
    'MTN': 1,
    'GLO': 2,
    'AIRTEL': 3,
    '9MOBILE': 4
  };

  const networkId = networkMap[network.toUpperCase()];
  const url = `${TCI_API_URL}/buy/${TCI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        network: networkId,
        amount: amount,
        mobile_number: phone,
        Ported_number: true,
        airtime_type: "VTU",
        pin: TCI_TRANSACTION_PIN || "1234" // Add pin if required by the new API
      })
    });

    if (!response.ok) {
      const text = await response.text();
      const errorSnippet = text.includes('<!DOCTYPE html>') ? '404 HTML Page Returned (Check API URL)' : text.slice(0, 200);
      throw new Error(`Transaction failed at ${url}: ${response.status} ${errorSnippet}`);
    }

    const data = await response.json();
    if (data.status === 'fail') {
      throw new Error(data.message || 'Transaction failed');
    }
    return { success: true, message: 'Transaction successful', data };
  } catch (error) {
    console.error('Airtime send error:', error);
    throw error;
  }
}

// API Routes
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.get('/api/admin/campaigns', authenticateAdmin, (req, res) => {
  const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
  res.json(campaigns);
});

app.post('/api/admin/campaigns', authenticateAdmin, (req, res) => {
  const { ref_code, max_uses, amount } = req.body;
  if (!ref_code || !max_uses || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    db.prepare('INSERT INTO campaigns (ref_code, max_uses, amount) VALUES (?, ?, ?)')
      .run(ref_code, max_uses, amount);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: 'Ref code might already exist' });
  }
});

app.put('/api/admin/campaigns/:id', authenticateAdmin, (req, res) => {
  const { is_active } = req.body;
  db.prepare('UPDATE campaigns SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.get('/api/admin/claims', authenticateAdmin, (req, res) => {
  const claims = db.prepare('SELECT * FROM claims ORDER BY timestamp DESC LIMIT 100').all();
  res.json(claims);
});

app.get('/api/balance', async (req, res) => {
  try {
    const result = await checkBalance();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/claim', async (req, res) => {
  const { phone, network, refCode } = req.body;

  if (!phone || !network) {
    return res.status(400).json({ error: 'Phone number and network are required' });
  }
  
  if (!refCode) {
    return res.status(400).json({ error: 'A valid reference code is required' });
  }

  // Basic phone number validation (Nigerian format)
  if (!/^(070|080|081|090|091)\d{8}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format. Use 080...' });
  }

  try {
    // Check campaign validity
    const campaign: any = db.prepare('SELECT * FROM campaigns WHERE ref_code = ?').get(refCode);
    if (!campaign) {
      return res.status(400).json({ error: 'Invalid reference code' });
    }
    if (!campaign.is_active) {
      return res.status(400).json({ error: 'This reference code is no longer active' });
    }
    if (campaign.current_uses >= campaign.max_uses) {
      return res.status(400).json({ error: 'This reference code has reached its maximum usage limit' });
    }

    const amount = campaign.amount;

    // Check if number already claimed
    const existingClaim = db.prepare('SELECT * FROM claims WHERE phone = ?').get(phone);
    if (existingClaim) {
      return res.status(400).json({ error: 'This number has already claimed airtime.' });
    }

    // Check balance
    try {
      const { balance } = await checkBalance();
      if (balance < amount) {
        return res.status(500).json({ error: 'Insufficient admin wallet balance.' });
      }
    } catch (balanceError) {
      console.warn('Could not verify balance, proceeding with claim attempt...', balanceError);
      // Proceed anyway, the topup API will fail if balance is insufficient
    }

    // Send airtime
    const result = await sendAirtime(network, phone, amount);

    // Record claim and update campaign usage
    const transaction = db.transaction(() => {
      db.prepare('INSERT INTO claims (phone, network, amount, status, ref_code) VALUES (?, ?, ?, ?, ?)')
        .run(phone, network, amount, 'success', refCode);
      db.prepare('UPDATE campaigns SET current_uses = current_uses + 1 WHERE id = ?')
        .run(campaign.id);
    });
    transaction();

    res.json({ success: true, message: 'Airtime claimed successfully!' });
  } catch (error: any) {
    console.error('Claim error:', error);
    res.status(500).json({ error: error.message || 'Failed to process claim' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

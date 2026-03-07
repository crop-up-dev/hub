# Node.js Backend Setup Guide

This guide walks you through building the backend API that connects to this frontend.

## Architecture

```
Frontend (React/Vite)  →  API calls via fetch  →  Node.js/Express  →  PostgreSQL
```

The frontend API layer is in `src/lib/api.ts` and `src/lib/api-config.ts`.

---

## Step 1: Initialize the Backend Project

```bash
mkdir hub-backend && cd hub-backend
npm init -y
npm install express cors bcryptjs jsonwebtoken pg dotenv uuid
npm install -D typescript @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/pg @types/uuid ts-node nodemon
npx tsc --init
```

## Step 2: Environment Variables

Create `.env`:
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/hub_trading
JWT_SECRET=your-secret-key-change-this
```

## Step 3: Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolios
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  usdt_balance DECIMAL(20,8) DEFAULT 10000,
  btc_balance DECIMAL(20,8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pair VARCHAR(20) DEFAULT 'BTC/USDT',
  side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
  type VARCHAR(6) NOT NULL CHECK (type IN ('market', 'limit')),
  price DECIMAL(20,8) NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  total DECIMAL(20,8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Balance History
CREATE TABLE balance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(20,8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar TEXT DEFAULT '',
  settings JSONB DEFAULT '{"defaultOrderType":"market","notifications":true,"currency":"USD"}'
);

-- Transactions (send/receive requests)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(7) NOT NULL CHECK (type IN ('send', 'receive')),
  asset VARCHAR(10) NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  address TEXT NOT NULL,
  fee DECIMAL(20,8) DEFAULT 0,
  fee_percent DECIMAL(10,4) DEFAULT 0,
  net_amount DECIMAL(20,8) DEFAULT 0,
  status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(100),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Wallet Configs
CREATE TABLE admin_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  asset VARCHAR(10) NOT NULL,
  receiver_address TEXT DEFAULT '',
  qr_data TEXT DEFAULT '',
  balance DECIMAL(20,8) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by VARCHAR(100),
  UNIQUE(user_id, asset)
);

-- Seed admin user (password: Crop@2026)
INSERT INTO users (email, password_hash, display_name, role)
VALUES ('cropup4@gmail.com', '$2a$10$..hash..', 'Admin', 'admin');
```

## Step 4: Express Server Skeleton

Create `src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import authRoutes from './routes/auth';
import portfolioRoutes from './routes/portfolio';
import profileRoutes from './routes/profile';
import transactionRoutes from './routes/transactions';
import adminWalletRoutes from './routes/admin-wallets';

dotenv.config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors({ origin: '*' }));
app.use(express.json());

// Make pool available to routes
app.locals.pool = pool;

app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminWalletRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
```

## Step 5: Auth Routes (`src/routes/auth.ts`)

```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  const pool = req.app.locals.pool;
  
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) return res.status(400).json({ error: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3)',
    [email.toLowerCase(), hash, displayName]
  );
  
  // Also create portfolio
  const user = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  await pool.query('INSERT INTO portfolios (user_id) VALUES ($1)', [user.rows[0].id]);
  await pool.query('INSERT INTO profiles (user_id) VALUES ($1)', [user.rows[0].id]);

  res.json({ success: true });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const pool = req.app.locals.pool;

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: new Date(user.created_at).getTime(),
    },
  });
});

// GET /api/auth/me (requires auth middleware)
router.get('/me', authMiddleware, async (req, res) => {
  const pool = req.app.locals.pool;
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [(req as any).userId]);
  const user = result.rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id, email: user.email, displayName: user.display_name,
    role: user.role, isActive: user.is_active, createdAt: new Date(user.created_at).getTime(),
  });
});

// Middleware
function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export default router;
export { authMiddleware };
```

## Step 6: Connect Frontend to Backend

In the frontend, create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_BACKEND=true
```

Then restart the frontend dev server. The API layer (`src/lib/api-config.ts`) reads these variables.

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT token |
| POST | `/api/auth/logout` | Logout (client-side) |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/users` | List all users (admin) |
| PUT | `/api/auth/users/:id/role` | Update user role (admin) |
| PUT | `/api/auth/users/:id/toggle-active` | Toggle user active (admin) |
| DELETE | `/api/auth/users/:id` | Delete user (admin) |
| GET | `/api/portfolio` | Get user portfolio |
| PUT | `/api/portfolio` | Update portfolio |
| POST | `/api/portfolio/trade` | Execute a trade |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| POST | `/api/transactions` | Create transaction request |
| GET | `/api/transactions` | Get all transactions (admin) |
| GET | `/api/transactions/user/:id` | Get user's transactions |
| GET | `/api/transactions/pending` | Get pending transactions |
| PUT | `/api/transactions/:id/approve` | Approve transaction (admin) |
| PUT | `/api/transactions/:id/reject` | Reject transaction (admin) |
| GET | `/api/admin/wallets` | Get all wallet configs (admin) |
| GET | `/api/admin/wallets/:userId/:asset` | Get specific wallet config |
| PUT | `/api/admin/wallets` | Update wallet config (admin) |

## Step 7: Run

```bash
# Terminal 1 - Backend
cd hub-backend
npx nodemon src/index.ts

# Terminal 2 - Frontend  
cd hub-frontend
npm run dev
```

The frontend will automatically use the backend when `VITE_USE_BACKEND=true`. When the backend is unavailable, it gracefully falls back to localStorage.

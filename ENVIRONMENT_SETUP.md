# 🔧 Environment Setup Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js v18+ ([download](https://nodejs.org/))
- MongoDB Community ([download](https://www.mongodb.com/try/download/community)) or MongoDB Atlas account
- Git

### Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create .env file (copy this)
cat > .env << EOF
# Database
MONGODB_URI=mongodb://localhost:27017/amalthea

# Security (generate with: openssl rand -hex 32)
JWT_SECRET=your-secure-random-string-here
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Environment
NODE_ENV=development
PORT=5000
EOF

# 3. Start MongoDB (if local)
mongod  # in another terminal

# 4. Seed demo data
npm run seed:demo

# 5. Start backend
npm run dev
# Should see: "Server running on http://localhost:5000"
```

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000
EOF

# 3. Start development server
npm start
# Should open: http://localhost:3000
```

---

## Environment Variables Reference

### Backend (.env)

```env
# ========== DATABASE ==========
MONGODB_URI=mongodb://localhost:27017/amalthea
# For MongoDB Atlas: mongodb+srv://user:password@cluster.mongodb.net/amalthea?retryWrites=true&w=majority

# ========== AUTHENTICATION ==========
JWT_SECRET=your-super-secret-key-minimum-32-characters
# Generate: openssl rand -hex 32
JWT_EXPIRY=7d

# ========== CORS & SECURITY ==========
CORS_ORIGIN=http://localhost:3000
# Production: https://your-frontend-domain.com

# ========== SERVER CONFIG ==========
NODE_ENV=development
# Options: development, production, test
PORT=5000

# ========== OPTIONAL: EMAIL (for future notifications) ==========
# SENDGRID_API_KEY=SG.xxxxx
# EMAIL_FROM=noreply@amalthea.com

# ========== OPTIONAL: LOGGING ==========
# LOG_LEVEL=debug
# Options: debug, info, warn, error
```

**Generate a secure JWT_SECRET:**
```bash
# macOS/Linux
openssl rand -hex 32

# Windows (PowerShell)
[BitConverter]::ToString([byte[]]@((1..32 | ForEach-Object { Get-Random -Maximum 256 }))) -replace '-', ''
```

### Frontend (.env)

```env
# ========== API CONFIGURATION ==========
REACT_APP_API_URL=http://localhost:5000
# Production: https://your-backend-url.onrender.com
```

**Note:** React environment variables must start with `REACT_APP_`

### Frontend (.env.production)

Used only during `npm run build`:
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

---

## MongoDB Setup

### Option 1: Local MongoDB

**Install & Run:**
```bash
# macOS (with Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
sudo apt-get install -y mongodb
sudo systemctl start mongodb

# Windows (Download Community Server)
# Run installer from https://www.mongodb.com/try/download/community
```

**Verify Connection:**
```bash
mongosh  # mongo shell
# Should connect to: mongodb://localhost:27017
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a free cluster
4. Create a database user:
   - Username: `amalthea_user`
   - Password: Generate strong password
5. Add IP whitelist (click "Add My Current IP" or allow all for testing)
6. Copy connection string: `mongodb+srv://user:password@cluster.mongodb.net/amalthea?...`
7. Add to `.env` as `MONGODB_URI`

---

## Production Environment (Render.com)

### Backend Environment Variables (Set in Render Dashboard)

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/amalthea?retryWrites=true&w=majority
JWT_SECRET=<generate-with-openssl-rand-hex-32>
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
PORT=5000
```

### Frontend Environment Variables (Set During Build)

Create `.env.production` in frontend folder:
```env
REACT_APP_API_URL=https://your-render-backend-url.onrender.com
```

Or set as build command environment:
```bash
REACT_APP_API_URL=https://your-render-backend-url.onrender.com npm run build
```

---

## Demo Accounts (Seeded Data)

After running `npm run seed:demo`, use these credentials:

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| demo.admin | Demo123! | Admin | System oversight, metrics, rules |
| maya.roy | Demo123! | Manager | Approvals, team oversight |
| rajeev.kumar | Demo123! | Manager | Parallel approvals test |
| emma.chen | Demo123! | Employee | Expense submission |
| alex.johnson | Demo123! | Employee | Secondary employee |

**Company:** Amalthea Travel (seeded with multiple approval rules and mixed expense states)

---

## Troubleshooting

### Backend Won't Start

**Error: "Connect ECONNREFUSED 127.0.0.1:27017"**
- MongoDB not running
- Solution: `mongod` or `brew services start mongodb-community`

**Error: "JWT_SECRET is not set"**
- Missing .env file
- Solution: Create .env with all required variables (see template above)

**Error: "Port 5000 already in use"**
- Another service using port 5000
- Solution: Change PORT in .env or kill process: `lsof -i :5000` → `kill -9 <PID>`

### Frontend Won't Start

**Error: "Port 3000 already in use"**
- Change port: `npm start -- --port 3001`

**Error: "REACT_APP_API_URL is not defined"**
- .env not loaded
- Solution: Create .env file and restart dev server
- Verify: Should see "API URL: http://localhost:5000" in browser console

**Error: "Cannot POST /auth/signin"**
- Backend not running
- Solution: Start backend first with `npm run dev`

### Sign-In Fails

**Error: "Invalid credentials"**
- Check username/password (case-sensitive)
- Verify seed data: `npm run seed:demo`

**Error: "401 Unauthorized"**
- JWT_SECRET mismatch between backend/frontend
- Restart both services

### Production Deployment Issues

**Error: "Cannot connect to MongoDB"**
- MongoDB URI incorrect
- IP whitelist missing in MongoDB Atlas
- Solution: Check connection string, verify IP

**Error: "CORS error in browser console"**
- Frontend URL not in CORS_ORIGIN
- Solution: Update CORS_ORIGIN in backend .env

**Error: "Frontend loads but shows 404 on API calls"**
- REACT_APP_API_URL wrong
- Solution: Verify frontend env vars during build
- Check: `window.location.href` in browser console to see actual URL

---

## Database Seeding

### Seed Demo Data

```bash
cd backend
npm run seed:demo
```

**Creates:**
- 1 company (Amalthea Travel)
- 1 admin (demo.admin)
- 2 managers (maya.roy, rajeev.kumar)
- 5 employees (emma.chen, alex.johnson, + 3 others)
- 3 approval rules (sequential, percentage, specific approver)
- 12 expenses (pending/approved/rejected mix)

**Deterministic:** Same data every run (safe to reset)

### Custom Seeding

Edit `backend/scripts/seedDemo.js` to customize:
- Company name, country, currency
- User accounts and roles
- Approval rule configurations
- Expense amounts and statuses

---

## Development Workflow

### 1. Start Services (Terminal 1: Backend)
```bash
cd backend
npm run dev
```

### 2. Start Frontend (Terminal 2: Frontend)
```bash
cd frontend
npm start
```

### 3. Seed Demo Data (Terminal 3: Backend)
```bash
cd backend
npm run seed:demo
```

### 4. Test Flow
1. Open http://localhost:3000
2. Sign in with `demo.admin` / `Demo123!`
3. Check Admin Dashboard metrics
4. Sign out and sign in as `emma.chen`
5. Submit an expense
6. Sign out and sign in as `maya.roy`
7. Approve the expense

---

## Production Build & Deployment

### Build Frontend

```bash
cd frontend
npm run build
# Creates /build folder with optimized production bundle
```

**Output:**
- Size: ~107KB gzipped (good for web)
- No warnings or errors
- Ready to deploy

### Deploy to Render

**Backend Service:**
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables (MongoDB URI, JWT_SECRET, etc.)
7. Deploy

**Frontend Service (if separate):**
1. Build locally: `npm run build`
2. Create Static Site on Render
3. Upload `/build` folder
4. Or use separate service with `npm start` command

### Verify Deployment

```bash
# Test backend health
curl https://your-backend-url.onrender.com/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"demo.admin","password":"Demo123!"}'

# Should return JWT token in response
```

---

## Security Best Practices

1. **Never commit .env files** (add to .gitignore)
2. **Generate unique JWT_SECRET** for each environment
3. **Use HTTPS in production** (Render handles automatically)
4. **Rotate JWT_SECRET periodically** (invalidates all tokens)
5. **Limit CORS to your frontend domain only**
6. **Use strong MongoDB passwords** (20+ characters)
7. **Enable MongoDB IP whitelist** (Render IPs)
8. **Monitor logs for errors** (Render dashboard)

---

## Monitoring & Logs

### Backend Logs (Render)
- Go to Render Dashboard → Your Service → Logs
- Check for errors, warnings, startup messages

### Frontend Logs (Browser)
- Open DevTools (F12)
- Console tab shows API calls, errors
- Network tab shows API response times

### Database Logs (MongoDB Atlas)
- Go to Clusters → Your Cluster → Logs
- Monitor connection issues, slow queries

---

## Useful Commands

```bash
# Backend
npm run dev              # Start development server
npm run build            # Build for production (if needed)
npm run seed:demo        # Seed demo data
npm run seed:clean       # Clear demo data (if added)

# Frontend
npm start                # Start dev server
npm run build            # Build for production
npm run serve            # Serve production build locally
npm test                 # Run tests (if configured)

# Database
mongosh                  # Connect to MongoDB shell
db.users.find()         # Query collections
db.expenses.deleteMany({}) # Clear collection (dangerous!)

# Git
git log --oneline        # See commit history
git diff                 # See uncommitted changes
git status               # Current branch status
```

---

## Checklists

### Pre-Production Checklist
- [ ] All environment variables set correctly
- [ ] No hardcoded secrets in code
- [ ] Database backups enabled
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Rate limiting on auth endpoints (optional but recommended)
- [ ] Frontend build passes with no warnings

### Weekly Maintenance
- [ ] Check error logs
- [ ] Review MongoDB Atlas metrics
- [ ] Test signin flow
- [ ] Verify backup status
- [ ] Update dependencies (if new patches)

---

## Support & Help

- **Backend Issues?** Check `backend/server.js` and controller files
- **Frontend Issues?** Check browser console and `frontend/src/App.jsx`
- **Database Issues?** Verify MongoDB connection, IP whitelist, and credentials
- **Render Deployment?** Check Render logs and environment variables

For more help, see `DEPLOYMENT_CHECKLIST.md` and `DEMO_DAY_GUIDE.md`.

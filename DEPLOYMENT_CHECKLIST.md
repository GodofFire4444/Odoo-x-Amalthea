# 🚀 Deployment Readiness Checklist

## Pre-Deployment Verification (Local)

### Backend Setup
- [ ] Node.js v18+ installed
- [ ] MongoDB running locally (or connection string verified)
- [ ] `.env` file created with all required variables:
  - `MONGODB_URI` = MongoDB connection string
  - `JWT_SECRET` = secure random string (32+ chars)
  - `CORS_ORIGIN` = frontend URL
  - `NODE_ENV` = `production` (for deployment)
  - `PORT` = 5000 (or deployment port)
- [ ] Seed data verified: `npm run seed:demo` completes without errors
- [ ] API endpoints tested locally:
  - POST `/auth/signin` (test with demo account)
  - GET `/users` (requires auth)
  - POST `/expenses` (requires auth)
  - GET `/expenses/pending/approvals` (manager only)
- [ ] Backend starts without errors: `npm start`

### Frontend Setup
- [ ] Node.js v18+ installed
- [ ] `.env` file created with:
  - `REACT_APP_API_URL` = backend URL (e.g., `http://localhost:5000`)
- [ ] Production build passes: `npm run build`
  - No build errors or warnings
  - Output folder size reasonable (~100KB gzipped)
- [ ] All pages accessible and functional
  - SignIn displays demo account chips
  - Home dashboard loads after auth
  - All three role dashboards render correctly
  - No console errors

### Cross-Browser & Mobile Testing
- [ ] Desktop (Chrome, Firefox, Safari) - all pages responsive
- [ ] Mobile (iOS Safari, Chrome Mobile) - touch interactions work
- [ ] Tablet view (iPad, Android tablet) - layout adapts correctly
- [ ] Toast notifications appear correctly on all screens
- [ ] Forms submit cleanly on mobile without layout breaking

---

## Deployment Target: Render.com (or Similar Platform)

### Backend Deployment

**Step 1: Prepare Backend Repository**
- [ ] Verify `package.json` includes all dependencies:
  ```json
  {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  }
  ```
- [ ] Ensure `start` script in `package.json`:
  ```json
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
  ```
- [ ] Verify `server.js` reads `PORT` from environment (default to 5000)
- [ ] Backend serves frontend build in production:
  ```javascript
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
  }
  ```

**Step 2: Create Render Service**
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. **Configuration:**
   - Name: `amalthea-expense-backend`
   - Environment: `Node`
   - Region: Closest to your users
   - Branch: `main` (or your production branch)
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add Environment Variables (from `.env` template):
   ```
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<generate-secure-random-string>
   CORS_ORIGIN=<your-frontend-url>
   NODE_ENV=production
   ```
6. Deploy

**Step 3: Verify Backend Deployment**
- [ ] Service shows "Live"
- [ ] Health check endpoint responds: `curl https://your-render-url.onrender.com/api/health` (if implemented)
- [ ] Test signin: `curl -X POST https://your-render-url.onrender.com/auth/signin -d '...'`
- [ ] Check logs for errors: View in Render dashboard

### Frontend Deployment

**Step 1: Prepare Frontend for Production**
- [ ] Update `REACT_APP_API_URL` in `.env.production`:
  ```
  REACT_APP_API_URL=https://your-backend-url.onrender.com
  ```
- [ ] Build frontend: `npm run build`
- [ ] Verify output size and no warnings
- [ ] Test build locally: `npm run serve` (if using `serve` package)

**Step 2: Deploy to Render (as Static Site or Integrated)**

**Option A: Integrated with Backend (Recommended)**
- Backend serves frontend build from `/build` folder
- Single Render service handles both
- No separate frontend deployment needed

**Option B: Separate Frontend Deployment**
1. Build frontend: `npm run build`
2. Deploy `/build` folder to Render Static Site or Vercel
3. Ensure `REACT_APP_API_URL` points to backend service

**Step 3: Verify Frontend Deployment**
- [ ] Frontend loads at `https://your-render-url.onrender.com`
- [ ] Sign in page displays with demo chips
- [ ] Can authenticate with demo account
- [ ] Dashboards load data from live backend
- [ ] API calls use correct backend URL

---

## Environment Variables Checklist

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/amalthea

# Security
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Environment
NODE_ENV=production
PORT=5000

# Optional: Email service (if implementing notifications)
# SENDGRID_API_KEY=...
# EMAIL_FROM=noreply@amalthea.com
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

---

## Database Setup (MongoDB Atlas)

- [ ] MongoDB Atlas account created (https://www.mongodb.com/cloud/atlas)
- [ ] Cluster created (free tier OK for demo)
- [ ] Database user created with strong password
- [ ] IP whitelist includes Render.com IPs (or allow all: `0.0.0.0/0` for testing)
- [ ] Connection string copied to `MONGODB_URI`
- [ ] Test connection from backend: `npm run seed:demo` (after deployment)

---

## Security Checklist

- [ ] **JWT_SECRET**: Generated with `openssl rand -hex 32` or similar (NOT hardcoded)
- [ ] **HTTPS Only**: All external communication over HTTPS
- [ ] **CORS**: Properly configured to frontend domain only
- [ ] **No Secrets in Git**: `.env` files added to `.gitignore`
- [ ] **Password Hashing**: Bcrypt used (verify in `authController.js`)
- [ ] **Auth Tokens**: JWT verified on all protected routes
- [ ] **Rate Limiting**: Consider adding (e.g., express-rate-limit) for auth endpoints
- [ ] **Database**: MongoDB user has minimal required permissions
- [ ] **HTTPS Redirect**: Backend redirects HTTP → HTTPS

---

## Monitoring & Rollback

### Health Checks
- [ ] Render configured to health check endpoint
- [ ] Backend responds to `GET /api/health` (if implemented)
- [ ] Frontend loads and communicates with backend

### Logging
- [ ] Backend logs errors to console (captured by Render logs)
- [ ] Frontend errors visible in browser console
- [ ] Important events logged (auth, approvals, errors)

### Fallback/Rollback Strategy
1. **If Backend Fails:**
   - Render auto-restarts service
   - If persistent, revert to last known-good commit
   - Check MongoDB connection and logs
   - Verify environment variables are set

2. **If Frontend Fails:**
   - Rebuild and redeploy from main branch
   - Clear browser cache: Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
   - Check backend is still running

3. **If Database Fails:**
   - Verify MongoDB Atlas cluster status
   - Check IP whitelist and connection string
   - Test local fallback if available

4. **Revert Strategy:**
   ```bash
   # On GitHub, revert to last known-good commit
   git revert <commit-hash>
   git push origin main
   # Render auto-redeploys
   ```

---

## Performance Checklist

- [ ] Frontend bundle size < 150KB (gzipped)
- [ ] Backend response times < 500ms (typical)
- [ ] Database indexes on frequently queried fields
- [ ] API endpoints optimized (no N+1 queries)
- [ ] Images/assets lazy-loaded where applicable
- [ ] Caching headers configured for static assets

---

## Post-Deployment

### First 24 Hours
- [ ] Monitor Render logs for errors
- [ ] Test all user flows on production
- [ ] Verify seed data is accessible
- [ ] Check email notifications (if implemented)
- [ ] Monitor uptime and response times

### Ongoing
- [ ] Set up monitoring alerts (Render built-in, or Datadog/New Relic)
- [ ] Regular backups of MongoDB
- [ ] Weekly log review for anomalies
- [ ] Monthly security updates for dependencies
- [ ] Performance monitoring and optimization

---

## Demo Day Readiness

- [ ] Backend and frontend both deployed and live
- [ ] Deterministic seed data loaded (`npm run seed:demo`)
- [ ] Demo accounts accessible and functional
- [ ] All three role dashboards working
- [ ] Network stable for presentation
- [ ] Backup device/laptop ready
- [ ] Offline demo video prepared (if internet fails)
- [ ] Talking points and pitch ready

See `DEMO_DAY_GUIDE.md` for detailed demo walkthrough.

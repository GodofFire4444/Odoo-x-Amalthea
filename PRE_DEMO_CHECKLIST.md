# 🚀 PRE-DEMO EXECUTION CHECKLIST

## Phase 1: Setup (30 minutes before)

### Backend Preparation
- [ ] Open terminal in `backend/` folder
- [ ] Run: `npm install` (if not done)
- [ ] Check `.env` file exists with:
  - `MONGODB_URI=mongodb+srv://Anish:eray%40aratrika@prototypes.afvtwa1.mongodb.net/?appName=Prototypes`
  - `JWT_SECRET=2227d6b4780ac619cfe6a456a0034588`
  - `NODE_ENV=development`
  - `PORT=5000`
- [ ] Start backend: `npm run dev`
- [ ] **Wait for:** "Server running on port 5000" + "Connected to MongoDB"

### Frontend Preparation
- [ ] Open **new** terminal in `frontend/` folder
- [ ] Run: `npm install` (if not done)
- [ ] Start frontend: `npm start`
- [ ] **Wait for:** Browser opens to http://localhost:3000
- [ ] Check browser console (F12) - **should be empty, no errors**

### Seed Data Reset
- [ ] Go back to backend terminal
- [ ] Run: `npm run seed:demo`
- [ ] **Wait for:** "Demo data seeded successfully"
- [ ] Should see output like:
  ```
  ✓ Company created: Amalthea Travel
  ✓ Users created: 8 total
  ✓ Approval rules: 3 created
  ✓ Sample expenses: 12 created
  ```

---

## Phase 2: Quick Smoke Test (10 minutes)

### Test 1: Sign In Works
1. Go to http://localhost:3000/signin
2. Click "Demo Account" chip for **demo.admin**
3. Username should auto-fill: `demo.admin`
4. Password: `Demo123!`
5. Click "Sign In"
6. **Expect:** Redirects to home page, user badge shows "demo.admin"

### Test 2: Admin Dashboard
1. Click "Admin Dashboard" button on home
2. **Expect:** See stats cards (total employees, pending expenses, etc.)
3. Check tabs: "Employees", "Expenses", "Approval Rules"
4. **Expect:** No red errors in browser console (F12)

### Test 3: Sign Out & Manager Login
1. Click logout (red button in top-right)
2. **Expect:** Redirected to signin
3. Sign in as **maya.roy** (manager)
4. Password: `Demo123!`
5. Click "Manager Dashboard"
6. **Expect:** See pending approvals list

### Test 4: Employee View
1. Sign out
2. Sign in as **ava.chen** (employee)
3. Password: `Demo123!`
4. Click "Employee Dashboard"
5. **Expect:** See "My Expenses" cards and list

### Test 5: Expense Submission
1. On Employee Dashboard, click "Submit New Expense"
2. Fill form:
   - Amount: `500`
   - Currency: `USD`
   - Category: `Travel`
   - Description: `Demo trip`
   - Date: (today)
3. Click "Submit"
4. **Expect:** Green toast: "Expense created successfully"
5. **Expect:** New expense appears in list below

### Test 6: Approval Flow
1. Copy the expense ID from the list (or note it)
2. Sign out, sign in as **maya.roy**
3. Go to Manager Dashboard
4. Find the expense from "ava.chen"
5. Click "Approve"
6. **Expect:** Green toast: "Expense approved"
7. **Expect:** Expense moves out of pending list

---

## Phase 3: Demo Script (5 minutes - what you'll actually show)

### The 5-Minute Demo Flow

**Slide 1: Landing Page**
- Show home page with product intro
- Highlight: "OCR Receipt Scanning", "Approval Workflows", "Multi-Currency"

**Slide 2: Employee Submission (as ava.chen)**
1. Sign in with demo.ava.chen / Demo123!
2. Go to Employee Dashboard
3. Click "Submit New Expense"
4. **DEMO:** Fill expense for $2500 flight (high amount)
5. Category: Travel, Date: today
6. **DEMO:** Click "📸 Scan Receipt" (optional - skip if camera not available)
7. Submit expense
8. **Show:** Green toast, expense appears in list with "pending" status

**Slide 3: Approval Workflow (as maya.roy)**
1. Sign out
2. Sign in as maya.roy / Demo123!
3. Go to Manager Dashboard
4. **SHOW:** Workflow stages visualization
5. Find the $2500 expense
6. **DEMO:** Click "Approve"
7. **SHOW:** Toast feedback, expense status updates

**Slide 4: Admin Oversight (as demo.admin)**
1. Sign out
2. Sign in as demo.admin / Demo123!
3. Go to Admin Dashboard
4. **SHOW:** Stats cards (total approved, pending, employees)
5. Go to "Expenses" tab
6. **SHOW:** Expense shows as approved
7. Go to "Approval Rules" tab
8. **SHOW:** Rules list (Travel Policy, Executive Travel, Shared Oversight)
9. **Optional:** Create new rule (or skip if time tight)

**Slide 5: Summary**
- Show responsive design on tablet/mobile view
- Show toast system feedback
- Recap: Multi-currency, OCR, workflow automation, role-based access

---

## Phase 4: What To Do If Issues Occur

### If Backend Fails to Start
```bash
# Check MongoDB connection
npm run seed:demo
# If that works, backend is fine

# If MongoDB fails:
# - Check internet connection
# - Check MONGODB_URI in .env
# - Try: mongosh --uri "your_connection_string"
```

### If Frontend Won't Load
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start

# Check for conflicting process on port 3000
# Linux/Mac: lsof -i :3000
# Windows: netstat -ano | findstr :3000
```

### If Seed Script Fails
```bash
# Clean and retry
npm run seed:demo

# If still fails, check:
# - MongoDB connection working
# - .env has MONGODB_URI
# - Backend is running (npm run dev)
```

### If Expense Doesn't Submit
1. Check browser console (F12) for error message
2. Check backend terminal for error log
3. Try refreshing page (F5)
4. If error persists, restart both frontend & backend

### If Approval Workflow Seems Stuck
1. Refresh page (F5)
2. Sign out and sign in again
3. Navigate to Admin Dashboard → Expenses to see current state
4. This is normal - just refresh to see updates

---

## Demo Account Passwords

**All use:** `Demo123!`

| Username | Role | Use Case |
|----------|------|----------|
| demo.admin | Admin | See dashboard metrics, manage rules & employees |
| maya.roy | Manager | Approve expenses |
| samir.kaul | Manager | Approve expenses (sequential) |
| ava.chen | Employee | Submit expenses |
| noah.patel | Employee | Submit expenses |
| leo.garcia | Employee | Submit expenses |
| mia.fernandez | Employee | Submit expenses |
| jules.park | Employee | Submit expenses |

---

## Network & Performance Checklist

- [ ] Internet connection stable (wifi or ethernet)
- [ ] Browser dev tools closed (F12) - for cleaner performance
- [ ] No other tabs with heavy sites open (YouTube, Gmail in background)
- [ ] Only necessary apps running
- [ ] Backup: Have offline demo video ready (or screenshots)
- [ ] Backup: Have laptop connected to projector before demo starts

---

## Emergency Failsafe

### If Everything Breaks 5 Minutes Before Demo

1. **Screenshot fallback:**
   - Show pre-recorded screenshots of workflow
   - Walk judges through step-by-step

2. **Offline video:**
   - Have 2-minute demo video recorded (demo.mp4)
   - Play in browser or VLC

3. **Pitch pivot:**
   - Explain architecture & workflow on whiteboard
   - Show code snippets in IDE
   - Judges appreciate technical depth

---

## Browser Developer Tools Notes

**To Check Network Requests:**
- F12 → Network tab
- Do an action (e.g., submit expense)
- Look for POST request to `/expenses`
- Should see response: `{ success: true, data: { expense: ... } }`

**To Check Console Logs:**
- F12 → Console tab
- Should see: No red errors (warnings OK)
- Should see: No `undefined` being accessed

**To Test Mobile Responsive:**
- F12 → Toggle device toolbar (Ctrl+Shift+M)
- Set to iPhone 12 / iPad view
- Verify layout works

---

## Final Sanity Checks (5 minutes before start)

```bash
# Terminal 1: Backend
✓ Server running on port 5000
✓ Connected to MongoDB
✓ No error logs

# Terminal 2: Frontend
✓ App running on localhost:3000
✓ Browser shows home page
✓ No console errors (F12 → Console)

# Data:
✓ Login as demo.admin works
✓ Login as maya.roy works  
✓ Login as ava.chen works
✓ Can view dashboards without errors
```

**If all 10 items ✓, you're ready to demo!**

---

## Talking Points During Demo

### For Judges
- **Problem:** "Expense reimbursement is painful for distributed teams"
- **Solution:** "One-click submission, multi-currency, smart routing"
- **Wow Factor:** "OCR scans receipts automatically"
- **Business Model:** "B2B SaaS for finance teams"
- **Traction:** "Seed data shows real-world workflows"

### Handle Objections
- **"Can't we just use Expensify?"**
  - "Our workflow engine is more customizable"
  - "Better for regulated industries needing audit trails"
  
- **"How do you handle fraud?"**
  - "Role-based approvals prevent individual override"
  - "Audit trail tracks every action"
  - "Flags high-amount expenses for manual review"

- **"What about tax compliance?"**
  - "Stores receipt images and extracted data"
  - "Helps with tax audits"

---

## Post-Demo Follow-Up

After demo completes:
- [ ] Get judge feedback on pain point
- [ ] Ask: "Would you use this at your company?"
- [ ] Collect email for follow-up
- [ ] Offer: "We'll deploy to production next month"

---

## Success Metrics

You crushed it if judges say:
- ✅ "That's smooth and professional"
- ✅ "I see how this saves time"
- ✅ "Love the OCR feature"
- ✅ "The workflows are flexible"
- ✅ "You're technically sound"

---

## Time Allocation

- **0-1 min:** Landing page + intro
- **1-3 min:** Employee submission + OCR (optional)
- **3-4 min:** Manager approval workflow
- **4-5 min:** Admin oversight + rules
- **5+ min:** Q&A and follow-up

**Total: ~5 minutes + questions**

---

**Remember:** Demos fail when something unexpected happens. You've tested the happy path. If you hit the 10-item checklist above and everything works, you're golden. If something breaks:
1. Breathe
2. Have your failsafe ready (video/screenshots)
3. Pivot to architecture discussion
4. Judges care more about your understanding than perfect execution

**You've got this! 🚀**

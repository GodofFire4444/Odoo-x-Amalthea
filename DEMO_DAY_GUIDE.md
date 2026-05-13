# 📋 Demo Day Guide: 5-Minute Presentation Flow

## Pre-Demo Checklist (15 minutes before)

- [ ] Close all unnecessary applications
- [ ] Open demo site in Chrome (full screen)
- [ ] Test backend/frontend are both responding
- [ ] Run `npm run seed:demo` in backend (fresh demo data)
- [ ] Test one signin flow to verify it works
- [ ] Prepare backup: Screen recording or offline demo video
- [ ] Have internet failover ready (mobile hotspot)
- [ ] Font sizes readable from 20 feet away

---

## 5-Minute Demo Flow

### **Minute 0:00 – 0:30: Problem & Vision (Elevator Pitch)**

**What to Say:**
> "Expense management is broken. Employees spend hours tracking receipts. Managers struggle with approval workflows. Finance teams can't standardize global travel costs.
>
> Amalthea solves this with an intelligent workflow engine. Smart OCR captures receipts instantly. Flexible approval rules adapt to any company structure. Multi-currency support handles global teams. Everything happens in real-time."

**Visual:** Show Home page (landing with headline + feature cards)

**Action:** Point to three feature icons on screen:
- 📸 "Smart OCR extracts receipt details in seconds"
- 🔄 "Workflows support sequential, parallel, and hybrid approvals"
- 💱 "Multi-currency support for global teams"

---

### **Minute 0:30 – 2:00: The Workflow (Process Demo)**

**What to Say:**
> "Let me walk you through a real workflow. An employee submits an expense with a receipt..."

**Action 1: Employee Submission**
1. Sign in with **Emma.chen** (employee)
2. Click "Employee Dashboard"
3. Show the expense form
4. Click "📷 Scan Receipt with OCR"
5. Say: "Our OCR instantly extracts amount, vendor, date. No manual typing."
6. Fill form OR show pre-filled OCR data
7. Click "Submit Expense"
8. Toast shows: "Expense submitted!"
9. Say: "Now the approval workflow kicks in automatically..."

**Action 2: Manager Approval**
1. Click Home (or navigate to /)
2. Sign out
3. Sign in with **maya.roy** (manager)
4. Click "Manager Dashboard"
5. Say: "Here are expenses waiting for my approval. The workflow determined I'm the right approver based on our company rules."
6. Show an expense card with workflow stages
7. Click "Approve"
8. Toast: "Expense approved!"
9. Say: "Managers see the full approval history and can add notes. Everything's transparent."

**Action 3: Admin Oversight**
1. Sign out
2. Sign in with **demo.admin** (admin)
3. Click "Admin Dashboard"
4. Show metrics: "12 expenses, 3 pending, 9 approved"
5. Click "Expenses" tab
6. Show the same expense with status "Approved"
7. Say: "Admins see the full picture. They can set up approval rules, manage teams, track everything in real-time."

---

### **Minute 2:00 – 3:30: Approval Rules (What Makes Us Different)**

**What to Say:**
> "What makes this powerful is the approval workflow engine. Different companies have different rules..."

**Action:**
1. While still in Admin Dashboard, click "Approval Rules" tab
2. Show 2-3 pre-seeded rules:
   - **"Sequential"**: Amount < $100 → Manager only
   - **"Percentage"**: Amount > $500 → Requires 2 out of 3 managers
   - **"Specific"**: Meals → CEO must approve
3. Point to rule names: "We support sequential, parallel, specific-approver, even hybrid combinations."
4. Say: "No code changes. Admins configure rules in minutes. Perfect for startups, enterprises, anything in between."

---

### **Minute 3:30 – 4:30: The Why (Business Value)**

**What to Say:**
> "Let's talk about impact:
>
> 📍 **Compliance**: Every approval tracked. Audit trail is complete.
>
> 📍 **Scale**: Works for 10 employees or 10,000. Same platform.
>
> 📍 **Speed**: No email chains. OCR saves manual data entry. Approvals routed in seconds.
>
> 📍 **Flexibility**: Workflows adapt to policy changes. No technical debt."

**Visual:** Show one completed expense with approval history (timeline of approvers + timestamps)

---

### **Minute 4:30 – 5:00: Call to Action**

**What to Say:**
> "We've built a MVP that works today. The next phases are mobile app, real-time notifications, and integration with accounting software.
>
> If you're an HR platform or finance tool, Amalthea's workflow engine is available as an API.
>
> We're hiring if you're interested. Let's talk."

**Action:**
- Show Home page one more time (beautiful landing)
- Open any two dashboards to show polish + responsiveness
- Be ready for questions

---

## Troubleshooting During Demo

### If Sign-In Fails
1. Refresh the page (Cmd/Ctrl + R)
2. Check browser console for errors (F12)
3. Verify backend is running: `npm run dev` in backend folder
4. Fall back to offline demo video

### If Page Loads Slowly
1. It's likely a cold start (Render needs 10-15 seconds first load)
2. Keep talking while it loads
3. Have a pre-opened browser tab as backup

### If OCR Doesn't Work
1. Manually fill the form (OCR is visual polish, not critical)
2. Say: "In live environments, users can upload receipts. OCR processes in background."

### If You Lose Internet
1. Pull up the offline demo video
2. Speak confidently through it
3. Judges understand hosting can have issues

### If a Dashboard Doesn't Load
1. Go back home and try again
2. Check backend logs (if accessible)
3. Fall back to the other two role demonstrations (one is enough)

---

## Talking Points to Emphasize

- **"No code, infinite flexibility"** – Admins configure workflows, not engineers
- **"Born from real pain"** – Address actual employee/manager frustrations
- **"Scalable foundation"** – Works from startup to enterprise
- **"Audit-ready"** – Every decision tracked and traceable
- **"Multi-currency"** – Global teams, local compliance

---

## Questions You Might Get

**Q: "How do you handle rejections?"**
A: "Managers can reject with a note. The expense goes back to the employee for revision or resubmission. We track all state changes."

**Q: "What about fraud prevention?"**
A: "Admins set spending limits per user. We log everything for audit. Integration with accounting software catches duplicates."

**Q: "How do you scale to millions of expenses?"**
A: "MongoDB handles scale. We cache approval rules. Workflow engine is stateless, so we add servers as needed."

**Q: "Will this work with Slack/Teams?"**
A: "Not yet, but it's on the roadmap. Mobile app is first priority."

**Q: "Can employees see approvers before submitting?"**
A: "Great idea. That's in the backlog for transparency."

---

## Post-Demo

- [ ] Get contact info from interested judges
- [ ] Offer to schedule follow-up demo
- [ ] Share GitHub link (if public)
- [ ] Thank them!

---

## Demo Accounts (Seeded Data)

| Role | Username | Password | Purpose |
|------|----------|----------|---------|
| Admin | demo.admin | Demo123! | System oversight, rules, metrics |
| Manager 1 | maya.roy | Demo123! | Approve employee expenses |
| Manager 2 | rajeev.kumar | Demo123! | Parallel approvals demo |
| Employee 1 | emma.chen | Demo123! | Submit expenses |
| Employee 2 | alex.johnson | Demo123! | Secondary employee |

**All seed data resets with:** `npm run seed:demo`

---

## Quick Links

- **Home/Landing**: Explains the problem & vision
- **Sign In**: Demo account chips visible
- **Admin Dashboard**: Metrics + Rules + Expenses
- **Manager Dashboard**: Pending approvals workflow
- **Employee Dashboard**: Submit + track

---

## Backup: Offline Demo Video

If deployment fails or internet drops:
1. Record a 3-minute screen capture locally running the app
2. Save as `demo-backup.mp4`
3. Play full-screen if needed
4. Speak through it confidently

**What to capture in offline video:**
- Login flow (all 3 roles)
- One complete expense submission + approval journey
- Admin dashboard metrics
- Approval rules interface

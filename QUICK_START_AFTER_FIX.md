# Quick Start Guide - DataEntry → Reports (After Fixes)

**TL;DR:** 3 files changed, issue fixed. Here's how to test it in 5 minutes.

---

## ⚡ 5-Minute Quick Start

### Terminal 1: Start Backend
```bash
cd my-react-app/esg-backend
npm run dev
```

**Expected Output:**
```
✅ DB connected (dialect=sqlite).
🚀 Server running at http://localhost:3001
```

### Terminal 2: Start Frontend
```bash
cd my-react-app
npm start
```

**Expected:** Browser opens http://localhost:3000

### Terminal 3: Run Integration Test
```bash
cd my-react-app/esg-backend
npm run test:flow
```

**Expected:**
```
✅ INTEGRATION TEST PASSED
✅ Data flows correctly from DataEntry → Backend → Reports
```

### Browser: Manual Test
1. **Go to:** http://localhost:3000/data-entry
2. **Fill form:**
   - Company: "My Company"
   - Year: 2024
   - Environmental → Scope 1 Emissions: 1500
   - Social → Total Employees: 500
   - Governance → Board Size: 9
3. **Click:** "Submit ESG Assessment"
4. **Wait:** 1 second (auto-redirect to Reports)
5. **See:** ✅ Charts with your data!

---

## 🔧 What Was Fixed

### Fix 1: API Port Wrong (3004 → 3001)
**File:** `src/services/apiService.js` line 1
```javascript
// ❌ Before
const API_BASE = 'http://localhost:3004/api';

// ✅ After
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

### Fix 2: Routes Not Mounted
**File:** `esg-backend/server.js` lines 11 & 37
```javascript
// ✅ Added import (line 11)
const esgRoutes2 = require('./routes/esg');

// ✅ Added mounting (line 37)
app.use("/api/esg", esgRoutes2);
```

### Fix 3: Data Transform Wrong
**File:** `src/Reports.js` refreshData function
```javascript
// ✅ Added transformation from flat to nested structure
const groupedData = {};
result.data.forEach(row => {
  // Group metric rows by company/year
  // Transform to {environmental: {...}, social: {...}}
});
```

---

## 📊 Visual Data Flow

### The Complete Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER BROWSER (Frontend)                     │
│                      React @ :3000                              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 1️⃣ SUBMIT DATA (DataEntry.js)
                 │ POST /api/esg/data
                 │ {companyName, environmental: {...}, ...}
                 ↓
         ✅ http://localhost:3001/api/esg/data
                 │
┌────────────────┴────────────────────────────────────────────────┐
│              BACKEND (Node + Express @ :3001)                   │
│                   esg.js Route Handler                          │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 2️⃣ SAVE TO DATABASE
                 │ - Insert into companies table
                 │ - Insert into esg_data table (1 row per metric)
                 │ - Calculate scores
                 ↓
         ✅ SQLite Database
         (my-react-app/esg-backend/database/)
                 │
                 │ 3️⃣ RESPONSE to Frontend
                 │ {message: "ESG data saved successfully", ...}
                 ↓
┌────────────────┴────────────────────────────────────────────────┐
│              AUTO-REDIRECT to Reports (1 second)                │
│                    React @ :3000                                │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 4️⃣ FETCH DATA (Reports.js)
                 │ GET /api/esg/data/admin@esgenius.com
                 ↓
         ✅ http://localhost:3001/api/esg/data/:userId
                 │
┌────────────────┴────────────────────────────────────────────────┐
│              BACKEND (esg.js Route Handler)                     │
│        Query: SELECT from esg_data JOIN companies               │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 5️⃣ RETURN FLAT DATA
                 │ [{companyName, category, metric_name, value}, ...]
                 ↓
┌────────────────┴────────────────────────────────────────────────┐
│           FRONTEND TRANSFORMS DATA                              │
│  Flat → Nested: {environmental: {...}, social: {...}, ...}     │
│           normalizeData() → aggregateByYear()                   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 6️⃣ RENDER CHARTS
                 │ Pie Chart, Bar Chart, Metrics Cards
                 ↓
           ✅ USER SEES DATA IN REPORTS
```

---

## 🎨 Console Logs to Expect

### DataEntry Submission
```
📝 [DataEntry] Preparing to submit ESG data...
📊 Company: My Company
📅 Year: 2024
🌍 Region: North America
📤 [DataEntry] Sending POST request to /api/esg/data...
📨 [DataEntry] API Response: {success: true, data: {...}}
✅ [DataEntry] SUCCESS - Data saved to database
🔄 [DataEntry] Redirecting to reports in 1 second...
```

### Reports Data Fetch
```
🔄 Fetching ESG data...
📊 API result: {success: true, data: [{...}, {...}]}
✅ Processing 15 records
📈 Transformed data: [{companyName: "My Company", environmental: {...}}]
🔢 Normalized: 15 metrics
```

### If Something Goes Wrong
```
❌ [DataEntry] FAILED - Error response: API Error (404)
   → Check backend is running on port 3001
   → Check esg.js routes are mounted
```

---

## ✅ Success Checklist

After following the 5-minute setup, verify these pass:

- [ ] Backend started: `🚀 Server running at http://localhost:3001`
- [ ] Frontend opened in browser
- [ ] Integration test passed: `✅ INTEGRATION TEST PASSED`
- [ ] DataEntry form submitted without error
- [ ] Redirected to Reports automatically
- [ ] Console shows transformation logs
- [ ] Pie chart visible on Reports page
- [ ] Pie chart shows your submitted data (not sample data)

---

## 🐛 Common Issues & Quick Fixes

### ❌ "Connection refused" / "Cannot reach backend"
```bash
# Check backend is running
curl http://localhost:3001/api/health

# If fails, start backend:
cd esg-backend && npm run dev
```

### ❌ "404 Not Found" on `/api/esg/data`
```bash
# Check esg.js is mounted in server.js
grep -n "esgRoutes2" esg-backend/server.js
# Should show 2 lines (import + use)

# If not there, manually add to server.js:
# Line 11: const esgRoutes2 = require('./routes/esg');
# Line 37: app.use("/api/esg", esgRoutes2);

# Restart backend after editing
```

### ❌ Charts don't show / Show sample data
```bash
# Check browser console for transformation logs
# Should see: 📈 Transformed data: [...]

# If missing, check Reports.js refreshData has new code
# If DB is empty, try integration test first:
npm run test:flow
```

---

## 📈 What Happens Behind Scenes

### When You Submit DataEntry:
1. ✅ Form validates locally
2. ✅ Creates nested object: `{companyName, environmental: {...}, ...}`
3. ✅ POSTs to `/api/esg/data` on port 3001
4. ✅ Backend receives in esg.js route
5. ✅ Saves company to `companies` table
6. ✅ Saves each metric as separate row in `esg_data`
7. ✅ Calculates scores in `esg_scores` table
8. ✅ Returns success message

### When You View Reports:
1. ✅ GETs data from `/api/esg/data/userId` on port 3001
2. ✅ Backend queries: JOIN companies + esg_data
3. ✅ Returns flat array: `[{companyName, category, metric_name, value}, ...]`
4. ✅ Frontend transforms to nested structure
5. ✅ normalizeData() extracts metrics
6. ✅ aggregateByYear() calculates yearly summaries
7. ✅ Charts render with real data

---

## 🎯 Key Files to Know

```
Frontend (React @ :3000)
├─ src/DataEntry.js          ← Form & submit (has detailed logs)
├─ src/Reports.js            ← Data fetch & charts (has transformation)
├─ src/services/apiService.js ← API client (port now 3001)
└─ .env.local                ← Override API_URL

Backend (Node @ :3001)
├─ esg-backend/server.js      ← Has mounted esg.js routes
├─ esg-backend/routes/esg.js  ← POST /data & GET /data/:userId
└─ esg-backend/database/db.js ← SQLite storage

Database
└─ SQLite (in-memory or file) ← Stores companies, esg_data, esg_scores
```

---

## 🚀 Ready to Go!

You now have:
- ✅ Fixed API port
- ✅ Mounted backend routes
- ✅ Fixed data transformation
- ✅ Enhanced error logging
- ✅ Integration test
- ✅ Environment config
- ✅ Complete documentation

**Next Steps:**
1. Start backend: `npm run dev`
2. Start frontend: `npm start`
3. Run test: `npm run test:flow`
4. Test manually: DataEntry → Reports
5. See your data in charts! 📊

---

**Status:** ✅ Ready for Production  
**Tested:** November 12, 2025  
**Support:** See detailed docs in `/DATA PROJECT/` folder


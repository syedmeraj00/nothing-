# ESG Dashboard Project - Complete Analysis
**Date:** November 12, 2025 | **Repository:** ESG-App (ESGenius-salman/nothing-)

---

## 📊 Executive Summary

A full-stack **Environmental, Social & Governance (ESG) management platform** designed for enterprises to track, validate, and report on ESG metrics. The application supports multi-framework compliance (BRSR, GRI, SEC), data integrations with ERP/HR systems, and advanced analytics with audit trails.

**Tech Stack:**
- **Frontend:** React 18, Tailwind CSS, Chart.js/Recharts, jsPDF, XLSX (no component library)
- **Backend:** Node.js + Express, Sequelize ORM, SQLite (dev) / PostgreSQL (prod)
- **Database:** Sequelize models + raw SQLite, multi-schema support (standard, enhanced, integration)
- **Authentication:** JWT tokens with role-based access control
- **Integration:** ERP (SAP/Oracle/NetSuite) and HR system connectors

---

## 🏗️ Architecture & Design

### System Diagram (Conceptual Flow)
```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│   Browser   │ <─CORS─> │  Express API │ <─────> │   SQLite/   │
│  React 18   │          │   (Port 3001)│         │  PostgreSQL │
└─────────────┘          └──────────────┘         └─────────────┘
      │                         │                       
      │ (Fetch/Axios)          │ (Routes)              
      │                         │                       
   UI Pages            Middleware Stack         Models
  - Dashboard       1. Security Headers       - ESGModel
  - DataEntry       2. Rate Limiting         - AuditTrail
  - Reports         3. CORS                  - EmissionsData
  - Analytics       4. JSON Parser           - ComplianceDoc
  - Compliance      5. Query Sanitize        
  - Admin           6. Request Logger        
                    7. Auth Middleware       
                    8. Route Handlers        
                    9. Error Logger          
```

### Backend File Organization

```
esg-backend/
├── server.js                    # Express setup, middleware chain, route mounting
├── package.json                 # Dependencies (Express, Sequelize, Axios, JWT, etc.)
│
├── config/
│   └── database.js              # [MISSING] - Sequelize initialization (imported but not found)
│
├── database/
│   ├── db.js                    # SQLite3 connection + schema initialization
│   ├── schema.sql               # Base ESG tables (esg_data, validation_rules)
│   ├── enhanced-schema.sql      # Additional tables (audit_trail, emissions_data)
│   └── enhanced-integration-schema.sql  # Integration tracking tables
│
├── models/                      # Sequelize ORM definitions
│   ├── ESGModel.js              # ✅ CANONICAL - esg_data table with all ESG metrics
│   ├── EsgData.js               # ❌ DEPRECATED - legacy, conflicts with ESGModel
│   ├── AuditTrail.js            # Audit log for compliance
│   ├── EmissionsData.js         # Scope 1/2/3 emissions breakdown
│   └── EnhancedESGData.js       # Extended schema with detailed metrics
│
├── routes/                      # REST endpoints (mounted in server.js)
│   ├── esgRoutes.js             # Core ESG CRUD: POST /api/esg, GET /api/esg
│   ├── enhancedEsgRoutes.js     # Enhanced operations: POST /api/v2/esg/assessment
│   ├── esgKpiRoutes.js          # KPI aggregation: GET /api/esg/kpis
│   ├── esgLive.js               # Real-time ESG feed: GET /api/esg/live
│   ├── authRoutes.js            # Auth: POST /api/auth/login, /api/auth/signup
│   ├── integrations.js          # ERP/HR connectors: POST /api/integration/fetch-*
│   ├── admin.js                 # Admin operations: user approval, role management
│   ├── reporting.js             # Report generation: GET /api/reporting/generate
│   ├── compliance.js            # Compliance tracking: GET/POST /api/compliance
│   ├── analytics.js             # Analytics aggregation: GET /api/analytics
│   ├── healthRoutes.js          # Health check: GET /api/health
│   └── testRoutes.js            # Internal test endpoints
│
├── middleware/
│   ├── security.js              # securityHeaders, createRateLimit, sanitizeQuery
│   ├── auth.js                  # authenticateToken, requireRole middleware
│   ├── logging.js               # requestLogger, errorLogger
│   ├── cache.js                 # cacheMiddleware, invalidateCache
│   └── dataValidation.js        # validateESGData (queries DB for bounds)
│
├── integrations/
│   ├── erpConnector.js          # Class-based connector for SAP/Oracle/NetSuite
│   └── hrConnector.js           # Class-based connector for HR systems (fallback mock data)
│
├── .env                         # Development secrets (⚠️ EXPOSED: password in repo)
├── .env.production              # Production config template
└── test-*.js                    # Integration test scripts (run via npm run test:phase*)
```

### Frontend File Organization

```
src/
├── App.js                       # React Router setup (13 routes + ProtectedRoute guard)
├── index.js                     # React DOM render
├── theme.js / contexts/ThemeContext.js  # Dark/light theme context (minimal)
│
├── pages (main components)
│   ├── Dashboard.js             # KPI cards, performance metrics, overview charts
│   ├── DataEntry.js             # Multi-step ESG metric form (1373 LOC - large)
│   ├── SimpleDataEntry.js       # Lightweight variant for quick entry
│   ├── IndustryStandardDataEntry.js  # Framework-aligned input form
│   ├── Reports.js               # Data normalization + chart rendering (1219 LOC)
│   ├── SimpleReports.js         # Lightweight reporting
│   ├── Analytics.js             # Advanced visualizations + timeframe filters
│   ├── Compliance.js            # Document upload + status tracking
│   ├── Regulatory.js            # Framework-specific requirements
│   ├── Stakeholders.js          # Stakeholder engagement tracking
│   ├── AdminPanel.js            # User approval, role management
│   ├── FlowTester.js            # Internal testing component
│   ├── Login.js / Login.jsx      # Auth form (duplicate files - legacy)
│   └── DatabaseViewer.js        # Debug utility
│
├── components/ (reusable UI)
│   ├── ProfessionalCard.js      # MetricCard, StatusCard
│   ├── ProfessionalHeader.js    # Top nav bar
│   ├── ProfessionalDashboard.jsx    # Dashboard wrapper
│   ├── MaterialityAssessment.jsx    # ESG materiality matrix
│   ├── SupplyChainESG.jsx       # Supply chain metrics view
│   ├── CustomReportBuilder.jsx  # Dynamic report templates
│   ├── IntegrationPanel.js      # ERP/HR integration UI
│   ├── ProfessionalReportTemplate.jsx  # PDF report template
│   └── FooterDisclaimer.jsx     # Legal footer (if exists)
│
├── api/
│   ├── esgAPI.js                # Mock/fallback ESG data operations
│   └── database.js              # IndexedDB-like storage wrapper (not used consistently)
│
├── services/
│   ├── apiService.js            # Singleton API client wrapper
│   └── [others]                 # Placeholder for future services
│
├── utils/
│   ├── storage.js               # localStorage + DB integration (auto-saves)
│   ├── simpleStorage.js         # Lightweight localStorage wrapper
│   ├── api.js                   # Fetch wrapper (⚠️ hardcoded port 3004)
│   ├── dataValidation.js        # Input validation functions
│   ├── dataIntegration.js       # Data merge/normalization
│   ├── dataQualityEngine.js     # DataValidator class for comprehensive checks
│   ├── auditSupport.js          # AuditTrail, AuditSupport for compliance logging
│   ├── esgFrameworks.js         # ESG_FRAMEWORKS, STANDARD_METRICS, MATERIALITY_TOPICS
│   ├── enhancedFrameworks.js    # Extended framework definitions
│   ├── errorHandler.js          # Global error handling utilities
│   ├── dataGovernance.js        # Data governance policies
│   └── enhancedProfessionalPDF.js  # Advanced PDF generation
│
├── test/                        # Frontend test utilities
│   ├── integration-test.js
│   ├── functionality-check.js
│   ├── final-verification.js
│   └── ghg-calculator-test.js
│
├── index.css                    # Tailwind directives + custom global styles
└── companyLogo.jpg              # Branding asset
```

---

## 📡 Data Flow & Lifecycle

### ESG Data Lifecycle

```
1. DATA ENTRY (Frontend)
   ├─ User fills DataEntry.js form (5 sections: company, environmental, social, governance, metadata)
   ├─ Validation runs (DataValidator checks ranges, formats)
   ├─ User clicks Submit
   └─ API POST /api/esg with payload

2. BACKEND PROCESSING
   ├─ POST /api/esg hits esgRoutes.js
   ├─ Middleware chain:
   │  ├─ authenticateToken (JWT from header)
   │  ├─ requireRole(['esg_manager', 'admin'])
   │  └─ invalidateCache('/api/esg')
   ├─ Input validation (companyName, year, scores)
   ├─ ESGModel.create(data) → DB insert
   ├─ AuditTrail.create({ action: 'CREATE', entity: 'ESGData', ... })
   └─ Return 201 + newEntry JSON

3. CACHING & RETRIEVAL
   ├─ GET /api/esg → cacheMiddleware (300s TTL)
   ├─ If cache hit: return cached JSON
   ├─ If cache miss: query ESGModel.findAll() → sort by year DESC
   └─ Cache invalidated on POST/PUT via invalidateCache

4. INTEGRATIONS (Optional)
   ├─ Admin triggers POST /api/integration/fetch-erp
   ├─ Route creates new ERPConnector(config)
   ├─ Connector.getEnergyData() → calls ERP API
   ├─ Transforms response to ESG schema
   ├─ Merges with existing ESGModel records
   └─ Returns aggregated data

5. REPORTING & EXPORT
   ├─ Frontend calls GET /api/esg → receives all records
   ├─ Reports.js normalizes data (flatten multi-level JSON)
   ├─ Charts render (Chart.js bar/pie, Recharts line)
   ├─ User exports:
   │  ├─ PDF: html2canvas → jsPDF
   │  └─ Excel: XLSX.write(workbook)
   └─ AuditTrail records export event

6. COMPLIANCE REPORTING
   ├─ Compliance.js reads stored compliance docs
   ├─ Maps to framework requirements (BRSR, GRI, SEC)
   ├─ Generates report via /api/reporting/generate
   └─ Stores in DB with status = 'Approved' / 'Pending'
```

### Authentication Flow
```
Login (src/Login.jsx)
  ├─ POST /api/auth/login { email, password }
  ├─ Backend validates credentials via authRoutes.js
  ├─ JWT token generated + stored in localStorage ('authToken')
  ├─ User object stored in localStorage ('currentUser')
  ├─ Redirect to Dashboard
  └─ Subsequent requests include:
      Authorization: Bearer <token> (added by apiService.js)
```

---

## 🔐 Security & Authentication

### Current Implementation
- **JWT tokens** signed with `JWT_SECRET` (⚠️ hardcoded placeholder in `.env`)
- **Role-based access control:** `requireRole(['admin', 'esg_manager', 'viewer'])`
- **CORS:** Whitelist `FRONTEND_URL` from `.env`
- **Rate limiting:** Generic `createRateLimit()` middleware
- **Input sanitization:** `sanitizeQuery()` removes SQL injection patterns

### Security Issues Found 🚨

| Issue | Severity | Details | Fix |
|-------|----------|---------|-----|
| Credentials in repo | **HIGH** | `.env` with DB password `Es@2025` committed | Add `.env` to `.gitignore`, rotate credential, use CI secrets |
| JWT secret placeholder | **HIGH** | `"your-super-secret-jwt-key-change-in-production"` | Generate strong secret per environment |
| No HTTPS enforcement | **MEDIUM** | Frontend/backend use HTTP in dev (expected) | Add `https://` check in prod; force redirect |
| No input length limits | **MEDIUM** | Forms accept `companyName` up to 255 chars, no max length validation | Add `maxLength` to schema, frontend form validation |
| No rate limit config | **MEDIUM** | Rate limiting middleware exists but no per-user/IP tuning | Configure via `.env` if extended |
| Silent API fallbacks | **MEDIUM** | ERP connectors return mock data on error without logging | Add alerting / audit trail for API failures |

### Recommended Security Hardening
1. **Add `.env.example`** to repo with safe defaults
2. **Use environment-based secrets** (CI platform or secret manager)
3. **Implement HTTPS in production** with automatic redirects
4. **Add request signing** for integration APIs (HMAC-SHA256)
5. **Implement API key rotation** for external connectors
6. **Add rate limiting by user/IP** with configurable thresholds

---

## 🗄️ Database Design

### Current State: Hybrid Approach (⚠️ Inconsistency)

| Layer | Tool | Usage | Status |
|-------|------|-------|--------|
| **ORM** | Sequelize 6 | Model definitions, CRUD | Active but incomplete |
| **Raw Driver** | sqlite3 | Schema initialization, validation rules | Active |
| **Migrations** | None | Manual SQL files | No automated migration |

### Tables & Models

#### `esg_data` (Primary)
```sql
CREATE TABLE esg_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  companyName TEXT NOT NULL,
  year INTEGER NOT NULL,
  environmentalScore FLOAT NOT NULL,
  socialScore FLOAT NOT NULL,
  governanceScore FLOAT NOT NULL,
  esgScore FLOAT NOT NULL,
  co2Reduction FLOAT,
  complianceRate FLOAT,
  sustainabilityIndex TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `audit_trail` (Compliance)
```sql
CREATE TABLE audit_trail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT,                     -- 'CREATE', 'UPDATE', 'DELETE'
  entity TEXT,                     -- 'ESGData', 'Compliance'
  entityId INTEGER,
  userId INTEGER,
  changes JSON,                    -- { before: {...}, after: {...} }
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `validation_rules` (Config)
```sql
CREATE TABLE validation_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT UNIQUE,
  category TEXT,                   -- 'environmental', 'social', 'governance'
  min_value FLOAT,
  max_value FLOAT,
  required_unit TEXT,
  error_message TEXT,
  active BOOLEAN DEFAULT 1
);
```

### Data Persistence Modes

| Mode | Setting | Behavior | Use Case |
|------|---------|----------|----------|
| **In-Memory** | `USE_SQLITE=true` + `:memory:` | Data lost on restart | Local testing, CI (fast) |
| **File-Based** | `USE_SQLITE=true` + `db/sqlite.db` path | Data persists | Local dev |
| **PostgreSQL** | `USE_SQLITE=false` + Postgres env vars | Enterprise DB | Production |

**Current `.env` setting:** `USE_SQLITE=true` → in-memory (data not persistent in dev!)

---

## 🔌 Integration Architecture

### ERP Connector Pattern

```javascript
// esg-backend/integrations/erpConnector.js
class ERPConnector {
  constructor(config) {
    this.baseURL = config.baseURL;      // e.g., https://sap.company.com/api
    this.apiKey = config.apiKey;        // Bearer token
    this.type = config.type;            // 'SAP' | 'Oracle' | 'NetSuite'
  }

  async getEnergyData(startDate, endDate) {
    // Try real API → on error, return mock data
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, { 
        headers: { Authorization: `Bearer ${this.apiKey}` },
        params: { startDate, endDate }
      });
      return this.transformEnergyData(response.data);
    } catch (error) {
      console.error('ERP fetch failed:', error.message);
      return this.getMockEnergyData();  // Graceful fallback
    }
  }

  transformEnergyData(data) {
    // Map ERP schema → ESG schema
    return {
      energyConsumption: data.total_kwh,
      scope1Emissions: data.direct_emissions,
      scope2Emissions: data.indirect_emissions,
      renewablePercentage: data.renewable_percentage
    };
  }

  getMockEnergyData() {
    return {
      energyConsumption: 75000,
      scope1Emissions: 1500,
      scope2Emissions: 2500,
      renewablePercentage: 45
    };
  }
}
```

### HR Connector (Similar Pattern)
Fetches employee diversity, turnover, training metrics.

### Integration Routes
```javascript
// esg-backend/routes/integrations.js
router.post('/fetch-erp', authenticateToken, async (req, res) => {
  const { type, baseURL, apiKey } = req.body;
  const connector = new ERPConnector({ type, baseURL, apiKey });
  
  const energyData = await connector.getEnergyData();
  const financialData = await connector.getFinancialData();
  
  // Save to ESGModel or separate table
  await ESGModel.create({ 
    ...energyData, 
    ...financialData,
    source: 'ERP',
    connectorType: type
  });
  
  res.json({ success: true, data: energyData });
});
```

---

## 🎨 Frontend Architecture & Component Patterns

### React Router Setup
```javascript
// src/App.js
<Routes>
  <Route path="/login" element={<Login />} />                                    {/* Public */}
  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />    {/* Protected */}
  <Route path="/data-entry" element={<ProtectedRoute><DataEntry /></ProtectedRoute>} />
  <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
  {/* ... 10 more routes ... */}
</Routes>

// ProtectedRoute guard (localStorage-based)
const ProtectedRoute = ({ children }) => {
  const currentUser = localStorage.getItem("currentUser");
  return currentUser ? children : <Navigate to="/login" replace />;
};
```

### State Management Patterns

#### Page-Level State (useState)
```javascript
// src/Dashboard.js
const [kpis, setKpis] = useState({
  overallScore: 27,
  complianceRate: 94,
  environmental: 35,
  social: 0,
  governance: 0
});

useEffect(() => {
  APIService.getDashboardData().then(data => {
    setKpis(data.kpis);
  }).catch(err => console.error('Failed to load KPIs:', err));
}, []);
```

#### Theme Context (Minimal)
```javascript
// src/contexts/ThemeContext.js
const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(!isDark) }}>
      {children}
    </ThemeContext.Provider>
  );
};
// ⚠️ Theme toggle not fully implemented in all components
```

#### Storage Utility (Auto-Save Pattern)
```javascript
// src/utils/storage.js
export const saveData = (entry) => esgDB.addEntry(entry);
export const getStoredData = () => esgDB.getEntries();
export const calculateAndSaveKPIs = (filters = {}) => {
  const kpis = esgDB.getKPIs();
  const complianceRate = esgDB.getComplianceDocs().filter(d => d.status === 'Approved').length / total * 100;
  return { ...kpis, complianceRate };
};
// Used in DataEntry.js with debounce for auto-save
const debouncedSave = debounce((data) => saveData(data), 1500);
```

### Chart Rendering Pattern

**Chart.js (via react-chartjs-2)**
```javascript
// src/Analytics.js
import { Bar, Pie, Line } from 'react-chartjs-2';

const categoryChart = {
  labels: ['Environmental', 'Social', 'Governance'],
  datasets: [{
    label: 'Score Distribution',
    data: [82, 75, 77],
    backgroundColor: ['#3a7a44', '#6b7bd6', '#ffbb28']
  }]
};

return <Bar data={categoryChart} options={{ responsive: true }} />;
```

**Recharts (For more complex dashboards)**
```javascript
// src/Reports.js or Dashboard.js
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const data = [
  { year: 2022, env: 70, social: 68, gov: 75 },
  { year: 2023, env: 75, social: 72, gov: 78 }
];

return (
  <LineChart width={800} height={400} data={data}>
    <CartesianGrid />
    <XAxis dataKey="year" />
    <YAxis />
    <Line type="monotone" dataKey="env" stroke="#3a7a44" />
    <Line type="monotone" dataKey="social" stroke="#6b7bd6" />
    <Line type="monotone" dataKey="gov" stroke="#ffbb28" />
  </LineChart>
);
```

### PDF & Excel Export Pattern

**PDF Export (jsPDF + html2canvas)**
```javascript
// From DataEntry.js or Reports.js
const exportPDF = async () => {
  const element = document.getElementById('report-content');
  const canvas = await html2canvas(element);
  const img = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  pdf.addImage(img, 'PNG', 10, 10, 190, 277);
  pdf.save('esg-report.pdf');
};
```

**Excel Export (XLSX)**
```javascript
const exportExcel = () => {
  const ws = XLSX.utils.json_to_sheet(normalizedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ESG Data");
  XLSX.writeFile(wb, 'esg-data.xlsx');
};
```

### Styling Approach: Tailwind CSS
- **No component library** (no MUI, Chakra, Bootstrap)
- Custom styled divs with Tailwind utility classes
- Global styles in `src/index.css` (Tailwind directives + custom animations)
- Theme tokens in component files (no design system yet)

Example from DataEntry.js:
```jsx
<div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">Environmental Data</h2>
  <input 
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    type="number" 
    placeholder="Carbon Emissions (Scope 1)" 
  />
</div>
```

---

## 📊 Data Model: Core ESG Metrics

### Environmental Metrics
```
scope1Emissions: Direct GHG emissions (Metric Tons CO₂e)
scope2Emissions: Indirect energy GHG (Metric Tons CO₂e)
scope3Emissions: Value chain emissions (Metric Tons CO₂e)
energyConsumption: Total energy (MWh)
renewableEnergyPercentage: % from renewable sources (0–100)
waterUsage: Water consumption (ML/year)
wasteManagement: Waste recycled/recovered (%)
environmentalCompliance: Regulatory compliance score (0–100)
```

### Social Metrics
```
totalEmployees: Headcount
femaleEmployeesPercentage: Women in workforce (%)
employeeTurnover: Annual turnover rate (%)
lostTimeInjuryRate: Work injuries per 200k hours
trainingHoursPerEmployee: Annual training (hours)
communityInvestment: Social spending ($M)
laborRights: Compliance with labor standards (0–100)
diversityRatio: Diversity score across demographics
```

### Governance Metrics
```
boardSize: Number of board members
independentDirectorsPercentage: Independent directors (%)
ceoTenure: Years as CEO
ethicsTrainingCompletion: Staff training completion (%)
transparencyScore: Disclosure quality (0–100)
riskManagementScore: Risk governance (0–100)
shareholderRights: Voting rights score (0–100)
antiCorruptionProgram: Anti-corruption rating (0–100)
```

---

## 🧪 Testing & Verification

### Test Scripts (Node-based)
Located in `esg-backend/test-*.js`. Run via `npm run test:phase*`.

| Script | Command | Purpose |
|--------|---------|---------|
| test-existing.js | `npm run test:phase1` | Basic CRUD, health check |
| test-phase2.js | `npm run test:phase2` | Enhanced ESG features |
| test-phase3.js | `npm run test:phase3` | Integration connectors |
| test-full-flow.js | `npm run test:all` | End-to-end workflow |
| quick-test.js | Manual | Rapid feedback testing |

### Test Pattern
```javascript
// test-existing.js excerpt
const axios = require('axios');

async function testExisting() {
  console.log('🚀 Testing ESG System\n');
  
  try {
    // Health check
    const health = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Server Status:', health.data.message);
    
    // Save ESG data
    const esgData = { companyName: 'Test Corp', year: 2024, ... };
    const result = await axios.post('http://localhost:3001/api/esg/data', esgData);
    console.log('✅ Data saved:', result.data.message);
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testExisting().then(() => process.exit(0));
```

**Note:** Tests use **real HTTP calls** — backend must be running!

---

## ⚠️ Known Issues & Tech Debt

### Critical 🔴

| Issue | Impact | Files | Mitigation |
|-------|--------|-------|-----------|
| **Multiple ESG Models conflict** | Schema mismatches, query failures | ESGModel.js, EsgData.js, EnhancedESGData.js | Consolidate to single `ESGModel.js` |
| **Data not persistent in dev** | Data lost on server restart | `.env` USE_SQLITE=true + :memory: | Change to file-based SQLite path |
| **Exposed credentials in repo** | Security breach risk | `.env` with password | Add `.gitignore`, use CI secrets |
| **Hardcoded API port (3004)** | Frontend can't reach backend | src/utils/api.js | Centralize in .env.local or config |
| **No migration framework** | Manual schema updates error-prone | database/schema.sql | Implement Sequelize migrations or Flyway |

### High 🟠

| Issue | Impact | Workaround |
|-------|--------|-----------|
| **Frontend state not normalized** | Re-fetching, cache misses, stale data | Implement Redux or Zustand |
| **Dual DB layers** (Sequelize + raw SQLite) | Maintenance burden, inconsistent queries | Pick one path; migrate all to ORM |
| **No error boundary** | Unhandled errors crash React | Add React.ErrorBoundary wrapper |
| **Silent API fallbacks** | Operators don't know when data is stale | Add audit trail + alerting |
| **Test coverage ~0%** | Regressions undetected | Add Jest + React Testing Library |

### Medium 🟡

| Issue | Impact | Priority |
|--------|--------|----------|
| Duplicate file pairs (Dashboard.js/.jsx, Login.js/.jsx) | Confusion, merge conflicts | Consolidate to single file |
| Theme context not implemented in all components | Inconsistent dark mode | Complete theme implementation |
| No loading states in async operations | Poor UX during API calls | Add spinners + skeleton screens |
| API response shape inconsistent | Frontend parsing errors | Standardize to `{ success, data, error }` |
| No pagination for large datasets | Performance degradation | Add offset/limit to API, React pagination |

### Low 🟢

| Issue | Impact |
|--------|--------|
| Components are very large (1000+ LOC) | Hard to test, maintain | Split into smaller sub-components |
| No ESLint / Prettier | Code style inconsistent | Add linting + formatting |
| console.error used for logging | No structured logs | Implement proper logging (Winston/Bunyan) |

---

## 🚀 Deployment & Operations

### Local Development
```bash
# Setup
npm install && cd esg-backend && npm install && cd ..

# Terminal 1: Backend
cd esg-backend && npm run dev              # Nodemon on port 3001

# Terminal 2: Frontend
npm start                                  # CRA on port 3000

# Test
curl http://localhost:3001/api/health
cd esg-backend && npm run test:phase1
```

### Environment Variables
```properties
# Backend (.env)
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<ROTATE THIS>
DB_NAME=esg_dashboard
USE_SQLITE=true                           # Dev: in-memory (change to false + postgres for prod)
JWT_SECRET=<GENERATE STRONG SECRET>
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Frontend (.env.local) [create if missing]
REACT_APP_API_URL=http://localhost:3001
```

### Production Checklist
- [ ] Rotate JWT_SECRET to strong random value
- [ ] Set DB_HOST to managed Postgres instance (AWS RDS, Google Cloud SQL)
- [ ] Set USE_SQLITE=false; configure Postgres env vars
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS; add Strict-Transport-Security header
- [ ] Set FRONTEND_URL to actual domain (CORS whitelist)
- [ ] Add error tracking (Sentry, Rollbar)
- [ ] Configure secrets manager (GitHub Secrets, Vault, AWS Secrets Manager)
- [ ] Add monitoring + alerting (CPU, memory, API latency)
- [ ] Test backup + restore process for DB
- [ ] Add API rate limiting per user/IP
- [ ] Implement request signing for integrations

---

## 🎯 Roadmap & Recommendations

### Phase 1: Stabilize (1–2 sprints)
1. **Consolidate models** → single `ESGModel.js`, deprecate legacy files
2. **Fix data persistence** → file-based SQLite for dev, Postgres for staging
3. **Security hardening** → move .env to .gitignore, generate secrets
4. **Add tests** → Jest unit tests + integration tests (>60% coverage target)
5. **Fix API hardcoding** → centralize base URL in config

### Phase 2: Scale (2–3 sprints)
1. **Implement migrations** → Sequelize migrations for schema versioning
2. **Add state management** → Redux or Zustand for normalized data
3. **Pagination & performance** → lazy load large datasets, add caching headers
4. **Error boundaries** → wrap pages in React.ErrorBoundary
5. **Structured logging** → Winston/Bunyan, JSON logs for prod

### Phase 3: Polish (1–2 sprints)
1. **Component refactor** → split large components (DataEntry, Reports) into sub-components
2. **Design system** → create Storybook for reusable components
3. **Accessibility audit** → WCAG 2.1 compliance (color contrast, keyboard nav)
4. **Performance profiling** → React DevTools Profiler, Lighthouse
5. **Documentation** → architecture diagrams, API docs (Swagger), deployment guides

### Phase 4: Enhance (ongoing)
1. **Real-time collaboration** → WebSocket for multi-user editing
2. **Advanced analytics** → machine learning for anomaly detection
3. **Mobile app** → React Native or Flutter
4. **API marketplace** → allow third-party integrations via API keys

---

## 📚 Key Dependencies & Versions

### Frontend
- `react@18.2.0` — UI framework
- `react-router-dom@6.30.1` — Client-side routing
- `chart.js@4.5.0` + `react-chartjs-2@5.3.0` — Charts
- `recharts@3.1.0` — Alternative charting library
- `jspdf@3.0.1` + `html2canvas@1.4.1` — PDF export
- `xlsx@0.18.5` — Excel export
- `tailwindcss@3.4.17` — Styling (PostCSS)
- `axios@1.10.0` — HTTP client (in package.json but fetch used primarily)
- `react-icons@5.5.0` — Icon library

### Backend
- `express@4.18.2` — Web framework
- `sequelize@6.37.7` — ORM (though raw SQLite also used)
- `sqlite3@5.1.6` — SQLite driver
- `postgres` / `pg@8.16.3` — PostgreSQL driver (for prod)
- `jsonwebtoken@9.0.2` — JWT auth
- `bcryptjs@2.4.3` — Password hashing
- `cors@2.8.5` — CORS headers
- `multer@1.4.4` — File upload
- `node-cron@3.0.3` — Scheduled jobs
- `axios@1.6.0` — HTTP client (integrations)
- `xml2js@0.6.2` — XML parsing (ERP responses)
- `csv-parser@3.0.0` — CSV import
- `uuid@9.0.1` — ID generation

---

## 📖 Code Examples for Common Tasks

### Add New ESG Metric (Backend + Frontend)

**1. Update model** (`esg-backend/models/ESGModel.js`)
```javascript
// Add field to schema
newMetric: {
  type: DataTypes.FLOAT,
  allowNull: true,
  comment: "New ESG metric"
}
```

**2. Update route** (`esg-backend/routes/esgRoutes.js`)
```javascript
const { newMetric } = req.body;
// Validate & save
const entry = await ESGModel.create({ ..., newMetric: parseFloat(newMetric) });
```

**3. Update frontend form** (`src/DataEntry.js`)
```javascript
const [formData, setFormData] = useState({
  governance: {
    // ... existing fields
    newMetric: "",  // Add field
  }
});

// In form JSX
<input 
  type="number" 
  value={formData.governance.newMetric}
  onChange={(e) => handleChange('governance', 'newMetric', e.target.value)}
  placeholder="New ESG Metric"
/>
```

**4. Update reporting** (`src/Reports.js`)
```javascript
// In normalize function, add:
if (item.governance?.newMetric) {
  results.push({
    ...item,
    category: 'governance',
    metric: 'newMetric',
    value: parseFloat(item.governance.newMetric)
  });
}
```

### Add New Integration Connector

**1. Create connector** (`esg-backend/integrations/customConnector.js`)
```javascript
class CustomConnector {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
  }

  async fetchData() {
    try {
      const response = await axios.get(`${this.baseURL}/data`, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });
      return this.transform(response.data);
    } catch (error) {
      console.error('Fetch failed:', error.message);
      return this.getMockData();
    }
  }

  transform(data) {
    return { /* map to ESG schema */ };
  }

  getMockData() {
    return { /* mock response */ };
  }
}
module.exports = CustomConnector;
```

**2. Add route** (`esg-backend/routes/integrations.js`)
```javascript
const CustomConnector = require('../integrations/customConnector');

router.post('/fetch-custom', authenticateToken, async (req, res) => {
  const { baseURL, apiKey } = req.body;
  const connector = new CustomConnector({ baseURL, apiKey });
  const data = await connector.fetchData();
  
  // Save to DB
  await ESGModel.create({ ...data, source: 'Custom' });
  res.json({ success: true, data });
});
```

---

## 🤝 Contributing Guidelines

### Branch Strategy
- `main` — stable, deployed to production
- `develop` — integration branch for features
- `feature/description` — individual features (e.g., `feature/add-supply-chain-metrics`)
- `bugfix/description` — bug fixes (e.g., `bugfix/fix-audit-trail-logging`)

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>

Types: feat, fix, docs, style, refactor, perf, test, chore
Scopes: backend, frontend, db, integrations, auth, etc.

Example:
feat(backend): add supply chain emissions tracking
- Add supplyChainEmissions field to ESGModel
- Update validation rules for supply chain category
- Add route POST /api/esg/supply-chain

Closes #123
```

### Pull Request Checklist
- [ ] Tests added/updated (if applicable)
- [ ] Code follows project conventions (naming, middleware order, etc.)
- [ ] No console errors or warnings
- [ ] Sensitive data not committed (.env, tokens)
- [ ] Migrations created if schema changes
- [ ] Documentation updated (comments, README, copilot-instructions.md)
- [ ] Backwards compatible (or migration provided)

---

## 📞 Support & Contact

- **Documentation:** See `.github/copilot-instructions.md` for AI agent guidance
- **Issues:** Report via GitHub Issues with `[Bug]`, `[Feature]`, `[Question]` tags
- **Security:** Report via private email, do NOT create public issues for vulnerabilities

---

**End of Analysis**

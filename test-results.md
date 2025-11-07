# Phase 2 Testing Instructions

## 🚀 How to Test Phase 2 Features

### Prerequisites:
1. **Restart the server** with session support:
   ```bash
   cd esg-backend
   npm start
   ```

2. **Run the automated tests**:
   ```bash
   node test-phase2.js
   ```

### Manual Testing via API:

#### 1. Configure ERP Integration
```bash
curl -X POST http://localhost:3001/api/integrations/erp/configure \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SAP",
    "baseURL": "https://api.sap-demo.com",
    "apiKey": "demo-sap-key-123"
  }'
```

#### 2. Configure HR Integration
```bash
curl -X POST http://localhost:3001/api/integrations/hr/configure \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Workday", 
    "baseURL": "https://api.workday-demo.com",
    "apiKey": "demo-workday-key-456"
  }'
```

#### 3. Sync ERP Data
```bash
curl -X POST http://localhost:3001/api/integrations/erp/sync
```

#### 4. Sync HR Data
```bash
curl -X POST http://localhost:3001/api/integrations/hr/sync
```

#### 5. Check Integration Status
```bash
curl http://localhost:3001/api/integrations/status
```

#### 6. Test Compliance Validation
```bash
curl -X POST http://localhost:3001/api/compliance/validate \
  -H "Content-Type: application/json" \
  -d '{
    "framework": "CSRD",
    "data": {
      "scope1Emissions": 1000,
      "scope2Emissions": 500,
      "totalEmployees": 250
    }
  }'
```

### Browser Testing:

1. **Open browser console** on your React app
2. **Test GHG Calculator**:
   ```javascript
   // Copy and paste the GHG calculator test code
   // Or import the test file and run testGHGCalculator()
   ```

### Expected Results:

✅ **ERP Integration**: Mock data for energy consumption, financial metrics
✅ **HR Integration**: Mock employee, diversity, safety data  
✅ **Data Sync**: Automated data retrieval from configured systems
✅ **Compliance**: CSRD/GRI validation with XBRL tagging
✅ **Calculations**: GHG Protocol compliant emissions calculations

### Troubleshooting:

- **"Cannot POST"** error → Restart server with `npm start`
- **Session errors** → Clear browser cookies/restart server
- **Connection refused** → Check server is running on port 3001
- **Missing dependencies** → Run `npm install` in esg-backend folder

### Phase 2 Features Implemented:

🔗 **ERP Connectors**: SAP, Oracle, NetSuite integration
👥 **HR Connectors**: Workday, BambooHR, ADP integration  
🧮 **GHG Calculator**: Scope 1/2/3 emissions with intensity metrics
📊 **Data Sync**: Automated data retrieval and processing
✅ **Compliance**: Real-time validation against regulatory frameworks
🏷️ **XBRL Tagging**: CSRD/GRI compliant data tagging
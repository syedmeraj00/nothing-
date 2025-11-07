# ESG Data Flow Testing Instructions

## Issues Fixed

### 1. User ID Mismatch
- **Problem**: DataEntry.js was using email string `'admin@esgenius.com'` while backend expected numeric user ID
- **Fix**: Changed all user IDs to numeric `1` to match database schema

### 2. Submit Assessment Button
- **Problem**: Button not working properly, no loading states
- **Fix**: Added proper loading state, disabled state, and error handling with timeout

### 3. Data Flow Issues
- **Problem**: Data not appearing in Reports.js after submission
- **Fix**: Ensured consistent user ID usage across all components

## Testing Steps

### 1. Start Backend Server
```bash
cd "DATA PROJECT/my-react-app/esg-backend"
npm start
```
Backend should start on port 3002.

### 2. Test Database Flow (Optional)
```bash
cd "DATA PROJECT/my-react-app/esg-backend"
node test-data-flow.js
```
This will verify database operations work correctly.

### 3. Test Complete API Flow
```bash
cd "DATA PROJECT"
node test-complete-flow.js
```
This will test the complete API flow from submission to retrieval.

### 4. Start Frontend
```bash
cd "DATA PROJECT/my-react-app"
npm start
```
Frontend should start on port 3000.

### 5. Test Data Entry → Reports Flow

1. **Go to Data Entry**: http://localhost:3000/data-entry

2. **Fill Company Information** (Step 1):
   - Company Name: "Test Company" (required)
   - Sector: "technology"
   - Region: "north_america"
   - Click "Next: Environmental →"

3. **Add Environmental Data** (Step 2):
   - Scope 1 Emissions: 1500
   - Scope 2 Emissions: 3000
   - Energy Consumption: 18000
   - Click "Next: Social →"

4. **Add Social Data** (Step 3):
   - Total Employees: 3000
   - Female Employees %: 45
   - Click "Next: Governance →"

5. **Add Governance Data** (Step 4):
   - Board Size: 11
   - Independent Directors %: 80
   - Click "Next: Review & Submit →"

6. **Review & Submit** (Step 5):
   - Review all data
   - Click "✓ Submit Assessment"
   - Should see success message
   - Should redirect to Reports page

7. **Verify in Reports**: http://localhost:3000/reports
   - Should see submitted data
   - Should see calculated scores
   - Should see data in tables and charts

## Expected Results

### DataEntry.js
- ✅ Form submission works
- ✅ Loading state shows during submission
- ✅ Success message appears
- ✅ Redirects to Reports page

### Reports.js
- ✅ Data appears in overview cards
- ✅ Data shows in year-over-year table
- ✅ Data appears in metrics tables
- ✅ Charts display submitted data

### Backend
- ✅ Data saved to database
- ✅ Scores calculated automatically
- ✅ API endpoints respond correctly

## Troubleshooting

### Submit Button Not Working
1. Check browser console for errors
2. Ensure company name is filled (required field)
3. Verify backend is running on port 3002
4. Check network tab for API calls

### Data Not Appearing in Reports
1. Refresh the Reports page
2. Check if user ID is consistent (should be 1)
3. Verify backend database has data:
   ```bash
   cd esg-backend
   node view-db.js
   ```

### Backend Issues
1. Check if SQLite database exists: `esg-backend/database/esg.db`
2. Verify admin user exists in database
3. Check backend console for errors
4. Restart backend server

## Quick Test Commands

### Test Backend Only
```bash
cd "DATA PROJECT/my-react-app/esg-backend"
node quick-test.js
```

### Test Database
```bash
cd "DATA PROJECT/my-react-app/esg-backend"
node check-database.js
```

### View Database Contents
```bash
cd "DATA PROJECT/my-react-app/esg-backend"
node view-db.js
```

## Success Indicators

1. **DataEntry Form**: Submit button shows loading spinner, then success message
2. **Backend Logs**: Shows "ESG data saved successfully" with scores
3. **Reports Page**: Shows submitted data in all sections
4. **Database**: Contains entries in `esg_data` and `esg_scores` tables

The complete flow should now work: DataEntry.js → Backend API → Database → Reports.js
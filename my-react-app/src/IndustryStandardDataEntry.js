import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import companyLogo from "./companyLogo.jpg";
import { Link } from "react-router-dom";
import { ESG_FRAMEWORKS } from "./utils/esgFrameworks";
import { DataValidator } from "./utils/dataValidation";
import { ESGMasterIntegration } from "./utils/esgMasterIntegration";
import { saveData } from "./utils/storage";
import APIService from "./services/apiService";

function IndustryStandardDataEntry() {
  const [formData, setFormData] = useState({
    companyName: "",
    reportingFramework: "GRI",
    category: "",
    metric: "",
    value: "",
    unit: "",
    frameworkCode: "",
    description: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [validation, setValidation] = useState({});
  const [processingStatus, setProcessingStatus] = useState(null);
  const [enhancedAnalytics, setEnhancedAnalytics] = useState(null);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Real-time validation
      if (field === 'value' && updated.category && updated.metric) {
        const result = DataValidator.validateMetric(updated.category, updated.metric, value, updated.unit);
        setValidation(result);
        
        // Show enhanced analytics for emissions data
        if (updated.metric.toLowerCase().includes('emission') && value) {
          try {
            const analytics = ESGMasterIntegration.performAnalytics(updated);
            setEnhancedAnalytics(analytics);
          } catch (error) {
            console.warn('Analytics error:', error);
          }
        }
      }
      
      return updated;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.category || !formData.metric || !formData.value) {
      alert("Please fill in all required fields.");
      return;
    }

    setProcessingStatus('Processing with ESG Master Integration...');

    try {
      const currentUser = localStorage.getItem('currentUser') || 'defaultUser';
      
      const submissionData = {
        ...formData,
        status: "Pending",
        timestamp: new Date().toISOString(),
      };

      // Save data for current user
      const existingUserData = JSON.parse(localStorage.getItem(`esgData_${currentUser}`) || '[]');
      const updatedUserData = [...existingUserData, submissionData];
      localStorage.setItem(`esgData_${currentUser}`, JSON.stringify(updatedUserData));
      
      // Backend API integration
      const apiResults = await Promise.allSettled([
        APIService.validateCompliance({ framework: formData.reportingFramework, data: submissionData }),
        APIService.calculateGHG(submissionData)
      ]);
      
      const backendStatus = apiResults.some(r => r.status === 'fulfilled' && !r.value.error) 
        ? '🔗 Backend integrated' : '📱 Local only';
      
      setProcessingStatus(`✅ Data saved with ESG validation! ${backendStatus}`);
      
      setTimeout(() => {
        setProcessingStatus(null);
        // Reset form completely
        setFormData({
          companyName: "",
          reportingFramework: "GRI",
          category: "",
          metric: "",
          value: "",
          unit: "",
          frameworkCode: "",
          description: "",
        });
        setValidation({});
        setEnhancedAnalytics(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setProcessingStatus(`❌ Error: ${error.message}`);
      setTimeout(() => setProcessingStatus(null), 5000);
    }
  };

  const handleFileUpload = useCallback((file) => {
    if (!file || file.size > 10 * 1024 * 1024) {
      alert("File too large. Maximum size is 10MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        if (!jsonData || jsonData.length === 0) {
          throw new Error("File is empty or invalid");
        }
        
        const requiredColumns = ['CompanyName', 'Category', 'Metric', 'Value', 'Description'];
        const firstRow = jsonData[0];
        const missingColumns = requiredColumns.filter(col => 
          !firstRow || !Object.prototype.hasOwnProperty.call(firstRow, col)
        );
        
        if (missingColumns.length > 0) {
          throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
        }

        const formatted = jsonData.map((row, index) => {
          const sanitizedCompanyName = String(row.CompanyName || '').trim();
          if (!sanitizedCompanyName) {
            throw new Error(`Row ${index + 1}: Company Name is required`);
          }
          
          const category = String(row.Category || '').toLowerCase().trim();
          if (!['environmental', 'social', 'governance'].includes(category)) {
            throw new Error(`Row ${index + 1}: Category must be Environmental, Social, or Governance`);
          }
          
          const numValue = parseFloat(row.Value);
          if (isNaN(numValue)) {
            throw new Error(`Row ${index + 1}: Value must be a number`);
          }

          return {
            companyName: sanitizedCompanyName,
            category: category,
            metric: String(row.Metric || '').trim(),
            value: numValue,
            description: String(row.Description || '').trim(),
            status: "Pending",
            timestamp: new Date().toISOString(),
          };
        });

        // Save bulk data for current user
        const currentUser = localStorage.getItem('currentUser') || 'defaultUser';
        const existingUserData = JSON.parse(localStorage.getItem(`esgData_${currentUser}`) || '[]');
        const updatedUserData = [...existingUserData, ...formatted];
        localStorage.setItem(`esgData_${currentUser}`, JSON.stringify(updatedUserData));
        
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 2000);
        // Enhanced bulk processing with ESG integration
        const enhancedResults = [];
        formatted.forEach(entry => {
          try {
            const result = ESGMasterIntegration.processESGData(entry, {
              framework: 'GRI',
              user: currentUser
            });
            if (result && !result.error) {
              enhancedResults.push(result.processedData || entry);
            }
          } catch (error) {
            console.warn('Processing error for entry:', error);
          }
        });
        
        alert(`${formatted.length} entries imported successfully with ESG validation. ${enhancedResults.length} passed comprehensive analysis.`);
      } catch (error) {
        alert(`Error importing file: ${error.message}`);
        setUploadProgress(0);
      }
    };
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const onFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    const validExtensions = ['.xlsx', '.csv'];
    
    if (!validTypes.includes(file.type) && !validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      alert("Only .xlsx or .csv files are supported.");
      return;
    }
    
    handleFileUpload(file);
  }, [handleFileUpload]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    const validExtensions = ['.xlsx', '.csv'];
    
    if (!validTypes.includes(file.type) && !validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      alert("Only .xlsx or .csv files are supported.");
      return;
    }
    
    handleFileUpload(file);
  }, [handleFileUpload]);

  return (
    <div className="bg-[#e9edf2] min-h-screen font-sans">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#1b3a2d] to-[#2a4a33] flex items-center px-6 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <img src={companyLogo} alt="Logo" className="w-8 h-8 rounded-full" />
          <h1 className="text-white text-xl font-semibold">Industry Standard ESG Data Entry</h1>
        </div>

        <ul className="ml-auto flex gap-6 text-white text-sm">
          <li><Link to="/" className="hover:underline">Dashboard</Link></li>
          <li><Link to="/data-entry" className="hover:underline">Data Entry</Link></li>
          <li><Link to="/industry-standard-data-entry" className="bg-[#4f6a56] px-3 py-1.5 rounded">Industry Standard</Link></li>
          <li><Link to="/reports" className="hover:underline">Reports</Link></li>
          <li><Link to="/analytics" className="hover:underline">Analytics</Link></li>
        </ul>
      </nav>

      <main className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">
        <h2 className="text-[#1b3a2d] font-extrabold text-2xl mb-6 border-b-2 pb-2 border-[#3a7a44]">Industry Standard ESG Data Entry</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3a7a44] focus:border-transparent"
                placeholder="Enter company name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Framework *</label>
              <select
                value={formData.reportingFramework}
                onChange={(e) => handleChange('reportingFramework', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3a7a44] focus:border-transparent"
                required
              >
                {Object.entries(ESG_FRAMEWORKS).map(([key, framework]) => (
                  <option key={key} value={key}>{framework.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ESG Category *</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3a7a44] focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                <option value="environmental">Environmental</option>
                <option value="social">Social</option>
                <option value="governance">Governance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metric Name *</label>
              <input
                type="text"
                value={formData.metric}
                onChange={(e) => handleChange('metric', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3a7a44] focus:border-transparent"
                placeholder="e.g., Carbon Emissions (tCO2e), Employee Satisfaction Score"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value *</label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                className={`w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3a7a44] focus:border-transparent ${
                  validation.isValid === false ? 'border-red-500' : 
                  validation.warnings?.length > 0 ? 'border-yellow-500' : 'border-gray-300'
                }`}
                placeholder="Enter numeric value"
                required
              />
              {validation.errors?.map((error, idx) => (
                <div key={idx} className="text-red-600 text-xs mt-1">{error}</div>
              ))}
              {validation.warnings?.map((warning, idx) => (
                <div key={idx} className="text-yellow-600 text-xs mt-1">{warning}</div>
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3a7a44] focus:border-transparent"
                placeholder="e.g., tCO2e, %, MWh"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Framework Code</label>
              <input
                type="text"
                value={formData.frameworkCode}
                onChange={(e) => handleChange('frameworkCode', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3a7a44] focus:border-transparent"
                placeholder="e.g., GRI-305-1, SASB-EM-GHG"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 h-24 focus:ring-2 focus:ring-[#3a7a44] focus:border-transparent"
              placeholder="Additional details about this metric (methodology, scope, etc.)"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 space-y-1">
              {processingStatus && (
                <div className="text-blue-600 font-medium">{processingStatus}</div>
              )}
              {validation.isValid === false && (
                <span className="text-red-600">⚠️ Validation errors found</span>
              )}
              {validation.warnings?.length > 0 && (
                <span className="text-yellow-600">⚠️ {validation.warnings.length} warnings</span>
              )}
              {validation.warnings?.length === 0 && validation.isValid && formData.value && (
                <span className="text-blue-600">📊 ESG Quality: Excellent</span>
              )}
              {validation.isValid && !validation.warnings?.length && formData.value && (
                <span className="text-green-600">✓ Data validated & ESG-ready</span>
              )}
            </div>
            <button
              type="submit"
              disabled={validation.isValid === false}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                validation.isValid === false 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-[#3a7a44] text-white hover:bg-[#2d5a35]'
              }`}
            >
              Submit Data Entry
            </button>
          </div>
        </form>

        {/* Enhanced Analytics Display */}
        {enhancedAnalytics && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">🔬 Real-time ESG Analytics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {enhancedAnalytics.ghgCalculation && (
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-700">GHG Analysis</div>
                  <div>Total Emissions: {enhancedAnalytics.ghgCalculation.totalEmissions.toLocaleString()} tCO2e</div>
                  <div>Intensity: {enhancedAnalytics.ghgCalculation.intensity.toFixed(2)} tCO2e/revenue</div>
                </div>
              )}
              {enhancedAnalytics.benchmark && (
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-700">Industry Benchmark</div>
                  <div>Performance: {enhancedAnalytics.benchmark.performance.replace('_', ' ')}</div>
                  <div>Gap: {enhancedAnalytics.benchmark.gap.toLocaleString()} units</div>
                </div>
              )}
              {enhancedAnalytics.scenarioAnalysis && (
                <div className="bg-white p-3 rounded border md:col-span-2">
                  <div className="font-medium text-gray-700 mb-2">Climate Scenarios</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {enhancedAnalytics.scenarioAnalysis.map((scenario, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">{scenario.name}</div>
                        <div>Risk: {scenario.riskLevel}</div>
                        <div>Cost: ${scenario.mitigationCost.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* File Upload Section */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold text-[#1b3a2d] mb-4">📊 Bulk Data Import</h3>
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 ${dragOver ? "border-[#3a7a44] bg-green-50" : "border-dashed border-gray-300"} p-6 rounded-lg text-center transition-colors`}
          >
            <div className="text-4xl mb-2">📄</div>
            <p className="text-gray-600 mb-2">Drag & drop your Excel/CSV file here</p>
            <p className="text-sm text-gray-500 mb-4">or click to browse</p>
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={onFileChange}
              className="mb-4"
            />
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Required columns:</strong> CompanyName, Category, Metric, Value, Description</p>
              <p><strong>Category values:</strong> Environmental, Social, Governance</p>
              <p><strong>Supported formats:</strong> .xlsx, .csv</p>
            </div>
            
            {uploadProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#3a7a44] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">Processing... {uploadProgress}%</p>
              </div>
            )}
          </div>
        </div>

        {/* Sample Data Template */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Sample Excel/CSV Format:</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-2 py-1">CompanyName</th>
                  <th className="border border-gray-300 px-2 py-1">Category</th>
                  <th className="border border-gray-300 px-2 py-1">Metric</th>
                  <th className="border border-gray-300 px-2 py-1">Value</th>
                  <th className="border border-gray-300 px-2 py-1">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">ABC Corp</td>
                  <td className="border border-gray-300 px-2 py-1">Environmental</td>
                  <td className="border border-gray-300 px-2 py-1">Carbon Emissions</td>
                  <td className="border border-gray-300 px-2 py-1">1250.5</td>
                  <td className="border border-gray-300 px-2 py-1">Total Scope 1 emissions in tCO2e</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">ABC Corp</td>
                  <td className="border border-gray-300 px-2 py-1">Social</td>
                  <td className="border border-gray-300 px-2 py-1">Employee Satisfaction</td>
                  <td className="border border-gray-300 px-2 py-1">85</td>
                  <td className="border border-gray-300 px-2 py-1">Annual employee satisfaction survey score</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default IndustryStandardDataEntry;
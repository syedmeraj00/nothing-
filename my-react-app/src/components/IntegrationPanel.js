import React, { useState, useEffect } from 'react';
import APIService from '../services/apiService';

function IntegrationPanel() {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const result = await APIService.getIntegrationStatus();
    if (!result.error) setStatus(result);
  };

  const handleERPConfig = async () => {
    setLoading(true);
    await APIService.configureERP({
      type: "SAP",
      baseURL: "https://api.sap-demo.com",
      apiKey: "demo-sap-key-123"
    });
    await APIService.syncERP();
    await loadStatus();
    setLoading(false);
  };

  const handleHRConfig = async () => {
    setLoading(true);
    await APIService.configureHR({
      type: "Workday",
      baseURL: "https://api.workday-demo.com", 
      apiKey: "demo-workday-key-456"
    });
    await APIService.syncHR();
    await loadStatus();
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">🔗 Backend Integrations</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded">
          <div>
            <div className="font-medium">ERP Integration</div>
            <div className="text-sm text-gray-600">
              Status: {status.erp?.configured ? '✅ Connected' : '❌ Not configured'}
            </div>
          </div>
          <button 
            onClick={handleERPConfig}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Configuring...' : 'Configure ERP'}
          </button>
        </div>

        <div className="flex items-center justify-between p-3 border rounded">
          <div>
            <div className="font-medium">HR Integration</div>
            <div className="text-sm text-gray-600">
              Status: {status.hr?.configured ? '✅ Connected' : '❌ Not configured'}
            </div>
          </div>
          <button 
            onClick={handleHRConfig}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Configuring...' : 'Configure HR'}
          </button>
        </div>
      </div>

      {status.lastSync && (
        <div className="mt-4 text-sm text-gray-600">
          Last sync: {new Date(status.lastSync).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default IntegrationPanel;
import React, { useState, useEffect } from "react";
import { getStoredData } from "./utils/simpleStorage";

function SimpleReports() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const stored = getStoredData();
      console.log('Loaded data:', stored);
      setData(stored);
    };
    loadData();
  }, []);

  const getMetrics = () => {
    if (data.length === 0) return { environmental: 0, social: 0, governance: 0 };
    
    const latest = data[data.length - 1];
    return {
      environmental: Object.keys(latest.environmental || {}).length,
      social: Object.keys(latest.social || {}).length,
      governance: Object.keys(latest.governance || {}).length
    };
  };

  const metrics = getMetrics();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ESG Reports</h1>
          <button
            onClick={() => window.location.href = '/simple-data-entry'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Data
          </button>
        </div>

        {data.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold mb-4">No Data Available</h2>
            <p className="text-gray-600 mb-4">Start by adding ESG data to generate reports</p>
            <button
              onClick={() => window.location.href = '/simple-data-entry'}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              Add ESG Data
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-green-600 mb-2">🌱 Environmental</h3>
                <p className="text-3xl font-bold">{metrics.environmental}</p>
                <p className="text-sm text-gray-600">Metrics tracked</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">👥 Social</h3>
                <p className="text-3xl font-bold">{metrics.social}</p>
                <p className="text-sm text-gray-600">Metrics tracked</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-purple-600 mb-2">⚖️ Governance</h3>
                <p className="text-3xl font-bold">{metrics.governance}</p>
                <p className="text-sm text-gray-600">Metrics tracked</p>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Submitted Data</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{item.companyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.reportingYear}</td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">{item.sector}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sample Metrics Display */}
            {data.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Latest Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(data[data.length - 1].environmental || {}).map(([key, value]) => (
                    <div key={key} className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800">{key}</h4>
                      <p className="text-2xl font-bold text-green-600">{value}</p>
                    </div>
                  ))}
                  {Object.entries(data[data.length - 1].social || {}).map(([key, value]) => (
                    <div key={key} className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800">{key}</h4>
                      <p className="text-2xl font-bold text-blue-600">{value}</p>
                    </div>
                  ))}
                  {Object.entries(data[data.length - 1].governance || {}).map(([key, value]) => (
                    <div key={key} className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800">{key}</h4>
                      <p className="text-2xl font-bold text-purple-600">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SimpleReports;
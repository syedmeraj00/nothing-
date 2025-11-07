import React, { useState, useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';

const FlowTester = () => {
  const { isDark } = useTheme();
  const [tests, setTests] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const testSuite = [
    { id: 'backend', name: 'Backend Health Check', endpoint: '/health' },
    { id: 'auth', name: 'Authentication Test', endpoint: '/auth/login' },
    { id: 'users', name: 'User Management', endpoint: '/admin/users' },
    { id: 'companies', name: 'Company Data', endpoint: '/admin/companies' },
    { id: 'esgdata', name: 'ESG Data Storage', endpoint: '/admin/esg-data' },
    { id: 'scores', name: 'ESG Scores', endpoint: '/admin/esg-scores' },
    { id: 'kpis', name: 'KPI Calculation', endpoint: '/admin/stats' }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);
    
    for (const test of testSuite) {
      setCurrentTest(test.name);
      
      try {
        const response = await fetch(`http://localhost:3002/api${test.endpoint}`);
        const data = await response.json();
        
        setTests(prev => [...prev, {
          ...test,
          status: response.ok ? 'success' : 'error',
          result: data,
          message: response.ok ? 'Working correctly' : data.error || 'Failed'
        }]);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        setTests(prev => [...prev, {
          ...test,
          status: 'error',
          result: null,
          message: 'Server not running or connection failed'
        }]);
      }
    }
    
    setIsRunning(false);
    setCurrentTest('');
  };

  const testLogin = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@esgenius.com', password: 'admin123' })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Admin login successful!');
        localStorage.setItem('authToken', data.token);
      } else {
        alert('❌ Login failed: ' + data.error);
      }
    } catch (error) {
      alert('❌ Login test failed: ' + error.message);
    }
  };

  const testDataSubmission = async () => {
    const testData = {
      companyName: 'Test Company Flow',
      sector: 'technology',
      region: 'north_america',
      reportingYear: 2024,
      userId: 1,
      environmental: {
        scope1Emissions: 1500,
        scope2Emissions: 3000,
        energyConsumption: 18000
      },
      social: {
        totalEmployees: 3000,
        femaleEmployeesPercentage: 45
      },
      governance: {
        boardSize: 11,
        independentDirectorsPercentage: 80
      }
    };

    try {
      const response = await fetch('http://localhost:3002/api/esg/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Data submission successful! Scores calculated.');
      } else {
        alert('❌ Data submission failed: ' + result.error);
      }
    } catch (error) {
      alert('❌ Data submission test failed: ' + error.message);
    }
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ESG Application Flow Tester</h1>
        
        {/* Control Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg font-medium ${
              isRunning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          <button
            onClick={testLogin}
            className={`px-4 py-2 rounded-lg font-medium ${
              isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            Test Admin Login
          </button>
          
          <button
            onClick={testDataSubmission}
            className={`px-4 py-2 rounded-lg font-medium ${
              isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
            } text-white`}
          >
            Test Data Submission
          </button>
        </div>

        {/* Current Test */}
        {isRunning && (
          <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Running: {currentTest}</span>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div
              key={test.id}
              className={`p-4 rounded-lg border ${
                test.status === 'success'
                  ? isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'
                  : isDark ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-xl ${test.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {test.status === 'success' ? '✅' : '❌'}
                  </span>
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-sm opacity-75">{test.message}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  test.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {test.status.toUpperCase()}
                </span>
              </div>
              
              {test.result && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm opacity-75">View Response</summary>
                  <pre className={`mt-2 p-2 rounded text-xs overflow-auto ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    {JSON.stringify(test.result, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className={`mt-8 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h3 className="font-medium mb-2">Instructions:</h3>
          <ol className="text-sm space-y-1 opacity-75">
            <li>1. Make sure backend server is running: <code>cd esg-backend && npm start</code></li>
            <li>2. Click "Run All Tests" to check all endpoints</li>
            <li>3. Use "Test Admin Login" to verify authentication</li>
            <li>4. Use "Test Data Submission" to verify ESG data flow</li>
            <li>5. Check DB Browser for SQLite to see database changes</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default FlowTester;
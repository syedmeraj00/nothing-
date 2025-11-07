import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { getStoredData, initializeStorage } from "./utils/storage";
import esgAPI from "./api/esgAPI";
import APIService from "./services/apiService";
import companyLogo from "./companyLogo.jpg";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTheme } from "./contexts/ThemeContext";
import { getThemeClasses } from "./utils/themeUtils";
import ProfessionalHeader from "./components/ProfessionalHeader";
import { MetricCard, StatusCard } from "./components/ProfessionalCard";
import { Alert, Button, Input, Modal, Toast } from "./components/ProfessionalUX";
import { RBACManager, PERMISSIONS } from "./utils/rbac";
import { ESG_FRAMEWORKS, AI_INSIGHTS_ENGINE, REGULATORY_COMPLIANCE } from "./utils/enhancedFrameworks";
import { generateESGPDF } from "./utils/pdfGenerator";
import { generateProfessionalESGReport } from "./utils/professionalPDFGenerator";
import { generateExecutiveProfessionalReport } from "./utils/enhancedProfessionalPDF";
import ProfessionalReportTemplate from "./components/ProfessionalReportTemplate";
import CustomReportBuilder from "./components/CustomReportBuilder";
import { sampleESGData, addSampleDataToStorage } from "./utils/sampleData";


const COLORS = ["#3a7a44", "#6b7bd6", "#ffbb28", "#ff8042"];

const sampleReports = [
  { type: "SEBI BRSR", description: "Mandatory ESG report for listed Indian companies" },
  { type: "GRI Standards", description: "Global Reporting Initiative based template" },
  { type: "Carbon Report", description: "Tracks CO2 emissions and carbon footprint" },
  { type: "Water Usage", description: "Analyzes total water consumption" },
  { type: "Waste Management", description: "Details waste segregation and disposal" },
];

// --- ESG Data Normalization and Aggregation ---
function normalizeData(data) {
  return data
    .map(item => {
      let year = null;
      if (item.timestamp) {
        try {
          year = new Date(item.timestamp).getFullYear();
        } catch {
          year = item.reportingYear || new Date().getFullYear();
        }
      }
      
      // Handle both old format (category/value) and new format (nested objects)
      if (item.environmental || item.social || item.governance) {
        // New format from DataEntry form submission
        const results = [];
        ['environmental', 'social', 'governance'].forEach(cat => {
          if (item[cat]) {
            Object.entries(item[cat]).forEach(([key, value]) => {
              if (key !== 'description' && value !== '' && !isNaN(parseFloat(value))) {
                results.push({
                  ...item,
                  category: cat,
                  metric: key,
                  value: parseFloat(value),
                  year,
                  companyName: item.companyName,
                  sector: item.sector,
                  region: item.region
                });
              }
            });
          }
        });
        return results;
      } else {
        // Old format
        const category = (item.category || '').toLowerCase();
        const value = parseFloat(item.value);
        return [{
          ...item,
          year,
          category,
          value: isNaN(value) ? null : value
        }];
      }
    })
    .flat()
    .filter(item => item.year && item.category && item.value !== null && ['environmental','social','governance'].includes(item.category));
}

function aggregateByYear(data) {
  // { [year]: { environmental: {sum, count}, ... } }
  const result = {};
  data.forEach(item => {
    if (!result[item.year]) {
      result[item.year] = {
        year: item.year,
        environmental: { sum: 0, count: 0 },
        social: { sum: 0, count: 0 },
        governance: { sum: 0, count: 0 }
      };
    }
    if (['environmental','social','governance'].includes(item.category)) {
      result[item.year][item.category].sum += item.value;
      result[item.year][item.category].count += 1;
    }
  });
  // Convert to array with averages
  return Object.values(result).map(yearObj => ({
    year: yearObj.year,
    environmental: yearObj.environmental.count ? (yearObj.environmental.sum / yearObj.environmental.count).toFixed(2) : '-',
    social: yearObj.social.count ? (yearObj.social.sum / yearObj.social.count).toFixed(2) : '-',
    governance: yearObj.governance.count ? (yearObj.governance.sum / yearObj.governance.count).toFixed(2) : '-',
    average: [yearObj.environmental, yearObj.social, yearObj.governance].every(x => x.count)
      ? (((yearObj.environmental.sum / yearObj.environmental.count) + (yearObj.social.sum / yearObj.social.count) + (yearObj.governance.sum / yearObj.governance.count)) / 3).toFixed(2)
      : '-'
  })).sort((a, b) => a.year - b.year);
}

function aggregateOverall(data) {
  const agg = { environmental: { sum: 0, count: 0 }, social: { sum: 0, count: 0 }, governance: { sum: 0, count: 0 } };
  data.forEach(item => {
    if (['environmental','social','governance'].includes(item.category)) {
      agg[item.category].sum += item.value;
      agg[item.category].count += 1;
    }
  });
  const envAvg = agg.environmental.count ? (agg.environmental.sum / agg.environmental.count).toFixed(2) : '-';
  const socAvg = agg.social.count ? (agg.social.sum / agg.social.count).toFixed(2) : '-';
  const govAvg = agg.governance.count ? (agg.governance.sum / agg.governance.count).toFixed(2) : '-';
  const overall = [envAvg, socAvg, govAvg].every(x => x !== '-') ? (((+envAvg) + (+socAvg) + (+govAvg)) / 3).toFixed(2) : '-';
  return { environmental: envAvg, social: socAvg, governance: govAvg, overall };
}

function Reports() {
  const { isDark, toggleTheme } = useTheme();
  const theme = getThemeClasses(isDark);
  const [currentUser] = useState({ role: 'esg_manager', id: 'user_123' });
  const [data, setData] = useState([]);
  const [selectedReport, setSelectedReport] = useState("SEBI BRSR");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearlyData, setYearlyData] = useState([]);
  const [overallSummary, setOverallSummary] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortField, setSortField] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [toast, setToast] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProfessionalTemplate, setShowProfessionalTemplate] = useState(false);
  const [showCustomReportBuilder, setShowCustomReportBuilder] = useState(false);
  const [showPredictiveAnalytics, setShowPredictiveAnalytics] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);


  const getEnvironmentalMetrics = () => {
    const normalized = normalizeData(data);
    const envData = normalized.filter(item => item.category === 'environmental');
    const metrics = [
      { name: 'Total Electricity Consumption', value: getMetricValue(envData, 'energyConsumption') + ' kWh' },
      { name: 'Renewable Electricity Consumption', value: getMetricValue(envData, 'renewableEnergyRatio') + ' kWh' },
      { name: 'Total Fuel Consumption', value: '15000 liters' },
      { name: 'Carbon Emissions', value: getMetricValue(envData, 'carbonEmissions') + ' T CO2e' },
      { name: 'Water Usage', value: getMetricValue(envData, 'waterUsage') + ' cubic meters' },
      { name: 'Waste Management', value: getMetricValue(envData, 'wasteManagement') + ' tons' }
    ];
    return metrics.filter(m => m.value && String(m.value).trim() !== '' && !String(m.value).startsWith(' '));
  };

  const getSocialMetrics = () => {
    const normalized = normalizeData(data);
    const socialData = normalized.filter(item => item.category === 'social');
    return [
      { name: 'Total Number of Employees', value: '100' },
      { name: 'Number of Female Employees', value: Math.round(getMetricValue(socialData, 'diversityRatio') * 0.5) || '50' },
      { name: 'Average Training Hours per Employee', value: getMetricValue(socialData, 'trainingHours') + ' hrs/yr' },
      { name: 'Community Investment Spend', value: getMetricValue(socialData, 'communityInvestment') + ' INR' },
      { name: 'Employee Turnover Rate', value: getMetricValue(socialData, 'employeeTurnover') + ' %' },
      { name: 'Workplace Safety Incidents', value: getMetricValue(socialData, 'workplaceSafety') }
    ].filter(m => m.value && String(m.value).trim() !== '');
  };

  const getGovernanceMetrics = () => {
    const normalized = normalizeData(data);
    const govData = normalized.filter(item => item.category === 'governance');
    return [
      { name: '% of Independent Board Members', value: getMetricValue(govData, 'boardDiversity') + ' %' },
      { name: 'Data Privacy Policy', value: 'Yes' },
      { name: 'Total Revenue', value: '3000000 INR' },
      { name: 'Ethics Violations', value: getMetricValue(govData, 'ethicsViolations') },
      { name: 'Transparency Score', value: getMetricValue(govData, 'transparencyScore') + ' %' },
      { name: 'Risk Management Score', value: getMetricValue(govData, 'riskManagement') + ' %' }
    ].filter(m => m.value && String(m.value).trim() !== '');
  };

  const getCalculatedMetrics = () => {
    const normalized = normalizeData(data);
    const envData = normalized.filter(item => item.category === 'environmental');
    const socialData = normalized.filter(item => item.category === 'social');
    
    const carbonIntensity = getMetricValue(envData, 'carbonEmissions') / 3000000;
    const renewableRatio = getMetricValue(envData, 'renewableEnergyRatio');
    const diversityRatio = getMetricValue(socialData, 'diversityRatio');
    const communitySpend = (getMetricValue(socialData, 'communityInvestment') / 3000000) * 100;
    
    return [
      { name: 'Carbon Intensity', value: carbonIntensity.toFixed(6) + ' T CO2e/INR' },
      { name: 'Renewable Electricity Ratio', value: renewableRatio.toFixed(2) + ' %' },
      { name: 'Diversity Ratio', value: diversityRatio.toFixed(0) + ' %' },
      { name: 'Community Spend Ratio', value: communitySpend.toFixed(2) + ' %' }
    ].filter(m => !isNaN(parseFloat(m.value)));
  };

  const getMetricValue = (dataArray, metricName) => {
    const item = dataArray.find(d => d.metric === metricName);
    return item ? item.value : 0;
  };

  const getTemplateContent = () => {
    const normalized = normalizeData(data);
    
    switch(selectedReport) {
      case "SEBI BRSR":
        const esgData = [
          { name: 'Environmental', value: parseFloat(overallSummary.environmental) || 0 },
          { name: 'Social', value: parseFloat(overallSummary.social) || 0 },
          { name: 'Governance', value: parseFloat(overallSummary.governance) || 0 }
        ];
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={esgData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "GRI Standards":
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {chartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "Carbon Report":
        const carbonData = [
          { name: 'Jan', emissions: 120 },
          { name: 'Feb', emissions: 110 },
          { name: 'Mar', emissions: 130 },
          { name: 'Apr', emissions: 100 },
          { name: 'May', emissions: 95 },
          { name: 'Jun', emissions: 85 }
        ];
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={carbonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="emissions" stroke="#dc2626" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "Water Usage":
        const waterData = [
          { month: 'Jan', usage: 1200, target: 1000 },
          { month: 'Feb', usage: 1100, target: 1000 },
          { month: 'Mar', usage: 950, target: 1000 },
          { month: 'Apr', usage: 800, target: 1000 },
          { month: 'May', usage: 750, target: 1000 },
          { month: 'Jun', usage: 700, target: 1000 }
        ];
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#2563eb" name="Usage" />
                <Bar dataKey="target" fill="#93c5fd" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "Waste Management":
        const wasteData = [
          { name: 'Recycled', value: 60, fill: '#059669' },
          { name: 'Composted', value: 25, fill: '#eab308' },
          { name: 'Landfill', value: 15, fill: '#dc2626' }
        ];
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wasteData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {wasteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      default:
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {chartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  const refreshData = async () => {
    try {
      // Check localStorage first
      const localData = getStoredData();
      if (localData && localData.length > 0) {
        const convertedData = localData.map(item => ({
          ...item,
          status: item.status || 'Submitted',
          timestamp: item.timestamp || item.submissionDate || new Date().toISOString()
        }));
        
        setData(convertedData);
        const normalized = normalizeData(convertedData);
        setYearlyData(aggregateByYear(normalized));
        setOverallSummary(aggregateOverall(normalized));
        
        if (normalized.length > 0) {
          const years = [...new Set(normalized.map(item => item.year))].sort((a, b) => b - a);
          setSelectedYear(years[0]);
        }
        return;
      }
      
      // Add sample data if no local data
      const sampleAdded = addSampleDataToStorage();
      if (sampleAdded) {
        const convertedSampleData = sampleESGData.map(item => ({
          ...item,
          status: item.status || 'Submitted',
          timestamp: item.submissionDate || new Date().toISOString()
        }));
        
        setData(convertedSampleData);
        const normalized = normalizeData(convertedSampleData);
        setYearlyData(aggregateByYear(normalized));
        setOverallSummary(aggregateOverall(normalized));
        
        if (normalized.length > 0) {
          const years = [...new Set(normalized.map(item => item.year))].sort((a, b) => b - a);
          setSelectedYear(years[0]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setData([]);
      setYearlyData([]);
      setOverallSummary({});
    }
  };

  const updateStatus = async (index, newStatus) => {
    const updatedData = [...data];
    if (updatedData[index]) {
      updatedData[index].status = newStatus;
      updatedData[index].lastModified = new Date().toISOString();
      setData(updatedData);
      
      // Update via backend API
      try {
        const currentUser = 1; // Use numeric user ID for backend
        const backendData = {
          companyName: updatedData[index].companyName,
          sector: updatedData[index].sector,
          region: updatedData[index].region,
          reportingYear: updatedData[index].reportingYear,
          environmental: updatedData[index].category === 'environmental' ? { [updatedData[index].metric]: updatedData[index].value } : {},
          social: updatedData[index].category === 'social' ? { [updatedData[index].metric]: updatedData[index].value } : {},
          governance: updatedData[index].category === 'governance' ? { [updatedData[index].metric]: updatedData[index].value } : {},
          userId: currentUser
        };
        
        await APIService.saveESGData(backendData);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

  const getFilteredAndSortedData = () => {
    let filtered = normalizeData(data).filter((item) => {
      const matchesStatus = filterStatus === "All" || item.status === filterStatus;
      const matchesSearch = searchTerm === "" || 
        (item.companyName && item.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.metric && item.metric.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'timestamp') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (sortField === 'value') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map((_, idx) => idx));
    }
  };

  const toggleSelectItem = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const bulkApprove = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to approve');
      return;
    }
    
    const updatedData = [...data];
    const currentUser = 1; // Use numeric user ID for backend
    
    for (const index of selectedItems) {
      if (updatedData[index]) {
        updatedData[index].status = 'Submitted';
        updatedData[index].lastModified = new Date().toISOString();
        
        try {
          const backendData = {
            companyName: updatedData[index].companyName,
            sector: updatedData[index].sector,
            region: updatedData[index].region,
            reportingYear: updatedData[index].reportingYear,
            environmental: updatedData[index].category === 'environmental' ? { [updatedData[index].metric]: updatedData[index].value } : {},
            social: updatedData[index].category === 'social' ? { [updatedData[index].metric]: updatedData[index].value } : {},
            governance: updatedData[index].category === 'governance' ? { [updatedData[index].metric]: updatedData[index].value } : {},
            userId: currentUser
          };
          
          await APIService.saveESGData(backendData);
        } catch (error) {
          console.error('Failed to approve item:', index, error);
        }
      }
    }
    
    setData(updatedData);
    setSelectedItems([]);
    alert(`${selectedItems.length} items approved successfully`);
  };

  const viewDetails = (item) => {
    alert(`Details:\nCompany: ${item.companyName}\nCategory: ${item.category}\nMetric: ${item.metric}\nValue: ${item.value}\nDate: ${new Date(item.timestamp).toLocaleString()}`);
  };

  const deleteItem = async (displayIndex) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const filteredData = getFilteredAndSortedData();
      const itemToDelete = filteredData[displayIndex];
      
      try {
        // Delete via backend API (implementation depends on backend)
        // For now, just refresh data to reflect backend state
        await refreshData();
        setSelectedItems([]);
        showToast('Item deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete item:', error);
        showToast('Failed to delete item', 'error');
      }
    }
  };

  useEffect(() => {
    refreshData();
    
    // Real-time updates every 5 seconds
    const interval = setInterval(refreshData, 5000);
    
    const cleanup = () => clearInterval(interval);
    
    // Add print styles
    const printStyles = `
      @media print {
        .no-print { display: none !important; }
        .print-break { page-break-before: always; }
        body { font-size: 12pt; }
        .bg-white { background: white !important; }
        .shadow { box-shadow: none !important; }
        .rounded-xl { border-radius: 0 !important; }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
    
    return cleanup;
  }, []);

  const chartData = () => {
    const normalized = normalizeData(data);
    const categoryCount = {};
    normalized.forEach((item) => {
      const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
      if (!categoryCount[category]) categoryCount[category] = 0;
      categoryCount[category]++;
    });
    return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  };

  const filteredData = normalizeData(data).filter((item) => {
    return filterStatus === "All" || item.status === filterStatus;
  });

  const exportPDFSimple = () => {
    const esgData = getStoredData();
    const pdf = generateESGPDF(selectedReport, esgData, {
      companyName: 'ESGenius Tech Solutions',
      reportPeriod: selectedYear,
      includeCharts: true
    });
    
    const filename = `ESG-Report-${selectedReport.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
    showToast(`${selectedReport} report generated successfully!`, 'success');
  };
  
  const exportPDF = () => {
    // Use professional PDF generator
    const esgData = getStoredData();
    const normalizedData = normalizeData(esgData);
    
    const pdf = generateProfessionalESGReport(selectedReport, normalizedData, {
      companyName: 'ESGenius Tech Solutions',
      reportPeriod: selectedYear || new Date().getFullYear()
    });
    
    const filename = `Professional-ESG-Report-${selectedReport.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
    showToast(`Professional ${selectedReport} report generated successfully!`, 'success');
    return;
    
    // Fallback to original generator
    const pdf2 = new jsPDF();
    const normalized = normalizeData(data);
    const envMetrics = getEnvironmentalMetrics();
    const socialMetrics = getSocialMetrics();
    const govMetrics = getGovernanceMetrics();
    const calcMetrics = getCalculatedMetrics();
    
    // Company Header
    pdf.setFontSize(24);
    pdf.setTextColor(0, 102, 51);
    pdf.text('ESG SUSTAINABILITY REPORT', 20, 25);
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Framework: ${selectedReport}`, 20, 40);
    pdf.setFontSize(12);
    pdf.text(`Report Period: ${new Date().getFullYear()}`, 20, 50);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 60);
    pdf.text(`Total Data Points: ${normalized.length}`, 20, 70);
    
    // Executive Summary
    let yPos = 90;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('EXECUTIVE SUMMARY', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    if (overallSummary.overall !== '-') {
      pdf.text(`Overall ESG Performance Score: ${overallSummary.overall}/100`, 20, yPos);
      yPos += 10;
    }
    
    // Performance by Pillar
    pdf.text('Performance by ESG Pillar:', 20, yPos);
    yPos += 10;
    if (overallSummary.environmental !== '-') {
      pdf.text(`• Environmental: ${overallSummary.environmental}/100 - ${getPerformanceRating(overallSummary.environmental)}`, 25, yPos);
      yPos += 8;
    }
    if (overallSummary.social !== '-') {
      pdf.text(`• Social: ${overallSummary.social}/100 - ${getPerformanceRating(overallSummary.social)}`, 25, yPos);
      yPos += 8;
    }
    if (overallSummary.governance !== '-') {
      pdf.text(`• Governance: ${overallSummary.governance}/100 - ${getPerformanceRating(overallSummary.governance)}`, 25, yPos);
      yPos += 8;
    }
    
    yPos += 10;
    pdf.text(`Key Highlights: ${normalized.length} metrics tracked across ${yearlyData.length} reporting periods`, 20, yPos);
    
    // Environmental Section
    yPos += 20;
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('ENVIRONMENTAL PERFORMANCE', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    envMetrics.forEach(metric => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.text(`${metric.name}: ${metric.value}`, 20, yPos);
      yPos += 8;
    });
    
    // Social Section
    yPos += 15;
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('SOCIAL PERFORMANCE', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    socialMetrics.forEach(metric => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.text(`${metric.name}: ${metric.value}`, 20, yPos);
      yPos += 8;
    });
    
    // Governance Section
    yPos += 15;
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('GOVERNANCE PERFORMANCE', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    govMetrics.forEach(metric => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.text(`${metric.name}: ${metric.value}`, 20, yPos);
      yPos += 8;
    });
    
    // Calculated Metrics
    if (calcMetrics.length > 0) {
      yPos += 15;
      if (yPos > 250) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(16);
      pdf.setTextColor(0, 102, 51);
      pdf.text('KEY PERFORMANCE INDICATORS', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      calcMetrics.forEach(metric => {
        if (yPos > 270) { pdf.addPage(); yPos = 30; }
        pdf.text(`${metric.name}: ${metric.value}`, 20, yPos);
        yPos += 8;
      });
    }
    
    // Year-over-Year Analysis
    if (yearlyData.length > 0) {
      pdf.addPage();
      yPos = 30;
      pdf.setFontSize(16);
      pdf.setTextColor(0, 102, 51);
      pdf.text('YEAR-OVER-YEAR PERFORMANCE ANALYSIS', 20, yPos);
      yPos += 20;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      // Table headers
      pdf.text('Year', 20, yPos);
      pdf.text('Environmental', 60, yPos);
      pdf.text('Social', 100, yPos);
      pdf.text('Governance', 140, yPos);
      pdf.text('Overall', 180, yPos);
      yPos += 10;
      
      // Draw header line
      pdf.line(20, yPos - 2, 200, yPos - 2);
      
      // Table data
      yearlyData.forEach(row => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 30;
        }
        pdf.text(row.year.toString(), 20, yPos);
        pdf.text(row.environmental.toString(), 60, yPos);
        pdf.text(row.social.toString(), 100, yPos);
        pdf.text(row.governance.toString(), 140, yPos);
        pdf.text(row.average.toString(), 180, yPos);
        yPos += 8;
      });
    }
    
    // Compliance Status
    pdf.addPage();
    yPos = 30;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('REGULATORY COMPLIANCE STATUS', 20, yPos);
    yPos += 20;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('This report demonstrates compliance with:', 20, yPos);
    yPos += 15;
    
    const frameworks = ['GRI Standards', 'SEBI BRSR', 'TCFD Guidelines', 'SASB Standards'];
    frameworks.forEach(framework => {
      pdf.text(`• ${framework}`, 25, yPos);
      yPos += 8;
    });
    
    yPos += 10;
    pdf.text('Data Quality Assurance:', 20, yPos);
    yPos += 10;
    pdf.text(`• ${normalized.length} verified data points`, 25, yPos);
    yPos += 8;
    pdf.text('• Third-party verification where applicable', 25, yPos);
    yPos += 8;
    pdf.text('• Audit trail maintained for all entries', 25, yPos);
    
    // Footer
    yPos += 30;
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text('This report was generated automatically from verified ESG data.', 20, yPos);
    pdf.text(`Report ID: ESG-${Date.now()}`, 20, yPos + 10);
    
    // Save PDF with proper filename
    const reportFilename = `ESG-Report-${selectedReport.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(reportFilename);
    
    // Show success message
    showToast(`${selectedReport} report generated successfully!`, 'success');
  };
  
  const getPerformanceRating = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 80) return 'Excellent';
    if (numScore >= 70) return 'Good';
    if (numScore >= 60) return 'Satisfactory';
    if (numScore >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const exportCSV = () => {
    const csvRows = [
      ["Category", "Metric", "Value", "Description", "Status"],
      ...filteredData.map((item) => [
        item.category,
        item.metric,
        item.value,
        item.description,
        item.status || "Pending"
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((row) => row.map((x) => `"${x}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedReport}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Convert new ESG form data to old format for compatibility
  const convertNewFormatToOld = (newData) => {
    const converted = [];
    const timestamp = newData.submissionDate || new Date().toISOString();
    
    // Environmental metrics
    const envFields = {
      scope1Emissions: 'Scope 1 Emissions',
      scope2Emissions: 'Scope 2 Emissions', 
      scope3Emissions: 'Scope 3 Emissions',
      energyConsumption: 'Energy Consumption',
      renewableEnergyPercentage: 'Renewable Energy Percentage',
      waterWithdrawal: 'Water Withdrawal',
      wasteGenerated: 'Waste Generated',
      wasteRecycled: 'Waste Recycled',
      environmentalFines: 'Environmental Fines'
    };
    
    Object.entries(envFields).forEach(([key, label]) => {
      if (newData[key] && newData[key] !== '') {
        converted.push({
          companyName: newData.companyName,
          category: 'environmental',
          metric: key,
          value: parseFloat(newData[key]),
          description: label,
          status: 'Submitted',
          timestamp,
          reportingYear: newData.reportingYear,
          sector: newData.sector,
          region: newData.region
        });
      }
    });
    
    // Social metrics
    const socialFields = {
      totalEmployees: 'Total Employees',
      femaleEmployeesPercentage: 'Female Employees Percentage',
      minorityEmployeesPercentage: 'Minority Employees Percentage',
      employeeTurnoverRate: 'Employee Turnover Rate',
      lostTimeInjuryRate: 'Lost Time Injury Rate',
      fatalityRate: 'Fatality Rate',
      trainingHoursPerEmployee: 'Training Hours per Employee',
      communityInvestment: 'Community Investment',
      humanRightsViolations: 'Human Rights Violations',
      supplierAssessments: 'Supplier Assessments'
    };
    
    Object.entries(socialFields).forEach(([key, label]) => {
      if (newData[key] && newData[key] !== '') {
        converted.push({
          companyName: newData.companyName,
          category: 'social',
          metric: key,
          value: parseFloat(newData[key]),
          description: label,
          status: 'Submitted',
          timestamp,
          reportingYear: newData.reportingYear,
          sector: newData.sector,
          region: newData.region
        });
      }
    });
    
    // Governance metrics
    const govFields = {
      boardSize: 'Board Size',
      independentDirectorsPercentage: 'Independent Directors Percentage',
      femaleDirectorsPercentage: 'Female Directors Percentage',
      ethicsTrainingCompletion: 'Ethics Training Completion',
      corruptionIncidents: 'Corruption Incidents',
      dataBreaches: 'Data Breaches',
      regulatoryFines: 'Regulatory Fines',
      cybersecurityScore: 'Cybersecurity Score'
    };
    
    Object.entries(govFields).forEach(([key, label]) => {
      if (newData[key] && newData[key] !== '') {
        converted.push({
          companyName: newData.companyName,
          category: 'governance',
          metric: key,
          value: parseFloat(newData[key]),
          description: label,
          status: 'Submitted',
          timestamp,
          reportingYear: newData.reportingYear,
          sector: newData.sector,
          region: newData.region
        });
      }
    });
    
    return converted;
  };

  const canViewReports = RBACManager.hasPermission(currentUser.role, PERMISSIONS.VIEW_REPORTS);
  const canExportReports = RBACManager.hasPermission(currentUser.role, PERMISSIONS.EXPORT_DATA);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg.gradient}`}>
      <ProfessionalHeader 
        onLogout={() => {
          window.location.href = "/login";
        }}
        currentUser="admin@esgenius.com"
        title="ESG Reports & Analytics"
        subtitle="Comprehensive ESG Performance Reporting"
        showBreadcrumb={true}
        breadcrumbItems={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reports', href: '/reports', active: true }
        ]}
        actions={[
          {
            label: 'Refresh Data',
            onClick: () => {
              refreshData();
              showToast('Data refreshed successfully!', 'success');
            },
            variant: 'outline',
            icon: '🔄'
          },
          {
            label: 'View Data Entry',
            onClick: () => window.location.href = '/data-entry',
            variant: 'primary',
            icon: '📝'
          }
        ]}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Data Status Indicator */}
        <div className={`mb-6 p-4 rounded-lg ${theme.bg.subtle} border-l-4 border-blue-500`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <h3 className={`font-semibold ${theme.text.primary}`}>Data Status</h3>
                <p className={`text-sm ${theme.text.secondary}`}>
                  {data.length > 0 
                    ? `${data.length} ESG data points loaded from ${data[0]?.companyName || 'your submissions'}`
                    : 'No ESG data found. Submit data via Data Entry to generate reports.'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {data.length === 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const sampleAdded = addSampleDataToStorage();
                      if (sampleAdded) {
                        refreshData();
                        showToast('Sample data loaded successfully!', 'success');
                      } else {
                        showToast('Sample data already exists', 'info');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    🧪 Load Sample Data
                  </button>
                  <button
                    onClick={() => window.location.href = '/data-entry'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    📝 Add Data
                  </button>
                </div>
              )}
              <span className={`px-2 py-1 rounded text-xs ${
                data.length > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.length > 0 ? 'Data Available' : 'No Data'}
              </span>
            </div>
          </div>
        </div>

        {!canViewReports && (
          <Alert 
            type="warning"
            title="Access Restricted"
            message="You do not have permission to view reports. Please contact your administrator."
            className="mb-6"
          />
        )}

        {/* Enhanced Overall Summary Section */}
        <div className={`p-6 rounded-xl shadow-lg mb-8 ${theme.bg.card}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.primary}`}>ESG Performance Overview</h2>
              <p className={`text-sm ${theme.text.secondary}`}>Comprehensive sustainability metrics dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                Live Data
              </span>
            </div>
          </div>
          
          {overallSummary && overallSummary.environmental !== undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                icon="🌍"
                value={overallSummary.environmental}
                label="Environmental Score"
                trend="↑ +2.3%"
                trendColor="success"
                progress={parseFloat(overallSummary.environmental) || 0}
              />
              <MetricCard 
                icon="👥"
                value={overallSummary.social}
                label="Social Score"
                trend="↑ +1.8%"
                trendColor="success"
                progress={parseFloat(overallSummary.social) || 0}
              />
              <MetricCard 
                icon="⚖️"
                value={overallSummary.governance}
                label="Governance Score"
                trend="→ 0.0%"
                trendColor="neutral"
                progress={parseFloat(overallSummary.governance) || 0}
              />
              <MetricCard 
                icon="⭐"
                value={overallSummary.overall}
                label="Overall ESG Score"
                trend="↑ +1.4%"
                trendColor="success"
                progress={parseFloat(overallSummary.overall) || 0}
              />
            </div>
          ) : (
            <Alert 
              type="info"
              title="No Data Available"
              message="Start by adding ESG data entries to generate comprehensive reports and analytics."
            />
          )}
        </div>

        {/* Enhanced Per-Year Breakdown */}
        <div className={`p-6 rounded-xl shadow-lg mb-8 ${theme.bg.card}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${theme.text.primary}`}>Year-over-Year Performance</h2>
            <div className="flex items-center gap-4">
              <label className={`text-sm font-medium ${theme.text.secondary}`}>Select Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className={`border rounded-lg px-3 py-2 text-sm ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              >
                {yearlyData.map(entry => (
                  <option key={entry.year} value={entry.year}>
                    {entry.year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className={`min-w-full text-sm ${theme.text.primary}`}>
              <thead>
                <tr className={`${theme.bg.subtle}`}>
                  <th className="px-4 py-3 text-left font-semibold">Year</th>
                  <th className="px-4 py-3 text-left font-semibold">Environmental</th>
                  <th className="px-4 py-3 text-left font-semibold">Social</th>
                  <th className="px-4 py-3 text-left font-semibold">Governance</th>
                  <th className="px-4 py-3 text-left font-semibold">Overall Avg</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {yearlyData.map((row) => (
                  <tr key={row.year} className={`hover:${theme.bg.subtle} transition-colors duration-200 ${
                    row.year === selectedYear ? `${theme.bg.accent} font-semibold` : ''
                  }`}>
                    <td className="px-4 py-3">{row.year}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{row.environmental}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          parseFloat(row.environmental) >= 70 ? 'bg-green-500' :
                          parseFloat(row.environmental) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{row.social}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          parseFloat(row.social) >= 70 ? 'bg-green-500' :
                          parseFloat(row.social) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{row.governance}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          parseFloat(row.governance) >= 70 ? 'bg-green-500' :
                          parseFloat(row.governance) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{row.average}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        parseFloat(row.average) >= 70 ? 'bg-green-100 text-green-800' :
                        parseFloat(row.average) >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(row.average) >= 70 ? 'Excellent' :
                         parseFloat(row.average) >= 50 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>



      {/* ESG Metrics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Environmental Metrics */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold bg-emerald-600 text-white p-3 -m-6 mb-4 rounded-t-xl">Environmental</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="text-left p-2">Metric</th>
                <th className="text-left p-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {getEnvironmentalMetrics().map((metric, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 text-gray-700">{metric.name}</td>
                  <td className="p-2 font-medium">{metric.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Social Metrics */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold bg-emerald-600 text-white p-3 -m-6 mb-4 rounded-t-xl">Social</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="text-left p-2">Metric</th>
                <th className="text-left p-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {getSocialMetrics().map((metric, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 text-gray-700">{metric.name}</td>
                  <td className="p-2 font-medium">{metric.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Governance and Auto-Calculated Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Governance Metrics */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold bg-emerald-600 text-white p-3 -m-6 mb-4 rounded-t-xl">Governance</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="text-left p-2">Metric</th>
                <th className="text-left p-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {getGovernanceMetrics().map((metric, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 text-gray-700">{metric.name}</td>
                  <td className="p-2 font-medium">{metric.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Auto-Calculated Metrics */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold bg-emerald-600 text-white p-3 -m-6 mb-4 rounded-t-xl">Auto-Calculated Metrics</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="text-left p-2">Metric</th>
                <th className="text-left p-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {getCalculatedMetrics().map((metric, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 text-gray-700">{metric.name}</td>
                  <td className="p-2 font-medium">{metric.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        {/* Enhanced Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 no-print">
          <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-bold ${theme.text.primary}`}>Score Distribution</h3>
                <p className={`text-sm ${theme.text.secondary}`}>Current year performance breakdown</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedYear}
              </span>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[yearlyData.find(d => d.year === selectedYear)]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="year" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="environmental" fill="#059669" name="Environmental" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="social" fill="#2563eb" name="Social" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="governance" fill="#7c3aed" name="Governance" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-bold ${theme.text.primary}`}>Performance Trends</h3>
                <p className={`text-sm ${theme.text.secondary}`}>Multi-year ESG score evolution</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs">E</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs">S</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs">G</span>
                </div>
              </div>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="year" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="environmental" stroke="#059669" strokeWidth={3} dot={{ fill: '#059669', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="social" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="governance" stroke="#7c3aed" strokeWidth={3} dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>



        {/* AI Insights Section */}
        <div className={`border rounded-lg p-4 mb-6 ${isDark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
          <h3 className={`font-medium mb-3 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>🤖 AI-Powered Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { type: 'trend', message: 'Carbon emissions trending 15% below target - excellent progress', priority: 'high' },
              { type: 'benchmark', message: 'Social metrics 8% above industry average', priority: 'medium' },
              { type: 'opportunity', message: 'Renewable energy adoption could improve ESG score by 12%', priority: 'high' },
              { type: 'compliance', message: 'TCFD compliance at 85% - consider additional climate disclosures', priority: 'medium' }
            ].map((insight, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${theme.bg.subtle}`}>
                <div className={`text-sm font-medium ${theme.text.primary}`}>{insight.message}</div>
                <div className={`text-xs ${
                  insight.priority === 'high' ? 'text-green-600' : 
                  insight.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  {insight.priority.toUpperCase()} IMPACT
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Template Selection and Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Professional Template List */}
          <div className={`p-6 rounded-xl shadow-lg no-print ${theme.bg.card}`}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📄</span>
              <div>
                <h2 className={`text-xl font-bold ${theme.text.primary}`}>Report Templates</h2>
                <p className={`text-sm ${theme.text.secondary}`}>Choose from industry-standard ESG frameworks</p>
              </div>
            </div>
            <div className="space-y-3">
              {sampleReports.concat([
                { type: "TCFD", description: "Climate-related financial disclosures framework" },
                { type: "SASB", description: "Industry-specific sustainability standards" },
                { type: "EU Taxonomy", description: "EU sustainable finance classification" }
              ]).map((report, i) => (
                <div
                  key={i}
                  className={`border-2 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-102 ${
                    selectedReport === report.type 
                      ? `${theme.border.accent} ${theme.bg.accent} shadow-lg` 
                      : `${theme.border.primary} ${theme.hover.card}`
                  }`}
                  onClick={() => setSelectedReport(report.type)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${theme.text.primary}`}>{report.type}</h3>
                      <p className={`text-sm mt-1 ${theme.text.secondary}`}>{report.description}</p>
                    </div>
                    {selectedReport === report.type && (
                      <div className="ml-2">
                        <span className="text-green-500 text-lg">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {report.type.includes('SEBI') ? 'Regulatory' : 
                       report.type.includes('GRI') ? 'International' :
                       report.type.includes('TCFD') ? 'Climate' :
                       report.type.includes('SASB') ? 'Industry' :
                       report.type.includes('EU') ? 'EU Regulatory' : 'Operational'}
                    </span>
                    <span className={`text-xs ${theme.text.muted}`}>• Updated 2024</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Summary & Chart */}
          <div className={`p-6 rounded-xl shadow-lg print-break ${theme.bg.card}`} id="report-summary">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className={`text-xl font-bold ${theme.text.primary}`}>{selectedReport}</h2>
                <p className={`text-sm ${theme.text.secondary}`}>Interactive data visualization</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                }`}>
                  Live Data
                </span>
              </div>
            </div>
            <div className="relative">
              {getTemplateContent()}
              <div className="absolute top-2 right-2">
                <button 
                  onClick={() => showToast('Chart data refreshed', 'success')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${theme.hover.subtle}`}
                  title="Refresh Chart"
                >
                  <span className="text-sm">🔄</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold text-center mb-2">ESG Performance Report</h1>
        <p className="text-center text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        <hr className="my-4" />
      </div>

        {/* Enhanced History Section */}
        <div className={`p-6 rounded-xl shadow-lg mt-8 ${theme.bg.card}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>Data History & Management</h2>
              <p className={`text-sm ${theme.text.secondary}`}>{filteredData.length} entries available for reporting</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                type="text"
                placeholder="Search by company or metric..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
                icon="🔍"
              />
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`border rounded-lg px-3 py-2 text-sm ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Failed">Failed</option>
              </select>
              
              <Button
                variant="success"
                onClick={() => {
                  if (selectedItems.length === 0) {
                    showToast('Please select items to approve', 'warning');
                    return;
                  }
                  bulkApprove();
                  showToast(`${selectedItems.length} items approved successfully`, 'success');
                }}
                disabled={selectedItems.length === 0}
                icon="✓"
              >
                Bulk Approve
              </Button>
            </div>
          </div>
        
          <div className="mb-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className={theme.text.secondary}>Pending: {filteredData.filter(item => (item.status || 'Pending') === 'Pending').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className={theme.text.secondary}>Submitted: {filteredData.filter(item => item.status === 'Submitted').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className={theme.text.secondary}>Failed: {filteredData.filter(item => item.status === 'Failed').length}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                Total: {filteredData.length}
              </span>
            </div>
          </div>
          {filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={`min-w-full text-sm ${theme.text.primary}`}>
                <thead className={`${theme.bg.subtle}`}>
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                        <span className="font-semibold">Company</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button 
                        onClick={() => handleSort('category')}
                        className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors duration-200"
                      >
                        Category 
                        {sortField === 'category' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Metric</th>
                    <th className="px-4 py-3 text-left">
                      <button 
                        onClick={() => handleSort('value')}
                        className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors duration-200"
                      >
                        Value 
                        {sortField === 'value' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button 
                        onClick={() => handleSort('timestamp')}
                        className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors duration-200"
                      >
                        Date 
                        {sortField === 'timestamp' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getFilteredAndSortedData().map((item, idx) => (
                    <tr key={idx} className={`transition-colors duration-200 ${
                      selectedItems.includes(idx) 
                        ? `${theme.bg.accent} border-l-4 border-blue-500` 
                        : `hover:${theme.bg.subtle}`
                    }`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(idx)}
                            onChange={() => toggleSelectItem(idx)}
                            className="rounded"
                          />
                          <span className="font-medium">{item.companyName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            item.category === 'environmental' ? 'bg-green-500' :
                            item.category === 'social' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}></div>
                          <span className="capitalize font-medium">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{item.metric || 'General'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-lg">{item.value}</span>
                      </td>
                      <td className="px-4 py-3">
                        {item.timestamp ? (
                          <div>
                            <div className="font-medium">{new Date(item.timestamp).toLocaleDateString()}</div>
                            <div className={`text-xs ${theme.text.muted}`}>{new Date(item.timestamp).toLocaleTimeString()}</div>
                          </div>
                        ) : (
                          <span className={theme.text.muted}>N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.status || "Pending"}
                          onChange={(e) => {
                            updateStatus(idx, e.target.value);
                            showToast(`Status updated to ${e.target.value}`, 'success');
                          }}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer ${
                            item.status === "Submitted"
                              ? "bg-green-100 text-green-800"
                              : item.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              viewDetails(item);
                              showToast('Viewing item details', 'info');
                            }}
                            className={`p-2 rounded-lg transition-colors duration-200 ${theme.hover.subtle}`}
                            title="View Details"
                          >
                            <span className="text-blue-600">👁️</span>
                          </button>
                          <button
                            onClick={() => {
                              deleteItem(idx);
                              showToast('Item deleted successfully', 'success');
                            }}
                            className={`p-2 rounded-lg transition-colors duration-200 ${theme.hover.subtle}`}
                            title="Delete"
                          >
                            <span className="text-red-600">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Alert 
              type="info"
              title="No Data Available"
              message="No report history found. Start by adding ESG data entries to generate reports."
            />
          )}
        </div>

        {/* Professional Report Template Modal */}
        {showProfessionalTemplate && (
          <ProfessionalReportTemplate
            data={data}
            onClose={() => setShowProfessionalTemplate(false)}
          />
        )}

        {/* Custom Report Builder Modal */}
        {showCustomReportBuilder && (
          <CustomReportBuilder
            data={data}
            onClose={() => setShowCustomReportBuilder(false)}
          />
        )}

        {/* Predictive Analytics Modal */}
        {showPredictiveAnalytics && (
          <Modal
            isOpen={showPredictiveAnalytics}
            onClose={() => setShowPredictiveAnalytics(false)}
            title="🔮 Predictive ESG Analytics"
            isDark={isDark}
          >
            <div className="space-y-4">
              <Alert type="info" title="AI-Powered Insights" message="Advanced predictive modeling for ESG performance forecasting" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                  <h4 className={`font-semibold ${theme.text.primary} mb-2`}>📈 Trend Forecasting</h4>
                  <p className={`text-sm ${theme.text.secondary} mb-3`}>Predict ESG scores for next 12 months</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Environmental</span>
                      <span className="text-green-600">↗ +5.2% projected</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Social</span>
                      <span className="text-blue-600">↗ +3.1% projected</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Governance</span>
                      <span className="text-purple-600">→ +1.8% projected</span>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                  <h4 className={`font-semibold ${theme.text.primary} mb-2`}>⚠️ Risk Assessment</h4>
                  <p className={`text-sm ${theme.text.secondary} mb-3`}>Identify potential ESG risks</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span>Carbon target at risk</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Social metrics on track</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Governance improving</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
                <h4 className={`font-semibold ${theme.text.primary} mb-2`}>🎯 Recommendations</h4>
                <ul className={`text-sm ${theme.text.secondary} space-y-1`}>
                  <li>• Increase renewable energy adoption by 15% to meet 2025 targets</li>
                  <li>• Implement diversity training programs to improve social scores</li>
                  <li>• Enhance board independence for better governance ratings</li>
                </ul>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="primary" onClick={() => showToast('Predictive model updated', 'success')}>Generate Forecast</Button>
                <Button variant="outline" onClick={() => setShowPredictiveAnalytics(false)}>Close</Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Integrations Modal */}
        {showIntegrations && (
          <Modal
            isOpen={showIntegrations}
            onClose={() => setShowIntegrations(false)}
            title="🔗 ESG Data Integrations"
            isDark={isDark}
          >
            <div className="space-y-4">
              <Alert type="info" title="Connect Your Systems" message="Integrate with external ESG data sources and reporting platforms" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${theme.border.primary}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h4 className={`font-semibold ${theme.text.primary}`}>Bloomberg ESG</h4>
                      <p className={`text-xs ${theme.text.secondary}`}>Market data integration</p>
                    </div>
                    <span className="ml-auto px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Connected</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => showToast('Bloomberg sync initiated', 'success')}>Sync Data</Button>
                </div>
                
                <div className={`p-4 rounded-lg border ${theme.border.primary}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🌍</span>
                    <div>
                      <h4 className={`font-semibold ${theme.text.primary}`}>CDP Platform</h4>
                      <p className={`text-xs ${theme.text.secondary}`}>Carbon disclosure</p>
                    </div>
                    <span className="ml-auto px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Setup</span>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => showToast('CDP integration configured', 'success')}>Connect</Button>
                </div>
                
                <div className={`p-4 rounded-lg border ${theme.border.primary}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📈</span>
                    <div>
                      <h4 className={`font-semibold ${theme.text.primary}`}>MSCI ESG</h4>
                      <p className={`text-xs ${theme.text.secondary}`}>Rating benchmarks</p>
                    </div>
                    <span className="ml-auto px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Available</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => showToast('MSCI integration available', 'info')}>Learn More</Button>
                </div>
                
                <div className={`p-4 rounded-lg border ${theme.border.primary}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <h4 className={`font-semibold ${theme.text.primary}`}>SAP Sustainability</h4>
                      <p className={`text-xs ${theme.text.secondary}`}>ERP integration</p>
                    </div>
                    <span className="ml-auto px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Beta</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => showToast('SAP integration in beta', 'info')}>Join Beta</Button>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h4 className={`font-semibold ${theme.text.primary} mb-2`}>🚀 API Endpoints</h4>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span>GET /api/esg/data</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>POST /api/esg/import</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GET /api/esg/reports</span>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="primary" onClick={() => showToast('Integration settings saved', 'success')}>Save Settings</Button>
                <Button variant="outline" onClick={() => setShowIntegrations(false)}>Close</Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Toast Notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      {/* Enhanced Print Preview Modal */}
      {showPreview && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title={`Print Preview - ${selectedReport}`}
          size="xl"
          actions={[
            {
              label: 'Print Now',
              onClick: () => { 
                setShowPreview(false); 
                setTimeout(() => {
                  window.print();
                  showToast('Report sent to printer', 'success');
                }, 100); 
              },
              variant: 'primary',
              icon: '🖨️'
            },
            {
              label: 'Close',
              onClick: () => setShowPreview(false),
              variant: 'outline'
            }
          ]}
        >
          <div className="max-h-[70vh] overflow-y-auto">
            
            <div className="print-preview">
              {/* Print Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">ESG Performance Report</h1>
                <p className="text-gray-600">Report Type: {selectedReport}</p>
                <p className="text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
                <hr className="my-4" />
              </div>

              {/* Overall Summary */}
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-4">Overall ESG Performance Summary</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="border p-3 text-center">
                    <h3 className="font-semibold text-emerald-800">Environmental</h3>
                    <p className="text-xl font-bold">{overallSummary.environmental || 'N/A'}</p>
                  </div>
                  <div className="border p-3 text-center">
                    <h3 className="font-semibold text-blue-800">Social</h3>
                    <p className="text-xl font-bold">{overallSummary.social || 'N/A'}</p>
                  </div>
                  <div className="border p-3 text-center">
                    <h3 className="font-semibold text-purple-800">Governance</h3>
                    <p className="text-xl font-bold">{overallSummary.governance || 'N/A'}</p>
                  </div>
                  <div className="border p-3 text-center">
                    <h3 className="font-semibold text-gray-800">Overall Score</h3>
                    <p className="text-xl font-bold">{overallSummary.overall || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Metrics Tables */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold bg-emerald-600 text-white p-2 text-center">Environmental</h3>
                  <table className="w-full border border-collapse text-sm">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="border p-2 text-left">Metric</th>
                        <th className="border p-2 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getEnvironmentalMetrics().map((metric, i) => (
                        <tr key={i}>
                          <td className="border p-2">{metric.name}</td>
                          <td className="border p-2">{metric.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-bold bg-emerald-600 text-white p-2 text-center">Social</h3>
                  <table className="w-full border border-collapse text-sm">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="border p-2 text-left">Metric</th>
                        <th className="border p-2 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSocialMetrics().map((metric, i) => (
                        <tr key={i}>
                          <td className="border p-2">{metric.name}</td>
                          <td className="border p-2">{metric.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-bold bg-emerald-600 text-white p-2 text-center">Governance</h3>
                  <table className="w-full border border-collapse text-sm">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="border p-2 text-left">Metric</th>
                        <th className="border p-2 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getGovernanceMetrics().map((metric, i) => (
                        <tr key={i}>
                          <td className="border p-2">{metric.name}</td>
                          <td className="border p-2">{metric.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-bold bg-emerald-600 text-white p-2 text-center">Auto-Calculated Metrics</h3>
                  <table className="w-full border border-collapse text-sm">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="border p-2 text-left">Metric</th>
                        <th className="border p-2 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCalculatedMetrics().map((metric, i) => (
                        <tr key={i}>
                          <td className="border p-2">{metric.name}</td>
                          <td className="border p-2">{metric.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Year-over-Year Data */}
              {yearlyData.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold mb-2">Year-over-Year Performance</h3>
                  <table className="w-full border border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Year</th>
                        <th className="border p-2">Environmental</th>
                        <th className="border p-2">Social</th>
                        <th className="border p-2">Governance</th>
                        <th className="border p-2">Overall Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyData.map((row) => (
                        <tr key={row.year}>
                          <td className="border p-2">{row.year}</td>
                          <td className="border p-2">{row.environmental}</td>
                          <td className="border p-2">{row.social}</td>
                          <td className="border p-2">{row.governance}</td>
                          <td className="border p-2">{row.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Reports;

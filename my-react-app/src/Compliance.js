import React, { useState, useEffect } from "react";
import { FaFileUpload, FaCheckCircle, FaClock, FaExclamationTriangle, FaDownload, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./contexts/ThemeContext";
import { getThemeClasses } from "./utils/themeUtils";
import ProfessionalHeader from "./components/ProfessionalHeader";
import esgAPI from "./api/esgAPI";

// Add 3D animations and styles
const style = document.createElement('style');
style.textContent = `
  @keyframes float3D {
    0%, 100% { transform: translateY(0px) rotateX(0deg); }
    50% { transform: translateY(-8px) rotateX(3deg); }
  }
  @keyframes pulse3D {
    0%, 100% { transform: scale(1) rotateY(0deg); }
    50% { transform: scale(1.03) rotateY(3deg); }
  }
  @keyframes slideUp3D {
    from { transform: translateY(30px) rotateX(-10deg); opacity: 0; }
    to { transform: translateY(0) rotateX(0deg); opacity: 1; }
  }
  .compliance-card-3d {
    perspective: 1000px;
    transform-style: preserve-3d;
  }
  .compliance-item-3d {
    transform: perspective(800px) rotateX(2deg);
    transition: all 0.4s ease;
  }
  .compliance-item-3d:hover {
    transform: perspective(800px) rotateX(5deg) rotateY(2deg) translateZ(15px);
  }
  .upload-zone-3d {
    transform: perspective(600px) rotateX(5deg);
    transition: all 0.3s ease;
  }
  .upload-zone-3d:hover {
    transform: perspective(600px) rotateX(8deg) translateZ(10px);
  }
  .metric-3d {
    animation: float3D 3s ease-in-out infinite;
  }
  .stagger-animation {
    animation: slideUp3D 0.6s ease-out;
  }
`;
document.head.appendChild(style);

const mockComplianceData = [
  {
    id: 1,
    name: "Environmental Policy",
    uploadedAt: "2025-07-14 10:30 AM",
    status: "Pending Review",
    category: "Environmental",
    priority: "High",
    dueDate: "2025-08-15",
    progress: 75,
  },
  {
    id: 2,
    name: "BRSR Compliance Report",
    uploadedAt: "2025-07-12 02:00 PM",
    status: "Approved",
    category: "Governance",
    priority: "Medium",
    dueDate: "2025-07-30",
    progress: 100,
  },
  {
    id: 3,
    name: "Social Impact Assessment",
    uploadedAt: "2025-07-10 09:15 AM",
    status: "Under Review",
    category: "Social",
    priority: "High",
    dueDate: "2025-08-01",
    progress: 60,
  },
];

const complianceRequirements = [
  { name: "Carbon Footprint Report", status: "Completed", dueDate: "2025-08-15", category: "Environmental" },
  { name: "Diversity & Inclusion Policy", status: "In Progress", dueDate: "2025-08-20", category: "Social" },
  { name: "Board Independence Report", status: "Pending", dueDate: "2025-08-25", category: "Governance" },
  { name: "Sustainability Metrics", status: "Completed", dueDate: "2025-08-10", category: "Environmental" },
];

const statusColors = {
  "Pending Review": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Under Review": "bg-blue-100 text-blue-800 border-blue-200",
  "Approved": "bg-green-100 text-green-800 border-green-200",
  "Rejected": "bg-red-100 text-red-800 border-red-200",
  "Completed": "bg-green-100 text-green-800 border-green-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  "Pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const priorityColors = {
  "High": "bg-red-50 text-red-700 border-red-200",
  "Medium": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Low": "bg-green-50 text-green-700 border-green-200",
};

const categoryIcons = {
  "Environmental": "🌍",
  "Social": "👥",
  "Governance": "🏛️",
};

const Compliance = () => {
  const { isDark, toggleTheme } = useTheme();
  const theme = getThemeClasses(isDark);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [kpis, setKpis] = useState({});
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const complianceResult = await esgAPI.getComplianceData();
        if (complianceResult.success) {
          setHistory(complianceResult.data.documents || mockComplianceData);
        } else {
          setHistory(mockComplianceData);
        }
        
        const dashboardResult = await esgAPI.getDashboardData();
        if (dashboardResult.success) {
          setKpis(dashboardResult.data.kpis || {});
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading compliance data:', error);
        setHistory(mockComplianceData);
        setIsLoading(false);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };


  const handleFileUpload = async (file) => {
    if (file) {
      const categories = ["Environmental", "Social", "Governance"];
      const priorities = ["High", "Medium", "Low"];
      const newDoc = {
        name: file.name,
        category: categories[Math.floor(Math.random() * categories.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        progress: Math.floor(Math.random() * 50) + 25,
      };
      
      try {
        const result = await esgAPI.addComplianceDocument(newDoc);
        if (result.success) {
          setFiles([...files, file]);
          // Reload data to get updated list
          const complianceResult = await esgAPI.getComplianceData();
          if (complianceResult.success) {
            setHistory(complianceResult.data.documents);
          }
        }
      } catch (error) {
        console.error('Error uploading document:', error);
      }
    }
  };

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    if (newFile) {
      handleFileUpload(newFile);
    }
  };

  const filteredHistory = selectedFilter === 'all' 
    ? history 
    : history.filter(item => item.category && item.category.toLowerCase() === selectedFilter);

  const complianceStats = {
    total: history.length,
    approved: history.filter(item => item.status === 'Approved').length,
    pending: history.filter(item => item.status === 'Pending Review' || item.status === 'Under Review').length,
    overdue: history.filter(item => item.dueDate && new Date(item.dueDate) < new Date()).length,
  };


  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={isDark ? 'text-white' : 'text-gray-600'}>Loading Compliance Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50/30'
    }`} style={{
      backgroundImage: isDark ? '' : 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)'
    }}>
      <ProfessionalHeader 
        onLogout={handleLogout}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto p-6">

        {/* Compliance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`metric-3d compliance-card-3d rounded-2xl p-6 border shadow-lg transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/70 backdrop-blur-2xl border-white/30'
          }`} style={{
            boxShadow: isDark ? '' : '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3)'
          }}>
            <div className="flex items-center gap-3 mb-2">
              <FaCheckCircle className="text-2xl text-green-500" />
              <h3 className={`font-semibold ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>Approved</h3>
            </div>
            <p className={`text-3xl font-bold text-green-500`}>{complianceStats.approved}</p>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>Documents approved</p>
          </div>

          <div className={`metric-3d compliance-card-3d rounded-2xl p-6 border shadow-lg transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/70 backdrop-blur-2xl border-white/30'
          }`} style={{
            animationDelay: '0.1s',
            boxShadow: isDark ? '' : '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3)'
          }}>
            <div className="flex items-center gap-3 mb-2">
              <FaClock className="text-2xl text-yellow-500" />
              <h3 className={`font-semibold ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>Pending</h3>
            </div>
            <p className={`text-3xl font-bold text-yellow-500`}>{complianceStats.pending}</p>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>Under review</p>
          </div>

          <div className={`metric-3d compliance-card-3d rounded-2xl p-6 border shadow-lg transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/70 backdrop-blur-2xl border-white/30'
          }`} style={{
            animationDelay: '0.2s',
            boxShadow: isDark ? '' : '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3)'
          }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📊</span>
              <h3 className={`font-semibold ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>Total</h3>
            </div>
            <p className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{complianceStats.total}</p>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>Total documents</p>
          </div>

          <div className={`metric-3d compliance-card-3d rounded-2xl p-6 border shadow-lg transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/70 backdrop-blur-2xl border-white/30'
          }`} style={{
            animationDelay: '0.3s',
            boxShadow: isDark ? '' : '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3)'
          }}>
            <div className="flex items-center gap-3 mb-2">
              <FaExclamationTriangle className="text-2xl text-red-500" />
              <h3 className={`font-semibold ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>Overdue</h3>
            </div>
            <p className={`text-3xl font-bold text-red-500`}>{complianceStats.overdue}</p>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>Past due date</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className={`upload-zone-3d rounded-2xl p-8 border-2 border-dashed mb-8 transition-all duration-300 ${
          dragActive 
            ? (isDark ? 'border-green-400 bg-green-900/20' : 'border-green-500 bg-green-50')
            : (isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white/70 backdrop-blur-2xl')
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        >
          <div className="text-center">
            <FaFileUpload className={`mx-auto text-4xl mb-4 ${
              dragActive ? 'text-green-500' : (isDark ? 'text-gray-400' : 'text-gray-500')
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Upload Compliance Documents</h3>
            <p className={`mb-4 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Drag and drop files here or click to browse</p>
            <label className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200 hover:scale-105 ${
              isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}>
              <FaFileUpload />
              <span>Choose Files</span>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                multiple
              />
            </label>
            <p className={`text-xs mt-2 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>Supported: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)</p>
          </div>
        </div>

        {/* Compliance Requirements */}
        <div className={`rounded-2xl p-6 border shadow-lg mb-8 transition-all duration-300 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/70 backdrop-blur-2xl border-white/30'
        }`} style={{
          boxShadow: isDark ? '' : '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Compliance Requirements</h2>
            <span className="text-2xl">📋</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceRequirements.map((req, index) => (
              <div key={index} className={`compliance-item-3d p-4 rounded-xl border transition-all duration-300 hover:scale-102 ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryIcons[req.category]}</span>
                    <h3 className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{req.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[req.status]}`}>
                    {req.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Due: {req.dueDate}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>{req.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document History */}
        <div className={`rounded-2xl p-6 border shadow-lg transition-all duration-300 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/70 backdrop-blur-2xl border-white/30'
        }`} style={{
          boxShadow: isDark ? '' : '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Document History</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🕒</span>
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`px-3 py-1 rounded-lg text-sm border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Categories</option>
                <option value="environmental">Environmental</option>
                <option value="social">Social</option>
                <option value="governance">Governance</option>
              </select>
            </div>
          </div>
          
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📄</span>
              <p className={`text-lg font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>No documents found</p>
              <p className={`text-sm ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>Upload your first compliance document to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((doc, index) => (
                <div key={doc.id} className={`stagger-animation compliance-item-3d p-4 rounded-xl border transition-all duration-300 hover:scale-102 ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`} style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{categoryIcons[doc.category] || '📄'}</span>
                      <div>
                        <h3 className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{doc.name}</h3>
                        <div className="flex items-center gap-4 text-sm mt-1">
                          <span className={`${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>Uploaded: {doc.uploadedAt}</span>
                          <span className={`${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>Due: {doc.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[doc.priority]}`}>
                        {doc.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[doc.status]}`}>
                        {doc.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <button className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                          isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                        }`}>
                          <FaEye />
                        </button>
                        <button className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                          isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                        }`}>
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>Progress</span>
                      <span className={`font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>{doc.progress}%</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          doc.progress >= 80 ? 'bg-green-500' : doc.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${doc.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Compliance;

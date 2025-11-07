import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import companyLogo from '../companyLogo.jpg';

const ProfessionalHeader = ({ onLogout }) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const currentUser = localStorage.getItem('currentUser');
  const isAdmin = currentUser === 'admin@esgenius.com';

  useEffect(() => {
    const loadPendingUsers = () => {
      if (isAdmin) {
        const pending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        setPendingUsers(pending.filter(user => user.status === 'pending'));
      }
    };
    
    loadPendingUsers();
    
    // Check for updates every 2 seconds
    const interval = setInterval(loadPendingUsers, 2000);
    
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleApprove = (userEmail) => {
    const pending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const approved = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    
    const userIndex = pending.findIndex(u => u.email === userEmail);
    if (userIndex !== -1) {
      const user = { ...pending[userIndex] };
      user.status = 'approved';
      user.approvedDate = new Date().toISOString();
      
      approved.push(user);
      pending.splice(userIndex, 1);
      
      localStorage.setItem('pendingUsers', JSON.stringify(pending));
      localStorage.setItem('approvedUsers', JSON.stringify(approved));
      
      setPendingUsers(pending.filter(u => u.status === 'pending'));
    }
  };

  const handleReject = (userEmail) => {
    const pending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const userIndex = pending.findIndex(u => u.email === userEmail);
    if (userIndex !== -1) {
      pending.splice(userIndex, 1);
      localStorage.setItem('pendingUsers', JSON.stringify(pending));
      setPendingUsers(pending.filter(u => u.status === 'pending'));
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/data-entry', label: 'Data Entry', icon: '📝' },
    { path: '/reports', label: 'Reports', icon: '📋' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/compliance', label: 'Compliance', icon: '✅' },
    { path: '/regulatory', label: 'Regulatory', icon: '⚖️' },
    { path: '/stakeholders', label: 'Stakeholders', icon: '👥' }
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 border-gray-700' 
        : 'bg-gradient-to-r from-emerald-600/95 via-teal-600/95 to-cyan-600/95 border-emerald-500/30'
    } backdrop-blur-xl border-b shadow-lg`} style={{
      boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(16, 185, 129, 0.15)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img 
                src={companyLogo} 
                alt="ESG Platform" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent' 
                  : 'text-white drop-shadow-sm'
              }`}>
                E-S-Genius
              </h1>
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-emerald-100/90'
              }`}>
                ESG Platform
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1 flex-1 justify-center max-w-2xl">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? (isDark ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/20 text-white shadow-lg backdrop-blur-sm')
                      : isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        : 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'text-yellow-400 hover:bg-gray-700/50' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg transition-all duration-200 ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700/50' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-lg">🔔</span>
                {isAdmin && pendingUsers.length > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{pendingUsers.length}</span>
                  </div>
                )}
              </button>
              
              {showNotifications && isAdmin && (
                <div className={`absolute right-0 top-12 w-80 rounded-lg shadow-xl border z-50 ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className={`p-3 border-b ${
                    isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                  }`}>
                    <h3 className="font-semibold">Pending User Approvals</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {pendingUsers.length === 0 ? (
                      <div className={`p-4 text-center ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        No pending requests
                      </div>
                    ) : (
                      pendingUsers.map((user, index) => (
                        <div key={index} className={`p-3 border-b last:border-b-0 ${
                          isDark ? 'border-gray-700' : 'border-gray-100'
                        }`}>
                          <div className={`text-sm font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user.fullName}
                          </div>
                          <div className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {user.email}
                          </div>
                          <div className={`text-xs mt-1 ${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {new Date(user.requestDate).toLocaleDateString()}
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleApprove(user.email)}
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(user.email)}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-bold">
                U
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('userRole');
                  onLogout();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfessionalHeader;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser !== 'admin@esgenius.com') {
      navigate('/');
      return;
    }
    
    loadUsers();
  }, [navigate]);

  const loadUsers = () => {
    const pending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const approved = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    setPendingUsers(pending.filter(user => user.status === 'pending'));
    setApprovedUsers(approved);
  };

  const approveUser = (userEmail) => {
    const pending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const approved = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    
    const userIndex = pending.findIndex(user => user.email === userEmail);
    if (userIndex !== -1) {
      const user = pending[userIndex];
      user.status = 'approved';
      user.approvedDate = new Date().toISOString();
      
      approved.push(user);
      pending.splice(userIndex, 1);
      
      localStorage.setItem('pendingUsers', JSON.stringify(pending));
      localStorage.setItem('approvedUsers', JSON.stringify(approved));
      loadUsers();
    }
  };

  const rejectUser = (userEmail) => {
    const pending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const userIndex = pending.findIndex(user => user.email === userEmail);
    if (userIndex !== -1) {
      pending.splice(userIndex, 1);
      localStorage.setItem('pendingUsers', JSON.stringify(pending));
      loadUsers();
    }
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Panel - User Management</h1>
          <button 
            onClick={() => navigate('/')}
            className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'}`}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Pending Users */}
        <div className={`rounded-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Pending Approvals ({pendingUsers.length})</h2>
          {pendingUsers.length === 0 ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Requested: {new Date(user.requestDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => approveUser(user.email)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => rejectUser(user.email)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Users */}
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Approved Users ({approvedUsers.length})</h2>
          {approvedUsers.length === 0 ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No approved users</p>
          ) : (
            <div className="space-y-3">
              {approvedUsers.map((user, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Approved: {new Date(user.approvedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Approved</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
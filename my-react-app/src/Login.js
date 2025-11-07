import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('currentUser', username.trim());
      navigate('/');
    } else {
      alert('Please enter a username');
    }
  };

  return (
    <div className="min-h-screen bg-[#e9edf2] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#1b3a2d]">ESG App Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3a7a44] focus:border-transparent"
              placeholder="Enter your username"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#1b3a2d] to-[#2a4a33] text-white py-2 rounded-md hover:from-[#2a4a33] hover:to-[#1b3a2d] transition-colors"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Demo users: user1, user2, admin</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
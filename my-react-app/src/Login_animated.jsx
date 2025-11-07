import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTheme } from './contexts/ThemeContext';

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      if (password !== confirmPassword) {
        setMessage('Passwords do not match');
        return;
      }
      const newUser = {
        id: Date.now(),
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        status: 'pending'
      };
      const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
      pendingUsers.push(newUser);
      localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
      setMessage('Account created successfully! Awaiting admin approval.');
    } else {
      const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
      const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
      const isPending = pendingUsers.some(user => user.email === email.trim() && user.status === 'pending');
      const isApproved = approvedUsers.some(user => user.email === email.trim() && user.status === 'approved');
      
      if (email.trim() === 'admin@esg.com' && password === 'admin123') {
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('currentUser', email.trim());
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/');
      } else if (isApproved) {
        localStorage.setItem('currentUser', email.trim());
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/');
      } else if (isPending) {
        setMessage('Account pending admin approval.');
      } else {
        setMessage('Server unavailable. Using offline mode.');
        if (email.trim()) {
          localStorage.setItem('currentUser', email.trim());
          localStorage.setItem('isLoggedIn', 'true');
          navigate('/');
        }
      }
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-500 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50/30'}`}>
      <div className={`relative max-w-4xl w-full h-[500px] rounded-2xl shadow-2xl overflow-hidden border transition-all duration-1000 ${isSignup ? 'animate-form-switch' : ''}`} style={isDark ? { background: 'rgba(17,24,39,0.9)', border: '2px solid #3b82f6', boxShadow: '0 0 25px rgba(59, 130, 246, 0.3)' } : { background: 'rgba(255,255,255,0.9)', border: '2px solid #3b82f6', boxShadow: '0 0 25px rgba(59, 130, 246, 0.2)' }}>
        
        {/* Animated curved shapes */}
        <div className={`absolute right-0 top-[-5px] h-[600px] w-[850px] transition-all duration-1500 ease-in-out ${isSignup ? 'transform rotate-0 skew-y-0' : 'transform rotate-12 skew-y-12'}`} style={{
          background: isDark ? 'linear-gradient(45deg, #1f2937, #3b82f6)' : 'linear-gradient(45deg, #f8fafc, #3b82f6)',
          transformOrigin: 'bottom right',
          transitionDelay: isSignup ? '0.5s' : '1.6s'
        }}></div>
        
        <div className={`absolute left-[250px] top-full h-[700px] w-[850px] border-t-2 border-blue-500 transition-all duration-1500 ease-in-out ${isSignup ? 'transform -rotate-12 -skew-y-12' : 'transform rotate-0 skew-y-0'}`} style={{
          background: isDark ? '#1f2937' : '#f8fafc',
          transformOrigin: 'bottom left',
          transitionDelay: isSignup ? '1.2s' : '0.5s'
        }}></div>
        
        <div className="relative h-full">
        
        {/* Login Form */}
        <div className={`absolute left-0 top-0 w-1/2 h-full p-8 flex flex-col justify-center transition-all duration-700 ${!isSignup ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0 blur-sm'}`}>
          <div className="max-w-md mx-auto w-full">
            <h2 className={`text-3xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>Login</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-3 bg-transparent border-b-2 border-white outline-none text-white placeholder-transparent peer ${isDark ? 'focus:border-blue-500' : 'focus:border-blue-600'}`}
                  placeholder="Email"
                />
                <label className={`absolute left-0 top-3 text-white transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm ${isDark ? 'peer-focus:text-blue-400' : 'peer-focus:text-blue-600'}`}>
                  Email
                </label>
                <FaEnvelope className="absolute right-0 top-3 text-white" />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-3 bg-transparent border-b-2 border-white outline-none text-white placeholder-transparent peer ${isDark ? 'focus:border-blue-500' : 'focus:border-blue-600'}`}
                  placeholder="Password"
                />
                <label className={`absolute left-0 top-3 text-white transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm ${isDark ? 'peer-focus:text-blue-400' : 'peer-focus:text-blue-600'}`}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-full border-2 border-blue-500 bg-transparent text-white font-semibold transition-all duration-500 hover:bg-blue-500 relative overflow-hidden`}
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>

              <div className="text-center">
                <p className="text-white text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignup(true)}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Register Form */}
        <div className={`absolute right-0 top-0 w-1/2 h-full p-8 flex flex-col justify-center transition-all duration-700 ${isSignup ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0 blur-sm'}`}>
          <div className="max-w-md mx-auto w-full">
            <h2 className={`text-3xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>Register</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignup}
                  className={`w-full px-4 py-3 bg-transparent border-b-2 border-white outline-none text-white placeholder-transparent peer ${isDark ? 'focus:border-blue-500' : 'focus:border-blue-600'}`}
                  placeholder="Full Name"
                />
                <label className={`absolute left-0 top-3 text-white transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm ${isDark ? 'peer-focus:text-blue-400' : 'peer-focus:text-blue-600'}`}>
                  Full Name
                </label>
              </div>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-3 bg-transparent border-b-2 border-white outline-none text-white placeholder-transparent peer ${isDark ? 'focus:border-blue-500' : 'focus:border-blue-600'}`}
                  placeholder="Email"
                />
                <label className={`absolute left-0 top-3 text-white transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm ${isDark ? 'peer-focus:text-blue-400' : 'peer-focus:text-blue-600'}`}>
                  Email
                </label>
                <FaEnvelope className="absolute right-0 top-3 text-white" />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-3 bg-transparent border-b-2 border-white outline-none text-white placeholder-transparent peer ${isDark ? 'focus:border-blue-500' : 'focus:border-blue-600'}`}
                  placeholder="Password"
                />
                <label className={`absolute left-0 top-3 text-white transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm ${isDark ? 'peer-focus:text-blue-400' : 'peer-focus:text-blue-600'}`}>
                  Password
                </label>
                <FaLock className="absolute right-0 top-3 text-white" />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-full border-2 border-blue-500 bg-transparent text-white font-semibold transition-all duration-500 hover:bg-blue-500 relative overflow-hidden`}
              >
                <span className="relative z-10">Register</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>

              <div className="text-center">
                <p className="text-white text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignup(false)}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Info Content - Login */}
        <div className={`absolute right-0 top-0 w-1/2 h-full flex flex-col justify-center items-center p-8 text-right transition-all duration-700 ${!isSignup ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0 blur-sm'}`}>
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-4 uppercase">WELCOME BACK!</h2>
            <p className="text-lg">We are happy to have you with us again. If you need anything, we are here to help.</p>
          </div>
        </div>

        {/* Info Content - Register */}
        <div className={`absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center items-center p-8 text-left transition-all duration-700 ${isSignup ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0 blur-sm'}`}>
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-4 uppercase">WELCOME!</h2>
            <p className="text-lg">We're delighted to have you here. If you need any assistance, feel free to reach out.</p>
          </div>
        </div>

        {message && (
          <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-sm ${message.includes('success') || message.includes('approved') ? 'text-green-400' : 'text-red-400'} animate-pulse`}>
            {message}
          </div>
        )}
        
        </div>
      </div>
    </div>
  );
}

export default Login;
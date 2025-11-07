import { useState } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaLeaf, FaUser } from 'react-icons/fa';
import logo from './companyLogo.jpg';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignup) {
      if (password !== confirmPassword) {
        setMessage('Passwords do not match');
        return;
      }
      try {
        const response = await fetch('http://localhost:3001/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName })
        });
        
        const data = await response.json();
        setMessage(data.message || 'Account request submitted! Awaiting admin approval.');
      } catch (error) {
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        const newUser = { email, password, fullName, requestDate: new Date().toISOString(), status: 'pending' };
        pendingUsers.push(newUser);
        localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
        setMessage('Account request submitted! (Offline mode)');
      }
      setIsSignup(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', email);
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/');
      } else {
        setMessage(data.error || 'Invalid credentials');
      }
    } catch (error) {
      const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
      const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
      
      const isApproved = approvedUsers.some(user => user.email === email);
      const isPending = pendingUsers.some(user => user.email === email && user.status === 'pending');
      
      if (email === 'admin@esgenius.com' && password === 'admin123') {
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

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-500 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-[#e9edf2] via-[#f1f5f9] to-[#e2e8f0]'}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#3a7a44]/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#1b3a2d]/10 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#3a7a44]/5 rounded-full animate-ping" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-[#2a4a33]/8 rounded-full animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-[#3a7a44]/6 rounded-full animate-spin" style={{animationDuration: '8s'}}></div>
        <div className="absolute top-3/4 left-1/3 w-20 h-20 bg-[#1b3a2d]/7 rounded-full animate-pulse" style={{animationDuration: '2s'}}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3a7a44]/3 to-transparent animate-wave"></div>
      </div>
      <div className={`container relative max-w-4xl w-full h-[450px] rounded-2xl shadow-2xl overflow-hidden border transition-all duration-1000 ${isSignup ? 'active' : ''}`} style={isDark ? { background: 'rgba(17,24,39,0.9)', border: '2px solid #3a7a44', boxShadow: '0 0 25px rgba(58, 122, 68, 0.3)' } : { background: 'rgba(255,255,255,0.9)', border: '2px solid #3a7a44', boxShadow: '0 0 25px rgba(58, 122, 68, 0.2)' }}>

        <div className={`curved-shape absolute right-0 top-[-5px] h-[600px] w-[850px] transition-all duration-1500 ease-in-out ${isSignup ? 'transform rotate-0 skew-y-0' : 'transform rotate-12 skew-y-12'}`} style={{
          background: isDark ? 'linear-gradient(45deg, #1f2937, #3a7a44)' : 'linear-gradient(45deg, #f8fafc, #3a7a44)',
          transformOrigin: 'bottom right',
          transitionDelay: isSignup ? '0.5s' : '1.6s'
        }}></div>
        
        <div className={`curved-shape2 absolute left-[250px] top-full h-[700px] w-[850px] border-t-2 border-[#3a7a44] transition-all duration-1500 ease-in-out ${isSignup ? 'transform -rotate-12 -skew-y-12' : 'transform rotate-0 skew-y-0'}`} style={{
          background: isDark ? '#1f2937' : '#f8fafc',
          transformOrigin: 'bottom left',
          transitionDelay: isSignup ? '1.2s' : '0.5s'
        }}></div>
        
        <div className="form-box Login absolute top-0 left-0 w-1/2 h-full flex justify-center flex-col px-10">
          <div className={`animation flex items-center justify-center gap-3 mb-6 transition-all duration-700 ${!isSignup ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0'}`} style={{
            transitionDelay: !isSignup ? 'calc(0.1s * 20)' : 'calc(0.1s * 0)'
          }}>
            {logo ? (
              <img src={logo} alt="Company logo" className="w-12 h-12 rounded-full border-2 border-[#3a7a44]/30" />
            ) : (
              <FaLeaf className={`text-2xl ${isDark ? 'text-[#3a7a44]' : 'text-[#3a7a44]'}`} />
            )}
            <div className="text-center">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>ESGenius Tech</h2>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Login</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className={`input-box animation relative w-full h-12 mt-6 transition-all duration-700 ${!isSignup ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0'}`} style={{
              transitionDelay: !isSignup ? 'calc(0.1s * 22)' : 'calc(0.1s * 1)'
            }}>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full h-full bg-transparent border-none outline-none text-base font-semibold border-b-2 pr-6 transition-all duration-500 ${isDark ? 'text-white border-white focus:border-[#3a7a44]' : 'text-gray-900 border-gray-900 focus:border-[#3a7a44]'}`}
              />
              <label className={`absolute top-1/2 left-0 transform -translate-y-1/2 text-base transition-all duration-500 ${isDark ? 'text-white' : 'text-gray-900'} ${email ? 'top-[-5px] text-[#3a7a44]' : ''}`}>Username</label>
              <FaUser className={`absolute top-1/2 right-0 transform -translate-y-1/2 text-lg transition-all duration-500 ${email ? 'text-[#3a7a44]' : isDark ? 'text-white' : 'text-gray-900'}`} />
            </div>

            <div className={`input-box animation relative w-full h-12 mt-6 transition-all duration-700 ${!isSignup ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0'}`} style={{
              transitionDelay: !isSignup ? 'calc(0.1s * 23)' : 'calc(0.1s * 2)'
            }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full h-full bg-transparent border-none outline-none text-base font-semibold border-b-2 pr-6 transition-all duration-500 ${isDark ? 'text-white border-white focus:border-[#3a7a44]' : 'text-gray-900 border-gray-900 focus:border-[#3a7a44]'}`}
              />
              <label className={`absolute top-1/2 left-0 transform -translate-y-1/2 text-base transition-all duration-500 ${isDark ? 'text-white' : 'text-gray-900'} ${password ? 'top-[-5px] text-[#3a7a44]' : ''}`}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 right-0 transform -translate-y-1/2 text-lg transition-all duration-500 ${password ? 'text-[#3a7a44]' : isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {showPassword ? <FaEyeSlash /> : <FaLock />}
              </button>
            </div>

            <div className={`input-box animation mt-6 transition-all duration-700 ${!isSignup ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0'}`} style={{
              transitionDelay: !isSignup ? 'calc(0.1s * 24)' : 'calc(0.1s * 3)'
            }}>
              <button type="submit" className="btn relative w-full h-11 bg-transparent rounded-full cursor-pointer text-base font-semibold border-2 border-[#3a7a44] overflow-hidden z-10 text-white transition-all duration-500 hover:before:top-0">
                Login
              </button>
            </div>

            <div className={`regi-link animation text-sm text-center mt-5 transition-all duration-700 ${!isSignup ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0'}`} style={{
              transitionDelay: !isSignup ? 'calc(0.1s * 25)' : 'calc(0.1s * 4)'
            }}>
              <p className={isDark ? 'text-white' : 'text-gray-900'}>
                Don't have an account? <br />
                <button type="button" onClick={() => setIsSignup(true)} className="text-[#3a7a44] font-semibold hover:underline">
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="info-content Login absolute top-0 right-0 h-full w-1/2 flex justify-center flex-col text-right pr-10 pl-36 pb-16">
          <div className={`animation flex items-center justify-end gap-3 mb-4 transition-all duration-700 ${!isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform translate-x-full opacity-0 blur-sm'}`} style={{
            transitionDelay: !isSignup ? 'calc(0.1s * 19)' : 'calc(0.1s * 0)'
          }}>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-white">ESGenius Tech</h2>
              <p className="text-sm text-white/80">Solutions</p>
            </div>
            {logo ? (
              <img src={logo} alt="Company logo" className="w-16 h-16 rounded-full border-2 border-white/20" />
            ) : (
              <FaLeaf className="text-3xl text-green-300" />
            )}
          </div>
          <h2 className={`animation uppercase text-3xl leading-tight mb-4 transition-all duration-700 ${isDark ? 'text-white' : 'text-gray-900'} ${!isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform translate-x-full opacity-0 blur-sm'}`} style={{
            transitionDelay: !isSignup ? 'calc(0.1s * 20)' : 'calc(0.1s * 1)'
          }}>WELCOME BACK!</h2>
          <p className={`animation text-base transition-all duration-700 ${isDark ? 'text-white' : 'text-gray-700'} ${!isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform translate-x-full opacity-0 blur-sm'}`} style={{
            transitionDelay: !isSignup ? 'calc(0.1s * 21)' : 'calc(0.1s * 2)'
          }}>We are happy to have you with us again. If you need anything, we are here to help.</p>
        </div>

        <div className="form-box Register absolute top-0 right-0 w-1/2 h-full flex justify-center flex-col px-16">
          <div className={`animation flex items-center justify-center gap-3 mb-6 transition-all duration-700 ${isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform translate-x-full opacity-0 blur-sm'}`} style={{
            transitionDelay: isSignup ? 'calc(0.1s * 17)' : 'calc(0.1s * 0)'
          }}>
            {logo ? (
              <img src={logo} alt="Company logo" className="w-12 h-12 rounded-full border-2 border-[#3a7a44]/30" />
            ) : (
              <FaLeaf className={`text-2xl ${isDark ? 'text-[#3a7a44]' : 'text-[#3a7a44]'}`} />
            )}
            <div className="text-center">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>ESGenius Tech</h2>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Register</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className={`input-box animation relative w-full h-12 mt-6 transition-all duration-700 ${isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform translate-x-full opacity-0 blur-sm'}`} style={{
              transitionDelay: isSignup ? 'calc(0.1s * 18)' : 'calc(0.1s * 1)'
            }}>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isSignup}
                className={`w-full h-full bg-transparent border-none outline-none text-base font-semibold border-b-2 pr-6 transition-all duration-500 ${isDark ? 'text-white border-white focus:border-[#3a7a44]' : 'text-gray-900 border-gray-900 focus:border-[#3a7a44]'}`}
              />
              <label className={`absolute top-1/2 left-0 transform -translate-y-1/2 text-base transition-all duration-500 ${isDark ? 'text-white' : 'text-gray-900'} ${fullName ? 'top-[-5px] text-[#3a7a44]' : ''}`}>Username</label>
              <FaUser className={`absolute top-1/2 right-0 transform -translate-y-1/2 text-lg transition-all duration-500 ${fullName ? 'text-[#3a7a44]' : isDark ? 'text-white' : 'text-gray-900'}`} />
            </div>

            <div className={`input-box animation relative w-full h-12 mt-6 transition-all duration-700 ${isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform translate-x-full opacity-0 blur-sm'}`} style={{
              transitionDelay: isSignup ? 'calc(0.1s * 19)' : 'calc(0.1s * 2)'
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full h-full bg-transparent border-none outline-none text-base font-semibold border-b-2 pr-6 transition-all duration-500 ${isDark ? 'text-white border-white focus:border-[#3a7a44]' : 'text-gray-900 border-gray-900 focus:border-[#3a7a44]'}`}
              />
              <label className={`absolute top-1/2 left-0 transform -translate-y-1/2 text-base transition-all duration-500 ${isDark ? 'text-white' : 'text-gray-900'} ${email ? 'top-[-5px] text-[#3a7a44]' : ''}`}>Email</label>
              <FaEnvelope className={`absolute top-1/2 right-0 transform -translate-y-1/2 text-lg transition-all duration-500 ${email ? 'text-[#3a7a44]' : isDark ? 'text-white' : 'text-gray-900'}`} />
            </div>

            <div className={`input-box animation relative w-full h-12 mt-6 transition-all duration-700 ${isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform translate-x-full opacity-0 blur-sm'}`} style={{
              transitionDelay: isSignup ? 'calc(0.1s * 19)' : 'calc(0.1s * 3)'
            }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full h-full bg-transparent border-none outline-none text-base font-semibold border-b-2 pr-6 transition-all duration-500 ${isDark ? 'text-white border-white focus:border-[#3a7a44]' : 'text-gray-900 border-gray-900 focus:border-[#3a7a44]'}`}
              />
              <label className={`absolute top-1/2 left-0 transform -translate-y-1/2 text-base transition-all duration-500 ${isDark ? 'text-white' : 'text-gray-900'} ${password ? 'top-[-5px] text-[#3a7a44]' : ''}`}>Password</label>
              <FaLock className={`absolute top-1/2 right-0 transform -translate-y-1/2 text-lg transition-all duration-500 ${password ? 'text-[#3a7a44]' : isDark ? 'text-white' : 'text-gray-900'}`} />
            </div>

            <div className={`input-box animation mt-6 transition-all duration-700 ${isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform translate-x-full opacity-0 blur-sm'}`} style={{
              transitionDelay: isSignup ? 'calc(0.1s * 20)' : 'calc(0.1s * 4)'
            }}>
              <button type="submit" className="btn relative w-full h-11 bg-transparent rounded-full cursor-pointer text-base font-semibold border-2 border-[#3a7a44] overflow-hidden z-10 text-white transition-all duration-500 hover:before:top-0">
                Register
              </button>
            </div>

            <div className={`regi-link animation text-sm text-center mt-5 transition-all duration-700 ${isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform translate-x-full opacity-0 blur-sm'}`} style={{
              transitionDelay: isSignup ? 'calc(0.1s * 21)' : 'calc(0.1s * 5)'
            }}>
              <p className={isDark ? 'text-white' : 'text-gray-900'}>
                Already have an account? <br />
                <button type="button" onClick={() => setIsSignup(false)} className="text-[#3a7a44] font-semibold hover:underline">
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="info-content Register absolute top-0 left-0 h-full w-1/2 flex justify-center flex-col text-left pl-10 pr-36 pb-16 pointer-events-none">
          <div className={`animation flex items-center gap-3 mb-4 transition-all duration-700 ${isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform -translate-x-full opacity-0 blur-sm'}`} style={{
            transitionDelay: isSignup ? 'calc(0.1s * 16)' : 'calc(0.1s * 0)'
          }}>
            {logo ? (
              <img src={logo} alt="Company logo" className="w-16 h-16 rounded-full border-2 border-white/20" />
            ) : (
              <FaLeaf className="text-3xl text-green-300" />
            )}
            <div>
              <h2 className="text-3xl font-bold text-white">ESGenius Tech</h2>
              <p className="text-sm text-white/80">Solutions</p>
            </div>
          </div>
          <h2 className={`animation uppercase text-3xl leading-tight mb-4 transition-all duration-700 ${isDark ? 'text-white' : 'text-gray-900'} ${isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform -translate-x-full opacity-0 blur-sm'}`} style={{
            transitionDelay: isSignup ? 'calc(0.1s * 17)' : 'calc(0.1s * 1)'
          }}>WELCOME!</h2>
          <p className={`animation text-base transition-all duration-700 ${isDark ? 'text-white' : 'text-gray-700'} ${isSignup ? 'transform translate-x-0 opacity-100 blur-0' : 'transform -translate-x-full opacity-0 blur-sm'}`} style={{
            transitionDelay: isSignup ? 'calc(0.1s * 18)' : 'calc(0.1s * 2)'
          }}>We're delighted to have you here. If you need any assistance, feel free to reach out.</p>
        </div>

        {message && (
          <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-sm ${message.includes('success') || message.includes('approved') ? 'text-green-600' : 'text-red-600'} animate-pulse bg-white/90 px-4 py-2 rounded-lg shadow-lg`}>
            {message}
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-wave {
          animation: wave 10s linear infinite;
        }
        .btn::before {
          content: "";
          position: absolute;
          height: 300%;
          width: 100%;
          background: linear-gradient(#1b3a2d, #3a7a44, #1b3a2d, #3a7a44);
          top: -100%;
          left: 0;
          z-index: -1;
          transition: 0.5s;
        }
        .btn:hover::before {
          top: 0;
        }
      `}</style>
    </div>
  );
};

export default Login;
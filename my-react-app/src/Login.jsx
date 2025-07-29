import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './companyLogo.jpg'; // Make sure path is correct

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const SAMPLE_EMAIL = "demo@esgenius.com";
  const SAMPLE_PASSWORD = "demo1234";

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === SAMPLE_EMAIL && password === SAMPLE_PASSWORD) {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/");
    } else {
      setMessage("❌ Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b3a2d] to-[#2a4a33] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl w-full max-w-md shadow-xl border border-white/30">
        <div className="text-center mb-6">
          <img src={logo} alt="Logo" className="w-14 h-14 mx-auto mb-4 rounded-full" />
          <h1 className="text-white text-2xl font-bold">E-S-Genius Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-white/20 text-white rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-2 bg-white/20 text-white rounded pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-white text-sm"
              title={showPassword ? "Hide" : "Show"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {message && <p className="text-red-300 text-sm">{message}</p>}

          <div className="flex justify-between text-sm text-white">
            <span>
              <input type="checkbox" className="mr-1" /> Remember me
            </span>
            <a href="#" className="hover:underline text-blue-200">Forgot Password?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#298f38] text-white py-2 rounded hover:bg-[#3a7a44] mt-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

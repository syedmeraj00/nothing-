import React, { useState, useEffect } from 'react';

// Professional UX Components Library
export const LoadingSpinner = ({ size = 'md', color = 'blue', isDark = false }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  const colors = { 
    blue: 'border-blue-500', 
    green: 'border-green-500', 
    red: 'border-red-500',
    white: 'border-white'
  };
  
  return (
    <div className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  );
};

export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  };

  return (
    <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up ${styles[type]}`}>
      <div className="flex items-center space-x-2">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-lg">×</button>
      </div>
    </div>
  );
};

export const ProgressBar = ({ progress, label, showPercentage = true }) => (
  <div className="w-full">
    {label && <div className="flex justify-between text-sm mb-1">
      <span>{label}</span>
      {showPercentage && <span>{progress}%</span>}
    </div>}
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

export const Skeleton = ({ className = "h-4 bg-gray-200 rounded" }) => (
  <div className={`animate-pulse ${className}`} />
);

export const Modal = ({ isOpen, onClose, title, children, isDark = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className={`text-2xl ${
            isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
          }`}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg ${
          position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        } left-1/2 transform -translate-x-1/2`}>
          {content}
        </div>
      )}
    </div>
  );
};

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  onClick,
  icon,
  type = 'button',
  ...props 
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-200 hover:scale-105 active:scale-95
        ${variants[variant]} ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {icon && <span className="mr-2">{icon}</span>}
      <span className={loading ? 'ml-2' : ''}>{children}</span>
    </button>
  );
};

export const Input = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  isDark = false,
  ...props 
}) => (
  <div className="w-full">
    {label && (
      <label className={`block text-sm font-medium mb-1 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {icon}
        </div>
      )}
      <input
        className={`
          w-full px-3 py-2 border rounded-lg transition-all duration-200
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
          ${icon ? 'pl-10' : ''}
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

export const Select = ({ 
  label, 
  error, 
  options = [], 
  className = '', 
  ...props 
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <select
      className={`
        w-full px-3 py-2 border rounded-lg transition-all duration-200
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

export const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  isDark = false 
}) => (
  <div 
    className={`
      ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
      rounded-xl border shadow-sm transition-colors duration-300
      ${hover ? 'hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer' : ''}
      ${className}
    `}
    onClick={onClick}
  >
    {children}
  </div>
);

export const Tabs = ({ tabs, activeTab, onTabChange }) => (
  <div className="border-b border-gray-200">
    <nav className="flex space-x-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
            ${activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  </div>
);

export const Alert = ({ type = 'info', title, message, children, onClose, isDark = false, className = '' }) => {
  const styles = {
    info: isDark ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800',
    success: isDark ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-800',
    warning: isDark ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  return (
    <div className={`border rounded-lg p-4 transition-colors duration-300 ${styles[type]}`}>
      <div className="flex items-start">
        <span className="text-lg mr-3">{icons[type]}</span>
        <div className="flex-1">
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <div>{message || children}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-3 text-lg hover:opacity-70">
            ×
          </button>
        )}
      </div>
    </div>
  );
};
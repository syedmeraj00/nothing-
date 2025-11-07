import React, { useState } from 'react';

const ProfessionalCard = ({ 
  title, 
  children, 
  icon, 
  className = '', 
  headerActions,
  isDark = false,
  gradient = false,
  hover = true 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = `
    relative overflow-hidden rounded-2xl border transition-all duration-300
    ${hover ? 'hover-lift' : ''}
    ${gradient ? 'gradient-border' : ''}
    ${isDark 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200'
    }
    professional-shadow
    ${className}
  `;

  return (
    <div 
      className={baseClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-green-50/50 pointer-events-none" />
      )}
      
      {/* Header */}
      {title && (
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-lg transition-transform duration-300 ${
                isHovered ? 'scale-110 rotate-3' : ''
              }`}>
                {icon}
              </div>
            )}
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h3>
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Hover Effect */}
      {hover && (
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5 opacity-0 transition-opacity duration-300 pointer-events-none ${
          isHovered ? 'opacity-100' : ''
        }`} />
      )}
    </div>
  );
};

export const MetricCard = ({ 
  icon, 
  value, 
  label, 
  trend, 
  trendColor = 'text-green-500',
  isDark = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ProfessionalCard 
      className="animate-fade-in h-full" 
      isDark={isDark}
      hover={true}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xl flex-shrink-0">
            {icon}
          </div>
          <div className={`text-xs font-medium ${trendColor} text-right`}>
            {trend}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className={`text-3xl font-bold mb-3 transition-all duration-1000 ${
            isDark ? 'text-white' : 'text-gray-900'
          } ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}>
            {value}
          </div>
          
          <div className={`text-sm font-medium mb-4 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {label}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className={`h-2 rounded-full overflow-hidden ${
          isDark ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out rounded-full"
            style={{ width: isVisible ? '75%' : '0%' }}
          />
        </div>
      </div>
    </ProfessionalCard>
  );
};

export const StatusCard = ({ 
  title, 
  status, 
  description, 
  icon, 
  color = 'blue',
  isDark = false 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    gray: 'from-gray-500 to-gray-600'
  };

  const statusColors = {
    blue: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
    green: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
    yellow: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
    red: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
    purple: isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800',
    gray: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
  };

  return (
    <ProfessionalCard isDark={isDark} className="animate-slide-up h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-xl flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h4>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium mb-3 ${statusColors[color]}`}>
            {status}
          </div>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
      </div>
    </ProfessionalCard>
  );
};

export default ProfessionalCard;
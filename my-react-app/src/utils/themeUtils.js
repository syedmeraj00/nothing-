// Optimized Theme Utilities for Light and Dark Mode
export const getThemeClasses = (isDark) => ({
  // Background classes
  bg: {
    primary: isDark ? 'bg-gray-900' : 'bg-white',
    secondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
    tertiary: isDark ? 'bg-gray-700' : 'bg-gray-100',
    gradient: isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100',
    card: isDark ? 'bg-gray-800' : 'bg-white',
    input: isDark ? 'bg-gray-700' : 'bg-white',
    subtle: isDark ? 'bg-gray-700' : 'bg-gray-50',
    accent: isDark ? 'bg-blue-900/30' : 'bg-blue-50'
  },
  
  // Text classes
  text: {
    primary: isDark ? 'text-white' : 'text-gray-900',
    secondary: isDark ? 'text-gray-300' : 'text-gray-700',
    tertiary: isDark ? 'text-gray-400' : 'text-gray-600',
    muted: isDark ? 'text-gray-500' : 'text-gray-500',
    accent: 'text-blue-500'
  },
  
  // Border classes
  border: {
    primary: isDark ? 'border-gray-700' : 'border-gray-200',
    secondary: isDark ? 'border-gray-600' : 'border-gray-300',
    input: isDark ? 'border-gray-600' : 'border-gray-300'
  },
  
  // Hover states
  hover: {
    bg: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    text: isDark ? 'hover:text-white' : 'hover:text-gray-900',
    border: isDark ? 'hover:border-gray-500' : 'hover:border-gray-400',
    subtle: isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200',
    card: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
  },
  
  // Focus states
  focus: {
    ring: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  }
});

export const getStatusColors = (status, isDark) => {
  const colors = {
    success: {
      bg: isDark ? 'bg-green-900/50' : 'bg-green-100',
      text: isDark ? 'text-green-300' : 'text-green-800',
      border: isDark ? 'border-green-700' : 'border-green-200'
    },
    warning: {
      bg: isDark ? 'bg-yellow-900/50' : 'bg-yellow-100',
      text: isDark ? 'text-yellow-300' : 'text-yellow-800',
      border: isDark ? 'border-yellow-700' : 'border-yellow-200'
    },
    error: {
      bg: isDark ? 'bg-red-900/50' : 'bg-red-100',
      text: isDark ? 'text-red-300' : 'text-red-800',
      border: isDark ? 'border-red-700' : 'border-red-200'
    },
    info: {
      bg: isDark ? 'bg-blue-900/50' : 'bg-blue-100',
      text: isDark ? 'text-blue-300' : 'text-blue-800',
      border: isDark ? 'border-blue-700' : 'border-blue-200'
    }
  };
  return colors[status] || colors.info;
};
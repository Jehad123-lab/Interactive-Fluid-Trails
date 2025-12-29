
import React, { useContext } from 'react';

// Design Tokens

const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 48,
  xxl: 96,
};

const radius = {
  s: 8,
  m: 24, // Soft pill shape
  l: 32,
};

const typography = {
  display: {
    l: { fontSize: 80, lineHeight: '110%', fontWeight: 300, letterSpacing: '-2px', fontFamily: `'Inter', sans-serif`, tag: 'h1' },
    m: { fontSize: 48, lineHeight: '110%', fontWeight: 300, letterSpacing: '-1px', fontFamily: `'Inter', sans-serif`, tag: 'h2' },
    s: { fontSize: 32, lineHeight: '120%', fontWeight: 400, letterSpacing: '-0.5px', fontFamily: `'Inter', sans-serif`, tag: 'h3' },
  },
  headline: {
    l: { fontSize: 24, lineHeight: '130%', fontWeight: 400, letterSpacing: '0px', fontFamily: `'Inter', sans-serif`, tag: 'h4' },
    m: { fontSize: 18, lineHeight: '140%', fontWeight: 500, letterSpacing: '0px', fontFamily: `'Inter', sans-serif`, tag: 'h5' },
    s: { fontSize: 14, lineHeight: '140%', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: `'Inter', sans-serif`, tag: 'h6' },
  },
  body: {
    l: { fontSize: 16, lineHeight: '160%', fontWeight: 400, letterSpacing: '0px', fontFamily: `'Inter', sans-serif`, tag: 'p' },
    m: { fontSize: 14, lineHeight: '150%', fontWeight: 400, letterSpacing: '0px', fontFamily: `'Inter', sans-serif`, tag: 'p' },
    s: { fontSize: 12, lineHeight: '150%', fontWeight: 400, letterSpacing: '0px', fontFamily: `'Inter', sans-serif`, tag: 'span' },
  },
  code: {
    m: { fontSize: 12, lineHeight: '160%', fontWeight: 400, fontFamily: 'monospace', tag: 'code' },
  }
};

const lightTheme = {
  colors: {
    base: {
      surface: { 1: '#FFFFFF', 2: 'rgba(255, 255, 255, 0.7)', 3: 'rgba(0, 0, 0, 0.05)' },
      content: { 1: '#000000', 2: '#555555', 3: '#999999' },
      border: 'rgba(0, 0, 0, 0.1)'
    },
    action: {
      surface: { 1: '#007AFF' },
      content: { 1: '#FFFFFF' },
    },
    feedback: { success: '#34C759', warning: '#FFCC00', error: '#FF3B30', focus: '#007AFF' }
  },
  typography, spacing, radius, isDark: false,
};

const darkTheme = {
  colors: {
    base: {
      surface: { 
          1: '#050505', 
          2: 'rgba(20, 20, 20, 0.65)', // Translucent panel
          3: 'rgba(255, 255, 255, 0.1)' // Subtle track/border
      }, 
      content: { 
          1: 'rgba(255, 255, 255, 0.95)', 
          2: 'rgba(255, 255, 255, 0.6)', 
          3: 'rgba(255, 255, 255, 0.4)' 
      },
      border: 'rgba(255, 255, 255, 0.12)'
    },
    action: {
      surface: { 1: '#0A84FF' }, // Soft Electric Blue
      content: { 1: '#FFFFFF' },
    },
    feedback: {
        success: '#32D74B',
        warning: '#FFD60A',
        error: '#FF453A',
        focus: '#0A84FF',
    }
  },
  typography,
  spacing,
  radius,
  isDark: true,
};

const ThemeContext = React.createContext(darkTheme);

export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = ThemeContext.Provider;
export { lightTheme, darkTheme };


import React, { useState } from 'react';
import HomePage from './components/Page/HomePage';
import { ThemeProvider, lightTheme, darkTheme } from './theme/Theme';

function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const appStyle = {
    fontFamily: currentTheme.typography.body.m.fontFamily,
    backgroundColor: currentTheme.colors.base.surface[1],
    color: currentTheme.colors.base.content[1],
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  };

  return (
    <ThemeProvider value={currentTheme}>
      <div style={appStyle}>
        <HomePage toggleTheme={toggleTheme} currentTheme={theme} />
      </div>
    </ThemeProvider>
  );
}

export default App;
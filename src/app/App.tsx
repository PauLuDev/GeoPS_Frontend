import { useState } from 'react';
import { AppRouter } from './router/AppRouter';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <div className="geops-app" data-theme={theme}>
      <AppRouter theme={theme} onThemeChange={setTheme} />
      <div id="geops-portal-root" />
    </div>
  );
}

export default App;
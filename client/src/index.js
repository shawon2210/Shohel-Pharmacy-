import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
<<<<<<< HEAD
import { ThemeProvider } from './context/ThemeContext';
import { LocaleProvider } from './context/LocaleContext';
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
<<<<<<< HEAD
    <ThemeProvider>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </ThemeProvider>
  </React.StrictMode>
);
=======
    <App />
  </React.StrictMode>
);
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './index.css';
import './themes/fonts';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found');
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

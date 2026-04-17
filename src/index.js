// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/* 🌐 Global styles */
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/main.css';

/* 🟦 Render root */
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

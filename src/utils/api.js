const LOCAL_API_BASE_URL = 'http://localhost:5000';
const PRODUCTION_API_BASE_URL =
  'https://bookify-backend-gk7e.onrender.com';

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')
    ? LOCAL_API_BASE_URL
    : PRODUCTION_API_BASE_URL);

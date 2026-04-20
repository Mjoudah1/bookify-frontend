import { API_BASE_URL } from './api';

const getApiOrigin = () => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
};

export const normalizeMediaUrl = (url) => {
  if (!url) return null;

  const value = String(url).trim();
  if (!value) return null;

  const apiOrigin = getApiOrigin();

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const isLocalHost =
        parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      const isFrontendUploadPath =
        /\.vercel\.app$/i.test(parsed.hostname) &&
        parsed.pathname.startsWith('/uploads/');

      if ((isLocalHost || isFrontendUploadPath) && apiOrigin) {
        return `${apiOrigin}${parsed.pathname}`;
      }
    } catch {
      return value;
    }

    return value;
  }

  if (!apiOrigin) return value;

  return value.startsWith('/')
    ? `${apiOrigin}${value}`
    : `${apiOrigin}/${value}`;
};

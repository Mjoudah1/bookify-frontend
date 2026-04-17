// frontend/src/utils/auth.js
import { jwtDecode } from 'jwt-decode';

/**
 * ✅ Save the JWT token in localStorage
 * (used during login or signup)
 */
export const setToken = (token) => {
  if (!token) return;
  localStorage.setItem('token', token);
};

/**
 * ✅ Alias for compatibility (some files may use saveToken)
 */
export const saveToken = setToken;

/**
 * ✅ Retrieve the stored JWT token
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

export const setHasInterests = (value) => {
  localStorage.setItem('bookify-has-interests', value ? 'true' : 'false');
};

export const hasInterests = () => {
  return localStorage.getItem('bookify-has-interests') === 'true';
};

/**
 * ✅ Remove the stored JWT token (logout)
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('bookify-has-interests');
};

/**
 * ✅ Decode raw token safely
 */
const safeDecode = () => {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
};

/**
 * ✅ Check if token exists & not expired (if exp is present)
 */
export const isTokenExpired = () => {
  const decoded = safeDecode();
  if (!decoded) return true; // ما في توكن أو فيه مشكلة

  // لو ما في exp في الـ token نعتبره غير منتهي
  if (!decoded.exp) return false;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return decoded.exp < nowInSeconds;
};

/**
 * ✅ Simple helper: هل المستخدم مسجّل دخول؟
 */
export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired();
};

/**
 * ✅ Decode the JWT token to get user role
 */
export const getUserRole = () => {
  const decoded = safeDecode();
  if (!decoded) return null;
  return decoded.role || null;
};

export const mustChangePassword = () => {
  const decoded = safeDecode();
  if (!decoded) return false;
  return Boolean(decoded.mustChangePassword);
};

/**
 * ✅ Unified getter for user ID
 * (handles id / _id / userId)
 */
export const getUserId = () => {
  const decoded = safeDecode();
  if (!decoded) return null;

  return decoded.id || decoded._id || decoded.userId || null;
};

/**
 * ✅ Decode the JWT token to get full user data (ID, role, etc.)
 */
export const getUserInfo = () => {
  return safeDecode();
};

/* =========================================================
   ⏰ Auto Logout when token expires (front-end helper)
========================================================= */

/**
 * setupAutoLogout(callback)
 * - يحسب متى التوكن ينتهي (من exp)
 * - يعمل setTimeout → يشغّل callback لما ينتهي
 * - يرجّع دالة لإلغاء الـ timeout لما يتدمّر الـ component
 *
 * مثال الاستخدام في App:
 *   const cancel = setupAutoLogout(() => {
 *     logout();
 *     window.location.href = '/login';
 *   });
 */
export const setupAutoLogout = (onExpire) => {
  const decoded = safeDecode();
  if (!decoded || !decoded.exp) {
    // لا يوجد exp → لا نضبط تايمر
    return () => {};
  }

  const nowMs = Date.now();
  const expMs = decoded.exp * 1000;
  const delay = expMs - nowMs;

  if (delay <= 0) {
    // التوكن منتهي أصلاً
    if (typeof onExpire === 'function') {
      onExpire();
    }
    return () => {};
  }

  const timeoutId = setTimeout(() => {
    if (typeof onExpire === 'function') {
      onExpire();
    }
  }, delay);

  // دالة لإلغاء الـ timeout
  return () => clearTimeout(timeoutId);
};

/* =========================================================
   🔄 Sync logout بين أكثر من تبويب (tabs)
========================================================= */

/**
 * listenStorageAuthChanges(callback)
 * - يسمع لـ storage event
 * - لو الـ token تم مسحه في تبويب ثاني → يشغّل callback
 *
 * يرجّع دالة لإلغاء الـ listener
 */
export const listenStorageAuthChanges = (onLoggedOut) => {
  const handler = (event) => {
    if (event.key === 'token' && event.newValue === null) {
      // تم حذف التوكن من تبويب آخر
      if (typeof onLoggedOut === 'function') {
        onLoggedOut();
      }
    }
  };

  window.addEventListener('storage', handler);

  // دالة لإلغاء الـ listener
  return () => {
    window.removeEventListener('storage', handler);
  };
};

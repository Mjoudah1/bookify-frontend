// frontend/src/App.js
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import NavbarComponent from './components/NavbarComponent';
import ChangePassword from './pages/ChangePassword';
import HomePage from './pages/HomePage';
import BookDetails from './pages/BookDetails';
import ForgotPassword from './pages/ForgotPassword';
import MyBooks from './pages/MyBooks';
import MyTransactions from './pages/MyTransactions';
import MyNotifications from './pages/MyNotifications';
import UserMessages from './pages/UserMessages';
import AdminMessages from './pages/AdminMessages';
import OnlineReader from './pages/OnlineReader'; // ✅ جديد
import BookOfIntrests from './pages/BookOfIntrests';
import SocialAuthCallback from './pages/SocialAuthCallback';

import {
  isLoggedIn,
  getUserRole,
  mustChangePassword,
  setupAutoLogout,
  listenStorageAuthChanges,
  logout,
  hasInterests,
} from './utils/auth';

/* ================================
   🔐 ProtectedRoute Component
================================ */
function ProtectedRoute({ children, allowedRoles }) {
  const loggedIn = isLoggedIn();
  const role = getUserRole();
  const location = useLocation();
  const requiresPasswordChange = mustChangePassword();

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requiresPasswordChange && location.pathname !== '/change-password') {
    return (
      <Navigate
        to="/change-password"
        replace
        state={{
          forcedMessage:
            'The admin assigned you a temporary password. You must change it before continuing.',
        }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  if (
    role === 'user' &&
    location.pathname !== '/change-password' &&
    location.pathname !== '/book-of-intrests' &&
    !hasInterests()
  ) {
    return <Navigate to="/book-of-intrests" replace />;
  }

  return children;
}

function PasswordLockedPublicRoute({ children }) {
  const loggedIn = isLoggedIn();
  const requiresPasswordChange = mustChangePassword();

  if (loggedIn && requiresPasswordChange) {
    return (
      <Navigate
        to="/change-password"
        replace
        state={{
          forcedMessage:
            'The admin assigned you a temporary password. You must change it before using the library.',
        }}
      />
    );
  }

  return children;
}

function App() {
  useEffect(() => {
    const cancelAuto = setupAutoLogout(() => {
      logout();
      window.location.href = '/login';
    });

    const stopSync = listenStorageAuthChanges(() => {
      logout();
      window.location.href = '/login';
    });

    return () => {
      cancelAuto();
      stopSync();
    };
  }, []);

  return (
    <Router>
      <NavbarComponent />
      <Routes>
        {/* Public home page */}
        <Route
          path="/"
          element={
            <PasswordLockedPublicRoute>
              <HomePage />
            </PasswordLockedPublicRoute>
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/social/callback" element={<SocialAuthCallback />} />

        {/* 🔥 Admin only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-of-intrests"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <BookOfIntrests />
            </ProtectedRoute>
          }
        />

        {/* 👤 User dashboard (admin + user) */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* 📚 My owned books */}
        <Route
          path="/my-books"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <MyBooks />
            </ProtectedRoute>
          }
        />

        {/* 🧾 My transactions */}
        <Route
          path="/my-transactions"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <MyTransactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <MyNotifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-messages"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminMessages />
            </ProtectedRoute>
          }
        />

        {/* Change password – أي مستخدم مسجل */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* Book page — عام */}
        <Route
          path="/books/:id"
          element={
            <PasswordLockedPublicRoute>
              <BookDetails />
            </PasswordLockedPublicRoute>
          }
        />

        {/* ✅ صفحة القراءة أونلاين */}
        <Route
          path="/read/:bookId"
          element={
            <PasswordLockedPublicRoute>
              <OnlineReader />
            </PasswordLockedPublicRoute>
          }
        />

        {/* أي مسار غلط */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

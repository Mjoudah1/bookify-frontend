// frontend/src/pages/ChangePassword.js
import React, { useState } from 'react';
import axios from 'axios';
import {
  getToken,
  logout,
  saveToken,
  mustChangePassword,
  getUserRole,
  setHasInterests,
} from '../utils/auth';
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  InputGroup,
} from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

const backendURL = `${API_BASE_URL}/api/auth/change-password`;

export default function ChangePassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const forcePasswordChange = mustChangePassword();
  const forcedMessage =
    location.state?.forcedMessage ||
    (forcePasswordChange
      ? 'You are using a temporary password created by the admin. You must replace it before continuing.'
      : '');

  const isShortNewPassword =
    newPassword.length > 0 && newPassword.length < 6;

  const calcPasswordStrength = (password) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return 1;
    if (score === 2) return 2;
    if (score === 3) return 3;
    return 4;
  };

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);
    setPasswordStrength(calcPasswordStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const token = getToken();
    if (!token) {
      setError('You are not logged in. Please log in again.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    try {
      const res = await axios.put(
        backendURL,
        {
          oldPassword,
          currentPassword: oldPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.token) {
        saveToken(res.data.token);
      }

      setHasInterests(Boolean(res.data?.user?.hasInterests));

      setMessage(res.data.message || 'Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordStrength(0);

      const updatedRole = res.data?.user?.role || getUserRole();
      setTimeout(() => {
        if (updatedRole === 'admin') {
          navigate('/admin', { replace: true });
          return;
        }

        if (forcePasswordChange) {
          navigate('/book-of-intrests', { replace: true });
          return;
        }

        navigate(
          res.data?.user?.hasInterests ? '/user' : '/book-of-intrests',
          {
            replace: true,
          }
        );
      }, 900);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Something went wrong.';

      if (status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
      } else {
        setError(msg);
      }
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const strengthWidth =
    passwordStrength === 0
      ? '0%'
      : passwordStrength === 1
      ? '25%'
      : passwordStrength === 2
      ? '50%'
      : passwordStrength === 3
      ? '75%'
      : '100%';

  const strengthTone =
    passwordStrength <= 1
      ? 'is-weak'
      : passwordStrength === 2
      ? 'is-medium'
      : passwordStrength === 3
      ? 'is-strong'
      : 'is-excellent';

  const strengthLabel =
    passwordStrength === 0 && newPassword.length === 0
      ? 'Type a password to see its strength.'
      : passwordStrength === 1
      ? 'Very weak'
      : passwordStrength === 2
      ? 'Weak'
      : passwordStrength === 3
      ? 'Medium'
      : 'Strong';

  return (
    <div className="auth-shell auth-shell--compact">
      <Container style={{ maxWidth: '560px' }}>
        <Card className="auth-panel auth-panel--compact border-0">
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4 auth-form-head">
              <div className="auth-compact-icon" aria-hidden="true">
                <i className="bi bi-shield-lock-fill" />
              </div>
              <h3 className="auth-heading fw-bold mb-1">Change Password</h3>
              <p className="auth-subtext mb-0 auth-form-subtext">
                Keep your Bookify account secure by updating your password.
              </p>
            </div>

            {message && <Alert variant="success" className="py-2">{message}</Alert>}
            {forcedMessage && (
              <Alert variant="warning" className="py-2">
                {forcedMessage}
              </Alert>
            )}
            {error && <Alert variant="danger" className="app-error-alert py-2">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <InputGroup className="auth-input-group">
                  <Form.Control
                    type={showOld ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <InputGroup.Text
                    className="auth-password-toggle"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowOld((prev) => !prev)}
                  >
                    {showOld ? (
                      <i className="bi bi-eye-slash-fill"></i>
                    ) : (
                      <i className="bi bi-eye-fill"></i>
                    )}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <InputGroup className="auth-input-group">
                  <Form.Control
                    type={showNew ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    className="auth-input"
                    isInvalid={isShortNewPassword}
                    required
                  />
                  <InputGroup.Text
                    className="auth-password-toggle"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowNew((prev) => !prev)}
                  >
                    {showNew ? (
                      <i className="bi bi-eye-slash-fill"></i>
                    ) : (
                      <i className="bi bi-eye-fill"></i>
                    )}
                  </InputGroup.Text>
                </InputGroup>
                {isShortNewPassword && (
                  <Form.Text className="text-danger">
                    New password must be at least 6 characters long.
                  </Form.Text>
                )}

                <div className="auth-strength mt-2">
                  <div className="auth-strength__bar">
                    <div
                      className={`auth-strength__fill ${strengthTone}`}
                      style={{ width: strengthWidth }}
                    ></div>
                  </div>
                  <div className="auth-strength__label mt-1">{strengthLabel}</div>
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type={showNew ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="auth-input"
                  isInvalid={
                    confirmNewPassword.length > 0 &&
                    newPassword !== confirmNewPassword
                  }
                  required
                />
                <Form.Control.Feedback type="invalid">
                  New password and confirmation do not match.
                </Form.Control.Feedback>
              </Form.Group>

              <div className="auth-inline-actions">
                <Button variant="primary" type="submit" className="auth-submit-btn flex-grow-1">
                  Update Password
                </Button>
                <Button variant="outline-secondary" onClick={handleLogout} className="auth-secondary-btn">
                  Logout
                </Button>
              </div>

              <div className="text-center mt-3 small text-muted auth-create-row">
                Need to recover your account?{' '}
                <Link to="/forgot-password" className="text-primary text-decoration-none auth-create-link">
                  Reset it here
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

// frontend/src/pages/ForgotPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  InputGroup,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setQuestion('');
    setAnswer('');
    setNewPassword('');
    setPasswordStrength(0);
    setLoadingQuestion(true);

    try {
      const res = await axios.post(`${API_BASE}/forgot-password/question`, {
        email,
      });
      setQuestion(res.data.question);
      setSuccess('Security question loaded.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load question.');
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoadingReset(true);

    try {
      const res = await axios.post(`${API_BASE}/forgot-password/reset`, {
        email,
        answer,
        newPassword,
      });

      setSuccess(res.data.message);
      setEmail('');
      setQuestion('');
      setAnswer('');
      setNewPassword('');
      setPasswordStrength(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoadingReset(false);
    }
  };

  const isShortPassword = newPassword.length > 0 && newPassword.length < 6;

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);
    setPasswordStrength(calcPasswordStrength(value));
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
                <i className="bi bi-key-fill" />
              </div>
              <h3 className="auth-heading fw-bold mb-1">Reset Password</h3>
              <p className="auth-subtext mb-0 auth-form-subtext">
                Answer your security question and create a new password.
              </p>
            </div>

            {error && <Alert variant="danger" className="app-error-alert py-2">{error}</Alert>}
            {success && <Alert variant="success" className="py-2">{success}</Alert>}

            <Form onSubmit={handleEmailSubmit} className="mb-4">
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </Form.Group>

              <Button
                className="w-100 fw-semibold auth-submit-btn"
                type="submit"
                variant="primary"
                disabled={loadingQuestion}
              >
                {loadingQuestion ? 'Loading...' : 'Get Security Question'}
              </Button>
            </Form>

            {question && (
              <Form onSubmit={handleResetSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Security Question</Form.Label>
                  <Form.Control value={question} disabled className="auth-input" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Your Answer</Form.Label>
                  <Form.Control
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="auth-input"
                    required
                    placeholder="Type your answer"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <InputGroup className="auth-input-group">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => handleNewPasswordChange(e.target.value)}
                      className="auth-input"
                      required
                      placeholder="Enter new password"
                      isInvalid={isShortPassword}
                    />

                    <InputGroup.Text
                      className="auth-password-toggle"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <i className="bi bi-eye-slash-fill"></i>
                      ) : (
                        <i className="bi bi-eye-fill"></i>
                      )}
                    </InputGroup.Text>
                  </InputGroup>

                  {isShortPassword && (
                    <Form.Text className="text-danger">
                      Password must be at least 6 characters long.
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

                <Button
                  type="submit"
                  className="w-100 fw-semibold mb-3 auth-submit-btn auth-submit-btn--success"
                  variant="success"
                  disabled={loadingReset}
                >
                  {loadingReset ? 'Resetting...' : 'Reset Password'}
                </Button>

                <div className="auth-compact-actions">
                  <Link to="/login" className="auth-compact-link">Back to Login</Link>
                  <Link to="/signup" className="auth-compact-link">Create New Account</Link>
                  <Link to="/" className="auth-compact-link">Back to Home</Link>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

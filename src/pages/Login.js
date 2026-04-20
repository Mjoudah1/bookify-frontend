// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  InputGroup,
  Row,
  Col,
  Spinner,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  saveToken,
  getUserRole,
  mustChangePassword,
  setHasInterests,
} from '../utils/auth';
import { API_BASE_URL } from '../utils/api';

const backendURL = `${API_BASE_URL}/api/auth/login`;
const REMEMBER_KEY = 'bookifyRememberedEmail';
const SOCIAL_AUTH_URL = `${API_BASE_URL}/api/auth/social`;

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_KEY);
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSocialLogin = (provider) => {
    const params = new URLSearchParams({
      returnTo: window.location.origin,
    });

    window.location.href = `${SOCIAL_AUTH_URL}/${provider}/start?${params.toString()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(backendURL, form);

      if (!res.data?.token) {
        throw new Error('Invalid server response: token missing.');
      }

      saveToken(res.data.token);
      setHasInterests(Boolean(res.data?.user?.hasInterests));

      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, form.email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      const role = getUserRole();
      const needsPasswordChange =
        Boolean(res.data?.user?.mustChangePassword) || mustChangePassword();

      if (needsPasswordChange) {
        navigate('/change-password', {
          replace: true,
          state: {
            forcedMessage:
              'The admin assigned you a temporary password. Change it now to continue using your account.',
          },
        });
        return;
      }

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'staff') {
        navigate('/staff');
      } else if (!res.data?.user?.hasInterests) {
        navigate('/book-of-intrests');
      } else {
        navigate('/user');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Container style={{ maxWidth: '900px' }}>
        <Row className="auth-panel g-0">
          <Col
            md={5}
            className="d-none d-md-flex flex-column justify-content-center text-white p-4"
            style={{ minHeight: '100%' }}
          >
            <div className="auth-brand-pane h-100 d-flex flex-column justify-content-center p-4">
              <div className="auth-brand-pane__inner">
                <div className="mb-4">
                  <h2 className="fw-bold mb-2 auth-brand-title">
                    <span className="auth-brand-title__icon" aria-hidden="true">
                      <i className="bi bi-book-half"></i>
                    </span>
                    Bookify Library
                  </h2>
                  <p className="mb-0 auth-brand-copy">
                    Welcome back! Manage and explore your digital library.
                  </p>
                </div>

                <ul className="list-unstyled small mb-4 auth-feature-list">
                  <li className="auth-feature-item">
                    <span className="auth-feature-item__icon" aria-hidden="true">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    Fast and secure login for all roles.
                  </li>
                  <li className="auth-feature-item">
                    <span className="auth-feature-item__icon" aria-hidden="true">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    Admin and users each have their own dashboard.
                  </li>
                  <li className="auth-feature-item">
                    <span className="auth-feature-item__icon" aria-hidden="true">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    Track your books and ratings easily.
                  </li>
                </ul>

                <div className="mt-auto small auth-brand-footer">
                  <i className="bi bi-shield-lock-fill me-1"></i>
                  Secure authentication powered by Bookify.
                </div>
              </div>
            </div>
          </Col>

          <Col xs={12} md={7}>
            <Card className="auth-form-card border-0 h-100 rounded-0 rounded-end-4">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4 auth-form-head">
                  <h3 className="auth-heading fw-bold mb-1">Welcome back</h3>
                  <p className="auth-subtext mb-0 auth-form-subtext">
                    Log in to access your Bookify account.
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" className="app-error-alert py-2">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      className="auth-input"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Password</Form.Label>
                    <InputGroup className="auth-input-group">
                      <Form.Control
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        className="auth-input"
                        required
                      />

                      <InputGroup.Text
                        onClick={() => setShowPassword(!showPassword)}
                        className="auth-password-toggle"
                        style={{ cursor: 'pointer' }}
                      >
                        {showPassword ? (
                          <i className="bi bi-eye-slash-fill"></i>
                        ) : (
                          <i className="bi bi-eye-fill"></i>
                        )}
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3 auth-form-meta">
                    <div className="d-flex align-items-center">
                      <Form.Check
                        type="checkbox"
                        id="rememberMe"
                        className="me-2 auth-remember-check"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        label={<span className="small">Remember my email</span>}
                      />
                    </div>

                    <Link
                      to="/forgot-password"
                      className="small text-decoration-none auth-forgot-link"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  <small className="text-muted d-block mb-3 auth-security-note">
                    <i className="bi bi-shield-lock me-1"></i>
                    Your credentials are encrypted and safely stored.
                  </small>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 fw-semibold auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>

                  <div className="text-center my-3 small text-muted">
                    or continue with
                  </div>

                  <div className="d-grid gap-2">
                    <Button
                      type="button"
                      variant="light"
                      className="w-100 py-2 fw-semibold border auth-secondary-btn"
                      onClick={() => handleSocialLogin('google')}
                    >
                      <i className="bi bi-google me-2" />
                      Continue with Google
                    </Button>
                  </div>

                  <div className="text-center mt-3 small text-muted auth-create-row">
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="text-primary text-decoration-none auth-create-link"
                    >
                      Create one
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

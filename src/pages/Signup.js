// frontend/src/pages/Signup.js
import React, { useState } from 'react';
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
import { saveToken, getUserRole, setHasInterests } from '../utils/auth';
import { API_BASE_URL } from '../utils/api';

const SIGNUP_URL = `${API_BASE_URL}/api/auth/signup`;
const LOGIN_URL = `${API_BASE_URL}/api/auth/login`;
const SOCIAL_AUTH_URL = `${API_BASE_URL}/api/auth/social`;

export default function Signup() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }

    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSocialSignup = (provider) => {
    const params = new URLSearchParams({
      returnTo: window.location.origin,
    });

    window.location.href = `${SOCIAL_AUTH_URL}/${provider}/start?${params.toString()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please make sure both passwords are the same.');
      return;
    }

    if (!form.securityQuestion || !form.securityAnswer.trim()) {
      setError('Please choose a security question and provide an answer.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        securityQuestion: form.securityQuestion,
        securityAnswer: form.securityAnswer.trim(),
      };

      await axios.post(SIGNUP_URL, payload);

      try {
        const loginRes = await axios.post(LOGIN_URL, {
          email: form.email.trim(),
          password: form.password,
        });

        if (!loginRes.data?.token) {
          throw new Error('Token missing from login response.');
        }

        saveToken(loginRes.data.token);
        setHasInterests(Boolean(loginRes.data?.user?.hasInterests));
        const role = getUserRole();

        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'staff') {
          navigate('/staff');
        } else {
          navigate('/user');
        }
      } catch (loginErr) {
        console.error('Auto login error:', loginErr);
        setSuccess('Account created successfully! Please log in.');
      }

      setForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        securityQuestion: '',
        securityAnswer: '',
      });
      setPasswordStrength(0);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsDontMatch =
    form.password.length > 0 &&
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword;

  const isShortPassword =
    form.password.length > 0 && form.password.length < 6;

  const disableSubmit = loading || isShortPassword || passwordsDontMatch;

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
    passwordStrength === 0 && form.password.length === 0
      ? 'Type a password to see its strength.'
      : passwordStrength === 1
      ? 'Weak'
      : passwordStrength === 2
      ? 'Medium'
      : passwordStrength === 3
      ? 'Strong'
      : passwordStrength === 4
      ? 'Very Strong'
      : 'Excellent';

  return (
    <div className="auth-shell">
      <Container style={{ maxWidth: '950px' }}>
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
                    Organize, borrow, and explore your library in one modern system.
                  </p>
                </div>

                <ul className="list-unstyled small mb-4 auth-feature-list">
                  <li className="auth-feature-item">
                    <span className="auth-feature-item__icon" aria-hidden="true">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    Secure accounts with security questions.
                  </li>
                  <li className="auth-feature-item">
                    <span className="auth-feature-item__icon" aria-hidden="true">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    Smart rating and views system for books.
                  </li>
                  <li className="auth-feature-item">
                    <span className="auth-feature-item__icon" aria-hidden="true">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                    Easy buying and subscription process.
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
                  <h3 className="auth-heading fw-bold mb-1">Create your account</h3>
                  <p className="auth-subtext mb-0 auth-form-subtext">
                    Join Bookify and start managing your books easily.
                  </p>
                </div>

                {error && <Alert variant="danger" className="app-error-alert py-2">{error}</Alert>}
                {success && <Alert variant="success" className="py-2">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      placeholder="Enter username"
                      value={form.username}
                      onChange={handleChange}
                      className="auth-input"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={form.email}
                      onChange={handleChange}
                      className="auth-input"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <InputGroup className="auth-input-group">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter password"
                        value={form.password}
                        onChange={handleChange}
                        className="auth-input"
                        required
                        isInvalid={isShortPassword}
                      />
                      <InputGroup.Text
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowPassword(!showPassword)}
                        className="auth-password-toggle"
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

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="auth-input"
                      isInvalid={passwordsDontMatch}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Passwords do not match.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Security Question</Form.Label>
                    <Form.Select
                      name="securityQuestion"
                      value={form.securityQuestion}
                      onChange={handleChange}
                      className="auth-input"
                      required
                    >
                      <option value="">Choose a question...</option>
                      <option value="What is your favorite color?">
                        What is your favorite color?
                      </option>
                      <option value="What is your pet's name?">
                        What is your pet&apos;s name?
                      </option>
                      <option value="What city were you born in?">
                        What city were you born in?
                      </option>
                      <option value="What was your childhood nickname?">
                        What was your childhood nickname?
                      </option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Security Answer</Form.Label>
                    <Form.Control
                      type="text"
                      name="securityAnswer"
                      placeholder="Your answer"
                      value={form.securityAnswer}
                      onChange={handleChange}
                      className="auth-input"
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2 fw-semibold auth-submit-btn"
                    disabled={disableSubmit}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Creating account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </Button>

                  <div className="text-center my-3 small text-muted">
                    or create your account with
                  </div>

                  <div className="d-grid gap-2">
                    <Button
                      type="button"
                      variant="light"
                      className="w-100 py-2 fw-semibold border auth-secondary-btn"
                      onClick={() => handleSocialSignup('google')}
                    >
                      <i className="bi bi-google me-2" />
                      Continue with Google
                    </Button>
                  </div>

                  <div className="text-center mt-3 small text-muted auth-create-row">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-primary text-decoration-none auth-create-link"
                    >
                      Log in
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

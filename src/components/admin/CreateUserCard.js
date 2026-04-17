import React from 'react';
import { Card, Row, Col, Form, Button, Alert, Dropdown } from 'react-bootstrap';

const SECURITY_QUESTIONS = [
  'What is your favorite color?',
  "What is your pet's name?",
  'What city were you born in?',
  'What was your childhood nickname?',
];

export default function CreateUserCard({
  createForm,
  setCreateForm,
  createLoading,
  createError,
  createSuccess,
  handleCreateUser,
}) {
  return (
    <Card className="admin-create-user-card border-0 mb-4">
      <Card.Body className="p-4">
        <div className="admin-create-user-card__header">
          <span className="admin-create-user-card__icon" aria-hidden="true">
            <i className="bi bi-person-plus-fill" />
          </span>
          <div>
            <div className="admin-create-user-card__eyebrow">User management</div>
            <h5 className="mb-1 fw-bold">Create New User</h5>
            <p className="mb-0 admin-create-user-card__text">
              Add a new user or admin account with login and recovery details.
            </p>
          </div>
        </div>

        {createError && (
          <Alert variant="danger" className="admin-create-user-card__alert admin-form-alert app-error-alert is-danger mt-3 mb-0">
            <div className="admin-create-user-card__alert-copy">
              <div className="admin-create-user-card__alert-title is-danger">
                Please complete the missing details
              </div>
              <div className="admin-create-user-card__alert-text is-danger">
                {createError}
              </div>
            </div>
          </Alert>
        )}

        {createSuccess && (
          <Alert variant="success" className="admin-create-user-card__alert is-success mt-3 mb-0">
            <span className="admin-create-user-card__alert-icon" aria-hidden="true">
              <i className="bi bi-check2-circle" />
            </span>
            <div className="admin-create-user-card__alert-copy">
              <div className="admin-create-user-card__alert-title">
                User created successfully
              </div>
              <div className="admin-create-user-card__alert-text">
                The password is temporary until the user changes it.
              </div>
            </div>
          </Alert>
        )}

        <Form className="mt-4" onSubmit={handleCreateUser}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Username</Form.Label>
                <Form.Control
                  className="admin-input"
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Enter username"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  className="admin-input"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Enter email"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  className="admin-input"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Enter password"
                  required
                />
                <Form.Text className="text-muted">
                  This password will be temporary until the user changes it after first login.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Role</Form.Label>
                <Dropdown className="glass-filter-dropdown admin-create-user-role-dropdown">
                  <Dropdown.Toggle
                    variant="link"
                    className="glass-filter-toggle admin-create-user-role-toggle"
                  >
                    <span className="glass-filter-label">
                      {createForm.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="glass-filter-menu admin-create-user-role-menu w-100">
                    <Dropdown.Item
                      active={createForm.role === 'user'}
                      onClick={() =>
                        setCreateForm((prev) => ({
                          ...prev,
                          role: 'user',
                        }))
                      }
                    >
                      User
                    </Dropdown.Item>
                    <Dropdown.Item
                      active={createForm.role === 'admin'}
                      onClick={() =>
                        setCreateForm((prev) => ({
                          ...prev,
                          role: 'admin',
                        }))
                      }
                    >
                      Admin
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Security Question</Form.Label>
                <Dropdown className="glass-filter-dropdown admin-create-user-question-dropdown">
                  <Dropdown.Toggle
                    variant="link"
                    className="glass-filter-toggle admin-create-user-question-toggle"
                  >
                    <span className="glass-filter-label">
                      {createForm.securityQuestion || 'Choose a question'}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="glass-filter-menu admin-create-user-question-menu w-100">
                    <Dropdown.Item
                      active={!createForm.securityQuestion}
                      onClick={() =>
                        setCreateForm((prev) => ({
                          ...prev,
                          securityQuestion: '',
                        }))
                      }
                    >
                      Choose a question
                    </Dropdown.Item>
                    {SECURITY_QUESTIONS.map((question) => (
                      <Dropdown.Item
                        key={question}
                        active={createForm.securityQuestion === question}
                        onClick={() =>
                          setCreateForm((prev) => ({
                            ...prev,
                            securityQuestion: question,
                          }))
                        }
                      >
                        {question}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Security Answer</Form.Label>
                <Form.Control
                  className="admin-input"
                  value={createForm.securityAnswer}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      securityAnswer: e.target.value,
                    }))
                  }
                  placeholder="Enter security answer"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button
              type="submit"
              className="admin-create-user-card__submit"
              disabled={createLoading}
            >
              <i className="bi bi-person-plus-fill" aria-hidden="true" />
              {createLoading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Alert,
  Button,
} from 'react-bootstrap';

export default function SendNotificationCard({
  notifTarget,
  setNotifTarget,
  notifTitle,
  setNotifTitle,
  notifMessage,
  setNotifMessage,
  notifLoading,
  notifError,
  notifSuccess,
  handleSendNotification,
  users,
}) {
  const [recipientMenuOpen, setRecipientMenuOpen] = useState(false);
  const recipientDropdownRef = useRef(null);
  const isBroadcast = notifTarget === 'broadcast';
  const selectedUser = users.find((user) => user._id === notifTarget);
  const recipientLabel =
    notifTarget === 'broadcast'
      ? 'Broadcast to all users'
      : selectedUser
      ? `${selectedUser.username} (${selectedUser.email})`
      : 'Choose recipient';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        recipientDropdownRef.current &&
        !recipientDropdownRef.current.contains(event.target)
      ) {
        setRecipientMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRecipientSelect = (value) => {
    setNotifTarget(value);
    setRecipientMenuOpen(false);
  };

  return (
    <Row className="mb-4">
      <Col>
        <Card className="admin-panel-card admin-panel-highlight admin-notification-card shadow-sm border-0">
          <Card.Body className="p-4">
            <div className="admin-section-head d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <div className="admin-kicker">Communication Center</div>
                <h5 className="mb-1 fw-bold d-flex align-items-center gap-2">
                  <span className="admin-icon-pill">{'\uD83D\uDCE2'}</span>
                  Send Notification
                </h5>
                <small className="text-muted">
                  Choose a user from the list or send a broadcast to all users.
                </small>
              </div>
              <div className="admin-meta-chip">
                {isBroadcast ? 'Broadcast mode' : 'Private message'}
              </div>
            </div>

            <Form onSubmit={handleSendNotification}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group className="h-100">
                    <Form.Label>Recipient</Form.Label>
                    <div
                      ref={recipientDropdownRef}
                      className={`glass-filter-dropdown admin-recipient-dropdown ${
                        recipientMenuOpen ? 'is-open' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className="glass-filter-toggle admin-recipient-toggle btn btn-link"
                        onClick={() => setRecipientMenuOpen((prev) => !prev)}
                        aria-expanded={recipientMenuOpen}
                      >
                        <span className="glass-filter-label">
                          {recipientLabel}
                        </span>
                      </button>

                      <div
                        className={`glass-filter-menu admin-recipient-menu dropdown-menu w-100 ${
                          recipientMenuOpen ? 'show' : ''
                        }`}
                      >
                        <button
                          type="button"
                          className={`dropdown-item ${!notifTarget ? 'active' : ''}`}
                          onClick={() => handleRecipientSelect('')}
                        >
                          Choose recipient
                        </button>
                        <button
                          type="button"
                          className={`dropdown-item ${
                            notifTarget === 'broadcast' ? 'active' : ''
                          }`}
                          onClick={() => handleRecipientSelect('broadcast')}
                        >
                          Broadcast to all users
                        </button>
                        <div className="dropdown-divider" />
                        {users
                          .filter((user) => user.role === 'user')
                          .map((user) => (
                            <button
                              type="button"
                              key={user._id}
                              className={`dropdown-item ${
                                notifTarget === user._id ? 'active' : ''
                              }`}
                              onClick={() => handleRecipientSelect(user._id)}
                            >
                              {user.username} ({user.email})
                            </button>
                          ))}
                      </div>
                    </div>
                    <Form.Text className="text-muted">
                      {isBroadcast
                        ? 'This message will be sent to every active normal user.'
                        : 'Select one user to send a private notification.'}
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="h-100">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Notification title"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="admin-input"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="h-100">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Write your message"
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      className="admin-input"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-3">
                {notifError && (
                  <Alert
                    variant="danger"
                    className="admin-create-user-card__alert admin-notification-alert app-error-alert is-danger"
                  >
                    <div className="admin-create-user-card__alert-copy">
                      <div className="admin-create-user-card__alert-title is-danger">
                        Choose who should receive this
                      </div>
                      <div className="admin-create-user-card__alert-text is-danger">
                        {notifError}
                      </div>
                    </div>
                  </Alert>
                )}
                {notifSuccess && (
                  <Alert
                    variant="success"
                    className="admin-create-user-card__alert admin-notification-alert is-success"
                  >
                    <span className="admin-create-user-card__alert-icon" aria-hidden="true">
                      <i className="bi bi-check2-circle" />
                    </span>
                    <div className="admin-create-user-card__alert-copy">
                      <div className="admin-create-user-card__alert-title">
                        Notification sent successfully
                      </div>
                      <div className="admin-create-user-card__alert-text">
                        Your message has been delivered to the selected recipient.
                      </div>
                    </div>
                  </Alert>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={notifLoading}
                className="mt-2 px-4"
              >
                {notifLoading
                  ? 'Sending...'
                  : isBroadcast
                  ? 'Send Broadcast'
                  : 'Send Notification'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

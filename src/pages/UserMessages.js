import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../utils/api';

const formatMessageTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const getUserReceiptText = (message) => {
  if (message.senderRole !== 'user') return '';
  if (message.readByAdminAt) {
    return `Read by ${message.readByAdminName || 'Admin'} • ${formatMessageTime(message.readByAdminAt)}`;
  }
  return 'Sent';
};

export default function UserMessages() {
  const [thread, setThread] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState('');
  const [pendingDeleteMessageId, setPendingDeleteMessageId] = useState('');
  const [error, setError] = useState('');

  const token = getToken();
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    });
  };

  const loadThread = async (withLoader = false) => {
    try {
      if (withLoader) {
        setLoading(true);
      }
      setError('');

      const res = await fetch(`${API_BASE_URL}/api/messages/thread`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load your messages.');
      }

      setThread(data.thread || null);
    } catch (err) {
      setError(err.message || 'Failed to load your messages.');
    } finally {
      if (withLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!token) return;

    loadThread(true);
    const interval = setInterval(() => loadThread(false), 10000);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (thread?.messages?.length) {
      scrollToBottom();
    }
  }, [thread?.messages?.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const message = draft.trim();
    if (!message) return;

    try {
      setSending(true);
      setError('');

      const res = await fetch(`${API_BASE_URL}/api/messages/thread`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send your message.');
      }

      setThread(data.thread || null);
      setDraft('');
      scrollToBottom();
    } catch (err) {
      setError(err.message || 'Failed to send your message.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;

    try {
      setDeletingMessageId(messageId);
      setError('');

      const res = await fetch(
        `${API_BASE_URL}/api/messages/thread/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete message.');
      }

      setThread(data.thread || null);
    } catch (err) {
      setError(err.message || 'Failed to delete message.');
    } finally {
      setDeletingMessageId('');
    }
  };

  const askDeleteMessage = (messageId) => {
    if (!messageId) return;
    setPendingDeleteMessageId(messageId);
  };

  const closeDeleteConfirm = () => {
    if (deletingMessageId) return;
    setPendingDeleteMessageId('');
  };

  const confirmDeleteMessage = async () => {
    const messageId = pendingDeleteMessageId;
    if (!messageId) return;

    await handleDeleteMessage(messageId);
    setPendingDeleteMessageId('');
  };

  const messages = Array.isArray(thread?.messages) ? thread.messages : [];
  const openSinceLabel = thread?.createdAt
    ? new Date(thread.createdAt).toLocaleDateString()
    : 'Not started yet';
  const lastMessage = messages[messages.length - 1] || null;
  const threadStatusLabel = messages.length
    ? 'Conversation active'
    : 'Ready to start';

  return (
    <div className="support-page-shell">
      <Container className="py-4">
        <Card className="support-shell-card border-0 shadow-sm">
          <Card.Body className="p-4 p-md-5">
            <div className="support-page-header mb-4">
              <div className="support-page-header-main">
                <div className="support-page-title-row">
                  <span className="support-page-title-icon" aria-hidden="true">
                    <i className="bi bi-headset" />
                  </span>
                  <div>
                    <div className="support-page-kicker">User Support</div>
                    <h2 className="support-page-title mb-1">Messages</h2>
                  </div>
                </div>
                <p className="support-page-text mb-0">
                  Send a message to the admin and continue the conversation
                  here whenever you need help.
                </p>
                <div className="support-page-quick-chips">
                  <span className="support-page-quick-chip">
                    <i className="bi bi-shield-check" aria-hidden="true" />
                    Secure direct channel
                  </span>
                  <span className="support-page-quick-chip">
                    <i className="bi bi-reply-fill" aria-hidden="true" />
                    Admin replies here
                  </span>
                </div>
              </div>

              <div className="support-page-badges">
                <span className="support-page-counter">
                  {messages.length} message{messages.length === 1 ? '' : 's'}
                </span>
                <span className="support-page-counter is-soft">
                  Open since {openSinceLabel}
                </span>
              </div>
            </div>

            {error && <Alert variant="danger" className="app-error-alert">{error}</Alert>}

            {loading ? (
              <div className="support-loading-state">
                <Spinner animation="border" />
              </div>
            ) : (
              <Row className="g-4">
                <Col lg={5}>
                  <Card className="support-list-card border-0 h-100">
                    <Card.Body className="p-3">
                      <div className="support-list-header mb-3">
                        <div>
                          <div className="support-list-title">Conversation</div>
                          <div className="support-list-subtitle">
                            Your direct support thread with the admin team.
                          </div>
                        </div>
                        <span className="support-list-pill">
                          {messages.length} total
                        </span>
                      </div>

                      {messages.length === 0 ? (
                        <div className="support-empty-mini support-empty-mini--panel">
                          <div className="support-empty-icon support-empty-icon--mini">
                            <i className="bi bi-chat-dots" />
                          </div>
                          <div className="support-empty-mini__title">
                            No messages yet
                          </div>
                          <div className="support-empty-mini__text">
                            Start the conversation and the admin will reply here.
                          </div>
                        </div>
                      ) : (
                        <div
                          className="support-thread-item is-active"
                          role="status"
                          aria-live="polite"
                        >
                          <div className="support-thread-top">
                            <div className="support-thread-name">Admin support</div>
                            <span className="support-thread-unread support-thread-unread--soft">
                              {messages.length}
                            </span>
                          </div>
                          <div className="support-thread-email">
                            Secure one-on-one conversation
                          </div>
                          <div className="support-thread-preview">
                            {lastMessage?.body || 'No messages yet'}
                          </div>
                          <div className="support-thread-footer">
                            <span className="support-thread-time">
                              {formatMessageTime(
                                lastMessage?.createdAt || thread?.createdAt
                              )}
                            </span>
                            <span className="support-thread-status">
                              {threadStatusLabel}
                            </span>
                          </div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={7}>
                  <Card className="support-conversation-card border-0 h-100">
                    <Card.Body className="p-3 p-md-4">
                      <div className="support-conversation-header">
                        <div>
                          <h5 className="mb-1">Admin support</h5>
                          <div className="support-page-text">
                            Continue your direct conversation here anytime.
                          </div>
                        </div>
                      </div>

                      <div className="support-chat-window admin-chat-window">
                        {messages.length === 0 ? (
                          <div className="support-empty-state support-empty-state-compact">
                            <div className="support-empty-icon">
                              <i className="bi bi-chat-dots"></i>
                            </div>
                            <div className="support-empty-state__eyebrow">
                              Ready to start
                            </div>
                            <h5 className="fw-bold mb-2">No messages yet</h5>
                            <p className="text-muted mb-0 support-empty-state__text">
                              Write your first message and the admin will be able to
                              reply here.
                            </p>
                            <div className="support-empty-state__status">
                              <i className="bi bi-send-check" aria-hidden="true" />
                              Direct channel ready
                            </div>
                          </div>
                        ) : (
                          messages.map((message) => (
                            <div
                              key={message._id}
                              className={`support-message-row ${
                                message.senderRole === 'user'
                                  ? 'is-user'
                                  : 'is-admin'
                              }`}
                            >
                              <div className="support-message-bubble">
                                <div className="support-message-meta">
                                  <div className="support-message-meta-main">
                                    <span className="support-message-author">
                                      {message.senderRole === 'user'
                                        ? 'You'
                                        : message.senderName || 'Admin'}
                                    </span>
                                    <span className="support-message-time">
                                      {formatMessageTime(message.createdAt)}
                                    </span>
                                  </div>
                                  {message.senderRole === 'user' && (
                                    <button
                                      type="button"
                                      className="support-message-delete"
                                      onClick={() => askDeleteMessage(message._id)}
                                      disabled={deletingMessageId === message._id}
                                    >
                                      {deletingMessageId === message._id
                                        ? 'Deleting...'
                                        : 'Delete'}
                                    </button>
                                  )}
                                </div>
                                <div className="support-message-body">
                                  {message.body}
                                </div>
                                {message.senderRole === 'user' && (
                                  <div className="support-message-read-receipt">
                                    <i className="bi bi-check2-all me-1"></i>
                                    {getUserReceiptText(message)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={bottomRef} />
                      </div>

                      <Card className="support-compose-card border-0 mt-4">
                        <Card.Body className="p-3 p-md-4">
                          <div className="support-compose-head mb-3">
                            <div>
                              <div className="support-list-title mb-1">Message</div>
                              <div className="support-list-subtitle">
                                Send a direct note to the admin team.
                              </div>
                            </div>
                            <span className="support-list-pill">Direct chat</span>
                          </div>
                          <Form onSubmit={handleSendMessage}>
                            <Form.Group className="mb-3">
                              <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Write your message to the admin..."
                                className="support-compose-textarea"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                              />
                            </Form.Group>

                            <div className="d-flex justify-content-end">
                              <Button
                                type="submit"
                                variant="primary"
                                className="support-send-btn"
                                disabled={sending || !draft.trim()}
                              >
                                <i className="bi bi-send-fill me-1" />
                                {sending ? 'Sending...' : 'Send Message'}
                              </Button>
                            </div>
                          </Form>
                        </Card.Body>
                      </Card>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>
      </Container>

      <Modal
        show={Boolean(pendingDeleteMessageId)}
        onHide={closeDeleteConfirm}
        centered
        dialogClassName="confirm-modal-dialog"
        contentClassName="confirm-modal"
      >
        <>
          <Modal.Header closeButton className="confirm-modal__header">
            <Modal.Title className="confirm-modal__title">
              Delete message
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="confirm-modal__body">
            Remove this message from the conversation?
          </Modal.Body>
          <Modal.Footer className="confirm-modal__footer">
            <Button
              type="button"
              variant="light"
              className="confirm-modal__cancel"
              onClick={closeDeleteConfirm}
              disabled={Boolean(deletingMessageId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="confirm-modal__confirm"
              onClick={confirmDeleteMessage}
              disabled={Boolean(deletingMessageId)}
            >
              {deletingMessageId ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </>
      </Modal>
    </div>
  );
}

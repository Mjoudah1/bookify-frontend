import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useSearchParams } from 'react-router-dom';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../utils/api';

const formatMessageTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const getAdminReceiptText = (message, fallbackName = 'User') => {
  if (message.senderRole !== 'admin') return '';
  if (message.readByUserAt) {
    return `Read by ${message.readByUserName || fallbackName} • ${formatMessageTime(message.readByUserAt)}`;
  }
  return 'Sent';
};

const sortThreads = (threads) =>
  [...threads].sort((a, b) => {
    const aTime = new Date(a.lastMessageAt || a.updatedAt || 0).getTime();
    const bTime = new Date(b.lastMessageAt || b.updatedAt || 0).getTime();
    return bTime - aTime;
  });

export default function AdminMessages() {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState('');
  const [reply, setReply] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState('');
  const [deletingThreadId, setDeletingThreadId] = useState('');
  const [pendingDeleteThreadId, setPendingDeleteThreadId] = useState('');
  const [pendingDeleteReplyId, setPendingDeleteReplyId] = useState('');
  const [error, setError] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const token = getToken();
  const bottomRef = useRef(null);

  const requestedThreadId = searchParams.get('thread') || '';

  const syncThreadInList = (thread) => {
    if (!thread?._id) return;

    setThreads((prev) => {
      const next = prev.some((item) => item._id === thread._id)
        ? prev.map((item) => (item._id === thread._id ? thread : item))
        : [thread, ...prev];

      return sortThreads(next);
    });
  };

  const loadThreads = async (withLoader = false) => {
    try {
      if (withLoader) {
        setLoadingThreads(true);
      }

      const res = await fetch(`${API_BASE_URL}/api/messages/admin/threads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load inbox.');
      }

      const safeThreads = Array.isArray(data) ? sortThreads(data) : [];
      setThreads(safeThreads);

      if (!selectedThreadId) {
        const nextThreadId = requestedThreadId || safeThreads[0]?._id || '';
        if (nextThreadId) {
          setSelectedThreadId(nextThreadId);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load inbox.');
    } finally {
      if (withLoader) {
        setLoadingThreads(false);
      }
    }
  };

  const loadThreadDetails = async (threadId, withLoader = true) => {
    if (!threadId) {
      setActiveThread(null);
      return;
    }

    try {
      if (withLoader) {
        setLoadingThread(true);
      }
      setError('');

      const res = await fetch(
        `${API_BASE_URL}/api/messages/admin/threads/${threadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load conversation.');
      }

      setActiveThread(data.thread || null);
      syncThreadInList(data.thread);
    } catch (err) {
      setError(err.message || 'Failed to load conversation.');
    } finally {
      if (withLoader) {
        setLoadingThread(false);
      }
    }
  };

  useEffect(() => {
    if (!token) return;

    loadThreads(true);
    const interval = setInterval(() => loadThreads(false), 10000);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token || !selectedThreadId) return;

    const interval = setInterval(
      () => loadThreadDetails(selectedThreadId, false),
      10000
    );

    return () => clearInterval(interval);
  }, [token, selectedThreadId]);

  useEffect(() => {
    if (requestedThreadId && requestedThreadId !== selectedThreadId) {
      setSelectedThreadId(requestedThreadId);
    }
  }, [requestedThreadId, selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId && threads.length > 0) {
      setSelectedThreadId(requestedThreadId || threads[0]._id);
      return;
    }

    if (selectedThreadId) {
      loadThreadDetails(selectedThreadId, true);
    }
  }, [selectedThreadId]);

  useEffect(() => {
    if (activeThread?.messages?.length) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      });
    }
  }, [activeThread?.messages?.length]);

  const handleSelectThread = (threadId) => {
    setSelectedThreadId(threadId);
    setSearchParams({ thread: threadId });
  };

  const handleReply = async (e) => {
    e.preventDefault();

    const message = reply.trim();
    if (!message || !selectedThreadId) return;

    try {
      setSending(true);
      setError('');

      const res = await fetch(
        `${API_BASE_URL}/api/messages/admin/threads/${selectedThreadId}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reply.');
      }

      setReply('');
      setActiveThread(data.thread || null);
      syncThreadInList(data.thread);
    } catch (err) {
      setError(err.message || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!threadId) return;

    try {
      setDeletingThreadId(threadId);
      setError('');

      const res = await fetch(
        `${API_BASE_URL}/api/messages/admin/threads/${threadId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete conversation.');
      }

      const nextThreads = threads.filter((thread) => thread._id !== threadId);
      setThreads(nextThreads);

      if (selectedThreadId === threadId) {
        const nextActiveId = nextThreads[0]?._id || '';
        setSelectedThreadId(nextActiveId);
        setActiveThread(null);

        if (nextActiveId) {
          setSearchParams({ thread: nextActiveId });
        } else {
          setSearchParams({});
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to delete conversation.');
    } finally {
      setDeletingThreadId('');
    }
  };

  const handleDeleteReply = async (messageId) => {
    if (!messageId || !selectedThreadId) return;

    try {
      setDeletingMessageId(messageId);
      setError('');

      const res = await fetch(
        `${API_BASE_URL}/api/messages/admin/threads/${selectedThreadId}/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete reply.');
      }

      setActiveThread(data.thread || null);
      syncThreadInList(data.thread);
    } catch (err) {
      setError(err.message || 'Failed to delete reply.');
    } finally {
      setDeletingMessageId('');
    }
  };

  const askDeleteThread = (threadId) => {
    if (!threadId) return;
    setPendingDeleteThreadId(threadId);
  };

  const closeDeleteThreadConfirm = () => {
    if (deletingThreadId) return;
    setPendingDeleteThreadId('');
  };

  const confirmDeleteThread = async () => {
    const threadId = pendingDeleteThreadId;
    if (!threadId) return;

    await handleDeleteThread(threadId);
    setPendingDeleteThreadId('');
  };

  const askDeleteReply = (messageId) => {
    if (!messageId) return;
    setPendingDeleteReplyId(messageId);
  };

  const closeDeleteReplyConfirm = () => {
    if (deletingMessageId) return;
    setPendingDeleteReplyId('');
  };

  const confirmDeleteReply = async () => {
    const messageId = pendingDeleteReplyId;
    if (!messageId) return;

    await handleDeleteReply(messageId);
    setPendingDeleteReplyId('');
  };

  const unreadTotal = useMemo(
    () =>
      threads.reduce(
        (total, thread) => total + (Number(thread.unreadForAdmin) || 0),
        0
      ),
    [threads]
  );

  return (
    <div className="support-page-shell">
      <Container className="py-4">
        <Card className="support-shell-card border-0 shadow-sm">
          <Card.Body className="p-4 p-md-5">
            <div className="support-page-header mb-4">
              <div className="support-page-header-main">
                <div className="support-page-title-row">
                  <span className="support-page-title-icon" aria-hidden="true">
                    <i className="bi bi-chat-left-text-fill" />
                  </span>
                  <div>
                    <div className="support-page-kicker">Admin Support Inbox</div>
                    <h2 className="support-page-title mb-1">User Messages</h2>
                  </div>
                </div>
                <p className="support-page-text mb-0">
                  Review incoming user messages, open a conversation, and reply
                  directly from here.
                </p>
                <div className="support-page-quick-chips">
                  <span className="support-page-quick-chip">
                    <i className="bi bi-inboxes-fill" aria-hidden="true" />
                    Support inbox
                  </span>
                  <span className="support-page-quick-chip">
                    <i className="bi bi-person-lines-fill" aria-hidden="true" />
                    Direct replies
                  </span>
                </div>
              </div>

              <div className="support-page-badges">
                <Badge bg="primary" pill>
                  {threads.length} thread{threads.length === 1 ? '' : 's'}
                </Badge>
                <Badge bg={unreadTotal > 0 ? 'warning' : 'light'} text="dark" pill>
                  {unreadTotal} unread
                </Badge>
              </div>
            </div>

            {error && <Alert variant="danger" className="app-error-alert">{error}</Alert>}

            <Row className="g-4">
              <Col lg={4}>
                <Card className="support-list-card border-0 h-100">
                  <Card.Body className="p-3">
                    <div className="support-list-header mb-3">
                      <div>
                        <div className="support-list-title">Conversations</div>
                        <div className="support-list-subtitle">
                          Recent user threads and unread activity.
                        </div>
                      </div>
                      <span className="support-list-pill">
                        {threads.length} total
                      </span>
                    </div>

                    {loadingThreads ? (
                      <div className="support-loading-state py-4">
                        <Spinner animation="border" />
                      </div>
                    ) : threads.length === 0 ? (
                      <div className="support-empty-mini support-empty-mini--panel">
                        <div className="support-empty-icon support-empty-icon--mini">
                          <i className="bi bi-inbox" />
                        </div>
                        <div className="support-empty-mini__title">
                          No user messages yet
                        </div>
                        <div className="support-empty-mini__text">
                          New threads will appear here as soon as users contact support.
                        </div>
                      </div>
                    ) : (
                      <div className="support-thread-list">
                        {threads.map((thread) => {
                          const isActive = thread._id === selectedThreadId;
                          const userLabel =
                            thread.userId?.username ||
                            thread.userId?.email ||
                            'User';

                          return (
                            <div
                              key={thread._id}
                              className={`support-thread-item ${
                                isActive ? 'is-active' : ''
                              }`}
                              onClick={() => handleSelectThread(thread._id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleSelectThread(thread._id);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              <button
                                type="button"
                                className="support-thread-remove"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  askDeleteThread(thread._id);
                                }}
                                disabled={deletingThreadId === thread._id}
                                aria-label="Remove conversation"
                              >
                                {deletingThreadId === thread._id ? '...' : '×'}
                              </button>
                              <div className="support-thread-top">
                                <div className="support-thread-name">
                                  {userLabel}
                                </div>
                                {thread.unreadForAdmin > 0 && (
                                  <span className="support-thread-unread">
                                    {thread.unreadForAdmin}
                                  </span>
                                )}
                              </div>
                              <div className="support-thread-email">
                                {thread.userId?.email || 'No email'}
                              </div>
                              <div className="support-thread-preview">
                                {thread.lastMessage?.body || 'No messages yet'}
                              </div>
                              <div className="support-thread-footer">
                                <span className="support-thread-time">
                                  {formatMessageTime(thread.lastMessageAt)}
                                </span>
                                <span className="support-thread-status">
                                  {thread.status === 'waiting_for_admin'
                                    ? 'Waiting for admin'
                                    : thread.status === 'waiting_for_user'
                                    ? 'Waiting for user'
                                    : 'Open'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={8}>
                <Card className="support-conversation-card border-0 h-100">
                  <Card.Body className="p-3 p-md-4">
                    {!selectedThreadId ? (
                      <div className="support-empty-state support-empty-state-compact">
                        <div className="support-empty-icon">
                          <i className="bi bi-chat-square-text"></i>
                        </div>
                        <div className="support-empty-state__eyebrow">
                          Waiting for a thread
                        </div>
                        <h5 className="fw-bold mb-2">No conversation selected</h5>
                        <p className="text-muted mb-0 support-empty-state__text">
                          Choose a user thread from the left to view its
                          messages.
                        </p>
                        <div className="support-empty-state__status">
                          <i className="bi bi-stars" aria-hidden="true" />
                          Inbox ready
                        </div>
                      </div>
                    ) : loadingThread ? (
                      <div className="support-loading-state">
                        <Spinner animation="border" />
                      </div>
                    ) : !activeThread ? (
                      <div className="support-empty-mini support-empty-mini--panel">
                        <div className="support-empty-icon support-empty-icon--mini">
                          <i className="bi bi-exclamation-circle" />
                        </div>
                        <div className="support-empty-mini__title">
                          Conversation unavailable
                        </div>
                        <div className="support-empty-mini__text">
                          This conversation could not be loaded right now.
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="support-conversation-header">
                          <div>
                            <h5 className="mb-1">
                              {activeThread.userId?.username ||
                                activeThread.userId?.email ||
                                'User'}
                            </h5>
                            <div className="support-page-text">
                              {activeThread.userId?.email}
                            </div>
                          </div>
                          <Badge bg="light" text="dark" pill>
                            {activeThread.messages?.length || 0} messages
                          </Badge>
                        </div>

                        <div className="support-chat-window admin-chat-window">
                          {(activeThread.messages || []).map((message) => (
                            <div
                              key={message._id}
                              className={`support-message-row ${
                                message.senderRole === 'admin'
                                  ? 'is-user'
                                  : 'is-admin'
                              }`}
                            >
                              <div className="support-message-bubble">
                                <div className="support-message-meta">
                                  <div className="support-message-meta-main">
                                    <span className="support-message-author">
                                      {message.senderRole === 'admin'
                                        ? 'You'
                                        : message.senderName || 'User'}
                                    </span>
                                    <span className="support-message-time">
                                      {formatMessageTime(message.createdAt)}
                                    </span>
                                  </div>
                                  {message.senderRole === 'admin' && (
                                    <button
                                      type="button"
                                      className="support-message-delete"
                                      onClick={() => askDeleteReply(message._id)}
                                      disabled={
                                        deletingMessageId === message._id
                                      }
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
                                {message.senderRole === 'admin' && (
                                  <div className="support-message-read-receipt">
                                    <i className="bi bi-check2-all me-1"></i>
                                    {getAdminReceiptText(
                                      message,
                                      activeThread.userId?.username || 'User'
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <div ref={bottomRef} />
                        </div>

                        <Card className="support-compose-card border-0 mt-4">
                          <Card.Body className="p-3 p-md-4">
                            <Form onSubmit={handleReply}>
                              <Form.Group className="mb-3">
                                <Form.Label>Reply</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={4}
                                  placeholder="Write your reply to the user..."
                                  value={reply}
                                  onChange={(e) => setReply(e.target.value)}
                                />
                              </Form.Group>

                              <div className="d-flex justify-content-end">
                                <Button
                                  type="submit"
                                  variant="primary"
                                  disabled={sending || !reply.trim()}
                                >
                                  {sending ? 'Sending...' : 'Send Reply'}
                                </Button>
                              </div>
                            </Form>
                          </Card.Body>
                        </Card>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>

      <Modal
        show={Boolean(pendingDeleteThreadId)}
        onHide={closeDeleteThreadConfirm}
        centered
        dialogClassName="confirm-modal-dialog"
        contentClassName="confirm-modal"
      >
        <>
          <Modal.Header closeButton className="confirm-modal__header">
            <Modal.Title className="confirm-modal__title">
              Delete conversation
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="confirm-modal__body">
            Remove this conversation from the inbox?
          </Modal.Body>
          <Modal.Footer className="confirm-modal__footer">
            <Button
              type="button"
              variant="light"
              className="confirm-modal__cancel"
              onClick={closeDeleteThreadConfirm}
              disabled={Boolean(deletingThreadId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="confirm-modal__confirm"
              onClick={confirmDeleteThread}
              disabled={Boolean(deletingThreadId)}
            >
              {deletingThreadId ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </>
      </Modal>

      <Modal
        show={Boolean(pendingDeleteReplyId)}
        onHide={closeDeleteReplyConfirm}
        centered
        dialogClassName="confirm-modal-dialog"
        contentClassName="confirm-modal"
      >
        <>
          <Modal.Header closeButton className="confirm-modal__header">
            <Modal.Title className="confirm-modal__title">
              Delete reply
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="confirm-modal__body">
            Remove this reply from the conversation?
          </Modal.Body>
          <Modal.Footer className="confirm-modal__footer">
            <Button
              type="button"
              variant="light"
              className="confirm-modal__cancel"
              onClick={closeDeleteReplyConfirm}
              disabled={Boolean(deletingMessageId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="confirm-modal__confirm"
              onClick={confirmDeleteReply}
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

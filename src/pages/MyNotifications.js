import React, { useEffect, useState } from 'react';
import { Container, Card, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { getToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const formatNotificationTime = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleString();
};

export default function MyNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const token = getToken();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      if (!token) {
        throw new Error('Please log in to view notifications.');
      }

      const res = await fetch(`${API_BASE_URL}/api/notifications/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load notifications.');
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error loading notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const emitNotificationsUpdated = () => {
    window.dispatchEvent(new CustomEvent('bookify-notifications-updated'));
  };

  const handleMarkSingleRead = async (notificationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to mark notification as read.');
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
                readAt: notification.readAt || new Date().toISOString(),
              }
            : notification
        )
      );

      emitNotificationsUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update notification.');
    }
  };

  const openNotificationTarget = (notification) => {
    if (notification?.targetPath) {
      navigate(notification.targetPath);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      setError('');

      const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to mark all as read.');
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date().toISOString(),
        }))
      );

      emitNotificationsUpdated();
    } catch (err) {
      setError(err.message || 'Failed to mark all notifications as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setClearingAll(true);
      setError('');

      const res = await fetch(`${API_BASE_URL}/api/notifications/all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to clear all notifications.');
      }

      setNotifications([]);
      emitNotificationsUpdated();
    } catch (err) {
      setError(err.message || 'Failed to clear all notifications.');
    } finally {
      setClearingAll(false);
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="my-notifications-page">
      <Container>
        <Card className="shadow-sm border-0 my-notifications-card" style={{ borderRadius: '20px' }}>
          <Card.Body className="p-4 p-md-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                <h3 className="fw-bold mb-1">My Notifications</h3>
                <p className="text-muted mb-0">
                  Stay updated with account activity, admin messages, and library updates.
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Badge bg="primary" pill className="px-3 py-2">
                  {notifications.length} total
                </Badge>
                <Button
                  variant="outline-primary"
                  onClick={handleMarkAllRead}
                  disabled={markingAll || unreadCount === 0}
                >
                  {markingAll ? 'Updating...' : 'Mark all as read'}
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={handleClearAll}
                  disabled={clearingAll || notifications.length === 0}
                  className="notification-page-clear-btn"
                >
                  {clearingAll ? 'Clearing...' : 'Clear'}
                </Button>
              </div>
            </div>

            {loading && (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" />
              </div>
            )}

          {error && !loading && <Alert variant="danger" className="app-error-alert">{error}</Alert>}

            {!loading && !error && notifications.length === 0 && (
              <div className="text-center py-5">
                <div className="notification-empty-icon">
                  <i className="bi bi-bell-slash"></i>
                </div>
                <h5 className="fw-bold mt-3">No notifications yet</h5>
                <p className="text-muted mb-0">
                  New updates will appear here as soon as they arrive.
                </p>
              </div>
            )}

            {!loading && !error && notifications.length > 0 && (
              <div className="d-grid gap-3">
                {notifications.map((item) => (
                  <div
                    key={item._id}
                    className={`notification-item-content ${item.isRead ? '' : 'notification-item-card-unread'}`}
                    style={{ margin: 0 }}
                    onClick={() => {
                      if (!item.isRead) {
                        handleMarkSingleRead(item._id);
                      }
                      openNotificationTarget(item);
                    }}
                  >
                    <div className="notification-item-marker" />

                    <div className="notification-item-body">
                      <div className="notification-item-top">
                        <div className="notification-item-title">{item.title}</div>
                        {!item.isRead && (
                          <span className="notification-item-status">New</span>
                        )}
                      </div>

                      <div className="notification-item-message">{item.message}</div>
                      <div className="notification-item-time mt-2">
                        <i className="bi bi-clock-history me-1"></i>
                        {formatNotificationTime(item.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

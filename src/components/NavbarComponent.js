import React, { useEffect, useState } from 'react';
import {
  Navbar,
  Nav,
  Container,
  Button,
  Dropdown,
  Badge,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, getUserRole, logout } from '../utils/auth';
import { jwtDecode } from 'jwt-decode';

export default function NavbarComponent() {
  const navigate = useNavigate();
  const token = getToken();
  const storedRole = getUserRole();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  let username = '';
  let role = storedRole ? storedRole.toLowerCase() : null;

  if (token) {
    try {
      const decoded = jwtDecode(token);

      username =
        decoded.username ||
        decoded.name ||
        decoded.email ||
        'User';

      role = decoded.role
        ? decoded.role.toLowerCase()
        : storedRole?.toLowerCase();
    } catch (err) {
      console.error('JWT decode error:', err);
      username = 'User';
      role = storedRole?.toLowerCase();
    }
  }

  const initial = username ? username.charAt(0).toUpperCase() : 'U';

  const goToDashboard = () => {
    navigate(role === 'admin' ? '/admin' : '/user');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        }
      } catch (err) {
        console.error('Notification fetch error:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    const onNotificationsUpdated = () => fetchNotifications();
    window.addEventListener(
      'bookify-notifications-updated',
      onNotificationsUpdated
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        'bookify-notifications-updated',
        onNotificationsUpdated
      );
    };
  }, [token, API_BASE_URL]);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
      window.dispatchEvent(new CustomEvent('bookify-notifications-updated'));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const openNotificationTarget = (notification) => {
    if (notification?.targetPath) {
      navigate(notification.targetPath);
      return;
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();

    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const deleted = notifications.find((n) => n._id === id);

      setNotifications((prev) => prev.filter((n) => n._id !== id));

      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      window.dispatchEvent(new CustomEvent('bookify-notifications-updated'));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: n.readAt || new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('bookify-notifications-updated'));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const clearAllNotifications = async (e) => {
    try {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const res = await fetch(`${API_BASE_URL}/api/notifications/all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to clear notifications.');
      }

      setNotifications([]);
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('bookify-notifications-updated'));
    } catch (err) {
      console.error('Clear all notifications error:', err);
    }
  };

  return (
    <Navbar expand="lg" className="main-navbar shadow-sm" variant="dark">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="fw-bold text-white d-flex align-items-center"
        >
          <span className="navbar-brand-logo me-2" aria-hidden="true">
            <svg
              viewBox="0 0 64 64"
              role="img"
              focusable="false"
              className="navbar-brand-logo-svg"
            >
              <path
                fill="#ffffff"
                d="M8 15.5c0-2.7 2.2-4.9 4.9-4.9h12.5c4.6 0 8.8 1.3 12 3.6 3.2-2.3 7.4-3.6 12-3.6h1.7c2.7 0 4.9 2.2 4.9 4.9v29.8c0 1.4-1.1 2.5-2.5 2.5-3.8 0-8.2.7-11.9 2-2 .7-4 1.7-5.8 3-1 .8-2.4.8-3.4 0-1.8-1.3-3.8-2.3-5.8-3-3.8-1.3-8.1-2-11.9-2A2.5 2.5 0 0 1 8 45.3V15.5z"
              />
              <path
                fill="#dbeafe"
                d="M32 16.2c2.7-1.9 6.3-3.1 10.2-3.1h7.3c1.2 0 2.1 1 2.1 2.1v27.1c-4.2.2-8.4 1-12.2 2.4-2 .7-4 1.6-5.9 2.8l-1.5 1V16.2z"
              />
              <path
                fill="#ffffff"
                d="M32 16.2c-2.7-1.9-6.3-3.1-10.2-3.1h-7.3c-1.2 0-2.1 1-2.1 2.1v27.1c4.2.2 8.4 1 12.2 2.4 2 .7 4 1.6 5.9 2.8l1.5 1V16.2z"
              />
              <path
                fill="#cbd5e1"
                d="M31 15.4h2v34.1h-2z"
              />
            </svg>
          </span>
          Bookify E-Library
        </Navbar.Brand>

        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="align-items-center gap-3">
            {!token && (
              <>
                <Nav.Link as={Link} to="/" className="text-white-50">
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  Sign Up
                </Nav.Link>
              </>
            )}

            {token && (
              <>
                <Nav.Link as={Link} to="/" className="text-white-50">
                  Home
                </Nav.Link>

                <Dropdown align="end">
                  <Dropdown.Toggle
                    as={Button}
                    variant="link"
                    className={`notification-toggle position-relative text-white text-decoration-none ${
                      unreadCount > 0 ? 'has-unread' : ''
                    }`}
                  >
                    <i className="bi bi-bell-fill notification-bell-icon"></i>
                    {unreadCount > 0 && (
                      <Badge pill className="notification-badge">
                        {unreadCount}
                      </Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="notification-menu">
                    <div className="notification-menu-header">
                      <div>
                        <div className="notification-menu-title">
                          Notifications
                        </div>
                        <div className="notification-menu-subtitle">
                          {unreadCount > 0
                            ? `${unreadCount} unread update${
                                unreadCount > 1 ? 's' : ''
                              }`
                            : 'You are all caught up'}
                        </div>
                      </div>
                      <div className="notification-menu-header-actions">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            className="notification-header-button"
                            onClick={markAllAsRead}
                          >
                            <i className="bi bi-check2-all" aria-hidden="true" />
                            Mark all as read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            className="notification-header-button is-danger"
                            onClick={clearAllNotifications}
                          >
                            <i className="bi bi-trash3" aria-hidden="true" />
                            Clear
                          </button>
                        )}
                        <span className="notification-menu-icon">
                          <i className="bi bi-stars"></i>
                        </span>
                      </div>
                    </div>

                    {notifications.length === 0 && (
                      <div className="notification-empty-state">
                        <div className="notification-empty-icon">
                          <i className="bi bi-bell-slash"></i>
                        </div>
                        <div className="notification-empty-title">
                          No notifications
                        </div>
                        <div className="notification-empty-text">
                          New updates will appear here as soon as they arrive.
                        </div>
                      </div>
                    )}

                    {notifications.map((n) => (
                      <Dropdown.Item
                        key={n._id}
                        onClick={() => {
                          markAsRead(n._id);
                          openNotificationTarget(n);
                        }}
                        className={`notification-item ${
                          n.isRead ? 'is-read' : 'is-unread'
                        }`}
                      >
                        <div className="notification-item-content">
                          <div className="notification-item-marker" />

                          <div className="notification-item-body">
                            <div className="notification-item-top">
                              <div className="notification-item-title">
                                {n.title}
                              </div>
                              {!n.isRead && (
                                <span className="notification-item-status">
                                  New
                                </span>
                              )}
                            </div>

                            <div className="notification-item-message">
                              {n.message}
                            </div>
                            <div className="notification-item-time">
                              <i className="bi bi-clock-history me-1"></i>
                              {formatNotificationTime(n.createdAt)}
                            </div>
                          </div>

                          <button
                            onClick={(e) => deleteNotification(n._id, e)}
                            className="notification-delete-button"
                            aria-label="Delete notification"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      </Dropdown.Item>
                    ))}

                    <div className="notification-menu-footer">
                      <button
                        type="button"
                        className="notification-footer-link"
                        onClick={() => navigate('/notifications')}
                      >
                        View all notifications
                      </button>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown align="end">
                  <Dropdown.Toggle
                    as={Button}
                    variant="link"
                    className="navbar-user-toggle p-0 border-0 d-flex align-items-center text-decoration-none"
                  >
                    <div className="navbar-avatar d-flex align-items-center justify-content-center me-2">
                      {initial}
                    </div>
                    <span className="text-white fw-semibold d-none d-sm-inline">
                      {username}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="navbar-user-menu">
                    <Dropdown.Header className="navbar-user-menu-header">
                      <div className="navbar-user-menu-name">{username}</div>
                      <div className="navbar-user-menu-role">{role}</div>
                    </Dropdown.Header>

                    <Dropdown.Item onClick={goToDashboard}>
                      My Dashboard
                    </Dropdown.Item>

                    {role === 'user' && (
                      <>
                        <Dropdown.Item as={Link} to="/my-books">
                          My Books
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/book-of-intrests">
                          Book of Intrests
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/messages">
                          Messages
                        </Dropdown.Item>
                      </>
                    )}

                    {role === 'admin' && (
                      <Dropdown.Item as={Link} to="/admin-messages">
                        Messages Inbox
                      </Dropdown.Item>
                    )}

                    <Dropdown.Divider />

                    <Dropdown.Item
                      onClick={handleLogout}
                      className="navbar-user-menu-item navbar-user-menu-item--danger"
                    >
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

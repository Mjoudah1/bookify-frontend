import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Alert,
  Badge,
  Button,
  Modal,
} from 'react-bootstrap';
import AddBook from '../components/AddBook';
import { getToken } from '../utils/auth';

import AdminHero from '../components/admin/AdminHero';
import SendNotificationCard from '../components/admin/SendNotificationCard';
import CreateUserCard from '../components/admin/CreateUserCard';
import BooksTable from '../components/admin/BooksTable';
import EditBookModal from '../components/admin/EditBookModal';
import UsersTable from '../components/admin/UsersTable';
import { API_BASE_URL } from '../utils/api';

const PLAN_LABELS = {
  none: 'No Plan',
  monthly: '1 Month',
  quarterly: '3 Months',
  semiannual: '6 Months',
  yearly: '12 Months',
};

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersCount, setUsersCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [loadingDeleteBook, setLoadingDeleteBook] = useState(null);
  const [loadingDeleteUser, setLoadingDeleteUser] = useState(null);
  const [loadingUserUpdate, setLoadingUserUpdate] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const [notifTarget, setNotifTarget] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: '',
    message: '',
    action: null,
    confirmLabel: 'Confirm',
    variant: 'danger',
    loading: false,
  });

  const token = getToken();

  const getAuthHeaders = () =>
    token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [booksRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/books`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/users`, {
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
          }),
        ]);

        const booksData = await booksRes.json();
        const usersData = await usersRes.json();

        setBooks(Array.isArray(booksData) ? booksData : []);
        const safeUsers = Array.isArray(usersData) ? usersData : [];
        setUsers(safeUsers);
        setUsersCount(safeUsers.length);
      } catch (err) {
        setError(err.message || 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendNotification = async (e) => {
    e.preventDefault();

    setNotifError('');
    setNotifSuccess('');

    if (!notifTarget || !notifTitle || !notifMessage) {
      setNotifError('Please choose a recipient to continue.');
      return;
    }

    try {
      setNotifLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          target: notifTarget,
          title: notifTitle,
          message: notifMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setNotifSuccess(
        notifTarget === 'broadcast'
          ? 'Broadcast sent successfully'
          : 'Notification sent successfully'
      );

      setNotifTarget('');
      setNotifTitle('');
      setNotifMessage('');
    } catch (err) {
      setNotifError(err.message || 'Error sending notification');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    setCreateError('');
    setCreateSuccess('');

    if (
      !createForm.username ||
      !createForm.email ||
      !createForm.password ||
      !createForm.securityQuestion ||
      !createForm.securityAnswer
    ) {
      setCreateError(
        'Username, email, password, security question and answer are required.'
      );
      return;
    }

    try {
      setCreateLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user.');

      setUsers((prev) => [data.user, ...prev]);
      setUsersCount((prev) => prev + 1);
      setCreateSuccess(data.message || 'User created successfully.');
      setCreateForm({
        username: '',
        email: '',
        password: '',
        role: 'user',
        securityQuestion: '',
        securityAnswer: '',
      });
    } catch (err) {
      setCreateError(err.message || 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenEditBook = (book) => {
    if (!book) return;
    setSelectedBook(book);
    setShowEditModal(true);
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) =>
      prev.loading
        ? prev
        : {
            show: false,
            title: '',
            message: '',
            action: null,
            confirmLabel: 'Confirm',
            variant: 'danger',
            loading: false,
          }
    );
  };

  const runConfirmAction = async () => {
    if (typeof confirmDialog.action !== 'function') return;

    try {
      setConfirmDialog((prev) => ({ ...prev, loading: true }));
      await confirmDialog.action();
      setConfirmDialog({
        show: false,
        title: '',
        message: '',
        action: null,
        confirmLabel: 'Confirm',
        variant: 'danger',
        loading: false,
      });
    } catch {
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteBook = async (id) => {
    if (!id) return;

    try {
      setLoadingDeleteBook(id);

      await fetch(`${API_BASE_URL}/api/books/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch {
      setError('Delete failed');
    } finally {
      setLoadingDeleteBook(null);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      setLoadingUserUpdate(userId);

      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? data.user : u))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingUserUpdate(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) return;

    try {
      setLoadingDeleteUser(userId);

      await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setUsersCount((prev) => prev - 1);
    } catch {
      setError('Delete user failed');
    } finally {
      setLoadingDeleteUser(null);
    }
  };

  const handleCancelSubscription = async (userId) => {
    if (!userId) return;

    try {
      setLoadingUserUpdate(userId);

      const res = await fetch(
        `${API_BASE_URL}/api/users/${userId}/cancel-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? data.user : u))
      );
    } catch (err) {
      setError(err.message || 'Cancel subscription failed');
    } finally {
      setLoadingUserUpdate(null);
    }
  };

  const askDeleteBook = (bookId) => {
    setConfirmDialog({
      show: true,
      title: 'Delete book',
      message: 'Remove this book from the catalog?',
      confirmLabel: 'Delete',
      variant: 'danger',
      loading: false,
      action: () => handleDeleteBook(bookId),
    });
  };

  const askDeleteUser = (userId) => {
    const selectedUser = users.find((user) => user._id === userId);
    if (selectedUser?.role === 'admin') {
      setError('Admin accounts cannot be deleted.');
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Delete user',
      message: 'Delete this user account?',
      confirmLabel: 'Delete',
      variant: 'danger',
      loading: false,
      action: () => handleDeleteUser(userId),
    });
  };

  const askCancelSubscription = (userId) => {
    setConfirmDialog({
      show: true,
      title: 'Cancel subscription',
      message: 'Cancel this user subscription?',
      confirmLabel: 'Cancel subscription',
      variant: 'warning',
      loading: false,
      action: () => handleCancelSubscription(userId),
    });
  };

  const askToggleUserStatus = (user) => {
    if (!user?._id) return;

    const nextIsActive = !user.isActive;

    setConfirmDialog({
      show: true,
      title: nextIsActive ? 'Activate user' : 'Deactivate user',
      message: nextIsActive
        ? 'Activate this user account?'
        : 'Deactivate this user account?',
      confirmLabel: nextIsActive ? 'Activate' : 'Deactivate',
      variant: nextIsActive ? 'success' : 'warning',
      loading: false,
      action: () =>
        handleUpdateUser(user._id, {
          isActive: nextIsActive,
        }),
    });
  };

  const renderUserSubscriptionBadge = (user) => {
    const sub = user.subscription || {};
    const planLabel = PLAN_LABELS[sub.plan] || sub.plan || 'No Plan';
    const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null;
    const isExpired =
      expiresAt instanceof Date &&
      !Number.isNaN(expiresAt.getTime()) &&
      expiresAt <= new Date();

    if (!sub.plan || sub.plan === 'none') {
      return <Badge bg="secondary">No Plan</Badge>;
    }

    if (user.isSubscribed) {
      return <Badge bg="success">{planLabel}</Badge>;
    }

    return (
      <Badge bg={isExpired ? 'warning' : 'secondary'}>
        {planLabel}
      </Badge>
    );
  };

  const formatPrice = (price) => {
    if (!price) return 'Free';
    return `$${Number(price).toFixed(2)}`;
  };

  const getAccessTypeBadge = (book) => {
    const paid = Number(book.price) > 0;

    if (paid && book.availableInSubscription) {
      return <Badge bg="warning">Paid + Sub</Badge>;
    }
    if (paid) return <Badge bg="warning">Paid</Badge>;
    if (book.availableInSubscription) {
      return <Badge bg="success">Subscription</Badge>;
    }

    return <Badge bg="secondary">Free</Badge>;
  };

  return (
    <div style={{ background: '#f4f7fb', minHeight: '100vh' }}>
      <Container className="py-4">
        <AdminHero />

        {error && (
          <Alert variant="danger" className="admin-create-user-card__alert admin-form-alert app-error-alert is-danger mb-4">
            <div className="admin-create-user-card__alert-copy">
              <div className="admin-create-user-card__alert-title is-danger">
                Something needs your attention
              </div>
              <div className="admin-create-user-card__alert-text is-danger">
                {error}
              </div>
            </div>
          </Alert>
        )}

        <SendNotificationCard
          notifTarget={notifTarget}
          setNotifTarget={setNotifTarget}
          notifTitle={notifTitle}
          setNotifTitle={setNotifTitle}
          notifMessage={notifMessage}
          setNotifMessage={setNotifMessage}
          notifLoading={notifLoading}
          notifError={notifError}
          notifSuccess={notifSuccess}
          handleSendNotification={handleSendNotification}
          users={users}
        />

        <Row className="mb-4">
          <Col>
            <AddBook onBookAdded={(b) => setBooks([b, ...books])} />
          </Col>
        </Row>

        <BooksTable
          books={books}
          loading={loading}
          loadingDeleteBook={loadingDeleteBook}
          formatPrice={formatPrice}
          getAccessTypeBadge={getAccessTypeBadge}
          handleOpenEditBook={handleOpenEditBook}
          handleDeleteBook={askDeleteBook}
        />

        <UsersTable
          users={users}
          loading={loading}
          loadingUserUpdate={loadingUserUpdate}
          loadingDeleteUser={loadingDeleteUser}
          handleUpdateUser={handleUpdateUser}
          handleToggleUserStatus={askToggleUserStatus}
          handleCancelSubscription={askCancelSubscription}
          handleDeleteUser={askDeleteUser}
          renderUserSubscriptionBadge={renderUserSubscriptionBadge}
        />

        <CreateUserCard
          createForm={createForm}
          setCreateForm={setCreateForm}
          createLoading={createLoading}
          createError={createError}
          createSuccess={createSuccess}
          handleCreateUser={handleCreateUser}
        />

        <EditBookModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          book={selectedBook}
          getAuthHeaders={getAuthHeaders}
          onBookUpdated={(updatedBook) => {
            setBooks((prev) =>
              prev.map((b) =>
                b._id === updatedBook._id ? updatedBook : b
              )
            );
          }}
        />

        <Modal
          show={confirmDialog.show}
          onHide={closeConfirmDialog}
          centered
          dialogClassName="confirm-modal-dialog"
          contentClassName="confirm-modal"
        >
          <Modal.Header closeButton className="confirm-modal__header">
            <Modal.Title className="confirm-modal__title">
              {confirmDialog.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="confirm-modal__body">
            {confirmDialog.message}
          </Modal.Body>
          <Modal.Footer className="confirm-modal__footer">
            <Button
              type="button"
              variant="light"
              className="confirm-modal__cancel"
              onClick={closeConfirmDialog}
              disabled={confirmDialog.loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={confirmDialog.variant}
              className="confirm-modal__confirm"
              onClick={runConfirmAction}
              disabled={confirmDialog.loading}
            >
              {confirmDialog.loading ? 'Processing...' : confirmDialog.confirmLabel}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

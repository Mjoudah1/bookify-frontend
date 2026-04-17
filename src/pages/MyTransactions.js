// frontend/src/pages/MyTransactions.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  Table,
  Spinner,
  Alert,
  Badge,
} from 'react-bootstrap';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../utils/api';

export default function MyTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyTransactions = async () => {
      try {
        setLoading(true);
        setError('');

        const token = getToken();
        if (!token) {
          setError('Please log in to view your transactions.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/transactions/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let data = [];
        try {
          data = await res.json();
        } catch {
          // ignore JSON parse error
        }

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Please log in to view your transactions.');
          }
          throw new Error(
            (data && data.message) || 'Failed to load transactions.'
          );
        }

        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('MyTransactions error:', err);
        setError(err.message || 'Error loading your transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyTransactions();
  }, []);

  const formatDateTime = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString();
  };

  const formatAmount = (value) => {
    if (value === undefined || value === null) return '$0.00';
    const num = Number(value);
    if (Number.isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  const renderTypeBadge = (tx) => {
    if (tx.type === 'buy') {
      return (
        <Badge bg="success" pill>
          Buy
        </Badge>
      );
    }

    // ✅ من الباك إند: type: 'read' + viaSubscription: true
    if (tx.type === 'read' && tx.viaSubscription) {
      return (
        <Badge bg="info" pill>
          Read (Subscription)
        </Badge>
      );
    }

    if (tx.type === 'read') {
      return (
        <Badge bg="secondary" pill>
          Read
        </Badge>
      );
    }

    if (tx.type === 'subscription') {
      return (
        <Badge bg="primary" pill>
          Subscription
        </Badge>
      );
    }

    if (tx.type === 'subscription_renew') {
      return (
        <Badge bg="warning" text="dark" pill>
          Subscription Renewal
        </Badge>
      );
    }

    return (
      <Badge bg="secondary" pill>
        {tx.type || 'Unknown'}
      </Badge>
    );
  };

  const renderVia = (tx) => {
    if (tx.viaSubscription) {
      return 'Subscription';
    }

    if (tx.type === 'subscription' || tx.type === 'subscription_renew') {
      const details = [
        tx.meta?.planLabel || 'Subscription plan',
        tx.meta?.cardBrand ? `via ${tx.meta.cardBrand}` : null,
        tx.meta?.cardLast4 ? `•••• ${tx.meta.cardLast4}` : null,
      ].filter(Boolean);

      return details.join(' ');
    }

    return 'Direct purchase';
  };

  return (
    <div className="my-transactions-page">
      <Container>
        <Card
          className="shadow-sm border-0 my-transactions-card"
          style={{ borderRadius: '18px' }}
        >
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="fw-bold mb-1">My Transactions</h3>
                <p
                  className="text-muted mb-0"
                  style={{ fontSize: '0.9rem' }}
                >
                  View your e-book purchases and subscription reading activity.
                </p>
              </div>
              <Badge
                bg="primary"
                pill
                className="px-3 py-2"
                style={{ fontSize: '0.85rem' }}
              >
                Total: {transactions.length}
              </Badge>
            </div>

            {loading && (
              <div className="d-flex justify-content-center my-4">
                <Spinner animation="border" />
              </div>
            )}

            {error && (
              <Alert variant="danger" className="app-error-alert mt-2">
                {error}
              </Alert>
            )}

            {!loading && !error && transactions.length === 0 && (
              <p className="text-muted mt-3">
                No transactions found yet.
              </p>
            )}

            {!loading && !error && transactions.length > 0 && (
              <div className="table-responsive mt-3">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Book</th>
                      <th>Type</th>
                      <th>Access</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td>{formatDateTime(tx.createdAt || tx.accessedAt)}</td>
                        <td>
                          <div className="fw-semibold">
                            {tx.bookId?.title || 'Unknown book'}
                          </div>
                          <div className="text-muted small">
                            {tx.bookId?.author || ''}
                            {tx.bookId?.isbn
                              ? ` · ISBN: ${tx.bookId.isbn}`
                              : ''}
                          </div>
                        </td>
                        <td>{renderTypeBadge(tx)}</td>
                        <td>{renderVia(tx)}</td>
                        <td>{formatAmount(tx.amountPaid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

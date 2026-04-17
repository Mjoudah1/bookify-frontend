// frontend/src/pages/MyBooks.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge,
  Button,
  Form,
  InputGroup,
  Dropdown,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterType, setFilterType] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        setLoading(true);
        setError('');

        const token = getToken();
        if (!token) {
          setError('Please log in to view your e-books.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/books/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let data = [];
        try {
          data = await res.json();
        } catch {
          data = [];
        }

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Please log in to view your e-books.');
          }
          throw new Error((data && data.message) || 'Failed to load your books.');
        }

        const arr = Array.isArray(data) ? data : [];
        setBooks(arr);
        setCount(arr.length);
        setSearchInput(search);
      } catch (err) {
        console.error('MyBooks error:', err);
        setError(err.message || 'Error loading your books.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, []);

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'Not set';
    const num = Number(price);
    if (Number.isNaN(num)) return 'Not set';
    if (num === 0) return 'Free';
    return `$${num.toFixed(2)}`;
  };

  const handleOpenDetails = (book) => {
    navigate(`/books/${book._id}`, { state: { book } });
  };

  const handleReadBook = (book) => {
    navigate(`/read/${book._id}`);
  };

  const handleRemoveBook = async (bookId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to remove this book from your library?'
    );
    if (!confirmDelete) return;

    try {
      const token = getToken();
      if (!token) {
        setError('Please log in first.');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/books/my/${bookId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to remove book.');
      }

      setBooks((prev) => prev.filter((b) => b._id !== bookId));
      setCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Remove book error:', err);
      setError(err.message || 'Error removing book.');
    }
  };

  const getCoverSrc = (book) => {
    if (book.coverImageUrl) return book.coverImageUrl;
    if (book.coverImage) {
      return `${API_BASE_URL}/uploads/covers/${book.coverImage}`;
    }
    return null;
  };

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();

    return books.filter((book) => {
      const numPrice = Number(book.price) || 0;
      const isPaid = numPrice > 0;
      const isFree = numPrice === 0;
      const isSubscription = book.librarySource === 'subscription';

      if (filterType === 'free' && !isFree) return false;
      if (filterType === 'paid' && !isPaid) return false;
      if (filterType === 'subscription' && !isSubscription) return false;

      if (q) {
        const title = (book.title || '').toLowerCase();
        const author = (book.author || '').toLowerCase();
        if (!title.includes(q) && !author.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [books, search, filterType]);

  const filterTypeLabel =
    {
      all: 'All books',
      subscription: 'Subscription books',
      free: 'Free books',
      paid: 'Paid books',
    }[filterType] || 'All books';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div className="my-books-page">
      <Container>
        <div className="my-books-header d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
          <div className="my-books-header__copy">
            <div className="my-books-header__eyebrow">Your reading shelf</div>
            <h3 className="fw-bold mb-1">My Books</h3>
            <p className="text-muted mb-0 my-books-header__text">
              Browse all e-books you own, unlocked for free, or opened through your subscription.
            </p>
          </div>
          <Badge bg="primary" pill className="my-books-total-chip">
            Total books: {count}
          </Badge>
        </div>

        {!loading && !error && (
          <div className="my-books-filter-shell mb-4">
            <Row className="g-3">
              <Col lg={8} sm={12}>
                <Form onSubmit={handleSearchSubmit}>
                  <InputGroup className="my-books-search-group">
                    <button
                      type="submit"
                      className="btn my-books-search-icon"
                      aria-label="Search my books"
                    >
                      <i className="bi bi-search" aria-hidden="true" />
                    </button>
                    <Form.Control
                      placeholder="Search by title or author..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="my-books-search-input"
                    />
                  </InputGroup>
                </Form>
              </Col>
              <Col lg={4} sm={12}>
                <Dropdown className="glass-filter-dropdown my-books-filter-dropdown">
                  <Dropdown.Toggle
                    variant="link"
                    className="glass-filter-toggle my-books-filter-toggle"
                  >
                    <span className="glass-filter-label">{filterTypeLabel}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="glass-filter-menu my-books-filter-menu w-100">
                    <Dropdown.Item
                      active={filterType === 'all'}
                      onClick={() => setFilterType('all')}
                    >
                      All books
                    </Dropdown.Item>
                    <Dropdown.Item
                      active={filterType === 'subscription'}
                      onClick={() => setFilterType('subscription')}
                    >
                      Subscription books
                    </Dropdown.Item>
                    <Dropdown.Item
                      active={filterType === 'free'}
                      onClick={() => setFilterType('free')}
                    >
                      Free books
                    </Dropdown.Item>
                    <Dropdown.Item
                      active={filterType === 'paid'}
                      onClick={() => setFilterType('paid')}
                    >
                      Paid books
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
          </div>
        )}

        {loading && (
          <div className="d-flex justify-content-center my-5">
            <Spinner animation="border" />
          </div>
        )}

        {error && !loading && (
              <Alert variant="danger" className="app-error-alert mt-3">
            {error}
          </Alert>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="text-center mt-5 empty-state">
            <h5 className="fw-semibold mb-2">No books yet</h5>
            <p className="text-muted mb-3">
              Once you buy or add free e-books, they will appear here.
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Browse Library
            </Button>
          </div>
        )}

        {!loading && !error && books.length > 0 && filteredBooks.length === 0 && (
          <div className="text-center mt-4 empty-state">
            <h6 className="fw-semibold mb-1">No books match your filters</h6>
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              Try changing the search text or filter type.
            </p>
          </div>
        )}

        {!loading && !error && filteredBooks.length > 0 && (
          <Row className="gy-4 gx-4 mt-2">
            {filteredBooks.map((book) => {
              const coverSrc = getCoverSrc(book);
              const numPrice = Number(book.price) || 0;
              const isPaid = numPrice > 0;
              const isFree = numPrice === 0;
              const isSubscription = book.librarySource === 'subscription';

              let badgeText = 'Owned';
              let badgeVariant = 'primary';

              if (isSubscription) {
                badgeText = 'Subscription';
                badgeVariant = 'info';
              } else if (isFree) {
                badgeText = 'Free access';
                badgeVariant = 'success';
              } else if (isPaid) {
                badgeText = 'Paid book';
                badgeVariant = 'danger';
              }

              return (
                <Col key={book._id} xxl={3} xl={4} md={6} xs={12}>
                  <Card className="my-books-card h-100 shadow-sm border-0">
                    {coverSrc ? (
                      <div className="my-books-card__cover-wrap">
                        <Card.Img
                          variant="top"
                          src={coverSrc}
                          alt={book.title}
                          className="my-books-card__cover"
                        />
                      </div>
                    ) : (
                      <div className="my-books-card__cover-placeholder d-flex flex-column align-items-center justify-content-center bg-light">
                        <span style={{ fontSize: '2rem' }}>
                          <i className="bi bi-book-half" />
                        </span>
                        <small className="text-muted mt-1">No cover</small>
                      </div>
                    )}

                    <Card.Body className="d-flex flex-column">
                      <div className="my-books-card__eyebrow">Saved in your shelf</div>
                      <Card.Title className="fw-semibold mb-1 my-books-card__title">
                        {book.title}
                      </Card.Title>
                      <Card.Subtitle className="text-muted small mb-2 my-books-card__author">
                        {book.author || 'Unknown author'}
                      </Card.Subtitle>

                      <div className="mb-3">
                        <Badge bg={badgeVariant} pill className="me-1 mb-1 my-books-card__status-badge">
                          {badgeText}
                        </Badge>
                        {typeof book.averageRating === 'number' && (
                          <Badge bg="warning" text="dark" pill className="me-1 mb-1 my-books-card__meta-badge is-rating">
                            <i className="bi bi-star-fill me-1" />
                            {book.averageRating.toFixed(1)}
                          </Badge>
                        )}
                        {book.views > 0 && (
                          <Badge bg="secondary" pill className="mb-1 my-books-card__meta-badge is-views">
                            <i className="bi bi-eye-fill me-1" />
                            {book.views}
                          </Badge>
                        )}
                      </div>

                      <div className="small text-muted mb-3 my-books-card__price">
                        Price: {formatPrice(book.price)}
                      </div>

                      <div className="mt-auto d-grid gap-2 my-books-card__actions">
                        <Button
                          variant="primary"
                          size="sm"
                          className="my-books-card__action is-primary"
                          onClick={() => handleReadBook(book)}
                        >
                          <i className="bi bi-book-half me-1" />
                          Read Book
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="my-books-card__action is-secondary"
                          onClick={() => handleOpenDetails(book)}
                        >
                          <i className="bi bi-info-circle me-1" />
                          Details & Rating
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="my-books-card__action is-danger"
                          onClick={() => handleRemoveBook(book._id)}
                        >
                          <i className="bi bi-trash3 me-1" />
                          Remove from My Books
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );
}

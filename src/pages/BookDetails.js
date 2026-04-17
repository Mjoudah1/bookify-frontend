// frontend/src/pages/BookDetails.jsx
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
  Dropdown,
} from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import BookRating from '../components/BookRating';
import VirtualVisaPaymentModal from '../components/user/VirtualVisaPaymentModal';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../utils/api';

export default function BookDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [book, setBook] = useState(location.state?.book || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewsError, setReviewsError] = useState('');

  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); // 👈 ID المستخدم الحالي

  const [reviewSort, setReviewSort] = useState('newest'); // newest | highest | lowest
  const [reviewFilter, setReviewFilter] = useState('all'); // all | 5 | 4 | 3 | 2 | 1

  // أزرار القراءة/الشراء
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [showBuyPaymentModal, setShowBuyPaymentModal] = useState(false);

  // هل يملك المستخدم هذا الكتاب (أو يستطيع قراءته أونلاين)؟
  const [canReadOwned, setCanReadOwned] = useState(false);

  const token = useMemo(() => getToken(), []);
  const isLoggedIn = !!token;

  /* -------------------------------------------
     🔐 Decode token once (role + id)
  ------------------------------------------- */
  useEffect(() => {
    const t = getToken();
    if (!t) return;
    try {
      const decoded = jwtDecode(t);
      setCurrentUserRole(decoded.role || 'user');
      setCurrentUserId(
        decoded.id || decoded._id || decoded.userId || decoded.sub || null
      );
    } catch (e) {
      console.error('Error decoding token in BookDetails:', e);
    }
  }, []);

  /* -------------------------------------------
     📖 Fetch book details
  ------------------------------------------- */
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError('');

        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const res = await fetch(`${API_BASE_URL}/api/books/${id}`, {
          headers,
        });
        if (!res.ok) {
          throw new Error('Failed to load book details');
        }
        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Could not load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, token]);

  useEffect(() => {
    const reviewId = new URLSearchParams(location.search).get('review');
    if (!reviewId || !book?.ratings?.length) return;

    const element = document.getElementById(`review-${reviewId}`);
    if (!element) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    element.classList.add('review-highlighted');
    const timeout = setTimeout(() => {
      element.classList.remove('review-highlighted');
    }, 2200);

    return () => clearTimeout(timeout);
  }, [location.search, book?.ratings?.length]);

  useEffect(() => {
    if (!id) return;

    const sessionKey = `book-viewed:${id}`;
    if (sessionStorage.getItem(sessionKey) === '1') return;

    sessionStorage.setItem(sessionKey, 'pending');

    const trackView = async () => {
      try {
        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {};

        const res = await fetch(`${API_BASE_URL}/api/books/${id}/view`, {
          method: 'POST',
          headers,
        });

        if (!res.ok) {
          sessionStorage.removeItem(sessionKey);
          return;
        }

        const data = await res.json();
        sessionStorage.setItem(sessionKey, '1');

        if (typeof data.views === 'number') {
          setBook((prev) =>
            prev ? { ...prev, views: data.views } : prev
          );
        }
      } catch (err) {
        sessionStorage.removeItem(sessionKey);
        console.warn('Book view tracking failed:', err);
      }
    };

    trackView();
  }, [id, token]);

  /* -------------------------------------------
     🔎 Check if user already has read-access
     (own / free / subscription)
  ------------------------------------------- */
  useEffect(() => {
    const checkReadAccess = async () => {
      const tokenLocal = getToken();
      if (!tokenLocal || !book?._id) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/books/${book._id}/read-access`,
          {
            headers: {
              Authorization: `Bearer ${tokenLocal}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.canReadOnline) {
            setCanReadOwned(true);
          }
        }
      } catch (e) {
        console.warn('Read-access check failed:', e);
      }
    };

    checkReadAccess();
  }, [book?._id]);

  /* -------------------------------------------
     ⭐ Ratings list (sorted + filtered)
  ------------------------------------------- */
  const ratings = useMemo(() => {
    if (!Array.isArray(book?.ratings)) return [];

    let list = [...book.ratings];

    if (reviewFilter !== 'all') {
      const min = Number(reviewFilter);
      list = list.filter((r) => r.value >= min);
    }

    list.sort((a, b) => {
      if (reviewSort === 'highest') {
        return b.value - a.value || new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (reviewSort === 'lowest') {
        return a.value - b.value || new Date(b.createdAt) - new Date(a.createdAt);
      }
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });

    return list;
  }, [book, reviewSort, reviewFilter]);

  const hasRatings = ratings.length > 0;
  const isAdmin = currentUserRole === 'admin';
  const reviewSortLabel =
    {
      newest: 'Newest',
      highest: 'Highest rating',
      lowest: 'Lowest rating',
    }[reviewSort] || 'Newest';
  const reviewFilterLabel =
    {
      all: 'All',
      5: '5+',
      4: '4+',
      3: '3+',
      2: '2+',
      1: '1+',
    }[reviewFilter] || 'All';

  /* -------------------------------------------
     👤 تقييم اليوزر الحالي من الـ DB
  ------------------------------------------- */
  const userOwnRating = useMemo(() => {
    if (!book || !Array.isArray(book.ratings) || !currentUserId) return null;

    return (
      book.ratings.find((r) => {
        if (!r.user) return false;
        const uid =
          typeof r.user === 'string'
            ? r.user
            : r.user._id || r.user.id || r.user;
        return uid?.toString() === currentUserId.toString();
      }) || null
    );
  }, [book, currentUserId]);

  /* -------------------------------------------
     🗑 Delete review (admin)
  ------------------------------------------- */
  const handleDeleteReview = async (reviewId) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    setReviewsError('');
    const tokenLocal = getToken();
    if (!tokenLocal) {
      setReviewsError('You must be logged in as admin to delete reviews.');
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/books/${book._id}/reviews/${reviewId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${tokenLocal}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete review');
      }

      setBook((prev) =>
        prev
          ? {
              ...prev,
              averageRating: data.averageRating,
              ratingsCount: data.ratingsCount,
              ratings: data.ratings,
            }
          : prev
      );
    } catch (err) {
      console.error('Delete review error:', err);
      setReviewsError(err.message || 'Error deleting review.');
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'Not set';
    const num = Number(price);
    if (Number.isNaN(num)) return 'Not set';
    if (num === 0) return 'Free';
    return `$${num.toFixed(2)}`;
  };

  const numericPrice = Number(book?.price) || 0;
  const numericPurchasePrice = Number(book?.purchasePrice) || 0;
  const effectivePurchasePrice =
    numericPurchasePrice > 0 ? numericPurchasePrice : numericPrice;
  const hasPaidPurchaseOption = effectivePurchasePrice > 0;
  const inSubscription = !!book?.availableInSubscription;
  const isFreeAccessBook = numericPrice === 0 && !inSubscription;

  /* -------------------------------------------
     📖 READ VIA SUBSCRIPTION
  ------------------------------------------- */
  const handleReadViaSubscription = async () => {
    setActionMessage('');
    setActionError('');

    const tokenLocal = getToken();

    if (!tokenLocal) {
      setActionError('You must log in to read this book.');
      navigate('/login');
      return;
    }

    if (!book) return;

    try {
      setLoadingSubscription(true);

      const txRes = await fetch(
        `${API_BASE_URL}/api/transactions/subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenLocal}`,
          },
          body: JSON.stringify({ bookId: book._id }),
        }
      );

      const txData = await txRes.json();
      if (!txRes.ok) {
        throw new Error(
          txData.message ||
            'Failed to access this book via subscription.'
        );
      }

      setActionMessage(
        'Access granted via subscription. Redirecting to online reader...'
      );
      navigate(`/read/${book._id}`);
    } catch (err) {
      console.error('Subscription access error:', err);
      setActionError(
        err.message || 'Error accessing book via subscription.'
      );
    } finally {
      setLoadingSubscription(false);
    }
  };

  /* -------------------------------------------
     💳 BUY & READ (or FREE ADD)
  ------------------------------------------- */
  const handleBuyAndRead = async (payment = null) => {
    setActionMessage('');
    setActionError('');

    const tokenLocal = getToken();

    if (!tokenLocal) {
      setActionError('You must log in to buy this book.');
      navigate('/login');
      return;
    }

    if (!book) return;

    try {
      setLoadingBuy(true);

      const res = await fetch(
        `${API_BASE_URL}/api/books/${book._id}/buy`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenLocal}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            payment
              ? { payment }
              : {}
          ),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || '';
        if (msg.toLowerCase().includes('already own')) {
          setCanReadOwned(true);
          setActionMessage('You already own this book. You can read it now.');
          return;
        }
        throw new Error(msg || 'Failed to purchase this book.');
      }

      setCanReadOwned(true);

      if (numericPrice === 0 && effectivePurchasePrice === 0) {
        setActionMessage(
          data.message ||
            'Book added to your library. Click "Read Book" to open the online reader.'
        );
      } else {
        setActionMessage(
          data.message ||
            'E-book purchased successfully. You can now download it from the reader.'
        );
        setShowBuyPaymentModal(false);
        if (!canReadOwned && !inSubscription && numericPrice > 0) {
          navigate(`/read/${book._id}`);
        }
      }
    } catch (err) {
      console.error('Buy error:', err);

      const msg = (err.message || '').toLowerCase();
      if (msg.includes('already own')) {
        setCanReadOwned(true);
        setActionMessage('You already own this book. You can read it now.');
        return;
      }

      setActionError(err.message || 'Error purchasing book.');
    } finally {
      setLoadingBuy(false);
    }
  };

  /* -------------------------------------------
     🔄 Loading / error states
  ------------------------------------------- */
  if (loading) {
    return (
      <div className="book-details-page d-flex align-items-center justify-content-center">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-details-page pt-4">
        <Container>
          <Alert variant="danger" className="app-error-alert text-center">
            {error}
          </Alert>
          <div className="text-center">
            <Button
              variant="secondary"
              className="book-details-back-btn"
              onClick={() => navigate(-1)}
            >
              ⬅ Back
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-details-page pt-4">
        <Container className="text-center">
          <p>Book not found.</p>
          <Button
            variant="secondary"
            className="book-details-back-btn"
            onClick={() => navigate('/')}
          >
            ⬅ Back to Home
          </Button>
        </Container>
      </div>
    );
  }

  /* -------------------------------------------
     🖼 Render
  ------------------------------------------- */
  return (
    <div className="book-details-page pt-4">
      <Container className="pb-4">
        <Button
          variant="outline-secondary"
          className="mb-3 rounded-pill px-3 book-details-back-btn"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-2" aria-hidden="true" />
          Back
        </Button>
 
        {/* MAIN CARD */}
        <Card
          className="shadow-sm border-0 mb-4 book-details-hero-card"
          style={{
            borderRadius: '18px',
            overflow: 'hidden',
          }}
        >
          <Row className="g-0">
            {/* LEFT: COVER */}
            <Col md={4} className="book-details-cover-col d-flex align-items-stretch">
              <div className="w-100 d-flex align-items-center justify-content-center p-3">
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    style={{
                      maxHeight: '380px',
                      width: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                ) : (
                  <div
                    className="d-flex flex-column align-items-center justify-content-center text-muted book-cover-placeholder"
                    style={{
                      borderRadius: '12px',
                      width: '100%',
                      height: '260px',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}><i className="bi bi-book-half" aria-hidden="true" /></span>
                    <small className="mt-2">No cover image</small>
                  </div>
                )}
              </div>
            </Col>

            {/* RIGHT: DETAILS */}
            <Col md={8}>
              <Card.Body className="p-4 p-lg-4 book-details-main-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h2 className="mb-1">{book.title}</h2>
                    {book.author && (
                      <h5 className="text-muted mb-1">by {book.author}</h5>
                    )}
                    <div className="mt-2 d-flex flex-wrap align-items-center gap-2">
                      {book.category && (
                        <Badge bg="secondary">{book.category}</Badge>
                      )}
                      <Badge bg="primary">E-Book</Badge>
                      {book.availableInSubscription && (
                        <Badge bg="info">Included in subscription</Badge>
                      )}
                      {numericPrice === 0 ? (
                        <Badge bg="success">Free</Badge>
                      ) : (
                        <Badge bg="warning" text="dark">
                          Paid
                        </Badge>
                      )}
                      {hasPaidPurchaseOption && (
                        <Badge bg="dark">Download purchase available</Badge>
                      )}
                    </div>
                  </div>

                  {/* Rating summary */}
                  <div className="text-end book-details-rating-box">
                    <div className="book-details-rating-score">
                      <span className="book-details-rating-icon" aria-hidden="true">
                        <i className="bi bi-star-fill" />
                      </span>
                      <span className="book-details-rating-value">
                        {book.averageRating ? book.averageRating.toFixed(1) : 0} / 5
                      </span>
                    </div>
                    <small className="text-muted d-block book-details-rating-caption">
                      {book.ratingsCount > 0
                        ? `${book.ratingsCount} ratings`
                        : 'No ratings yet'}
                    </small>
                    <div className="book-details-views-chip">
                      <i className="bi bi-eye-fill" aria-hidden="true" />
                      <span>{book.views || 0} views</span>
                    </div>
                  </div>
                </div>

                <hr />

                {/* PRICE + ACCESS INFO */}
                <Row className="mb-3">
                  <Col md={6} className="mb-2">
                    <div className="small text-muted">Access Price</div>
                    <div className="fs-5 fw-semibold">
                      {formatPrice(book.price)}
                    </div>
                    {hasPaidPurchaseOption && (
                      <div className="mt-2">
                        <div className="small text-muted">Purchase Price</div>
                        <div className="fw-semibold">
                          {formatPrice(effectivePurchasePrice)}
                        </div>
                      </div>
                    )}
                  </Col>
                  <Col md={6} className="mb-2">
                    <div className="small text-muted">Access</div>
                    <div className="small">
                      Read online directly in your browser.
                      <br />
                      Requires active subscription or ownership.
                    </div>
                    {book.isbn && (
                      <small className="text-muted d-block mt-1">
                        ISBN: {book.isbn}
                      </small>
                    )}
                  </Col>
                </Row>

                {/* DESCRIPTION */}
                {book.description && (
                  <div className="mb-3">
                    <div className="fw-semibold mb-1">Description</div>
                    <p
                      className="mb-0 text-muted"
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {book.description}
                    </p>
                  </div>
                )}

                {/* ACTION BUTTONS: READ / BUY */}
                <div className="mt-4 d-flex flex-wrap gap-2 book-details-actions">
                  {inSubscription && (
                    <Button
                      variant="success"
                      onClick={handleReadViaSubscription}
                      disabled={loadingSubscription}
                      className="fw-semibold"
                    >
                      {loadingSubscription
                        ? 'Checking subscription...'
                        : 'Read Online (Subscription)'}
                    </Button>
                  )}

                  {hasPaidPurchaseOption && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setActionMessage('');
                        setActionError('');
                        setShowBuyPaymentModal(true);
                      }}
                      disabled={loadingBuy}
                      className="fw-semibold"
                    >
                      {loadingBuy
                        ? 'Processing payment...'
                        : inSubscription || isFreeAccessBook
                        ? `Buy to Download (${formatPrice(effectivePurchasePrice)})`
                        : `Buy & Read (${formatPrice(effectivePurchasePrice)})`}
                    </Button>
                  )}

                  {/* كتاب مجاني خارج الاشتراك */}
                  {!inSubscription &&
                    numericPrice === 0 &&
                    effectivePurchasePrice === 0 && (
                    <Button
                      variant="outline-primary"
                      onClick={
                        canReadOwned
                          ? () => navigate(`/read/${book._id}`)
                          : handleBuyAndRead
                      }
                      disabled={loadingBuy}
                      className="fw-semibold"
                    >
                      {loadingBuy
                        ? canReadOwned
                          ? 'Opening...'
                          : 'Adding to library...'
                        : canReadOwned
                        ? 'Read Book'
                        : 'Add to My Library (Free)'}
                    </Button>
                  )}

                  {isFreeAccessBook && effectivePurchasePrice > 0 && (
                    <Button
                      variant="outline-primary"
                      onClick={() => navigate(`/read/${book._id}`)}
                      className="fw-semibold"
                    >
                      Read Book
                    </Button>
                  )}
                </div>

                {/* ACTION MESSAGES */}
                {actionMessage && (
                  <Alert variant="success" className="mt-3 py-2 mb-1">
                    {actionMessage}
                  </Alert>
                )}
                {actionError && (
                  <Alert variant="danger" className="app-error-alert mt-3 py-2 mb-1">
                    {actionError}
                  </Alert>
                )}
              </Card.Body>
            </Col>
          </Row>
        </Card>

        {/* RATING + REVIEWS CARD */}
        <Card className="shadow-sm border-0 book-details-reviews-card" style={{ borderRadius: '18px' }}>
          <Card.Body className="p-4 p-lg-4 book-details-main-body">
            {/* Rating form */}
            <h5 className="mb-3">Rate this book</h5>
            <BookRating
              bookId={book._id}
              existingRating={userOwnRating}   // 👈 هنا القفل
              onRated={(data) => {
                setBook((prev) =>
                  prev
                    ? {
                        ...prev,
                        averageRating: data.averageRating,
                        ratingsCount: data.ratingsCount,
                        ratings: data.ratings || prev.ratings,
                      }
                    : prev
                );
              }}
            />

            <hr className="my-4" />

            {/* Reviews */}
            <h5 className="mb-3">User Reviews</h5>

            {/* Filter & Sort */}
            {hasRatings && (
              <Row className="mb-3">
                <Col md={6} className="mb-2">
                  <Form.Label className="me-2">Sort by:</Form.Label>
                  <Dropdown className="glass-filter-dropdown glass-filter-dropdown-sm book-reviews-filter">
                    <Dropdown.Toggle className="glass-filter-toggle" variant="link">
                      <span className="glass-filter-label">{reviewSortLabel}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="glass-filter-menu w-100">
                      <Dropdown.Item
                        active={reviewSort === 'newest'}
                        onClick={() => setReviewSort('newest')}
                      >
                        Newest
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={reviewSort === 'highest'}
                        onClick={() => setReviewSort('highest')}
                      >
                        Highest rating
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={reviewSort === 'lowest'}
                        onClick={() => setReviewSort('lowest')}
                      >
                        Lowest rating
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
                <Col md={6} className="mb-2">
                  <Form.Label className="me-2">Minimum rating:</Form.Label>
                  <Dropdown className="glass-filter-dropdown glass-filter-dropdown-sm book-reviews-filter">
                    <Dropdown.Toggle className="glass-filter-toggle" variant="link">
                      <span className="glass-filter-label">{reviewFilterLabel}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="glass-filter-menu w-100">
                      <Dropdown.Item
                        active={reviewFilter === 'all'}
                        onClick={() => setReviewFilter('all')}
                      >
                        All
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={reviewFilter === '5'}
                        onClick={() => setReviewFilter('5')}
                      >
                        5+
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={reviewFilter === '4'}
                        onClick={() => setReviewFilter('4')}
                      >
                        4+
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={reviewFilter === '3'}
                        onClick={() => setReviewFilter('3')}
                      >
                        3+
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={reviewFilter === '2'}
                        onClick={() => setReviewFilter('2')}
                      >
                        2+
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={reviewFilter === '1'}
                        onClick={() => setReviewFilter('1')}
                      >
                        1+
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
            )}

            {reviewsError && (
              <Alert variant="danger" className="app-error-alert py-2">
                {reviewsError}
              </Alert>
            )}

            {!hasRatings ? (
              <p className="text-muted mt-2">
                No reviews yet. Be the first to rate this book.
              </p>
            ) : (
              <div className="mt-3">
                {ratings.map((r) => (
                  <Card
                    key={r._id || r.createdAt}
                    id={r._id ? `review-${r._id}` : undefined}
                    className="mb-3 shadow-sm border-0 book-review-card"
                    style={{ borderRadius: '12px' }}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div>
                          <strong>
                            {r.user?.username || r.user?.email || 'User'}
                          </strong>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="book-review-card__score">
                            <i className="bi bi-star-fill me-1" aria-hidden="true" /> {r.value} / 5
                          </span>
                          {isAdmin && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="book-review-card__delete"
                              onClick={() => handleDeleteReview(r._id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>

                      {r.comment && <p className="mb-1">{r.comment}</p>}

                      {r.createdAt && (
                        <small className="text-muted">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </small>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
        </Container>

        <VirtualVisaPaymentModal
          show={showBuyPaymentModal}
          onHide={() => {
            if (!loadingBuy) {
              setShowBuyPaymentModal(false);
            }
          }}
          title="Virtual Visa Checkout"
          subtitle="This is a simulated payment gateway. No real card will be charged."
          amountLabel={formatPrice(effectivePurchasePrice)}
          submitLabel={
            inSubscription || isFreeAccessBook
              ? 'Pay and Unlock Download'
              : 'Pay and Buy Book'
          }
          loading={loadingBuy}
          error={showBuyPaymentModal ? actionError : ''}
          onSubmit={handleBuyAndRead}
        />
      </div>
    );
  }


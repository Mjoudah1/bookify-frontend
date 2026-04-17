import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';

export default function BookCard({
  book,
  isOwned,
  onOpen,
  formatRating,
  formatViews,
  formatPrice,
}) {
  const priceNum = Number(book.price) || 0;
  const purchasePriceNum = Number(book.purchasePrice) || 0;
  const inSub = !!book.availableInSubscription;

  return (
    <Card
      className="book-card h-100 border-0 shadow-sm"
      style={{ cursor: 'pointer' }}
      onClick={() => onOpen(book)}
    >
      {book.coverImageUrl ? (
        <div className="book-cover-wrap">
          <Card.Img
            variant="top"
            src={book.coverImageUrl}
            className="book-cover"
            alt={book.title}
          />
        </div>
      ) : (
        <div className="d-flex flex-column align-items-center justify-content-center bg-light book-cover book-cover-placeholder">
          <span style={{ fontSize: '2rem' }}>{'\uD83D\uDCD5'}</span>
          <small className="text-muted mt-1">No cover</small>
        </div>
      )}

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
          <div>
            <div className="book-card-kicker">Featured in catalog</div>
            <Card.Title className="fw-semibold mb-1 book-title">
              {book.title}
            </Card.Title>
            <Card.Subtitle className="text-muted small book-author">
              {book.author || 'Unknown author'}
            </Card.Subtitle>
          </div>

          {isOwned ? (
            <Badge className="badge-soft-green ms-2">Owned</Badge>
          ) : (
            <Badge className="badge-soft-amber ms-2">Explore</Badge>
          )}
        </div>

        <div className="mb-3">
          {book.category && (
            <Badge bg="secondary" className="me-1 mb-1 book-badge-neutral">
              {book.category}
            </Badge>
          )}

          {inSub && (
            <Badge bg="info" className="me-1 mb-1 book-badge-info">
              In subscription
            </Badge>
          )}

          {priceNum === 0 ? (
            <Badge bg="success" className="mb-1 book-badge-success">
              Free
            </Badge>
          ) : (
            <Badge bg="warning" text="dark" className="mb-1 book-badge-warning">
              Paid
            </Badge>
          )}
        </div>

        <div className="book-stats-panel mb-3 small text-muted">
          <div className="book-stat-item">
            <span>
              <i className="bi bi-star-fill me-1" aria-hidden="true" />
              Rating
            </span>
            <strong>{formatRating(book.averageRating)}</strong>
          </div>
          <div className="book-stat-item">
            <span>
              <i className="bi bi-eye-fill me-1" aria-hidden="true" />
              Views
            </span>
            <strong>{formatViews(book.views)}</strong>
          </div>
          <div className="book-stat-item">
            <span>
              <i className="bi bi-tag-fill me-1" aria-hidden="true" />
              Price
            </span>
            <strong>{formatPrice(book.price)}</strong>
          </div>
          {purchasePriceNum > 0 && (
            <div className="book-stat-item">
              <span>
                <i className="bi bi-download me-1" aria-hidden="true" />
                Download
              </span>
              <strong>{formatPrice(book.purchasePrice)}</strong>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <Button
            variant="primary"
            size="sm"
            className="w-100 fw-semibold book-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(book);
            }}
          >
            View details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

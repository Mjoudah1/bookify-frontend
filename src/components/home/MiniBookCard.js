import React from 'react';
import { Card } from 'react-bootstrap';

export default function MiniBookCard({
  book,
  openBook,
  formatRating,
  formatViews,
  variant = 'top-rated',
}) {
  const isTopRated = variant === 'top-rated';
  const primaryIconClass = isTopRated ? 'bi bi-star-fill' : 'bi bi-fire';

  return (
    <div
      className="mini-book-card-shell"
      style={{
        flex: '0 0 280px',
        scrollSnapAlign: 'start',
        direction: 'ltr',
      }}
    >
      <Card
        className={`shadow-sm h-100 mini-book-card ${
          isTopRated ? 'is-top-rated' : 'is-most-viewed'
        }`}
        onClick={() => openBook(book)}
      >
        <Card.Body>
          <div className="mini-book-card__eyebrow">
            {isTopRated ? 'Top rated pick' : 'Trending by views'}
          </div>
          <h6 className="fw-semibold mb-1 mini-book-card__title">{book.title}</h6>
          <p className="text-muted mb-3 mini-book-card__author">
            {book.author || 'Unknown author'}
          </p>

          <div className="mini-book-card__meta">
            <span className="mini-book-card__pill">
              <i className={primaryIconClass} aria-hidden="true" />
              {formatRating(book.averageRating)}
            </span>
            <span className="mini-book-card__pill is-soft">
              <i className="bi bi-eye-fill" aria-hidden="true" />
              {formatViews(book.views)} views
            </span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { normalizeMediaUrl } from '../../utils/media';

export default function BookSliderCard({ book, openBook, getAccessBadges }) {
  const coverUrl = normalizeMediaUrl(book.coverImageUrl);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [coverUrl]);

  return (
    <div className="book-slider-card-shell">
      <Card
        className="shadow-sm h-100 book-slider-card"
        onClick={() => openBook(book)}
      >
        {coverUrl && !imageFailed && (
          <Card.Img
            variant="top"
            src={coverUrl}
            alt={book.title}
            className="book-slider-card__image"
            onError={() => setImageFailed(true)}
          />
        )}

        <Card.Body className="book-slider-card__body">
          <div className="book-slider-card__eyebrow">Featured in catalog</div>

          <Card.Title className="fw-semibold book-slider-card__title">
            {book.title}
          </Card.Title>

          <Card.Subtitle className="book-slider-card__author">
            {book.author || 'Unknown author'}
          </Card.Subtitle>

          <div className="book-slider-card__meta">
            {book.category && (
              <Badge className="book-slider-card__badge is-category">
                {book.category}
              </Badge>
            )}
            {typeof book.averageRating === 'number' && (
              <Badge className="book-slider-card__badge is-rating">
                <i className="bi bi-star-fill" aria-hidden="true" />
                {book.averageRating.toFixed(1)}
              </Badge>
            )}
            {typeof book.views === 'number' && (
              <Badge className="book-slider-card__badge is-views">
                <i className="bi bi-eye-fill" aria-hidden="true" />
                {book.views}
              </Badge>
            )}
          </div>

          <div className="book-slider-card__access">{getAccessBadges(book)}</div>
        </Card.Body>
      </Card>
    </div>
  );
}

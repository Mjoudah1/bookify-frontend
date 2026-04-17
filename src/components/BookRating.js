import React, { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function BookRating({ bookId, onRated, existingRating = null }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const token = getToken();
  const readOnly = !!existingRating;

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.value || 5);
      setComment(existingRating.comment || '');
      setMessage('');
      setIsError(false);
    }
  }, [existingRating]);

  const handleRate = async (e) => {
    e.preventDefault();

    if (readOnly) return;

    if (!bookId) {
      setIsError(true);
      setMessage('Invalid book. Please refresh the page.');
      return;
    }

    if (!token) {
      setIsError(true);
      setMessage('Please log in to rate this book.');
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/books/${bookId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(rating),
          comment: comment.trim() || undefined,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        if (res.status === 401) throw new Error('You must be logged in to rate this book.');
        if (res.status === 403) throw new Error('You are not allowed to rate this book.');
        if (res.status === 400) throw new Error('You have already rated this book.');
        throw new Error('Failed to submit your rating. Please try again.');
      }

      setMessage('Thank you for your rating!');
      setIsError(false);
      onRated?.(data);
    } catch (err) {
      console.error('Rating error:', err);
      setIsError(true);
      setMessage(err.message || 'An error occurred while submitting your rating.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      const active = (hoverRating || rating) >= i;
      stars.push(
        <button
          key={i}
          type="button"
          className="rating-star-btn"
          onClick={() => !loading && token && !readOnly && setRating(i)}
          onMouseEnter={() => token && !readOnly && setHoverRating(i)}
          onMouseLeave={() => token && !readOnly && setHoverRating(0)}
          disabled={loading || !token || readOnly}
          aria-label={`${i} star`}
        >
          <i
            className={`bi ${active ? 'bi-star-fill rating-star-filled' : 'bi-star'} rating-star`}
          />
        </button>
      );
    }

    return stars;
  };

  return (
    <div className="book-rating-card">
      <div className="book-rating-card__top">
        <div>
          <div className="book-rating-card__label">Your rating</div>
          <div className="book-rating-card__stars">
            <div className="rating-stars">{renderStars()}</div>
            <span className="book-rating-card__score">{rating}/5</span>
          </div>
        </div>

        {readOnly && (
          <div className="book-rating-card__readonly">
            <i className="bi bi-check-circle-fill" aria-hidden="true" />
            Already submitted
          </div>
        )}
      </div>

      <form onSubmit={handleRate} className="book-rating-card__form">
        {!readOnly ? (
          <div className="mb-3">
            <label className="form-label mb-2 book-rating-card__comment-label">
              Comment (optional)
            </label>
            <textarea
              className="form-control book-rating-card__textarea"
              rows={3}
              placeholder="Share your thoughts about this book..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading || !token}
            />
          </div>
        ) : (
          <div className="book-rating-card__locked">
            <i className="bi bi-lock-fill" aria-hidden="true" />
            <span>Comment is locked after submission.</span>
          </div>
        )}

        {!readOnly && (
          <button
            className="btn btn-primary book-rating-card__submit"
            type="submit"
            disabled={loading || !token}
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        )}

        {!token && (
          <div className="book-rating-card__hint">
            You must be logged in to rate this book.
          </div>
        )}

        {message && (
          <div className={`book-rating-card__message ${isError ? 'is-error' : 'is-success'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default BookRating;

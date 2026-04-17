import React, { useEffect, useRef, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import BookCard from './BookCard';

export default function BooksGrid({
  loading,
  error,
  books,
  filteredBooks,
  ownedIds,
  onOpenBook,
  formatRating,
  formatViews,
  formatPrice,
}) {
  const sliderRef = useRef(null);
  const [arrows, setArrows] = useState({ left: false, right: false });

  const arrowBtnStyle = (side) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 12,
    width: 48,
    height: 48,
    borderRadius: 999,
    border: '1px solid rgba(255, 255, 255, 0.72)',
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(219, 234, 254, 0.72))',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow:
      '0 16px 36px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.82)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1d4ed8',
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
    cursor: 'pointer',
    zIndex: 6,
    transition:
      'transform 160ms ease, box-shadow 160ms ease, background 160ms ease, color 160ms ease',
    userSelect: 'none',
  });

  const scrollSlider = (dir, step = 320) => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return undefined;

    const updateArrowState = () => {
      const max = el.scrollWidth - el.clientWidth;

      if (max <= 2) {
        setArrows({ left: false, right: false });
        return;
      }

      const eps = 6;
      setArrows({
        left: el.scrollLeft > eps,
        right: el.scrollLeft < max - eps,
      });
    };

    el.scrollLeft = 0;
    updateArrowState();
    el.addEventListener('scroll', updateArrowState, { passive: true });
    window.addEventListener('resize', updateArrowState);

    requestAnimationFrame(() => {
      if (el) {
        el.scrollLeft = 0;
        updateArrowState();
      }
    });

    return () => {
      el.removeEventListener('scroll', updateArrowState);
      window.removeEventListener('resize', updateArrowState);
    };
  }, [filteredBooks.length]);

  if (error) {
    return <Alert variant="danger" className="app-error-alert mb-3">{error}</Alert>;
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3 mb-0 text-muted">Loading your dashboard...</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="empty-state">
        <h6 className="fw-semibold mb-2">No e-books available yet</h6>
        <p className="mb-0">
          Once the admin adds e-books, you&apos;ll see them here.
        </p>
      </div>
    );
  }

  if (filteredBooks.length === 0) {
    return (
      <div className="empty-state">
        <h6 className="fw-semibold mb-2">No books match your filters</h6>
        <p className="mb-0">
          Try clearing some filters or changing the search keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="user-books-slider">
      {arrows.left && (
        <button
          type="button"
          className="cute-arrow user-books-arrow"
          onClick={() => scrollSlider('left', 320)}
          aria-label="Previous"
          style={arrowBtnStyle('left')}
        >
          <i className="bi bi-chevron-left" aria-hidden="true" />
        </button>
      )}

      {arrows.right && (
        <button
          type="button"
          className="cute-arrow user-books-arrow"
          onClick={() => scrollSlider('right', 320)}
          aria-label="Next"
          style={arrowBtnStyle('right')}
        >
          <i className="bi bi-chevron-right" aria-hidden="true" />
        </button>
      )}

      <div ref={sliderRef} className="user-books-slider__rail">
        {filteredBooks.map((book) => (
          <div className="user-books-slider__item" key={book._id}>
          <BookCard
            book={book}
            isOwned={ownedIds.has(book._id)}
            onOpen={onOpenBook}
            formatRating={formatRating}
            formatViews={formatViews}
            formatPrice={formatPrice}
          />
          </div>
        ))}
      </div>
    </div>
  );
}

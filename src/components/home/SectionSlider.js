import React from 'react';
import { Col, Row, Spinner } from 'react-bootstrap';
import MiniBookCard from './MiniBookCard';

export default function SectionSlider({
  title,
  loading,
  books,
  emptyText,
  arrows,
  sliderRef,
  arrowBtnStyle,
  scrollAnySlider,
  openBook,
  formatRating,
  formatViews,
}) {
  const isTopRated = title.toLowerCase().includes('top rated');
  const sectionClassName = isTopRated
    ? 'home-feature-section is-top-rated'
    : 'home-feature-section is-most-viewed';
  const sectionIconClass = isTopRated ? 'bi bi-star-fill' : 'bi bi-fire';
  const sectionEyebrow = isTopRated ? 'Community favorites' : 'Reader momentum';
  const sectionNote = isTopRated
    ? 'Highest-rated picks based on live reader feedback.'
    : 'Books attracting the most attention across the library.';
  const sectionCountLabel = loading
    ? 'Updating...'
    : books.length > 0
    ? `${books.length} books`
    : 'Waiting for activity';

  return (
    <Row className="mt-4">
      <Col>
        <section className={sectionClassName}>
          <div className="home-feature-section__header">
            <div className="home-feature-section__heading">
              <span className="home-feature-section__icon" aria-hidden="true">
                <i className={sectionIconClass} />
              </span>
              <div>
                <div className="home-feature-section__eyebrow">
                  {sectionEyebrow}
                </div>
                <h4 className="home-feature-section__title">{title}</h4>
                <p className="home-feature-section__subtitle mb-0">
                  {sectionNote}
                </p>
              </div>
            </div>

            <div className="home-feature-section__meta">{sectionCountLabel}</div>
          </div>

          {loading ? (
            <div className="home-feature-section__state">
              <Spinner animation="border" />
            </div>
          ) : books.length === 0 ? (
            <div className="home-feature-empty">
              <div className="home-feature-empty__icon" aria-hidden="true">
                <i className={sectionIconClass} />
              </div>
              <div className="home-feature-empty__title">Nothing here yet</div>
              <p className="home-feature-empty__text mb-0">{emptyText}</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {arrows.left && (
                <button
                  type="button"
                  className="cute-arrow"
                  onClick={() => scrollAnySlider(sliderRef, 'left', 320)}
                  aria-label="Previous"
                  style={arrowBtnStyle('left')}
                >
                  <i className="bi bi-chevron-left" aria-hidden="true" />
                </button>
              )}

              {arrows.right && (
                <button
                  type="button"
                  className="cute-arrow"
                  onClick={() => scrollAnySlider(sliderRef, 'right', 320)}
                  aria-label="Next"
                  style={arrowBtnStyle('right')}
                >
                  <i className="bi bi-chevron-right" aria-hidden="true" />
                </button>
              )}

              <div
                ref={sliderRef}
                style={{
                  display: 'flex',
                  gap: '16px',
                  overflowX: 'auto',
                  padding: '10px 52px 6px',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  direction: 'ltr',
                }}
              >
                {books.map((book) => (
                  <MiniBookCard
                    key={book._id}
                    book={book}
                    openBook={openBook}
                    formatRating={formatRating}
                    formatViews={formatViews}
                    variant={isTopRated ? 'top-rated' : 'most-viewed'}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </Col>
    </Row>
  );
}

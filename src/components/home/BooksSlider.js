import React from 'react';
import { Alert, Card, Col, Dropdown, Row, Spinner } from 'react-bootstrap';
import BookSliderCard from './BookSliderCard';

export default function BooksSlider({
  loading,
  error,
  filteredBooks,
  books,
  allArrows,
  sliderRef,
  arrowBtnStyle,
  scrollAnySlider,
  accessFilter,
  setAccessFilter,
  sortBy,
  setSortBy,
  openBook,
  getAccessBadges,
}) {
  const summaryContent = loading ? (
    'Updating library'
  ) : (
    <>
      <span className="books-showcase-card__meta-text">Showing</span>
      <span className="books-showcase-card__meta-value">
        {filteredBooks.length}
      </span>
      <span className="books-showcase-card__meta-text">of</span>
      <span className="books-showcase-card__meta-value">{books.length}</span>
      <span className="books-showcase-card__meta-text">books</span>
    </>
  );

  const accessFilterLabel =
    {
      all: 'All access types',
      subscription: 'In Subscription',
      paid: 'Paid only',
      free: 'Free',
    }[accessFilter] || 'All access types';

  const sortByLabel =
    {
      default: 'Sort: Default',
      'title-asc': 'Title A to Z',
      'rating-desc': 'Highest rating',
      'views-desc': 'Most viewed',
      newest: 'Newest',
    }[sortBy] || 'Sort: Default';

  return (
    <Row className="mt-2">
      <Col>
        <Card className="books-showcase-card shadow-sm border-0">
          <Card.Header className="books-showcase-card__header">
            <div className="books-showcase-card__top">
              <div className="books-showcase-card__heading">
                <span className="books-showcase-card__icon" aria-hidden="true">
                  <i className="bi bi-journal-richtext" />
                </span>
                <div>
                  <div className="books-showcase-card__eyebrow">
                    Browse the collection
                  </div>
                  <h5 className="mb-0 fw-bold">All E-Books</h5>
                  <p className="books-showcase-card__subtitle mb-0">
                    Browse the complete electronic collection in Bookify Library.
                  </p>
                </div>
              </div>

              <div className="books-showcase-card__meta">{summaryContent}</div>
            </div>

            <div className="books-showcase-card__filters">
              <Dropdown className="glass-filter-dropdown glass-filter-dropdown-sm">
                <Dropdown.Toggle className="glass-filter-toggle" variant="link">
                  <span className="glass-filter-label">{accessFilterLabel}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="glass-filter-menu w-100">
                  <Dropdown.Item
                    active={accessFilter === 'all'}
                    onClick={() => setAccessFilter('all')}
                  >
                    All access types
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={accessFilter === 'subscription'}
                    onClick={() => setAccessFilter('subscription')}
                  >
                    In Subscription
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={accessFilter === 'paid'}
                    onClick={() => setAccessFilter('paid')}
                  >
                    Paid only
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={accessFilter === 'free'}
                    onClick={() => setAccessFilter('free')}
                  >
                    Free
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown className="glass-filter-dropdown glass-filter-dropdown-sm">
                <Dropdown.Toggle className="glass-filter-toggle" variant="link">
                  <span className="glass-filter-label">{sortByLabel}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="glass-filter-menu w-100">
                  <Dropdown.Item
                    active={sortBy === 'default'}
                    onClick={() => setSortBy('default')}
                  >
                    Sort: Default
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={sortBy === 'title-asc'}
                    onClick={() => setSortBy('title-asc')}
                  >
                    Title A to Z
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={sortBy === 'rating-desc'}
                    onClick={() => setSortBy('rating-desc')}
                  >
                    Highest rating
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={sortBy === 'views-desc'}
                    onClick={() => setSortBy('views-desc')}
                  >
                    Most viewed
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={sortBy === 'newest'}
                    onClick={() => setSortBy('newest')}
                  >
                    Newest
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Card.Header>

          <Card.Body className="books-showcase-card__body">
            {loading ? (
              <div className="books-showcase-card__state">
                <Spinner animation="border" />
              </div>
            ) : error ? (
              <Alert variant="danger" className="app-error-alert mb-0">
                {error}
              </Alert>
            ) : filteredBooks.length === 0 ? (
              <div className="home-feature-empty">
                <div className="home-feature-empty__icon" aria-hidden="true">
                  <i className="bi bi-search" />
                </div>
                <div className="home-feature-empty__title">No matches found</div>
                <p className="home-feature-empty__text mb-0">
                  No e-books matched the current search and filters. Try a broader
                  keyword or switch the access type.
                </p>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {allArrows.left && (
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

                {allArrows.right && (
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
                  className="books-showcase-card__rail"
                >
                  {filteredBooks.map((book) => (
                    <BookSliderCard
                      key={book._id}
                      book={book}
                      openBook={openBook}
                      getAccessBadges={getAccessBadges}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

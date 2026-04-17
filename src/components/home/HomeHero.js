import React, { useEffect, useState } from 'react';
import {
  Badge,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  InputGroup,
  Row,
  Spinner,
} from 'react-bootstrap';

export default function HomeHero({
  loading,
  sectionLoading,
  books,
  topRated,
  totalCategories,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  spotlightBook,
  openBook,
  formatRating,
  formatViews,
}) {
  const [searchInput, setSearchInput] = useState(searchTerm || '');

  useEffect(() => {
    setSearchInput(searchTerm || '');
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
  };

  const selectedCategoryLabel =
    selectedCategory === 'all' || !selectedCategory
      ? 'All categories'
      : selectedCategory;

  return (
    <section
      style={{
        backgroundImage: `
          linear-gradient(
            to right,
            rgba(15, 23, 42, 0.95),
            rgba(37, 99, 235, 0.85),
            rgba(37, 99, 235, 0.55)
          ),
          url("/images/bookify.jpg")
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        color: 'white',
        padding: '3.5rem 0 3rem',
      }}
    >
      <Container>
        <Row className="align-items-center">
          <Col md={7} className="mb-4 mb-md-0">
            <div>
              <p
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontSize: '0.8rem',
                  opacity: 0.85,
                  marginBottom: '0.4rem',
                }}
              >
                Smart Electronic Library System
              </p>

              <h1 className="fw-bold mb-2" style={{ fontSize: '2.4rem' }}>
                Bookify E-Library
              </h1>

              <p className="mb-2" style={{ maxWidth: '520px', opacity: 0.95 }}>
                A modern digital library where users can discover, read via
                subscription, or purchase e-books in one place.
              </p>

              <p style={{ maxWidth: '520px', fontSize: '0.9rem', opacity: 0.9 }}>
                Manage your electronic catalog, follow popular titles, and
                give readers a smooth online reading experience.
              </p>
            </div>

            <div
              className="mt-4 p-3 hero-filter-panel"
              style={{
                background: 'rgba(15,23,42,0.35)',
                borderRadius: '16px',
                backdropFilter: 'blur(6px)',
              }}
            >
              <Row className="g-2">
                <Col md={7}>
                  <Form onSubmit={handleSearchSubmit}>
                    <InputGroup className="hero-search-group">
                      <Form.Control
                        className="hero-search-input"
                        placeholder="Search by title, author, ISBN..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="btn hero-search-button"
                        aria-label="Search books"
                      >
                        <i className="bi bi-search" aria-hidden="true" />
                      </button>
                    </InputGroup>
                  </Form>
                </Col>

                <Col md={5}>
                  <Dropdown
                    className="hero-category-dropdown"
                    popperConfig={{ strategy: 'fixed' }}
                  >
                    <Dropdown.Toggle
                      className="hero-category-toggle"
                      variant="link"
                    >
                      <span className="hero-category-toggle-label">
                        {selectedCategoryLabel}
                      </span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="hero-category-menu w-100">
                      <Dropdown.Item
                        active={selectedCategory === 'all'}
                        onClick={() => setSelectedCategory('all')}
                      >
                        All categories
                      </Dropdown.Item>

                      {categories.singles.map((c) => (
                        <Dropdown.Item
                          key={`single-${c}`}
                          active={selectedCategory === c}
                          onClick={() => setSelectedCategory(c)}
                        >
                          {c}
                        </Dropdown.Item>
                      ))}

                      {categories.combos.length > 0 && (
                        <>
                          <Dropdown.Divider />
                          <Dropdown.Header>Combined categories</Dropdown.Header>
                          {categories.combos.map((combo) => (
                            <Dropdown.Item
                              key={`combo-${combo}`}
                              active={selectedCategory === combo}
                              onClick={() => setSelectedCategory(combo)}
                            >
                              {combo}
                            </Dropdown.Item>
                          ))}
                        </>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>

              <small
                className="mt-2 d-block"
                style={{ fontSize: '0.78rem', opacity: 0.8 }}
              >
                Use the search and filters to quickly locate any e-book in the system.
              </small>
            </div>

            <Row className="mt-4 g-3">
              <Col md={4} xs={12}>
                <div className="hero-stat-card is-books">
                  <div className="hero-stat-card__icon">
                    <i className="bi bi-book-half" aria-hidden="true" />
                  </div>
                  <div className="hero-stat-card__content">
                    <span className="hero-stat-card__eyebrow">Library snapshot</span>
                    <div className="hero-stat-card__label">Total E-Books</div>
                    <div className="hero-stat-card__value">
                      {loading ? '-' : books.length}
                    </div>
                  </div>
                </div>
              </Col>

              <Col md={4} xs={12}>
                <div className="hero-stat-card is-categories">
                  <div className="hero-stat-card__icon">
                    <i className="bi bi-grid-1x2-fill" aria-hidden="true" />
                  </div>
                  <div className="hero-stat-card__content">
                    <span className="hero-stat-card__eyebrow">Browse depth</span>
                    <div className="hero-stat-card__label">Categories</div>
                    <div className="hero-stat-card__value">
                      {loading ? '-' : totalCategories}
                    </div>
                  </div>
                </div>
              </Col>

              <Col md={4} xs={12}>
                <div className="hero-stat-card is-top-rated">
                  <div className="hero-stat-card__icon">
                    <i className="bi bi-star-fill" aria-hidden="true" />
                  </div>
                  <div className="hero-stat-card__content">
                    <span className="hero-stat-card__eyebrow">Trending picks</span>
                    <div className="hero-stat-card__label">Top Rated</div>
                    <div className="hero-stat-card__value">
                      {sectionLoading ? '-' : topRated.length}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>

          <Col md={5}>
            <Card
              className="shadow-lg hero-spotlight-card"
              style={{
                borderRadius: '18px',
                background:
                  'linear-gradient(145deg, rgba(15,23,42,0.74), rgba(37,99,235,0.7))',
                border: '1px solid rgba(255,255,255,0.26)',
                color: 'white',
                boxShadow: '0 18px 45px rgba(15,23,42,0.32)',
                transition: '0.3s',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Card.Body className="hero-spotlight-card__body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div
                      className="hero-spotlight-card__eyebrow"
                      style={{
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        opacity: 0.85,
                      }}
                    >
                      Library Spotlight
                    </div>
                    <div
                      className="fw-semibold hero-spotlight-card__title"
                      style={{ fontSize: '1.05rem' }}
                    >
                      Featured E-Book (Newest)
                    </div>
                  </div>

                  <Badge
                    bg="info"
                    pill
                    className="hero-spotlight-card__live"
                    style={{
                      boxShadow: '0 0 8px rgba(56,189,248,0.8)',
                      fontSize: '0.7rem',
                    }}
                  >
                    Live
                  </Badge>
                </div>

                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : !spotlightBook ? (
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'rgba(226,232,240,0.9)',
                      marginBottom: 0,
                    }}
                  >
                    No books yet. Once the admin adds a new book, it will appear
                    here automatically.
                  </p>
                ) : (
                  <>
                    <div
                      className="mb-3 hero-spotlight-book"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(59,130,246,0.48), rgba(96,165,250,0.34))',
                        borderRadius: '14px',
                        padding: '0.9rem',
                        cursor: 'pointer',
                        backdropFilter: 'blur(16px)',
                      }}
                      onClick={() => openBook(spotlightBook)}
                    >
                      <div className="hero-spotlight-book__kicker">
                        Recently added to the library
                      </div>
                      <div className="d-flex align-items-center">
                        {spotlightBook.coverImageUrl ? (
                          <img
                            src={spotlightBook.coverImageUrl}
                            alt={spotlightBook.title}
                            className="hero-spotlight-book__cover"
                          />
                        ) : (
                          <div
                            className="hero-spotlight-book__monogram"
                            style={{
                              width: 44,
                              height: 60,
                              borderRadius: '10px',
                              background: 'rgba(15,23,42,0.22)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '1.4rem',
                              color: '#e5edff',
                            }}
                          >
                            {spotlightBook.title?.charAt(0) || 'B'}
                          </div>
                        )}

                        <div className="ms-3 flex-grow-1">
                          <div
                            className="fw-semibold hero-spotlight-book__title"
                            style={{ fontSize: '0.95rem' }}
                          >
                            {spotlightBook.title}
                          </div>
                          <div
                            className="hero-spotlight-book__author"
                            style={{ fontSize: '0.8rem', opacity: 0.9 }}
                          >
                            {spotlightBook.author || 'Unknown author'}
                          </div>
                          <div className="mt-2 hero-spotlight-book__stats">
                            <Badge
                              bg="light"
                              text="dark"
                              className="hero-spotlight-book__pill is-rating"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <i className="bi bi-star-fill" aria-hidden="true" />
                              {formatRating(spotlightBook.averageRating)}
                            </Badge>
                            <Badge
                              bg="dark"
                              className="hero-spotlight-book__pill is-views"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <i className="bi bi-eye-fill" aria-hidden="true" />
                              {formatViews(spotlightBook.views)} views
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="hero-spotlight-card__note"
                      style={{
                        fontSize: '0.8rem',
                        color: 'rgba(226,232,240,0.9)',
                      }}
                    >
                      This panel automatically shows the newest book added to the library.
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

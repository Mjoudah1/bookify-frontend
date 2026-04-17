import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Dropdown,
  Form,
  InputGroup,
} from 'react-bootstrap';

export default function UserFilters({
  mode,
  setMode,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  accessFilter,
  setAccessFilter,
  sortBy,
  setSortBy,
  categories,
  totalBooks,
  myOwnedCount,
  filteredBooksLength,
}) {
  const [searchInput, setSearchInput] = useState(searchTerm || '');

  useEffect(() => {
    setSearchInput(searchTerm || '');
  }, [searchTerm]);

  const selectedCategoryLabel =
    selectedCategory === 'all' || !selectedCategory
      ? 'All categories'
      : selectedCategory;

  const accessFilterLabel =
    {
      all: 'All access types',
      subscription: 'In subscription',
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
  };

  return (
    <>
      <div className="dashboard-toolbar d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="dashboard-toolbar__title">
          <div className="dashboard-toolbar__eyebrow">Based on your interests</div>
          <h5 className="section-title mb-1">
            <span className="dashboard-toolbar__icon" aria-hidden="true">
              <i className="bi bi-collection-fill" />
            </span>
            Recommended E-Books
          </h5>
          <p className="section-subtitle mb-0">
            These titles match the interests you selected in Bookify.
          </p>
        </div>
        <div className="dashboard-results-chip">
          <span>Showing</span>
          <strong>{filteredBooksLength}</strong>
          <span>of {totalBooks} books</span>
        </div>
      </div>

      <div className="filter-panel mb-4">
        <Row className="g-3">
          <Col lg={4} md={12}>
            <Form onSubmit={handleSearchSubmit}>
              <InputGroup className="user-search-group">
                <button
                  type="submit"
                  className="btn user-search-button"
                  aria-label="Search books"
                >
                  <i className="bi bi-search" aria-hidden="true" />
                </button>
                <Form.Control
                  className="user-search-input"
                  placeholder="Search by title, author, ISBN, description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </InputGroup>
            </Form>
          </Col>

          <Col lg={3} md={4}>
            <Dropdown className="glass-filter-dropdown">
              <Dropdown.Toggle className="glass-filter-toggle" variant="link">
                <span className="glass-filter-label">{selectedCategoryLabel}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="glass-filter-menu w-100">
                {categories.map((c) => (
                  <Dropdown.Item
                    key={c}
                    active={selectedCategory === c}
                    onClick={() => setSelectedCategory(c)}
                  >
                    {c === 'all' ? 'All categories' : c}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>

          <Col lg={3} md={4}>
            <Dropdown className="glass-filter-dropdown">
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
                  In subscription
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
          </Col>

          <Col lg={2} md={4}>
            <Dropdown className="glass-filter-dropdown">
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
          </Col>
        </Row>
      </div>

      <div className="dashboard-results d-flex justify-content-between align-items-center mb-3 small text-muted flex-wrap gap-2">
        <span>
          Showing <strong>{filteredBooksLength}</strong> of <strong>{totalBooks}</strong> books
        </span>
        <span>
          My books: <strong>{myOwnedCount}</strong>
        </span>
      </div>
    </>
  );
}

import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

export default function UserHero({
  username,
  totalBooks,
  myOwnedCount,
  subscriptionBooksCount,
  onBrowseLibrary,
  onOpenMyBooks,
}) {
  const readyToExplore = totalBooks;

  return (
    <section className="user-hero-section">
      <Container>
        <Row className="align-items-center g-4">
          <Col md={8}>
            <div className="user-chip mb-3 d-inline-flex align-items-center gap-2">
              <span className="user-chip__icon" aria-hidden="true">
                <i className="bi bi-stars" />
              </span>
              <span>Welcome back to Bookify</span>
            </div>

            <h1 className="user-hero-title mt-1">
              Hi {username}
              <span className="user-hero-wave" aria-hidden="true">
                {' '}
                👋
              </span>
            </h1>

            <p className="user-hero-subtitle mb-0">
              Explore e-books tailored to your interests, revisit your shelf,
              and continue reading from one personalized space.
            </p>

            <div className="user-hero-actions mt-4">
              <Button
                type="button"
                className="user-hero-action-btn user-hero-action-btn--primary"
                onClick={onBrowseLibrary}
              >
                <i className="bi bi-compass-fill" aria-hidden="true" />
                Explore Interests
              </Button>
              <Button
                type="button"
                className="user-hero-action-btn user-hero-action-btn--secondary"
                onClick={onOpenMyBooks}
              >
                <i className="bi bi-bookmark-heart-fill" aria-hidden="true" />
                Continue with My Books
              </Button>
            </div>

            <div className="user-hero-metrics mt-4">
              <div className="hero-metric-pill is-collection">
                <span className="hero-metric-icon" aria-hidden="true">
                  <i className="bi bi-stars" />
                </span>
                <span className="hero-metric-label">For you</span>
                <strong>{totalBooks}</strong>
              </div>
              <div className="hero-metric-pill is-owned">
                <span className="hero-metric-icon" aria-hidden="true">
                  <i className="bi bi-book-fill" />
                </span>
                <span className="hero-metric-label">My books</span>
                <strong>{myOwnedCount}</strong>
              </div>
              <div className="hero-metric-pill is-subscription">
                <span className="hero-metric-icon" aria-hidden="true">
                  <i className="bi bi-gem" />
                </span>
                <span className="hero-metric-label">Subscription</span>
                <strong>{subscriptionBooksCount}</strong>
              </div>
            </div>
          </Col>

          <Col
            md={4}
            className="mt-3 mt-md-0 d-flex justify-content-md-end justify-content-start"
          >
            <div className="stats-card text-md-end text-start">
              <div className="stats-card-top">
                <div>
                  <div className="stats-card-kicker">Reader Snapshot</div>
                  <div className="stats-card-title">Your reading space</div>
                </div>
                <span className="stats-card-icon" aria-hidden="true">
                  <i className="bi bi-journal-richtext" />
                </span>
              </div>

              <div className="stats-card-highlight">
                <span className="stats-card-highlight__label">Ready to explore</span>
                <strong>{readyToExplore}</strong>
              </div>

              <div className="stats-card-row">
                <span>Owned books</span>
                <strong>{myOwnedCount}</strong>
              </div>

              <div className="stats-card-row">
                <span>Subscription titles</span>
                <strong>{subscriptionBooksCount}</strong>
              </div>

              <div className="stats-card-row">
                <span>Interest matches</span>
                <strong>{totalBooks}</strong>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

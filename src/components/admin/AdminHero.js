import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

export default function AdminHero() {
  return (
    <Card className="mb-4 shadow-sm border-0 admin-hero-card">
      <Card.Body>
        <Row className="align-items-center g-4">
          <Col>
            <div className="admin-hero-copy">
              <div className="admin-hero-copy__top">
                <span className="admin-hero-icon" aria-hidden="true">
                  <i className="bi bi-grid-1x2-fill" />
                </span>
                <div>
                  <div className="admin-hero-kicker">Dashboard overview</div>
                  <h2 className="admin-hero-title">Admin Control Center</h2>
                </div>
              </div>

              <p className="admin-hero-description">
                Monitor your electronic library, manage users, and control
                catalog activity from one polished workspace.
              </p>

              <div className="admin-hero-chips">
                <span className="admin-hero-chip">
                  <i className="bi bi-people-fill" aria-hidden="true" />
                  Users
                </span>
                <span className="admin-hero-chip">
                  <i className="bi bi-book-half" aria-hidden="true" />
                  Catalog
                </span>
                <span className="admin-hero-chip">
                  <i className="bi bi-bell-fill" aria-hidden="true" />
                  Messages
                </span>
              </div>
            </div>
          </Col>

          <Col md="auto" className="text-md-end mt-3 mt-md-0">
            <div className="admin-hero-badge">
              <span className="admin-hero-badge__dot" aria-hidden="true" />
              <span>Bookify Electronic Library</span>
              <span className="admin-hero-badge__divider" aria-hidden="true" />
              <span>Admin</span>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

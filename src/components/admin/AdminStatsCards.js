import React from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';

export default function AdminStatsCards({
  loading,
  totalBooksCard,
  subscriptionBooksCard,
  paidBooksCard,
  registeredUsersCard,
  adminCountCard,
  activeSubsCard,
  expiredSubsCard,
  inactiveSubsCard,
}) {
  return (
    <Row className="mb-4">
      <Col md={3} className="mb-3">
        <Card
          className="shadow-sm h-100 border-0"
          style={{ borderRadius: '16px', background: '#ffffff' }}
        >
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Total Books</div>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h3 className="mb-0 fw-bold">{totalBooksCard}</h3>
                )}
              </div>
              <span style={{ fontSize: '1.8rem' }}>📚</span>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} className="mb-3">
        <Card
          className="shadow-sm h-100 border-0"
          style={{ borderRadius: '16px', background: '#e0f2fe' }}
        >
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Subscription Books</div>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h3 className="mb-0 fw-bold text-primary">
                    {subscriptionBooksCard}
                  </h3>
                )}
              </div>
              <span style={{ fontSize: '1.8rem' }}>📘</span>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} className="mb-3">
        <Card
          className="shadow-sm h-100 border-0"
          style={{ borderRadius: '16px', background: '#fef3c7' }}
        >
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Paid Books</div>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h3 className="mb-0 fw-bold text-warning">{paidBooksCard}</h3>
                )}
              </div>
              <span style={{ fontSize: '1.8rem' }}>💲</span>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} className="mb-3">
        <Card
          className="shadow-sm h-100 border-0"
          style={{ borderRadius: '16px', background: '#ede9fe' }}
        >
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Registered Users</div>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <h3 className="mb-0 fw-bold text-dark">
                      {registeredUsersCard}
                    </h3>
                    <div className="small text-muted mt-1">
                      Admins: {adminCountCard}
                    </div>
                    <div className="small text-muted">
                      Subs: {activeSubsCard} active · {expiredSubsCard} expired ·{' '}
                      {inactiveSubsCard} inactive
                    </div>
                  </>
                )}
              </div>
              <span style={{ fontSize: '1.8rem' }}>👥</span>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
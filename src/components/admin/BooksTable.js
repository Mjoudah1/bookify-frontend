import React from 'react';
import { Row, Col, Card, Table, Button, Spinner, Badge } from 'react-bootstrap';

export default function BooksTable({
  books,
  loading,
  loadingDeleteBook,
  formatPrice,
  getAccessTypeBadge,
  handleOpenEditBook,
  handleDeleteBook,
}) {
  return (
    <Row className="mb-5">
      <Col>
        <Card className="admin-panel-card shadow-sm border-0">
          <Card.Body className="p-4">
            <div className="admin-section-head d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <div className="admin-section-title-wrap">
                  <span className="admin-section-title-icon" aria-hidden="true">
                    <i className="bi bi-journals" />
                  </span>
                  <div>
                    <div className="admin-kicker">Library Catalog</div>
                    <h5 className="mb-1 fw-bold">Catalog Overview</h5>
                  </div>
                </div>
                <small className="text-muted">
                  View all e-books, their price, subscription status and
                  actions.
                </small>
              </div>
              <div className="admin-meta-chip">
                {books.length} books
              </div>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center my-4">
                <Spinner animation="border" />
              </div>
            ) : books.length === 0 ? (
              <p className="text-muted mt-3">No books found.</p>
            ) : (
              <div className="table-responsive mt-3 admin-table-shell">
                <Table hover size="sm" className="admin-table admin-books-table">
                  <thead>
                    <tr>
                      <th>Cover</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>ISBN</th>
                      <th>Pricing</th>
                      <th>Subscription</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book._id} className="admin-book-row">
                        <td style={{ width: '86px' }}>
                          {book.coverImageUrl ? (
                            <div className="admin-book-cover">
                              <img
                                src={book.coverImageUrl}
                                alt={book.title}
                                className="admin-book-cover__image"
                              />
                            </div>
                          ) : (
                            <div className="admin-book-cover admin-book-cover--empty">
                              <i className="bi bi-book-half" aria-hidden="true" />
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="admin-book-title-cell">
                            <div className="admin-book-title-cell__title">
                              {book.title}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin-book-muted">{book.author}</span>
                        </td>
                        <td>{book.category || '-'}</td>
                        <td>{book.isbn || '-'}</td>
                        <td>
                          <div className="small admin-pricing-stack">
                            <div className="admin-pricing-line">
                              Access: {formatPrice(book.price)}
                            </div>
                            <div className="admin-pricing-line admin-pricing-line--muted">
                              Download: {formatPrice(book.purchasePrice)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge
                            className="admin-book-badge admin-book-badge--subscription"
                            bg={
                              book.availableInSubscription ? 'info' : 'secondary'
                            }
                          >
                            {book.availableInSubscription
                              ? 'In Subscription'
                              : 'Not In Subscription'}
                          </Badge>
                        </td>
                        <td>{getAccessTypeBadge(book)}</td>
                        <td className="admin-book-description-cell">
                          <span className="small text-muted admin-book-description">
                            {book.description
                              ? book.description.length > 80
                                ? `${book.description.substring(0, 80)}...`
                                : book.description
                              : '-'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-book-actions">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="admin-book-action admin-book-action--edit"
                            onClick={() => handleOpenEditBook(book)}
                          >
                            <i className="bi bi-pencil-square" aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="admin-book-action admin-book-action--delete"
                            onClick={() => handleDeleteBook(book._id)}
                            disabled={loadingDeleteBook === book._id}
                          >
                            <i className="bi bi-trash3" aria-hidden="true" />
                            {loadingDeleteBook === book._id
                              ? 'Deleting...'
                              : 'Delete'}
                          </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

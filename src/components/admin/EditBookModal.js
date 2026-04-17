import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Dropdown } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/api';

const formatEditBookError = (message) => {
  if (!message) return 'Something went wrong while updating this book.';

  const normalizedMessage = String(message).trim();
  const lowerMessage = normalizedMessage.toLowerCase();

  if (lowerMessage.includes('duplicate isbn')) {
    return 'This ISBN is already in use. Please enter a different ISBN.';
  }

  if (lowerMessage.includes('isbn must contain digits only')) {
    return 'ISBN must contain numbers only.';
  }

  if (lowerMessage.includes('update failed')) {
    return 'We could not save your changes right now. Please try again.';
  }

  return normalizedMessage;
};

export default function EditBookModal({
  show,
  onClose,
  book,
  onBookUpdated,
  getAuthHeaders,
}) {
  const normalizeIsbnInput = (value) => value.replace(/\D/g, '');

  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    isbn: '',
    price: '',
    purchasePrice: '',
    availableInSubscription: 'true',
  });

  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editEbookFile, setEditEbookFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subscriptionLabel =
    editForm.availableInSubscription === 'true' ? 'Yes' : 'No';

  // ✅ حماية من undefined
  useEffect(() => {
    if (!book) return;

    setEditForm({
      title: book?.title || '',
      author: book?.author || '',
      category: book?.category || '',
      description: book?.description || '',
      isbn: book?.isbn || '',
      price:
        book?.price !== undefined ? String(book.price) : '',
      purchasePrice:
        book?.purchasePrice !== undefined ? String(book.purchasePrice) : '',
      availableInSubscription: book?.availableInSubscription
        ? 'true'
        : 'false',
    });
  }, [book]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!book) return;

    if (!editForm.isbn || !/^\d+$/.test(editForm.isbn)) {
      setError(formatEditBookError('ISBN must contain digits only.'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      Object.keys(editForm).forEach((key) =>
        formData.append(key, editForm[key])
      );

      if (editCoverFile)
        formData.append('coverImage', editCoverFile);

      if (editEbookFile)
        formData.append('ebookFile', editEbookFile);

      const res = await fetch(
        `${API_BASE_URL}/api/books/${book._id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      onBookUpdated(data.book);
      onClose();
    } catch (err) {
      setError(formatEditBookError(err.message || 'Update failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show && !!book}
      onHide={onClose}
      centered
      size="lg"
      dialogClassName="edit-book-modal"
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="edit-book-modal__header">
          <div className="edit-book-modal__title-row">
            <span className="edit-book-modal__icon" aria-hidden="true">
              <i className="bi bi-pencil-square" />
            </span>
            <div>
              <div className="edit-book-modal__eyebrow">Catalog editor</div>
              <Modal.Title>Edit Book</Modal.Title>
              <div className="edit-book-modal__subtitle">
                Update metadata, pricing, files, and access settings for this title.
              </div>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="edit-book-modal__body">
          {error && (
            <Alert variant="danger" className="admin-create-user-card__alert admin-form-alert app-error-alert is-danger mb-4">
              <div className="admin-create-user-card__alert-copy">
                <div className="admin-create-user-card__alert-title is-danger">
                  Please review the book details
                </div>
                <div className="admin-create-user-card__alert-text is-danger">
                  {error}
                </div>
              </div>
            </Alert>
          )}

          <section className="edit-book-modal__section">
            <div className="edit-book-modal__section-head">
              <div className="edit-book-modal__section-kicker">Basic info</div>
              <div className="edit-book-modal__section-text">
                Refresh the main catalog details readers will see first.
              </div>
            </div>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    className="admin-input"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Author</Form.Label>
                  <Form.Control
                    className="admin-input"
                    value={editForm.author}
                    onChange={(e) =>
                      setEditForm({ ...editForm, author: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    className="admin-input"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                  />
                  <div className="edit-book-modal__hint">
                    Use one or more categories to improve discoverability.
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>ISBN</Form.Label>
                  <Form.Control
                    className="admin-input"
                    value={editForm.isbn}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        isbn: normalizeIsbnInput(e.target.value),
                      })
                    }
                    inputMode="numeric"
                    pattern="\d+"
                    required
                  />
                  <div className="edit-book-modal__hint">
                    Numbers only, and it must remain unique for cleaner inventory and purchase flows.
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </section>

          <section className="edit-book-modal__section">
            <div className="edit-book-modal__section-head">
              <div className="edit-book-modal__section-kicker">Pricing</div>
              <div className="edit-book-modal__section-text">
                Control direct access, paid downloads, and subscription availability.
              </div>
            </div>

            <Row className="g-3">
              <Col md={4}>
                <Form.Group className="edit-book-modal__mini-card">
                  <div className="edit-book-modal__mini-top">
                    <Form.Label className="mb-0">Price</Form.Label>
                    <span className="edit-book-modal__mini-pill">Access</span>
                  </div>
                  <Form.Control
                    type="number"
                    className="admin-input admin-number-input"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="edit-book-modal__mini-card">
                  <div className="edit-book-modal__mini-top">
                    <Form.Label className="mb-0">Purchase Price (Download)</Form.Label>
                    <span className="edit-book-modal__mini-pill is-soft">Optional</span>
                  </div>
                  <Form.Control
                    type="number"
                    className="admin-input admin-number-input"
                    value={editForm.purchasePrice}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        purchasePrice: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="edit-book-modal__mini-card">
                  <div className="edit-book-modal__mini-top">
                    <Form.Label className="mb-0">Subscription</Form.Label>
                    <span className="edit-book-modal__mini-pill is-soft">Access</span>
                  </div>
                  <Dropdown className="glass-filter-dropdown edit-book-modal__dropdown">
                    <Dropdown.Toggle
                      className="glass-filter-toggle admin-input edit-book-modal__dropdown-toggle"
                      variant="link"
                    >
                      <span className="glass-filter-label">{subscriptionLabel}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="glass-filter-menu w-100">
                      <Dropdown.Item
                        active={editForm.availableInSubscription === 'true'}
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            availableInSubscription: 'true',
                          })
                        }
                      >
                        Yes
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={editForm.availableInSubscription === 'false'}
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            availableInSubscription: 'false',
                          })
                        }
                      >
                        No
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>
            </Row>
          </section>

          <section className="edit-book-modal__section">
            <div className="edit-book-modal__section-head">
              <div className="edit-book-modal__section-kicker">Content</div>
              <div className="edit-book-modal__section-text">
                Update the summary, cover, and digital file without leaving this modal.
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                className="admin-input"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="edit-book-modal__mini-card">
                  <Form.Label>Cover Image</Form.Label>
                  <Form.Control
                    type="file"
                    className="admin-input"
                    onChange={(e) => setEditCoverFile(e.target.files[0])}
                  />
                  <div className="edit-book-modal__hint">
                    Optional, but a strong cover makes the catalog look richer.
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="edit-book-modal__mini-card">
                  <Form.Label>E-book File</Form.Label>
                  <Form.Control
                    type="file"
                    className="admin-input"
                    onChange={(e) => setEditEbookFile(e.target.files[0])}
                  />
                  <div className="edit-book-modal__hint">
                    Replace the source file only when needed.
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </section>
        </Modal.Body>

        <Modal.Footer className="edit-book-modal__footer">
          <Button variant="light" className="edit-book-modal__cancel" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" className="edit-book-modal__save" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

// frontend/src/components/AddBook.jsx
import React, { useState } from 'react';
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  InputGroup,
} from 'react-bootstrap';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../utils/api';
const BOOKS_URL = `${API_BASE_URL}/api/books`;

const formatBookError = (message) => {
  if (!message) return 'Something went wrong while saving this book.';

  const normalizedMessage = String(message).trim();
  const lowerMessage = normalizedMessage.toLowerCase();

  if (lowerMessage.includes('duplicate isbn')) {
    return 'This ISBN is already in use. Please enter a different ISBN.';
  }

  if (lowerMessage.includes('title, author, and isbn are required')) {
    return 'Please complete the book title, author, and ISBN first.';
  }

  if (lowerMessage.includes('isbn must contain digits only')) {
    return 'ISBN must contain numbers only.';
  }

  if (lowerMessage.includes('e-book file is required')) {
    return 'Please upload the e-book file before saving.';
  }

  if (lowerMessage.includes('logged in as an admin')) {
    return 'Please sign in as an admin to add a new book.';
  }

  if (lowerMessage.includes('price must be a valid non-negative number')) {
    return 'Please enter a valid price starting from 0.';
  }

  if (lowerMessage.includes('purchase price must be a valid non-negative number')) {
    return 'Please enter a valid purchase price starting from 0.';
  }

  return normalizedMessage;
};

export default function AddBook({ onBookAdded }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [availableInSubscription, setAvailableInSubscription] = useState(true);

  const [coverImage, setCoverImage] = useState(null);
  const [ebookFile, setEbookFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const normalizeIsbnInput = (value) => value.replace(/\D/g, '');

  const handlePriceStep = (currentValue, setter, direction) => {
    const baseValue = currentValue === '' ? 0 : Number(currentValue);
    const safeValue = Number.isNaN(baseValue) ? 0 : baseValue;
    const nextValue = Math.max(0, safeValue + direction * 0.5);
    setter(nextValue.toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const token = getToken();
    if (!token) {
      setError(formatBookError('You must be logged in as an admin to add a new book.'));
      return;
    }

    if (!title || !author || !isbn) {
      setError(formatBookError('Title, author, and ISBN are required.'));
      return;
    }

    if (!/^\d+$/.test(isbn)) {
      setError(formatBookError('ISBN must contain digits only.'));
      return;
    }

    if (!ebookFile) {
      setError(formatBookError('E-book file is required.'));
      return;
    }

    const numericPrice = price === '' ? 0 : Number(price);
    const numericPurchasePrice =
      purchasePrice === '' ? 0 : Number(purchasePrice);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      setError(formatBookError('Price must be a valid non-negative number.'));
      return;
    }
    if (Number.isNaN(numericPurchasePrice) || numericPurchasePrice < 0) {
      setError(formatBookError('Purchase price must be a valid non-negative number.'));
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('author', author);
      formData.append('category', category);
      formData.append('isbn', isbn);
      formData.append('description', description);
      formData.append('price', numericPrice.toString());
      formData.append('purchasePrice', numericPurchasePrice.toString());
      formData.append(
        'availableInSubscription',
        availableInSubscription ? 'true' : 'false'
      );

      if (coverImage) formData.append('coverImage', coverImage);
      if (ebookFile) formData.append('ebookFile', ebookFile);

      const res = await fetch(BOOKS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // auth(['admin']) في الباك إند
        },
        body: formData, // لا تضيف Content-Type يدوياً
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // لو مافي json رجع، نخليها فاضية
      }

      if (!res.ok) {
        const msg =
          data.message || 'Failed to add the e-book. Please try again.';
        throw new Error(msg);
      }

      setSuccessMsg(data.message || 'E-book added successfully.');

      if (onBookAdded && data.book) onBookAdded(data.book);

      // reset fields
      setTitle('');
      setAuthor('');
      setCategory('');
      setIsbn('');
      setDescription('');
      setPrice('');
      setPurchasePrice('');
      setAvailableInSubscription(true);
      setCoverImage(null);
      setEbookFile(null);
      e.target.reset();
    } catch (err) {
      console.error('Error adding book:', err);
      setError(formatBookError(err.message || 'An error occurred while adding the book.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="admin-panel-card shadow-sm mb-4 border-0">
      <Card.Body className="p-4">
        <div className="admin-section-head d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <div className="admin-kicker">Catalog Manager</div>
            <Card.Title className="mb-1">Add New E-Book</Card.Title>
            <small className="text-muted">
              Upload digital books with pricing and subscription options.
            </small>
          </div>
          <span className="admin-meta-chip">
            <i className="bi bi-book-half me-1" />
            Electronic Library
          </span>
        </div>

        {error && (
          <Alert variant="danger" className="admin-create-user-card__alert admin-form-alert app-error-alert is-danger">
            <div className="admin-create-user-card__alert-copy">
              <div className="admin-create-user-card__alert-title is-danger">
                Please review this book
              </div>
              <div className="admin-create-user-card__alert-text is-danger">
                {error}
              </div>
            </div>
          </Alert>
        )}
        {successMsg && (
          <Alert variant="success" className="admin-create-user-card__alert is-success">
            <span className="admin-create-user-card__alert-icon" aria-hidden="true">
              <i className="bi bi-check2-circle" />
            </span>
            <div className="admin-create-user-card__alert-copy">
              <div className="admin-create-user-card__alert-title">
                E-Book added successfully
              </div>
              <div className="admin-create-user-card__alert-text">
                The new title is now available in the library catalog.
              </div>
            </div>
          </Alert>
        )}

        <Form className="mt-3 admin-book-form" onSubmit={handleSubmit}>
          <div className="admin-form-section">
            <div className="admin-form-section__header">
              <div className="admin-form-section__icon">
                <i className="bi bi-journal-text" aria-hidden="true" />
              </div>
              <div>
                <div className="admin-form-section__eyebrow">Basic info</div>
                <h3 className="admin-form-section__title">Book identity</h3>
                <p className="admin-form-section__desc">
                  Add the main metadata readers will see in the catalog.
                </p>
              </div>
            </div>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter book title"
                    className="admin-input"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Author *</Form.Label>
                  <Form.Control
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter author's name"
                    className="admin-input"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Novel, Science, History..."
                    className="admin-input"
                  />
                  <Form.Text className="admin-field-hint">
                    Use one or more categories to improve discoverability.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>ISBN *</Form.Label>
                  <Form.Control
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(normalizeIsbnInput(e.target.value))}
                    placeholder="Unique ISBN number"
                    className="admin-input"
                    inputMode="numeric"
                    pattern="\d+"
                    required
                  />
                  <Form.Text className="admin-field-hint">
                    Numbers only, and it must stay unique so inventory and purchase flows stay clean.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="admin-form-section">
            <div className="admin-form-section__header">
              <div className="admin-form-section__icon is-pricing">
                <i className="bi bi-cash-stack" aria-hidden="true" />
              </div>
              <div>
                <div className="admin-form-section__eyebrow">Pricing & access</div>
                <h3 className="admin-form-section__title">Monetization setup</h3>
                <p className="admin-form-section__desc">
                  Control direct purchase, paid download, and subscription access.
                </p>
              </div>
            </div>

            <Row className="g-3">
              <Col lg={4} md={6}>
                <div className="admin-price-card">
                  <div className="admin-price-card__header">
                    <span className="admin-price-card__label">Price (Buy)</span>
                    <span className="admin-price-card__badge">Access</span>
                  </div>
                  <Form.Group>
                    <InputGroup className="admin-input-group admin-number-group">
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="admin-input admin-number-input"
                      />
                      <div className="admin-number-stepper">
                        <button
                          type="button"
                          className="admin-number-stepper__btn"
                          aria-label="Increase price"
                          onClick={() => handlePriceStep(price, setPrice, 1)}
                        >
                          <i className="bi bi-chevron-up" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="admin-number-stepper__btn"
                          aria-label="Decrease price"
                          onClick={() => handlePriceStep(price, setPrice, -1)}
                        >
                          <i className="bi bi-chevron-down" aria-hidden="true" />
                        </button>
                      </div>
                    </InputGroup>
                    <Form.Text className="admin-field-hint">
                      Use this when the book itself is paid to access.
                    </Form.Text>
                  </Form.Group>
                </div>
              </Col>

              <Col lg={4} md={6}>
                <div className="admin-price-card is-download">
                  <div className="admin-price-card__header">
                    <span className="admin-price-card__label">
                      Purchase Price (Download)
                    </span>
                    <span className="admin-price-card__badge">Optional</span>
                  </div>
                  <Form.Group>
                    <InputGroup className="admin-input-group admin-number-group">
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder="0.00"
                        className="admin-input admin-number-input"
                      />
                      <div className="admin-number-stepper">
                        <button
                          type="button"
                          className="admin-number-stepper__btn"
                          aria-label="Increase purchase price"
                          onClick={() =>
                            handlePriceStep(purchasePrice, setPurchasePrice, 1)
                          }
                        >
                          <i className="bi bi-chevron-up" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="admin-number-stepper__btn"
                          aria-label="Decrease purchase price"
                          onClick={() =>
                            handlePriceStep(purchasePrice, setPurchasePrice, -1)
                          }
                        >
                          <i className="bi bi-chevron-down" aria-hidden="true" />
                        </button>
                      </div>
                    </InputGroup>
                    <Form.Text className="admin-field-hint">
                      Keep this for paid downloads even when online reading is free.
                    </Form.Text>
                  </Form.Group>
                </div>
              </Col>

              <Col lg={4} md={12}>
                <Form.Group className="admin-switch-card admin-switch-card--premium">
                  <div className="admin-switch-card__top">
                    <div>
                      <Form.Label>Available in Subscription</Form.Label>
                      <p className="admin-switch-card__hint">
                        Let subscribers unlock this title without a separate purchase.
                      </p>
                    </div>
                    <span className="admin-switch-card__icon">
                      <i className="bi bi-stars" aria-hidden="true" />
                    </span>
                  </div>
                  <Form.Check
                    type="switch"
                    id="subscription-switch"
                    label={
                      availableInSubscription
                        ? 'Included in subscription'
                        : 'Not included in subscription'
                    }
                    checked={availableInSubscription}
                    onChange={(e) =>
                      setAvailableInSubscription(e.target.checked)
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="admin-form-section">
            <div className="admin-form-section__header">
              <div className="admin-form-section__icon is-description">
                <i className="bi bi-card-text" aria-hidden="true" />
              </div>
              <div>
                <div className="admin-form-section__eyebrow">Content details</div>
                <h3 className="admin-form-section__title">Description & assets</h3>
                <p className="admin-form-section__desc">
                  Add a short summary, the cover image, and the digital file.
                </p>
              </div>
            </div>

            <Form.Group className="mt-1">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short description about the book..."
                className="admin-input admin-textarea"
              />
            </Form.Group>

            <Row className="g-3 mt-1">
              <Col md={6}>
                <div className="admin-upload-card">
                  <Form.Group>
                    <Form.Label>Cover Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverImage(e.target.files[0])}
                      className="admin-input"
                    />
                    <Form.Text className="admin-field-hint">
                      Optional, but a strong cover makes the catalog look richer.
                    </Form.Text>
                  </Form.Group>
                </div>
              </Col>

              <Col md={6}>
                <div className="admin-upload-card is-primary">
                  <Form.Group>
                    <Form.Label>E-Book File *</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".pdf,.epub,.mobi,.azw3"
                      onChange={(e) => setEbookFile(e.target.files[0])}
                      className="admin-input"
                      required
                    />
                    <Form.Text className="admin-field-hint">
                      Supported formats: PDF, EPUB, MOBI, and AZW3.
                    </Form.Text>
                  </Form.Group>
                </div>
              </Col>
            </Row>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add E-Book'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

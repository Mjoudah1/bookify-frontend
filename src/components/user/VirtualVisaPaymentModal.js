import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Row,
  Col,
  Alert,
  Button,
} from 'react-bootstrap';

const initialState = {
  cardHolder: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
};

export default function VirtualVisaPaymentModal({
  show,
  onHide,
  title,
  subtitle,
  amountLabel,
  submitLabel,
  loading,
  error,
  onSubmit,
}) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (!show) {
      setForm(initialState);
    }
  }, [show]);

  const handleChange = (field, value) => {
    let next = value;

    if (field === 'cardNumber') {
      next = value.replace(/[^\d]/g, '').slice(0, 16);
    }

    if (field === 'expiry') {
      next = value.replace(/[^\d]/g, '').slice(0, 4);
      if (next.length > 2) {
        next = `${next.slice(0, 2)}/${next.slice(2)}`;
      }
    }

    if (field === 'cvv') {
      next = value.replace(/[^\d]/g, '').slice(0, 4);
    }

    setForm((prev) => ({ ...prev, [field]: next }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="virtual-payment-summary mb-3">
          <span>Amount</span>
          <strong>{amountLabel}</strong>
        </div>

        {error && (
          <Alert variant="danger" className="app-error-alert py-2">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Card Holder</Form.Label>
            <Form.Control
              value={form.cardHolder}
              onChange={(e) => handleChange('cardHolder', e.target.value)}
              placeholder="Enter card holder name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Visa Number</Form.Label>
            <Form.Control
              value={form.cardNumber}
              onChange={(e) => handleChange('cardNumber', e.target.value)}
              placeholder="Use a 16-digit Visa starting with 4"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Expiry</Form.Label>
                <Form.Control
                  value={form.expiry}
                  onChange={(e) => handleChange('expiry', e.target.value)}
                  placeholder="MM/YY"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>CVV</Form.Label>
                <Form.Control
                  value={form.cvv}
                  onChange={(e) => handleChange('cvv', e.target.value)}
                  placeholder="123"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Processing...' : submitLabel}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

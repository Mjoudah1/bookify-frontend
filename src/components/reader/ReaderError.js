import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

export default function ReaderError({ error, onBack }) {
  return (
    <div className="online-reader-page pt-4">
      <Container>
      <Alert variant="danger" className="app-error-alert text-center">
          {error}
        </Alert>

        <div className="text-center mt-3">
          <Button variant="secondary" className="book-details-back-btn" onClick={onBack}>
            ⬅ Back
          </Button>
        </div>
      </Container>
    </div>
  );
}

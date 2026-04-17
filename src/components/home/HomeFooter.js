import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

export default function HomeFooter() {
  return (
    <section
      style={{
        background: '#0b1120',
        color: '#e5e7eb',
        padding: '2.5rem 0 1.2rem',
      }}
    >
      <Container>
        <Row>
          <Col
            className="text-center"
            style={{ fontSize: '0.8rem', opacity: 0.75 }}
          >
            © {new Date().getFullYear()} Bookify E-Library. All rights reserved.
          </Col>
        </Row>
      </Container>
    </section>
  );
}
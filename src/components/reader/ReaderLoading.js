import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function ReaderLoading() {
  return (
    <div className="online-reader-page d-flex align-items-center justify-content-center">
      <Spinner animation="border" />
    </div>
  );
}

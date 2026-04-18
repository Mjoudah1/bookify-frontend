import React from 'react';
import { Card } from 'react-bootstrap';

export default function ReaderFrame({
  book,
  ebookUrl,
  captureBlocked,
  captureMessage,
  watermarkText,
}) {
  const sourceName = `${ebookUrl || ''} ${book?.ebookFile || ''} ${book?.title || ''}`;
  const isPdf = /\.pdf(\?|$|#|\s)/i.test(sourceName);
  const readerSrc = isPdf
    ? `${ebookUrl}${ebookUrl.includes('#') ? '&' : '#'}toolbar=0&navpanes=0&scrollbar=0&view=FitH`
    : ebookUrl;

  return (
    <Card
      className="shadow-sm border-0 reader-frame-card"
      style={{ borderRadius: '18px', overflow: 'hidden' }}
    >
      <Card.Body className="reader-frame-body" style={{ padding: 0 }}>
        <iframe
          src={readerSrc}
          title={book.title}
          width="100%"
          height="700px"
          style={{
            border: 'none',
            display: 'block',
          }}
          allow="fullscreen"
        />

        <div className="reader-watermark-layer" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={`${watermarkText}-${index}`} className="reader-watermark">
              {watermarkText}
            </span>
          ))}
        </div>

        <div
          className={`reader-protection-overlay${captureBlocked ? ' is-visible' : ''}`}
          aria-live="polite"
        >
          <div className="reader-protection-card">
            <div className="reader-protection-title">Protected Reading View</div>
            <div className="reader-protection-text">
              {captureMessage ||
                'This page hides the book while screenshot or copy actions are attempted.'}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

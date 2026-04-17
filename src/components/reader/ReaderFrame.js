import React from 'react';
import { Card } from 'react-bootstrap';

export default function ReaderFrame({ book, ebookUrl }) {
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
      <Card.Body style={{ padding: 0 }}>
        <iframe
          src={readerSrc}
          title={book.title}
          width="100%"
          height="700px"
          style={{
            border: 'none',
            display: 'block',
          }}
        />
      </Card.Body>
    </Card>
  );
}

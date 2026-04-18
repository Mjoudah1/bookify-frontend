import React from 'react';
import { Alert, Card, Spinner } from 'react-bootstrap';
import { getDocument } from 'pdfjs-dist/webpack.mjs';

export default function ReaderFrame({
  book,
  ebookUrl,
  captureBlocked,
  captureMessage,
}) {
  const containerRef = React.useRef(null);
  const [pdfState, setPdfState] = React.useState({
    loading: true,
    error: '',
    pages: [],
  });

  const sourceName = `${ebookUrl || ''} ${book?.ebookFile || ''} ${book?.title || ''}`;
  const isPdf = /\.pdf(\?|$|#|\s)/i.test(sourceName);

  React.useEffect(() => {
    let active = true;
    let loadingTask = null;

    const renderPdf = async () => {
      if (!ebookUrl || !isPdf) {
        setPdfState({
          loading: false,
          error: 'This protected reader currently supports PDF books only.',
          pages: [],
        });
        return;
      }

      try {
        setPdfState({ loading: true, error: '', pages: [] });

        loadingTask = getDocument(ebookUrl);
        const pdf = await loadingTask.promise;
        const renderedPages = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const containerWidth = containerRef.current?.clientWidth || 900;
          const targetWidth = Math.max(560, Math.min(containerWidth - 48, 1200));
          const scale = targetWidth / baseViewport.width;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('Could not initialize the PDF canvas.');
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          renderedPages.push({
            pageNumber,
            dataUrl: canvas.toDataURL('image/png'),
            width: viewport.width,
            height: viewport.height,
          });
        }

        if (!active) {
          return;
        }

        setPdfState({
          loading: false,
          error: '',
          pages: renderedPages,
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setPdfState({
          loading: false,
          error: error.message || 'Failed to render this PDF in protected mode.',
          pages: [],
        });
      }
    };

    renderPdf();

    return () => {
      active = false;
      if (loadingTask?.destroy) {
        loadingTask.destroy();
      }
    };
  }, [ebookUrl, isPdf]);

  return (
    <Card
      className="shadow-sm border-0 reader-frame-card"
      style={{ borderRadius: '18px', overflow: 'hidden' }}
    >
      <Card.Body
        ref={containerRef}
        className="reader-frame-body"
        style={{ padding: 0 }}
      >
        {pdfState.loading && (
          <div className="reader-canvas-loading">
            <Spinner animation="border" variant="primary" />
            <div className="reader-canvas-loading-text">
              Preparing protected reading view...
            </div>
          </div>
        )}

        {!pdfState.loading && pdfState.error && (
          <div className="reader-canvas-error">
            <Alert variant="warning" className="mb-0 rounded-0">
              {pdfState.error}
            </Alert>
          </div>
        )}

        {!pdfState.loading && !pdfState.error && (
          <div className="reader-canvas-pages">
            {pdfState.pages.map((page) => (
              <section
                key={`${book?._id || book?.title || 'book'}-${page.pageNumber}`}
                className="reader-canvas-page"
              >
                <img
                  src={page.dataUrl}
                  alt={`${book?.title || 'Book'} page ${page.pageNumber}`}
                  draggable="false"
                />
              </section>
            ))}
          </div>
        )}

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

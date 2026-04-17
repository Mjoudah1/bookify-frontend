import { useEffect, useState } from 'react';
import { getDocument } from 'pdfjs-dist/webpack.mjs';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../utils/api';

export default function useOnlineReader(bookId) {
  const [book, setBook] = useState(null);
  const [ebookUrl, setEbookUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [canDownload, setCanDownload] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let objectUrl = '';

    const loadOnlineBook = async () => {
      try {
        setLoading(true);
        setError('');

        const bookRes = await fetch(`${API_BASE_URL}/api/books/${bookId}`);
        if (!bookRes.ok) throw new Error('Failed to load book details.');

        const bookData = await bookRes.json();
        setBook(bookData);

        const token = getToken();
        if (!token) {
          throw new Error('You must be logged in to read this book online.');
        }

        const accessRes = await fetch(
          `${API_BASE_URL}/api/books/${bookId}/read-access`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const accessData = await accessRes.json();
        if (!accessRes.ok) {
          throw new Error(
            accessData.message || 'Failed to get online reading URL.'
          );
        }

        const url = accessData.readerUrl || accessData.ebookUrl || '';
        const securedDownloadUrl = `${API_BASE_URL}/api/books/${bookId}/file/download`;

        if (!url) {
          throw new Error('This e-book does not have an online file.');
        }

        setCanDownload(!!accessData.canDownload);
        setDownloadUrl(accessData.canDownload ? securedDownloadUrl : '');

        const fileRes = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!fileRes.ok) {
          let message = 'Failed to open this e-book.';
          try {
            const errorData = await fileRes.json();
            message = errorData.message || message;
          } catch {
            // Ignore JSON parsing errors and keep fallback message.
          }
          throw new Error(message);
        }

        const fileBlob = await fileRes.blob();
        objectUrl = window.URL.createObjectURL(fileBlob);
        setEbookUrl(objectUrl);

        const sourceName = `${bookData?.ebookFile || ''} ${fileBlob.type || ''}`;
        const isPdf =
          /\.pdf(\?|$|#|\s)/i.test(sourceName) ||
          fileBlob.type === 'application/pdf';

        if (isPdf) {
          setVoiceLoading(true);
          setVoiceError('');

          try {
            const pdfData = await fileBlob.arrayBuffer();
            const pdf = await getDocument({ data: pdfData }).promise;
            const pagesText = [];

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
              const page = await pdf.getPage(pageNumber);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item) => item.str || '')
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();

              if (pageText) {
                pagesText.push(pageText);
              }
            }

            const combinedText = pagesText.join('\n\n').trim();

            if (combinedText) {
              setVoiceText(combinedText);
            } else {
              setVoiceError('No readable text was found in this PDF for voice reading.');
            }
          } catch (voiceReaderError) {
            console.error('Voice reader extraction error:', voiceReaderError);
            setVoiceError('Voice reader could not extract text from this PDF.');
          } finally {
            setVoiceLoading(false);
          }
        } else {
          setVoiceText('');
          setVoiceError('Voice reader is currently available for PDF books only.');
        }
      } catch (err) {
        console.error('Reader error:', err);
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    loadOnlineBook();

    return () => {
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [bookId]);

  return {
    book,
    ebookUrl,
    canDownload,
    downloadUrl,
    voiceText,
    voiceLoading,
    voiceError,
    loading,
    error,
  };
}

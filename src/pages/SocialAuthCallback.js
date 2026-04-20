import React, { useEffect, useState } from 'react';
import { Alert, Card, Container, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveToken, setHasInterests } from '../utils/auth';

export default function SocialAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const socialError = params.get('error');
    const isNewUser = params.get('isNewUser') === 'true';
    const hasInterestSelection = params.get('hasInterests') === 'true';

    if (socialError) {
      setError(socialError);
      return;
    }

    if (!token) {
      setError('Missing social login token.');
      return;
    }

    saveToken(token);
    setHasInterests(hasInterestSelection);

    navigate(isNewUser ? '/book-of-intrests' : '/user', { replace: true });
  }, [location.search, navigate]);

  return (
    <div className="auth-shell auth-shell--compact">
      <Container style={{ maxWidth: '520px' }}>
        <Card className="auth-panel auth-panel--compact border-0">
          <Card.Body className="p-4 p-md-5 text-center">
            {error ? (
              <>
                <Alert variant="danger" className="app-error-alert">
                  {error}
                </Alert>
                <div className="small text-muted">
                  Please go back and try another sign-in method.
                </div>
              </>
            ) : (
              <>
                <Spinner animation="border" />
                <h4 className="fw-bold mt-3 mb-2">Completing sign in</h4>
                <p className="text-muted mb-0">
                  We are preparing your Bookify account.
                </p>
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

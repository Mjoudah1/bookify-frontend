import React, { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Spinner,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  fetchInterestCategories,
  fetchMyInterestBooks,
  updateMyInterests,
} from '../services/interestsService';
import { getToken, setHasInterests } from '../utils/auth';
import './BookOfIntrests.css';

export default function BookOfIntrests() {
  const [categories, setCategories] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadInterestsPage = async () => {
      try {
        setLoading(true);
        setError('');

        const [allCategories, myInterestData] = await Promise.all([
          fetchInterestCategories(),
          fetchMyInterestBooks(token),
        ]);

        setCategories(allCategories);
        setSelectedInterests(myInterestData?.interests || []);
        setHasInterests((myInterestData?.interests || []).length > 0);
      } catch (err) {
        console.error('BookOfIntrests load error:', err);
        setError(err.message || 'Failed to load your interests page.');
      } finally {
        setLoading(false);
      }
    };

    loadInterestsPage();
  }, [navigate, token]);

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );

    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSaveInterests = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const data = await updateMyInterests(token, selectedInterests);
      setSelectedInterests(data?.interests || []);
      setHasInterests(Boolean(data?.hasInterests));
      setSuccess('Your interests were saved successfully.');
    } catch (error) {
      console.error('Save interests error:', error);
      setError(error.message || 'Failed to save your interests.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="book-intrests-page">
        <Container className="py-5 text-center text-white">
          <Spinner animation="border" />
          <p className="mt-3 mb-0">Loading your interests...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="book-intrests-page">
      <Container className="py-5">
        <div className="book-intrests-hero">
          <div className="book-intrests-hero__eyebrow">Personalized shelf</div>
          <h1 className="book-intrests-hero__title">Book of Intrests</h1>
          <p className="book-intrests-hero__text">
            Choose the categories you care about, and Bookify will show you the
            books that match your interests here.
          </p>
          <div className="book-intrests-hero__chips">
            <Badge pill bg="light" text="dark">
              Selected: {selectedInterests.length}
            </Badge>
          </div>
        </div>

        <Card className="book-intrests-card border-0 shadow-lg">
          <Card.Body className="p-4 p-md-5">
            {error && (
              <Alert variant="danger" className="app-error-alert">
                {error}
              </Alert>
            )}

            {success && <Alert variant="success">{success}</Alert>}

            <div className="book-intrests-section-head">
              <div>
                <div className="book-intrests-section-head__kicker">
                  Select categories
                </div>
                <h2 className="book-intrests-section-head__title">
                  Pick your reading interests
                </h2>
              </div>
              <div className="book-intrests-actions">
                <Button
                  variant="outline-primary"
                  className="book-intrests-btn"
                  onClick={() => navigate('/user')}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="primary"
                  className="book-intrests-btn"
                  onClick={handleSaveInterests}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save interests'}
                </Button>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="empty-state mt-4">
                <h6 className="fw-semibold mb-2">No categories available yet</h6>
                <p className="mb-0">
                  Once books are added with categories, you will be able to
                  select your interests here.
                </p>
              </div>
            ) : (
              <div className="book-intrests-tags">
                {categories.map((category) => {
                  const isActive = selectedInterests.includes(category);

                  return (
                    <button
                      key={category}
                      type="button"
                      className={`book-intrests-tag ${
                        isActive ? 'is-active' : ''
                      }`}
                      onClick={() => toggleInterest(category)}
                    >
                      <span>{category}</span>
                      <i
                        className={`bi ${
                          isActive ? 'bi-check2-circle' : 'bi-plus-circle'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

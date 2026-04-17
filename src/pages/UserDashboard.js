import React, { useEffect, useMemo, useState } from 'react';
import { Container, Card } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { getToken, setHasInterests } from '../utils/auth';
import './UserDashboard.css';

import UserHero from '../components/user/UserHero';
import UserFilters from '../components/user/UserFilters';
import BooksGrid from '../components/user/BooksGrid';
import SubscriptionPlansCard from '../components/user/SubscriptionPlansCard';
import { fetchOwnedBooks } from '../services/userDashboardService';
import { fetchMyInterestBooks } from '../services/interestsService';
import { API_BASE_URL } from '../utils/api';

export default function UserDashboard() {
  const [books, setBooks] = useState([]);
  const [ownedBooks, setOwnedBooks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mode, setMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const navigate = useNavigate();

  const token = getToken();
  const decoded = token ? jwtDecode(token) : null;
  const username =
    decoded?.username || decoded?.name || decoded?.email || 'Reader';

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleOpenBookDetails = (book) => {
    navigate(`/books/${book._id}`, {
      state: { book },
    });
  };

  const handleBrowseLibrary = () => {
    navigate('/book-of-intrests');
  };

  const handleOpenMyBooks = () => {
    navigate('/my-books');
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [interestData, owned, profileRes] = await Promise.all([
        fetchMyInterestBooks(token),
        fetchOwnedBooks(token),
        fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const profileData = await profileRes.json().catch(() => null);
      if (!profileRes.ok) {
        throw new Error(
          profileData?.message || 'Failed to load your profile data.'
        );
      }

      setHasInterests(Boolean(profileData?.hasInterests));

      if (!profileData?.hasInterests) {
        navigate('/book-of-intrests');
        return;
      }

      setBooks(Array.isArray(interestData?.books) ? interestData.books : []);
      setOwnedBooks(owned);
      setCurrentUser(profileData);
    } catch (err) {
      console.error('UserDashboard load error:', err);
      setError(
        err.message ||
          'Failed to load dashboard data. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const ownedIds = useMemo(
    () => new Set(ownedBooks.map((b) => b._id)),
    [ownedBooks]
  );

  const myOwnedCount = ownedBooks.length;
  const totalBooks = books.length;

  const categories = useMemo(
    () => [
      'all',
      ...new Set(books.filter((b) => b?.category).map((b) => b.category)),
    ],
    [books]
  );

  const formatRating = (rating) =>
    typeof rating === 'number' ? rating.toFixed(1) : '—';

  const formatViews = (views) =>
    typeof views === 'number' ? views : 0;

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'Not set';
    const num = Number(price);
    if (Number.isNaN(num)) return 'Not set';
    if (num === 0) return 'Free';
    return `$${num.toFixed(2)}`;
  };

  const filteredBooks = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    let baseList =
      mode === 'mine'
        ? books.filter((b) => ownedIds.has(b._id))
        : books;

    let result = baseList.filter((b) => {
      const title = b.title?.toLowerCase() || '';
      const author = b.author?.toLowerCase() || '';
      const isbn = b.isbn?.toLowerCase() || '';
      const desc = b.description?.toLowerCase() || '';
      const cat = b.category?.toLowerCase() || '';

      const matchesSearch =
        !term ||
        title.includes(term) ||
        author.includes(term) ||
        isbn.includes(term) ||
        desc.includes(term) ||
        cat.includes(term);

      const matchesCategory =
        selectedCategory === 'all' || b.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    result = result.filter((b) => {
      const priceNum = Number(b.price) || 0;
      const inSub = !!b.availableInSubscription;

      if (accessFilter === 'subscription') return inSub;
      if (accessFilter === 'paid') return priceNum > 0;
      if (accessFilter === 'free') return priceNum === 0;
      return true;
    });

    const sorted = [...result];
    switch (sortBy) {
      case 'title-asc':
        sorted.sort((a, b) =>
          (a.title || '').localeCompare(b.title || '')
        );
        break;
      case 'rating-desc':
        sorted.sort(
          (a, b) =>
            (b.averageRating || 0) - (a.averageRating || 0)
        );
        break;
      case 'views-desc':
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'newest':
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case 'default':
      default:
        break;
    }

    return sorted;
  }, [
    books,
    ownedIds,
    mode,
    searchTerm,
    selectedCategory,
    accessFilter,
    sortBy,
  ]);

  const subscriptionBooksCount = useMemo(
    () => books.filter((b) => b.availableInSubscription).length,
    [books]
  );

  return (
    <div className="user-dashboard">
      <UserHero
        username={username}
        totalBooks={totalBooks}
        myOwnedCount={myOwnedCount}
        subscriptionBooksCount={subscriptionBooksCount}
        onBrowseLibrary={handleBrowseLibrary}
        onOpenMyBooks={handleOpenMyBooks}
      />

      <Container className="mt-n4 mb-5 position-relative">
        <Card className="user-dashboard-card shadow-lg border-0">
          <Card.Body className="p-4 p-md-5">
            <SubscriptionPlansCard
              currentUser={currentUser}
              onSubscriptionUpdated={loadDashboardData}
            />

            <UserFilters
              mode={mode}
              setMode={setMode}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              accessFilter={accessFilter}
              setAccessFilter={setAccessFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              categories={categories}
              totalBooks={totalBooks}
              myOwnedCount={myOwnedCount}
              filteredBooksLength={filteredBooks.length}
            />

            <BooksGrid
              loading={loading}
              error={error}
              books={books}
              filteredBooks={filteredBooks}
              ownedIds={ownedIds}
              onOpenBook={handleOpenBookDetails}
              formatRating={formatRating}
              formatViews={formatViews}
              formatPrice={formatPrice}
            />
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

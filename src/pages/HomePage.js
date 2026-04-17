import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import HomeHero from '../components/home/HomeHero';
import BooksSlider from '../components/home/BooksSlider';
import SectionSlider from '../components/home/SectionSlider';
import HomeFooter from '../components/home/HomeFooter';
import { API_BASE_URL } from '../utils/api';

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const navigate = useNavigate();

  const sliderRef = useRef(null);
  const topSliderRef = useRef(null);
  const viewedSliderRef = useRef(null);

  const [allArrows, setAllArrows] = useState({ left: false, right: false });
  const [topArrows, setTopArrows] = useState({ left: false, right: false });
  const [viewArrows, setViewArrows] = useState({ left: false, right: false });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/books`);
        if (!res.ok) throw new Error('Failed to fetch books');
        const data = await res.json();
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Could not load books.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [topRes, viewRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/books?sort=top-rated&limit=8`),
          fetch(`${API_BASE_URL}/api/books?sort=most-viewed&limit=8`),
        ]);

        const topData = topRes.ok ? await topRes.json() : [];
        const viewData = viewRes.ok ? await viewRes.json() : [];

        setTopRated(Array.isArray(topData) ? topData : []);
        setMostViewed(Array.isArray(viewData) ? viewData : []);
      } catch (err) {
        console.error('HomePage section error:', err);
      } finally {
        setSectionLoading(false);
      }
    };

    fetchLists();
  }, []);

  const parseCategories = (categoryValue) => {
    if (!categoryValue) return [];

    if (Array.isArray(categoryValue)) {
      return categoryValue
        .map((c) => String(c).trim().toLowerCase())
        .filter(Boolean);
    }

    return String(categoryValue)
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);
  };

  const categories = useMemo(() => {
    const singlesSet = new Set();
    const combosSet = new Set();

    for (const b of books) {
      const cats = parseCategories(b?.category);
      cats.forEach((c) => singlesSet.add(c));

      if (cats.length >= 2) {
        const comboKey = cats.slice().sort().join(', ');
        combosSet.add(comboKey);
      }
    }

    return {
      singles: Array.from(singlesSet).sort(),
      combos: Array.from(combosSet).sort(),
    };
  }, [books]);

  const filteredBooks = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    let result = books.filter((book) => {
      const title = book.title?.toLowerCase() || '';
      const author = book.author?.toLowerCase() || '';
      const isbn = book.isbn?.toLowerCase() || '';
      const desc = book.description?.toLowerCase() || '';

      const matchesSearch =
        !term ||
        title.includes(term) ||
        author.includes(term) ||
        isbn.includes(term) ||
        desc.includes(term);

      const bookCats = parseCategories(book?.category);
      let matchesCategory = true;

      if (selectedCategory !== 'all') {
        if (selectedCategory.includes(',')) {
          const requiredCats = selectedCategory
            .split(',')
            .map((c) => c.trim().toLowerCase())
            .filter(Boolean);
          matchesCategory = requiredCats.every((c) => bookCats.includes(c));
        } else {
          matchesCategory = bookCats.includes(
            selectedCategory.trim().toLowerCase()
          );
        }
      }

      return matchesSearch && matchesCategory;
    });

    if (accessFilter !== 'all') {
      result = result.filter((book) => {
        const priceNum = Number(book.price) || 0;
        const paid = priceNum > 0;
        const inSub = !!book.availableInSubscription;

        if (accessFilter === 'subscription') return inSub;
        if (accessFilter === 'paid') return paid;
        if (accessFilter === 'free') return priceNum === 0;
        return true;
      });
    }

    const sorted = [...result];
    switch (sortBy) {
      case 'title-asc':
        sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'rating-desc':
        sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'views-desc':
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'newest':
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case 'default':
      default:
        break;
    }

    return sorted;
  }, [books, searchTerm, selectedCategory, accessFilter, sortBy]);

  const totalCategories = useMemo(() => categories.singles.length, [categories]);

  const spotlightBook = useMemo(() => {
    if (!books.length) return null;
    return [...books].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )[0];
  }, [books]);

  const openBook = (book) => navigate(`/books/${book._id}`, { state: { book } });

  const formatRating = (rating) =>
    typeof rating === 'number' ? rating.toFixed(1) : '—';

  const formatViews = (views) => (typeof views === 'number' ? views : 0);

  const getAccessBadges = (book) => {
    const priceNum = Number(book.price) || 0;
    const paid = priceNum > 0;
    const inSub = !!book.availableInSubscription;

    const badges = [];

    if (inSub) {
      badges.push(
        <Badge key="sub" className="me-1 mb-1" bg="info">
          In Subscription
        </Badge>
      );
    }

    if (paid) {
      badges.push(
        <Badge key="paid" className="me-1 mb-1" bg="warning" text="dark">
          Paid
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="free" className="me-1 mb-1" bg="success">
          Free
        </Badge>
      );
    }

    return badges;
  };

  const arrowBtnStyle = (side) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 12,
    width: 48,
    height: 48,
    borderRadius: 999,
    border: '1px solid rgba(255, 255, 255, 0.72)',
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(219, 234, 254, 0.72))',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow:
      '0 16px 36px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.82)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1d4ed8',
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
    cursor: 'pointer',
    zIndex: 6,
    transition:
      'transform 160ms ease, box-shadow 160ms ease, background 160ms ease, color 160ms ease',
    userSelect: 'none',
  });

  const scrollAnySlider = (ref, dir, step = 320) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  const updateArrowState = (el, setState) => {
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;

    if (max <= 2) {
      setState({ left: false, right: false });
      return;
    }

    const eps = 6;
    const pos = el.scrollLeft;

    setState({
      left: pos > eps,
      right: pos < max - eps,
    });
  };

  useEffect(() => {
    const elAll = sliderRef.current;
    const elTop = topSliderRef.current;
    const elView = viewedSliderRef.current;

    const onAll = () => updateArrowState(elAll, setAllArrows);
    const onTop = () => updateArrowState(elTop, setTopArrows);
    const onView = () => updateArrowState(elView, setViewArrows);

    const initSlider = (el, fn) => {
      if (!el) return;

      el.scrollLeft = 0;

      fn();
      el.addEventListener('scroll', fn, { passive: true });
      window.addEventListener('resize', fn);

      requestAnimationFrame(() => {
        if (el) el.scrollLeft = 0;
        fn();
      });
      setTimeout(() => {
        if (el) el.scrollLeft = 0;
        fn();
      }, 120);
      setTimeout(() => {
        if (el) el.scrollLeft = 0;
        fn();
      }, 350);
    };

    initSlider(elAll, onAll);
    initSlider(elTop, onTop);
    initSlider(elView, onView);

    return () => {
      if (elAll) elAll.removeEventListener('scroll', onAll);
      if (elTop) elTop.removeEventListener('scroll', onTop);
      if (elView) elView.removeEventListener('scroll', onView);

      window.removeEventListener('resize', onAll);
      window.removeEventListener('resize', onTop);
      window.removeEventListener('resize', onView);
    };
  }, [filteredBooks.length, topRated.length, mostViewed.length, loading, sectionLoading]);

  return (
    <div className="home-page" style={{ background: '#f4f6fb', minHeight: '100vh' }}>
      <style>{`
        .home-page *::-webkit-scrollbar { display: none; }

        .cute-arrow:hover {
          transform: translateY(-50%) scale(1.05);
          box-shadow: 0 20px 42px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.92);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(219, 234, 254, 0.82));
          color: #173fbb;
        }

        .cute-arrow:active {
          transform: translateY(-50%) scale(0.98);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.82);
        }
      `}</style>

      <HomeHero
        loading={loading}
        sectionLoading={sectionLoading}
        books={books}
        topRated={topRated}
        totalCategories={totalCategories}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        spotlightBook={spotlightBook}
        openBook={openBook}
        formatRating={formatRating}
        formatViews={formatViews}
      />

      <div className="container" style={{ marginTop: '2rem', paddingBottom: '3rem' }}>
        <BooksSlider
          loading={loading}
          error={error}
          filteredBooks={filteredBooks}
          books={books}
          allArrows={allArrows}
          sliderRef={sliderRef}
          arrowBtnStyle={arrowBtnStyle}
          scrollAnySlider={scrollAnySlider}
          accessFilter={accessFilter}
          setAccessFilter={setAccessFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          openBook={openBook}
          getAccessBadges={getAccessBadges}
        />

        <SectionSlider
          title="Top Rated E-Books"
          loading={sectionLoading}
          books={topRated}
          emptyText="No rated e-books yet. Once users start rating, the top titles will appear here."
          arrows={topArrows}
          sliderRef={topSliderRef}
          arrowBtnStyle={arrowBtnStyle}
          scrollAnySlider={scrollAnySlider}
          openBook={openBook}
          formatRating={formatRating}
          formatViews={formatViews}
        />

        <SectionSlider
          title="Most Viewed E-Books"
          loading={sectionLoading}
          books={mostViewed}
          emptyText="No view data yet. Once users start browsing, the most viewed titles will appear here."
          arrows={viewArrows}
          sliderRef={viewedSliderRef}
          arrowBtnStyle={arrowBtnStyle}
          scrollAnySlider={scrollAnySlider}
          openBook={openBook}
          formatRating={formatRating}
          formatViews={formatViews}
        />
      </div>

      <HomeFooter />
    </div>
  );
}

import { API_BASE_URL } from '../utils/api';

export async function fetchInterestCategories() {
  const res = await fetch(`${API_BASE_URL}/api/books/categories/list`);
  const data = await res.json().catch(() => []);

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to load interest categories.');
  }

  return Array.isArray(data) ? data : [];
}

export async function fetchMyInterestBooks(token) {
  const res = await fetch(`${API_BASE_URL}/api/books/interests/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to load your interests.');
  }

  return data || { interests: [], books: [] };
}

export async function updateMyInterests(token, interests) {
  const res = await fetch(`${API_BASE_URL}/api/books/interests/mine`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ interests }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to save your interests.');
  }

  return data || { interests: [], books: [], hasInterests: false };
}

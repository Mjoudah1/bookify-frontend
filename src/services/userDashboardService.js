const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const BOOKS_URL = `${API_BASE_URL}/api/books`;

export async function fetchAllBooks() {
  const booksRes = await fetch(BOOKS_URL);

  let booksData = [];
  try {
    booksData = await booksRes.json();
  } catch {
    booksData = [];
  }

  if (!booksRes.ok) {
    throw new Error('Failed to load books.');
  }

  return Array.isArray(booksData) ? booksData : [];
}

export async function fetchOwnedBooks(token) {
  if (!token) return [];

  try {
    const myRes = await fetch(`${API_BASE_URL}/api/books/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let myData = [];
    try {
      myData = await myRes.json();
    } catch {
      myData = [];
    }

    if (!myRes.ok) {
      console.warn(
        'My books endpoint error:',
        myRes.status,
        myData?.message
      );
      return [];
    }

    return Array.isArray(myData) ? myData : [];
  } catch (err) {
    console.warn('Error loading owned books:', err);
    return [];
  }
}

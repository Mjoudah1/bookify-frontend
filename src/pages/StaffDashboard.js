// frontend/src/pages/StaffDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { API_BASE_URL } from '../utils/api';

export default function StaffDashboard() {
  const [books, setBooks] = useState([]);

  // ✅ Load all books (borrowed + available)
  const loadBooks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/books`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setBooks(res.data);
    } catch (err) {
      console.error('Error loading books:', err);
      alert('❌ Failed to load books.');
    }
  };

  // ✅ Mark a book as returned
  const handleReturn = async (bookId) => {
    if (!window.confirm('Mark this book as returned?')) return;

    try {
      await axios.post(
        `${API_BASE_URL}/api/books/return`,
        { bookId },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      // 🟢 Update UI immediately
      setBooks((prev) =>
        prev.map((book) =>
          book._id === bookId
            ? { ...book, isBorrowed: false, borrowedBy: null }
            : book
        )
      );

      alert('✅ Book marked as returned!');
    } catch (err) {
      console.error('Return error:', err.response || err);
      alert(
        `❌ Failed to return book: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // ✅ Load books on page load
  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <Container className="mt-4">
      {/* 🔹 Header Section (No logout button here anymore) */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold text-primary">👩‍💼 Staff Dashboard</h2>
      </div>

      <Table bordered hover responsive>
        <thead className="table-primary text-center">
          <tr>
            <th>Book</th>
            <th>Author</th>
            <th>Status</th>
            <th>Issued To</th>
            <th>Issued Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody className="text-center align-middle">
          {books.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-muted text-center py-3">
                No books found.
              </td>
            </tr>
          ) : (
            books.map((b) => (
              <tr key={b._id}>
                <td>{b.title}</td>
                <td>{b.author}</td>

                {/* 🔴 or 🟢 Status */}
                <td>
                  {b.isBorrowed ? (
                    <Badge bg="danger" className="px-3 py-2">
                      Borrowed
                    </Badge>
                  ) : (
                    <Badge bg="success" className="px-3 py-2">
                      Available
                    </Badge>
                  )}
                </td>

                <td>{b.borrowedBy?.username || '—'}</td>
                <td>
                  {b.borrowedDate
                    ? new Date(b.borrowedDate).toLocaleDateString()
                    : '—'}
                </td>

                <td>
                  {b.isBorrowed ? (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleReturn(b._id)}
                    >
                      🔓 Return
                    </Button>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
}

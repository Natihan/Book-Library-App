import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import BookList from "./components/BookList";
import BookDetails from "./components/BookDetails";
import "./App.css";

const App = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noResults, setNoResults] = useState(false);

  const fetchBooks = async (query, searchType = "title") => {
    setLoading(true);
    setError("");
    setNoResults(false);

    if (!query.trim()) {
      setError("Please enter a valid search query.");
      setLoading(false);
      return;
    }

    try {
      const endpoint =
        searchType === "author"
          ? `https://openlibrary.org/search.json?author=${query}`
          : `https://openlibrary.org/search.json?title=${query}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.docs.length === 0) {
        setNoResults(true);
        setBooks([]);
      } else {
        const bookResults = data.docs.map((book) => ({
          id: book.key,
          cover: book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://via.placeholder.com/150",
          title: book.title,
          authors: book.author_name ? book.author_name.join(", ") : "Unknown",
          publisher: book.publisher ? book.publisher[0] : "Unknown",
        }));
        setBooks(bookResults);
      }
    } catch (err) {
      setError("Failed to fetch books. Please check your network connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookDetails = async (isbn) => {
    try {
      const response = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch book details");
      }
  
      const data = await response.json();
      const bookKey = `ISBN:${isbn}`;
      return data[bookKey]; // Return the book details
    } catch (err) {
      console.error("Error fetching book details:", err);
      return null; // Return null if an error occurs
    }
  };
  

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <div className="p-6 max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-extrabold text-blue-500 mb-6">
                  Book Library
                </h1>
                <SearchBar onSearch={fetchBooks} />

                {loading && (
                  <div className="flex flex-col justify-center items-center mt-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                    <p className="mt-2 text-blue-500">Loading...</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center justify-center text-red-500 mt-4">
                    <span className="mr-2">⚠️</span>
                    <p>{error}</p>
                  </div>
                )}

                {noResults && (
                  <div className="flex items-center justify-center text-gray-500 mt-4">
                    <span className="mr-2">🔍</span>
                    <p>No books found for your search query. Try a different keyword.</p>
                  </div>
                )}

                {!loading && !error && books.length === 0 && !noResults && (
                  <p className="text-gray-500 mt-4">
                    Start by searching for books using the search bar above.
                  </p>
                )}

                {!loading && !error && !noResults && books.length > 0 && (
                  <BookList books={books} />
                )}
              </div>
            }
          />
          <Route path="/book/:id" element={<BookDetails fetchBookDetails={fetchBookDetails} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

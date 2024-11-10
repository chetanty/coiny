import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Register from './register.js';
import SignIn from './Signin.js';
import CoinCollection from './CoinCollection.js';
import ProtectedRoute from './ProtectedRoute.js';
import { auth, db } from './firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="App">
        {/* Navigation Bar */}
        <nav className="navbar">
          <h1>Coiny</h1>
          <div className="nav-buttons">
            <Link to="/" className="nav-link-button">Home</Link>
            {isLoggedIn ? (
              <>
                <Link to="/collection" className="nav-link-button">Collection</Link>
                <button onClick={handleLogout} className="nav-link-button">Logout</button>
              </>
            ) : (
              <>
                <Link to="/register" className="nav-link-button">Register</Link>
                <Link to="/signin" className="nav-link-button">Sign In</Link>
              </>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/collection" element={<ProtectedRoute><CoinCollection /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

const Home = ({ isLoggedIn }) => (
  <header className="App-header">
    <h2>Upload Coin Images</h2>
    <UploadForm isLoggedIn={isLoggedIn} />
  </header>
);

function UploadForm({ isLoggedIn }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (selectedFiles.length + files.length > 2) {
      alert("You can only upload a maximum of 2 files.");
      return;
    }
    setSelectedFiles(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select image files first.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));

      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload files");
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Error uploading files:", error);
      setResponse({ error: "An error occurred while processing the images." });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async () => {
    if (user && response) {
      const coinCollectionRef = collection(db, 'users', user.uid, 'coins');
      try {
        await addDoc(coinCollectionRef, {
          country: response.country,
          year: response.year,
          mint: response.mint,
          note: response.funFact || '',
        });
        alert("Coin details added to your collection!");
      } catch (error) {
        console.error("Error adding coin to collection:", error);
        alert("Failed to add coin to collection.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="file-input-container">
        <label htmlFor="file-upload" className="custom-file-button">Choose Files</label>
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          accept="image/*"
          multiple
        />
        <span className="file-name">
          {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) chosen` : "No files chosen"}
        </span>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : "Upload Images"}
      </button>

      {response && (
        <div className="table-container">
          <table className="styled-table">
            <tbody>
              <tr><td>Country</td><td>{response.country}</td></tr>
              <tr><td>Year</td><td>{response.year}</td></tr>
              <tr><td>Mint</td><td>{response.mint}</td></tr>
              <tr><td>Denomination</td><td>{response.denomination}</td></tr>
              <tr><td>Estimated Price</td><td>{response.estimatedPrice}</td></tr>
              <tr><td>Fun Fact</td><td>{response.funFact}</td></tr>
            </tbody>
          </table>
          {response.ebayResults && (
            <div className="ebay-results">
              <h2>Selling Prices</h2>
              <ul>
                {response.ebayResults.map((item, index) => (
                  <li key={index}>
                    <img src={item.thumbnail} alt={item.title} />
                    <div>
                      <strong>{item.title}</strong>
                      <div>Price: ${item.price}</div>
                    </div>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      View Details
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isLoggedIn && (
            <button onClick={handleAddToCollection} className="add-to-collection-button">
              Add to Collection
            </button>
          )}
        </div>
      )}
    </form>
  );
}

export default App;

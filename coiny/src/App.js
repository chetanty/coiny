import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Register from './register.js';
import SignIn from './Signin.js';
import CoinCollection from './CoinCollection.js';
import ProtectedRoute from './ProtectedRoute.js';
import { auth } from './firebase.js';
import UploadForm from './LandingPage.js';
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


export default App;

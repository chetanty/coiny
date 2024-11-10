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
  <Link to="/" className="home-button">
    <button className="navbar-brand">Coiny</button>
  </Link>
  <div className="nav-buttons">
    {isLoggedIn ? (
      <>
        <Link to="/collection" className="nav-link-button">My Collection</Link>
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
    {/* Add the image below the heading */}
    <img src={`${process.env.PUBLIC_URL}/coiny.png`} alt="Coiny Logo" className="coiny-logo" />
    <UploadForm isLoggedIn={isLoggedIn} />
  </header>
);


export default App;
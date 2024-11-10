import React, { useEffect, useState } from 'react';
import { db, auth } from './firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './CoinCollection.css';

function CoinCollection() {
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCoin, setNewCoin] = useState({ country: '', year: '', mint: '', note: '' });
  const [editCoinId, setEditCoinId] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  // Fetch existing coins
  const fetchCoins = async () => {
    if (user) {
      const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'coins'));
      const fetchedCoins = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoins(fetchedCoins);
      setFilteredCoins(fetchedCoins);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, [user]);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCoin({ ...newCoin, [name]: value });
  };

  // Add or update a coin
  const handleAddOrUpdateCoin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const coinCollectionRef = collection(db, 'users', user.uid, 'coins');
      if (editCoinId) {
        const coinDocRef = doc(db, 'users', user.uid, 'coins', editCoinId);
        await updateDoc(coinDocRef, newCoin);
      } else {
        await addDoc(coinCollectionRef, newCoin);
      }
      setNewCoin({ country: '', year: '', mint: '', note: '' });
      setEditCoinId(null);
      await fetchCoins();
    } catch (error) {
      console.error('Error adding/updating coin:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle coin deletion
  const handleDeleteCoin = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this coin?');
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'coins', id));
        await fetchCoins();
      } catch (error) {
        console.error('Error deleting coin:', error);
      }
    }
  };

  // Handle coin editing
  const handleEditCoin = (coin) => {
    setNewCoin(coin);
    setEditCoinId(coin.id);
  };

  // Filter coins based on search query
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = coins.filter((coin) =>
      coin.country.toLowerCase().includes(query) ||
      coin.year.toLowerCase().includes(query) ||
      coin.mint.toLowerCase().includes(query)
    );
    setFilteredCoins(filtered);
  };

  return (
    <div className="collection-page">
      {/* Add New Coin Section */}
      <div className="form-container">
        <h2>{editCoinId ? 'Edit Coin' : 'Add a New Coin'}</h2>
        <form onSubmit={handleAddOrUpdateCoin}>
          <div className="form-group">
            <label>Country:</label>
            <input type="text" name="country" value={newCoin.country} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Year:</label>
            <input type="text" name="year" value={newCoin.year} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Mint:</label>
            <input type="text" name="mint" value={newCoin.mint} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Note:</label>
            <textarea name="note" value={newCoin.note} onChange={handleChange} />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : editCoinId ? 'Update Coin' : 'Add Coin'}
          </button>
        </form>
      </div>

      {/* Coin Collection Section */}
      <div className="coin-list-container">
        <h2>Your Coin Collection</h2>
        <input
          type="text"
          placeholder="Search coins..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
        {filteredCoins.length > 0 ? (
          <ul>
            {filteredCoins.map((coin) => (
              <li key={coin.id}>
                <div className="coin-details">
                  <p><strong>Country:</strong> {coin.country || 'N/A'}</p>
                  <p><strong>Year:</strong> {coin.year || 'N/A'}</p>
                  <p><strong>Mint:</strong> {coin.mint || 'N/A'}</p>
                  <p><em>Note:</em> {coin.note || 'No note'}</p>
                </div>
                <div className="coin-actions">
                  <button onClick={() => handleEditCoin(coin)}>Edit</button>
                  <button onClick={() => handleDeleteCoin(coin.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No coins found.</p>
        )}
      </div>
    </div>
  );
}

export default CoinCollection;

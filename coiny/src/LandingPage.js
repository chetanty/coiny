import { collection, addDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { auth, db } from './firebase.js';
import './UploadForm.css';

function UploadForm({ isLoggedIn }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;
  const [inputKey, setInputKey] = useState(Date.now());
  const [isDragActive, setIsDragActive] = useState(false);

  // Function to handle file selection from input
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    addFiles(files);
  };

  // Function to handle file drop
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const files = Array.from(event.dataTransfer.files);
    addFiles(files);
  };

  // Add files to the selectedFiles state
  const addFiles = (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
  
    if (imageFiles.length + selectedFiles.length > 2) {
      alert("You can only upload a maximum of 2 image files.");
      return;
    }
  
    if (imageFiles.length !== files.length) {
      alert("Only image files are allowed.");
    }
  
    setSelectedFiles((prevFiles) => [...prevFiles, ...imageFiles]);
  };
  

  // Handle form submission for image upload
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

  // Function to handle adding coin to Firestore collection
  const handleAddToCollection = async () => {
    if (user && response) {
      const coinCollectionRef = collection(db, 'users', user.uid, 'coins');
      try {
        await addDoc(coinCollectionRef, {
          country: response.country,
          year: response.year,
          mint: response.mint,
          denomination: response.denomination,
          estimatedPrice: response.estimatedPrice,
          note: response.funFact || '',
        });
        alert("Coin details added to your collection!");
      } catch (error) {
        console.error("Error adding coin to collection:", error);
        alert("Failed to add coin to collection.");
      }
    }
  };

  // Remove a selected file
  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setInputKey(Date.now());
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Drag and drop area */}
      <div
        className={`file-input-container ${isDragActive ? 'drag-active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
      >
        <label htmlFor="file-upload" className="custom-file-button">Upload Files</label>
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
        />
        <span className="file-name">
          {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) chosen` : "Or drop a file"}
        </span>
      </div>

      {/* Preview selected images */}
      <div className="image-preview-container">
        {selectedFiles.map((file, index) => (
          <div key={index} className="image-preview">
            <button type="button" className="remove-button" onClick={() => handleRemoveFile(index)}>
              &times;
            </button>
            <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
          </div>
        ))}
      </div>

      {selectedFiles.length > 0 && (
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Analyze"}
        </button>
      )}

      {/* Display response data and option to add to collection */}
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
          
          {/* Display eBay results */}
          {response.ebayResults && (
            <div className="ebay-results">
              <h2>Best Prices on Web</h2>
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

{/* Button to add coin details to Firestore */}
{isLoggedIn && (
  <button
    type="button" // Change the button type to "button" to prevent form submission
    onClick={(event) => {
      event.preventDefault(); // Prevents the form submission
      handleAddToCollection();
    }}
    className="add-to-collection-button"
  >
    Add to Collection
  </button>
)}

        </div>
      )}
    </form>
  );
}

export default UploadForm;

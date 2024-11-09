import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle file input change
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("Please select an image file first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setResponse({ error: "An error occurred while processing the image." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Coiny</h1>
        <p>Upload an image of a coin to retrieve information</p>

        <form onSubmit={handleSubmit}>
          <div className="file-input-container">
            <label htmlFor="file-upload" className="custom-file-button">
              Choose File
            </label>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept="image/*"
            />
            <span className="file-name">
              {selectedFile ? selectedFile.name : "No file chosen"}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Upload Image"}
          </button>
        </form>

        {response.country && (
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Country</td>
                  <td>{response.country}</td>
                </tr>
                <tr>
                  <td>Year</td>
                  <td>{response.year}</td>
                </tr>
                <tr>
                  <td>Mint</td>
                  <td>{response.mint}</td>
                </tr>
                <tr>
                  <td>Denomination</td>
                  <td>{response.denomination}</td>
                </tr>
                <tr>
                  <td>Fun Fact</td>
                  <td>{response.funFact}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

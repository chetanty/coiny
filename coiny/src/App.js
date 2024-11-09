import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now()); // Add a key to reset the file input

  // Handle file input change
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (selectedFiles.length + files.length > 2) {
      alert("You can only upload a maximum of 2 files.");
      return;
    }
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
  };

  // Handle file removal
  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setInputKey(Date.now()); // Reset the file input key
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select image files first.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append("files", file);
      });
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Coiny</h1>
        <p>Upload images of coins to retrieve information</p>
        <form onSubmit={handleSubmit}>
          <div className="file-input-container">
            <label htmlFor="file-upload" className="custom-file-button">
              Choose Files
            </label>
            <input
              key={inputKey} // Add the key to reset the file input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept="image/*"
              multiple
            />
            <span className="file-name">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) chosen`
                : "No files chosen"}
            </span>
          </div>
          <div className="image-preview-container">
            {selectedFiles.map((file, index) => (
              <div key={index} className="image-preview">
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => handleRemoveFile(index)}
                >
                  &times;
                </button>
                <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Upload Images"}
          </button>
        </form>
        {response && (
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
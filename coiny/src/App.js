import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

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

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      setResponse(data.text || "No response text found.");
    } catch (error) {
      console.error("Error uploading file:", error);
      setResponse("An error occurred while processing the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Upload an image file for OpenAI to analyze</p>

        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} accept="image/*" />
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Upload to OpenAI"}
          </button>
        </form>

        {response && <p>Response: {response}</p>}
      </header>
    </div>
  );
}

export default App;

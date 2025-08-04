// App.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/upload', formData);
      if (res.data.success) {
        setIsUploaded(true);
        setResponse('PDF uploaded and indexing started. Ask your question below.');
      }
    } catch (err) {
      console.error(err);
      setResponse('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/chat', { message });
      if (res.data.success) {
        setResponse(res.data.answer);
      } else {
        setResponse('Error: ' + res.data.message);
      }
    } catch (err) {
      console.error(err);
      setResponse('Chat failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Chat with your PDF</h1>

        {/* Upload Section */}
        {!isUploaded && (
          <form onSubmit={handleUpload} className="flex flex-col space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="border p-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </form>
        )}

        {/* Chat Section */}
        {isUploaded && (
          <div className="space-y-4">
            <textarea
              placeholder="Ask a question about the PDF..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border p-2 rounded min-h-[80px]"
            />
            <button
              onClick={handleChat}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Thinking...' : 'Ask'}
            </button>
            <div className="bg-gray-100 p-4 rounded text-gray-800 whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// App.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [context, setContext] = useState('');
  const [contextData, setContextData] = useState([]);
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
        setContext(res.data.context || '');
        setContextData(res.data.contextData || []);
      } else {
        setResponse('Error: ' + res.data.message);
        setContext('');
        setContextData([]);
      }
    } catch (err) {
      console.error(err);
      setResponse('Chat failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
              📄 Chat with your PDF
            </h1>
          </div>

          <div className="p-6">
            {/* Upload Section */}
            {!isUploaded && (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg"
                    disabled={loading}
                  >
                    {loading ? '⏳ Uploading...' : '🚀 Upload PDF'}
                  </button>
                </form>
              </div>
            )}

            {/* Chat Section */}
            {isUploaded && (
              <div className="space-y-6">
                {/* Input Section */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <textarea
                    placeholder="💭 Ask a question about your PDF..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border-0 bg-white p-4 rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
                  />
                  <button
                    onClick={handleChat}
                    className="mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-8 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg"
                    disabled={loading}
                  >
                    {loading ? '🤔 Thinking...' : '✨ Ask Question'}
                  </button>
                </div>

                {/* Response Section - Horizontal Layout */}
                {response && (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Answer Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">AI</span>
                        </div>
                        <h3 className="text-lg font-bold text-blue-800">Answer</h3>
                      </div>
                      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {response}
                      </div>
                    </div>

                    {/* Context Section */}
                    {contextData.length > 0 && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">📚</span>
                          </div>
                          <h3 className="text-lg font-bold text-amber-800">Sources</h3>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {contextData.map((source) => (
                            <div key={source.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-amber-200/50 hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                  #{source.id}
                                </span>
                                <span className="text-gray-700 text-sm font-medium truncate">📄 {source.title}</span>
                                <span className="text-amber-600 text-sm font-semibold">p.{source.page}</span>
                              </div>
                              <p className="text-gray-600 text-sm leading-relaxed">{source.preview}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

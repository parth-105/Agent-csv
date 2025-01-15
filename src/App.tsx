import React, { useState } from 'react';
import { FileUp, Send, BarChart2, Database, HelpCircle } from 'lucide-react';
import axios from "axios";

interface AnalysisResult {
  question: string;
  answer: string;
  success: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [response, setResponse] = useState<any>(null);

  const uploadCSV = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // const response = await fetch('http://127.0.0.1:8000/upload', {
      //   method: 'POST',
      //   body: formData,
      // });

      //const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.error || 'File upload failed');
      // }
      setUploadMessage(response.data.message || "File uploaded successfully.");
    } catch (error) {
      setUploadMessage((error as Error).message || 'An error occurred during file upload');
    }
  };

  const queryAgent = async (query: string) => {
    setIsAnalyzing(true);
    try {
      console.log('q', query)
      const result = await axios.post("http://127.0.0.1:8000/query", { query });
      // setResponse(result.data);

      // const response = await fetch('http://localhost:8000/query', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ query }),
      // });

      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.error || 'Query analysis failed');
      // }
      setResponse(result.data)
      setAnalysisHistory((prev) => [...prev, { question: query, answer: result.data.analysis_result, success: result.data.insights }]);
    } catch (error) {
      alert((error as Error).message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
      setQuestion('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      uploadCSV(selectedFile);
    } else {
      alert('Please upload a valid CSV file.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold">DataSense Analytics</h1>
          </div>
          
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload Section */}
          <div className="lg:col-span-1 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-400" />
              Data Source
            </h2>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                <FileUp className="w-12 h-12 text-blue-400 mb-4" />
                <span className="text-sm text-gray-400">{file ? file.name : 'Upload CSV File'}</span>
              </label>
              {uploadMessage && <p className="mt-4 text-sm text-gray-300">{uploadMessage}</p>}
            </div>
          </div>

          {/* Analysis Section */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-blue-400" />
              Ask Questions
            </h2>
            <div className="flex space-x-2 mb-6">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about your data..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={() => queryAgent(question)}
                disabled={!question || isAnalyzing}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 px-4 py-2 rounded-lg flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Ask'}
              </button>
            </div>

            {/* Analysis History */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {analysisHistory.map((item, index) => (
                <div key={index} className="bg-slate-900 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Q: {item.question}</div>
                  <div className="text-gray-100 whitespace-pre-line">A: {item.answer}</div>
                  {response?.insights && (
                    <ul>
                      {response?.insights.map((insight:any, index:any) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {isAnalyzing && (
                <div className="bg-slate-900 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

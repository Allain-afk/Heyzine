import React, { useState, useEffect } from 'react';
import UploadPDF from './components/UploadPDF';
import FlipbookViewer from './components/FlipbookViewer';
import SharedPDFViewer from './components/SharedPDFViewer';
import { Moon, Sun } from 'lucide-react';

function App() {
  const [pdfPages, setPdfPages] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sharedPdfId, setSharedPdfId] = useState(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handlePdfProcessed = (pages) => {
    setPdfPages(pages);
  };

  const handleReset = () => {
    setPdfPages(null);
    setSharedPdfId(null);
  };

  // Check for shared PDF URL on component mount
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/view\/([a-zA-Z0-9]+)/);
    if (match) {
      setSharedPdfId(match[1]);
    }
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Heyzine Flipbook
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sharedPdfId ? (
          <SharedPDFViewer 
            shareId={sharedPdfId}
            onBack={handleReset}
          />
        ) : !pdfPages ? (
          <UploadPDF 
            onPdfProcessed={handlePdfProcessed}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <FlipbookViewer 
            pages={pdfPages}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 dark:text-gray-300">Processing PDF...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 
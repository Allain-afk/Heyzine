import React, { useState, useEffect } from 'react';
import { Download, Share2, ArrowLeft, AlertCircle } from 'lucide-react';
import FlipbookViewer from './FlipbookViewer';

const SharedPDFViewer = ({ shareId, onBack }) => {
  const [pdfData, setPdfData] = useState(null);
  const [pages, setPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPDFData();
  }, [shareId]);

  const fetchPDFData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/pdf/${shareId}`);
      if (!response.ok) {
        throw new Error('PDF not found or access denied');
      }

      const data = await response.json();
      setPdfData(data);

      // Download and process the PDF
      await downloadAndProcessPDF(shareId);

    } catch (error) {
      setError(error.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const downloadAndProcessPDF = async (shareId) => {
    try {
      setIsProcessing(true);

      // Download the PDF file
      const response = await fetch(`/api/pdf/${shareId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const file = new File([blob], pdfData?.title || 'document.pdf', { type: 'application/pdf' });

      // Convert PDF to images using the existing utility
      const { convertPdfToImages, preloadImages } = await import('../utils/pdfToImages');
      const pages = await convertPdfToImages(file);
      await preloadImages(pages);

      setPages(pages);

    } catch (error) {
      setError('Failed to process PDF: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/pdf/${shareId}/download`);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfData?.title || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      setError('Download failed: ' + error.message);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/view/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      // You could show a toast notification here
    } catch (error) {
      setError('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading PDF
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={onBack}
              className="btn-secondary flex items-center space-x-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Processing PDF...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            This may take a moment for large files
          </p>
        </div>
      </div>
    );
  }

  if (pages) {
    return (
      <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
        {/* Header with PDF info and actions */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pdfData?.title || 'Shared PDF'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Uploaded {pdfData?.uploadDate ? new Date(pdfData.uploadDate).toLocaleDateString() : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              
              <button
                onClick={handleShare}
                className="btn-primary flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Flipbook Viewer */}
        <FlipbookViewer 
          pages={pages}
          onReset={onBack}
        />
      </div>
    );
  }

  return null;
};

export default SharedPDFViewer; 
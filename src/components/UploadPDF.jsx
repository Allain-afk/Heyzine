import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Share2, Link, Globe, Lock } from 'lucide-react';
import { convertPdfToImages, preloadImages } from '../utils/pdfToImages';

const UploadPDF = ({ onPdfProcessed, isLoading, setIsLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setError('');
    setSuccess('');
    setShareLink('');
    setUploadProgress(0);
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      return;
    }

    // Validate file size (max 1GB)
    if (file.size > 1024 * 1024 * 1024) {
      setError('File size must be less than 1GB');
      return;
    }

    try {
      setIsLoading(true);
      
      // Option 1: Process locally (current functionality)
      const pages = await convertPdfToImages(file);
      await preloadImages(pages);
      onPdfProcessed(pages);
      
      // Option 2: Upload to server for sharing (new functionality)
      await uploadToServer(file);
      
    } catch (error) {
      setError(error.message || 'Failed to process PDF file');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadToServer = async (file) => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('isPublic', isPublic);
      formData.append('title', file.name.replace('.pdf', ''));

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setShareLink(data.shareUrl);
      setSuccess('PDF uploaded successfully! Share the link with others.');
      
    } catch (error) {
      console.error('Server upload failed, continuing with local processing:', error);
      // Continue with local processing if server upload fails
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setSuccess('Link copied to clipboard!');
    } catch (error) {
      setError('Failed to copy link');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Convert PDF to Flipbook
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Upload your PDF file and transform it into an interactive flipbook with realistic page-turning effects.
        </p>
      </div>

      <div className="card p-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Upload your PDF file
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop your PDF here, or click to browse
              </p>
            </div>

            {/* Privacy Settings */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="text-blue-600"
                />
                <Globe className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Public</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="text-blue-600"
                />
                <Lock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Private</span>
              </label>
            </div>

            <button
              onClick={openFileDialog}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5 mr-2" />
              Choose PDF File
            </button>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Maximum file size: 1GB
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {isLoading && uploadProgress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700 dark:text-green-300">{success}</span>
              </div>
              {shareLink && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  <Link className="w-4 h-4" />
                  <span className="text-sm">Copy Link</span>
                </button>
              )}
            </div>
            {shareLink && (
              <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border text-sm text-gray-600 dark:text-gray-400 break-all">
                {shareLink}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Features Preview */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Easy Upload
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Simply drag and drop your PDF or click to browse
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Share Online
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Generate shareable links for public or private viewing
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Realistic Effects
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Enjoy smooth page-turning animations and effects
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadPDF; 
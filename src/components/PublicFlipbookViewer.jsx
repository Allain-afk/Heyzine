import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  Download,
  Share2,
  X,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize,
  Minimize,
  RotateCw,
  RotateCcw,
  BookOpen,
  Book,
  Play,
  Pause,
  Volume2,
  Copy,
  QrCode,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Send
} from 'lucide-react';

const PublicFlipbookViewer = ({ flipbookData, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isSpreadMode, setIsSpreadMode] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('forward');
  const [pageEffect, setPageEffect] = useState('magazine');
  const [showControls, setShowControls] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const containerRef = useRef(null);
  const pageRef = useRef(null);

  // Check if flipbook requires password
  useEffect(() => {
    if (flipbookData.passwordProtected && !isAuthenticated) {
      setShowPasswordModal(true);
    }
  }, [flipbookData, isAuthenticated]);

  // Handle password authentication
  const handlePasswordSubmit = () => {
    if (password === flipbookData.password) {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
    } else {
      alert('Incorrect password');
    }
  };

  // Calculate pages for different effects
  const getSpreadPages = () => {
    if (!isSpreadMode) {
      return [flipbookData.pages[currentPage - 1]];
    }
    
    switch (pageEffect) {
      case 'magazine':
      case 'book':
        if (currentPage === 1) return [flipbookData.pages[0]];
        if (currentPage === flipbookData.pages.length) return [flipbookData.pages[flipbookData.pages.length - 1]];
        const leftPageIndex = currentPage - 2;
        const rightPageIndex = currentPage - 1;
        return [flipbookData.pages[leftPageIndex], flipbookData.pages[rightPageIndex]];
        
      case 'slider':
        return [flipbookData.pages[currentPage - 1]];
        
      case 'coverflow':
        const centerIndex = currentPage - 1;
        const leftIndex = Math.max(0, centerIndex - 1);
        const rightIndex = Math.min(flipbookData.pages.length - 1, centerIndex + 1);
        return [flipbookData.pages[leftIndex], flipbookData.pages[centerIndex], flipbookData.pages[rightIndex]];
        
      case 'cards':
        if (currentPage === flipbookData.pages.length) return [flipbookData.pages[currentPage - 1]];
        return [flipbookData.pages[currentPage - 1], flipbookData.pages[currentPage]];
        
      case 'notebook':
        if (currentPage === 1) return [flipbookData.pages[0]];
        if (currentPage === flipbookData.pages.length) return [flipbookData.pages[flipbookData.pages.length - 1]];
        return [flipbookData.pages[currentPage - 2], flipbookData.pages[currentPage - 1]];
        
      case 'one-page':
        return [flipbookData.pages[currentPage - 1]];
        
      default:
        return [flipbookData.pages[currentPage - 1]];
    }
  };

  // Page navigation
  const flipToPage = (targetPage, direction = 'forward') => {
    if (targetPage < 1 || targetPage > flipbookData.pages.length || isFlipping) return;
    
    setIsFlipping(true);
    setFlipDirection(direction);
    
    const animationDuration = {
      magazine: 400,
      book: 300,
      slider: 250,
      coverflow: 350,
      cards: 300,
      notebook: 400,
      'one-page': 200
    }[pageEffect] || 300;
    
    setTimeout(() => {
      setCurrentPage(targetPage);
      setIsFlipping(false);
    }, animationDuration);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || isFlipping) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentPage > 1) flipToPage(currentPage - 1, 'backward');
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentPage < flipbookData.pages.length) flipToPage(currentPage + 1, 'forward');
          break;
        case 'Home':
          e.preventDefault();
          flipToPage(1, 'backward');
          break;
        case 'End':
          e.preventDefault();
          flipToPage(flipbookData.pages.length, 'forward');
          break;
        case 'Escape':
          if (isFullscreen) setIsFullscreen(false);
          if (showShareModal) setShowShareModal(false);
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoom(prev => Math.min(prev + 0.1, 3));
          break;
        case '-':
          e.preventDefault();
          setZoom(prev => Math.max(prev - 0.1, 0.5));
          break;
        case '0':
          e.preventDefault();
          setZoom(1);
          setPanOffset({ x: 0, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, flipbookData.pages.length, isFlipping, isFullscreen, showShareModal]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Mouse drag handling for panning
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handling for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && zoom > 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setPanOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  // Swipe handling for page navigation
  const handleSwipe = (e) => {
    if (zoom === 1 && !isFlipping) {
      const touch = e.changedTouches[0];
      const startX = e.targetTouches[0].clientX;
      const deltaX = touch.clientX - startX;
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          if (currentPage > 1) flipToPage(currentPage - 1, 'backward');
        } else {
          if (currentPage < flipbookData.pages.length) flipToPage(currentPage + 1, 'forward');
        }
      }
    }
  };

  // Control functions
  const handleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (error) {
        console.error('Fullscreen request failed:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error('Exit fullscreen failed:', error);
      }
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleRotateLeft = () => setRotation(prev => prev - 90);
  const handleRotateRight = () => setRotation(prev => prev + 90);
  const handleFitToView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMediaClick = (media) => {
    setCurrentMedia(media);
    setShowMediaModal(true);
    setIsPlaying(true);
  };

  const handleMediaClose = () => {
    setShowMediaModal(false);
    setCurrentMedia(null);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Social sharing functions
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(flipbookData.title)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this flipbook: ${flipbookData.title}`);
    const body = encodeURIComponent(`${flipbookData.description}\n\nView it here: ${window.location.href}`);
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = url;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const spreadPages = getSpreadPages();
  const isSpread = spreadPages.length === 2;

  // If password protected and not authenticated, show password modal
  if (flipbookData.passwordProtected && !isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Password Protected
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              This flipbook is password protected. Please enter the password to continue.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter password"
                autoFocus
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <Unlock className="w-4 h-4 inline mr-2" />
                Unlock
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {flipbookData.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {flipbookData.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleFullscreen}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => flipToPage(currentPage - 1, 'backward')}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {flipbookData.pages.length}
            </span>
            
            <button
              onClick={() => flipToPage(currentPage + 1, 'forward')}
              disabled={currentPage >= flipbookData.pages.length}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleFitToView}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Move className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main viewer */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-gray-200 dark:bg-gray-800"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleSwipe}
      >
        {spreadPages.length > 0 && (
          <div
            ref={pageRef}
            className={`absolute inset-0 flex items-center justify-center ${
              isFlipping ? `${pageEffect}-flipping ${pageEffect}-flip-${flipDirection}` : ''
            }`}
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
          >
            <div className={`relative ${
              pageEffect === 'coverflow' ? 'flex gap-4 items-center justify-center' :
              pageEffect === 'cards' ? 'flex gap-2 items-center justify-center' :
              isSpread ? 'flex gap-3 md:gap-6 items-center justify-center' : ''
            }`}>
              {spreadPages.map((pageData, index) => (
                <div 
                  key={index} 
                  className={`relative ${
                    pageEffect === 'coverflow' ? 'flex-1 max-w-[30%]' :
                    pageEffect === 'cards' ? 'flex-1 max-w-[45%]' :
                    isSpread ? 'flex-1 max-w-[49%] md:max-w-[46%]' : ''
                  } ${
                    isFlipping ? `${pageEffect}-page-flip-${flipDirection}` : ''
                  }`}
                  style={{
                    perspective: '1200px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <img
                    src={pageData.imageUrl}
                    alt={`Page ${currentPage + (isSpread ? index - 1 : 0)}`}
                    className="max-w-full max-h-full object-contain shadow-xl"
                    draggable={false}
                    style={{
                      backfaceVisibility: 'hidden',
                      borderRadius: '4px'
                    }}
                  />
                  
                  {/* Media overlays */}
                  {pageData.media && (
                    <div className="absolute inset-0">
                      {pageData.media.video && (
                        <div
                          className="absolute cursor-pointer bg-black bg-opacity-50 rounded-lg flex items-center justify-center"
                          style={{
                            left: `${pageData.media.video.x}%`,
                            top: `${pageData.media.video.y}%`,
                            width: `${pageData.media.video.width}%`,
                            height: `${pageData.media.video.height}%`
                          }}
                          onClick={() => handleMediaClick(pageData.media.video)}
                        >
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      )}
                      
                      {pageData.media.audio && (
                        <div
                          className="absolute cursor-pointer bg-blue-500 bg-opacity-75 rounded-full flex items-center justify-center"
                          style={{
                            left: `${pageData.media.audio.x}%`,
                            top: `${pageData.media.audio.y}%`,
                            width: '40px',
                            height: '40px'
                          }}
                          onClick={() => handleMediaClick(pageData.media.audio)}
                        >
                          <Volume2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${(currentPage / flipbookData.pages.length) * 100}%` }}
        />
      </div>

      {/* Media Modal */}
      {showMediaModal && currentMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentMedia.title || 'Media Player'}
              </h3>
              <button
                onClick={handleMediaClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {currentMedia.type === 'video' && (
                <video
                  src={currentMedia.src}
                  controls
                  autoPlay={isPlaying}
                  className="w-full rounded-lg"
                />
              )}
              
              {currentMedia.type === 'audio' && (
                <div className="space-y-4">
                  <audio
                    src={currentMedia.src}
                    controls
                    autoPlay={isPlaying}
                    className="w-full"
                  />
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={togglePlayPause}
                      className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              )}
              
              {currentMedia.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {currentMedia.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share Flipbook
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={() => copyToClipboard(window.location.href)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={shareToFacebook}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                  title="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button
                  onClick={shareToTwitter}
                  className="p-3 bg-blue-400 hover:bg-blue-500 text-white rounded-full"
                  title="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={shareToLinkedIn}
                  className="p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-full"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
                <button
                  onClick={shareViaEmail}
                  className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full"
                  title="Share via Email"
                >
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicFlipbookViewer; 
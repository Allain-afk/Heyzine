import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Book,
  Share2,
  Download,
  Settings,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  ChevronLeft,
  ChevronRight,
  Home,
  Info,
  HelpCircle,
  X,
  Copy,
  ExternalLink,
  QrCode,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
  Send,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import PageToolbar from './PageToolbar';

const FlipbookViewer = ({ pages, onReset }) => {
  // Core state
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
  // Media state
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // View modes
  const [isSpreadMode, setIsSpreadMode] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('forward');
  const [pageEffect, setPageEffect] = useState('magazine');
  
  // Heyzine-style features
  const [showControls, setShowControls] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(3000);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [theme, setTheme] = useState('light'); // light, dark, auto
  const [language, setLanguage] = useState('en');
  const [rightToLeft, setRightToLeft] = useState(false);
  
  // Sharing functionality
  const [shareUrl, setShareUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [shareTitle, setShareTitle] = useState('My Flipbook');
  const [shareDescription, setShareDescription] = useState('Check out this amazing flipbook!');
  const [shareImage, setShareImage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [sharePassword, setSharePassword] = useState('');
  const [shareExpiry, setShareExpiry] = useState('7d'); // 1d, 7d, 30d, never
  const [shareStats, setShareStats] = useState({
    views: 0,
    shares: 0,
    downloads: 0
  });
  
  // Customization
  const [customLogo, setCustomLogo] = useState(null);
  const [customBackground, setCustomBackground] = useState('#ffffff');
  const [customColors, setCustomColors] = useState({
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#f59e0b'
  });
  
  // Statistics
  const [viewCount, setViewCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [interactions, setInteractions] = useState([]);
  
  const containerRef = useRef(null);
  const pageRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Generate share URL and embed code
  useEffect(() => {
    const generateShareData = () => {
      const baseUrl = window.location.origin;
      const flipbookId = `flipbook_${Date.now()}`;
      const shareUrl = `${baseUrl}/view/${flipbookId}`;
      
      setShareUrl(shareUrl);
      
      // Generate embed code
      const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
      setEmbedCode(embedCode);
      
      // Generate QR code URL
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
      setQrCodeUrl(qrCodeUrl);
    };
    
    generateShareData();
  }, []);

  // Social media sharing functions
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareDescription)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareDescription)}&hashtags=flipbook,digital`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareDescription} ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareDescription)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this flipbook: ${shareTitle}`);
    const body = encodeURIComponent(`${shareDescription}\n\nView it here: ${shareUrl}`);
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = url;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success message
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'flipbook-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePublicLink = () => {
    // In a real app, this would create a public link on the server
    const publicId = Math.random().toString(36).substring(2, 15);
    const publicUrl = `${window.location.origin}/public/${publicId}`;
    setShareUrl(publicUrl);
    setShareStats(prev => ({ ...prev, shares: prev.shares + 1 }));
  };

  const togglePublicAccess = () => {
    setIsPublic(!isPublic);
    if (!isPublic) {
      generatePublicLink();
    }
  };

  // Calculate pages for different effects
  const getSpreadPages = () => {
    if (!isSpreadMode) {
      return [pages[currentPage - 1]];
    }
    
    // Handle different page effects
    switch (pageEffect) {
      case 'magazine':
      case 'book':
        // Magazine/Book style: show two pages side by side
        if (currentPage === 1) return [pages[0]];
        if (currentPage === pages.length) return [pages[pages.length - 1]];
        const leftPageIndex = currentPage - 2;
        const rightPageIndex = currentPage - 1;
        return [pages[leftPageIndex], pages[rightPageIndex]];
        
      case 'slider':
        // Slider style: single page
        return [pages[currentPage - 1]];
        
      case 'coverflow':
        // Coverflow style: show multiple pages
        const centerIndex = currentPage - 1;
        const leftIndex = Math.max(0, centerIndex - 1);
        const rightIndex = Math.min(pages.length - 1, centerIndex + 1);
        return [pages[leftIndex], pages[centerIndex], pages[rightIndex]];
        
      case 'cards':
        // Cards style: show current and next page
        if (currentPage === pages.length) return [pages[currentPage - 1]];
        return [pages[currentPage - 1], pages[currentPage]];
        
      case 'notebook':
        // Notebook style: like magazine but with different spacing
        if (currentPage === 1) return [pages[0]];
        if (currentPage === pages.length) return [pages[pages.length - 1]];
        return [pages[currentPage - 2], pages[currentPage - 1]];
        
      case 'one-page':
        // One page style: always single page
        return [pages[currentPage - 1]];
        
      default:
        return [pages[currentPage - 1]];
    }
  };

  // Advanced page navigation with different effects
  const flipToPage = (targetPage, direction = 'forward') => {
    if (targetPage < 1 || targetPage > pages.length || isFlipping) return;
    
    setIsFlipping(true);
    setFlipDirection(direction);
    
    // Track interaction
    setInteractions(prev => [...prev, {
      type: 'page_navigation',
      from: currentPage,
      to: targetPage,
      direction,
      timestamp: Date.now()
    }]);
    
    // Different animation durations for different effects
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

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isFlipping) {
      autoPlayRef.current = setTimeout(() => {
        if (currentPage < pages.length) {
          flipToPage(currentPage + 1, 'forward');
        } else {
          setAutoPlay(false);
        }
      }, autoPlaySpeed);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [autoPlay, currentPage, pages.length, isFlipping, autoPlaySpeed]);

  // Track view statistics
  useEffect(() => {
    setViewCount(prev => prev + 1);
    const startTime = Date.now();
    
    return () => {
      const timeSpentOnPage = Date.now() - startTime;
      setTimeSpent(prev => prev + timeSpentOnPage);
    };
  }, [currentPage]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || isFlipping) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (rightToLeft) {
            if (currentPage < pages.length) flipToPage(currentPage + 1, 'forward');
          } else {
            if (currentPage > 1) flipToPage(currentPage - 1, 'backward');
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (rightToLeft) {
            if (currentPage > 1) flipToPage(currentPage - 1, 'backward');
          } else {
            if (currentPage < pages.length) flipToPage(currentPage + 1, 'forward');
          }
          break;
        case 'Home':
          e.preventDefault();
          flipToPage(1, 'backward');
          break;
        case 'End':
          e.preventDefault();
          flipToPage(pages.length, 'forward');
          break;
        case ' ':
          e.preventDefault();
          setAutoPlay(prev => !prev);
          break;
        case 'Escape':
          if (isFullscreen) setIsFullscreen(false);
          if (showShareModal) setShowShareModal(false);
          if (showSettings) setShowSettings(false);
          if (showHelp) setShowHelp(false);
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
  }, [currentPage, pages.length, isFullscreen, isFlipping, rightToLeft, showShareModal, showSettings, showHelp]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle mouse wheel for zoom
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

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
          if (rightToLeft) {
            if (currentPage < pages.length) flipToPage(currentPage + 1, 'forward');
          } else {
            if (currentPage > 1) flipToPage(currentPage - 1, 'backward');
          }
        } else {
          if (rightToLeft) {
            if (currentPage > 1) flipToPage(currentPage - 1, 'backward');
          } else {
            if (currentPage < pages.length) flipToPage(currentPage + 1, 'forward');
          }
        }
      }
    }
  };

  // Heyzine-style functions
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
  
  const toggleSpreadMode = () => {
    setIsSpreadMode(prev => !prev);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleFitToView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePageEffectChange = (newEffect) => {
    setPageEffect(newEffect);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const toggleAutoPlay = () => {
    setAutoPlay(prev => !prev);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Download flipbook');
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleHelp = () => {
    setShowHelp(true);
  };

  const spreadPages = getSpreadPages();
  const isSpread = spreadPages.length === 2;

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

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Toolbar */}
      <PageToolbar
        currentPage={currentPage}
        totalPages={pages.length}
        onPageChange={(page) => flipToPage(page, page > currentPage ? 'forward' : 'backward')}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
        zoom={zoom}
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
        isSpreadMode={isSpreadMode}
        onToggleSpreadMode={toggleSpreadMode}
        onFitToView={handleFitToView}
        pageEffect={pageEffect}
        onPageEffectChange={handlePageEffectChange}
        autoPlay={autoPlay}
        onToggleAutoPlay={toggleAutoPlay}
        onShare={handleShare}
        onDownload={handleDownload}
        onSettings={handleSettings}
        onHelp={handleHelp}
        showControls={showControls}
        onToggleControls={() => setShowControls(prev => !prev)}
        showThumbnails={showThumbnails}
        onToggleThumbnails={() => setShowThumbnails(prev => !prev)}
        showPageNumbers={showPageNumbers}
        showProgressBar={showProgressBar}
        rightToLeft={rightToLeft}
        onToggleRightToLeft={() => setRightToLeft(prev => !prev)}
        viewCount={viewCount}
        timeSpent={timeSpent}
      />

      {/* Back button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onReset}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </button>
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
      {showProgressBar && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(currentPage / pages.length) * 100}%` }}
          />
        </div>
      )}

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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Share Flipbook
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Public Access Settings */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Public Access</h4>
                  <button
                    onClick={togglePublicAccess}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isPublic 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {isPublic ? 'Public' : 'Private'}
                  </button>
                </div>
                
                {isPublic && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Share URL
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(shareUrl)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expiry
                        </label>
                        <select
                          value={shareExpiry}
                          onChange={(e) => setShareExpiry(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="1d">1 Day</option>
                          <option value="7d">7 Days</option>
                          <option value="30d">30 Days</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Password Protection
                        </label>
                        <input
                          type="password"
                          placeholder="Optional password"
                          value={sharePassword}
                          onChange={(e) => setSharePassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Sharing */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Share on Social Media</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  <button
                    onClick={shareToFacebook}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex flex-col items-center space-y-1"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                    <span className="text-xs">Facebook</span>
                  </button>
                  
                  <button
                    onClick={shareToTwitter}
                    className="p-3 bg-blue-400 hover:bg-blue-500 text-white rounded-lg flex flex-col items-center space-y-1"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                    <span className="text-xs">Twitter</span>
                  </button>
                  
                  <button
                    onClick={shareToLinkedIn}
                    className="p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex flex-col items-center space-y-1"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span className="text-xs">LinkedIn</span>
                  </button>
                  
                  <button
                    onClick={shareToWhatsApp}
                    className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex flex-col items-center space-y-1"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs">WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={shareToTelegram}
                    className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex flex-col items-center space-y-1"
                    title="Share on Telegram"
                  >
                    <Send className="w-5 h-5" />
                    <span className="text-xs">Telegram</span>
                  </button>
                  
                  <button
                    onClick={shareViaEmail}
                    className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex flex-col items-center space-y-1"
                    title="Share via Email"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-xs">Email</span>
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">QR Code</h4>
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={downloadQRCode}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      Download QR Code
                    </button>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Scan to open on mobile
                    </p>
                  </div>
                </div>
              </div>

              {/* Embed Code */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Embed Code</h4>
                <div className="space-y-2">
                  <textarea
                    value={embedCode}
                    readOnly
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(embedCode)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                  >
                    Copy Embed Code
                  </button>
                </div>
              </div>

              {/* Share Statistics */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Share Statistics</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {shareStats.views}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {shareStats.shares}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Shares</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {shareStats.downloads}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="pt">Português</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Right to Left
                </label>
                <button
                  onClick={() => setRightToLeft(prev => !prev)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    rightToLeft 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {rightToLeft ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Page Numbers
                </label>
                <button
                  onClick={() => setShowPageNumbers(prev => !prev)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    showPageNumbers 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {showPageNumbers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Progress Bar
                </label>
                <button
                  onClick={() => setShowProgressBar(prev => !prev)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    showProgressBar 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {showProgressBar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Help & Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Navigation</h4>
                <div className="space-y-1">
                  <div>← → Arrow keys: Navigate pages</div>
                  <div>Home: First page</div>
                  <div>End: Last page</div>
                  <div>Space: Toggle auto-play</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Zoom & Pan</h4>
                <div className="space-y-1">
                  <div>Ctrl/Cmd + Mouse wheel: Zoom</div>
                  <div>+ / -: Zoom in/out</div>
                  <div>0: Reset zoom</div>
                  <div>Drag when zoomed: Pan</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Other</h4>
                <div className="space-y-1">
                  <div>F: Toggle fullscreen</div>
                  <div>R: Rotate</div>
                  <div>Escape: Close modals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlipbookViewer; 
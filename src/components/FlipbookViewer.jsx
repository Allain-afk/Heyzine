import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import PageToolbar from './PageToolbar';

const FlipbookViewer = ({ pages, onReset }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const containerRef = useRef(null);
  const pageRef = useRef(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentPage > 1) setCurrentPage(currentPage - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentPage < pages.length) setCurrentPage(currentPage + 1);
          break;
        case 'Escape':
          if (isFullscreen) setIsFullscreen(false);
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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, pages.length, isFullscreen]);

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
    if (zoom === 1) {
      const touch = e.changedTouches[0];
      const startX = e.targetTouches[0].clientX;
      const deltaX = touch.clientX - startX;
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else if (deltaX < 0 && currentPage < pages.length) {
          setCurrentPage(currentPage + 1);
        }
      }
    }
  };

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

  const currentPageData = pages[currentPage - 1];
  const hasMedia = currentPageData?.media;

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
        onPageChange={setCurrentPage}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
        zoom={zoom}
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
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
        {currentPageData && (
          <div
            ref={pageRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
          >
            <div className="relative">
              <img
                src={currentPageData.imageUrl}
                alt={`Page ${currentPage}`}
                className="max-w-full max-h-full object-contain shadow-lg"
                draggable={false}
              />
              
              {/* Media overlays */}
              {hasMedia && (
                <div className="absolute inset-0">
                  {hasMedia.video && (
                    <div
                      className="absolute cursor-pointer bg-black bg-opacity-50 rounded-lg flex items-center justify-center"
                      style={{
                        left: `${hasMedia.video.x}%`,
                        top: `${hasMedia.video.y}%`,
                        width: `${hasMedia.video.width}%`,
                        height: `${hasMedia.video.height}%`
                      }}
                      onClick={() => handleMediaClick(hasMedia.video)}
                    >
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  {hasMedia.audio && (
                    <div
                      className="absolute cursor-pointer bg-blue-500 bg-opacity-75 rounded-full flex items-center justify-center"
                      style={{
                        left: `${hasMedia.audio.x}%`,
                        top: `${hasMedia.audio.y}%`,
                        width: '40px',
                        height: '40px'
                      }}
                      onClick={() => handleMediaClick(hasMedia.audio)}
                    >
                      <Volume2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
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
                ×
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
    </div>
  );
};

export default FlipbookViewer; 
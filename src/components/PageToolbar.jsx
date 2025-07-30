import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  RotateCw,
  BookOpen,
  Book,
  Move,
  BookOpen as Magazine,
  Sliders,
  Share2,
  Download,
  Settings,
  HelpCircle,
  Eye,
  EyeOff,
  Play,
  Pause,
  Clock,
  BarChart3,
  Globe,
  Languages,
  Palette,
  QrCode,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  ExternalLink
} from 'lucide-react';

const PageToolbar = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onZoomIn, 
  onZoomOut, 
  onFullscreen, 
  isFullscreen,
  zoom,
  onRotateLeft,
  onRotateRight,
  isSpreadMode,
  onToggleSpreadMode,
  onFitToView,
  pageEffect,
  onPageEffectChange,
  autoPlay,
  onToggleAutoPlay,
  onShare,
  onDownload,
  onSettings,
  onHelp,
  showControls,
  onToggleControls,
  showThumbnails,
  onToggleThumbnails,
  showPageNumbers,
  showProgressBar,
  rightToLeft,
  onToggleRightToLeft,
  viewCount,
  timeSpent
}) => {
  const handlePageInput = (e) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const pageEffects = [
    { id: 'magazine', name: 'Magazine', icon: Magazine },
    { id: 'book', name: 'Book', icon: Book },
    { id: 'slider', name: 'Slider', icon: Sliders },
    { id: 'coverflow', name: 'Coverflow', icon: BookOpen },
    { id: 'cards', name: 'Cards', icon: Book },
    { id: 'notebook', name: 'Notebook', icon: BookOpen },
    { id: 'one-page', name: 'One Page', icon: Book }
  ];

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={handlePageInput}
              onKeyPress={handleKeyPress}
              className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              of {totalPages}
            </span>
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Center - Page info and statistics */}
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <BarChart3 className="w-3 h-3" />
            <span>{viewCount} views</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatTime(timeSpent)}</span>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-2">
          {/* Auto-play toggle */}
          <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
            <button
              onClick={onToggleAutoPlay}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                autoPlay 
                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={autoPlay ? "Stop auto-play" : "Start auto-play"}
              title={autoPlay ? "Stop auto-play" : "Start auto-play"}
            >
              {autoPlay ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Page effect selector */}
          <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
            <div className="relative">
              <select
                value={pageEffect}
                onChange={(e) => onPageEffectChange(e.target.value)}
                className="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {pageEffects.map((effect) => (
                  <option key={effect.id} value={effect.id}>
                    {effect.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronLeft className="w-3 h-3 rotate-90" />
              </div>
            </div>
          </div>

          {/* Spread mode toggle */}
          <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
            <button
              onClick={onToggleSpreadMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isSpreadMode 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={isSpreadMode ? "Switch to single page view" : "Switch to spread view"}
              title={isSpreadMode ? "Switch to single page view" : "Switch to spread view"}
            >
              {isSpreadMode ? (
                <BookOpen className="w-4 h-4" />
              ) : (
                <Book className="w-4 h-4" />
              )}
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {isSpreadMode ? 'Spread' : 'Single'}
            </span>
          </div>

          {/* Right to Left toggle */}
          <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
            <button
              onClick={onToggleRightToLeft}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                rightToLeft 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={rightToLeft ? "Switch to Left to Right" : "Switch to Right to Left"}
              title={rightToLeft ? "Switch to Left to Right" : "Switch to Right to Left"}
            >
              <Globe className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {rightToLeft ? 'RTL' : 'LTR'}
            </span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
            <button
              onClick={onZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <button
              onClick={onZoomIn}
              disabled={zoom >= 3}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={onFitToView}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Fit to view"
              title="Fit to view"
            >
              <Move className="w-4 h-4" />
            </button>
          </div>

          {/* Rotation controls */}
          <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
            <button
              onClick={onRotateLeft}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Rotate left"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={onRotateRight}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Rotate right"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Visibility controls */}
          <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
            <button
              onClick={onToggleControls}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                showControls 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={showControls ? "Hide controls" : "Show controls"}
              title={showControls ? "Hide controls" : "Show controls"}
            >
              {showControls ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            <button
              onClick={onToggleThumbnails}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                showThumbnails 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={showThumbnails ? "Hide thumbnails" : "Show thumbnails"}
              title={showThumbnails ? "Hide thumbnails" : "Show thumbnails"}
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
            <button
              onClick={onShare}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Share flipbook"
              title="Share flipbook"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={onDownload}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Download flipbook"
              title="Download flipbook"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Settings and Help */}
          <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
            <button
              onClick={onSettings}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={onHelp}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Help"
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={onFullscreen}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageToolbar; 
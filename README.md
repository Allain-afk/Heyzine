# Heyzine Flipbook

A modern React-based flipbook application that converts PDF files into interactive flipbooks with realistic page-turning effects, zoom functionality, and multimedia support.

## 🚀 Features

- **PDF Upload**: Drag-and-drop or click to upload PDF files
- **Online Sharing**: Upload PDFs to server and generate shareable links
- **Public/Private Sharing**: Choose who can access your PDFs
- **Realistic Page Turning**: Smooth animations and effects
- **Zoom & Pan**: Zoom in/out with mouse wheel or buttons, pan when zoomed
- **Fullscreen Mode**: Toggle fullscreen viewing
- **Mobile Responsive**: Touch gestures for page navigation
- **Keyboard Navigation**: Arrow keys for page navigation, +/- for zoom
- **Dark Mode**: Toggle between light and dark themes
- **Multimedia Support**: Overlay videos and audio on specific pages
- **Rotation**: Rotate pages left or right
- **Performance Optimized**: Lazy loading and image preloading

## 🛠️ Installation

1. **Clone or download the project**
   ```bash
   # If you have the files locally, navigate to the project directory
   cd Heyzine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`
   
   The server will run on `http://localhost:3001` for API endpoints

## 📖 Usage

### Basic Usage

1. **Upload a PDF**: Click "Choose PDF File" or drag and drop a PDF file onto the upload area
2. **Choose Privacy**: Select public or private sharing
3. **Wait for Processing**: The app will convert your PDF to images and upload to server
4. **Get Share Link**: Copy the generated link to share with others
5. **Navigate**: Use the toolbar buttons, arrow keys, or swipe gestures to navigate pages
6. **Zoom**: Use the zoom buttons, mouse wheel (Ctrl/Cmd + scroll), or +/- keys
7. **Fullscreen**: Click the fullscreen button for immersive viewing

### Advanced Features

- **Touch Gestures**: On mobile devices, swipe left/right to navigate pages
- **Keyboard Shortcuts**:
  - `←` / `→`: Navigate pages
  - `+` / `-`: Zoom in/out
  - `Escape`: Exit fullscreen
- **Mouse Controls**: 
  - Drag to pan when zoomed in
  - Ctrl/Cmd + scroll to zoom
- **Media Overlays**: Click on video/audio overlays to play media in a modal
- **Shared PDFs**: View PDFs shared by others via direct links

## 🧪 Test Scenarios

### 1. Basic PDF Upload and Navigation
- Upload a 5-20 page PDF
- Navigate through pages using buttons, arrows, or swipe
- Verify smooth page transitions

### 2. Mobile Testing
- Test on mobile devices
- Verify swipe gestures work correctly
- Check responsive design

### 3. Zoom and Pan Functionality
- Zoom in on pages using various methods
- Pan around when zoomed in
- Test zoom limits (50% - 300%)

### 4. Sharing Features
- Upload a PDF and generate a share link
- Test public and private sharing options
- Share the link with others and verify they can access it
- Test downloading shared PDFs

### 5. Multimedia Features
- Add video/audio overlays to pages
- Test media playback in modal
- Verify media controls work

### 6. Fullscreen and Rotation
- Toggle fullscreen mode
- Rotate pages left and right
- Test keyboard shortcuts

## 🏗️ Project Structure

```
src/
├── components/
│   ├── UploadPDF.jsx      # PDF upload component
│   ├── FlipbookViewer.jsx # Main flipbook viewer
│   └── PageToolbar.jsx    # Navigation and control toolbar
├── utils/
│   └── pdfToImages.js     # PDF to image conversion utility
├── App.jsx                # Main application component
├── index.js               # Application entry point
└── index.css              # Global styles with Tailwind CSS
```

## 🛠️ Technologies Used

- **React 18**: Modern React with hooks
- **PDF.js**: PDF processing and rendering
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **HTML5 Canvas**: Image rendering and processing

## 🎨 Customization

### Adding Media Overlays

To add video or audio overlays to specific pages, modify the page data structure:

```javascript
// Example page with media overlay
{
  id: 3,
  imageUrl: "data:image/png;base64,...",
  pageNumber: 3,
  media: {
    video: {
      src: "https://example.com/video.mp4",
      title: "Demo Video",
      x: 20, // percentage from left
      y: 30, // percentage from top
      width: 60, // percentage width
      height: 40, // percentage height
      type: "video"
    },
    audio: {
      src: "https://example.com/audio.mp3",
      title: "Background Music",
      x: 80,
      y: 90,
      type: "audio"
    }
  }
}
```

### Styling Customization

The app uses Tailwind CSS. You can customize the theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add your custom colors
      },
      animation: {
        // Add custom animations
      }
    }
  }
}
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

### Deploy to Netlify/Vercel

1. Push your code to GitHub
2. Connect your repository to Netlify or Vercel
3. Deploy automatically on push

## 🔧 Configuration

### PDF Processing Settings

Modify `src/utils/pdfToImages.js` to adjust PDF processing:

```javascript
// Change scale for different image quality
const viewport = page.getViewport({ scale: 1.5 }); // Increase for higher quality

// Adjust file size limits in UploadPDF.jsx
if (file.size > 1024 * 1024 * 1024) { // 1GB limit
```

### Performance Optimization

- **Image Quality**: Balance between quality and file size
- **Preloading**: Images are preloaded for smooth navigation
- **Lazy Loading**: Consider implementing lazy loading for very large PDFs

## 🐛 Troubleshooting

### Common Issues

1. **PDF not loading**: Check file size (max 1GB) and ensure it's a valid PDF
2. **Slow processing**: Large PDFs take time to process - this is normal
3. **Zoom not working**: Ensure you're using Ctrl/Cmd + scroll or the zoom buttons
4. **Touch gestures not working**: Ensure you're on a touch device and not zoomed in

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch gestures

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions, please check the troubleshooting section above or create an issue in the repository. 
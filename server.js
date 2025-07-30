const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// For Vercel deployment, we'll use memory storage instead of disk storage
// since serverless functions don't have persistent file system
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// In-memory storage for PDF metadata and files
// Note: This will reset on each serverless function cold start
// For production, use a database like MongoDB Atlas
const pdfDatabase = new Map();
const pdfFiles = new Map(); // Store files in memory

// API Routes

// Upload PDF
app.post('/api/upload-pdf', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { isPublic, title } = req.body;
    const fileId = uuidv4();
    const shareId = uuidv4().substring(0, 8); // Shorter ID for sharing

    const pdfData = {
      id: fileId,
      shareId: shareId,
      filename: `${uniqueId}-${req.file.originalname}`,
      originalName: req.file.originalname,
      title: title || req.file.originalname.replace('.pdf', ''),
      isPublic: isPublic === 'true',
      uploadDate: new Date().toISOString(),
      fileSize: req.file.size
    };

    // Store in memory (will be lost on cold start)
    pdfDatabase.set(fileId, pdfData);
    pdfDatabase.set(shareId, pdfData); // Also index by shareId
    pdfFiles.set(shareId, req.file.buffer); // Store file buffer in memory

    const shareUrl = `${req.protocol}://${req.get('host')}/view/${shareId}`;
    
    res.json({
      success: true,
      fileId: fileId,
      shareId: shareId,
      shareUrl: shareUrl,
      message: 'PDF uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get PDF metadata
app.get('/api/pdf/:shareId', (req, res) => {
  const { shareId } = req.params;
  const pdfData = pdfDatabase.get(shareId);

  if (!pdfData) {
    return res.status(404).json({ error: 'PDF not found' });
  }

  res.json({
    id: pdfData.id,
    shareId: pdfData.shareId,
    title: pdfData.title,
    isPublic: pdfData.isPublic,
    uploadDate: pdfData.uploadDate,
    fileSize: pdfData.fileSize
  });
});

// Download PDF
app.get('/api/pdf/:shareId/download', (req, res) => {
  const { shareId } = req.params;
  const pdfData = pdfDatabase.get(shareId);
  const pdfBuffer = pdfFiles.get(shareId);

  if (!pdfData || !pdfBuffer) {
    return res.status(404).json({ error: 'PDF not found' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${pdfData.originalName}"`);
  res.send(pdfBuffer);
});

// List public PDFs
app.get('/api/pdfs/public', (req, res) => {
  const publicPdfs = Array.from(pdfDatabase.values())
    .filter(pdf => pdf.isPublic)
    .map(pdf => ({
      id: pdf.id,
      shareId: pdf.shareId,
      title: pdf.title,
      uploadDate: pdf.uploadDate,
      fileSize: pdf.fileSize
    }));

  res.json(publicPdfs);
});

// Delete PDF
app.delete('/api/pdf/:shareId', (req, res) => {
  const { shareId } = req.params;
  const pdfData = pdfDatabase.get(shareId);

  if (!pdfData) {
    return res.status(404).json({ error: 'PDF not found' });
  }

  try {
    // Remove from memory
    pdfDatabase.delete(pdfData.id);
    pdfDatabase.delete(pdfData.shareId);
    pdfFiles.delete(shareId);

    res.json({ success: true, message: 'PDF deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// API routes only - Vercel will handle static file serving

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// For Vercel deployment, export the app instead of listening
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Development mode - files stored in memory');
  });
}

module.exports = app; 
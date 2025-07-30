# Deployment Guide for Heyzine Flipbook

This guide will help you deploy the Heyzine flipbook application with PDF sharing functionality.

## 🚀 Quick Deployment Options

### Option 1: Deploy to Railway (Recommended)

1. **Fork/Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Heyzine
   ```

2. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Railway will automatically detect the Node.js app

3. **Set Environment Variables**
   - `PORT`: Railway will set this automatically
   - `NODE_ENV`: `production`

4. **Deploy**
   - Railway will automatically build and deploy your app
   - Your app will be available at `https://your-app-name.railway.app`

### Option 2: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku app**
   ```bash
   heroku create your-heyzine-app
   ```

3. **Set buildpacks**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure for full-stack**
   - Vercel will create serverless functions for your API
   - Update API routes to work with serverless architecture

## 🏗️ Production Setup

### Database Setup (Recommended)

For production, replace the in-memory storage with a real database:

1. **MongoDB Atlas (Free)**
   ```bash
   npm install mongoose
   ```

2. **Update server.js**
   ```javascript
   const mongoose = require('mongoose');
   
   // Connect to MongoDB
   mongoose.connect(process.env.MONGODB_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true
   });
   
   // Create PDF Schema
   const pdfSchema = new mongoose.Schema({
     id: String,
     shareId: String,
     filename: String,
     originalName: String,
     title: String,
     isPublic: Boolean,
     uploadDate: Date,
     fileSize: Number,
     path: String
   });
   
   const PDF = mongoose.model('PDF', pdfSchema);
   ```

### File Storage Setup

For production, use cloud storage instead of local files:

1. **AWS S3**
   ```bash
   npm install aws-sdk
   ```

2. **Update upload configuration**
   ```javascript
   const AWS = require('aws-sdk');
   const s3 = new AWS.S3({
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
   });
   ```

### Environment Variables

Create a `.env` file for local development:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database (if using MongoDB)
MONGODB_URI=mongodb://localhost:27017/heyzine

# File Storage (if using AWS S3)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your-bucket-name

# Security
JWT_SECRET=your_jwt_secret
```

## 🔧 Configuration

### Update API Base URL

In production, update the API calls in your React components:

```javascript
// In UploadPDF.jsx and SharedPDFViewer.jsx
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const response = await fetch(`${API_BASE}/api/upload-pdf`, {
  // ... rest of the code
});
```

### CORS Configuration

Update CORS settings in `server.js`:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
```

## 📁 File Structure for Production

```
Heyzine/
├── public/                 # Static files
├── src/                   # React components
├── uploads/               # PDF storage (local)
├── server.js              # Express server
├── package.json           # Dependencies
├── .env                   # Environment variables
├── .gitignore            # Git ignore
└── README.md             # Documentation
```

## 🔒 Security Considerations

1. **File Upload Limits**
   - Set appropriate file size limits
   - Validate file types
   - Scan for malware

2. **Access Control**
   - Implement user authentication
   - Add rate limiting
   - Use HTTPS in production

3. **Data Protection**
   - Encrypt sensitive data
   - Implement proper session management
   - Regular security updates

## 🚀 Performance Optimization

1. **Image Optimization**
   - Compress PDF images
   - Use WebP format
   - Implement lazy loading

2. **Caching**
   - Cache processed images
   - Use CDN for static files
   - Implement browser caching

3. **Database Optimization**
   - Index frequently queried fields
   - Implement pagination
   - Use connection pooling

## 📊 Monitoring

1. **Application Monitoring**
   - Use tools like New Relic or DataDog
   - Monitor server performance
   - Track error rates

2. **User Analytics**
   - Track PDF uploads and views
   - Monitor user engagement
   - Analyze sharing patterns

## 🔄 Backup Strategy

1. **Database Backups**
   - Regular automated backups
   - Test restore procedures
   - Store backups securely

2. **File Backups**
   - Backup uploaded PDFs
   - Use redundant storage
   - Implement disaster recovery

## 🆘 Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size limits
   - Verify storage permissions
   - Check network connectivity

2. **PDF Processing Errors**
   - Ensure PDF.js is properly loaded
   - Check browser compatibility
   - Verify PDF file integrity

3. **Sharing Links Don't Work**
   - Check server configuration
   - Verify database connectivity
   - Test API endpoints

### Debug Commands

```bash
# Check server logs
npm run server

# Test API endpoints
curl http://localhost:3001/api/pdfs/public

# Check file permissions
ls -la uploads/

# Monitor server resources
htop
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review server logs
3. Test API endpoints
4. Verify environment variables
5. Check database connectivity

## 🎯 Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure automated backups
3. Implement user analytics
4. Add advanced features (user accounts, collections)
5. Optimize for mobile performance 
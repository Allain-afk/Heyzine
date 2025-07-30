# Vercel Deployment Guide for Heyzine Flipbook

This guide will help you deploy your Heyzine flipbook application to Vercel with full backend functionality.

## 🚀 **Vercel Backend Support**

**Yes, Vercel supports backend functionality!** Your application can be deployed with:

- ✅ **Serverless Functions** - Your Express.js API
- ✅ **Static File Serving** - Your React frontend
- ✅ **File Uploads** - PDF storage (with limitations)
- ✅ **API Routes** - All your backend endpoints

## 📋 **Deployment Steps**

### **Step 1: Prepare Your Project**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Initialize Vercel in your project**
   ```bash
   vercel
   ```

### **Step 2: Configure Environment Variables**

In your Vercel dashboard, add these environment variables:

```env
NODE_ENV=production
```

### **Step 3: Deploy**

```bash
vercel --prod
```

## ⚠️ **Important Limitations**

### **File Storage Limitations**

**Current Setup (Memory Storage):**
- ✅ Files stored in memory during function execution
- ❌ Files lost on serverless function cold start
- ❌ No persistent storage between requests

**For Production (Recommended):**
- Use **MongoDB Atlas** for metadata
- Use **AWS S3** or **Cloudinary** for file storage
- Implement proper database integration

### **Function Timeout**
- **Default**: 10 seconds
- **Maximum**: 30 seconds (configured in vercel.json)
- **Large PDFs**: May timeout during processing

## 🔧 **Production Setup Options**

### **Option 1: Quick Deploy (Current Setup)**

**Pros:**
- ✅ Fast deployment
- ✅ No external dependencies
- ✅ Works immediately

**Cons:**
- ❌ Files lost on cold start
- ❌ No persistent storage
- ❌ Limited for production use

### **Option 2: MongoDB Atlas + Cloud Storage**

**For persistent storage, add these dependencies:**

```bash
npm install mongoose aws-sdk
```

**Update server.js to use MongoDB:**

```javascript
const mongoose = require('mongoose');

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// PDF Schema
const pdfSchema = new mongoose.Schema({
  id: String,
  shareId: String,
  filename: String,
  originalName: String,
  title: String,
  isPublic: Boolean,
  uploadDate: Date,
  fileSize: Number,
  s3Key: String // Store file in S3
});

const PDF = mongoose.model('PDF', pdfSchema);
```

## 🛠️ **Current Configuration**

### **File Structure for Vercel**
```
Heyzine/
├── vercel.json              # Vercel configuration
├── server.js                # Express server (serverless)
├── package.json             # Dependencies
├── public/                  # Static files
├── src/                     # React components
└── build/                   # Production build
```

### **API Endpoints Available**
- `POST /api/upload-pdf` - Upload PDFs
- `GET /api/pdf/:shareId` - Get PDF metadata
- `GET /api/pdf/:shareId/download` - Download PDFs
- `GET /api/pdfs/public` - List public PDFs
- `DELETE /api/pdf/:shareId` - Delete PDFs

## 🚀 **Deployment Commands**

### **Development**
```bash
npm run dev
```

### **Production Build**
```bash
npm run build
```

### **Deploy to Vercel**
```bash
vercel --prod
```

## 📊 **Performance Considerations**

### **Serverless Function Limits**
- **Memory**: 1024MB (default)
- **Timeout**: 30 seconds (configured)
- **Payload**: 4.5MB (request/response)

### **Optimization Tips**
1. **Compress PDFs** before upload
2. **Use CDN** for static assets
3. **Implement caching** for frequently accessed files
4. **Optimize images** in PDF processing

## 🔍 **Testing Your Deployment**

### **1. Test Upload**
```bash
curl -X POST https://your-app.vercel.app/api/upload-pdf \
  -F "pdf=@test.pdf" \
  -F "isPublic=true" \
  -F "title=Test PDF"
```

### **2. Test Download**
```bash
curl -O https://your-app.vercel.app/api/pdf/SHARE_ID/download
```

### **3. Test Frontend**
Visit: `https://your-app.vercel.app`

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Upload Fails**
   - Check file size (max 1GB)
   - Verify PDF format
   - Check function timeout

2. **Files Not Persisting**
   - Normal for memory storage
   - Implement database for production

3. **CORS Errors**
   - Update CORS origin in server.js
   - Add your domain to allowed origins

### **Debug Commands**

```bash
# Check deployment status
vercel ls

# View function logs
vercel logs

# Test API locally
curl http://localhost:3001/api/pdfs/public
```

## 🔒 **Security Considerations**

### **For Production**
1. **Add Authentication**
2. **Implement Rate Limiting**
3. **Use HTTPS** (automatic with Vercel)
4. **Validate File Types**
5. **Scan for Malware**

### **Environment Variables**
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=your_s3_bucket
```

## 📈 **Scaling Considerations**

### **Current Limits**
- **Free Tier**: 100GB bandwidth/month
- **Function Calls**: 100,000/month
- **Build Time**: 45 minutes

### **Upgrade Options**
- **Pro Plan**: $20/month
- **Enterprise**: Custom pricing

## 🎯 **Next Steps After Deployment**

1. **Set up monitoring** with Vercel Analytics
2. **Configure custom domain**
3. **Add database integration**
4. **Implement user authentication**
5. **Add file compression**
6. **Set up automated backups**

## 📞 **Support**

### **Vercel Support**
- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions Guide](https://vercel.com/docs/functions)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### **Your App Support**
- Check function logs in Vercel dashboard
- Monitor API response times
- Test all endpoints after deployment

## 🎉 **Success Checklist**

- [ ] App deployed to Vercel
- [ ] API endpoints working
- [ ] PDF upload functional
- [ ] Sharing links generated
- [ ] Frontend responsive
- [ ] Custom domain configured (optional)
- [ ] Database integrated (for production)
- [ ] Monitoring set up

Your Heyzine flipbook application is now ready for Vercel deployment with full backend functionality! 🚀 
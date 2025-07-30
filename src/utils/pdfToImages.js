import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const convertPdfToImages = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL('image/png');
      
      pages.push({
        id: pageNum,
        imageUrl: imageDataUrl,
        width: viewport.width,
        height: viewport.height,
        pageNumber: pageNum
      });
    }
    
    return pages;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw new Error('Failed to process PDF file');
  }
};

export const preloadImages = async (pages) => {
  const imagePromises = pages.map(page => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(page);
      img.onerror = () => reject(new Error(`Failed to load image for page ${page.pageNumber}`));
      img.src = page.imageUrl;
    });
  });
  
  return Promise.all(imagePromises);
}; 
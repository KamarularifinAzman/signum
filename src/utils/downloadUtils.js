// src/utils/downloadUtils.js

// For base64 downloads
export const downloadBase64PDF = (base64Data, filename) => {
  try {
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    // Download the blob
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download file');
  }
};

// For regular file downloads
export const downloadFile = (data, filename, type = 'application/pdf') => {
  try {
    // For development environment
    if (process.env.NODE_ENV === 'development') {
      // Create a blob and download
      const blob = new Blob([data], { type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } else {
      // For production - use the actual signed PDF
      const link = document.createElement('a');
      link.href = data;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download file');
  }
};

// Main download function for signed PDFs
export const downloadSignedPdf = async (base64Data, filename) => {
  try {
    // If it's a data URL, extract base64
    if (base64Data.startsWith('data:')) {
      const base64 = base64Data.split(',')[1];
      await downloadBase64PDF(base64, filename);
    } else {
      // Assume it's already base64
      await downloadBase64PDF(base64Data, filename);
    }
    
    // Log success
    console.log(`Downloaded: ${filename}`);
    return true;
  } catch (err) {
    console.error('Download error:', err);
    throw new Error('Failed to download file. Please try again.');
  }
};

// For downloading original PDF
export const downloadOriginalPdf = (pdfFile) => {
  if (!pdfFile) return false;
  
  try {
    const url = URL.createObjectURL(pdfFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = `original_${pdfFile.name}`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Download original error:', error);
    return false;
  }
};
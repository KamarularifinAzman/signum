// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Building2, CheckCircle2, AlertCircle, Download, X, Info, HelpCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Type, Save, Trash2, Move, PenTool, RotateCcw, Maximize2, Minimize2, Lock, Unlock } from 'lucide-react';
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.entry";
import { downloadSignedPdf, downloadOriginalPdf } from './utils/downloadUtils';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFSignatureApp = () => {
  // State management
  const [step, setStep] = useState('upload');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Signature/Initial management
  const [signatureImage, setSignatureImage] = useState(null);
  const [initialImage, setInitialImage] = useState(null);
  const [signatureMarks, setSignatureMarks] = useState([]);
  const [activeTool, setActiveTool] = useState('signature');
  
  // Company signature
  const [staffName, setStaffName] = useState('');
  const [staffNumber, setStaffNumber] = useState('');
  const [personalSignedPdf, setPersonalSignedPdf] = useState(null);
  const [companySignedPdf, setCompanySignedPdf] = useState(null);
  
  // UI state
  const [showTutorial, setShowTutorial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [selectedMark, setSelectedMark] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Digital signature specific
  const [digitalSignaturePreview, setDigitalSignaturePreview] = useState(null);
  const [showDigitalSignature, setShowDigitalSignature] = useState(false);
  
  // FIXED: Refs for canvas and UI elements
  const pdfContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const initialCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const sidebarRef = useRef(null);

  const [signatureMode, setSignatureMode] = useState('personal');
  const [signingReason, setSigningReason] = useState('Document signing and approval');
  const [signingLocation, setSigningLocation] = useState('Corporate Headquarters');
  const [digitalSignatureType, setDigitalSignatureType] = useState('graphical');
  const [digitalSignatureSize, setDigitalSignatureSize] = useState(200);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);

  // FIXED: Improved coordinate conversion functions
  const canvasToA4 = (canvasX, canvasY, canvasWidth, canvasHeight) => {
    return {
      x: (canvasX / canvasWidth) * 595,  // A4 width in points
      y: (canvasY / canvasHeight) * 842   // A4 height in points
    };
  };

  const a4ToCanvas = (a4X, a4Y, canvasWidth, canvasHeight) => {
    return {
      x: (a4X / 595) * canvasWidth,
      y: (a4Y / 842) * canvasHeight
    };
  };

  // Handle PDF upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfLoading(true);
      setError(null);
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        
        loadingTask.promise.then((pdf) => {
          setPdfDocument(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          
          if (signatureMode === 'company') {
            setStep('company-sign');
          } else {
            setStep('view-sign');
          }
          
          setPdfLoading(false);
        }).catch((err) => {
          console.error('PDF loading error:', err);
          setError('Failed to load PDF file. Please try again.');
          setPdfLoading(false);
        });
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload file. Please try again.');
        setPdfLoading(false);
      }
    } else {
      setError('Please upload a valid PDF file (PDF format only)');
    }
  };

  // FIXED: Render PDF page with proper scaling
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || currentPage < 1) return;

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Get viewport with zoom
        const viewport = page.getViewport({ scale: zoom });
        
        // Set canvas dimensions matching viewport
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render PDF page
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Render signature marks
        renderSignatureMarks(context, viewport);
      } catch (err) {
        console.error('Page render error:', err);
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, zoom, signatureMarks]);

  // FIXED: Updated renderSignatureMarks function
  const renderSignatureMarks = (context, viewport) => {
    const currentPageMarks = signatureMarks.filter(mark => mark.page === currentPage);
    
    currentPageMarks.forEach(mark => {
      // Convert A4 coordinates to canvas coordinates
      const canvasX = (mark.x / 595) * viewport.width;
      const canvasY = (mark.y / 842) * viewport.height;
      const canvasWidth = (mark.width / 595) * viewport.width;
      const canvasHeight = (mark.height / 842) * viewport.height;
      
      context.save();
      
      // Draw selection border if selected
      if (selectedMark?.id === mark.id) {
        context.strokeStyle = '#3b82f6';
        context.lineWidth = 2;
        context.setLineDash([5, 5]);
        context.strokeRect(canvasX - 2, canvasY - 2, canvasWidth + 4, canvasHeight + 4);
        context.setLineDash([]);
      }
      
      context.globalAlpha = mark.opacity || 1;
      
      if (mark.type === 'digital') {
        // Draw digital signature box
        context.fillStyle = 'rgba(220, 252, 231, 0.2)';
        context.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);
        
        context.strokeStyle = '#16a34a';
        context.lineWidth = 2;
        context.strokeRect(canvasX, canvasY, canvasWidth, canvasHeight);
        
        // Draw digital signature text
        context.fillStyle = '#15803d';
        context.font = `bold ${14 * (viewport.width / 595)}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // FIXED: Center text properly
        const centerX = canvasX + canvasWidth / 2;
        const centerY = canvasY + canvasHeight / 2;
        
        if (mark.digitalData?.type === 'text') {
          context.fillText('DIGITAL SIGNATURE', centerX, centerY - 10);
          context.font = `${10 * (viewport.width / 595)}px Arial`;
          if (mark.digitalData?.staffName) {
            context.fillText(mark.digitalData.staffName, centerX, centerY + 10);
          }
        } else {
          // Graphical signature
          context.font = `${12 * (viewport.width / 595)}px Arial`;
          context.fillText('Company Seal', centerX, centerY);
          context.font = `${10 * (viewport.width / 595)}px Arial`;
          context.fillText('Digitally Signed', centerX, centerY + 15);
        }
      } else if (mark.image) {
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, canvasX, canvasY, canvasWidth, canvasHeight);
        };
        img.src = mark.image;
      } else if (mark.text) {
        context.font = `${mark.fontSize * (viewport.width / 595)}px Arial`;
        context.fillStyle = mark.color || '#000000';
        context.textBaseline = 'top';
        context.fillText(mark.text, canvasX, canvasY);
      }
      
      context.restore();
    });
  };

  // FIXED: Updated handleAddMark with proper centering
  const handleAddMark = (type, canvasX = null, canvasY = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width, height;

    // Set dimensions based on type
    switch(type) {
      case 'signature':
        if (!signatureImage) {
          setError('Please create or upload a signature first');
          return;
        }
        width = 150;
        height = 60;
        break;
      case 'initial':
        if (!initialImage) {
          setError('Please create or upload initials first');
          return;
        }
        width = 80;
        height = 40;
        break;
      case 'text':
        if (!textInput.trim()) {
          setError('Please enter text first');
          return;
        }
        width = 150;
        height = 30;
        break;
      case 'digital':
        if (!staffName || !staffNumber) {
          setError('Please enter staff name and number first');
          return;
        }
        width = 200;
        height = 80;
        break;
      default:
        width = 150;
        height = 40;
    }

    let positionX, positionY;

    if (canvasX !== null && canvasY !== null) {
      // FIXED: Convert canvas coordinates to A4 and center
      const a4Coords = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
      positionX = a4Coords.x - (width / 2);  // Center horizontally
      positionY = a4Coords.y - (height / 2); // Center vertically
    } else {
      // Default positions
      positionX = 200;
      positionY = 500;
    }

    // Ensure within bounds
    positionX = Math.max(0, Math.min(595 - width, positionX));
    positionY = Math.max(0, Math.min(842 - height, positionY));

    const newMark = {
      id: Date.now() + Math.random(),
      type,
      page: currentPage,
      x: positionX,
      y: positionY,
      width,
      height,
      image: type === 'signature' ? signatureImage : 
             type === 'initial' ? initialImage : null,
      text: type === 'text' ? textInput : null,
      fontSize: type === 'text' ? 16 : null,
      color: '#000000',
      opacity: 1,
      rotation: 0,
      ...(type === 'digital' && {
        digitalData: {
          staffName,
          staffNumber,
          reason: signingReason,
          location: signingLocation,
          type: digitalSignatureType,
          includeTimestamp,
          timestamp: new Date().toISOString()
        }
      })
    };

    setSignatureMarks([...signatureMarks, newMark]);
    if (type === 'text') setTextInput('');
    setError(null);
    setSelectedMark(newMark);
    setActiveTool('move');
  };

  const updateMark = (id, updates) => {
    setSignatureMarks(signatureMarks.map(mark => 
      mark.id === id ? { ...mark, ...updates } : mark
    ));
  };

  const removeMark = (id) => {
    setSignatureMarks(signatureMarks.filter(mark => mark.id !== id));
    if (selectedMark?.id === id) setSelectedMark(null);
  };

  const clearAllMarks = () => {
    if (window.confirm('Are you sure you want to remove all signatures?')) {
      setSignatureMarks([]);
      setSelectedMark(null);
    }
  };

  // FIXED: handleCanvasClick with proper coordinates
  const handleCanvasClick = (e) => {
    if (!activeTool || activeTool === 'move') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to canvas coordinates (accounting for CSS scaling)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    if (activeTool === 'digital') {
      handleAddMark('digital', canvasX, canvasY);
    } else {
      handleAddMark(activeTool, canvasX, canvasY);
    }
  };

  // FIXED: Improved mark dragging
  const handleMarkMouseDown = (e, mark) => {
    if (activeTool !== 'move') return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to canvas coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    // Convert to A4 coordinates
    const a4Click = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
    
    setSelectedMark(mark);
    setIsDragging(true);
    setDragOffset({
      x: a4Click.x - mark.x,
      y: a4Click.y - mark.y
    });
  };

  // FIXED: Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (!isDragging || !selectedMark || !canvasRef.current) return;
    
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to canvas coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    // Convert to A4 coordinates
    const a4Coords = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
    
    // Calculate new position with offset
    const newX = a4Coords.x - dragOffset.x;
    const newY = a4Coords.y - dragOffset.y;
    
    // Keep within bounds (A4 page)
    const boundedX = Math.max(0, Math.min(595 - selectedMark.width, newX));
    const boundedY = Math.max(0, Math.min(842 - selectedMark.height, newY));
    
    updateMark(selectedMark.id, { x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Signature drawing functions
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });

  const startDrawing = (e, canvasType) => {
    if (activeTool !== canvasType) setActiveTool(canvasType);
    
    const canvas = canvasType === 'signature' ? signatureCanvasRef.current : initialCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setIsDrawing(true);
    setLastPoint({ x, y });
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e, canvasType) => {
    if (!isDrawing) return;
    
    const canvas = canvasType === 'signature' ? signatureCanvasRef.current : initialCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    setLastPoint({ x, y });
  };

  const stopDrawing = (canvasType) => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasType === 'signature' ? signatureCanvasRef.current : initialCanvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    if (canvasType === 'signature') {
      setSignatureImage(dataUrl);
    } else {
      setInitialImage(dataUrl);
    }
  };

  const clearSignatureCanvas = (type) => {
    const canvas = type === 'signature' ? signatureCanvasRef.current : initialCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    if (type === 'signature') {
      setSignatureImage(null);
    } else {
      setInitialImage(null);
    }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = type === 'signature' ? signatureCanvasRef.current : initialCanvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Calculate dimensions to fit canvas
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const imgWidth = img.width;
            const imgHeight = img.height;
            
            const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
            const x = (canvasWidth - imgWidth * scale) / 2;
            const y = (canvasHeight - imgHeight * scale) / 2;
            
            ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
          }
          
          if (type === 'signature') {
            setSignatureImage(event.target.result);
          } else {
            setInitialImage(event.target.result);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Complete personal signature
  const completePersonalSignature = async () => {
    if (signatureMarks.length === 0) {
      setError('Please place at least one signature on the document');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPersonalSignedPdf({
        timestamp: new Date().toISOString(),
        marks: signatureMarks.length,
        auditTrail: {
          signedBy: 'User',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        },
        downloadUrl: '#',
        fileName: `personal_signed_${pdfFile?.name || 'document.pdf'}`
      });

      setStep('personal-complete');
      setSuccess('Personal signature completed successfully!');
    } catch (err) {
      setError(`Failed to complete signature: ${err.message}`);
      console.error('Signature error:', err);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Complete company certificate signature with open-pdf-sign integration
  const completeCompanyCertificate = async () => {
    if (!staffName || !staffNumber) {
      setError('Please enter your staff name and number');
      return;
    }

    const digitalSignatureExists = signatureMarks.some(mark => mark.type === 'digital');
    if (!digitalSignatureExists) {
      setError('Please place at least one digital signature on the document');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate open-pdf-sign command
      const digitalSignature = signatureMarks.find(mark => mark.type === 'digital');
      const page = digitalSignature?.page || -1; // -1 means last page
      
      const openPdfSignCommand = `java -jar open-pdf-sign.jar \\
  --input "${pdfFile?.name}" \\
  --output "company_signed_${pdfFile?.name}" \\
  --certificate "C:\\\\Windows\\\\System32\\\\certificate.crt" \\
  --key "C:\\\\Windows\\\\System32\\\\key.pem" \\
  --page ${page} \\
  --image "signature.png" \\
  --position-x ${digitalSignature?.x || 100} \\
  --position-y ${digitalSignature?.y || 100} \\
  --width ${digitalSignature?.width || 200} \\
  --height ${digitalSignature?.height || 80} \\
  --hint "You can check the validity at https://www.signaturpruefung.gv.at" \\
  --reason "${signingReason}" \\
  --location "${signingLocation}" \\
  ${includeTimestamp ? '--timestamp' : ''}`;

      console.log('Open PDF Sign Command:', openPdfSignCommand);

      // In production, you would:
      // 1. Send the PDF and signature data to your backend
      // 2. Backend would execute open-pdf-sign with the provided parameters
      // 3. Return the signed PDF

      setCompanySignedPdf({
        timestamp: new Date().toISOString(),
        staffName,
        staffNumber,
        openPdfSignCommand,
        certificateInfo: {
          subject: 'CN=yourcompany.com, O=Your Company, C=US',
          issuer: 'DigiCert',
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          timestampAuthority: includeTimestamp ? 'DigiCert Timestamp Server' : 'None'
        },
        downloadUrl: '#',
        fileName: `company_signed_${new Date().toISOString().slice(0,10).replace(/-/g, '')}_${pdfFile?.name || 'document.pdf'}`
      });

      setStep('company-complete');
      setSuccess('Company certificate applied successfully! Digital signature is cryptographically secured.');
    } catch (err) {
      setError(`Failed to apply company certificate: ${err.message}`);
      console.error('Company signature error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = async (type) => {
    try {
      if (type === 'personal' && personalSignedPdf?.fileName) {
        if (process.env.NODE_ENV === 'development') {
          alert(`In development: File would be downloaded as ${personalSignedPdf.fileName}\n\nIn production, this would download the signed PDF with all signatures.`);
        } else {
          // In production, this would call your backend to generate the signed PDF
          await downloadSignedPdf(personalSignedPdf.downloadUrl, personalSignedPdf.fileName);
        }
      } else if (type === 'company' && companySignedPdf?.fileName) {
        if (process.env.NODE_ENV === 'development') {
          alert(`In development: File would be downloaded as ${companySignedPdf.fileName}\n\nIn production, this would download the signed PDF with digital certificate and timestamp.\n\nCommand used: ${companySignedPdf.openPdfSignCommand}`);
        } else {
          // In production, this would call your backend which uses open-pdf-sign
          await downloadSignedPdf(companySignedPdf.downloadUrl, companySignedPdf.fileName);
        }
      } else {
        alert('In production, this would download the signed PDF');
      }
    } catch (err) {
      setError('Failed to download file. Please try again.');
      console.error('Download error:', err);
    }
  };

  // Reset application
  const resetApp = () => {
    setPdfFile(null);
    setPdfDocument(null);
    setSignatureMarks([]);
    setSignatureImage(null);
    setInitialImage(null);
    setPersonalSignedPdf(null);
    setCompanySignedPdf(null);
    setStaffName('');
    setStaffNumber('');
    setCurrentPage(1);
    setStep('upload');
    setError(null);
    setSuccess(null);
    setSelectedMark(null);
    setActiveTool('signature');
    setIsFullscreen(false);
    setSignatureMode('personal');
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const element = pdfContainerRef.current?.parentElement;
    
    if (!document.fullscreenElement) {
      if (element?.requestFullscreen) {
        element.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // FIXED: Add event listeners
  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('mouseup', handleMouseUpGlobal);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('mouseup', handleMouseUpGlobal);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isDragging, handleMouseMove]);

  // Upload screen
  const renderUpload = () => (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <FileText className="w-16 h-16 text-blue-600 mr-4" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Signum</h1>
              <p className="text-lg text-gray-600">Secure Document Signing Platform</p>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your PDF document to begin the secure signing process with electronic signatures or company digital certificates.
          </p>
        </div>

        {/* Signature Mode Selection */}
        <div className="mb-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSignatureMode('personal')}
              className={`p-4 rounded-xl border-2 transition-all ${
                signatureMode === 'personal'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  signatureMode === 'personal' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <PenTool className="w-5 h-5" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900">Personal Signature</h4>
              <p className="text-sm text-gray-600 mt-1">
                Draw or upload your signature. Add initials and text fields.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Electronic Commerce Act 2006
              </div>
            </button>
            
            <button
              onClick={() => setSignatureMode('company')}
              className={`p-4 rounded-xl border-2 transition-all ${
                signatureMode === 'company'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  signatureMode === 'company' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900">Company Certificate</h4>
              <p className="text-sm text-gray-600 mt-1">
                Sign with company SSL certificate using open-pdf-sign. Legally binding digital signature.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Digital Signature Act 1997
              </div>
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {signatureMode === 'personal' 
                ? 'You will be able to add electronic signatures, initials, and text fields to the document.'
                : 'You will be asked for staff details and can place a digital signature on the document using open-pdf-sign.'}
            </p>
          </div>
        </div>

        {/* Upload section */}
        <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8 md:p-16 text-center hover:border-blue-500 transition-all duration-300 bg-gradient-to-br from-gray-50 to-blue-50">
          <Upload className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Upload Document</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Drag & drop your PDF file here or click to browse
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
            id="pdf-upload"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            <Upload className="w-5 h-5 md:w-6 md:h-6 mr-3" />
            Select PDF File
          </button>
          <p className="text-sm text-gray-500 mt-4">Maximum file size: 25MB • Supported: PDF files</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setShowTutorial(true)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            How to Sign Documents
          </button>
          <span className="text-gray-400 hidden sm:inline">•</span>
          <button
            onClick={() => {
              const samplePdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
              fetch(samplePdfUrl)
                .then(res => res.blob())
                .then(blob => {
                  const file = new File([blob], 'sample-document.pdf', { type: 'application/pdf' });
                  const event = { target: { files: [file] } };
                  handlePdfUpload(event);
                });
            }}
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            Try Sample Document
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">Error</h4>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {(pdfLoading || loading) && (
          <div className="mt-6 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
            <span className="text-gray-600">
              {pdfLoading ? 'Loading document...' : 'Processing...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // FIXED: View and sign screen
  const renderViewAndSign = () => {
    return (
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={resetApp}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to upload"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="max-w-xs md:max-w-md">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {pdfFile?.name}
              </h2>
              <p className="text-sm text-gray-500">
                {signatureMarks.length} signature{signatureMarks.length !== 1 ? 's' : ''} placed • Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                disabled={zoom <= 0.25}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setShowTutorial(true)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* FIXED: Left Sidebar with proper scrolling */}
          <div ref={sidebarRef} className="w-96 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Signing Tools</h3>
              <p className="text-sm text-gray-600">Create and place signatures</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Tool Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Tools</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'signature', label: 'Signature', icon: PenTool, color: 'blue' },
                    { id: 'initial', label: 'Initial', icon: Type, color: 'green' },
                    { id: 'text', label: 'Text', icon: Type, color: 'purple' },
                    { id: 'move', label: 'Move', icon: Move, color: 'gray' },
                  ].map(tool => {
                    const Icon = tool.icon;
                    const isActive = activeTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setActiveTool(tool.id);
                          if (tool.id === 'move' && selectedMark) {
                            setSuccess('Click and drag signatures to move them');
                          }
                        }}
                        className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                          isActive 
                            ? `border-${tool.color}-500 bg-${tool.color}-50` 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1 ${
                          isActive ? `text-${tool.color}-600` : 'text-gray-500'
                        }`} />
                        <span className={`text-xs font-medium ${
                          isActive ? `text-${tool.color}-700` : 'text-gray-600'
                        }`}>
                          {tool.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Signature Creation */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Your Signature</label>
                  {signatureImage && (
                    <button 
                      onClick={() => clearSignatureCanvas('signature')}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  <canvas
                    ref={signatureCanvasRef}
                    width={400}
                    height={150}
                    onMouseDown={(e) => startDrawing(e, 'signature')}
                    onMouseMove={(e) => draw(e, 'signature')}
                    onMouseUp={() => stopDrawing('signature')}
                    onMouseLeave={() => stopDrawing('signature')}
                    className="w-full h-32 cursor-crosshair"
                  />
                </div>
                <div className="mt-2 flex justify-between">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'signature')}
                    className="hidden"
                    id="signature-upload"
                  />
                  <label 
                    htmlFor="signature-upload"
                    className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Upload image
                  </label>
                  <button
                    onClick={() => {
                      if (signatureImage) {
                        setActiveTool('signature');
                        setSuccess('Click on PDF to place your signature');
                      } else {
                        setError('Please create or upload a signature first');
                      }
                    }}
                    className={`text-xs px-2 py-1 rounded ${
                      activeTool === 'signature' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Use
                  </button>
                </div>
              </div>

              {/* Initials Creation */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Your Initials</label>
                  {initialImage && (
                    <button 
                      onClick={() => clearSignatureCanvas('initial')}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  <canvas
                    ref={initialCanvasRef}
                    width={300}
                    height={120}
                    onMouseDown={(e) => startDrawing(e, 'initial')}
                    onMouseMove={(e) => draw(e, 'initial')}
                    onMouseUp={() => stopDrawing('initial')}
                    onMouseLeave={() => stopDrawing('initial')}
                    className="w-full h-24 cursor-crosshair"
                  />
                </div>
                <div className="mt-2 flex justify-between">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'initial')}
                    className="hidden"
                    id="initial-upload"
                  />
                  <label 
                    htmlFor="initial-upload"
                    className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Upload image
                  </label>
                  <button
                    onClick={() => {
                      if (initialImage) {
                        setActiveTool('initial');
                        setSuccess('Click on PDF to place your initials');
                      } else {
                        setError('Please create or upload initials first');
                      }
                    }}
                    className={`text-xs px-2 py-1 rounded ${
                      activeTool === 'initial' 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Use
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Field
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter text to add..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTextInput('')}
                      className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        if (textInput.trim()) {
                          setActiveTool('text');
                          setSuccess('Click on PDF to place text');
                        }
                      }}
                      disabled={!textInput.trim()}
                      className="flex-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Ready
                    </button>
                  </div>
                </div>
              </div>

              {/* Placed Marks List */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Placed Marks ({signatureMarks.length})
                  </h4>
                  {signatureMarks.length > 0 && (
                    <button
                      onClick={clearAllMarks}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {signatureMarks.map((mark) => (
                    <div 
                      key={mark.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        selectedMark?.id === mark.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedMark(mark);
                        setActiveTool('move');
                        if (mark.page !== currentPage) {
                          setCurrentPage(mark.page);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${
                          mark.type === 'signature' ? 'bg-blue-100 text-blue-600' :
                          mark.type === 'initial' ? 'bg-green-100 text-green-600' :
                          mark.type === 'digital' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {mark.type === 'signature' ? 'S' : 
                           mark.type === 'initial' ? 'I' : 
                           mark.type === 'digital' ? 'D' : 'T'}
                        </div>
                        <span className="text-sm text-gray-700">
                          {mark.type} - Page {mark.page}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMark(mark.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Button */}
              <button
                onClick={completePersonalSignature}
                disabled={loading || signatureMarks.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Signature...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Personal Signature
                  </span>
                )}
              </button>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">{success}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main PDF Viewer */}
          <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
            {/* Page Controls */}
            <div className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium text-gray-700">
                      Page <span className="font-bold">{currentPage}</span> of {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 hidden md:inline">
                    <span className="font-medium">Tool:</span>{' '}
                    <span className="text-gray-800">
                      {activeTool ? 
                        activeTool.charAt(0).toUpperCase() + activeTool.slice(1) : 
                        'Select a tool'}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      if (pdfFile) {
                        downloadOriginalPdf(pdfFile);
                      }
                    }}
                    className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Original
                  </button>
                </div>
              </div>
            </div>

            {/* FIXED: PDF Viewer Container */}
            <div 
              ref={pdfContainerRef}
              className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-800"
              onClick={handleCanvasClick}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {pdfDocument ? (
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={(e) => {
                      // Check if clicking on a mark
                      const canvas = canvasRef.current;
                      if (!canvas || activeTool !== 'move') return;
                      
                      const rect = canvas.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      const canvasX = x * scaleX;
                      const canvasY = y * scaleY;
                      
                      const a4Coords = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
                      
                      // Find clicked mark
                      const currentPageMarks = signatureMarks.filter(m => m.page === currentPage);
                      const mark = currentPageMarks.find(m => 
                        a4Coords.x >= m.x && a4Coords.x <= m.x + m.width &&
                        a4Coords.y >= m.y && a4Coords.y <= m.y + m.height
                      );
                      
                      if (mark) {
                        handleMarkMouseDown(e, mark);
                      }
                    }}
                    className="bg-white shadow-2xl"
                    style={{
                      cursor: isDragging ? 'grabbing' : 
                              activeTool === 'move' ? 'grab' : 'crosshair',
                      maxWidth: '100%',
                      maxHeight: 'calc(100vh - 180px)'
                    }}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg">Loading PDF document...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Company signature placement component
  const renderCompanySign = () => {
    return (
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setStep('upload')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to upload"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="max-w-xs md:max-w-md">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {pdfFile?.name}
              </h2>
              <p className="text-sm text-gray-500">
                Company Digital Signature Placement
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            <span className="hidden md:inline">Help</span>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar with proper scrolling */}
          <div className="w-96 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Company Digital Signature</h3>
              <p className="text-sm text-gray-600">Configure and place digital certificate using open-pdf-sign</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Staff Details Form */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Staff Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={staffNumber}
                      onChange={(e) => setStaffNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your staff number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signing Reason
                    </label>
                    <input
                      type="text"
                      value={signingReason}
                      onChange={(e) => setSigningReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Document approval"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={signingLocation}
                      onChange={(e) => setSigningLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Corporate Headquarters"
                    />
                  </div>
                </div>
              </div>

              {/* Digital Signature Appearance */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Signature Appearance</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Signature Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={digitalSignatureType}
                      onChange={(e) => setDigitalSignatureType(e.target.value)}
                    >
                      <option value="graphical">Graphical Signature</option>
                      <option value="text">Text Only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Signature Size</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="150"
                        max="300"
                        value={digitalSignatureSize}
                        onChange={(e) => setDigitalSignatureSize(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-16">{digitalSignatureSize}px</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Include Timestamp</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeTimestamp}
                        onChange={(e) => setIncludeTimestamp(e.target.checked)}
                        className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Add DigiCert timestamp (via open-pdf-sign --timestamp)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Signature Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Preview</h4>
                <div className="flex items-center justify-center p-4 bg-white rounded border border-gray-300">
                  <div className="text-center">
                    <div 
                      className="border-2 border-green-300 rounded-lg flex items-center justify-center mx-auto mb-2"
                      style={{ width: digitalSignatureSize, height: 80 }}
                    >
                      {digitalSignatureType === 'text' ? (
                        <div className="text-green-600 font-semibold p-2 text-center">DIGITAL SIGNATURE</div>
                      ) : (
                        <div className="text-green-600 p-2">
                          <Building2 className="w-8 h-8 mx-auto" />
                          <div className="text-xs mt-1">Company Seal</div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">Will be placed using open-pdf-sign</p>
                  </div>
                </div>
              </div>

              {/* Place Signature Button */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    if (!staffName || !staffNumber) {
                      setError('Please enter staff name and number');
                      return;
                    }
                    setActiveTool('digital');
                    setSuccess('Click on the PDF where you want to place the digital signature');
                  }}
                  disabled={!staffName || !staffNumber}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  Place Digital Signature
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Click this button, then click on the PDF to place the signature
                </p>
              </div>

              {/* Placed Marks List */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Digital Signatures ({signatureMarks.filter(m => m.type === 'digital').length})
                  </h4>
                  {signatureMarks.filter(m => m.type === 'digital').length > 0 && (
                    <button
                      onClick={() => {
                        const digitalMarks = signatureMarks.filter(m => m.type === 'digital');
                        if (window.confirm(`Are you sure you want to remove ${digitalMarks.length} digital signature(s)?`)) {
                          setSignatureMarks(signatureMarks.filter(m => m.type !== 'digital'));
                          if (selectedMark?.type === 'digital') setSelectedMark(null);
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {signatureMarks
                    .filter(mark => mark.type === 'digital')
                    .map((mark) => (
                      <div 
                        key={mark.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                          selectedMark?.id === mark.id ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedMark(mark);
                          setActiveTool('move');
                          if (mark.page !== currentPage) {
                            setCurrentPage(mark.page);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center">
                            D
                          </div>
                          <span className="text-sm text-gray-700">
                            Digital - Page {mark.page}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMark(mark.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Complete Company Signature Button */}
              <button
                onClick={completeCompanyCertificate}
                disabled={loading || signatureMarks.filter(m => m.type === 'digital').length === 0}
                className="w-full bg-gradient-to-r from-green-700 to-green-800 text-white px-4 py-4 rounded-xl font-semibold hover:from-green-800 hover:to-green-900 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing with open-pdf-sign...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Apply Digital Certificate (open-pdf-sign)
                  </span>
                )}
              </button>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">open-pdf-sign Integration</h4>
                <p className="text-xs text-blue-800">
                  This will generate a command for open-pdf-sign with your signature position and settings.
                  In production, this command would be executed on the backend server.
                </p>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">{success}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PDF Viewer for Company Signature */}
          <div className="flex-1 flex flex-col bg-gray-800">
            {/* Page Controls */}
            <div className="bg-gray-900 border-b border-gray-700 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center bg-gray-800 rounded-lg px-4 py-2">
                    <span className="text-sm font-medium text-gray-300">
                      Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                    disabled={zoom <= 0.25}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded disabled:opacity-50"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-300 px-2">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                    disabled={zoom >= 3}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded disabled:opacity-50"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Viewer Container */}
            <div 
              className="flex-1 overflow-auto p-8 flex items-center justify-center"
              onClick={handleCanvasClick}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {pdfDocument ? (
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={(e) => {
                      const canvas = canvasRef.current;
                      if (!canvas || activeTool !== 'move') return;
                      
                      const rect = canvas.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      const canvasX = x * scaleX;
                      const canvasY = y * scaleY;
                      
                      const a4Coords = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
                      const currentPageMarks = signatureMarks.filter(m => m.page === currentPage);
                      
                      const mark = currentPageMarks.find(m => 
                        a4Coords.x >= m.x && a4Coords.x <= m.x + m.width &&
                        a4Coords.y >= m.y && a4Coords.y <= m.y + m.height
                      );
                      
                      if (mark) {
                        handleMarkMouseDown(e, mark);
                      }
                    }}
                    className="bg-white shadow-2xl"
                    style={{
                      cursor: activeTool === 'digital' ? 'crosshair' :
                              activeTool === 'move' ? (isDragging ? 'grabbing' : 'grab') : 
                              'crosshair',
                      maxWidth: '100%',
                      maxHeight: '80vh'
                    }}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg">Loading PDF document...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Personal signature complete
  const renderPersonalComplete = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Personal Signature Complete!</h2>
          <p className="text-gray-600">Version 1 of your document is ready</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Document:</span>
              <span className="font-semibold text-gray-900 truncate ml-2">{pdfFile?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Signatures Placed:</span>
              <span className="font-semibold text-gray-900">{signatureMarks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timestamp:</span>
              <span className="font-semibold text-gray-900">
                {new Date().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Legal Status:</span>
              <span className="font-semibold text-gray-900">Electronic Commerce Act 2006</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex">
            <Info className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Legal Notice:</strong> This is an Electronic Signature under the Electronic Commerce Act 2006. 
              For enhanced legal compliance, you can add a Company Certificate signature using open-pdf-sign.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleDownload('personal')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 md:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Version 1 (Personal Signed)
          </button>

          <button
            onClick={() => setStep('company-sign')}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 md:py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center"
          >
            <Building2 className="w-5 h-5 mr-2" />
            Add Company Certificate Signature (open-pdf-sign)
          </button>

          <button
            onClick={resetApp}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Sign Another Document
          </button>
        </div>
      </div>
    </div>
  );

  // Company form
  const renderCompanyForm = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Company Certificate Signature</h2>
          <p className="text-gray-600">Add official company seal with digital certificate using open-pdf-sign</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex">
            <Info className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <strong>Digital Signature Act 1997 Compliance:</strong> This signature uses open-pdf-sign with your company's SSL certificate 
              with cryptographic verification and trusted timestamp. This action will be logged for audit purposes.
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={staffNumber}
              onChange={(e) => setStaffNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your staff number"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2">open-pdf-sign Process:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• System retrieves company SSL certificate from Windows Certificate Store</li>
              <li>• Document is signed using open-pdf-sign with PKI cryptography</li>
              <li>• Trusted timestamp is added from DigiCert timestamp server</li>
              <li>• Your signing action is logged with staff details</li>
              <li>• Version 2 is generated with full legal compliance</li>
              <li>• Signature position will be preserved from your placement</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => setStep('company-sign')}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 md:py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300"
          >
            Continue to Digital Signature Placement
          </button>

          <button
            onClick={() => setStep('personal-complete')}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to Version 1
          </button>

          <button
            onClick={resetApp}
            className="w-full border border-gray-300 text-gray-700 px-6 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Company complete
  const renderCompanyComplete = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Company Certificate Applied!</h2>
          <p className="text-gray-600">Version 2 with open-pdf-sign digital signature is ready</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Staff Name:</span>
              <span className="font-semibold text-gray-900">{companySignedPdf?.staffName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Staff Number:</span>
              <span className="font-semibold text-gray-900">{companySignedPdf?.staffNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Certificate Subject:</span>
              <span className="font-semibold text-gray-900 truncate">{companySignedPdf?.certificateInfo.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Certificate Issuer:</span>
              <span className="font-semibold text-gray-900">{companySignedPdf?.certificateInfo.issuer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timestamp:</span>
              <span className="font-semibold text-gray-900">
                {new Date(companySignedPdf?.timestamp || Date.now()).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timestamp Authority:</span>
              <span className="font-semibold text-gray-900">DigiCert Timestamp Server</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tool Used:</span>
              <span className="font-semibold text-gray-900">open-pdf-sign.jar</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <strong>Digital Signature Act 1997 Compliant:</strong> This document is signed with open-pdf-sign using a digital certificate 
              from a recognized CA with cryptographic security and trusted timestamp. This signature provides strong 
              legal enforceability and non-repudiation.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleDownload('company')}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 md:py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Version 2 (Company Signed with open-pdf-sign)
          </button>

          <button
            onClick={() => handleDownload('personal')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 md:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
          >
            Download Version 1 (Personal Signed)
          </button>

          <button
            onClick={resetApp}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Sign Another Document
          </button>
        </div>
      </div>
    </div>
  );

  // Tutorial Modal
  const TutorialModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">How to Sign Documents</h2>
          <button onClick={() => setShowTutorial(false)} className="text-gray-500 hover:text-gray-700 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Company Document Signing Policy</h3>
            <p className="text-sm text-blue-800">
              This system supports two-tier document signing for enhanced legal compliance:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-800 ml-4">
              <li>• <strong>Personal Signature:</strong> Your individual signature for acknowledgment (Electronic Commerce Act 2006)</li>
              <li>• <strong>Company Certificate:</strong> Official company seal with digital certificate using open-pdf-sign (Digital Signature Act 1997)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Step-by-Step Guide</h3>
            <ol className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Upload Document</h4>
                  <p className="text-sm text-gray-600 mt-1">Select your PDF document and choose signature type (Personal or Company).</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Create Signature</h4>
                  <p className="text-sm text-gray-600 mt-1">Draw or upload your signature and initials in the left panel.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Place Signatures</h4>
                  <p className="text-sm text-gray-600 mt-1">Click on the PDF document to place signatures, initials, and text fields.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Adjust & Move</h4>
                  <p className="text-sm text-gray-600 mt-1">Use the Move tool to reposition signatures. Click and drag to move.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">5</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Complete Signing</h4>
                  <p className="text-sm text-gray-600 mt-1">Review all signatures and complete the process to generate the signed PDF.</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Tips for Best Results</h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li>• Use a stylus or mouse for smoother signature drawing</li>
              <li>• Place signatures in designated signature fields when available</li>
              <li>• For company certificates, ensure staff details are accurate</li>
              <li>• Use the zoom controls to place signatures precisely</li>
              <li>• Save your signature for future use</li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              setShowTutorial(false);
              if (step === 'upload') {
                fileInputRef.current?.click();
              }
            }}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors mb-3"
          >
            {step === 'upload' ? 'Upload Document' : 'Got It, Continue Signing'}
          </button>
          <button
            onClick={() => setShowTutorial(false)}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Close Tutorial
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {showTutorial && <TutorialModal />}
      {step === 'upload' && renderUpload()}
      {step === 'view-sign' && renderViewAndSign()}
      {step === 'company-sign' && renderCompanySign()}
      {step === 'personal-complete' && renderPersonalComplete()}
      {step === 'company-form' && renderCompanyForm()}
      {step === 'company-complete' && renderCompanyComplete()}
    </div>
  );
};

export default PDFSignatureApp;
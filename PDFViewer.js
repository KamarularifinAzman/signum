// src/components/PDFViewer.jsx
import React, { useEffect, useRef, useState } from 'react';

const PDFViewer = ({
  pdfDocument,
  currentPage,
  zoom,
  signatureMarks,
  selectedMark,
  onSelectMark,
  onUpdateMark,
  onRemoveMark,
  activeTool,
  onPageClick,
  containerRef
}) => {
  const canvasRef = useRef(null);
  const [page, setPage] = useState(null);
  const [pageRect, setPageRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

  // Load the PDF page
  useEffect(() => {
    if (!pdfDocument) return;

    const loadPage = async () => {
      try {
        const pdfPage = await pdfDocument.getPage(currentPage);
        setPage(pdfPage);
      } catch (error) {
        console.error('Error loading page:', error);
      }
    };

    loadPage();
  }, [pdfDocument, currentPage]);

  // Render the PDF page
  useEffect(() => {
    if (!page) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    const viewport = page.getViewport({ scale: zoom });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Store the page rect for click coordinates
    const rect = canvas.getBoundingClientRect();
    setPageRect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    });

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    page.render(renderContext).promise.catch(error => {
      console.error('Error rendering page:', error);
    });
  }, [page, zoom]);

  // Handle click on the PDF page
  const handleCanvasClick = (e) => {
    if (!activeTool || activeTool === 'move') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (onPageClick) {
      onPageClick(e, { left: rect.left, top: rect.top });
    }
  };

  // Handle mark selection and dragging
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMarkMouseDown = (e, mark) => {
    if (activeTool !== 'move') return;

    e.stopPropagation();
    onSelectMark(mark);

    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / zoom - mark.x;
    const offsetY = (e.clientY - rect.top) / zoom - mark.y;

    setDragOffset({ x: offsetX, y: offsetY });
    setDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragging || !selectedMark) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - dragOffset.x;
    const y = (e.clientY - rect.top) / zoom - dragOffset.y;

    onUpdateMark(selectedMark.id, { x, y });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // Attach mouse move and up listeners for dragging
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, selectedMark, dragOffset]);

  return (
    <div className="relative" style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        className="pdf-page bg-white shadow-lg"
        onClick={handleCanvasClick}
        style={{ cursor: activeTool === 'move' ? 'grab' : 'crosshair' }}
      />
      {/* Render signature marks on top of the PDF */}
      {signatureMarks.map(mark => {
        const isSelected = selectedMark?.id === mark.id;
        return (
          <div
            key={mark.id}
            className={`absolute border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
            style={{
              left: `${mark.x * zoom}px`,
              top: `${mark.y * zoom}px`,
              width: `${mark.width * zoom}px`,
              height: `${mark.height * zoom}px`,
              cursor: activeTool === 'move' ? 'move' : 'default'
            }}
            onMouseDown={(e) => handleMarkMouseDown(e, mark)}
          >
            {mark.image ? (
              <img
                src={mark.image}
                alt={mark.type}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white bg-opacity-90 p-1">
                <span style={{ fontSize: `${mark.fontSize * zoom}px` }}>
                  {mark.text}
                </span>
              </div>
            )}
            {activeTool === 'move' && (
              <button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveMark(mark.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PDFViewer;
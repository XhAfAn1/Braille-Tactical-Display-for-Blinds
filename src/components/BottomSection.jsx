import React, { useRef, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';

const BottomSection = ({ mode, sourceData, matrixSize, rawVideoRef, rawImageRef }) => {
  const displayCanvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const localVideoRef = useRef(null); // Local video that stays in viewport
  const requestRef = useRef();

  // Pre-rendered pin canvases for extreme performance
  const offscreenPinsRef = useRef({ on: null, off: null, cellSize: 0 });

  useEffect(() => {
    // Attach stream to local video so it plays while BottomSection is visible
    if (mode === 'mirror' && sourceData && localVideoRef.current) {
      localVideoRef.current.srcObject = sourceData;
    }
  }, [mode, sourceData]);

  const createOffscreenPins = (cellSize) => {
    if (offscreenPinsRef.current.cellSize === cellSize && offscreenPinsRef.current.on) {
      return offscreenPinsRef.current;
    }

    const onCanvas = document.createElement('canvas');
    const offCanvas = document.createElement('canvas');
    onCanvas.width = cellSize;
    onCanvas.height = cellSize;
    offCanvas.width = cellSize;
    offCanvas.height = cellSize;

    const onCtx = onCanvas.getContext('2d');
    const offCtx = offCanvas.getContext('2d');

    const radius = Math.max(1, cellSize / 2 - 1);
    const cx = cellSize / 2;
    const cy = cellSize / 2;

    // Draw ON pin
    onCtx.beginPath();
    onCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    onCtx.fillStyle = '#6366f1';
    onCtx.shadowColor = 'rgba(99, 102, 241, 0.6)';
    onCtx.shadowBlur = Math.max(2, cellSize / 3);
    onCtx.fill();

    // Draw OFF pin
    offCtx.beginPath();
    offCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    offCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    offCtx.fill();

    offscreenPinsRef.current = { on: onCanvas, off: offCanvas, cellSize };
    return offscreenPinsRef.current;
  };

  const processFrame = () => {
    const hiddenCanvas = hiddenCanvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    
    if (!hiddenCanvas || !displayCanvas) return;
    
    const hCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
    const dCtx = displayCanvas.getContext('2d', { alpha: false }); 
    
    const { rows, cols } = matrixSize;

    // 1. Prevent expensive canvas reallocation every frame
    if (hiddenCanvas.width !== cols) hiddenCanvas.width = cols;
    if (hiddenCanvas.height !== rows) hiddenCanvas.height = rows;

    const maxDisplaySize = 600;
    const cellSize = Math.max(4, Math.floor(maxDisplaySize / Math.max(cols, rows)));
    const targetWidth = cols * cellSize;
    const targetHeight = rows * cellSize;

    if (displayCanvas.width !== targetWidth) displayCanvas.width = targetWidth;
    if (displayCanvas.height !== targetHeight) displayCanvas.height = targetHeight;

    // Get pre-rendered pins for this cellSize
    const pins = createOffscreenPins(cellSize);

    let source = null;
    if (mode === 'image' && rawImageRef.current && rawImageRef.current.complete) {
      source = rawImageRef.current;
    } else if (mode === 'mirror' && localVideoRef.current && localVideoRef.current.readyState >= 2) {
      // Read from local video instead of TopSection video
      source = localVideoRef.current;
    }

    // Clear display
    dCtx.fillStyle = '#0a0a0f';
    dCtx.fillRect(0, 0, targetWidth, targetHeight);

    if (source) {
      const sourceWidth = source.videoWidth || source.naturalWidth || source.width;
      const sourceHeight = source.videoHeight || source.naturalHeight || source.height;

      if (sourceWidth && sourceHeight) {
        hCtx.fillStyle = 'black';
        hCtx.fillRect(0, 0, cols, rows);

        const scale = Math.min(cols / sourceWidth, rows / sourceHeight);
        const dw = sourceWidth * scale;
        const dh = sourceHeight * scale;
        const dx = (cols - dw) / 2;
        const dy = (rows - dh) / 2;

        hCtx.imageSmoothingEnabled = true;
        hCtx.imageSmoothingQuality = 'high';
        hCtx.drawImage(source, dx, dy, dw, dh);
      } else {
        hCtx.drawImage(source, 0, 0, cols, rows);
      }
      
      const imageData = hCtx.getImageData(0, 0, cols, rows);
      const data = imageData.data;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const index = (y * cols + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          const isOn = brightness > 127;
          
          dCtx.drawImage(isOn ? pins.on : pins.off, x * cellSize, y * cellSize);
        }
      }
    } else {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          dCtx.drawImage(pins.off, x * cellSize, y * cellSize);
        }
      }
    }

    requestRef.current = requestAnimationFrame(processFrame);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mode, sourceData, matrixSize]);

  return (
    <div className="bottom-section glass-panel">
      <div className="panel-title">
        <LayoutGrid size={20} />
        Tactile Output Preview
      </div>
      <div className="canvas-wrapper" style={{ position: 'relative' }}>
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ position: 'absolute', width: '10px', height: '10px', opacity: 0.01, pointerEvents: 'none' }} 
        />
        <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
        <canvas ref={displayCanvasRef} />
      </div>
    </div>
  );
};

export default BottomSection;

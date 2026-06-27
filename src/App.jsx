import { useState, useRef } from 'react';
import TopSection from './components/TopSection';
import CoreSection from './components/CoreSection';
import BottomSection from './components/BottomSection';

function App() {
  const [mode, setMode] = useState(null); // 'image', 'mirror', or 'draw'
  const [sourceData, setSourceData] = useState(null); // imageUrl or MediaStream
  const [matrixSize, setMatrixSize] = useState({ rows: 32, cols: 32 });
  const [clearDrawTrigger, setClearDrawTrigger] = useState(0);
  const rawVideoRef = useRef(null);
  const rawImageRef = useRef(null);

  const handleModeChange = async (newMode) => {
    // Cleanup old stream if exists
    if (mode === 'mirror' && sourceData) {
      sourceData.getTracks().forEach(track => track.stop());
    }
    
    if (newMode === 'mirror') {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setMode('mirror');
        setSourceData(stream);
        if (rawVideoRef.current) {
          rawVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing display media.", err);
      }
    } else {
      setMode(newMode);
      setSourceData(null);
    }
  };

  const handleImageSelect = (imageUrl) => {
    handleModeChange('image');
    setSourceData(imageUrl);
  };

  const handleClearDraw = () => {
    setClearDrawTrigger(prev => prev + 1);
  };

  const [serialConnected, setSerialConnected] = useState(false);
  const serialWriterRef = useRef(null);
  const serialPortRef = useRef(null);

  const connectSerial = async () => {
    if (serialConnected) {
      try {
        if (serialWriterRef.current) {
          await serialWriterRef.current.close();
          serialWriterRef.current = null;
        }
        if (serialPortRef.current) {
          await serialPortRef.current.close();
          serialPortRef.current = null;
        }
      } catch(e) {
        console.error("Error closing serial port:", e);
      }
      setSerialConnected(false);
      return;
    }

    try {
      if (!('serial' in navigator)) {
        alert("Web Serial API is not supported in your browser.");
        return;
      }
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      serialPortRef.current = port;
      serialWriterRef.current = port.writable.getWriter();
      setSerialConnected(true);
      
      port.addEventListener('disconnect', () => {
        setSerialConnected(false);
        serialWriterRef.current = null;
        serialPortRef.current = null;
      });
    } catch(err) {
      console.error("Failed to connect to serial port:", err);
    }
  };

  return (
    <div className="app-container">
      <TopSection 
        mode={mode} 
        onModeChange={handleModeChange}
        onImageSelect={handleImageSelect}
        onClearDraw={handleClearDraw}
        sourceData={sourceData}
        rawVideoRef={rawVideoRef}
        rawImageRef={rawImageRef}
      />
      <CoreSection 
        matrixSize={matrixSize} 
        setMatrixSize={setMatrixSize} 
        serialConnected={serialConnected}
        connectSerial={connectSerial}
      />
      <BottomSection 
        mode={mode}
        sourceData={sourceData}
        matrixSize={matrixSize}
        clearDrawTrigger={clearDrawTrigger}
        serialWriterRef={serialWriterRef}
        rawVideoRef={rawVideoRef}
        rawImageRef={rawImageRef}
      />
    </div>
  );
}

export default App;

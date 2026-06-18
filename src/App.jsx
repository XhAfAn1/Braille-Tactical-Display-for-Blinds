import { useState, useRef } from 'react';
import TopSection from './components/TopSection';
import CoreSection from './components/CoreSection';
import BottomSection from './components/BottomSection';

function App() {
  const [mode, setMode] = useState(null); // 'image' or 'mirror'
  const [sourceData, setSourceData] = useState(null); // imageUrl or MediaStream
  const [matrixSize, setMatrixSize] = useState({ rows: 32, cols: 32 });
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

  return (
    <div className="app-container">
      <TopSection 
        mode={mode} 
        onModeChange={handleModeChange}
        onImageSelect={handleImageSelect}
        sourceData={sourceData}
        rawVideoRef={rawVideoRef}
        rawImageRef={rawImageRef}
      />
      <CoreSection 
        matrixSize={matrixSize} 
        setMatrixSize={setMatrixSize} 
      />
      <BottomSection 
        mode={mode}
        sourceData={sourceData}
        matrixSize={matrixSize}
        rawVideoRef={rawVideoRef}
        rawImageRef={rawImageRef}
      />
    </div>
  );
}

export default App;

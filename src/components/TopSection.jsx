import React from 'react';
import { Image as ImageIcon, MonitorSmartphone } from 'lucide-react';

const TopSection = ({ mode, onModeChange, onImageSelect, sourceData, rawVideoRef, rawImageRef }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onImageSelect(imageUrl);
    }
  };

  return (
    <div className="top-section glass-panel">
      <div className="panel-title">Source Input</div>
      
      <div className="btn-group">
        <label className={`btn ${mode === 'image' ? 'active' : ''}`}>
          <ImageIcon size={20} />
          Select Image
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        
        <button 
          className={`btn ${mode === 'mirror' ? 'active' : ''}`}
          onClick={() => onModeChange('mirror')}
        >
          <MonitorSmartphone size={20} />
          Mirror Display
        </button>
      </div>

      <div className="preview-container">
        {!mode && (
          <div className="placeholder-text">
            <MonitorSmartphone size={48} />
            <p>Select an image or mirror a display to begin.</p>
          </div>
        )}
        
        {mode === 'image' && sourceData && (
          <img 
            ref={rawImageRef} 
            src={sourceData} 
            alt="Raw Source" 
            crossOrigin="anonymous" 
          />
        )}
        
        {mode === 'mirror' && (
          <video 
            ref={rawVideoRef} 
            autoPlay 
            playsInline 
            muted 
          />
        )}
      </div>
    </div>
  );
};

export default TopSection;

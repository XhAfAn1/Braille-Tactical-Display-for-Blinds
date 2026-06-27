import React from 'react';
import { Image as ImageIcon, MonitorSmartphone, MousePointer2, Trash2 } from 'lucide-react';

const TopSection = ({ mode, onModeChange, onImageSelect, onClearDraw, sourceData, rawVideoRef, rawImageRef }) => {
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
        <label 
          className={`btn ${mode === 'image' ? 'active' : ''}`}
          onClick={() => onModeChange('image')}
        >
          <ImageIcon size={20} />
          Select Image
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            onClick={(e) => { e.target.value = null; }} 
          />
        </label>
        
        <button 
          className={`btn ${mode === 'mirror' ? 'active' : ''}`}
          onClick={() => onModeChange('mirror')}
        >
          <MonitorSmartphone size={20} />
          Mirror Display
        </button>

        <button 
          className={`btn ${mode === 'draw' ? 'active' : ''}`}
          onClick={() => onModeChange('draw')}
        >
          <MousePointer2 size={20} />
          Manual Draw
        </button>
      </div>

      {mode === 'draw' && (
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          <button className="btn" onClick={onClearDraw} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <Trash2 size={16} />
            Clear Grid
          </button>
        </div>
      )}

      <div className="preview-container">
        {!mode && (
          <div className="placeholder-text">
            <MonitorSmartphone size={48} />
            <p>Select a source to begin.</p>
          </div>
        )}
        
        {mode === 'draw' && (
          <div className="placeholder-text" style={{ padding: '2rem' }}>
            <MousePointer2 size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>Click or drag on the tactile output preview below to draw.</p>
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

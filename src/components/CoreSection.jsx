import React, { useState } from 'react';
import { Grid3X3, Play } from 'lucide-react';

const CoreSection = ({ matrixSize, setMatrixSize }) => {
  const [localRows, setLocalRows] = useState(matrixSize.rows);
  const [localCols, setLocalCols] = useState(matrixSize.cols);

  const handleRowChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setLocalRows(val);
    }
  };

  const handleColChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setLocalCols(val);
    }
  };

  const handleProcess = () => {
    setMatrixSize({ rows: localRows, cols: localCols });
  };

  return (
    <div className="core-section glass-panel">
      <div className="input-group">
        <Grid3X3 size={24} color="var(--accent-color)" />
        <div className="input-field">
          <label>Rows</label>
          <input 
            type="number" 
            min="1" 
            max="128" 
            value={localRows} 
            onChange={handleRowChange} 
          />
        </div>
        <div className="input-field" style={{fontSize: '1.5rem', color: 'var(--text-secondary)'}}>
          ×
        </div>
        <div className="input-field">
          <label>Columns</label>
          <input 
            type="number" 
            min="1" 
            max="128" 
            value={localCols} 
            onChange={handleColChange} 
          />
        </div>
        <button className="btn active" onClick={handleProcess} style={{marginLeft: '1rem'}}>
          <Play size={20} />
          Process
        </button>
      </div>
    </div>
  );
};

export default CoreSection;

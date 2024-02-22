import React, { useRef } from 'react';
import { fabric } from 'fabric';

const JsonReader = () => {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      try {
        const jsonData = await readFile(file);
        loadCanvasFromJson(jsonData);
      } catch (error) {
        console.error('Error reading the file:', error);
      }
    }
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const jsonData = event.target.result;
        resolve(jsonData);
      };

      reader.onerror = (event) => {
        reject(event.target.error);
      };

      reader.readAsText(file);
    });
  };

  const loadCanvasFromJson = (jsonData) => {
    const parsedData = JSON.parse(jsonData);

    // Create a new canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
    });

    // Load objects from JSON onto the new canvas
    canvas.loadFromJSON(parsedData, canvas.renderAll.bind(canvas));
  };

  return (
    <div className='m-10'>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} />
      <button
        onClick={() => {
          // Trigger the file input
          fileInputRef.current.click();
        }}
      >
        Load JSON File
      </button>
      {/* Canvas element for the JsonReader component */}
      <canvas className='' ref={canvasRef} />
    </div>
  );
};

export default JsonReader;

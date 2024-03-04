import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { saveAs } from 'file-saver';
import { Global, css } from '@emotion/react';
import fontjson from './font.json';
import FontFaceObserver from 'fontfaceobserver';

const EditorMultiPage = () => {
  const fonts = fontjson.fonts;
  const [canvases, setCanvases] = useState([]);
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState(null);
  useEffect(() => {
    handleAddCanvas();
  }, []);

  const handleAddCanvas = () => {
    const newCanvas = new fabric.Canvas(`canvas-${canvases.length + 1}`, {
      width: 800,
      height: 600,
    });

    newCanvas.on('selection:created', handleSelection);
    newCanvas.on('object:modified', handleObjectModified);

    setCanvases([...canvases, newCanvas]);
    setActiveCanvasIndex(canvases.length);
  };

  const handleSelection = (e) => {
    const selectedObject = e.target;
    setSelectedComponent(selectedObject);
  };

  const handleObjectModified = (e) => {
    const modifiedObject = e.target;
    if (modifiedObject && modifiedObject.type === 'textbox') {
      console.log('Text modified:', modifiedObject.text);
    }
  };

  const addText = (text, variable) => {
    const canvas = canvases[activeCanvasIndex];

    console.log(text, canvas)
    const itext = new fabric.IText(text, {
      left: 100,
      top: 100,
      fontSize: 30,
      fill: 'black',
      width: 200,
      id: variable || '',
    });
    canvas.add(itext);
    canvas.renderAll();
  };

  const handleDeleteSelected = () => {
    const canvas = canvases[activeCanvasIndex];
    if (selectedComponent) {
      canvas.remove(selectedComponent);
      canvas.renderAll();
      setSelectedComponent(null);
    }
  };

  const handleConvertToJSON = () => {
    const canvas = canvases[activeCanvasIndex];
    const canvasJSON = JSON.stringify(canvas.toObject(['id', 'left', 'top', 'type', 'text', 'fill', 'fontSize', 'fontWeight', 'fontStyle']));
    const jsonWithDimensions = {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      objects: JSON.parse(canvasJSON).objects,
      backgroundImage: JSON.parse(canvasJSON).backgroundImage,
    };

    const blob = new Blob([JSON.stringify(jsonWithDimensions)], { type: 'application/json' });
    saveAs(blob, 'canvas.json');
  };


  const handleAddText = () => {
    const text = 'edit your text here';
    if (text !== null) {
      addText(text);
    }
  };

  return (
    <div className='m-10'>
      <Global
        styles={css`
          ${fonts.map((font) => {
            const { name, variations } = font;
            return Object.keys(variations).map((variation) => {
              const { url } = variations[variation];
              return `
                @font-face {
                  font-family: '${name}';
                  font-style: ${variation.includes('italic') ? 'italic' : 'normal'};
                  font-weight: ${variation.includes('bold') ? 'bold' : 'normal'};
                  src: url(${url}) format('truetype');
                }
              `;
            });
          })}
        `}
      />
      <div>
      <button className='p-2 bg-gray-200 m-3' onClick={handleAddText}>Add Text Block</button>
      </div>
      <div>
        {/* Render canvas selector buttons */}
        {canvases.map((canvas, index) => (
          <button key={index} onClick={() => setActiveCanvasIndex(index)}>
            Canvas {index + 1}
          </button>
        ))}
        <button className='p-2 bg-gray-200 m-3' onClick={handleAddCanvas}>
          Add Canvas
        </button>

        {/* ... (other UI elements) */}

        {/* Render canvases */}
        {canvases.map((canvas, index) => (
          <div key={index}>
            <canvas
            className={`border-4 border-blue-500 ${index !== activeCanvasIndex && 'hidden'}`}
            id={`canvas-${index + 1}`}
            ref={(ref) => ref && (canvas.canvasElement = ref)}
            />
          </div>
        ))}
      </div>

      {/* ... (other UI elements) */}
      <button className='p-2 bg-gray-200 m-3' onClick={handleConvertToJSON}>
        Convert to JSON
      </button>
    </div>
  );
};

export default EditorMultiPage;

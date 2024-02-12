// TextEditor.js
import React, { useRef, useEffect } from 'react';
import { fabric } from 'fabric';

const Editor = () => {
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);

  const addText = (text) => {
    const canvas = canvasInstance.current;
    const textbox = new fabric.Textbox(text, {
      left: 10,
      top: 10,
      fontSize: 20,
      fill: 'black',
    });
    canvas.add(textbox);
  };

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
    });
    canvasInstance.current = canvas; // Store canvas instance in the ref

    // Initial text block
    addText('Hello, Fabric.js!');

    // Event listener for text selection
    canvas.on('selection:created', () => {
      const selectedObject = canvas.getActiveObject();
      if (selectedObject && selectedObject.type === 'textbox') {
        // Text selected, update properties or perform other actions
        console.log('Text selected:', selectedObject.text);
      }
    });

    // Event listener for text modification
    canvas.on('object:modified', (e) => {
      const modifiedObject = e.target;
      if (modifiedObject && modifiedObject.type === 'textbox') {
        // Text modified, update properties or perform other actions
        console.log('Text modified:', modifiedObject.text);
      }
    });

    // Cleanup function
    return () => {
      canvas.dispose();
    };
  }, []);

  const handleAddText = () => {
    const text = prompt('Enter text:');
    if (text !== null) {
      addText(text);
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} />
      <button onClick={handleAddText}>Add Text Block</button>
    </div>
  );
};

export default Editor;

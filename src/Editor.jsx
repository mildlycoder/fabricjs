// TextEditor.js
import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import VariableSidebar from './variableSidebar';
const Editor = () => {
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);
  const [variableValues, setVariableValues] = useState({});
  const [variableCounts, setVariableCounts] = useState({});

  const [textToAdd, setTextToAdd] = useState('');
  const [selectedVariableToAdd, setSelectedVariableToAdd] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [newX, setNewX] = useState('');
  const [newY, setNewY] = useState('');
  const [selectedVariable, setSelectedVariable] = useState('');
  const variables = ['birthdate', 'address', 'fname', 'lname'];

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

  const addImage = (imageUrl, left = 0, top = 0) => {
    const canvas = canvasInstance.current;
    fabric.Image.fromURL(imageUrl, (img) => {
      img.set({ left, top });
      canvas.add(img);
    });
  };

  const addBackgroundImage = (imageUrl) => {
    const canvas = canvasInstance.current;
    fabric.Image.fromURL(imageUrl, (img) => {
      img.set({ left: 0, top: 0, scaleX: canvas.width / img.width, scaleY: canvas.height / img.height });
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      setBackgroundImageUrl(imageUrl);
    });
  };

  useEffect(() => {
    if(selectedComponent){
      setNewX(selectedComponent.left)
      setNewY(selectedComponent.top)
      console.log(newX, newY)
    }
  }, [selectedComponent])

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
    });
    canvasInstance.current = canvas; // Store canvas instance in the ref

    // Event listener for text selection
    canvas.on('selection:created', () => {
      const selectedObject = canvas.getActiveObject();
      if (selectedObject && selectedObject.type === 'textbox') {
        // Text selected, update properties or perform other actions
        console.log('Text selected:', selectedObject);
        setSelectedComponent(selectedObject);
      } else if (selectedObject && selectedObject.type === 'image') {
        // Image selected, update properties or perform other actions
        console.log('Image selected:', selectedObject);
        setSelectedComponent(selectedObject);
      } else {
        // No component selected
        setSelectedComponent(null);
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
    const text = 'edit your text here';
    if (text !== null) {
      addText(text);
    }
  };

  const handleAddBackgroundImage = () => {
    const imageUrl = prompt('Enter the URL for the background image:');
    if (imageUrl !== null) {
      addBackgroundImage(imageUrl);
    }
  };

  const handleRemoveBackgroundImage = () => {
    const canvas = canvasInstance.current;
    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    setBackgroundImageUrl('');
  };

  const handleAddImage = () => {
    const imageUrl = prompt('Enter the URL for the image:');
    if (imageUrl !== null) {
      addImage(imageUrl);
    }
  };

  const handleUpdateCoordinates = () => {
    if (selectedComponent) {
      const newXValue = parseFloat(newX);
      const newYValue = parseFloat(newY);

      if (!isNaN(newXValue) && !isNaN(newYValue)) {
        selectedComponent.set({ left: newXValue, top: newYValue });
        canvasInstance.current.renderAll();
      } else {
        alert('Invalid coordinates. Please enter valid numeric values.');
      }
    }
  };

  const handleAddVariable = () => {
    if (selectedVariable) {
      // Add the selected variable to the canvas
      addText(`{${selectedVariable}}`);

      // Update the variable counts
      setVariableCounts((prevCounts) => ({
        ...prevCounts,
        [selectedVariable]: (prevCounts[selectedVariable] || 0) + 1,
      }));
    }
  };

  const handleVariableValueChange = (variable, value) => {
    setVariableValues((prevValues) => ({
      ...prevValues,
      [variable]: value,
    }));

    // Update the canvas if needed (e.g., replace the existing text with the updated value)
    const objects = canvasInstance.current.getObjects();
    objects.forEach((obj) => {
      if (obj.type === 'textbox' && obj.text.includes(`{${variable}}`)) {
        const newText = obj.text.replace(`{${variable}}`, value);
        obj.set({ text: newText });
        canvasInstance.current.renderAll();
      }
    });
  };

  const handleAddTextOrVariable = () => {
    const text = prompt('Enter text:');
    setTextToAdd(text);
  };

  const handleAddOnCanvas = () => {
    if (textToAdd !== null) {
      const combinedText = selectedVariableToAdd ? `${textToAdd} {${selectedVariableToAdd}}` : textToAdd;
      addText(combinedText);

      // Update the variable counts
      if (selectedVariableToAdd) {
        setVariableCounts((prevCounts) => ({
          ...prevCounts,
          [selectedVariableToAdd]: (prevCounts[selectedVariableToAdd] || 0) + 1,
        }));
      }
    }
    setTextToAdd('');
    setSelectedVariableToAdd('');
  };


  return (
    <div>
      <div>
      <VariableSidebar 
       variables={variables}
       variableCounts={variableCounts}
       onVariableValueChange={handleVariableValueChange}
      />
        <button className='p-2 bg-gray-200 m-3' onClick={handleAddText}>Add Text Block</button>
        <button className='p-2 bg-gray-200 m-3' onClick={handleAddBackgroundImage}>Add Background Image</button>
        <button className='p-2 bg-gray-200 m-3' onClick={handleRemoveBackgroundImage}>Remove Background Image</button>
        <button className='p-2 bg-gray-200 m-3' onClick={handleAddImage}>Add Image</button>
        <select value={selectedVariable} onChange={(e) => setSelectedVariable(e.target.value)}>
          <option value="">Select Variable</option>
          {variables.map((variable) => (
            <option key={variable} value={variable}>
              {variable}
            </option>
          ))}
        </select>
        <button className='p-2 bg-gray-200 m-3' onClick={handleAddVariable}>Add Variable</button>
        <div className='mx-3'>
          <label>X:</label>
          <input type="text" value={newX} onChange={(e) => setNewX(e.target.value)} />
          <label>Y:</label>
          <input type="text" value={newY} onChange={(e) => setNewY(e.target.value)} />
          <button className='p-2 bg-gray-200 m-3' onClick={handleUpdateCoordinates}>Update Coordinates</button>
        </div>
        <div>
        <button className='p-2 bg-gray-200 m-3' onClick={handleAddTextOrVariable}>
          Add Text/Variable
        </button>
        {textToAdd !== null && (
          <div className='mx-3'>
            <label>Text:</label>
            <input type="text" value={textToAdd} onChange={(e) => setTextToAdd(e.target.value)} />
            <label>Variable:</label>
            <select value={selectedVariableToAdd} onChange={(e) => setSelectedVariableToAdd(e.target.value)}>
              <option value="">Select Variable</option>
              {variables.map((variable) => (
                <option key={variable} value={variable}>
                  {variable}
                </option>
              ))}
            </select>
          </div>
        )}
        <button className='p-2 bg-gray-200 m-3' onClick={handleAddOnCanvas}>
          Add on Canvas
        </button>
      </div>
      </div>
      <canvas className='border-4 mx-3 border-blue-500' ref={canvasRef} />
    </div>
  );
};

export default Editor;

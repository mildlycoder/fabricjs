import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import VariableSidebar from './variableSidebar';
import { saveAs } from 'file-saver';
const Editor = () => {
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);
  const [variableValues, setVariableValues] = useState({});
  const [variableCounts, setVariableCounts] = useState({});
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedFontSize, setSelectedFontSize] = useState(20);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textToAdd, setTextToAdd] = useState('');
  const [selectedVariableToAdd, setSelectedVariableToAdd] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [newX, setNewX] = useState('');
  const [newY, setNewY] = useState('');
  const [selectedVariable, setSelectedVariable] = useState('');
  const [inputText, setInputText] = useState('');
  const variables = ['birthdate', 'address', 'fname', 'lname'];

  const addText = (text, variable) => {
    const canvas = canvasInstance.current;
    const textbox = new fabric.Textbox(text, {
      left: 10,
      top: 10,
      fontSize: 20,
      fill: 'black',
      id: variable? variable : ""
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

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Update text for all elements with the same id
    const objects = canvasInstance.current.getObjects();
    const selectedId = selectedComponent?.id;
    if (selectedId) {
      objects.forEach((obj) => {
        if (obj.type === 'textbox' && obj.id === selectedId) {
          obj.set({ text: e.target.value });
        }
      });

      canvasInstance.current.renderAll();
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
      addText(`{${selectedVariable}}`, selectedVariable);

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

  const handleColorChange = (color) => {
    if (selectedComponent && selectedComponent.type === 'textbox') {
      selectedComponent.set({ fill: color });
      canvasInstance.current.renderAll();
      setSelectedColor(color);
    }
  };

  const handleFontSizeChange = (fontSize) => {
    if (selectedComponent && selectedComponent.type === 'textbox') {
      selectedComponent.set({ fontSize: fontSize });
      canvasInstance.current.renderAll();
      setSelectedFontSize(fontSize);
    }
  };

  const handleBoldToggle = () => {
    if (selectedComponent && selectedComponent.type === 'textbox') {
      const currentFontWeight = selectedComponent.get('fontWeight') || 'normal';
      selectedComponent.set({ fontWeight: currentFontWeight === 'bold' ? 'normal' : 'bold' });
      canvasInstance.current.renderAll();
      setIsBold(!isBold);
    }
  };

  const handleItalicToggle = () => {
    if (selectedComponent && selectedComponent.type === 'textbox') {
      const currentFontStyle = selectedComponent.get('fontStyle') || 'normal';
      selectedComponent.set({ fontStyle: currentFontStyle === 'italic' ? 'normal' : 'italic' });
      canvasInstance.current.renderAll();
      setIsItalic(!isItalic);
    }
  };

  const handleConvertToJSON = () => {
    const canvas = canvasInstance.current;
    const canvasJSON = JSON.stringify(canvas.toObject(['id', 'left', 'top', 'type', 'text', 'fill', 'fontSize', 'fontWeight', 'fontStyle']));
    console.log(canvasJSON)
    const blob = new Blob([canvasJSON], { type: 'application/json' });
    saveAs(blob, 'canvas.json');
  };


  return (
    <div className='m-10'>
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
        {selectedComponent && selectedComponent.type === 'textbox' && (
        <div>
          <label>Color:</label>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => handleColorChange(e.target.value)}
          />
          <label>Font Size:</label>
          <input
            type="number"
            value={selectedFontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
          />
           <button className={`p-2 bg-gray-200 m-3 ${isBold ? 'font-bold' : ''}`} onClick={handleBoldToggle}>
            Bold
          </button>
          <button className={`p-2 bg-gray-200 m-3 ${isItalic ? 'italic' : ''}`} onClick={handleItalicToggle}>
            Italic
          </button>
        </div>
      )}
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

        {selectedComponent && selectedComponent.type === 'textbox' && selectedComponent.id && (
        <div className='mx-3 '>
          <label>Edit Variable</label>
          <input type="text" className='bg-gray-400 p-2 m-3' value={inputText} onChange={handleInputChange} />
        </div>
      )}
      </div>
      <button className='p-2 bg-gray-200 m-3' onClick={handleConvertToJSON}>
          Convert to JSON
        </button>
      </div>
      <canvas className='border-4 border-blue-500' ref={canvasRef} />
    </div>
  );
};

export default Editor;

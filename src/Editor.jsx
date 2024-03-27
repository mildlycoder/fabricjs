import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import VariableSidebar from './variableSidebar';
import { saveAs } from 'file-saver';
import { Global, css } from '@emotion/react';
import fontjson from './font.json'
import FontFaceObserver from 'fontfaceobserver'

const Editor = () => {
  const fonts = fontjson.fonts
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
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [selectedFont, setSelectedFont] = useState('');
  const [fontVariations, setFontVariations] = useState([
    '',
    'Arial',
    'Lato',
    'Montserrat',
    'Lucida Grande',
    'Pinyon Script',
    'Optima',
    'Old English Text MT',
    'Cambria',
    'Bodoni MT',
    'Calibri',
    'ITC Galliard',
    'Open Sans',
    'Roboto',
    'Great Vibes',
    'Candara',
    'Tahoma',
    'Raleway',
    'Helvetica',
    'Stencil',
    'NewsGothicStd',
    'Aktiv Grotesk',
    'Aktiv Grotesk Corp',
    'Barlow',
    'Arial Narrow',
    'Arial MT',
    'Multicolore',
    'Veranda',
  ]);
  const [allowTwoLines, setAllowTwoLines] = useState(false);
  const [maxWidth, setMaxWidth] = useState(100)
  const [maxFontSize, setMaxFontSize] = useState(10)
  const getS3Url = (path) => {
    let REGION = 'ap-southeast-1';
    let BUCKET_NAME = 'filpass-upload-bucket-non-production';
    const url = window.location.origin;
    if (url === 'https://edufied.info') {
      BUCKET_NAME = 'ciap-production-uploadbucket-1';
    }

    // Check if the path is already a full URL
    if (path.startsWith('http')) {
      return path;
    } else {
      return `https://s3.${REGION}.amazonaws.com/${BUCKET_NAME}/${path}`;
    }
  };


  const globalStyles = css`
  ${fonts.map((font) => {
    const { name, variations } = font;
    return Object.keys(variations).map((variation) => {
      const { fileName } = variations[variation];
      let { url } = variations[variation]
      url = getS3Url(url)
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
`;

  const addText = (text, variable) => {
    const canvas = canvasInstance.current;
    const textboxWidth = 200; // Set your desired fixed width

    const itext = new fabric.IText(text, {
      left: 100,
      top: 100,
      fontSize: 30,
      fill: 'black',
      width: textboxWidth, // Set the fixed width
      maxWidth: textboxWidth, // Set the maxWidth to the same value as width
      fontFamily: "New Times Roman",
      id: variable ? variable : "",
    });

    // Calculate the actual width of the text
    const textWidth = itext.textWidth * itext.scaleX;

    // Adjust font size and scale if text exceeds the textbox width
    while (textWidth > textboxWidth && itext.fontSize > 1) {
      const newFontSize = itext.fontSize - 1;
      const scaleRatio = newFontSize / itext.fontSize;

      itext.set({
        fontSize: newFontSize,
        scaleX: scaleRatio,
        scaleY: scaleRatio,
      });
    }

    canvas.add(itext);
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
    if (selectedComponent) {
      setNewX(selectedComponent.left)
      setNewY(selectedComponent.top)
      console.log(newX, newY)
    }
  }, [selectedComponent])

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
    });
    canvasInstance.current = canvas // Store canvas instance in the ref

    // Event listener for text selection
    canvas.on('selection:created', () => {
      const selectedObject = canvas.getActiveObject();
      if (selectedObject && selectedObject.type === 'textbox') {
        // Text selected, update properties or perform other actions
        console.log('Text selected:', selectedObject);
        setSelectedComponent(selectedObject);
      } if (selectedObject && selectedObject.type === 'i-text') {
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
        console.log(modifiedObject)
        setAutoShrinkLimits()
        console.log('Text modified:', modifiedObject.text);
      }
    });

    canvas.on('object:modified', (e) => {
      const modifiedObject = e.target;

      if (modifiedObject && modifiedObject.type === 'i-text') {
        // Text modified, update properties or perform other actions
        console.log('Text modified:', modifiedObject.text);
        // Calculate the actual width of the modified text
        canvas.renderAll();
      }
    });


    // Cleanup function
    return () => {
      canvas.dispose();
    };
  }, [canvasWidth, canvasHeight]);


  useEffect(() => {
    const handleSelection = () => {
      const canvas = canvasInstance.current;
      const selectedObject = canvas.getActiveObject();
      if (selectedObject && selectedObject.type === 'i-text') {
        setSelectedComponent(selectedObject);
        setInputText(selectedObject.text);
      } else {
        setSelectedComponent(null);
        setInputText('');
      }
    };

    canvasInstance.current.on('selection:created', handleSelection);
    canvasInstance.current.on('selection:updated', handleSelection);
    canvasInstance.current.on('selection:cleared', handleSelection);

    return () => {
      canvasInstance.current.off('selection:created', handleSelection);
      canvasInstance.current.off('selection:updated', handleSelection);
      canvasInstance.current.off('selection:cleared', handleSelection);
    };
  }, []);

  const handleAddText = () => {
    const text = 'edit your text here';
    if (text !== null) {
      addText(text);
    }
  };

  const loadFonts = async (fontInfo) => {
    const { name, variations } = fontInfo;
    const fontPromises = Object.keys(variations).map((variation) => {
      const { fileName, url } = variations[variation];
      const font = new FontFaceObserver(name, {
        weight: variation.includes('bold') ? 'bold' : 'normal',
        style: variation.includes('italic') ? 'italic' : 'normal',
      });

      return font.load(url);
    });

    try {
      await Promise.all(fontPromises);
      console.log(`${name} loaded successfully.`);
    } catch (error) {
      console.error(`Error loading ${name} font:`, error);
    }
  };


  const loadCustomFont = async (fontInfo) => {
    const { name, variations } = fontInfo;

    // Load fonts asynchronously
    await loadFonts(fontInfo);
    Object.keys(variations).forEach((variation) => {
      const { fileName, url } = variations[variation];

      // Add the font-face styles to the global stylesheet
      // globalStyles += `
      //   @font-face {
      //     font-family: '${name}';
      //     font-style: ${variation.includes('italic') ? 'italic' : 'normal'};
      //     font-weight: ${variation.includes('bold') ? 'bold' : 'normal'};
      //     src: url(${getS3Url(url)}) format('truetype');
      //   }
      // `;
    });
  };


  useEffect(() => {
    fonts.forEach((font) => loadCustomFont(font));
  }, []);


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

  const handleFontChange = (font) => {
    if (selectedComponent && selectedComponent.type === 'i-text') {
      const selectionStart = selectedComponent.selectionStart;
      const selectionEnd = selectedComponent.selectionEnd;

      if (selectionStart !== 0 && selectionEnd !== 0) {
        const selectedFontInfo = fonts.find((f) => f.name === font);
        if (selectedFontInfo) {
          loadCustomFont(selectedFontInfo); // Load the custom font
          selectedComponent.setSelectionStyles({ fontFamily: font }, selectionStart, selectionEnd);
        }
      } else {
        const selectedFontInfo = fonts.find((f) => f.name === font);
        if (selectedFontInfo) {
          loadCustomFont(selectedFontInfo); // Load the custom font
          selectedComponent.set({ fontFamily: font });
        }
      }

      canvasInstance.current.renderAll();
      setSelectedFont(font);
    }
  };

  const handleColorChange = (color) => {
    if (selectedComponent && selectedComponent.type === 'i-text') {
      const selectionStart = selectedComponent.selectionStart;
      const selectionEnd = selectedComponent.selectionEnd;
      console.log(selectionStart, selectionEnd)
      if (selectionStart !== 0 || selectionEnd !== 0) {
        console.log("selection")
        selectedComponent.setSelectionStyles({ fill: color }, selectionStart, selectionEnd);
      } else {
        console.log("whole")
        selectedComponent.set({ fill: color });
      }

      canvasInstance.current.renderAll();
      setSelectedColor(color);
    }
  };



  const handleFontSizeChange = (fontSize) => {
    if (selectedComponent && selectedComponent.type === 'i-text') {
      const selectionStart = selectedComponent.selectionStart;
      const selectionEnd = selectedComponent.selectionEnd;

      if (selectionStart !== 0 || selectionEnd !== 0) {
        selectedComponent.setSelectionStyles({ fontSize: parseInt(fontSize, 10) }, selectionStart, selectionEnd);
      } else {
        selectedComponent.set({ fontSize: parseInt(fontSize, 10) });
      }

      canvasInstance.current.renderAll();
      setSelectedFontSize(fontSize);
    }
  };

  const handleBoldToggle = () => {
    if (selectedComponent && selectedComponent.type === 'i-text') {
      const selectionStart = selectedComponent.selectionStart;
      const selectionEnd = selectedComponent.selectionEnd;
      if (selectionStart !== 0 || selectionEnd !== 0) {
        const currentFontWeight = selectedComponent.getSelectionStyles('fontWeight', selectionStart, selectionEnd) || 'normal';
        selectedComponent.setSelectionStyles({ fontWeight: currentFontWeight === 'bold' ? 'normal' : 'bold' }, selectionStart, selectionEnd);
      } else {
        const currentFontWeight = selectedComponent.get('fontWeight') || 'normal';
        selectedComponent.set({ fontWeight: currentFontWeight === 'bold' ? 'normal' : 'bold' });
      }

      canvasInstance.current.renderAll();
      setIsBold(!isBold);
    }
  };

  const handleItalicToggle = () => {
    if (selectedComponent && selectedComponent.type === 'i-text') {
      const selectionStart = selectedComponent.selectionStart;
      const selectionEnd = selectedComponent.selectionEnd;

      if (selectionStart !== 0 || selectionEnd !== 0) {
        const currentFontStyle = selectedComponent.getSelectionStyles('fontStyle', selectionStart, selectionEnd) || 'normal';
        selectedComponent.setSelectionStyles({ fontStyle: currentFontStyle === 'italic' ? 'normal' : 'italic' }, selectionStart, selectionEnd);
      } else {
        const currentFontStyle = selectedComponent.get('fontStyle') || 'normal';
        selectedComponent.set({ fontStyle: currentFontStyle === 'italic' ? 'normal' : 'italic' });
      }

      canvasInstance.current.renderAll();
      setIsItalic(!isItalic);
    }
  };


  useEffect(() => {
    canvasInstance.current.renderAll();
  }, [selectedComponent, selectedFont])



  const handleDeleteSelected = () => {
    if (selectedComponent) {
      const canvas = canvasInstance.current;
      canvas.remove(selectedComponent);
      canvas.renderAll();
      setSelectedComponent(null); // Clear the selected component after deletion
    }
  };

  useEffect(() => {

    const handleKeyDown = (e) => {
      if (e.keyCode === 46) {
        handleDeleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDeleteSelected]);




  const handleInputChange = (e) => {
    const newText = e.target.value;
    setInputText(newText);

    if (selectedComponent) {
      selectedComponent.set('text', newText);

      // Autoshrinking logic
      const maxCharactersPerLine = 50;

      let formattedText = newText;
      const lines = formattedText.split('\n');

      if (allowTwoLines && lines.length === 1) {
        // Logic to split text into lines while preserving word boundaries
        formattedText = splitTextIntoLines(newText, maxCharactersPerLine);
        selectedComponent.set('text', formattedText);
      }

      const textWidth = selectedComponent.getBoundingRect().width;
      console.log(textWidth, maxWidth)
      if (textWidth > maxWidth) {
        // Adjust font size based on text width
        const scaleFactor = maxWidth / textWidth;
        const newFontSize = selectedComponent.fontSize * scaleFactor;
        selectedComponent.set('fontSize', newFontSize);
      } else {
        // Restore original font size if text length decreases
        if (newText.length < maxCharactersPerLine) {
          const scaleFactor = maxWidth / textWidth;
          const newFontSize = (selectedComponent.fontSize < maxFontSize) ? selectedComponent.fontSize + 1 : maxFontSize;
          selectedComponent.set('fontSize', newFontSize);
        }
      }

      canvasInstance.current.renderAll();
    }
  };

  useEffect(() => {
    setAutoShrinkLimits()
  }, [selectedComponent])

  const setAutoShrinkLimits = () => {
    if (selectedComponent) {
      console.log("selected textbox width: ", selectedComponent.width)
      setMaxWidth(selectedComponent.width)
      setMaxFontSize(selectedComponent.fontSize)
    }
  }
  // Function to split text into lines while preserving word boundaries
  function splitTextIntoLines(text, maxCharactersPerLine) {
    const words = text.split(/\s+/);
    let line = '';
    let lines = [];
    words.forEach(word => {
      if ((line + word).length <= maxCharactersPerLine) {
        line += (line === '' ? '' : ' ') + word;
      } else {
        lines.push(line);
        line = word;
      }
    });
    lines.push(line);
    return lines.join('\n');
  }

  const handleConvertToJSON = () => {
    const canvas = canvasInstance.current;
    canvas.includeDefaultValues = false
    const canvasJSON = JSON.stringify(canvas.toObject(['id', 'left', 'top', 'type', 'text', 'fill', 'fontSize', 'fontWeight', 'fontStyle']));
    console.log(canvasJSON)
    const jsonWithDimensions = {
      canvasWidth,
      canvasHeight,
      objects: JSON.parse(canvasJSON).objects,
      backgroundImage: JSON.parse(canvasJSON).backgroundImage
    };

    console.log(jsonWithDimensions);

    const blob = new Blob([JSON.stringify(jsonWithDimensions)], { type: 'application/json' });
    saveAs(blob, 'canvas.json');
  };

  return (
    <div className='m-10'>
      <Global styles={globalStyles} />
      <div>
        <VariableSidebar
          variables={variables}
          variableCounts={variableCounts}
          onVariableValueChange={handleVariableValueChange}
        />
        <div>
          <label>Canvas Width:</label>
          <input type="number" value={canvasWidth} onChange={(e) => setCanvasWidth(parseInt(e.target.value, 10))} />
          <label>Canvas Height:</label>
          <input type="number" value={canvasHeight} onChange={(e) => setCanvasHeight(parseInt(e.target.value, 10))} />
        </div>
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
        {selectedComponent && selectedComponent.type === 'i-text' && (
          <div>
            <label>Color:</label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
            />
            <label className='ml-3'>Font:</label>
            <select className='mr-5 p-2' value={selectedFont} onChange={(e) => handleFontChange(e.target.value)}>
              {
                fontVariations.map((font) => <option>{font}</option>)
              }
            </select>


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

          <button className='p-2 bg-gray-200 m-3' onClick={handleDeleteSelected}>
            Delete Selected
          </button>
          <button className='p-2 bg-gray-200 m-3' onClick={handleAddOnCanvas}>
            Add on Canvas
          </button>

          {selectedComponent && selectedComponent.type === 'i-text' && (
            <div className='mx-3 flex flex-col gap-3 w-[40%]'>
              <label>Edit Text:</label>
              <input type='text' className='bg-gray-200 p-2 m-3' value={inputText} onChange={handleInputChange} />
              <label>Max width</label>
              <input type='number' className='bg-gray-200 p-2 m-3' value={maxWidth} onChange={(e) => setMaxWidth(e.target.value)} />
              <label>Max font Size</label>
              <input type='number' className='bg-gray-200 p-2 m-3' value={maxFontSize} onChange={(e) => setMaxFontSize(e.target.value)} />
              <div>
                <input
                  type="checkbox"
                  checked={allowTwoLines}
                  onChange={(e) => setAllowTwoLines(e.target.checked)}
                />
                <label>Allow Two Lines</label>
              </div>
            </div>
          )}

          {selectedComponent && selectedComponent.type === 'textbox' && selectedComponent.id && (
            <div className='mx-3 '>
              <label>Edit Variable</label>
              <input type="text" className='bg-gray-400 p-2 m-3 ' value={inputText} onChange={handleInputChange} />
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

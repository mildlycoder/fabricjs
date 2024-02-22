import React, { useRef, useState, useEffect } from 'react';
import { fabric } from 'fabric';

const JsonReader = () => {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [matchingVariables, setMatchingVariables] = useState([]);
  const [canvasData, setCanvasData] = useState()

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
    canvas.loadFromJSON(parsedData, () => {
      const matchingVars = findMatchingVariables(parsedData.objects);
      setMatchingVariables(matchingVars);
  
      // Update state with parsedData
      setCanvasData(parsedData);
      
      // No need to log here, move the log to useEffect
  
      canvas.renderAll();
    });
  };
  
  // Use useEffect to log the updated state after it has been set
  useEffect(() => {
    console.log(canvasData);
  }, [canvasData]);
  

  const findMatchingVariables = (objects) => {
    const matchingVars = [];

    objects.forEach((obj) => {
      if (obj.id) {
        matchingVars.push({ ...obj });
      }
    });
    return matchingVars;
  };

  useEffect(() => {
    console.log('Matching Variables:', matchingVariables);
    // You can perform any additional actions with the matchingVariables here
  }, [matchingVariables]);

  const updateVariableValue = (variableId, variableValue) => {
    setCanvasData((prevCanvasData) => {
      // Create a copy of the canvas data to avoid mutating the state directly
      const updatedCanvasData = { ...prevCanvasData };
  
      // Update the text property of the objects with matching variableId
      updatedCanvasData.objects = updatedCanvasData.objects.map((obj) => {
        if (obj.id === variableId) {
          return { ...obj, text: variableValue };
        }
        return obj;
      });
  
      // Update matching variables with the modified object
      const updatedMatchingVariables = findMatchingVariables(updatedCanvasData.objects);
  
      // Set both canvas data and matching variables in the state
      setCanvasData(updatedCanvasData);
      setMatchingVariables(updatedMatchingVariables);
  
      return updatedCanvasData;
    });


    const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
      });
    
      // Load objects from JSON onto the new canvas
      canvas.loadFromJSON(canvasData, () => {
        canvas.renderAll();
      });
  };
  
  

  return (
    <div className='m-10'>
     <div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} />
        <button
            onClick={() => {
            // Trigger the file input
            fileInputRef.current.click();
            }}
        >
            Load JSON File
        </button>
        <div className='mt-2 mb-2'>
            <div className='mt-2 mb-2'>all varibles used:</div>
            <div className='flex flex-col gap-2'>
            {
                matchingVariables.map((variable) => {
                    return( 
                        <div className='flex gap-2'>
                            <div>{variable.id}</div>
                            <input
                            className='bg-gray-200 p-1'
                            onChange={(e) => updateVariableValue(variable.id, e.target.value)}
                            value={variable.text} 
                            type="text" />
                        </div>
                    )
                })
            }
            </div>
        </div>
     </div>
      {/* Canvas element for the JsonReader component */}
      <canvas className='' ref={canvasRef} />
    </div>
  );
};

export default JsonReader;

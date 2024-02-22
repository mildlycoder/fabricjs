import React, { useRef, useState, useEffect } from 'react';
import { fabric } from 'fabric';

const JsonReader = () => {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [matchingVariables, setMatchingVariables] = useState([]);

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
      canvas.renderAll();
    });
  };

  const findMatchingVariables = (objects) => {
    console.log(objects)
    const matchingVars = [];

    objects.forEach((obj) => {
      if (obj.id) {
        matchingVars.push({ ...obj });
      }
    });
    console.log(matchingVars)
    return matchingVars;
  };

  useEffect(() => {
    console.log('Matching Variables:', matchingVariables);
    // You can perform any additional actions with the matchingVariables here
  }, [matchingVariables]);

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

import React, { useRef, useEffect, useState } from "react";
import { fabric } from "fabric";

const EditorMP = () => {
  const [selectedCanvas, setSelectedCanvas] = useState(null);
  const canvasRefs = [useRef(null), useRef(null)];
  const [canvasInstances, setCanvasInstances] = useState([]);

  useEffect(() => {
    const canvases = canvasRefs.map((canvasRef, index) => {
      console.log(canvasRef)
      const canvasId = `canvas-${index}`;
      const canvas = new fabric.Canvas(canvasId);

      // Additional configurations for each canvas can be added here
      setCanvasInstances((prevInstances) => [...prevInstances, canvas]);

      // Example: Add IText to each canvas
      const text = new fabric.IText("Hello Fabric.js", {
        left: 10,
        top: 10,
        fill: "black",
      });

      canvas.add(text);

      // Add click event listener to each canvas
      canvas.on("mouse:down", () => {
        handleCanvasClick(index);
      });

      return canvas;
    });

    // Additional logic for interactivity or synchronization between canvases can be added here

    return () => {
      // Cleanup code if needed
      canvases.forEach((canvas) => {
        canvas.dispose();
      });
    };
  }, []);

  const handleCanvasClick = (index) => {
    setSelectedCanvas(index);
    // Add additional logic for handling canvas click, e.g., highlighting or editing
  };

  const addITextToSelectedCanvas = () => {
    if (selectedCanvas !== null) {
      const canvas = canvasInstances[selectedCanvas];
      
      const newText = new fabric.IText("New Text", {
        left: 50,
        top: 50,
        fill: "black",
      });
      console.log(canvas)
      canvas.add(newText);
    }
  };
  console.log(selectedCanvas)
  console.log(canvasRefs)
  console.log(canvasInstances)
  return (
    <div>
        <h1 className="m-10">**work in progress</h1>
      <div className="m-10">
        <button
          onClick={addITextToSelectedCanvas}
          className="mt-4 p-2 bg-blue-500 text-white"
        >
          Add Text
        </button>
      </div>
      <div className="flex flex-col m-10 gap-5">
        {canvasRefs.map((canvasRef, index) => (
          <div
            key={index}
            className={`border-2 w-[400px] h-[300px] ${
              selectedCanvas === index ? "border-yellow-500" : ""
            }`}
          >
            <canvas id={`canvas-${index}`} ref={canvasRef} width={400} height={300} /> 
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorMP;

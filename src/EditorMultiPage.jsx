import React, { useRef, useEffect, useState, createRef } from "react";
import { fabric } from "fabric";

const EditorMP = () => {
  const [selectedCanvas, setSelectedCanvas] = useState(null);
  const [canvasPages, setCanvasPages] = useState(2);
  const [canvasInstances, setCanvasInstances] = useState([]);
  const [canvasRefs, setCanvasRefs] = useState([useRef(null), useRef(null)]);

  useEffect(() => {
    const canvases = canvasRefs.map((canvasRef, index) => {
      const canvasId = `canvas-${index}`;
      const canvas = new fabric.Canvas(canvasId);


      const text = new fabric.IText(`canvas-${index}`, {
        left: 10,
        top: 10,
        fill: "black",
      });

      canvas.add(text);

      canvas.on("mouse:down", () => {
        handleCanvasClick(index);
      });

      return canvas;
    });

    setCanvasInstances(canvases)
    return () => {
      canvases.forEach((canvas) => {
        canvas.dispose();
      });
    };
  }, [canvasRefs]);

  const handleCanvasClick = (index) => {
    setSelectedCanvas(index);
  };

  const addITextToSelectedCanvas = () => {
    if (selectedCanvas !== null) {
      const canvas = canvasInstances[selectedCanvas];
      const newText = new fabric.IText("New Text", {
        left: 50,
        top: 50,
        fill: "black",
      });
      canvas.add(newText);
    }
  };

  const addCanvas = () => {
    const newCanvasRef = createRef(null);
    setCanvasRefs((prevRefs) => [...prevRefs, newCanvasRef]);
    setCanvasPages((prevPages) => prevPages + 1);
  };

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
        <button
          onClick={addCanvas}
          className="mt-4 p-2 bg-blue-500 text-white"
        >
          Add Canvas
        </button>
      </div>
      <div className="flex flex-col m-10 gap-5">
        {canvasRefs.map((canvasRef, index) => (
          <div
            key={index}
            className={`border-2 w-[400px] h-[300px] ${selectedCanvas === index ? "border-yellow-500" : ""
              }`}
          >
            <canvas
              id={`canvas-${index}`}
              ref={canvasRef}
              width={400}
              height={300}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorMP;

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from './Canvas';

export function CanvasWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef();

  useEffect(() => {
    if (canvasRef.current) {
      new Canvas(canvasRef.current);
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="absolute top-0 left-0 flex flex-col items-center justify-center h-screen bg-transparent">
      <canvas ref={canvasRef} className="webgl-canvas" style={{ width: '100%', height: '100vh' }}></canvas>
      {isLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-30">
          <div>Loading...</div>
        </div>
      )}
    </div>
  );
}

export default CanvasWrapper; 
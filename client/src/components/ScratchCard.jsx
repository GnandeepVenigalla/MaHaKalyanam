import React, { useRef, useState, useEffect } from 'react';

export default function ScratchCard({ children }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
    
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && !isScratched) {
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [isScratched]);

  useEffect(() => {
    if (isScratched || size.width === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    // Fill cover
    const gradient = ctx.createLinearGradient(0, 0, size.width, size.height);
    gradient.addColorStop(0, '#D4AF37'); // Gold
    gradient.addColorStop(0.5, '#F3E5AB'); // Light gold
    gradient.addColorStop(1, '#C0A868'); // Dark gold
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size.width, size.height);

    // Add text
    ctx.font = '600 12px "Sora", sans-serif';
    ctx.fillStyle = '#702632'; // Burgundy text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH TO REVEAL', size.width / 2, size.height / 2 + 1);

    // Setup erasing
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 25; // Eraser size
    ctx.globalCompositeOperation = 'destination-out';
  }, [size, isScratched]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (isScratched) return;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
  };

  const draw = (e) => {
    if (!isDrawing || isScratched) return;
    if (e.cancelable) e.preventDefault(); // Prevent scrolling on touch
    
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    
    checkScratched();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const scratchCount = useRef(0);
  const checkScratched = () => {
    if (isScratched) return;
    
    // Performance optimization: don't check pixels every single frame
    scratchCount.current += 1;
    if (scratchCount.current % 4 !== 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 32) {
      if (pixels[i] < 128) transparentPixels++;
    }
    
    const totalPixelsChecked = pixels.length / 32;
    const percentScratched = (transparentPixels / totalPixelsChecked) * 100;
    
    // Reveal if they scratch more than 45% of the area
    if (percentScratched > 45) {
      setIsScratched(true);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ opacity: size.width > 0 ? 1 : 0 }}>
        {children}
      </div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: isScratched ? 'default' : 'crosshair',
          opacity: isScratched ? 0 : 1,
          transition: 'opacity 0.8s ease',
          pointerEvents: isScratched ? 'none' : 'auto',
          borderRadius: '50px', // Matches the date pill
          touchAction: 'none',
          boxShadow: isScratched ? 'none' : '0 4px 12px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
}

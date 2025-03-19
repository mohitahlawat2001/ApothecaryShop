import React, { useEffect, useRef } from 'react';

const LeafLoading = ({ isLoading }) => {
  const canvasRef = useRef(null);
  const requestIdRef = useRef(null);
  const sakurasRef = useRef([]);
  const windRootsRef = useRef([]);
  const imgRef = useRef(new Image());
  const cntRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const SAKURA_COUNT = 40; // Increased count for more visible leaves
    const IMG_SIZE = 24;
    const CANVAS_WIDTH = window.innerWidth;
    const CANVAS_HEIGHT = window.innerHeight;

    // Set canvas dimensions
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Create leaf image - try different path formats
    const img = imgRef.current;
    // Try absolute path from root
    img.src = `${window.location.origin}/leaf.png`;
    
    // Error handling for image loading
    img.onerror = () => {
      console.error("Failed to load leaf.png, trying alternative path");
      // Use the fallback leaf if available
      if (window.createFallbackLeaf) {
        img.src = window.createFallbackLeaf();
      } else {
        img.src = './leaf.png'; // Try relative path
      }
    };
    
    const setup = () => {
      addSakura();
      canvas.addEventListener('mousemove', (e) => {
        windRootsRef.current.push({x: e.clientX, y: e.clientY, rest: 0});
      });
    };

    const getKyori = (x1, y1, x2, y2) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    const getNearWindRoot = (sakura) => {
      const len = windRootsRef.current.length;
      let wind = null;
      let kyoriMin = 100;
      
      for (let i = 0; i < len; ++i) {
        const w = windRootsRef.current[i];
        const kyori = getKyori(w.x, w.y, sakura.x, sakura.y);
        if (kyori < kyoriMin) {
          wind = w;
          kyoriMin = kyori;
        }
      }
      return wind;
    };

    const fall = (sakura) => {
      sakura.rotationX += sakura.rotationVx + Math.random() * 5;
      sakura.rotationY += sakura.rotationVy + Math.random() * 5;
      sakura.rotationZ += sakura.rotationVz + Math.random() * 5;
      
      // Increase speed factors for faster movement
      let vx = (sakura.vx + 1 * Math.abs(Math.sin(sakura.rotationZ * Math.PI / 180))) * 1.5;
      let vy = (sakura.vy + 2 * Math.abs(Math.cos(sakura.rotationX * Math.PI / 180))) * 1.8; // Increased vertical speed
      const vz = (sakura.vz + 1 * Math.abs(Math.sin(sakura.rotationY * Math.PI / 180))) * 1.5;

      const w = getNearWindRoot(sakura);
      if (w) {
        const kyori = getKyori(w.x, w.y, sakura.x, sakura.y);
        if (kyori <= 0) {
          vx += 4.5; // Increased response to mouse movement
        } else {
          vx += (sakura.x - w.x) / kyori * (500 - sakura.z + 200) * 0.007 * Math.min(w.rest / 10, 1);
          vy += (sakura.y - w.y) / kyori * (500 - sakura.z + 200) * 0.007 * Math.min(w.rest / 10, 1);
        }
      }

      sakura.x += vx;
      sakura.y += vy;
      sakura.z -= vz;
      
      // Modified wrap-around logic to focus on vertical movement
      if(sakura.x > CANVAS_WIDTH + 50) {
        sakura.x = -50;
      } else if(sakura.x < -50) {
        sakura.x = CANVAS_WIDTH + 50;
      }
      
      // When leaves reach the bottom, reposition them at the top
      if(sakura.y > CANVAS_HEIGHT + 50) {
        // Reset back to top with random horizontal position near center
        sakura.y = -50;
        sakura.x = (CANVAS_WIDTH / 2) + (Math.random() * CANVAS_WIDTH * 0.5) - (CANVAS_WIDTH * 0.25);
      } 
      
      if(sakura.z < 0) {
        sakura.z = 500;
      } else if(sakura.z > 600) {
        sakura.z = 100;
      }

      const scale = 1 / Math.max(sakura.z / 200, 0.001);
      sakura.scaleX = sakura.scaleY = scale;
    };

    const drawSakuras = () => {
      const len = sakurasRef.current.length;
      for (let i = 0; i < len; ++i) {
        const s = sakurasRef.current[i];
        
        // Center the animation in the middle of the screen horizontally
        const centerX = CANVAS_WIDTH / 2;
        
        // Adjust display coordinates to center the animation horizontally
        // but maintain vertical position for falling effect
        const dispX = centerX + ((s.x - centerX) / Math.max(s.z / 200, 0.001) * 0.8);
        const dispY = s.y / Math.max(s.z / 200, 0.001) * 0.8;

        ctx.translate(dispX, dispY);
        ctx.scale(s.scaleX, s.scaleY);
        ctx.rotate(s.rotationZ * Math.PI / 180);
        ctx.transform(1, 0, 0, Math.sin(s.rotationX * Math.PI / 180), 0, 0);
        ctx.translate(-dispX, -dispY);

        ctx.globalAlpha = Math.min(1, (500 - s.z) / 50);
        
        try {
          ctx.drawImage(img, dispX - IMG_SIZE / 2, dispY - IMG_SIZE / 2, IMG_SIZE, IMG_SIZE);
        } catch (e) {
          console.error("Error drawing image:", e);
        }
        
        ctx.globalAlpha = 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    };

    const addSakura = () => {
      // Clear any existing sakuras first
      sakurasRef.current = [];
      
      // Center point horizontally
      const centerX = CANVAS_WIDTH / 2;
      const topSection = -CANVAS_HEIGHT * 0.5; // Start above the visible canvas
      const spreadX = CANVAS_WIDTH * 0.4; // Horizontal spread
      
      for (let i = 0; i < SAKURA_COUNT; ++i) {
        const sakura = {};
        sakura.scaleX = sakura.scaleY = Math.random() * 1.2 + 0.3;
        sakura.rotationX = Math.random() * 360;
        sakura.rotationY = Math.random() * 360;
        sakura.rotationZ = Math.random() * 360;
        
        // Position leaves above the center with some horizontal variation
        sakura.x = centerX + (Math.random() * spreadX) - (spreadX / 2);
        // Stagger vertical positions from above the visible area
        sakura.y = topSection + (Math.random() * CANVAS_HEIGHT * 0.5);
        sakura.z = Math.random() * 500;

        // Increase base velocity with focus on vertical (falling) movement
        sakura.vx = 0.3 + 0.4 * Math.random() - 0.2; // Less horizontal drift
        sakura.vy = 0.8 + 1.0 * Math.random(); // More vertical speed
        sakura.vz = 0.5 + 0.4 * Math.random();

        // Faster rotation speeds
        sakura.rotationVx = 10 - 15 * Math.random();
        sakura.rotationVy = 10 - 15 * Math.random();
        sakura.rotationVz = 10 - 15 * Math.random();

        sakura.getAlpha = function() {
          return 1;
        };
        
        sakurasRef.current.push(sakura);
      }
    };

    const draw = () => {
      if (!canvasRef.current) return;

      cntRef.current++;
      ctx.clearRect(0, 0, CANVAS_WIDTH + 1, CANVAS_HEIGHT + 1);

      const len = sakurasRef.current.length;
      for (let i = 0; i < len; ++i) {
        fall(sakurasRef.current[i]);
      }
      
      drawSakuras();
    };

    const animate = () => {
      draw();
      if (isLoading) {
        requestIdRef.current = requestAnimationFrame(animate);
      }
    };

    // Initialize and start animation
    img.onload = () => {
      console.log("Leaf image loaded successfully"); // Debug log
      setup();
      animate(); // Start animation immediately
    };

    // Clean up
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
      canvas.removeEventListener('mousemove', () => {});
    };
  }, [isLoading]);

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-green-50 z-50 transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="text-center relative z-10">
        <h1 className="text-4xl font-bold text-green-800 mb-3">Apothecary Shop</h1>
        <p className="text-green-600 mb-8">Loading your App</p>
      </div>
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full z-0"
      />
    </div>
  );
};

export default LeafLoading;

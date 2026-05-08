import React, { useEffect, useRef } from 'react';

// The main App component that encapsulates the animation
// In React, component names must start with a capital letter to be recognized as components.
// I've renamed the function from "component" to "TubesCursor".
export default function TubesCursor() {
  // useRef to get a persistent reference to the canvas element
  const canvasRef = useRef(null);
  // useRef to hold the animation instance so we can call its methods
  const appRef = useRef(null);
  // Track mouse position
  const mouseRef = useRef({ x: 0, y: 0 });
  // Track animation time for infinity pattern
  const animationTimeRef = useRef(0);

  /**
   * Generates an array of random hex color strings.
   * @param {number} count - The number of random colors to generate.
   * @returns {string[]} An array of color strings.
   */
  const randomColors = (count) => {
    return new Array(count).fill(0).map(() => 
      "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    );
  };

  // This effect runs once when the component mounts
  useEffect(() => {
    // The error "Computed radius is NaN" suggests a race condition where the animation 
    // library initializes before the canvas element has its final dimensions, leading 
    // to invalid geometry calculations. Delaying the initialization with setTimeout 
    // ensures the DOM is fully painted and ready.
    const initTimer = setTimeout(() => {
      import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js')
        .then(module => {
          const TubesCursor = module.default;
          // Ensure the canvas element is still available before initializing
          if (canvasRef.current) {
            // Initialize the TubesCursor animation with theme colors
            const app = TubesCursor(canvasRef.current, {
              tubes: {
                colors: ["#818cf8", "#2dd4bf", "#fcd34d"], // primary, secondary, accent from dark theme
                lights: {
                  intensity: 200,
                  colors: ["#818cf8", "#2dd4bf", "#fcd34d", "#f472b6"] // theme colors
                }
              }
            });
            // Store the instance in our ref for later use
            appRef.current = app;
            
            // Log available methods for debugging
            console.log('TubesCursor instance:', app);
            console.log('Available methods:', Object.keys(app));
            if (app.tubes) {
              console.log('Tubes methods:', Object.keys(app.tubes));
            }

            // Start infinity pattern animation
            const animateInfinity = () => {
              animationTimeRef.current += 0.008; // Speed of the infinity movement
              const t = animationTimeRef.current;
              
              // Infinity symbol parametric equations
              // x(t) = sin(t) creates horizontal movement from -1 to 1
              // y(t) = sin(t) * cos(t) creates the figure-8 pattern
              // We scale these to cover full screen dimensions
              
              const scale = 1.8; // Increase scale to cover more screen area
              const x = Math.sin(t) * scale;
              const y = Math.sin(t) * Math.cos(t) * scale;
              
              // Update mouse position to follow infinity pattern
              mouseRef.current = {
                x: ((x + 1) / 2) * window.innerWidth,
                y: ((y + 1) / 2) * window.innerHeight
              };

              if (appRef.current) {
                // Try different methods to update position
                
                // Method 1: Direct updateMousePosition (normalized coordinates)
                if (typeof appRef.current.updateMousePosition === 'function') {
                  appRef.current.updateMousePosition(x, y);
                }
                
                // Method 2: Set mouse property directly (normalized coordinates)
                if (appRef.current.mouse) {
                  appRef.current.mouse.x = x;
                  appRef.current.mouse.y = y;
                }
                
                // Method 3: Update via tubes object (pixel coordinates)
                if (appRef.current.tubes && appRef.current.tubes.updateMouse) {
                  appRef.current.tubes.updateMouse(mouseRef.current.x, mouseRef.current.y);
                }
                
                // Method 4: Set target position (pixel coordinates)
                if (appRef.current.setTarget) {
                  appRef.current.setTarget(mouseRef.current.x, mouseRef.current.y);
                }
              }
              
              requestAnimationFrame(animateInfinity);
            };
            
            // Start the animation loop
            animateInfinity();
          }
        })
        .catch(err => console.error("Failed to load TubesCursor module:", err));
    }, 100); // 100ms delay to allow for DOM rendering

    // Add global click listener to change colors on any click
    const handleGlobalClick = () => {
      if (appRef.current) {
        const newTubeColors = randomColors(3);
        const newLightColors = randomColors(4);
        // Update the colors in the running animation
        appRef.current.tubes.setColors(newTubeColors);
        appRef.current.tubes.setLightsColors(newLightColors);
      }
    };

    // Attach event listeners
    document.addEventListener('click', handleGlobalClick);

    // Cleanup function to dispose of the animation and clear the timeout
    return () => {
      clearTimeout(initTimer);
      document.removeEventListener('click', handleGlobalClick);
      // Check if app was initialized and has a dispose method before calling
      if (appRef.current && typeof appRef.current.dispose === 'function') {
        appRef.current.dispose();
      }
    };
  }, []); // The empty dependency array ensures this effect runs only once

  return (
    // Canvas element for the animation as background only
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

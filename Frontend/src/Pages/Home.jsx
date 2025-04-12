import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

export default function Home() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("./assets/bg.png")',
          zIndex: -1,
        }}
      />
      
      <div
        className="absolute bottom-10 right-[-2px] z-10"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src="./assets/leaves.png"
          alt="Leaf branch"
          className={`w-[20rem] sm:w-[18rem] md:w-[50rem] h-auto transform-gpu ${isHovering ? 'leaf-shake-right-pivot' : ''}`}
        />
      </div>
      
      <div className="flex items-center justify-center w-full h-full">
      <div className="backdrop-blur-sm bg-green-700/90 rounded-3xl md:rounded-3xl shadow-xl w-full h-full max-w-[95%] sm:max-w-[90%] max-h-[95vh] sm:max-h-[90vh] flex flex-col py-2 md:py-4">
          <Navbar />
          <div className="flex-1 overflow-auto">
            <Hero />
          </div>
        </div>
      </div>
      
      <style >{`
        .leaf-shake-right-pivot {
          animation: shake-from-right 1s ease-in-out;
          transform-origin: right bottom;
        }
        
        @keyframes shake-from-right {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-1deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-0.5deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
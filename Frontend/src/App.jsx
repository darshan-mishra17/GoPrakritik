import React, { useState } from "react";
import "./styles.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export default function App() {
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

      {/* Leaf image positioned at bottom right with hover animation */}
      <div 
        className="absolute bottom-10 right-0 z-10"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src="./assets/leaves.png"
          alt="Leaf branch"
          className={`w-[50rem] h-auto transform-gpu ${isHovering ? 'leaf-shake-right-pivot' : ''}`}
        />
      </div>

      <div className="flex items-center justify-center w-full h-full">
        <div className="backdrop-blur-sm bg-green-700/90 drop-shadow-2xl/50 rounded-3xl shadow-xl w-full h-full max-w-[90%] max-h-[90vh] flex flex-col md:py-[1rem]">
          <Navbar />
          <Hero />
        </div>
      </div>

      {/* Add CSS for the right-pivoted leaf shake animation */}
      <style jsx>{`
        .leaf-shake-right-pivot {
          animation: shake-from-right 1s ease-in-out ;
          transform-origin: right bottom; /* Set pivot point to right bottom */
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
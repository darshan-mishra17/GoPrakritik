import React from 'react';
import './styles.css';

export default function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("./assets/bg.png")',
          zIndex: -1
        }}
      />
      
      <div className="flex items-center justify-center w-full h-full">

        <div className="backdrop-blur-md bg-white/30 p-8 rounded-xl shadow-lg">
          <h1 className="text-green font-bold text-gray-800">Hello</h1>
        </div>
      </div>
    </div>
  );
}
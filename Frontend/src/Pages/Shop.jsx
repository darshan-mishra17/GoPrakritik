import React from 'react';
import Navbar from '../components/Navbar';

export default function Shop() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("./assets/bg.png")',
          zIndex: -1,
        }}
      />
      
      <div className="flex items-center justify-center w-full h-full">
        <div className="backdrop-blur-sm bg-green-700/90 rounded-3xl shadow-xl w-full h-full max-w-[90%] max-h-[90vh] flex flex-col md:py-4">
          <Navbar />
          <div className="flex-1 overflow-auto p-8 text-white">
            <h1 className="text-4xl font-bold mb-8">Our Products</h1>
            {/* Shop content goes here */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Product cards would go here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
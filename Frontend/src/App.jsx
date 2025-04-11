import React, { useState } from "react";
import "./styles.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Shop from "./Pages/Shop";
import About from "./Pages/About";
import Cart from "./Pages/Cart";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  const [isHovering, setIsHovering] = useState(false);
  
  const AppLayout = ({ children, path }) => {
    const isHomePage = path === "/";
    
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("./assets/bg.png")',
            zIndex: -1,
          }}
        />
        
        {isHomePage && (
          <div
            className="absolute bottom-10 right-[-2px] z-10"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <img
              src="./assets/leaves.png"
              alt="Leaf branch"
              className={`w-[20rem] md:w-[50rem] h-auto transform-gpu ${isHovering ? 'leaf-shake-right-pivot' : ''}`}
            />
          </div>
        )}
        
        <div className="flex items-center justify-center w-full h-full">
          <div className="backdrop-blur-sm bg-green-700/90 rounded-3xl shadow-xl w-full h-full max-w-[90%] max-h-[90vh] flex flex-col md:py-4">
            <Navbar />
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
        </div>
        
        <style jsx>{`
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
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout path="/"><Hero /></AppLayout>} />
        <Route path="/shop" element={<AppLayout path="/shop"><Shop /></AppLayout>} />
        <Route path="/about" element={<AppLayout path="/about"><About /></AppLayout>} />
        <Route path="/cart" element={<AppLayout path="/cart"><Cart /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
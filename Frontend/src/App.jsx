import React from "react";
import "./styles.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export default function App() {
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
        <div className="backdrop-blur-sm bg-green-700/70 drop-shadow-xl/50 rounded-3xl shadow-xl w-full h-full max-w-[90%] max-h-[90vh] flex flex-col md:py-[1rem]">
          <Navbar />
          <Hero />
        </div>
      </div>
    </div>
  );
}

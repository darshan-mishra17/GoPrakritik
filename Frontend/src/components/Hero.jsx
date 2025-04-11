import React from "react";

export default function Hero() {
  return (
    <div className="flex items-center md:mx-24 md:my-8 p-4">
      <div className="max-w-2xl">
        <h1 className="text-white text-6xl font-bold mb-6 leading-[1.3]">
          Bringing Nature’s
          <br />
          Best to Your
          <br />
          Home.
        </h1>
        <p className="text-white/90 text-xl italic mb-10">
          Shop Organic. Live Pure. Feel the Difference.
        </p>
        <button className="group relative overflow-hidden bg-transparent text-lg md:text-xl text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold transition duration-500">
          <span className="absolute inset-0 border-2 border-white opacity-100 rounded-full transform scale-100 group-hover:scale-110 transition-transform duration-500"></span>

          <span className="absolute inset-0 bg-green-600  transform translate-y-full group-hover:translate-y-0 transition-transform duration-150 ease-out rounded-full"></span>

          <span className="relative z-10 transition duration-300 group-hover:text-white">
            Buy now
          </span>
        </button>
      </div>
    </div>
  );
}
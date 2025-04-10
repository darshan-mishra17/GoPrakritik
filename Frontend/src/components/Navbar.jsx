import React from "react";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <img
          className="md:h-20 h-8"
          src="./assets/logo.png"
          alt="Go Prakritik Logo"
        />
      </div>
      <div className="flex gap-16 text-white text-lg md:px-24">
        <a href="#" className="hover:underline">
          Shop
        </a>
        <a href="#" className="hover:underline">
          About
        </a>
        <a href="#" className="hover:underline">
          Cart
        </a>
      </div>
    </div>
  );
}

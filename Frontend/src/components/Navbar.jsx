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
        <NavLink href="#" text="Shop" />
        <NavLink href="#" text="About" />
        <NavLink href="#" text="Cart" />
      </div>
    </div>
  );
}

function NavLink({ href, text }) {
  return (
    <a href={href} className="relative group">
      <span className="block">{text}</span>
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
    </a>
  );
}
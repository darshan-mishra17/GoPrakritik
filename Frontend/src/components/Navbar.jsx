import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <Link to="/">
          <img
            className="md:h-20 h-8"
            src="./assets/logo.png"
            alt="Go Prakritik Logo"
          />
        </Link>
      </div>
      
      <div className="flex gap-16 text-white text-lg md:px-24">
        <NavLink to="/shop" text="Shop" />
        <NavLink to="/about" text="About" />
        <NavLink to="/cart" text="Cart" />
      </div>
    </div>
  );
}

function NavLink({ to, text }) {
  return (
    <Link to={to} className="relative group">
      <span className="block">{text}</span>
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
    </Link>
  );
}
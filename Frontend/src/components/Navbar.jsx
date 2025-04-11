import React from "react";
import { Link } from "react-router-dom";
import NavLink from "./NavLink";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center px-4 md:px-8">
      <div className="flex items-center">
        <Link to="/">
          <img
            className="md:h-20 h-8"
            src="./assets/logo.png"
            alt="Go Prakritik Logo"
          />
        </Link>
      </div>
      
      <div className="flex gap-8 md:gap-24 text-white text-lg md:mr-8">
        <NavLink to="/shop" text="Shop" />
        <NavLink to="/about" text="About" />
        <NavLink to="/cart" text="Cart" />
      </div>
    </div>
  );
}
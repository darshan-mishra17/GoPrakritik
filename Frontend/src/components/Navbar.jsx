import React from "react";
import { Link } from "react-router-dom";
import NavLink from "./NavLink";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <Link to="/">
          <img
            className="md:h-24 h-8"
            src="./assets/logo.png"
            alt="Go Prakritik Logo"
          />
        </Link>
      </div>
      
      <div className="flex gap-8 md:gap-24 text-white text-lg md:mr-8 md:px-16">
        <NavLink to="/shop" text="Shop" />
        <NavLink to="/about" text="About" />
        <NavLink to="/cart" text="Cart" />
      </div>
    </div>
  );
}
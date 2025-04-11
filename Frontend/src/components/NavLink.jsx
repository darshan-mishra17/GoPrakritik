import React from "react";
import { Link } from "react-router-dom";

export default function NavLink({ to, text }) {
  return (
    <Link to={to} className="relative group">
      <span className="block">{text}</span>
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
    </Link>
  );
}
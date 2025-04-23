import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Shop from "./Pages/Shop";
import About from "./Pages/About";
import { CartProvider } from "./components/CartContext";
import Login from "./Pages/Login";
import ProfilePage from "./Pages/Profile";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          {/* Add this line for user-specific shop routes */}
          <Route path="/shop/:userId" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

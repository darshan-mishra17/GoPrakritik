import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";

export default function Sidebar({
  isOpen,
  onClose,
  product,
  sidebarType,
  animationClass,
  handleCheckout,
}) {
  const [quantity, setQuantity] = useState(1);
  const [_subtotal, setSubtotal] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [addedToCartMessage, setAddedToCartMessage] = useState("");

  // Use the cart context
  const {
    cartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    getCartTotal,
  } = useCart();

  // Reset values when product changes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setAddedToCartMessage("");

      // Reset selected variant when product changes
      if (
        product &&
        product.priceVariants &&
        product.priceVariants.length > 0
      ) {
        setSelectedVariant(0);
      }
    }
  }, [product, isOpen]);

  // Update subtotal when quantity or variant changes
  useEffect(() => {
    if (product && product.priceVariants && product.priceVariants.length > 0) {
      const priceString = product.priceVariants[selectedVariant].price
        .toString()
        .replace(/[^\d]/g, "");
      const priceValue = parseInt(priceString, 10);
      const calculatedSubtotal = priceValue * quantity;
      setSubtotal(calculatedSubtotal);
    } else {
      setSubtotal(0);
    }
  }, [quantity, product, selectedVariant]);

  if (!isOpen) return null;

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedVariant).then((isNew) => {
        setAddedToCartMessage(
          isNew ? "Added to cart!" : "Updated cart quantity!"
        );

        setTimeout(() => {
          setAddedToCartMessage("");
        }, 3000);
      });
    }
  };

  // New function to handle checkout from product details
  const handleCheckoutFromDetails = () => {
    if (sidebarType === "details" && product) {
      // First add the current product to cart
      setAddedToCartMessage("Adding to cart before checkout...");
      
      addToCart(product, quantity, selectedVariant).then(() => {
        // Short delay to show the message before redirecting
        setTimeout(() => {
          handleCheckout();
        }, 800);
      });
    } else {
      // If we're already in the cart view, just proceed to checkout
      handleCheckout();
    }
  };

  const handleRemove = (productId, variantIndex) => {
    removeFromCart(productId, variantIndex);
  };

  const handleUpdateCartQuantity = (productId, variantIndex, newQuantity) => {
    updateCartItemQuantity(productId, variantIndex, newQuantity);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getCurrentVariantUnit = () => {
    if (
      product?.priceVariants &&
      product.priceVariants.length > selectedVariant
    ) {
      return product.priceVariants[selectedVariant].unit;
    }
    return "";
  };

  const getCurrentVariantPrice = () => {
    if (
      product?.priceVariants &&
      product.priceVariants.length > selectedVariant
    ) {
      return `Rs.${product.priceVariants[selectedVariant].price}`;
    }
    return product?.price || "Price not available";
  };

  const renderProductDetails = () => (
    <div
      className="flex-1 overflow-y-auto"
      style={{
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        msOverflowStyle: "auto",
        scrollbarWidth: "auto",
        maxHeight: "calc(100vh - 180px)",
      }}
    >
      <h3 className="text-lg font-semibold mb-3">Product Details</h3>

      <div className="flex flex-row gap-3 mb-4">
        <div className="w-1/3 sm:w-1/4 flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto object-cover rounded-md"
          />
        </div>

        <div className="flex-1">
          <div className="mb-1">
            <h4 className="text-base font-medium">{product.name}</h4>
            {product.priceVariants && product.priceVariants.length > 0 && (
              <div className="text-xs text-gray-600">
                {getCurrentVariantUnit()}
              </div>
            )}
          </div>
          <p className="text-xs">{product.description || "NA"}</p>
        </div>
      </div>

      {product.priceVariants && product.priceVariants.length > 1 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Available Sizes</h4>
          <div className="flex flex-wrap gap-1">
            {product.priceVariants.map((variant, idx) => (
              <button
                key={idx}
                className={`px-2 py-0.5 text-xs rounded-full border ${
                  selectedVariant === idx
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white border-gray-300 text-gray-700 hover:border-green-700"
                }`}
                onClick={() => setSelectedVariant(idx)}
              >
                {variant.unit}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="border-t border-gray-200 py-2">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("processing")}
          >
            <span className="text-xs font-medium">
              Organic Processing Method
            </span>
            <span className="text-xs">
              {expandedSection === "processing" ? "-" : "+"}
            </span>
          </div>
          {expandedSection === "processing" && (
            <div className="mt-1 text-xs text-gray-700">
              {product.organicProcessingMethod || "NA"}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 py-2">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("traditional")}
          >
            <span className="text-xs font-medium">Traditional Methods</span>
            <span className="text-xs">
              {expandedSection === "traditional" ? "-" : "+"}
            </span>
          </div>
          {expandedSection === "traditional" && (
            <div className="mt-1 text-xs text-gray-700">
              {product.traditionalMethods || "NA"}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 py-2">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("benefits")}
          >
            <span className="text-xs font-medium">Benefits</span>
            <span className="text-xs">
              {expandedSection === "benefits" ? "-" : "+"}
            </span>
          </div>
          {expandedSection === "benefits" && (
            <div className="mt-1">
              {product.benefits && product.benefits.length > 0 ? (
                <ul className="list-disc pl-4 text-xs text-gray-700">
                  {product.benefits.map((benefit, index) => (
                    <li key={index}>{benefit.description}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-700">NA</p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-b border-gray-200 py-2">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("usage")}
          >
            <span className="text-xs font-medium">Usage</span>
            <span className="text-xs">
              {expandedSection === "usage" ? "-" : "+"}
            </span>
          </div>
          {expandedSection === "usage" && (
            <div className="mt-1 text-xs text-gray-700">
              {product.usage || "NA"}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium">Price</span>
        <span className="text-sm font-semibold text-green-700">
          {getCurrentVariantPrice()}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium">Quantity</span>
        <div className="flex items-center border rounded-full overflow-hidden">
          <button
            onClick={decrementQuantity}
            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
            type="button"
          >
            -
          </button>
          <span className="px-2 py-0.5 text-xs">{quantity}</span>
          <button
            onClick={incrementQuantity}
            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
            type="button"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="flex-1 flex flex-col">
      <h3 className="text-lg font-semibold mb-3">Cart</h3>

      <div
        className="flex-1 overflow-y-auto"
        style={{
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "auto",
          scrollbarWidth: "auto",
          maxHeight: "calc(100vh - 180px)",
        }}
      >
        {cartItems.length > 0 ? (
          <div>
            {cartItems.map((item) => (
              <div
                key={`${item.product._id}-${item.selectedVariantIndex}`}
                className="border-b border-gray-200 pb-3 mb-3"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 border border-gray-300 rounded overflow-hidden mr-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="text-sm font-medium">
                          {item.product.name}
                        </h4>
                        {item.product.priceVariants &&
                          item.product.priceVariants.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {item.product.priceVariants[
                                item.selectedVariantIndex
                              ]?.unit || ""}
                            </span>
                          )}
                      </div>
                      <span className="text-xs">
                        Rs.
                        {item.product.priceVariants?.[item.selectedVariantIndex]
                          ?.price || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-full overflow-hidden">
                        <button
                          onClick={() =>
                            handleUpdateCartQuantity(
                              item.product._id,
                              item.selectedVariantIndex,
                              item.quantity - 1
                            )
                          }
                          className="px-1 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
                          type="button"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateCartQuantity(
                              item.product._id,
                              item.selectedVariantIndex,
                              item.quantity + 1
                            )
                          }
                          className="px-1 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          handleRemove(
                            item.product._id,
                            item.selectedVariantIndex
                          )
                        }
                        className="text-gray-400 hover:text-gray-600 text-xs"
                        type="button"
                      >
                        remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600">Your cart is empty</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-green-700 text-white rounded-full hover:bg-green-600 text-sm"
              type="button"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white w-full sm:w-2/3 md:w-1/2 lg:w-2/5 shadow-lg z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } ${animationClass || ""}`}
      style={{ transition: "transform 0.3s ease-in-out" }}
    >
      <div className="h-full p-4 flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col h-full">
          {sidebarType === "details" ? renderProductDetails() : renderCart()}

          <div className="mt-2 sticky bottom-0 bg-white pt-2 pb-1">
            {addedToCartMessage && (
              <div className="mb-2 p-2 bg-green-100 text-green-700 text-center text-sm rounded-lg">
                {addedToCartMessage}
              </div>
            )}

            {sidebarType === "details" ? (
              <div>
                <button
                  className="w-full py-2 mb-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-center text-xs"
                  onClick={handleAddToCart}
                  type="button"
                >
                  Add to Cart
                </button>
                <button
                  className="w-full py-2 bg-green-700 text-white rounded-full hover:bg-green-600 text-center text-xs"
                  type="button"
                  onClick={handleCheckoutFromDetails}
                >
                  Checkout
                </button>
              </div>
            ) : (
              <div>
                {cartItems.length > 0 && (
                  <div className="flex justify-between items-center mb-2 text-sm font-medium">
                    <span>SUBTOTAL</span>
                    <span>Rs.{getCartTotal()}</span>
                  </div>
                )}
                <button
                  className={`w-full py-2 bg-green-700 text-white rounded-full hover:bg-green-600 text-center text-xs ${
                    cartItems.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={cartItems.length === 0}
                  type="button"
                  onClick={cartItems.length > 0 ? handleCheckout : undefined}
                >
                  {cartItems.length > 0 ? "Checkout" : "Cart is Empty"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add custom scrollbar styles */}
      <style>{`
  ::-webkit-scrollbar {
    width: 0px;
    height: 0px;
    background: transparent;
  }

  * {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE */
  }
`}</style>
    </div>
  );
}

import { createContext, useContext, useEffect, useState } from "react";

/* ===== SETTINGS (used by Cart and Checkout) ===== */
export const VAT_RATE = 0.13;
export const FREE_DELIVERY_MIN = 1000;
export const DELIVERY_FEE = 100;
export const MAX_QUANTITY = 20;

const STORAGE_KEY = "pokhara-bites-cart";

const CartContext = createContext(null);

/* ===== Read the saved cart from localStorage ===== */
function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return []; // if storage is blocked or the data is broken, start empty
  }
}

/* ===== PROVIDER: wraps the app and shares the cart ===== */
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);

  // Save to localStorage every time the cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // storage not available (e.g. private mode): the cart still works, it just won't be saved
    }
  }, [cartItems]);

  /* ----- actions ----- */
  function addToCart(item) {
    setCartItems((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);

      if (existing) {
        // already in the cart: increase the quantity (up to the maximum)
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, MAX_QUANTITY) }
            : cartItem
        );
      }

      // new item: keep only what the cart needs
      return [
        ...prev,
        { id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1 },
      ];
    });
  }

  function increaseQuantity(id) {
    setCartItems((prev) =>
      prev.map((cartItem) =>
        cartItem.id === id
          ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, MAX_QUANTITY) }
          : cartItem
      )
    );
  }

  function decreaseQuantity(id) {
    setCartItems((prev) =>
      prev
        .map((cartItem) =>
          cartItem.id === id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCartItems((prev) => prev.filter((cartItem) => cartItem.id !== id));
  }

  function clearCart() {
    setCartItems([]);
  }

  /* ----- calculated values ----- */
  const totalItems = cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
  const subtotal = cartItems.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0);
  const vat = Math.round(subtotal * VAT_RATE);

  const value = {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    vat,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* ===== CUSTOM HOOK: the easy way to use the cart ===== */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}
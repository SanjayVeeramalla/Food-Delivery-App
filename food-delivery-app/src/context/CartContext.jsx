import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [restaurantId, setRestaurantId] = useState(() => {
    try {
      const saved = localStorage.getItem('cartRestaurantId');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    localStorage.setItem('cartRestaurantId', JSON.stringify(restaurantId));
  }, [cartItems, restaurantId]);

  const addItem = (item, restId) => {
    if (cartItems.length > 0 && restaurantId && restaurantId !== restId) {
      const confirmed = window.confirm(
        'Your cart has items from another restaurant. Clear and start fresh?'
      );
      if (!confirmed) return false;
      setCartItems([]);
      setRestaurantId(null);
    }

    setRestaurantId(restId);

    setCartItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.menuItemId);

      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });

    return true;
  };

  const increaseQty = (menuItemId) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  };

  const decreaseQty = (menuItemId) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.menuItemId === menuItemId);
      if (!item) return prev;

      let newItems;

      if (item.quantity === 1) {
        newItems = prev.filter((i) => i.menuItemId !== menuItemId);
      } else {
        newItems = prev.map((i) =>
          i.menuItemId === menuItemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }

      // Clear restaurantId if cart becomes empty
      if (newItems.length === 0) {
        setRestaurantId(null);
      }

      return newItems;
    });
  };

  const removeItem = (menuItemId) => {
    setCartItems((prev) => {
      const newItems = prev.filter((i) => i.menuItemId !== menuItemId);

      if (newItems.length === 0) {
        setRestaurantId(null);
      }

      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  const totalAmount = cartItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantId,
        addItem,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
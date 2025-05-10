import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CART_STORAGE_KEY = 'cartItems';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) setCartItems(JSON.parse(storedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const findCartItemIndex = (productId, selectedAttributes) =>
    cartItems.findIndex(
      item =>
        item.productId === productId &&
        JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
    );


  const addToCart = (product, selectedAttributes) => {
    const index = findCartItemIndex(product.id, selectedAttributes);

    const allAttributes = {};
    product.attributes.forEach((attr) => {
      allAttributes[attr.name] = attr.items;
    });

    if (index > -1) {
      const updated = [...cartItems];
      updated[index].quantity += 1;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          name: product.name,
          image: product.gallery[0]?.image_url || '',
          prices: product.price,
          selectedAttributes,
          allAttributes,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (indexToRemove) => {
    const updated = [...cartItems];
    updated.splice(indexToRemove, 1);
    setCartItems(updated);
  };

  const increaseQuantity = (index) => {
    const updated = [...cartItems];
    updated[index].quantity += 1;
    setCartItems(updated);
  };

  const decreaseQuantity = (index) => {
    const updated = [...cartItems];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
    } else {
      updated.splice(index, 1);
    }
    setCartItems(updated);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getTotalItems = () => cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const getTotalPrice = (currencySymbol) =>
    cartItems.reduce((acc, item) => {
      const price = item.prices.find(p => p.currency_symbol === currencySymbol);
      return acc + (price?.amount || 0) * item.quantity;
    }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

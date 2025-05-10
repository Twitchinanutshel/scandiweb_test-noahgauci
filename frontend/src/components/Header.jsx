import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartOverlay from './CartOverlay';

function Header() {
  const [showOverlay, setShowOverlay] = useState(false);
  const { cartItems } = useCart();

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className='flex justify-between mx-24'>
      <div className='flex gap-5'>
        <Link data-testid='active-category-link'  to='/clothes'>CLOTHES</Link>
        <Link data-testid='category-link' to='/tech'>TECH</Link>
      </div>
      <div>
        <Link to='/clothes'>Company Logo</Link>
      </div>
      <div className='relative'>
        <button data-testid='cart-btn' onClick={() => setShowOverlay(!showOverlay)}>
          CART
          {totalItems > 0 && (
            <span className='absolute -top-1 -right-3 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full'>
              {totalItems}
            </span>
          )}
        </button>
        {showOverlay && <CartOverlay closeOverlay={() => setShowOverlay(false)} />}
      </div>
    </div>
  );
}

export default Header;

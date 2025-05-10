import { useCart } from '../context/CartContext';
import { gql, useMutation } from '@apollo/client';

const PLACE_ORDER = gql`
mutation PlaceOrder($input: [OrderItemInput!]!) {
  placeOrder(input: $input) {
    id
    success
    message
  }
}
`;

function CartOverlay({ closeOverlay }) {
  const {
    cartItems,
    getTotalItems,
    getTotalPrice,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();


  const [placeOrderMutation, { loading, error }] = useMutation(PLACE_ORDER);

  const handlePlaceOrder = async () => {
    const input = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      attributes: Object.entries(item.selectedAttributes).map(([name, value]) => ({
        name,
        value,
      })),
    }));

    try {
      const res = await placeOrderMutation({ variables: { input } });

      if (res.data?.placeOrder?.success) {
        clearCart();
        alert('Order placed successfully!');
      } else {
        console.log(res.data?.placeOrder?.message);
        alert('Failed to place order.');
      }
    } catch (err) {
      console.error('Mutation error:', err);
      alert('An error occurred.');
    }
  };


  const totalItems = getTotalItems();
  const currency = cartItems[0]?.prices[0]?.currency_symbol || '$';
  const totalPrice = getTotalPrice(currency);

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-40"
      onClick={closeOverlay}
    >
      <div
        className="absolute right-4 top-16 bg-white shadow-lg rounded-md p-6 w-[400px] z-50 text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">
          My Bag, {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </h2>

        <div className="max-h-[400px] overflow-y-auto space-y-6 pr-2">
          {cartItems.map((item, index) => (
            <div key={index} className="flex space-x-3 border-b pb-4">
              <div className="flex-1 flex flex-col gap-1">
                <p className="font-medium text-sm">{item.name}</p>

                <p className="text-sm font-semibold">
                  {item.prices[0].currency_symbol}
                  {item.prices[0].amount.toFixed(2)}
                </p>

                {Object.entries(item.selectedAttributes).map(([key, value]) => {
                  const kebabKey = key.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <div
                      key={key}
                      data-testid={`cart-item-attribute-${kebabKey}`}
                      className="text-sm"
                    >
                      <p className="font-medium">{key}:</p>
                      <div className="flex gap-2 mt-1">
                        {item.allAttributes?.[key]?.map((option) => {
                          const isSelected = value === option.value;
                          const optionTestId = `cart-item-attribute-${kebabKey}-${option.value.toLowerCase().replace(/\s+/g, '-')}` +
                            (isSelected ? '-selected' : '');

                          const baseStyle = 'px-2 py-1 text-sm border text-center';

                          return (
                            <div
                              key={option.value}
                              data-testid={optionTestId}
                              className={`${baseStyle} ${isSelected ? 'bg-black text-white border-black' : 'bg-white text-black'
                                }`}
                              style={
                                key.toLowerCase() === 'color'
                                  ? {
                                    backgroundColor: option.value,
                                    color: 'transparent',
                                    border: isSelected ? '2px solid black' : '1px solid #ccc',
                                    width: 20,
                                    height: 20,
                                    borderRadius: 2,
                                  }
                                  : {}
                              }
                            >
                              {key.toLowerCase() === 'color' ? '' : option.displayValue}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}


                <div className="flex items-center mt-2 gap-2">
                  <button
                    className="w-6 h-6 border text-sm font-semibold"
                    onClick={() => increaseQuantity(index)}
                    data-testid='cart-item-amount-increase'
                  >
                    +
                  </button>
                  <span data-testid='cart-item-amount' className="text-sm">{item.quantity}</span>
                  <button
                    className="w-6 h-6 border text-sm font-semibold"
                    onClick={() => decreaseQuantity(index)}
                    data-testid='cart-item-amount-decrease'
                  >
                    -
                  </button>
                </div>
              </div>

              <img
                src={item.image}
                alt="product"
                className="w-24 h-24 object-cover ml-auto"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between font-semibold text-sm">
          <span>Total</span>
          <span data-testid='cart-total'>
            {currency}
            {totalPrice.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={cartItems.length === 0}
          className={`mt-4 w-full py-2 text-white font-semibold rounded-sm ${cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500'
            }`}
        >
          PLACE ORDER
        </button>
      </div>
    </div>
  );
}

export default CartOverlay;

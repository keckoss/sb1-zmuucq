import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const CustomerMenu: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    // Fetch menu items from local storage
    const storedItems = localStorage.getItem(`menuItems-${restaurantId}`);
    if (storedItems) {
      setMenuItems(JSON.parse(storedItems));
    }
  }, [restaurantId]);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const placeOrder = () => {
    if (cart.length === 0) return;

    const order = {
      id: Date.now().toString(),
      tableId,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      status: 'new',
      timestamp: Date.now()
    };

    // Save the order to local storage
    const storedOrders = localStorage.getItem(`orders-${restaurantId}`);
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    orders.push(order);
    localStorage.setItem(`orders-${restaurantId}`, JSON.stringify(orders));

    // Clear the cart
    setCart([]);
    setShowCart(false);
    alert('Your order has been placed!');
  };

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold mb-6">Menu for Table {tableId}</h1>
      <button
        className="fixed top-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg"
        onClick={() => setShowCart(!showCart)}
      >
        <ShoppingCart size={24} />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {cart.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
            <p className="text-gray-600 mb-2">{item.category}</p>
            <p className="text-blue-600 font-bold mb-4">${item.price.toFixed(2)}</p>
            <button
              onClick={() => addToCart(item)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center mb-2">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <p className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</p>
                </div>
                <button
                  onClick={placeOrder}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                >
                  Place Order
                </button>
              </>
            )}
            <button
              onClick={() => setShowCart(false)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface Table {
  id: string;
  number: number;
}

interface Order {
  id: string;
  tableId: string;
  items: { id: string; name: string; quantity: number; price: number }[];
  status: 'new' | 'preparing' | 'ready' | 'served';
  timestamp: number;
}

const RestaurantDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'tables' | 'orders'>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newItem, setNewItem] = useState({ name: '', price: 0, category: '' });
  const [newTable, setNewTable] = useState({ number: 0 });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Fetch menu items, tables, and orders from local storage
      const storedItems = localStorage.getItem(`menuItems-${user.id}`);
      const storedTables = localStorage.getItem(`tables-${user.id}`);
      const storedOrders = localStorage.getItem(`orders-${user.id}`);
      if (storedItems) setMenuItems(JSON.parse(storedItems));
      if (storedTables) setTables(JSON.parse(storedTables));
      if (storedOrders) setOrders(JSON.parse(storedOrders));
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check for new orders every 10 seconds
    const interval = setInterval(() => {
      const storedOrders = localStorage.getItem(`orders-${user?.id}`);
      if (storedOrders) {
        const parsedOrders: Order[] = JSON.parse(storedOrders);
        const newOrders = parsedOrders.filter(order => order.status === 'new');
        if (newOrders.length > 0) {
          // Alert for new orders
          alert(`You have ${newOrders.length} new order(s)!`);
          setOrders(parsedOrders);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const saveMenuItems = (items: MenuItem[]) => {
    if (user) {
      localStorage.setItem(`menuItems-${user.id}`, JSON.stringify(items));
    }
  };

  const saveTables = (tables: Table[]) => {
    if (user) {
      localStorage.setItem(`tables-${user.id}`, JSON.stringify(tables));
    }
  };

  const saveOrders = (orders: Order[]) => {
    if (user) {
      localStorage.setItem(`orders-${user.id}`, JSON.stringify(orders));
    }
  };

  const addMenuItem = () => {
    if (newItem.name && newItem.price && newItem.category) {
      const updatedItems = [...menuItems, { ...newItem, id: Date.now().toString() }];
      setMenuItems(updatedItems);
      saveMenuItems(updatedItems);
      setNewItem({ name: '', price: 0, category: '' });
    }
  };

  const addTable = () => {
    if (newTable.number > 0) {
      const updatedTables = [...tables, { id: Date.now().toString(), number: newTable.number }];
      setTables(updatedTables);
      saveTables(updatedTables);
      setNewTable({ number: 0 });
    }
  };

  const deleteMenuItem = (id: string) => {
    const updatedItems = menuItems.filter(item => item.id !== id);
    setMenuItems(updatedItems);
    saveMenuItems(updatedItems);
  };

  const deleteTable = (id: string) => {
    const updatedTables = tables.filter(table => table.id !== id);
    setTables(updatedTables);
    saveTables(updatedTables);
  };

  const startEditingItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({ name: item.name, price: item.price, category: item.category });
  };

  const updateMenuItem = () => {
    if (editingItem) {
      const updatedItems = menuItems.map(item =>
        item.id === editingItem.id ? { ...item, ...newItem } : item
      );
      setMenuItems(updatedItems);
      saveMenuItems(updatedItems);
      setEditingItem(null);
      setNewItem({ name: '', price: 0, category: '' });
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Restaurant Dashboard</h1>
      <div className="mb-6">
        <button
          onClick={() => setActiveTab('menu')}
          className={`mr-4 ${activeTab === 'menu' ? 'text-blue-600 font-bold' : ''}`}
        >
          Menu Management
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`mr-4 ${activeTab === 'tables' ? 'text-blue-600 font-bold' : ''}`}
        >
          Table Management
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`mr-4 ${activeTab === 'orders' ? 'text-blue-600 font-bold' : ''}`}
        >
          Orders
        </button>
      </div>

      {activeTab === 'menu' && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                placeholder="Item name"
                className="border p-2 rounded flex-grow"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price"
                className="border p-2 rounded w-24"
                value={newItem.price || ''}
                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
              />
              <input
                type="text"
                placeholder="Category"
                className="border p-2 rounded w-32"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />
              <button
                onClick={editingItem ? updateMenuItem : addMenuItem}
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                <PlusCircle size={24} />
              </button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Menu Items</h2>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">${item.price.toFixed(2)}</td>
                    <td className="p-2">{item.category}</td>
                    <td className="p-2">
                      <button className="text-blue-500 mr-2" onClick={() => startEditingItem(item)}>
                        <Edit size={18} />
                      </button>
                      <button className="text-red-500" onClick={() => deleteMenuItem(item.id)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'tables' && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Add Table</h2>
            <div className="flex space-x-4 mb-4">
              <input
                type="number"
                placeholder="Table number"
                className="border p-2 rounded w-32"
                value={newTable.number || ''}
                onChange={(e) => setNewTable({ number: parseInt(e.target.value) })}
              />
              <button
                onClick={addTable}
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                <PlusCircle size={24} />
              </button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Tables</h2>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Table Number</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <tr key={table.id} className="border-b">
                    <td className="p-2">{table.number}</td>
                    <td className="p-2">
                      <button
                        className="text-blue-500 mr-2"
                        onClick={() => setShowQRCode(table.id)}
                      >
                        Show QR Code
                      </button>
                      <button className="text-red-500" onClick={() => deleteTable(table.id)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showQRCode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Table QR Code</h2>
                <QRCode value={`${window.location.origin}/menu/${user?.id}?table=${showQRCode}`} size={256} />
                <button
                  onClick={() => setShowQRCode(null)}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Orders</h2>
          {orders.map((order) => (
            <div key={order.id} className="border-b pb-4 mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  Order #{order.id.slice(-4)} - Table {tables.find(t => t.id === order.tableId)?.number}
                </h3>
                <span className={`px-2 py-1 rounded ${
                  order.status === 'new' ? 'bg-yellow-200' :
                  order.status === 'preparing' ? 'bg-blue-200' :
                  order.status === 'ready' ? 'bg-green-200' :
                  'bg-gray-200'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600">
                {new Date(order.timestamp).toLocaleString()}
              </p>
              <ul className="mt-2">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
              <p className="font-bold mt-2">
                Total: ${order.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
                  disabled={order.status !== 'new'}
                >
                  Prepare
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'ready')}
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                  disabled={order.status !== 'preparing'}
                >
                  Ready
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'served')}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  disabled={order.status !== 'ready'}
                >
                  Served
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
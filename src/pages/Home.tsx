import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Utensils } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to QR Order</h1>
      <p className="text-xl mb-8">Streamline your restaurant ordering process with QR codes</p>
      <div className="flex justify-center space-x-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <QrCode size={48} className="mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-semibold mb-2">For Customers</h2>
          <p className="mb-4">Scan, order, and enjoy your meal hassle-free</p>
          <Link to="/menu/demo" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            View Demo Menu
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Utensils size={48} className="mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-semibold mb-2">For Restaurants</h2>
          <p className="mb-4">Manage your menu and orders efficiently</p>
          <Link to="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Restaurant Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
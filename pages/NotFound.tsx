
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white text-center px-4">
      <img 
        src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/error-500_8788bb.png" 
        alt="Page Not Found" 
        className="w-64 md:w-80 mb-6"
      />
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
      <p className="text-slate-500 mb-6 max-w-md">
        Unfortunately the page you are looking for has been moved or deleted.
      </p>
      <Link 
        to="/" 
        className="bg-[#2874f0] text-white px-8 py-3 rounded-[2px] font-bold shadow-sm hover:bg-blue-600 flex items-center gap-2"
      >
        <Home className="w-4 h-4" /> GO TO HOMEPAGE
      </Link>
    </div>
  );
};

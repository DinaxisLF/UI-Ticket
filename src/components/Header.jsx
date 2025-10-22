import React from "react";
import WhiteLogo from "../assets/logo.png";
import { Link } from "react-router-dom";
const Header = () => {
  return (
    <header className="relative z-50 px-6 py-4 border border-cyan-500/30 rounded-lg bg-blue-900 shadow-lg backdrop-blur-md shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse shadow-lg shadow-cyan-400/30"></div>

          <img
            className="w-[180px] h-[60px]"
            src={WhiteLogo}
            alt="White Logo"
          />
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/dashboard"
            className="text-gray-100 hover:text-cyan-300 transition-colors"
          >
            Inicio
          </Link>
          <Link
            to="/theater"
            className="text-gray-100 hover:text-cyan-300 transition-colors"
          >
            Teatro
          </Link>
          <Link
            to="/cinema"
            className="text-gray-100 hover:text-cyan-300 transition-colors"
          >
            Cine
          </Link>
          <Link
            to="/museum"
            className="text-gray-100 hover:text-cyan-300 transition-colors"
          >
            Museo
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

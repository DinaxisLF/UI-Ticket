import React from "react";
import WhiteLogo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

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
            to="/profile"
            className="text-gray-100 hover:text-cyan-300 transition-colors"
          >
            Perfil
          </Link>

          <span
            onClick={() =>
              navigate(`/submenu`, {
                state: {
                  title: "Boletos Teatro",
                  eventType: "theater",
                  apiCall: "Teatro",
                },
              })
            }
            className="text-gray-100 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Teatro
          </span>
          <span
            onClick={() =>
              navigate(`/submenu`, {
                state: {
                  title: "Boletos Cine",
                  eventType: "cinema",
                  apiCall: "Cine",
                },
              })
            }
            className="text-gray-100 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Cine
          </span>
          <span
            onClick={() =>
              navigate(`/submenu`, {
                state: {
                  title: "Boletos Museo",
                  eventType: "museum",
                  apiCall: "Museo",
                },
              })
            }
            className="text-gray-100 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Museo
          </span>
        </nav>
      </div>
    </header>
  );
};

export default Header;

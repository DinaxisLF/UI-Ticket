import React from "react";
import Logo from "../assets/logo.png";
import Cover from "../assets/concert-cover.jpg";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleLogIn = () => {
    navigate("/login", {
      replace: true,
      state: { from: "home" },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative rounded-2xl overflow-hidden border-4 border-white/20">
          <div className="relative">
            <img
              src={Cover}
              alt="Event Cover"
              className="w-full h-90 object-cover"
            />

            <div className="absolute inset-0 bg-black/40"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <h1 className="text-5xl md:text-5xl font-bold text-white drop-shadow-lg">
                Bienvenido
              </h1>
              <p className="text-xl md:text-2xl text-white font-medium max-w-2xl drop-shadow-md">
                A tan solo unos clicks de tu evento
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 text-center">
          <p className="text-gray-600 font-bold">
            Descubre los eventos más emocionantes cerca de ti
          </p>
          <button
            type="submit"
            onClick={handleLogIn}
            className="bg-blue-600 text-white mt-5 py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-105"
          >
            Iniciar Sesion
          </button>
        </div>
      </div>
    </div>
  );
}

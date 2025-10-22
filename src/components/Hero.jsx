import Cover from "../assets/concert-cover.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden border-rounded-lg">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={Cover}
          alt="Concert background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-transparent"></div>
      </div>

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/30 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute top-1/3 right-1/4 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-pink-500/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 text-center px-6 animate-fade-in-up max-w-4xl">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white leading-tight">
          Tus Eventos
        </h1>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Favoritos
          </span>
        </h2>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-medium">
          Vive experiencias únicas en teatro, cine y museos
        </p>
        <button className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-lg font-bold rounded-lg transition-all duration-300 hover:from-cyan-600 hover:to-purple-700 hover:scale-105 transform shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 cursor-pointer">
          <Link to="/menu">Explorar Eventos</Link>
        </button>
      </div>
    </section>
  );
};

export default Hero;

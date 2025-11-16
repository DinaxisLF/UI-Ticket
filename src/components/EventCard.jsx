import { useNavigate } from "react-router-dom";
import TheaterImage from "../assets/teatro.jpg";
import MuseumImage from "../assets/museo.jpg";
import CinemaImage from "../assets/cine.jpg";

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const ticketsPage = (eventType) => {
    switch (eventType) {
      case "theater":
        return "/buyTheater";
      case "museum":
        return "/buyMuseum";
      case "cinema":
        return "/buyCinema";
      default:
        return "/buyTheater";
    }
  };

  const handleGoToTickets = () => {
    navigate(ticketsPage(event.tipo_evento), {
      state: {
        eventData: event,
      },
    });
  };

  // Icon Components
  const CalendarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-cyan-400"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  const ClockIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-400"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );

  const MapPinIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-purple-400"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case "cinema":
        return "from-cyan-400 to-blue-500";
      case "theater":
        return "from-purple-500 to-pink-500";
      case "museum":
        return "from-green-400 to-cyan-500";
      default:
        return "from-cyan-400 to-purple-500";
    }
  };

  const getPrice = (category) => {
    switch (category) {
      case "cinema":
        return "12.99";
      case "theater":
        return "1500";
      case "museum":
        return "15.00";
      default:
        return "10.00";
    }
  };

  const getImage = (eventType) => {
    switch (eventType) {
      case "theater":
        return TheaterImage;
      case "museum":
        return MuseumImage;
      case "cinema":
        return CinemaImage;
      default:
        return TheaterImage;
    }
  };

  return (
    <div className="group relative bg-gray-900 border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
      {/* Price Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className={`px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(
            event.tipo_evento
          )} text-white font-bold text-sm shadow-lg`}
        >
          ${getPrice(event.tipo_evento)}
        </div>
      </div>

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImage(event.tipo_evento)}
          alt={event.nombre_evento}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
          {event.nombre_evento}
        </h3>

        <div className="space-y-2 text-gray-400">
          <div className="flex items-center space-x-2">
            <ClockIcon />
            <span className="text-sm">{event.time}</span>
          </div>

          <div className="flex items-center space-x-2">
            <CalendarIcon />
            <span className="text-sm capitalize">{event.date}</span>
          </div>

          <div className="flex items-center space-x-2">
            <MapPinIcon />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>

        <button
          onClick={handleGoToTickets}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md font-medium transition-all hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
        >
          Comprar Entradas
        </button>
      </div>
    </div>
  );
};

export default EventCard;

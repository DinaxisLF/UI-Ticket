import TheaterImage from "../assets/teatro.jpg";
import cinemaImage from "../assets/cine.jpg";
import MuseumImage from "../assets/museo.jpg";
import TitleHeader from "./TitleHeader";
import { useNavigate } from "react-router-dom";

const EventCard = ({ title, image, link, eventType, onCardClick, apiCall }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("Card clicked with:", { eventType, apiCall, title });
    if (onCardClick) {
      onCardClick(eventType);
    } else {
      navigate(`/${link}`, {
        state: {
          title: title,
          eventType: eventType,
          apiCall: apiCall, // Make sure this is passed
        },
      });
    }
  };

  return (
    <div className="group relative bg-gray-900 border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
      </div>

      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 text-center transition-colors">
          {title}
        </h3>

        <button
          onClick={handleClick}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md font-medium transition-all hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
        >
          Comprar Boletos
        </button>
      </div>
    </div>
  );
};

const EventsList = () => {
  const events = [
    {
      title: "Boletos Teatro",
      link: "submenu",
      image: TheaterImage,
      eventType: "theater",
      apiCall: "Teatro",
    },
    {
      title: "Boletos Cine",
      link: "submenu",
      image: cinemaImage,
      eventType: "cinema",
      apiCall: "Cine",
    },
    {
      title: "Boletos Museo",
      link: "submenu",
      image: MuseumImage,
      eventType: "museum",
      apiCall: "Museo",
    },
  ];

  return (
    <section className="px-6 bg-gray-900">
      <div className="container mx-auto">
        <TitleHeader title="Explora Eventos" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {events.map((event, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <EventCard {...event} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsList;

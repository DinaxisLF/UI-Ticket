import React from "react";
import { useNavigate } from "react-router-dom";

const OptionCard = ({
  id,
  imageUrl,
  eventName,
  eventLocation,
  buttonText = "Ver Eventos",
  link,
  type,
}) => {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-gray-900 border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={eventName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Event Details */}
      <div className="p-6 space-y-4">
        {/* Event Name */}
        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 text-center transition-colors">
          {eventName}
        </h3>

        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 text-center transition-colors">
          {eventLocation}
        </h3>

        {/* Action Button */}

        <button
          onClick={() => {
            if (type !== undefined) {
              navigate(`/${link}/${id}/${eventName}`);
            } else {
              navigate(`/${link}/${id}`);
            }
          }}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md font-medium transition-all hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default OptionCard;

import { useState, useEffect } from "react";
import OptionCard from "./OptionCard.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { validateDate } from "../utils/dateValidation";
import TitleHeader from "./TitleHeader.jsx";

export default function SubMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateValidation = validateDate(currentDate);

  // Get data passed from EventsList component
  const { optionsList, title, eventType } = location.state || {};

  console.log(optionsList);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getSpecialDateMessage = () => {
    if (dateValidation.isSpecialDate) {
      return {
        title: "Día Festivo",
        message:
          "El día de hoy no hay funciones programadas. ¡Disfruta tu día libre!",
        type: "special",
      };
    } else if (dateValidation.isWeekend) {
      return {
        title: "Fin de Semana",
        message:
          "En fin de semana no hay funciones programadas. ¡Relájate y disfruta!",
        type: "weekend",
      };
    }
    return null;
  };

  const specialMessage = getSpecialDateMessage();

  // If it's a special date or weekend, show only the message
  if (specialMessage) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <TitleHeader title={title || "Eventos"} />

          <div
            className={`max-w-4xl mx-auto mb-8 mt-15 p-6 rounded-lg border-l-4 ${
              specialMessage.type === "special"
                ? "bg-gray-800 border-gray-300 text-white"
                : "bg-gray-800 border-gray-400 text-white"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {specialMessage.type === "special" ? (
                  <span className="text-2xl">🎉</span>
                ) : (
                  <span className="text-2xl">📅</span>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold">
                  {specialMessage.title}
                </h3>
                <p className="mt-1 text-sm">{specialMessage.message}</p>
                <div className="mt-4 text-xs">
                  <p>• Las funciones regulares reanudan los días de semana</p>
                  <p>
                    • Consulta nuestra programación regular de lunes a viernes
                  </p>
                  <p>• ¡Te esperamos pronto!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center py-8">
            <p className="text-white mb-4">No hay eventos disponibles hoy</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg cursor-pointer"
            >
              Regresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular days - show events as normal
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <TitleHeader title={title || "Eventos"} />

        {!optionsList || optionsList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              No hay eventos disponibles
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Regresar al Dashboard
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 max-w-7xl mx-auto ${
              optionsList.length === 4
                ? "grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {optionsList.map((event) => (
              <OptionCard
                key={event.id}
                id={event.id}
                imageUrl={event.imageUrl}
                eventName={event.name}
                eventLocation={event.eventLocation}
                link={event.link || `${eventType}Events`}
                eventType={eventType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

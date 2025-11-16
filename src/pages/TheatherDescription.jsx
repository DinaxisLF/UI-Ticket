import { useParams } from "react-router-dom";
import EventCard from "../components/EventCard";
import { TheaterAPI } from "../services/api/theater.js";
import { useState, useEffect } from "react";
import TitleHeader from "../components/TitleHeader";

export default function TheatherDescription() {
  const theaterId = useParams().theaterId;
  const [apiData, setApiData] = useState([]);
  const id = parseInt(theaterId, 10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching events for theater ID:", id);

        const events = await TheaterAPI.getEventsByTheater(id);
        console.log("Events received:", events);
        setApiData(events);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(error.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(id)) {
      fetchData();
    } else {
      setError("Invalid theater ID");
      setLoading(false);
    }
  }, [id]);

  // Format the API data for the EventCard component
  const formattedEvents = apiData.map((event, index) => ({
    id: event.id || index,
    nombre_evento: event.nombre_evento,
    tipo_evento: "theater",
    ubicacion: event.ubicacion,
    // Format date and time
    date: formatDate(event.horario_inicio),
    time: formatTime(event.horario_inicio, event.horario_fin),
    location: event.ubicacion,
    horario_inicio: event.horario_inicio,
    horario_fin: event.horario_fin,
  }));

  // Helper function to format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Helper function to format time range
  function formatTime(startString, endString) {
    const start = new Date(startString);
    const end = new Date(endString);

    const startTime = start.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const endTime = end.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${startTime} - ${endTime}`;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <TitleHeader title="Teatro Colon" />
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-white text-lg">Cargando eventos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <TitleHeader title="Teatro Colon" />
          <div className="text-center py-12">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-white text-lg mb-2">
              Error al cargar los eventos
            </p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No events state
  if (!formattedEvents || formattedEvents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <TitleHeader title="Teatro Colon" />
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              No hay eventos disponibles para este teatro
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg cursor-pointer"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <TitleHeader title="Teatro Colon" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {formattedEvents.map((event, index) => (
            <div
              key={event.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

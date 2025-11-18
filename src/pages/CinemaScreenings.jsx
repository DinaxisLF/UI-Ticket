import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TitleHeader from "../components/TitleHeader";
import EventCard from "../components/EventCard";
import { CinemaAPI } from "../services/api/cinema";

export default function CinemaScreenings() {
  const { id, type } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // FIX: Remove empty spaces from the type (converts "Screen X" to "ScreenX")
        const apiType = type.replace(/\s+/g, "");

        console.log(
          `Fetching events for cinema ID: ${id}, room type: ${apiType}`
        );

        // Use apiType instead of the raw type
        const result = await CinemaAPI.getEventsByCinemaRoom(apiType, id);

        console.log("API response:", result);

        if (result.success && result.events && Array.isArray(result.events)) {
          const transformedEvents = result.events.map((event) => ({
            id: event.id,
            nombre_evento: event.nombre_evento,
            date: new Date(event.horario_inicio).toLocaleDateString("es-MX", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            time: new Date(event.horario_inicio).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Mexico_City",
            }),
            location: event.ubicacion,
            duration: calculateDuration(
              event.horario_inicio,
              event.horario_fin
            ),
            tipo_evento: "cinema",
            originalData: event,
          }));

          setEvents(transformedEvents);
        } else {
          setEvents([]);
          if (!result.success) {
            setError("No se pudieron cargar los eventos");
          }
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message || "Error al cargar los eventos");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    if (id && type) {
      fetchEvents();
    }
  }, [id, type]);

  // Helper function to calculate duration
  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime - startTime;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatRoomType = (roomType) => {
    const roomNames = {
      tradicional: "Sala Tradicional",
      plus: "Sala Plus",
      vip: "Sala VIP",
      "macro-xe": "Sala MACRO XE",
      junior: "Sala Junior",
      "4dx": "Sala 4DX",
      imax: "Sala IMAX",
      vr: "Sala VR",
      "screen-x": "Sala Screen X",
    };

    return roomNames[roomType] || roomType;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <TitleHeader title={formatRoomType(type)} />
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-white text-lg">Cargando proyecciones...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <TitleHeader title={formatRoomType(type)} />
          <div className="flex justify-center items-center py-12">
            <div className="text-center bg-red-900 border border-red-700 rounded-lg p-6 max-w-md">
              <svg
                className="w-12 h-12 text-red-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">Error</h3>

              <p className="text-red-200">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <TitleHeader title={formatRoomType(type)} />
          <div className="flex justify-center items-center py-12">
            <div className="text-center bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">
                No hay proyecciones disponibles
              </h3>
              <p className="text-gray-400">
                No se encontraron funciones programadas para esta sala.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show events
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <TitleHeader title={formatRoomType(type)} />

        {/* Events count and filter info */}
        <div className="mb-6 text-center">
          <p className="text-gray-400">
            {events.length} función{events.length !== 1 ? "es" : ""} programada
            {events.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

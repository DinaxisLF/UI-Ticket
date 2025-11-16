import React from "react";
import { useLocation } from "react-router-dom";
import TheaterImage from "../assets/teatro.jpg";
import MuseumImage from "../assets/museo.jpg"; // Asegúrate de tener esta imagen
import TitleHeader from "../components/TitleHeader";

export default function PurchaseSummary() {
  const location = useLocation();
  const {
    selectedSeats,
    ticketTypes,
    total,
    eventData,
    paymentMethod,
    transaccion_id,
    transaccion,
    isMuseum,
  } = location.state || {};

  const getVisitDate = () => {
    if (isMuseum) {
      // Para museos, usar fecha actual (fecha de compra)
      return new Date().toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      // Para teatro/cine, usar horario_inicio que está en formato ISO
      const rawDate = eventData?.horario_inicio;
      if (rawDate) {
        return new Date(rawDate).toLocaleDateString("es-MX", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else {
        return eventData?.date || "Fecha por confirmar";
      }
      return "Fecha por confirmar";
    }
  };

  // Obtener imagen basada en tipo de evento
  const getEventImage = () => {
    return isMuseum ? MuseumImage : TheaterImage;
  };

  // Obtener título del evento
  const getEventTitle = () => {
    return (
      eventData?.nombre_evento ||
      eventData?.title ||
      eventData?.lugar ||
      "Evento"
    );
  };

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No purchase data found
          </h2>
          <p className="text-gray-600">
            Please complete your purchase process.
          </p>
        </div>
      </div>
    );
  }

  const formatSeatDisplay = (seatId) => {
    const [section, row, col] = seatId.split("-");
    const sectionNames = {
      general: "General",
      platea: "Platea",
      palco: "Palco",
      balcon: "Balcón",
    };
    return `${sectionNames[section] || section} ${String.fromCharCode(
      65 + parseInt(row)
    )}${parseInt(col) + 1}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <TitleHeader title="Resumen de Compra" />

        {/* Success Message */}
        <div className="bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-green-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-green-400">
                ¡Compra Exitosa!
              </h3>
              <p className="text-green-300 text-sm">
                Tu transacción ha sido procesada correctamente
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Information */}
          <div className="bg-gray-700 border border-gray-600 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <img
              src={getEventImage()}
              alt={getEventTitle()}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                {getEventTitle()}
              </h3>

              {/* Información específica para museos */}
              {isMuseum && (
                <div className="mb-4 p-3 bg-green-900 bg-opacity-20 rounded-lg border border-green-700">
                  <div className="flex items-center text-green-300">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span className="text-sm font-semibold">
                      Entrada General - Acceso Todo el Día
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-cyan-400 mr-3"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <div className="space-y-1">
                    <span className="text-white font-medium">
                      Fecha de {isMuseum ? "Visita" : "Evento"}:
                    </span>
                    <div className="text-cyan-300">{getVisitDate()}</div>
                  </div>
                </div>

                {eventData.time && (
                  <div className="flex items-center text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400 mr-3"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <div className="space-y-1">
                      <span className="text-white font-medium">Horario:</span>
                      <div className="text-blue-300">
                        {isMuseum
                          ? "Horario de apertura del museo"
                          : eventData.time}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-400 mr-3"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <div className="space-y-1">
                    <span className="text-white font-medium">Ubicación:</span>
                    <div className="text-purple-300">
                      {eventData?.ubicacion ||
                        eventData?.location ||
                        "Ubicación no especificada"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de transacción */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="text-sm text-gray-400">
                  <div className="flex justify-between mb-1">
                    <span>ID Transacción:</span>
                    <span className="text-white font-mono">
                      #{transaccion_id || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Método de Pago:</span>
                    <span className="text-white">
                      {paymentMethod || "No especificado"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">
                Detalles de tu {isMuseum ? "Entrada" : "Compra"}
              </h3>

              {/* Tickets Summary */}
              <div className="mb-6">
                <h4 className="font-medium text-white mb-3">
                  {isMuseum ? "Entradas" : "Boletos"}
                </h4>
                <div className="space-y-3">
                  {ticketTypes &&
                    ticketTypes.map((ticket, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-700 rounded-lg"
                      >
                        <div>
                          <span className="text-white font-semibold">
                            {ticket.quantity} x {ticket.name}
                          </span>
                          {isMuseum && (
                            <p className="text-sm text-gray-400 mt-1">
                              Válido para {getVisitDate()}
                            </p>
                          )}
                        </div>
                        <span className="text-green-400 font-bold">
                          ${(ticket.price * ticket.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Seats Summary - Solo para no museos */}
              {!isMuseum && selectedSeats && selectedSeats.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-3">
                    Asientos seleccionados
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat, index) => (
                      <span
                        key={index}
                        className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full"
                      >
                        {formatSeatDisplay(seat)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Información adicional para museos */}
              {isMuseum && (
                <div className="mb-6 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-300 mb-2">
                    Información para tu Visita
                  </h4>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Presenta este comprobante en la entrada</li>
                    <li>• Válido únicamente para {getVisitDate()}</li>
                    <li>• Acceso durante el horario de apertura</li>
                    <li>• No reembolsable</li>
                  </ul>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-600 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-green-500">
                    ${total ? total.toFixed(2) : "0.00"}
                  </span>
                </div>
                {isMuseum && (
                  <p className="text-sm text-gray-400 mt-2 text-right">
                    {ticketTypes?.reduce(
                      (sum, ticket) => sum + ticket.quantity,
                      0
                    )}{" "}
                    entrada(s) • Acceso para todo el día
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors cursor-pointer"
                >
                  Imprimir Comprobante
                </button>
                <button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

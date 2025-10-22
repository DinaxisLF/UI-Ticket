import React from "react";
import { useLocation } from "react-router-dom";
import TheaterImage from "../assets/teatro.jpg";
import TitleHeader from "../components/TitleHeader";

export default function PurchaseSummary() {
  const location = useLocation();
  const { selectedSeats, ticketTypes, total, eventData } = location.state || {};

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
        <TitleHeader title="Resumen" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Information */}
          <div className=" bg-gray-700 border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <img
              src={TheaterImage}
              alt={eventData.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {eventData.title}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
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
                  <div className="space-y-2 text-gray-400">
                    <span>{eventData.date}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
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
                  <div className="space-y-2 text-gray-400">
                    <span>{eventData.time}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
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
                  <div className="space-y-2 text-gray-400">
                    <span>{eventData.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Purchase Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border border-gray-500 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-6">
                Detalles de tu compra
              </h3>

              {/* Tickets Summary */}
              <div className="mb-6">
                <h4 className="font-medium text-white group-hover:text-cyan-300 transition-colors mb-3">
                  Boletos
                </h4>
                <div className="space-y-2">
                  {ticketTypes &&
                    ticketTypes.map((ticket, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm font-bold text-white group-hover:text-cyan-300 transition-colors p-2 bg-gray-800 rounded"
                      >
                        <span>
                          {ticket.quantity} x {ticket.name} ({ticket.section})
                        </span>
                        <span className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                          ${(ticket.price * ticket.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Seats Summary */}
              {selectedSeats && selectedSeats.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-white group-hover:text-cyan-300 transition-colors0 mb-3">
                    Asientos seleccionados
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                      >
                        {formatSeatDisplay(seat)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ${total ? total.toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 border bg-gray-300 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Imprimir Comprobante
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
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

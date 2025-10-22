import React, { useState } from "react";
import TheaterImage from "../assets/teatro.jpg";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import TitleHeader from "../components/TitleHeader";

export default function TheaterTickets() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventData } = location.state || {};

  const [ticketTypes, setTicketTypes] = useState([
    { id: 1, name: "Platea", price: 3000, quantity: 0, section: "platea" },
    { id: 2, name: "Palco", price: 2800, quantity: 0, section: "palco" },
    { id: 3, name: "Balcon", price: 2500, quantity: 0, section: "balcon" },
    { id: 4, name: "General", price: 1500, quantity: 0, section: "general" },
  ]);

  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedSections, setSelectedSections] = useState(new Set());

  // Define seat arrays for different sections with realistic layouts
  const sectionSeats = {
    general: {
      name: "General",
      price: 1500,
      rows: 5,
      cols: 20,
      occupied: [
        [0, 3],
        [0, 6],
        [0, 15],
        [0, 16],
        [1, 5],
        [1, 4],
        [1, 17],
        [2, 8],
        [2, 1],
        [2, 18],
        [3, 2],
        [3, 7],
        [3, 19],
        [4, 6],
        [4, 3],
        [4, 14],
      ],
    },
    platea: {
      name: "Platea",
      price: 3000,
      rows: 5,
      cols: 4,
      occupied: [
        [0, 2],
        [0, 3],
        [1, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 0],
        [4, 1],
      ],
    },
    palco: {
      name: "Palco",
      price: 2800,
      rows: 3,
      cols: 4,
      occupied: [
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 3],
        [2, 1],
        [2, 2],
      ],
    },
    balcon: {
      name: "Balcon",
      price: 2500,
      rows: 5,
      cols: 6,
      occupied: [
        [0, 2],
        [0, 3],
        [1, 1],
        [1, 4],
        [2, 0],
        [2, 5],
        [3, 2],
        [3, 3],
        [4, 1],
        [4, 4],
      ],
    },
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 0) return;

    setTicketTypes((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, quantity: newQuantity } : ticket
      )
    );
  };

  const calculateTotal = () => {
    return ticketTypes.reduce(
      (total, ticket) => total + ticket.price * ticket.quantity,
      0
    );
  };

  const getTotalTickets = () => {
    return ticketTypes.reduce((total, ticket) => total + ticket.quantity, 0);
  };

  const getTicketsBySection = (section) => {
    return ticketTypes
      .filter((ticket) => ticket.section === section && ticket.quantity > 0)
      .reduce((total, ticket) => total + ticket.quantity, 0);
  };

  const handlePurchase = () => {
    const selectedTickets = ticketTypes.filter((ticket) => ticket.quantity > 0);
    if (selectedTickets.length === 0) {
      alert("Por favor selecciona al menos un boleto");
      return;
    }

    // Get all sections with selected tickets
    const sections = new Set(selectedTickets.map((ticket) => ticket.section));
    setSelectedSections(sections);
    setShowSeatModal(true);
  };

  const handleSeatSelection = (section, row, col) => {
    // Check if seat is occupied
    if (
      sectionSeats[section].occupied.some(([r, c]) => r === row && c === col)
    ) {
      alert("Este asiento ya está ocupado. Por favor selecciona otro.");
      return;
    }

    const seatId = `${section}-${row}-${col}`;
    const sectionTickets = getTicketsBySection(section);
    const sectionSelectedSeats = selectedSeats.filter((seat) =>
      seat.startsWith(section)
    );

    // Check if user is trying to select more seats than tickets for this section
    if (
      sectionSelectedSeats.length >= sectionTickets &&
      !selectedSeats.includes(seatId)
    ) {
      alert(
        `Solo puedes seleccionar ${sectionTickets} asiento(s) para la sección ${sectionSeats[section].name}.`
      );
      return;
    }

    // Toggle seat selection
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const confirmSeatSelection = () => {
    // Check if each section has the correct number of seats selected
    let isValid = true;
    let errorMessage = "";

    selectedSections.forEach((section) => {
      const sectionTickets = getTicketsBySection(section);
      const sectionSelectedSeats = selectedSeats.filter((seat) =>
        seat.startsWith(section)
      );

      if (sectionSelectedSeats.length !== sectionTickets) {
        isValid = false;
        errorMessage += `Debes seleccionar ${sectionTickets} asiento(s) para la sección ${sectionSeats[section].name}.\n`;
      }
    });

    if (!isValid) {
      alert(errorMessage);
      return;
    }

    // Process payment with section information
    console.log("Asientos seleccionados:", selectedSeats);
    navigate("/purchaseSummary", {
      state: {
        selectedSeats,
        ticketTypes: ticketTypes.filter((t) => t.quantity > 0),
        total: calculateTotal(),
        eventData,
      },
    });

    // Close modal and reset
    setShowSeatModal(false);
    setSelectedSeats([]);
    setSelectedSections(new Set());
  };

  // Render a single seat
  const renderSeat = (section, row, col) => {
    const isOccupied = sectionSeats[section].occupied.some(
      ([r, c]) => r === row && c === col
    );
    const isSelected = selectedSeats.includes(`${section}-${row}-${col}`);
    const hasTickets = getTicketsBySection(section) > 0;

    return (
      <button
        key={`${section}-${row}-${col}`}
        onClick={() => handleSeatSelection(section, row, col)}
        disabled={isOccupied || !hasTickets}
        className={`
          w-6 h-6 m-1 rounded-sm text-xs flex items-center justify-center
          ${
            isOccupied
              ? "bg-red-500 cursor-not-allowed"
              : !hasTickets
              ? "bg-gray-300 cursor-not-allowed"
              : isSelected
              ? "bg-green-500 text-white"
              : "bg-blue-200 hover:bg-blue-300"
          }
        `}
        title={
          isOccupied
            ? "Ocupado"
            : !hasTickets
            ? "No hay boletos seleccionados para esta sección"
            : `${sectionSeats[section].name} ${String.fromCharCode(65 + row)}${
                col + 1
              }`
        }
      >
        {isOccupied ? "X" : col + 1}
      </button>
    );
  };

  // Render a section with its seats
  const renderSection = (sectionKey) => {
    const section = sectionSeats[sectionKey];
    const rows = [];
    const hasTickets = getTicketsBySection(sectionKey) > 0;

    for (let row = 0; row < section.rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < section.cols; col++) {
        rowSeats.push(renderSeat(sectionKey, row, col));
      }
      rows.push(
        <div key={row} className="flex items-center justify-center bg-gray-700">
          <span className="w-6 text-center font-medium text-sm mr-2">
            {String.fromCharCode(65 + row)}
          </span>
          {rowSeats}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {hasTickets && (
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                {getTicketsBySection(sectionKey)} seleccionados
              </span>
            )}
          </div>
        </div>
        <div
          className={`bg-gray-900 p-3 rounded-lg flex flex-col items-center ${
            !hasTickets ? "opacity-60" : ""
          }`}
        >
          {rows}
        </div>
      </div>
    );
  };

  // Render the complete theater layout
  const renderTheaterLayout = () => {
    return (
      <div className="p-4 bg-gray-700 rounded-lg">
        {/* Stage */}
        <div className="text-center mb-8">
          <div className="bg-gray-800 text-white py-4 rounded">
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              ESCENARIO
            </h3>
          </div>
        </div>

        {/* Upper Sections */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          {/* Left Balcony */}
          <div className="text-center">
            <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
              Balcón Izquierdo
            </h4>
            {renderSection("balcon")}
          </div>

          {/* Palco Sections */}
          <div className="text-center">
            <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
              Palco
            </h4>
            {renderSection("palco")}
          </div>

          {/* Right Balcony */}
          <div className="text-center">
            <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
              Balcón Derecho
            </h4>
            {renderSection("balcon")}
          </div>
        </div>

        {/* Platea Section */}
        <div className="text-center mb-8">
          <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
            Platea
          </h4>
          {renderSection("platea")}
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-300 border-dashed my-8"></div>

        {/* General Section */}
        <div className="text-center">
          <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
            General
          </h4>
          {renderSection("general")}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors mb-3">
            Leyenda:
          </h4>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-200 rounded-sm mr-2"></div>
              <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Disponible
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 rounded-sm mr-2"></div>
              <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Seleccionado
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-500 rounded-sm mr-2"></div>
              <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Ocupado
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 rounded-sm mr-2"></div>
              <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Sin boletos
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTicketType = (ticket) => {
    const sectionInfo = sectionSeats[ticket.section];

    return (
      <div
        key={ticket.id}
        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
      >
        <div className="flex-1">
          <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors">
            {ticket.name}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-green-500 font-semibold">
              ${ticket.price.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => updateQuantity(ticket.id, ticket.quantity - 1)}
            disabled={ticket.quantity === 0}
            className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>

          <span className="w-8 text-center font-bold text-white group-hover:text-cyan-300 transition-colors">
            {ticket.quantity}
          </span>

          <button
            onClick={() => updateQuantity(ticket.id, ticket.quantity + 1)}
            className="w-8 h-8 rounded-full bg-blue-600 text-white"
          >
            +
          </button>
        </div>

        <div className="w-20 text-right">
          <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
            ${(ticket.price * ticket.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <TitleHeader title="Comprar Boletos" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Information */}
          <div className="lg:col-span-1">
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

                {/* Section Legend */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-xl mb-4 font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Secciones disponibles:
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.values(sectionSeats).map((section) => (
                      <div key={section.name} className="flex justify-between">
                        <span className="text-m font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {section.name}
                        </span>
                        <span className="text-m font-bold text-white group-hover:text-cyan-300 transition-colors">
                          ${section.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Selection */}
          <div className="lg:col-span-2">
            <div className="bg-gray-700 border-gray-700 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-6">
                Selecciona tus boletos
              </h3>

              <div className="space-y-6">
                {ticketTypes.map(renderTicketType)}
              </div>

              {/* Order Summary */}
              <div className="mt-8 p-6 bg-gray-700 rounded-lg">
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-4">
                  Resumen de compra
                </h4>

                <div className="space-y-2">
                  {ticketTypes
                    .filter((ticket) => ticket.quantity > 0)
                    .map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex justify-between text-sm font-bold text-white group-hover:text-cyan-300 transition-colors"
                      >
                        <span>
                          {ticket.quantity} x {ticket.name} (
                          {sectionSeats[ticket.section].name})
                        </span>
                        <span>
                          ${(ticket.price * ticket.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between font-bold text-white group-hover:text-cyan-300 transition-colors text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {getTotalTickets()} boleto
                    {getTotalTickets() !== 1 ? "s" : ""}
                  </p>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={getTotalTickets() === 0}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Seleccionar Asientos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Selection Modal */}
      {showSeatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-700 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Selección de Asientos
                </h3>
                <button
                  onClick={() => {
                    setShowSeatModal(false);
                    setSelectedSeats([]);
                    setSelectedSections(new Set());
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                  Resumen de tu compra:
                </h4>
                <div className="bg-gray-900 p-4 rounded-lg">
                  {ticketTypes
                    .filter((ticket) => ticket.quantity > 0)
                    .map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex justify-between font-bold text-white group-hover:text-cyan-300 transition-colors mb-1"
                      >
                        <span>
                          {ticket.quantity} x {ticket.name} (
                          {sectionSeats[ticket.section].name})
                        </span>
                        <span>
                          ${(ticket.price * ticket.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  <div className="border-t border-gray-200 mt-2 pt-2 font-semibold">
                    <div className="flex justify-between font-bold text-white group-hover:text-cyan-300 transition-colors">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      <span>Asientos a seleccionar:</span>
                      <span>{getTotalTickets()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {renderTheaterLayout()}

              <div className="mt-6">
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                  Tus asientos seleccionados:
                </h4>
                {selectedSeats.length > 0 ? (
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="font-medium font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {selectedSeats
                        .map((seat) => {
                          const [section, row, col] = seat.split("-");
                          return `${
                            sectionSeats[section].name
                          } ${String.fromCharCode(65 + parseInt(row))}${
                            parseInt(col) + 1
                          }`;
                        })
                        .join(", ")}
                    </p>
                    <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mt-1">
                      {selectedSeats.length} de {getTotalTickets()} asientos
                      seleccionados
                    </p>
                  </div>
                ) : (
                  <p className="font-medium font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Aún no has seleccionado ningún asiento.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowSeatModal(false);
                    setSelectedSeats([]);
                    setSelectedSections(new Set());
                  }}
                  className="px-4 py-2 border bg-gray-50 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmSeatSelection}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  Confirmar Asientos y Pagar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

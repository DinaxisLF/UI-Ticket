import React, { useState, useEffect } from "react";
import MuseumImage from "../assets/museo.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import TitleHeader from "../components/TitleHeader.jsx";
import { MuseumAPI } from "../services/api/museum.js";

export default function MuseumTickets() {
  const navigate = useNavigate();
  const location = useLocation();
  const museumId = location.state?.museumId;

  console.log("Museum ID from location state:", museumId);

  const [ticketTypes, setTicketTypes] = useState([]);
  const [availableTickets, setAvailableTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [museumData, setMuseumData] = useState(null);

  const MAX_TICKETS_PER_TYPE = 8;

  // Fetch museum availability from API using museumId
  const fetchMuseumAvailability = async () => {
    try {
      setLoading(true);

      if (!museumId) {
        console.warn("No museum ID provided, using fallback");
        const fallbackTicketTypes = [
          {
            id: 1,
            name: "General",
            price: 200,
            quantity: 0,
          },
        ];
        setTicketTypes(fallbackTicketTypes);
        setAvailableTickets(50);
        setMuseumData({
          nombre: "Museo",
          ubicacion: "Ubicación no disponible",
          precio: 200,
        });
        return;
      }

      const response = await MuseumAPI.getAvailability(museumId);
      console.log("Museum API response:", response);

      let availabilityData = response.data || response;

      if (!availabilityData) {
        console.warn("No museum data found, using fallback");
        availabilityData = {
          nombre_evento: "Entrada General - Museo",
          lugar: "Museo",
          ubicacion: "Ubicación no disponible",
          precio: 200,
          espacios_disponibles: 50,
        };
      }

      // Set museum data for display
      setMuseumData({
        id: availabilityData.event_id,
        nombre_evento:
          availabilityData.nombre_evento || "Entrada General - Museo",
        lugar: availabilityData.lugar || "Museo",
        ubicacion: availabilityData.ubicacion || "Ubicación no disponible",
        precio: availabilityData.precio || 200,
        horario_inicio:
          availabilityData.horario_inicio || new Date().toISOString(),
        tipo_evento: "museum",
      });

      console.log("Fetched museum data:", availabilityData);

      // Initialize ticket types for museum (only General category)
      const museumTicketTypes = [
        {
          id: 1,
          name: "General",
          price: parseFloat(availabilityData.precio) || 200,
          quantity: 0,
        },
      ];

      console.log("Museum ticket types:", museumTicketTypes);
      setTicketTypes(museumTicketTypes);
      setAvailableTickets(availabilityData.espacios_disponibles || 50);
    } catch (error) {
      console.error("Error fetching museum availability:", error);
      // Fallback data
      const fallbackTicketTypes = [
        {
          id: 1,
          name: "General",
          price: 200,
          quantity: 0,
        },
      ];
      setTicketTypes(fallbackTicketTypes);
      setAvailableTickets(50);
      setMuseumData({
        nombre_evento: "Entrada General - Museo",
        lugar: "Museo",
        ubicacion: "Ubicación no disponible",
        precio: 200,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load availability on component mount
  useEffect(() => {
    fetchMuseumAvailability();
  }, [museumId]);

  const handleIncrement = (id) => {
    setTicketTypes((prevTypes) =>
      prevTypes.map((ticket) =>
        ticket.id === id &&
        ticket.quantity < MAX_TICKETS_PER_TYPE &&
        ticket.quantity < availableTickets
          ? { ...ticket, quantity: ticket.quantity + 1 }
          : ticket
      )
    );
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 0 || newQuantity > availableTickets) return;

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

  const handlePurchase = () => {
    const selectedTickets = ticketTypes.filter((ticket) => ticket.quantity > 0);
    if (selectedTickets.length === 0) {
      alert("Por favor selecciona al menos un boleto");
      return;
    }

    // Navigate directly to purchase summary (no seat selection for museum)
    navigate("/purchaseSummary", {
      state: {
        ticketTypes: ticketTypes.filter((t) => t.quantity > 0),
        total: calculateTotal(),
        eventData: museumData, // Use the fetched museum data
        isMuseum: true, // Flag to identify museum purchase
        museumId: museumId, // Pass the museum ID for reference
      },
    });
  };

  const renderTicketType = (ticket) => {
    const isMaxReached = ticket.quantity >= availableTickets;

    return (
      <div
        key={ticket.id}
        className="flex items-center justify-between p-6 border border-gray-200 rounded-lg bg-gray-800"
      >
        <div className="flex-1">
          <h4 className="font-bold text-white text-xl">{ticket.name}</h4>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-500 font-semibold text-lg">
              ${ticket.price.toFixed(2)}
            </span>
            <span className="text-gray-400 text-sm">
              • {availableTickets} entradas disponibles
            </span>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            Acceso general al museo con visita a todas las exhibiciones
            permanentes.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => updateQuantity(ticket.id, ticket.quantity - 1)}
            disabled={ticket.quantity === 0}
            className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold"
          >
            -
          </button>

          <span className="w-12 text-center font-bold text-white text-xl">
            {ticket.quantity}
          </span>

          <button
            onClick={() => handleIncrement(ticket.id)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold"
            disabled={isMaxReached || ticket.quantity >= MAX_TICKETS_PER_TYPE}
          >
            +
          </button>
        </div>

        <div className="w-24 text-right">
          <span className="font-bold text-white text-lg">
            ${(ticket.price * ticket.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  const getEventDetails = () => {
    if (!museumData) return null;

    return (
      <div className="space-y-3 mt-4">
        {museumData.lugar && (
          <div className="flex justify-between">
            <span className="text-white font-medium">Museo:</span>
            <span className="text-white">{museumData.lugar}</span>
          </div>
        )}
        {museumData.ubicacion && (
          <div className="flex justify-between">
            <span className="text-white font-medium">Ubicación:</span>
            <span className="text-white">{museumData.ubicacion}</span>
          </div>
        )}
        {museumData.horario_inicio && (
          <div className="flex justify-between">
            <span className="text-white font-medium">Horario:</span>
            <span className="text-white">09:00 AM - 10:00 PM</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-white font-medium">Disponibilidad:</span>
          <span className="text-green-400 font-semibold">
            {availableTickets} entradas disponibles
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">
            Cargando información del museo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <TitleHeader title="Comprar Entradas de Museo" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Information */}
          <div className="lg:col-span-1">
            <div className="bg-gray-700 border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <img
                src={MuseumImage}
                alt={museumData?.nombre_evento || "Museo"}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {museumData?.nombre_evento || "Entrada General - Museo"}
                </h3>

                {/* Event Details */}
                {getEventDetails()}

                {/* Ticket Type Info */}
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <h4 className="text-xl mb-4 font-bold text-white">
                    Tipo de Entrada:
                  </h4>
                  <div className="space-y-2 text-sm">
                    {ticketTypes.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-white font-medium text-base">
                          {ticket.name}
                        </span>
                        <span className="text-white font-semibold text-base">
                          ${ticket.price.toFixed(2)}
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
              <h3 className="text-xl font-bold text-white mb-6">
                Selecciona la cantidad de entradas
              </h3>

              <div className="space-y-6">
                {ticketTypes.map(renderTicketType)}
              </div>

              {/* Order Summary */}
              <div className="mt-8 p-6 bg-gray-800 rounded-lg">
                <h4 className="text-lg font-bold text-white mb-4">
                  Resumen de compra
                </h4>

                <div className="space-y-2">
                  {ticketTypes
                    .filter((ticket) => ticket.quantity > 0)
                    .map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex justify-between text-sm text-white"
                      >
                        <span>
                          {ticket.quantity} x {ticket.name}
                        </span>
                        <span>
                          ${(ticket.price * ticket.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="border-t border-gray-600 mt-4 pt-4">
                  <div className="flex justify-between font-bold text-white text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-white">
                    {getTotalTickets()} entrada
                    {getTotalTickets() !== 1 ? "s" : ""}
                  </p>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={getTotalTickets() === 0}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Proceder al Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

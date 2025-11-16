import React, { useState, useEffect } from "react";
import CineRoomImage from "../assets/cine-room.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import TitleHeader from "../components/TitleHeader.jsx";
import { CinemaAPI } from "../services/api/cinema.js";

export default function CinemaTickets() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventData } = location.state || {};

  const [ticketTypes, setTicketTypes] = useState([]);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedSections, setSelectedSections] = useState(new Set());
  const [sectionSeats, setSectionSeats] = useState({});
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatsError, setSeatsError] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [currentRoomType, setCurrentRoomType] = useState("");

  const MAX_TICKETS_PER_TYPE = 8;

  console.log("Cinema Event Data received:", eventData);

  // Mock data for cinema fallback with different room configurations
  const cinemaSeatsMock = {
    tradicional: {
      name: "Tradicional",
      price: 100,
      rows: 10,
      cols: 6,
      occupied: [],
    },
    plus: {
      name: "Plus",
      price: 130,
      rows: 10,
      cols: 8,
      occupied: [],
    },
    vip: {
      name: "VIP",
      price: 200,
      rows: 6,
      cols: 5,
      occupied: [],
    },
    macroxe: {
      name: "MACRO XE",
      price: 150,
      rows: 10,
      cols: 10,
      occupied: [],
    },
    junior: {
      name: "Junior",
      price: 90,
      rows: 6,
      cols: 8,
      occupied: [],
    },
    "4dx": {
      name: "4DX",
      price: 180,
      rows: 8,
      cols: 10,
      occupied: [],
    },
    imax: {
      name: "IMAX",
      price: 160,
      rows: 10,
      cols: 10,
      occupied: [],
    },
    vr: {
      name: "VR",
      price: 250,
      rows: 4,
      cols: 6,
      occupied: [],
    },
    screenx: {
      name: "Screen X",
      price: 180,
      rows: 9,
      cols: 16,
      occupied: [],
    },
  };

  // Determine room type from event data
  const getRoomTypeFromEvent = () => {
    if (!eventData) return "";

    const data = eventData.originalData;

    // Check different possible fields for room type
    const roomType = data.nombre_seccion;
    console.log("Detected room type:", roomType);

    return roomType ? roomType.toLowerCase().replace(/\s+/g, "") : "";
  };

  // Fetch cinema categories from API and filter for current room type
  const fetchCinemaCategories = async () => {
    try {
      setLoadingCategories(true);
      const roomType = getRoomTypeFromEvent();
      setCurrentRoomType(roomType);

      if (!roomType) {
        console.warn("No room type detected, using fallback");
        const fallbackTicketTypes = [
          {
            id: 1,
            name: "Tradicional",
            price: 100,
            quantity: 0,
            section: "tradicional",
          },
        ];
        setTicketTypes(fallbackTicketTypes);
        return;
      }

      const response = await CinemaAPI.getCategories();
      console.log("All cinema categories:", response);

      let categories = [];

      if (Array.isArray(response)) {
        categories = response;
      } else if (
        response &&
        response.categories &&
        Array.isArray(response.categories)
      ) {
        categories = response.categories;
      } else if (response && response.data && Array.isArray(response.data)) {
        categories = response.data;
      } else {
        console.warn("Unexpected response format:", response);
        // Fallback to basic categories
        categories = [
          {
            id_categoria: 1,
            nombre_categoria: "Tradicional",
            precio_base: 100,
          },
          { id_categoria: 2, nombre_categoria: "Plus", precio_base: 130 },
          { id_categoria: 3, nombre_categoria: "VIP", precio_base: 200 },
        ];
      }

      console.log("All categories:", categories);

      // Filter categories to only include the current room type
      const filteredCategories = categories.filter((category) => {
        const categoryKey = category.nombre_categoria
          .toLowerCase()
          .replace(/\s+/g, "");
        const matches = categoryKey === roomType;
        console.log(
          `Category ${category.nombre_categoria} (${categoryKey}) matches ${roomType}: ${matches}`
        );
        return matches;
      });

      console.log(
        "Filtered categories for current room type:",
        filteredCategories
      );

      if (filteredCategories.length === 0) {
        console.warn(
          `No categories found for room type: ${roomType}, using fallback`
        );
        // Create a fallback category based on the room type
        const fallbackCategory = {
          id_categoria: 1,
          nombre_categoria:
            roomType.charAt(0).toUpperCase() + roomType.slice(1),
          precio_base: getDefaultPriceForRoomType(roomType),
        };
        filteredCategories.push(fallbackCategory);
      }

      // Initialize ticket types for cinema (only the filtered ones)
      const cinemaTicketTypes = filteredCategories.map((category) => ({
        id: category.id_categoria || category.id,
        name: category.nombre_categoria,
        price: parseFloat(category.precio_base),
        quantity: 0,
        section: category.nombre_categoria.toLowerCase().replace(/\s+/g, ""),
      }));

      console.log("Filtered cinema ticket types:", cinemaTicketTypes);
      setTicketTypes(cinemaTicketTypes);
    } catch (error) {
      console.error("Error fetching cinema categories:", error);
      // Fallback based on detected room type
      const roomType = getRoomTypeFromEvent();
      const fallbackTicketTypes = [
        {
          id: 1,
          name: roomType
            ? roomType.charAt(0).toUpperCase() + roomType.slice(1)
            : "Tradicional",
          price: getDefaultPriceForRoomType(roomType),
          quantity: 0,
          section: roomType || "tradicional",
        },
      ];
      setTicketTypes(fallbackTicketTypes);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Helper function to get default prices for room types
  const getDefaultPriceForRoomType = (roomType) => {
    const priceMap = {
      tradicional: 100,
      plus: 130,
      vip: 200,
      macroxe: 150,
      junior: 90,
      "4dx": 180,
      imax: 160,
      vr: 250,
      screenx: 180,
    };

    return priceMap[roomType] || 100;
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCinemaCategories();
  }, []);

  const fetchSeats = async (eventId) => {
    try {
      setLoadingSeats(true);
      setSeatsError(null);
      console.log("Fetching cinema seats for event:", eventId);

      const data = await CinemaAPI.getCinemaSeats(eventId);
      console.log("Cinema API response:", data);

      let sectionsData = data.sections || data.sectionSeats || {};

      if (!sectionsData || Object.keys(sectionsData).length === 0) {
        console.warn("No cinema seats data found, using mock data");
        // Use mock data for the current room type
        const roomType = getRoomTypeFromEvent();
        const mockSection =
          cinemaSeatsMock[roomType] || cinemaSeatsMock.tradicional;
        setSectionSeats({ [roomType]: mockSection });
        return;
      }

      const transformedSeats = {};

      if (Array.isArray(sectionsData)) {
        sectionsData.forEach((section, index) => {
          const key =
            section.nombre_seccion.toLowerCase().replace(/\s+/g, "") ||
            `section${index}`;

          // Handle occupied seats - now it's already an array from backend
          let occupied0Based = [];
          try {
            if (section.ocupados && Array.isArray(section.ocupados)) {
              occupied0Based = section.ocupados.map(([row, col]) => {
                // Convert from 1-based to 0-based indexing for frontend
                return [row - 1, col - 1];
              });
            }
          } catch (error) {
            console.warn("Error parsing occupied seats:", error);
            occupied0Based = [];
          }

          console.log(
            `Section ${section.nombre_seccion} - Original occupied:`,
            section.ocupados
          );
          console.log(
            `Section ${section.nombre_seccion} - Transformed occupied:`,
            occupied0Based
          );

          transformedSeats[key] = {
            name: section.nombre_seccion,
            price: parseFloat(section.precio) || 100,
            rows: parseInt(section.filas) || 10,
            cols: parseInt(section.columnas) || 6,
            occupied: occupied0Based,
            subseccion: section.subseccion || null,
          };
        });
      }

      console.log("Transformed cinema seats:", transformedSeats);
      setSectionSeats(transformedSeats);
    } catch (err) {
      console.error("Error fetching cinema seats:", err);
      setSeatsError(err.message);
      // Use mock data for the current room type
      const roomType = getRoomTypeFromEvent();
      const mockSection =
        cinemaSeatsMock[roomType] || cinemaSeatsMock.tradicional;
      setSectionSeats({ [roomType]: mockSection });
    } finally {
      setLoadingSeats(false);
    }
  };

  // Cargar asientos cuando se abre el modal
  useEffect(() => {
    if (showSeatModal && eventData?.id) {
      fetchSeats(eventData.id);
    }
  }, [showSeatModal, eventData]);

  const handleIncrement = (id) => {
    setTicketTypes((prevTypes) =>
      prevTypes.map((ticket) =>
        ticket.id === id && ticket.quantity < MAX_TICKETS_PER_TYPE
          ? { ...ticket, quantity: ticket.quantity + 1 }
          : ticket
      )
    );
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
    if (!sectionSeats[section]) {
      alert("Sección no disponible");
      return;
    }

    // Check if seat is occupied (using 0-based coordinates)
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
    let isValid = true;
    let errorMessage = "";

    selectedSections.forEach((section) => {
      const sectionTickets = getTicketsBySection(section);
      const sectionSelectedSeats = selectedSeats.filter((seat) =>
        seat.startsWith(section)
      );

      if (sectionSelectedSeats.length !== sectionTickets) {
        isValid = false;
        errorMessage += `Debes seleccionar ${sectionTickets} asiento(s) para la sección ${
          sectionSeats[section]?.name || section
        }.\n`;
      }
    });

    if (!isValid) {
      alert(errorMessage);
      return;
    }

    console.log("Asientos seleccionados:", selectedSeats);
    navigate("/purchaseSummary", {
      state: {
        selectedSeats,
        ticketTypes: ticketTypes.filter((t) => t.quantity > 0),
        total: calculateTotal(),
        eventData,
        isCinema: true,
      },
    });

    setShowSeatModal(false);
    setSelectedSeats([]);
    setSelectedSections(new Set());
  };

  // Render a single seat
  const renderSeat = (section, row, col) => {
    if (!sectionSeats[section]) {
      return null;
    }

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

  // Render the cinema section with its seats
  const renderCinemaSection = () => {
    if (!sectionSeats || Object.keys(sectionSeats).length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-white">No hay datos de asientos disponibles</p>
        </div>
      );
    }

    // Get the first (and only) section
    const sectionKey = Object.keys(sectionSeats)[0];
    const section = sectionSeats[sectionKey];

    if (!section) {
      return (
        <div className="text-center p-4 bg-gray-800 rounded-lg">
          <p className="text-white">Sala no disponible</p>
        </div>
      );
    }

    const rows = [];
    const hasTickets = getTicketsBySection(sectionKey) > 0;

    for (let row = 0; row < section.rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < section.cols; col++) {
        rowSeats.push(renderSeat(sectionKey, row, col));
      }
      rows.push(
        <div key={row} className="flex items-center justify-center bg-gray-700">
          <span className="w-6 text-center font-medium text-sm mr-2 text-white">
            {String.fromCharCode(65 + row)}
          </span>
          {rowSeats}
        </div>
      );
    }

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-white text-lg">{section.name}</h4>
          <div className="flex items-center gap-3">
            {hasTickets && (
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                {getTicketsBySection(sectionKey)} seleccionados
              </span>
            )}
            <span className="text-sm text-white font-semibold">
              ${section.price}
            </span>
          </div>
        </div>
        <div
          className={`bg-gray-900 p-4 rounded-lg flex flex-col items-center ${
            !hasTickets ? "opacity-60" : ""
          }`}
        >
          {rows}
        </div>
      </div>
    );
  };

  // Render the complete cinema layout
  const renderCinemaLayout = () => {
    if (loadingSeats) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-white">Cargando asientos...</p>
          </div>
        </div>
      );
    }

    if (seatsError) {
      return (
        <div className="text-center p-4 bg-red-100 border border-red-400 rounded-lg">
          <p className="text-red-700">
            Error al cargar los asientos: {seatsError}
          </p>
          <p className="text-red-600 text-sm mt-2">
            Usando datos de demostración
          </p>
        </div>
      );
    }

    return (
      <div className="p-6 bg-gray-700 rounded-lg">
        {/* Screen */}
        <div className="text-center mb-8">
          <div className="bg-gray-800 text-white py-4 rounded">
            <h3 className="text-xl font-bold text-white">PANTALLA</h3>
          </div>
        </div>

        {/* Cinema Section */}
        {renderCinemaSection()}

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-bold text-white mb-3">Leyenda:</h4>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-200 rounded-sm mr-2"></div>
              <span className="text-sm font-bold text-white">Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 rounded-sm mr-2"></div>
              <span className="text-sm font-bold text-white">Seleccionado</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-500 rounded-sm mr-2"></div>
              <span className="text-sm font-bold text-white">Ocupado</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 rounded-sm mr-2"></div>
              <span className="text-sm font-bold text-white">Sin boletos</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTicketType = (ticket) => {
    return (
      <div
        key={ticket.id}
        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-800"
      >
        <div className="flex-1">
          <h4 className="font-bold text-white text-lg">{ticket.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-green-500 font-semibold">
              ${ticket.price.toFixed(2)}
            </span>
            <span className="text-gray-400 text-sm">
              • {cinemaSeatsMock[ticket.section]?.rows || 10} filas ×{" "}
              {cinemaSeatsMock[ticket.section]?.cols || 6} columnas
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

          <span className="w-8 text-center font-bold text-white">
            {ticket.quantity}
          </span>

          <button
            onClick={() => handleIncrement(ticket.id)}
            className="w-8 h-8 rounded-full bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={ticket.quantity >= MAX_TICKETS_PER_TYPE}
          >
            +
          </button>
        </div>

        <div className="w-20 text-right">
          <span className="font-bold text-white">
            ${(ticket.price * ticket.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  const getEventDetails = () => {
    if (!eventData) return null;

    const data = eventData.originalData;

    return (
      <div className="space-y-3 mt-4">
        {data.ubicacion && (
          <div className="flex justify-between">
            <span className="text-white font-medium">Ubicación:</span>
            <span className="text-white">{data.ubicacion}</span>
          </div>
        )}
        {data.horario_inicio && (
          <div className="flex justify-between">
            <span className="text-white font-medium">Hora de inicio:</span>
            <span className="text-white">
              {new Date(data.horario_inicio).toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        )}
        {data.horario_inicio && (
          <div className="flex justify-between">
            <span className="text-white">
              {new Date(data.horario_inicio).toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (loadingCategories) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">
            Cargando información de la sala...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <TitleHeader title="Comprar Boletos de Cine" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Information */}
          <div className="lg:col-span-1">
            <div className="bg-gray-700 border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <img
                src={CineRoomImage}
                alt={eventData?.nombre_evento || "Película"}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {eventData?.nombre_evento || "Película"}
                </h3>

                {/* Event Details */}
                {getEventDetails()}

                {/* Room Type Info */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-xl mb-4 font-bold text-white">
                    Tipo de Sala:
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
                Selecciona tus boletos - {ticketTypes[0]?.name || "Sala"}
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

                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between font-bold text-white text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-white">
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
                <h3 className="text-2xl font-bold text-white">
                  Selección de Asientos - {ticketTypes[0]?.name || "Cine"}
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
                <h4 className="text-lg font-bold text-white mb-2">
                  Resumen de tu compra:
                </h4>
                <div className="bg-gray-900 p-4 rounded-lg">
                  {ticketTypes
                    .filter((ticket) => ticket.quantity > 0)
                    .map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex justify-between text-white mb-1"
                      >
                        <span>
                          {ticket.quantity} x {ticket.name}
                        </span>
                        <span>
                          ${(ticket.price * ticket.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  <div className="border-t border-gray-200 mt-2 pt-2 font-semibold">
                    <div className="flex justify-between text-white">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-white">
                      <span>Asientos a seleccionar:</span>
                      <span>{getTotalTickets()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {renderCinemaLayout()}

              <div className="mt-6">
                <h4 className="text-lg font-bold text-white mb-2">
                  Tus asientos seleccionados:
                </h4>
                {selectedSeats.length > 0 ? (
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="font-medium text-white">
                      {selectedSeats
                        .map((seat) => {
                          const [section, row, col] = seat.split("-");
                          const sectionName =
                            sectionSeats[section]?.name || section;
                          return `${sectionName} ${String.fromCharCode(
                            65 + parseInt(row)
                          )}${parseInt(col) + 1}`;
                        })
                        .join(", ")}
                    </p>
                    <p className="text-sm text-white mt-1">
                      {selectedSeats.length} de {getTotalTickets()} asientos
                      seleccionados
                    </p>
                  </div>
                ) : (
                  <p className="font-medium text-white">
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

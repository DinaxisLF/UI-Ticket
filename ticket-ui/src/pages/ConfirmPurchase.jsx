import React, { useState } from "react";
import TheaterImage from "../assets/teatro.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import TitleHeader from "../components/TitleHeader.jsx";
import { TransactionAPI } from "../services/api/transaction.js";

export default function ConfirmPurchase() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from navigation state
  const { selectedSeats, ticketTypes, total, eventData } = location.state || {};

  // Format seat display names
  const formatSeatDisplay = (seatId) => {
    if (!seatId) return "";
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

  // Calculate total from ticketTypes if not provided
  const calculatedTotal =
    total ||
    (ticketTypes
      ? ticketTypes.reduce(
          (sum, ticket) => sum + ticket.price * ticket.quantity,
          0
        )
      : 0);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Handle case where user navigates directly without state
  if (!eventData || !ticketTypes) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No purchase data found
          </h2>
          <p className="text-gray-600 mb-4">
            Please complete your seat selection first.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(true);
    // Reset errors when opening modal
    setErrors({
      number: "",
      name: "",
      expiry: "",
      cvv: "",
    });
  };

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiration date as MM/YY
  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, "").substring(0, 4);
    if (v.length === 0) return "";
    if (v.length <= 2) return v;
    return `${v.substring(0, 2)}/${v.substring(2)}`;
  };

  const validateCardNumber = (number) => {
    // Remove spaces for validation
    const cleanNumber = number.replace(/\s/g, "");

    if (!cleanNumber) {
      return "El número de tarjeta es requerido";
    } else if (!/^\d+$/.test(cleanNumber)) {
      return "El número de tarjeta solo debe contener dígitos";
    } else if (cleanNumber.length !== 16) {
      return "El número de tarjeta debe tener 16 dígitos";
    }
    return "";
  };

  const validateName = (name) => {
    if (!name) {
      return "El nombre del titular es requerido";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
      return "El nombre solo debe contener letras y espacios";
    }
    return "";
  };

  const validateExpiry = (expiry) => {
    if (!expiry) {
      return "La fecha de expiración es requerida";
    }

    const [month, year] = expiry.split("/");

    if (!month || !year || month.length !== 2 || year.length !== 2) {
      return "Formato inválido (use MM/AA)";
    }

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (monthNum < 1 || monthNum > 12) {
      return "Mes inválido";
    }

    if (
      yearNum < currentYear ||
      (yearNum === currentYear && monthNum < currentMonth)
    ) {
      return "La tarjeta ha expirado";
    }

    return "";
  };

  const validateCvv = (cvv) => {
    if (!cvv) {
      return "El CVV es requerido";
    } else if (!/^\d+$/.test(cvv)) {
      return "El CVV solo debe contener dígitos";
    } else if (cvv.length < 3 || cvv.length > 4) {
      return "El CVV debe tener 3 o 4 dígitos";
    }
    return "";
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply formatting based on field type
    if (name === "number") {
      formattedValue = formatCardNumber(value);
    } else if (name === "expiry") {
      formattedValue = formatExpiry(value);
    } else if (name === "cvv") {
      // Only allow digits for CVV
      formattedValue = value.replace(/\D/g, "").substring(0, 4);
    }

    setCardData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Validate in real-time but don't show error until blur
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    let error = "";

    switch (name) {
      case "number":
        error = validateCardNumber(value);
        break;
      case "name":
        error = validateName(value);
        break;
      case "expiry":
        error = validateExpiry(value);
        break;
      case "cvv":
        error = validateCvv(value);
        break;
      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const newErrors = {
      number: validateCardNumber(cardData.number),
      name: validateName(cardData.name),
      expiry: validateExpiry(cardData.expiry),
      cvv: validateCvv(cardData.cvv),
    };

    setErrors(newErrors);

    // Check if there are any errors
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setPaymentProcessing(true);

    try {
      // Obtener usuario del localStorage
      const usuario = JSON.parse(localStorage.getItem("user"));

      if (!usuario || !usuario.id) {
        throw new Error(
          "Usuario no encontrado. Por favor inicia sesión nuevamente."
        );
      }

      // Preparar datos para la transacción - CORREGIDO
      const transaccionData = {
        usuario_id: usuario.id,
        evento_id: eventData.id,
        categoria_boleto_id: getTicketCategoryId(),
        cantidad_boletos: getTotalTickets(),
        precio_unitario: calcularPrecioUnitario(),
        metodo_pago: selectedPaymentMethod === "credit" ? "tarjeta" : "tarjeta", // Usar "tarjeta" para ambos
        total_pagado: calculatedTotal,
        asientos_seleccionados: prepararAsientosSeleccionados(), // Nueva función
        secciones_info: prepararSeccionesInfo(),
      };

      console.log("Enviando transacción:", transaccionData);

      // Llamar a la API para procesar la transacción
      const resultado = await TransactionAPI.createTransaction(transaccionData);

      // Si la transacción fue exitosa
      alert("¡Pago procesado exitosamente! Su compra ha sido confirmada.");
      setShowPaymentModal(false);

      // Navigate to summary con los datos de la transacción
      navigate("/summary", {
        state: {
          selectedSeats,
          ticketTypes: ticketTypes.filter((t) => t.quantity > 0),
          total: calculatedTotal,
          eventData,
          paymentMethod:
            selectedPaymentMethod === "credit" ? "Credit Card" : "Debit Card",
          transaccion_id: resultado.transaction_id, // Cambiado a transaction_id
          transaccion: resultado.transaction, // Cambiado a transaction
        },
      });
    } catch (error) {
      console.error("Error procesando pago:", error);
      alert(`Error al procesar el pago: ${error.message}`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const getTotalTickets = () => {
    return ticketTypes.reduce((sum, ticket) => sum + ticket.quantity, 0);
  };

  const getTicketCategoryId = () => {
    const categoriasMap = {
      general: 1, // General
      balconIzquierdo: 2, // Balcon
      balconDerecho: 2, // Balcon
      palco: 3, // Palco
      platea: 4, // Platea
    };

    // Usar la primera sección seleccionada para determinar la categoría
    const primeraSeccion = selectedSeats[0]?.split("-")[0];

    if (!primeraSeccion) {
      console.warn(
        "No se encontraron asientos seleccionados, usando categoría General por defecto"
      );
      return 1;
    }

    const categoriaId = categoriasMap[primeraSeccion];

    if (!categoriaId) {
      console.warn(
        `Categoría no encontrada para sección: ${primeraSeccion}, usando General por defecto`
      );
      return 1;
    }

    console.log(
      `Usando categoría ID: ${categoriaId} para sección: ${primeraSeccion}`
    );
    return categoriaId;
  };
  const calcularPrecioUnitario = () => {
    const totalTickets = getTotalTickets();
    if (totalTickets === 0) return 0;

    // Calcular el precio promedio por ticket
    return calculatedTotal / totalTickets;
  };

  const prepararAsientosSeleccionados = () => {
    return selectedSeats.map((seatId) => {
      const [section, row, col] = seatId.split("-");

      // Convertir a números y usar 1-based indexing para el backend
      const fila = parseInt(row) + 1;
      const columna = parseInt(col) + 1;

      // Mapear nombres de sección si es necesario
      const sectionMap = {
        general: "General",
        platea: "Platea",
        palco: "Palco",
        balconIzquierdo: "Balcon",
        balconDerecho: "Balcon",
      };

      return {
        seccion: sectionMap[section] || section,
        fila: fila,
        columna: columna,
      };
    });
  };

  const prepararSeccionesInfo = () => {
    const seccionesMap = {};

    // Agrupar asientos por sección (usando 1-based indexing para el backend)
    selectedSeats.forEach((seatId) => {
      const [section, row, col] = seatId.split("-");

      // Convertir a 1-based indexing para el backend
      const fila = parseInt(row) + 1;
      const columna = parseInt(col) + 1;

      if (!seccionesMap[section]) {
        seccionesMap[section] = [];
      }

      seccionesMap[section].push({
        fila: fila,
        columna: columna,
      });
    });

    // Convertir a array para el endpoint
    return Object.keys(seccionesMap).map((seccion_key) => ({
      seccion_key: seccion_key,
      asientos: seccionesMap[seccion_key],
    }));
  };

  const handlePayPalPayment = async () => {
    setPaymentProcessing(true);

    try {
      const usuario = JSON.parse(localStorage.getItem("user"));

      if (!usuario || !usuario.id) {
        throw new Error(
          "Usuario no encontrado. Por favor inicia sesión nuevamente."
        );
      }

      const transaccionData = {
        usuario_id: usuario.id,
        evento_id: eventData.id,
        categoria_boleto_id: getTicketCategoryId(),
        cantidad_boletos: getTotalTickets(),
        precio_unitario: calcularPrecioUnitario(),
        metodo_pago: "paypal",
        total_pagado: calculatedTotal,
        asientos_seleccionados: prepararAsientosSeleccionados(), // Nueva función
        secciones_info: prepararSeccionesInfo(),
      };

      console.log("Enviando transacción PayPal:", transaccionData);

      const resultado = await TransactionAPI.createTransaction(transaccionData);

      alert(
        "¡Pago con PayPal procesado exitosamente! Su compra ha sido confirmada."
      );
      setShowPaymentModal(false);

      navigate("/summary", {
        state: {
          selectedSeats,
          ticketTypes: ticketTypes.filter((t) => t.quantity > 0),
          total: calculatedTotal,
          eventData,
          paymentMethod: "PayPal",
          transaccion_id: resultado.transaction_id, // Cambiado a transaction_id
          transaccion: resultado.transaction, // Cambiado a transaction
        },
      });
    } catch (error) {
      console.error("Error procesando pago PayPal:", error);
      alert(`Error al procesar el pago con PayPal: ${error.message}`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const renderPaymentModal = () => {
    switch (selectedPaymentMethod) {
      case "credit":
      case "debit":
        return (
          <div className="p-6 bg-gray-800 border-1 border-gray-400 rounded-lg">
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-4">
              {selectedPaymentMethod === "credit"
                ? "Tarjeta de Crédito"
                : "Tarjeta de Débito"}
            </h3>

            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  name="number"
                  value={cardData.number}
                  onChange={handleCardInputChange}
                  onBlur={handleInputBlur}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-white group-hover:text-cyan-300 transition-colors ${
                    errors.number ? "border-red-500" : "border-gray-300"
                  }`}
                  maxLength={19} // 16 digits + 3 spaces
                  required
                />
                {errors.number && (
                  <p className="mt-1 text-sm text-red-600">{errors.number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                  Nombre del Titular
                </label>
                <input
                  type="text"
                  name="name"
                  value={cardData.name}
                  onChange={handleCardInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Juan Pérez"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-white group-hover:text-cyan-300 transition-colors ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                    Fecha de Expiración (MM/AA)
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardData.expiry}
                    onChange={handleCardInputChange}
                    onBlur={handleInputBlur}
                    placeholder="MM/AA"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-white group-hover:text-cyan-300 transition-colors ${
                      errors.expiry ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={5}
                    required
                  />
                  {errors.expiry && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleCardInputChange}
                    onBlur={handleInputBlur}
                    placeholder="123"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-white group-hover:text-cyan-300 transition-colors ${
                      errors.cvv ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={4}
                    required
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer"
                >
                  {paymentProcessing ? "Procesando..." : `Pagar`}
                </button>
              </div>
            </form>
          </div>
        );

      case "paypal":
        return (
          <div className="p-6 border-1 border-gray-400 rounded-lg bg-gray-800">
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-4">
              Pago con PayPal
            </h3>

            <div className="bg-gray-900 border border-gray-400 rounded-lg p-4 mb-6 justify-center">
              <div className="flex items-center">
                <div className="bg-gray-200 p-3 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="bi bi-paypal"
                    className="w-12 h-12 text-blue-600 justify-center"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.06 3.713c.12-1.071-.093-1.832-.702-2.526C12.628.356 11.312 0 9.626 0H4.734a.7.7 0 0 0-.691.59L2.005 13.509a.42.42 0 0 0 .415.486h2.756l-.202 1.28a.628.628 0 0 0 .62.726H8.14c.429 0 .793-.31.862-.731l.025-.13.48-3.043.03-.164.001-.007a.35.35 0 0 1 .348-.297h.38c1.266 0 2.425-.256 3.345-.91q.57-.403.993-1.005a4.94 4.94 0 0 0 .88-2.195c.242-1.246.13-2.356-.57-3.154a2.7 2.7 0 0 0-.76-.59l-.094-.061ZM6.543 8.82a.7.7 0 0 1 .321-.079H8.3c2.82 0 5.027-1.144 5.672-4.456l.003-.016q.326.186.548.438c.546.623.679 1.535.45 2.71-.272 1.397-.866 2.307-1.663 2.874-.802.57-1.842.815-3.043.815h-.38a.87.87 0 0 0-.863.734l-.03.164-.48 3.043-.024.13-.001.004a.35.35 0 0 1-.348.296H5.595a.106.106 0 0 1-.105-.123l.208-1.32z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                    Serás redirigido a PayPal para completar tu pago
                  </p>
                  <p className="text-sm text-white">
                    Total a pagar: ${calculatedTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayPalPayment}
                disabled={paymentProcessing}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-400 cursor-pointer"
              >
                {paymentProcessing ? "Redirigiendo..." : "Pagar con PayPal"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <TitleHeader title="Confirmar Pago" />

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
              </div>
            </div>
          </div>

          {/* Purchase Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-700 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-6">
                Detalles de tu compra
              </h3>

              {/* Tickets Summary */}
              <div className="mb-6 bg-gray-900 p-2 rounded-lg">
                <h4 className="font-medium font-bold text-white group-hover:text-cyan-300 transition-colors mb-3">
                  Boletos
                </h4>
                <div className="space-y-2">
                  {ticketTypes
                    .filter((t) => t.quantity > 0)
                    .map((ticket, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm font-bold text-white group-hover:text-cyan-300 transition-colors p-2 bg-gray-900 rounded"
                      >
                        <span>
                          {ticket.quantity} x {ticket.name} ({ticket.section})
                        </span>
                        <span className="font-bold text-white group-hover:text-cyan-300 transition-colors mb-3">
                          ${(ticket.price * ticket.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Seats Summary */}
              {selectedSeats && selectedSeats.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium font-bold text-white group-hover:text-cyan-300 transition-colors mb-3">
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
                  <span className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ${calculatedTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h4 className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                  Selecciona método de pago
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handlePaymentMethodSelect("credit")}
                    className="p-4  bg-gray-900 border-2 border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-700 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-8 h-8 text-white mb-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                      </svg>
                      <span className="text-white">Tarjeta de Crédito</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePaymentMethodSelect("debit")}
                    className="p-4  bg-gray-900 border-2 border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-700 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-8 h-8 text-white mb-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                      </svg>
                      <span className="text-white">Tarjeta de Débito</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePaymentMethodSelect("paypal")}
                    className="p-4  bg-gray-900 border-2 border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-700 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        class="bi bi-paypal"
                        className="w-8 h-8 text-blue-600 mb-2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.06 3.713c.12-1.071-.093-1.832-.702-2.526C12.628.356 11.312 0 9.626 0H4.734a.7.7 0 0 0-.691.59L2.005 13.509a.42.42 0 0 0 .415.486h2.756l-.202 1.28a.628.628 0 0 0 .62.726H8.14c.429 0 .793-.31.862-.731l.025-.13.48-3.043.03-.164.001-.007a.35.35 0 0 1 .348-.297h.38c1.266 0 2.425-.256 3.345-.91q.57-.403.993-1.005a4.94 4.94 0 0 0 .88-2.195c.242-1.246.13-2.356-.57-3.154a2.7 2.7 0 0 0-.76-.59l-.094-.061ZM6.543 8.82a.7.7 0 0 1 .321-.079H8.3c2.82 0 5.027-1.144 5.672-4.456l.003-.016q.326.186.548.438c.546.623.679 1.535.45 2.71-.272 1.397-.866 2.307-1.663 2.874-.802.57-1.842.815-3.043.815h-.38a.87.87 0 0 0-.863.734l-.03.164-.48 3.043-.024.13-.001.004a.35.35 0 0 1-.348.296H5.595a.106.106 0 0 1-.105-.123l.208-1.32z" />
                      </svg>
                      <span className="text-white">PayPal</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gray-900 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                  <span className="text-sm text-white font-medium">
                    Tu información de pago está protegida con encriptación de
                    grado bancario.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {renderPaymentModal()}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import TheaterImage from "../assets/teatro.jpg";
import MuseumImage from "../assets/museo.jpg"; // Asegúrate de tener esta imagen
import { useNavigate, useLocation } from "react-router-dom";
import TitleHeader from "../components/TitleHeader.jsx";
import { TransactionAPI } from "../services/api/transaction.js";
import TwilioQR from "../assets/QR_Whatsapp.svg";

export default function ConfirmPurchase() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from navigation state
  const { selectedSeats, ticketTypes, total, eventData } = location.state || {};

  const isMuseumEvent = eventData?.tipo_evento === "museum";

  // Format seat display names
  const formatSeatDisplay = (seatId) => {
    if (!seatId) return "";
    const [section, row, col] = seatId.split("-");
    console.log("Eventdata in formatSeatDisplay:", eventData);
    // Complete section mapping including balcony sections
    const sectionNames = {
      general: "General",
      platea: "Platea",
      palco: "Palco",
      balconIzquierdo: "Balcón Izquierdo",
      balconDerecho: "Balcón Derecho",
      balcon: "Balcón", // Fallback
    };

    const sectionName = sectionNames[section] || section;
    const rowLetter = String.fromCharCode(65 + parseInt(row));
    const seatNumber = parseInt(col) + 1;

    return `${sectionName} ${rowLetter}${seatNumber}`;
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

  console.log(ticketTypes);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
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

  const renderQRModal = () => (
    <div className="p-6 bg-gray-800 border-1 border-gray-400 rounded-lg max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-bold text-white mb-4">
        Verificación WhatsApp Requerida
      </h3>

      <div className="text-center mb-4">
        <p className="text-white mb-6">
          Para enviarte la confirmación de tu compra, necesitamos que te unas a
          nuestro servicio de WhatsApp.
        </p>

        {/* QR Real de Twilio */}
        <div className="bg-white p-4 rounded-xl inline-block mb-6">
          <img
            src={TwilioQR} // ← Tu QR real aquí
            alt="Scan with WhatsApp"
            className="w-56 h-56 mx-auto"
          />
          <p className="text-gray-600 text-sm mt-2">Escanea con tu Camara</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-900 border border-blue-400 rounded-lg p-4">
            <h4 className="font-bold text-white mb-2">
              📲 Método alternativo:
            </h4>
            <div className="text-white text-sm space-y-2">
              <p>
                1. Abre <strong>WhatsApp</strong>
              </p>
              <p>2. Envía este código:</p>
              <div className="bg-black text-green-400 font-mono p-2 rounded text-center">
                join poor-public
              </div>
              <p>
                3. Al número: <strong>+14155238886</strong>
              </p>
            </div>
          </div>

          <div className="bg-green-900 border border-green-400 rounded-lg p-3">
            <p className="text-green-200 text-sm">
              ✅ Recibirás un mensaje de confirmación de Twilio cuando te hayas
              unido correctamente.
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-gray-800 pt-4 -mx-6 -mb-6 px-6 pb-6 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Paso 1 de 2</span>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowQRModal(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setShowQRModal(false);
                setTimeout(() => {
                  alert(
                    "Por favor verifica en tu WhatsApp que recibiste la confirmación de Twilio."
                  );
                }, 500);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer font-semibold"
            >
              Continuar al Pago
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);

    // Mostrar modal de WhatsApp primero
    setShowWhatsAppModal(true);

    // Reset states
    setWhatsappVerified(false);
    setWhatsappError("");
    setWhatsappNumber("");

    // Reset card errors
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

    // Validar WhatsApp antes de procesar
    const whatsappValidationError = validateWhatsAppNumber(whatsappNumber);
    if (whatsappValidationError) {
      setWhatsappError(whatsappValidationError);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setPaymentProcessing(true);

    try {
      const usuario = JSON.parse(localStorage.getItem("user"));

      if (!usuario || !usuario.id) {
        throw new Error(
          "Usuario no encontrado. Por favor inicia sesión nuevamente."
        );
      }

      // PREPARAR DATA DE TRANSACCIÓN CON WHATSAPP
      let transaccionData;

      if (isMuseumEvent) {
        transaccionData = {
          usuario_id: usuario.id,
          evento_id: eventData.id,
          metodo_pago:
            selectedPaymentMethod === "credit" ? "tarjeta" : "tarjeta",
          total_pagado: calculatedTotal,
          asientos_seleccionados: [],
          secciones_info: [],
          ticket_details: prepararTicketDetails(),
          tipo_evento: "Museo",
          whatsapp_number: formatWhatsAppForBackend(whatsappNumber),
          eventData: eventData,
        };
      } else {
        transaccionData = {
          usuario_id: usuario.id,
          evento_id: eventData.id,
          metodo_pago:
            selectedPaymentMethod === "credit" ? "tarjeta" : "tarjeta",
          total_pagado: calculatedTotal,
          asientos_seleccionados: prepararAsientosSeleccionados(),
          secciones_info: prepararSeccionesInfo(),
          ticket_details: prepararTicketDetails(),
          tipo_evento: "Teatro",
          whatsapp_number: formatWhatsAppForBackend(whatsappNumber),
          eventData: eventData,
        };
      }

      console.log("Enviando transacción:", transaccionData);

      const resultado = await TransactionAPI.createTransaction(transaccionData);

      alert("¡Pago procesado exitosamente! Su compra ha sido confirmada.");
      setShowPaymentModal(false);

      navigate("/summary", {
        state: {
          selectedSeats: isMuseumEvent ? [] : selectedSeats,
          ticketTypes: ticketTypes.filter((t) => t.quantity > 0),
          total: calculatedTotal,
          eventData,
          paymentMethod:
            selectedPaymentMethod === "credit" ? "Credit Card" : "Debit Card",
          transaccion_id: resultado.transaction_id,
          transaccion: resultado.transaction,
          isMuseum: isMuseumEvent,
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
    // Validar que selectedSeats exista y no esté vacío
    if (!selectedSeats || selectedSeats.length === 0) {
      return [];
    }

    return selectedSeats.map((seatId) => {
      const [section, row, col] = seatId.split("-");

      // Convertir a números y usar 1-based indexing para el backend
      const fila = parseInt(row) + 1;
      const columna = parseInt(col) + 1;

      return {
        seccion: section,
        fila: fila,
        columna: columna,
      };
    });
  };

  const prepararSeccionesInfo = () => {
    const seccionesMap = {};

    selectedSeats.forEach((seatId) => {
      const [section, row, col] = seatId.split("-");

      // NORMALIZACIÓN COMPLETA: minúsculas + sin espacios
      const normalizedSection = section.toLowerCase().replace(/\s+/g, "");
      console.log(
        `🔍 Sección original: ${section} -> normalizada: ${normalizedSection}`
      );

      const fila = parseInt(row) + 1;
      const columna = parseInt(col) + 1;

      if (!seccionesMap[normalizedSection]) {
        seccionesMap[normalizedSection] = [];
      }

      seccionesMap[normalizedSection].push({
        fila: fila,
        columna: columna,
      });
    });

    return Object.keys(seccionesMap).map((seccion_key) => ({
      seccion_key: seccion_key, // Enviar normalizado
      asientos: seccionesMap[seccion_key],
    }));
  };

  const prepararTicketDetails = () => {
    return ticketTypes
      .filter((ticket) => ticket.quantity > 0)
      .map((ticket) => ({
        categoria_boleto_id: getCategoryIdForMuseum(ticket), // Función específica para museo
        cantidad: ticket.quantity,
        precio_unitario: ticket.price,
        subtotal: ticket.price * ticket.quantity,
      }));
  };

  const getCategoryIdForMuseum = (ticket) => {
    if (isMuseumEvent) {
      return 1;
    } else if (
      eventData?.tipo_evento === "cinema" ||
      eventData?.originalData?.tipo_evento === "Cine"
    ) {
      return ticket.id;
    } else {
      // Para teatro/cine, usar la lógica existente
      return getCategoryIdBySection(ticket.section);
    }
  };

  const getCategoryIdBySection = (section) => {
    const categoriasMap = {
      general: 1,
      balconIzquierdo: 2,
      balconDerecho: 2,
      palco: 3,
      platea: 4,
    };
    return categoriasMap[section] || 1;
  };

  const handlePayPalPayment = async () => {
    // Validar WhatsApp antes de procesar
    const whatsappValidationError = validateWhatsAppNumber(whatsappNumber);
    if (whatsappValidationError) {
      setWhatsappError(whatsappValidationError);
      return;
    }

    setPaymentProcessing(true);

    try {
      const usuario = JSON.parse(localStorage.getItem("user"));

      if (!usuario || !usuario.id) {
        throw new Error(
          "Usuario no encontrado. Por favor inicia sesión nuevamente."
        );
      }

      // PREPARAR DATA DE TRANSACCIÓN CON WHATSAPP
      let transaccionData;

      if (isMuseumEvent) {
        transaccionData = {
          usuario_id: usuario.id,
          evento_id: eventData.id,
          metodo_pago: "paypal",
          total_pagado: calculatedTotal,
          asientos_seleccionados: [],
          secciones_info: [],
          ticket_details: prepararTicketDetails(),
          tipo_evento: "Museo",
          whatsapp_number: formatWhatsAppForBackend(whatsappNumber), // ← AGREGAR WHATSAPP
          eventData: eventData, // ← IMPORTANTE: enviar eventData para el mensaje
        };
      } else {
        transaccionData = {
          usuario_id: usuario.id,
          evento_id: eventData.id,
          metodo_pago: "paypal",
          total_pagado: calculatedTotal,
          asientos_seleccionados: prepararAsientosSeleccionados(),
          secciones_info: prepararSeccionesInfo(),
          ticket_details: prepararTicketDetails(),
          tipo_evento: "Teatro",
          whatsapp_number: formatWhatsAppForBackend(whatsappNumber), // ← AGREGAR WHATSAPP
          eventData: eventData, // ← IMPORTANTE: enviar eventData para el mensaje
        };
      }

      console.log("Enviando transacción PayPal:", transaccionData);

      const resultado = await TransactionAPI.createTransaction(transaccionData);

      alert(
        "¡Pago con PayPal procesado exitosamente! Su compra ha sido confirmada."
      );
      setShowPaymentModal(false);

      navigate("/summary", {
        state: {
          selectedSeats: isMuseumEvent ? [] : selectedSeats,
          ticketTypes: ticketTypes.filter((t) => t.quantity > 0),
          total: calculatedTotal,
          eventData,
          paymentMethod: "PayPal",
          transaccion_id: resultado.transaction_id,
          transaccion: resultado.transaction,
          isMuseum: isMuseumEvent,
        },
      });
    } catch (error) {
      console.error("Error procesando pago PayPal:", error);
      alert(`Error al procesar el pago con PayPal: ${error.message}`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const validateWhatsAppNumber = (number) => {
    const cleanNumber = number.replace(/\D/g, "");

    if (!number.trim()) {
      return "El número de WhatsApp es requerido";
    } else if (cleanNumber.length < 10) {
      return "El número debe tener al menos 10 dígitos";
    } else if (!/^[\d\s+()-]+$/.test(number)) {
      return "Solo se permiten números, espacios y los caracteres + - ( )";
    }
    return "";
  };

  const formatWhatsAppForBackend = (number) => {
    console.log("📱 Número original:", number);

    let cleanNumber = number.replace(/\D/g, "");
    console.log("📱 Número limpiado:", cleanNumber);

    // FORMATO QUE META PREFIERE: 521 + 10 dígitos
    // Ejemplo: 5213325906198

    if (cleanNumber.length === 10 && !cleanNumber.startsWith("1")) {
      // Número local: 3325906198 → 5213325906198
      cleanNumber = `521${cleanNumber}`;
      console.log("📱 Convertido a 521:", cleanNumber);
    } else if (
      cleanNumber.startsWith("52") &&
      cleanNumber.length === 12 &&
      !cleanNumber.startsWith("521")
    ) {
      // Convertir: 523325906198 → 5213325906198
      cleanNumber = `521${cleanNumber.substring(2)}`;
      console.log("📱 Corregido a 521:", cleanNumber);
    }

    console.log("📱 Número FINAL para backend:", cleanNumber);
    return cleanNumber;
  };
  const renderPaymentModal = () => {
    switch (selectedPaymentMethod) {
      case "credit":
      case "debit":
        return (
          <div className="p-6 bg-gray-800 border-1 border-gray-400 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedPaymentMethod === "credit"
                ? "Tarjeta de Crédito"
                : "Tarjeta de Débito"}
            </h3>

            {/* CAMPO WHATSAPP AGREGADO */}
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <label className="block text-sm font-bold text-white mb-2">
                Número de WhatsApp para confirmación
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => {
                  setWhatsappNumber(e.target.value);
                  if (whatsappError) setWhatsappError("");
                }}
                onBlur={() => {
                  const error = validateWhatsAppNumber(whatsappNumber);
                  setWhatsappError(error);
                }}
                placeholder="+52 55 1234 5678 o 55 1234 5678"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-600 ${
                  whatsappError ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {whatsappError && (
                <p className="mt-1 text-sm text-red-400">{whatsappError}</p>
              )}
              <p className="text-xs text-gray-300 mt-1">
                📱 Recibirás la confirmación de tu compra por WhatsApp
              </p>
            </div>

            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-1">
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  name="number"
                  value={cardData.number}
                  onChange={handleCardInputChange}
                  onBlur={handleInputBlur}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-600 ${
                    errors.number ? "border-red-500" : "border-gray-300"
                  }`}
                  maxLength={19}
                  required
                />
                {errors.number && (
                  <p className="mt-1 text-sm text-red-400">{errors.number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-1">
                  Nombre del Titular
                </label>
                <input
                  type="text"
                  name="name"
                  value={cardData.name}
                  onChange={handleCardInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Juan Pérez"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-600 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Fecha de Expiración (MM/AA)
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardData.expiry}
                    onChange={handleCardInputChange}
                    onBlur={handleInputBlur}
                    placeholder="MM/AA"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-600 ${
                      errors.expiry ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={5}
                    required
                  />
                  {errors.expiry && (
                    <p className="mt-1 text-sm text-red-400">{errors.expiry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleCardInputChange}
                    onBlur={handleInputBlur}
                    placeholder="123"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-600 ${
                      errors.cvv ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={4}
                    required
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-400">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={paymentProcessing || whatsappError}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer"
                >
                  {paymentProcessing
                    ? "Procesando..."
                    : `Pagar $${calculatedTotal.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        );

      case "paypal":
        return (
          <div className="p-6 border-1 border-gray-400 rounded-lg bg-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">
              Pago con PayPal
            </h3>

            {/* CAMPO WHATSAPP AGREGADO PARA PAYPAL */}
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <label className="block text-sm font-bold text-white mb-2">
                Número de WhatsApp para confirmación
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => {
                  setWhatsappNumber(e.target.value);
                  if (whatsappError) setWhatsappError("");
                }}
                onBlur={() => {
                  const error = validateWhatsAppNumber(whatsappNumber);
                  setWhatsappError(error);
                }}
                placeholder="+52 55 1234 5678 o 55 1234 5678"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-600 ${
                  whatsappError ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {whatsappError && (
                <p className="mt-1 text-sm text-red-400">{whatsappError}</p>
              )}
              <p className="text-xs text-gray-300 mt-1">
                📱 Recibirás la confirmación de tu compra por WhatsApp
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-400 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="bg-gray-200 p-3 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-12 h-12 text-blue-600"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.06 3.713c.12-1.071-.093-1.832-.702-2.526C12.628.356 11.312 0 9.626 0H4.734a.7.7 0 0 0-.691.59L2.005 13.509a.42.42 0 0 0 .415.486h2.756l-.202 1.28a.628.628 0 0 0 .62.726H8.14c.429 0 .793-.31.862-.731l.025-.13.48-3.043.03-.164.001-.007a.35.35 0 0 1 .348-.297h.38c1.266 0 2.425-.256 3.345-.91q.57-.403.993-1.005a4.94 4.94 0 0 0 .88-2.195c.242-1.246.13-2.356-.57-3.154a2.7 2.7 0 0 0-.76-.59l-.094-.061ZM6.543 8.82a.7.7 0 0 1 .321-.079H8.3c2.82 0 5.027-1.144 5.672-4.456l.003-.016q.326.186.548.438c.546.623.679 1.535.45 2.71-.272 1.397-.866 2.307-1.663 2.874-.802.57-1.842.815-3.043.815h-.38a.87.87 0 0 0-.863.734l-.03.164-.48 3.043-.024.13-.001.004a.35.35 0 0 1-.348.296H5.595a.106.106 0 0 1-.105-.123l.208-1.32z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">
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
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayPalPayment}
                disabled={paymentProcessing || whatsappError}
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

  const renderWhatsAppModal = () => (
    <div className="p-6 bg-gray-800 border-1 border-gray-400 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">
        Confirmación por WhatsApp
      </h3>

      {!whatsappVerified ? (
        <>
          <div className="bg-yellow-900 border border-yellow-400 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-yellow-400 mr-2 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <div>
                <p className="text-yellow-200 font-semibold">
                  Verificación requerida
                </p>
                <p className="text-yellow-100 text-sm mt-1">
                  Para recibir tu confirmación, primero debes unirte a nuestro
                  servicio de WhatsApp.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowQRModal(true)}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-3 cursor-pointer"
            >
              📱 Unirme a WhatsApp
            </button>

            <p className="text-gray-300 text-sm mb-4">O si ya te uniste:</p>

            <div className="mb-4">
              <label className="block text-sm font-bold text-white mb-2">
                Ingresa tu número de WhatsApp
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => {
                  setWhatsappNumber(e.target.value);
                  if (whatsappError) setWhatsappError("");
                }}
                placeholder="3325906198"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-600 ${
                  whatsappError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {whatsappError && (
                <p className="mt-1 text-sm text-red-400">{whatsappError}</p>
              )}
            </div>

            <button
              onClick={() => {
                const error = validateWhatsAppNumber(whatsappNumber);
                if (error) {
                  setWhatsappError(error);
                  return;
                }
                setWhatsappVerified(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Verificar y Continuar
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-green-900 border border-green-400 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-400 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-green-200 font-semibold">
                ✓ WhatsApp verificado
              </span>
            </div>
            <p className="text-green-100 text-sm mt-1">
              Confirmación se enviará a: <strong>{whatsappNumber}</strong>
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setWhatsappVerified(false);
                setWhatsappError("");
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer"
            >
              Cambiar número
            </button>
            <button
              onClick={() => {
                setShowWhatsAppModal(false);
                setShowPaymentModal(true);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
            >
              Continuar al Pago
            </button>
          </div>
        </>
      )}
    </div>
  );

  const getEventImage = () => {
    return isMuseumEvent ? MuseumImage : TheaterImage;
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
                  {eventData.title || eventData.lugar}
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
                      <span>
                        {(() => {
                          const raw =
                            eventData?.date ??
                            eventData?.fecha ??
                            eventData?.fecha_evento ??
                            eventData?.eventDate ??
                            eventData?.start_date ??
                            eventData?.startDate ??
                            null;

                          if (!raw) {
                            const d = new Date();
                            const dd = String(d.getDate()).padStart(2, "0");
                            const mm = String(d.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const yyyy = d.getFullYear();
                            return `${dd}-${mm}-${yyyy}`;
                          }

                          const parsed = new Date(raw);
                          if (isNaN(parsed.getTime())) {
                            return String(raw);
                          }

                          const dd = String(parsed.getDate()).padStart(2, "0");
                          const mm = String(parsed.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const yyyy = parsed.getFullYear();
                          return `${dd}-${mm}-${yyyy}`;
                        })()}
                      </span>
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
                      <span>{eventData.time || "09:00 AM - 10:00 PM"}</span>
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
                      <span>{eventData.location || eventData.ubicacion}</span>
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
                    className="p-4 bg-gray-900 border-2 border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-700 transition-all cursor-pointer relative"
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
                      {whatsappVerified && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
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

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {renderWhatsAppModal()}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {" "}
            {/* ← AGREGAR max-h y overflow-hidden */}
            {renderQRModal()}
          </div>
        </div>
      )}

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

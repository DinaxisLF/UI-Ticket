import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { TransactionAPI } from "../services/api/transaction.js";
import ConfirmPurchase from "../pages/ConfirmPurchase.jsx";

// --- Mocks ---

// 1. Mockear react-router-dom (useLocation es CRÍTICO aquí)
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useLocation: jest.fn(),
}));

// 2. Mockear la API de Transacciones
jest.mock("../services/api/transaction.js", () => ({
  TransactionAPI: {
    createTransaction: jest.fn(),
  },
}));

// 3. Mockear localStorage (el componente lo usa para obtener el usuario)
const mockUser = { id: 1, name: "Test User" };

// 4. Mockear window.alert y console.error
const mockAlert = jest.spyOn(window, "alert").mockImplementation(() => {});
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

beforeAll(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === "user") {
      return JSON.stringify(mockUser);
    }
    return null;
  });
});

afterAll(() => {
  mockAlert.mockRestore();
  mockConsoleError.mockRestore();
});

// --- Datos simulados del state de useLocation ---
const mockLocationData = {
  selectedSeats: ["platea-0-0"],
  ticketTypes: [
    { id: 1, name: "Platea", price: 3000, quantity: 1, section: "platea" },
  ],
  total: 3000,
  eventData: {
    id: 101, // ID de evento necesario para la API
    title: "Hamlet",
    date: "17 Sep 2025",
    time: "20:00 - 23:00",
    location: "Buenos Aires, Argentina",
  },
};

// --- Suite de Pruebas ---

describe("Pruebas de Caja Negra: Manejo de Errores - Formulario de Pago", () => {
  let user;

  beforeEach(async () => {
    user = userEvent.setup();
    // Limpiamos mocks
    TransactionAPI.createTransaction.mockClear();
    mockAlert.mockClear();
    mockConsoleError.mockClear();
    useLocation.mockReturnValue({ state: mockLocationData });

    render(
      <MemoryRouter>
        <ConfirmPurchase />
      </MemoryRouter>
    );

    // 1. Abrir el modal de WhatsApp primero
    const creditCardButton = screen.getByText(/Tarjeta de Crédito/i);
    await user.click(creditCardButton);

    // 2. Esperar a que aparezca el modal de WhatsApp
    await screen.findByText("Confirmación por WhatsApp");

    // 3. Saltar la verificación de WhatsApp ingresando un número válido
    const whatsappInput = screen.getByPlaceholderText("3325906198");
    await user.type(whatsappInput, "3325906198");

    // 4. Hacer clic en "Verificar y Continuar"
    const verifyButton = screen.getByText("Verificar y Continuar");
    await user.click(verifyButton);

    // 5. Esperar a que aparezca el botón "Continuar al Pago" en el modal de WhatsApp verificado
    const continueButton = await screen.findByText("Continuar al Pago");
    await user.click(continueButton);

    // 6. Ahora esperar a que el modal de pago esté visible
    await screen.findByText("Número de Tarjeta");
  });

  afterEach(() => {
    // Limpiar mocks después de cada test
    jest.clearAllMocks();
  });

  /**
   * Caso 1: Validación de Cliente (Número de Tarjeta Inválido)
   */
  test("Caso 1: Muestra error si el número de tarjeta es inválido y no llama a la API", async () => {
    const payButton = screen.getByRole("button", { name: /Pagar/i });

    // Llenar formulario con datos inválidos
    await user.type(screen.getByPlaceholderText("1234 5678 9012 3456"), "123");
    await user.type(screen.getByPlaceholderText("Juan Pérez"), "Test User");
    await user.type(screen.getByPlaceholderText("MM/AA"), "12/99");
    await user.type(screen.getByPlaceholderText("123"), "456");

    // Intentar pagar
    await user.click(payButton);

    // Verificar el error de validación
    expect(
      await screen.findByText("El número de tarjeta debe tener 16 dígitos")
    ).toBeInTheDocument();

    // Verificar que la API NUNCA fue llamada
    expect(TransactionAPI.createTransaction).not.toHaveBeenCalled();
  });

  /**
   * Caso 2: Validación de Cliente (Fecha Expirada)
   */
  test("Caso 2: Muestra error si la tarjeta está expirada y no llama a la API", async () => {
    // Asumimos que la prueba corre en 2025 (como tu Test 8)
    const payButton = screen.getByRole("button", { name: /Pagar/i });

    // Llenar formulario con datos válidos, excepto la fecha
    await user.type(
      screen.getByPlaceholderText("1234 5678 9012 3456"),
      "1234 5678 9012 3456"
    );
    await user.type(screen.getByPlaceholderText("Juan Pérez"), "Test User");
    await user.type(screen.getByPlaceholderText("MM/AA"), "12/24"); // <-- Fecha expirada
    await user.type(screen.getByPlaceholderText("123"), "456");

    // Intentar pagar
    await user.click(payButton);

    // Verificar el error de validación
    expect(
      await screen.findByText("La tarjeta ha expirado")
    ).toBeInTheDocument();

    // Verificar que la API NUNCA fue llamada
    expect(TransactionAPI.createTransaction).not.toHaveBeenCalled();
  });

  /**
   * Caso 3: Manejo de Error del Servidor (API)
   */
  test("Caso 3: Llama a la API con datos válidos pero muestra alerta si la API falla", async () => {
    // Simular que la API rechazará la promesa
    const apiError = new Error("Error de conexión");
    TransactionAPI.createTransaction.mockRejectedValue(apiError);

    const payButton = screen.getByRole("button", { name: /Pagar/i });

    // Llenar formulario con TODOS los datos válidos
    await user.type(
      screen.getByPlaceholderText("1234 5678 9012 3456"),
      "1234 5678 9012 3456"
    );
    await user.type(screen.getByPlaceholderText("Juan Pérez"), "Test User");
    await user.type(screen.getByPlaceholderText("MM/AA"), "12/99"); // Fecha futura
    await user.type(screen.getByPlaceholderText("123"), "456");

    // Intentar pagar
    await user.click(payButton);

    // Esperar a que el ciclo de "procesando" termine.
    // La prueba de que terminó es que el botón vuelve a decir "Pagar".
    await waitFor(() => {
      expect(screen.getByText(/Pagar/i)).toBeInTheDocument();
    });

    // Verificar que la API FUE llamada
    expect(TransactionAPI.createTransaction).toHaveBeenCalledTimes(1);

    // Verificar que se llamó a console.error con el mensaje de error
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error procesando pago:",
      apiError
    );

    // Verificar que se mostró la alerta de error
    expect(mockAlert).toHaveBeenCalledWith(
      expect.stringContaining("Error al procesar el pago")
    );
  });
});

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import TheaterTickets from "../pages/TheatherTickets";

// --- Mocks ---

// Mockear react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(), // Mockeamos useLocation para proveer el 'state'
}));

// Mockear datos del evento (basado en tu Test 7)
const mockEventData = {
  nombre_evento: "Hamlet",
  date: "17 Sep 2025",
  time: "20:00 - 23:00",
  location: "Buenos Aires, Argentina",
};

// --- Suite de Pruebas ---

describe("Pruebas de Caja Negra: Análisis de Valores Límite - Cantidad de Boletos", () => {
  let user;
  let plusButton;
  let minusButton;
  let selectSeatsButton;

  // Renderizar el componente y encontrar los botones antes de cada prueba
  beforeEach(async () => {
    user = userEvent.setup();
    mockNavigate.mockClear();

    // Simular el 'state' que TheaterTickets espera de useLocation
    useLocation.mockReturnValue({
      pathname: "/buyTheater",
      state: { eventData: mockEventData },
    });

    render(
      <MemoryRouter>
        <TheaterTickets />
      </MemoryRouter>
    );

    // Esperar a que el componente cargue los datos del evento
    await screen.findByText(/Hamlet/i);

    // Encontrar los controles para el primer tipo de boleto (ej. "Platea")
    // (Basado en la lógica de tu Test 7 original)
    plusButton = screen.getAllByRole("button", { name: "+" })[0];
    minusButton = screen.getAllByRole("button", { name: "-" })[0];
    selectSeatsButton = screen.getByRole("button", {
      name: /seleccionar asientos/i,
    });
  });

  // Helper para obtener el display de cantidad (asumimos que es el primer "0")
  const getQuantityDisplay = () => {
    // Buscamos un <span> o <p> que contenga solo un número,
    // cerca del botón de 'plus'.
    const quantityNode = plusButton.parentElement.querySelector(
      "span"
      // Si usas un <p> o <div>, cambia "span" por el tag correcto
    );
    // Si no lo encuentra, probamos buscando el primer "0"
    return quantityNode || screen.getAllByText(/\b(0|1|2|3|4|5|6|7|8)\b/)[0];
  };

  /**
   * Caso 1: Límite 0 (Estado Inicial)
   */
  test("Caso 1 (Límite 0): Botones '-' y 'Seleccionar' deben estar deshabilitados", () => {
    const quantity = getQuantityDisplay();

    expect(quantity).toHaveTextContent("0");
    expect(minusButton).toBeDisabled();
    expect(selectSeatsButton).toBeDisabled();
  });

  /**
   * Caso 2: Límite 1 (Válido Mínimo)
   */
  test("Caso 2 (Límite 1): Al sumar 1, botones '-' y 'Seleccionar' se habilitan", async () => {
    await user.click(plusButton);

    const quantity = getQuantityDisplay();
    expect(quantity).toHaveTextContent("1");
    expect(minusButton).toBeEnabled();
    expect(selectSeatsButton).toBeEnabled();
  });

  /**
   * Casos 3 y 4: Límites 8 y 9 (Válido Máximo e Inválido Superior)
   */
  test("Caso 3 y 4 (Límites 8 y 9): Permite 8 boletos pero deshabilita '+' en 9", async () => {
    // Asumimos que el límite MÁXIMO es 8.
    // Hacemos clic 8 veces
    for (let i = 0; i < 8; i++) {
      await user.click(plusButton);
    }

    // --- Verificación del Límite 8 (Caso 3) ---
    const quantity = getQuantityDisplay();
    expect(quantity).toHaveTextContent("8");
    expect(minusButton).toBeEnabled();
    expect(selectSeatsButton).toBeEnabled();

    // El botón de '+' ahora debería estar deshabilitado
    expect(plusButton).toBeDisabled();

    // --- Verificación del Límite 9 (Caso 4) ---
    // Intentamos hacer clic una vez más (no debería tener efecto)
    await user.click(plusButton);
    expect(quantity).toHaveTextContent("8"); // La cantidad sigue siendo 8
  });
});

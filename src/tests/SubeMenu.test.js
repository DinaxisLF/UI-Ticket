import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import SubMenu from "../components/SubMenu"; // Asegúrate que la ruta sea correcta

// --- Mocks ---

// Mockear react-router-dom para espiar 'navigate' y 'useLocation'
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));

// Mock de datos (basado en tu Test 5 original)
const mockLocationState = {
  optionsList: [
    {
      id: 1,
      name: "Teatro Colón",
      eventLocation: "Buenos Aires, Argentina",
      link: "theaterEvents",
    },
  ],
  title: "Teatro",
  eventType: "theater",
};

// --- Suite de Pruebas ---

describe("Pruebas de Caja Negra: Partición de Equivalencia - Lógica de Días Festivos", () => {
  // Activar fake timers
  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigate.mockClear();
    // Mockear la implementación de useLocation
    useLocation.mockReturnValue({
      pathname: "/submenu",
      state: mockLocationState,
    });
  });

  // Limpiar timers
  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Caso 1: Día Normal (Debe mostrar eventos)
   */
  test("Caso 1 (Día Normal): Muestra la lista de eventos en un día hábil", async () => {
    // 1. Establecer la fecha del sistema a un día normal
    // (Miércoles 12 de noviembre de 2025)
    jest.setSystemTime(new Date("2025-11-12T10:00:00"));

    render(
      <MemoryRouter>
        <SubMenu />
      </MemoryRouter>
    );

    // 2. Verificar que la tarjeta del evento se muestra
    expect(await screen.findByText("Teatro Colón")).toBeInTheDocument();

    // 3. Verificar que el mensaje de día festivo NO se muestra
    expect(screen.queryByText("Día Festivo")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/El día de hoy no hay funciones programadas/i)
    ).not.toBeInTheDocument();
  });

  /**
   * Caso 2: Día Festivo (Debe ocultar eventos y mostrar mensaje)
   */
  test("Caso 2 (Día Festivo): Muestra mensaje de 'Día Festivo' y oculta eventos", async () => {
    // 1. Establecer la fecha del sistema a un día festivo
    // (Navidad, 25 de diciembre de 2025)
    jest.setSystemTime(new Date("2025-12-25T10:00:00"));

    render(
      <MemoryRouter>
        <SubMenu />
      </MemoryRouter>
    );

    // 2. Verificar que el mensaje de día festivo SÍ se muestra
    expect(await screen.findByText("Día Festivo")).toBeInTheDocument();
    expect(
      screen.getByText(/El día de hoy no hay funciones programadas/i)
    ).toBeInTheDocument();

    // 3. Verificar que la tarjeta del evento NO se muestra
    expect(screen.queryByText("Teatro Colón")).not.toBeInTheDocument();
  });
});

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
// Importamos AuthProvider para envolver el componente, pero mockeamos useAuth
import { AuthProvider, useAuth } from "../context/AuthContext";
import Login from "../pages/Login.jsx"; // Asegúrate que la ruta sea correcta

// --- Mocks ---

// 1. Mockear el hook useAuth
jest.mock("../context/AuthContext", () => ({
  // Mantenemos el AuthProvider real para envolver
  ...jest.requireActual("../../context/AuthContext.jsx"),
  // Sobrescribimos el hook useAuth
  useAuth: jest.fn(),
}));

// 2. Mockear react-router-dom para espiar 'navigate'
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  // Mantenemos MemoryRouter y otros componentes reales
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// --- Suite de Pruebas ---

describe("Pruebas de Caja Negra: Partición de Equivalencia - Formulario de Registro", () => {
  let mockRegister;
  let user;

  // Datos válidos para el formulario
  const validFormData = {
    name: "Usuario Prueba",
    email: "prueba@correo.com",
    username: "LOFC010320HJCMLSJO9", // Válido
    password: "Abc123$%", // Válido
    confirmPassword: "Abc123$%",
  };

  // Helper para llenar el formulario
  const fillRegistrationForm = async (data = {}) => {
    const formData = { ...validFormData, ...data };

    await user.type(screen.getByLabelText(/Nombre Completo/i), formData.name);
    await user.type(
      screen.getByLabelText(/Correo Electrónico/i),
      formData.email
    );
    await user.type(screen.getByLabelText(/Usuario/i), formData.username);
    await user.type(screen.getByLabelText(/^Contraseña/i), formData.password);
    await user.type(
      screen.getByLabelText(/Confirmar contraseña/i),
      formData.confirmPassword
    );
  };

  // Configuración antes de CADA prueba de registro
  beforeEach(async () => {
    mockRegister = jest.fn();
    mockNavigate.mockClear();

    useAuth.mockReturnValue({
      login: jest.fn(),
      register: mockRegister,
      loading: false,
      isAuthenticated: false,
    });

    user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    // --- Cambiar a modo Registro ---
    const toggleButton = screen.getByRole("button", { name: /Registrarse/i });
    await user.click(toggleButton);

    // Esperar a que aparezcan los campos de registro
    await screen.findByLabelText(/Nombre Completo/i);
  });

  /**
   * Caso 1: Clase Inválida (Nombre sin apellido)
   */
  test("Caso 1: Muestra error si el nombre no tiene apellido (sin espacio)", async () => {
    // Llenamos el formulario, pero con un nombre inválido
    // Escribimos "Usuario" (inválido porque no tiene espacio/apellido)
    await fillRegistrationForm({ name: "Usuario" });

    const submitButton = screen.getByRole("button", { name: /Crear Cuenta/i });
    await user.click(submitButton);

    // Verificamos el error específico de validation.js que SÍ aparece en el DOM
    expect(
      await screen.findByText("Por favor ingresa nombre y apellido") // <--- ¡Esto SÍ aparece!
    ).toBeInTheDocument();

    // La API de registro NO debe ser llamada
    expect(mockRegister).not.toHaveBeenCalled();
  });

  /**
   * Caso 2: Clase Inválida (Email con formato incorrecto)
   */
  test("Caso 2: Muestra error si el email no es válido", async () => {
    await fillRegistrationForm({ email: "correo-invalido.com" });

    const submitButton = screen.getByRole("button", { name: /Crear Cuenta/i });
    await user.click(submitButton);

    // Verificamos el error de Login.jsx
    expect(
      await screen.findByText("Email no valido") // <-- ✅ Sin tilde
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  /**
   * Caso 3: Clase Inválida (Contraseñas no coinciden)
   */
  test("Caso 3: Muestra error si las contraseñas no coinciden", async () => {
    await fillRegistrationForm({ confirmPassword: "PasswordDiferente1!" });

    const submitButton = screen.getByRole("button", { name: /Crear Cuenta/i });
    await user.click(submitButton);

    // Verificamos el error de Login.jsx
    expect(
      await screen.findByText("Las contraseñas deben coincidir")
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  /**
   * Caso 4: Clase Válida (Registro Exitoso)
   */
  test("Caso 4: Permite el registro con datos válidos y navega al dashboard", async () => {
    // Simulamos una respuesta exitosa del servidor
    mockRegister.mockResolvedValue({
      success: true,
      message: "Registro exitoso",
    });

    await fillRegistrationForm(); // Usar datos válidos por defecto

    const submitButton = screen.getByRole("button", { name: /Crear Cuenta/i });
    await user.click(submitButton);

    // Verificamos que la API de registro SÍ fue llamada con los datos correctos
    await waitFor(() => {
      // El componente de Login envía el objeto formData completo
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validFormData.name,
          email: validFormData.email,
          username: validFormData.username,
          password: validFormData.password,
        })
      );
    });

    // Verificamos que se navega al dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  /**
   * Caso 5: Clase Válida (Formato) pero Inválida (Servidor)
   */
  test("Caso 5: Muestra error del servidor si el registro falla (ej. usuario ya existe)", async () => {
    // Simulamos una respuesta de error del servidor
    mockRegister.mockResolvedValue({
      success: false,
      message: "El usuario ya se encuentra registrado",
    });

    await fillRegistrationForm(); // Llenar con datos válidos por defecto

    const submitButton = screen.getByRole("button", { name: /Crear Cuenta/i });
    await user.click(submitButton);

    // Verificamos que la API fue llamada
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });

    // Verificamos que se muestra el mensaje de error del servidor
    expect(
      await screen.findByText("El usuario ya se encuentra registrado")
    ).toBeInTheDocument();

    // Verificamos que NO se navegó a otra página
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

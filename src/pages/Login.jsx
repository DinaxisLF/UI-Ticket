import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  validateUsername,
  validatePassword,
  validateName,
} from "../utils/validation";

import { useErrorModal } from "../components/ErrorModal";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();
  const { login, register, loading } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Para el campo username, convertir a mayúsculas y eliminar espacios
    let processedValue = value;
    if (name === "username") {
      processedValue = value;
    }

    if (name === "name") {
      // Eliminar números y caracteres especiales (excepto espacios y apóstrofes)
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']/g, "");

      // Limitar a un solo espacio consecutivo
      processedValue = processedValue.replace(/\s{2,}/g, " ");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear message when user starts typing
    if (message.text) {
      setMessage({ text: "", type: "" });
    }
  };

  const { showErrorModal, ModalComponent } = useErrorModal();

  const validateForm = () => {
    const newErrors = {};

    // Validar username
    if (!formData.username) {
      newErrors.username = "Usuario es requerido";
    } else {
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        newErrors.username = usernameValidation.message;
      }
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = "Ingresa una contraseña";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    }
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = "Ingresa un nombre";
      } else {
        const nameValidation = validateName(formData.name);
        if (!nameValidation.isValid) {
          newErrors.name = nameValidation.message;
        }
      }

      if (!formData.email) {
        newErrors.email = "Email es requerido";
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
      ) {
        newErrors.email = "Email no valido";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirma tu contraseña";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas deben coincidir";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const result = isLogin
        ? await login(formData.username, formData.password)
        : await register(formData);

      if (result.success) {
        setMessage({ text: result.message, type: "success" });
        navigate("/dashboard");
      } else {
        // Use the modal hook function
        showErrorModal(
          "Error de Autenticación",
          "Por favor verifica tus credenciales e intenta nuevamente."
        );
        setMessage({ text: result.message, type: "error" });
      }
    }
  };

  const toggleFormMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setMessage({ text: "", type: "" });
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? "Bienvenido" : "Crear Cuenta"}
          </h1>
          <p className="text-gray-600">
            {isLogin ? "Inicia Sesión" : "Regístrate"}
          </p>
        </div>

        {/* Mensaje de éxito/error */}
        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field (only for registration) */}
          {!isLogin && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre Completo
                <span className="ml-1 text-blue-500 cursor-help relative">
                  <div className="group inline-block">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 inline"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="absolute left-0 -top-2 transform -translate-y-full w-64 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-lg z-10">
                      <div className="mb-1 font-semibold">
                        Formato requerido:
                      </div>
                      <div>• Solo letras y espacios</div>
                      <div>• Sin números ni caracteres especiales</div>
                      <div>• Nombre y apellido</div>
                      <div className="mt-2 text-blue-300">
                        Ej: María González
                      </div>
                      <div className="absolute bottom-0 left-3 transform translate-y-full border-8 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ingresa tu nombre completo"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          )}

          {/* Email Field (only for registration) */}
          {!isLogin && (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ingresa tu email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          )}

          {/* Username Field */}
          <div className="relative">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Usuario
              <span className="ml-1 text-blue-500 cursor-help relative">
                <div className="group inline-block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="absolute left-0 -top-2 transform -translate-y-full w-64 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-lg z-10">
                    <div className="mb-1 font-semibold">Formato requerido:</div>
                    <div>• 4 letras + 6 números + 1 letra + 2 letras</div>
                    <div>• 3 letras/números + 2 letras estado + 1 número</div>
                    <div className="mt-2 text-blue-300">
                      Ej: ABCD900101HDFRRLJ01
                    </div>
                    <div className="absolute bottom-0 left-3 transform translate-y-full border-8 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ej: ABCD900101HDFRRLJ01"
              maxLength={20}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
              <span className="ml-1 text-blue-500 cursor-help relative">
                <div className="group inline-block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="absolute left-0 -top-2 transform -translate-y-full w-56 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-lg z-10">
                    <div className="mb-1 font-semibold">
                      La contraseña debe tener:
                    </div>
                    <div>• Exactamente 8 caracteres</div>
                    <div>• Al menos 1 letra mayúscula</div>
                    <div>• Al menos 1 letra minúscula</div>
                    <div>• Al menos 1 número</div>
                    <div>• Al menos 1 carácter especial (@, #, $, %, &)</div>
                    <div className="mt-2 text-blue-300">Ej: Abc123$%</div>
                    <div className="absolute bottom-0 left-3 transform translate-y-full border-8 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Debe tener exactamente 8 caracteres"
              maxLength={8}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Confirma tu contraseña"
                maxLength={8}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Procesando...
              </>
            ) : isLogin ? (
              "Iniciar Sesión"
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </form>

        <ModalComponent />

        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button
              type="button"
              onClick={toggleFormMode}
              className="text-blue-600 font-semibold hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {isLogin ? "Registrarse" : "Iniciar sesión"}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-blue-600 text-sm hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

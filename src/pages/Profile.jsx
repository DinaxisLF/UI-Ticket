import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitleHeader from "../components/TitleHeader";

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Datos de ejemplo para complementar (transacciones, dirección, etc.)
  const mockAdditionalData = {
    telefono: "+52 55 1234 5678",
    fecha_registro: "2024-01-15",
    direccion: {
      calle: "Av. Reforma 123",
      ciudad: "Ciudad de México",
      estado: "CDMX",
      codigo_postal: "06600",
    },
    preferencias: {
      notificaciones: true,
      newsletter: false,
      tema: "claro",
    },
    transacciones: [
      {
        id: 42,
        evento: "La Vida es Sueño",
        fecha: "2024-12-17",
        total: 400,
        estado: "completada",
        tipo: "Museo",
      },
      {
        id: 38,
        evento: "Concierto de Jazz",
        fecha: "2024-12-10",
        total: 1200,
        estado: "completada",
        tipo: "Teatro",
      },
      {
        id: 35,
        evento: "Exposición de Arte Moderno",
        fecha: "2024-11-28",
        total: 300,
        estado: "completada",
        tipo: "Museo",
      },
    ],
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Obtener usuario del localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedUser) {
          // Combinar datos del localStorage con datos adicionales mock
          const userData = {
            ...storedUser,
            ...mockAdditionalData,
            // Sobrescribir nombre completo con el del localStorage
            nombre: storedUser.nombre || storedUser.nombre_usuario,
          };

          setUser(userData);
        } else {
          // Si no hay usuario en localStorage, redirigir al login
          navigate("/login");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Función para obtener iniciales del nombre
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Usuario no encontrado
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <TitleHeader title="Mi Perfil" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
              {/* Avatar y info básica */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {getInitials(user.nombre)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{user.nombre}</h3>
                <p className="text-gray-400 text-sm mt-1">{user.correo}</p>
                <p className="text-gray-500 text-xs mt-2">
                  {user.fecha_registro
                    ? `Miembro desde ${formatDate(user.fecha_registro)}`
                    : "Usuario registrado"}
                </p>
                {user.is_admin === 1 && (
                  <span className="inline-block mt-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                    Administrador
                  </span>
                )}
              </div>

              {/* Navegación */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "profile"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  👤 Información Personal
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "transactions"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  🎫 Mis Compras
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "preferences"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  ⚙️ Preferencias
                </button>
              </nav>

              {/* Botón de cerrar sesión */}
              <button
                onClick={handleLogout}
                className="w-full mt-6 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {/* Información Personal */}
            {activeTab === "profile" && (
              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Información Personal
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Datos Básicos
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Nombre Completo
                          </label>
                          <div className="bg-gray-700 px-4 py-3 rounded-lg text-white">
                            {user.nombre}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Correo Electrónico
                          </label>
                          <div className="bg-gray-700 px-4 py-3 rounded-lg text-white">
                            {user.correo}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Nombre de Usuario
                          </label>
                          <div className="bg-gray-700 px-4 py-3 rounded-lg text-white font-mono text-sm">
                            {user.nombre_usuario}
                          </div>
                        </div>
                        {user.telefono && (
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                              Teléfono
                            </label>
                            <div className="bg-gray-700 px-4 py-3 rounded-lg text-white">
                              {user.telefono}
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            ID de Usuario
                          </label>
                          <div className="bg-gray-700 px-4 py-3 rounded-lg text-white font-mono">
                            {user.id}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Tipo de Cuenta
                          </label>
                          <div className="bg-gray-700 px-4 py-3 rounded-lg text-white">
                            {user.is_admin === 1
                              ? "Administrador"
                              : "Usuario Estándar"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {user.direccion && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Dirección
                      </h3>
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <div className="space-y-2 text-white">
                          <div>{user.direccion.calle}</div>
                          <div>
                            {user.direccion.ciudad}, {user.direccion.estado}
                          </div>
                          <div>C.P. {user.direccion.codigo_postal}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex gap-4">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Editar Información
                  </button>
                  <button className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            )}

            {/* Mis Compras */}
            {activeTab === "transactions" && (
              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Mis Compras
                </h2>

                <div className="space-y-4">
                  {user.transacciones &&
                    user.transacciones.map((transaccion) => (
                      <div
                        key={transaccion.id}
                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-semibold text-white">
                              {transaccion.evento}
                            </h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                              <span>📅 {formatDate(transaccion.fecha)}</span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  transaccion.estado === "completada"
                                    ? "bg-green-500 text-white"
                                    : "bg-yellow-500 text-black"
                                }`}
                              >
                                {transaccion.estado}
                              </span>
                              <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                                {transaccion.tipo}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-400">
                              ${transaccion.total.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              ID: #{transaccion.id}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            Ver Detalles
                          </button>
                          <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                            Descargar Factura
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {(!user.transacciones || user.transacciones.length === 0) && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎭</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No hay compras realizadas
                    </h3>
                    <p className="text-gray-400">
                      Cuando realices tu primera compra, aparecerá aquí.
                    </p>
                    <button
                      onClick={() => navigate("/events")}
                      className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Explorar Eventos
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Preferencias */}
            {activeTab === "preferences" && (
              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Preferencias
                </h2>

                {user.preferencias ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">
                          Notificaciones por correo
                        </h4>
                        <p className="text-sm text-gray-400">
                          Recibir notificaciones sobre mis compras y eventos
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={user.preferencias.notificaciones}
                          readOnly
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">Newsletter</h4>
                        <p className="text-sm text-gray-400">
                          Recibir promociones y novedades por correo
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={user.preferencias.newsletter}
                          readOnly
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-gray-700 rounded-lg">
                      <h4 className="font-semibold text-white mb-3">
                        Tema de la aplicación
                      </h4>
                      <div className="flex gap-4">
                        <button
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            user.preferencias.tema === "claro"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                          }`}
                        >
                          🌞 Claro
                        </button>
                        <button
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            user.preferencias.tema === "oscuro"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                          }`}
                        >
                          🌙 Oscuro
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      No hay preferencias configuradas.
                    </p>
                  </div>
                )}

                <div className="mt-8">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Guardar Cambios
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

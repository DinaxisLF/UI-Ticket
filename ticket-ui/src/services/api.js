const API_BASE_URL = "http://localhost:3000/api"; // Adjust to your backend URL

export const authAPI = {
  // Login endpoint
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_usuario: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      return data;
    } catch (error) {
      throw new Error(error.message || "Error de conexión");
    }
  },

  // Register endpoint
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: userData.name,
          correo: userData.email,
          nombre_usuario: userData.username,
          password: userData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario");
      }

      return data;
    } catch (error) {
      throw new Error(error.message || "Error de conexión");
    }
  },

  // Check if user exists (for login validation)
  async checkUserExists(username) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/check-user/${username}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar usuario");
      }

      return data;
    } catch (error) {
      throw new Error(error.message || "Error de conexión");
    }
  },
};

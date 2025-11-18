const Auth_API_URL = "http://localhost:3000/api/auth";
const User_API_URL = "http://localhost:3000/api/users";

class APIError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

const handleResponse = async (response) => {
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new APIError("Invalid JSON response from server", response.status);
  }

  if (!response.ok) {
    throw new APIError(
      data.message || `Error ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  return data;
};

export const authAPI = {
  async login(username, password) {
    try {
      console.log("Sending login request to /api/auth/login");

      const response = await fetch(`${Auth_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const result = await handleResponse(response);
      console.log("Login response:", result);
      return result;
    } catch (error) {
      console.error("Login API error:", error);
      throw error;
    }
  },

  async register(userData) {
    try {
      console.log("Sending register request to /api/users");

      const response = await fetch(`${User_API_URL}`, {
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

      const result = await handleResponse(response);
      console.log("Register response:", result);
      return result;
    } catch (error) {
      console.error("Register API error:", error);
      throw error;
    }
  },

  async checkUserExists(username) {
    try {
      console.log("Checking user exists:", username);

      const response = await fetch(
        `${User_API_URL}/exists/${encodeURIComponent(username)}`
      );
      const result = await handleResponse(response);
      console.log("Check user exists response:", result);
      return result;
    } catch (error) {
      console.error("Check user exists error:", error);
      throw error;
    }
  },
};

const API_BASE_URL = "http://localhost:3000/api/museum";

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

export const MuseumAPI = {
  async getAvailability(museumId) {
    try {
      const response = await fetch(`${API_BASE_URL}/availability/${museumId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      const result = await handleResponse(response);
      console.log("Get Museum Availability response:", result);
      return result;
    } catch (error) {
      console.error("Get Museum Availability API error:", error);
      throw error;
    }
  },
};

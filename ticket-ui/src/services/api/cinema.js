const API_BASE_URL = "http://localhost:3000/api/cinema";

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

export const CinemaAPI = {
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      const result = await handleResponse(response);
      console.log("Get Cinema Categories response:", result);
      return result;
    } catch (error) {
      console.error("Get Cinema Categories API error:", error);
      throw error;
    }
  },

  async getEventsByCinemaRoom(roomType, cinemaId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/events/${roomType}/${cinemaId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await handleResponse(response);
      console.log("Get Events by Cinema and Room response:", result);
      return result;
    } catch (error) {
      console.error("Get Events by Cinema API error:", error);
      throw error;
    }
  },
  async getCinemaSeats(eventId) {
    try {
      const response = await fetch(`${API_BASE_URL}/event/${eventId}/seats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const result = await handleResponse(response);
      console.log("Get Cinema Seats response:", result);
      return result;
    } catch (error) {
      console.error("Get Cinema Seats API error:", error);
      throw error;
    }
  },
};

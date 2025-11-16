const API_BASE_URL = "http://localhost:3000/api/theater";

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

export const TheaterAPI = {
  async getEventsByTheater(theaterId) {
    try {
      const response = await fetch(`${API_BASE_URL}/theaterId/${theaterId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      const result = await handleResponse(response);
      console.log("Get Events by Theater response:", result);
      return result;
    } catch (error) {
      console.error("Get Events by Theater API error:", error);
      throw error;
    }
  },

  async getTheaterSeats(eventId) {
    try {
      console.log(
        "Making API call to:",
        `http://localhost:3000/api/theater/eventId/${eventId}/seats`
      );

      const response = await fetch(
        `http://localhost:3000/api/theater/eventId/${eventId}/seats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response status:", response.status);
      console.log("API Response headers:", response.headers);

      const result = await handleResponse(response);
      console.log("Get Theater Seats response after handleResponse:", result);
      return result;
    } catch (error) {
      console.error("Get Theater Seats API error:", error);
      throw error;
    }
  },
};

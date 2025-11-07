const API_BASE_URL = "http://localhost:3000/api/events";

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

const theaterAPI = {
  async getTheaters() {
    try {
      console.log("Sending request to /api/events/theaters");
      const response = await fetch(`${API_BASE_URL}/theaters`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await handleResponse(response);
      console.log("Get Theaters response:", result);
      return result;
    } catch (error) {
      console.error("Get Theaters API error:", error);
      throw error;
    }
  },
};

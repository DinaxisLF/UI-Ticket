const API_BASE_URL = "http://localhost:3000/api/transaction";

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

export const TransactionAPI = {
  async createTransaction(transactionData) {
    try {
      console.log("Enviando transacción a:", `${API_BASE_URL}/create`);
      console.log("Datos enviados:", transactionData);

      const response = await fetch(`${API_BASE_URL}/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      const result = await handleResponse(response);
      console.log("Create Transaction response:", result);
      return result;
    } catch (error) {
      console.error("Create Transaction API error:", error);
      throw error;
    }
  },

  async getTransactionsByUser(usuario_id) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${usuario_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const result = await handleResponse(response);
      console.log("Get User Transactions response:", result);
      return result;
    } catch (error) {
      console.error("Get User Transactions API error:", error);
      throw error;
    }
  },
};

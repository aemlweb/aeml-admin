// ApiService.js - Complete Version with Delete
import Domain from "../../Api/Api";
import { AuthToken } from "../../Api/Api";

const ApiService = {
  // Fetch list of items
  fetchList: async (endpoint) => {
    try {
      const response = await fetch(`${Domain()}/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${AuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching list:", error);
      throw error;
    }
  },

  // Fetch single item by ID
  fetchItem: async (endpoint, id) => {
    try {
      const response = await fetch(`${Domain()}/${endpoint}/${id}`, {
        headers: {
          Authorization: `Bearer ${AuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching item:", error);
      throw error;
    }
  },

  // Create item with FormData
  createItem: async (endpoint, formData) => {
    console.log("Creating item with formData:", formData);
    try {
      const response = await fetch(`${Domain()}/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error creating item:", error);
      throw error;
    }
  },

  // Create question specifically
  createQuestions: async (question) => {
    try {
      const response = await fetch(`${Domain()}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthToken()}`,
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error creating question:", error);
      throw error;
    }
  },

  // Update item with FormData
  updateItem: async (endpoint, id, formData) => {
    try {
      const response = await fetch(`${Domain()}/${endpoint}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${AuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  },

  // Update question specifically
  updateQuestion: async (id, questionText) => {
    try {
      const response = await fetch(`${Domain()}/questions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthToken()}`,
        },
        body: JSON.stringify({ question: questionText }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed with status ${response.status}: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  },

  // Delete item by ID
  deleteItem: async (endpoint, id) => {
    try {
      const response = await fetch(`${Domain()}/${endpoint}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Some APIs return empty response on successful delete
      const text = await response.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  },
};

export default ApiService;

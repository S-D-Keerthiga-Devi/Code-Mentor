// src/services/api.js
import axios from "axios";

// ✅ Use environment variable for backend URL
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // automatically points to Render backend in production
  withCredentials: true, // send cookies if needed
});

// ✅ AI Suggestion function
export const getAISuggestion = async (code, language = "javascript") => {
  try {
    const response = await API.post("/safe-suggest", { code, language });
    return response.data;
  } catch (error) {
    console.error("Error fetching AI suggestion:", error);
    throw error;
  }
};

// ✅ Get user's AI suggestions for dashboard
export const getSuggestions = async (page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') => {
  try {
    const response = await API.get("/suggestions", {
      params: { page, limit, sortBy, sortOrder }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    throw error;
  }
};

// ✅ Get suggestion statistics
export const getSuggestionStats = async () => {
  try {
    const response = await API.get("/suggestions/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching suggestion stats:", error);
    throw error;
  }
};

// ✅ Get specific suggestion details
export const getSuggestionById = async (id) => {
  try {
    const response = await API.get(`/suggestions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching suggestion:", error);
    throw error;
  }
};
// src/services/api.js
import axios from "axios";

// ✅ Create axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api", // your backend URL
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

// ✅ You can add other API calls here
// export const loginUser = async (data) => {
//   const response = await API.post("/auth/login", data);
//   return response.data;
// };

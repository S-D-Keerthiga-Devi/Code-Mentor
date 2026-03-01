import axios from "axios";

// ✅ Use environment variable for backend URL
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // points to Render backend
  withCredentials: true, // send cookies if needed
});

// ✅ AI Suggestion function (for SafeSuggest legacy usage)
export const getAISuggestion = async (code, language = "javascript", userId = null) => {
  try {
    const response = await API.post("/api/safe-suggest", { code, language, userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ AI Chat conversational assistance
export const getAiAssistance = async (code, language = "javascript", question, sessionId = null) => {
  try {
    const response = await API.post("/api/ai/chat", { code, language, question, sessionId });
    return response.data;
  } catch (error) {
    console.error("Error fetching AI Assistance:", error);
    throw error;
  }
};


// ✅ Analyze code for Socratic Heatmap
export const analyzeSocraticHeatmap = async (code, language = "javascript", dependencyLevel = "Yellow") => {
  try {
    const response = await API.post("/api/ai/socratic-heatmap", { code, language, dependencyLevel });
    return response.data;
  } catch (error) {
    console.error("Error analyzing socratic heatmap:", error);
    throw error;
  }
};

// ✅ Generate visual flow
export const generateVisualFlowAPI = async (code, language = "javascript") => {
  try {
    const response = await API.post("/api/ai/visualize-flow", { code, language });
    return response.data;
  } catch (error) {
    console.error("Error generating visual flow:", error);
    throw error;
  }
};

// ✅ Optimize specific AST node
export const optimizeNodeCodeAPI = async (fullCode, lineNumber, language = "javascript") => {
  try {
    const response = await API.post("/api/ai/optimize-node", { fullCode, lineNumber, language });
    return response.data;
  } catch (error) {
    console.error("Error optimizing node code:", error);
    throw error;
  }
};

// ✅ Execute code via Judge0
export const executeJudge0 = async (code, language = "javascript") => {
  try {
    const response = await API.post("/api/ai/execute-judge0", { code, language });
    return response.data;
  } catch (error) {
    console.error("Error executing via Judge0:", error);
    throw error;
  }
};

// ✅ Auto-fix Code Smell
export const autoFixCode = async (code, language = "javascript", badLineNumber, smellType, sessionId = null) => {
  try {
    const response = await API.post("/api/ai/auto-fix", { code, language, badLineNumber, smellType, sessionId });
    return response.data;
  } catch (error) {
    console.error("Error auto-fixing code:", error);
    throw error;
  }
};

// ✅ Get user's AI suggestions for dashboard
export const getSuggestions = async (page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc") => {
  try {
    const response = await API.get("/api/suggestions", {
      params: { page, limit, sortBy, sortOrder },
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
    const response = await API.get("/api/suggestions/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching suggestion stats:", error);
    throw error;
  }
};

// ✅ Get specific suggestion details
export const getSuggestionById = async (id) => {
  try {
    const response = await API.get(`/api/suggestions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching suggestion:", error);
    throw error;
  }
};
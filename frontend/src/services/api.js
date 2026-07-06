import axios from "axios";

// Determine API URL based on environment
const getApiUrl = () => {
  // Use the Vite-injected global API URL first (build-time default)
  if (typeof __API_URL__ !== 'undefined' && __API_URL__) {
    return __API_URL__;
  }

  // Fallback to the Vite environment variable if available
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Use the deployed backend URL as the final fallback
  return 'https://smartskill-ai-3.onrender.com/api';
};

const API = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log API URL for debugging
console.log('🔗 API Base URL:', getApiUrl());

// Attach token automatically
API.interceptors.request.use((config) => {
const token = localStorage.getItem("token");

if (token) {
config.headers.Authorization = "Bearer " + token;
}

return config;
});

// Handle errors globally
API.interceptors.response.use(
(res) => res,
(err) => {
if (err.response) {
  // Server responded with error status
  const { status, data } = err.response;
  console.error(`[API ERROR ${status}]`, {
    url: err.config.url,
    method: err.config.method,
    message: data.message || data.error || "Unknown error",
    status
  });
  
  if (status === 401) {
    console.log("Unauthorized - token issue");
  } else if (status === 400) {
    console.error("Bad request:", data.message || "Invalid request");
  } else if (status === 403) {
    console.error("Forbidden:", data.message || "Access denied");
  } else if (status === 500) {
    console.error("Server error:", data.message || "Internal server error");
  } else {
    console.error(`API error ${status}:`, data.message || "Unknown error");
  }
} else if (err.request) {
  // Network error (no response received)
  console.error("❌ Network error: Unable to reach server.", {
    url: err.config?.baseURL,
    details: "Check backend server status, network connectivity, and CORS settings."
  });
} else {
  // Other error
  console.error("Request error:", err.message);
}
return Promise.reject(err);
}
);

export default API;

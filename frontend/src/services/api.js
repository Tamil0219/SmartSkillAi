import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
  console.error("Network error: Unable to reach server. Check backend server status, network, and CORS settings.");
} else {
  // Other error
  console.error("Request error:", err.message);
}
return Promise.reject(err);
}
);

export default API;

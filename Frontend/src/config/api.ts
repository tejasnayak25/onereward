// API Configuration using Vite Proxy
export const getApiBaseUrl = (): string => {
  // Get current hostname and protocol
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  console.log("🌐 Environment:", { hostname, protocol });

  // If we have a custom API URL from environment variables, use it
  if (import.meta.env.VITE_API_URL) {
    console.log("🌐 Using VITE_API_URL:", import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // Use Vite proxy - all requests go through the frontend server
  // Vite will proxy /api requests to localhost:3000 automatically
  const apiUrl = "";  // Empty string means relative URLs (uses current origin)
  console.log("🌐 Using Vite proxy - API calls will be proxied through frontend");
  console.log("🌐 Frontend URL:", `${protocol}//${hostname}`);
  console.log("🌐 API calls will go to:", `${protocol}//${hostname}/api/*`);
  console.log("🌐 Vite will proxy to: http://localhost:3000/api/*");

  return apiUrl;
};

export const API_BASE_URL = getApiBaseUrl();

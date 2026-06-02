const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Fallback to the hostname from which the page is served, on port 5001 (backend port)
  const hostname = window.location.hostname || 'localhost';
  return `http://${hostname}:5001`;
};

export const API_BASE_URL = getApiBaseUrl();

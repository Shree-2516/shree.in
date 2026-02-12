import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const fetchPortfolio = () => API.get("/portfolio");
import axios from "axios";

const normalizeBaseUrl = (url = "") => url.replace(/\/+$/, "");

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL || "");
export const FALLBACK_API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_FALLBACK_API_URL || "https://portfolio-server-9xlp.onrender.com"
);

const toApiBase = (baseUrl) => (baseUrl ? `${baseUrl}/api` : "/api");
const toApiUrl = (baseUrl, path) => `${toApiBase(baseUrl)}${path}`;

const API = axios.create({ baseURL: toApiBase(API_BASE_URL) });

const hasFallback =
  FALLBACK_API_BASE_URL && FALLBACK_API_BASE_URL !== API_BASE_URL;

const isNetworkError = (error) => !error?.response;

export const fetchPortfolio = async () => {
  try {
    return await API.get("/portfolio");
  } catch (error) {
    if (!hasFallback || !isNetworkError(error)) throw error;
    return axios.get(toApiUrl(FALLBACK_API_BASE_URL, "/portfolio"));
  }
};

export const fetchWithApiFallback = async (path, options) => {
  try {
    return await fetch(toApiUrl(API_BASE_URL, path), options);
  } catch (error) {
    if (!hasFallback) throw error;
    return fetch(toApiUrl(FALLBACK_API_BASE_URL, path), options);
  }
};

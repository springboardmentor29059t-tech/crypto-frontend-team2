// src/api/portfolio.js
const API_URL = "http://localhost:8080/api/portfolio";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return response.text();
  }
};

export const getPortfolioData = async () => {
  const response = await fetch(`${API_URL}/dashboard`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch portfolio");
  return response.json();
};

export const addPortfolioHolding = async (holdingData) => {
  const response = await fetch(`${API_URL}/manual`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(holdingData),
  });
  if (!response.ok) throw new Error("Failed to add holding");
  return handleResponse(response);
};

export const updatePortfolioHolding = async (id, holdingData) => {
  const response = await fetch(`${API_URL}/manual/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(holdingData),
  });
  if (!response.ok) throw new Error("Failed to update holding");
  return handleResponse(response);
};

export const deletePortfolioHolding = async (id) => {
  const response = await fetch(`${API_URL}/manual/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete holding");
  return handleResponse(response);
};
// src/api/priceHistory.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/prices'; // Adjust port if your backend runs on a different port

export const getPriceHistory = async (symbol) => {
  try {
    // Matches @GetMapping("/history/{symbol}")
    const response = await axios.get(`${API_URL}/history/${symbol}`);
    return response.data; // Returns List<PriceSnapshot>
  } catch (error) {
    console.error("Error fetching price history:", error);
    throw error;
  }
};

export const refreshPrices = async () => {
  try {
    // Matches @PostMapping("/refresh")
    const response = await axios.post(`${API_URL}/refresh`);
    return response.data;
  } catch (error) {
    console.error("Error refreshing prices:", error);
    throw error;
  }
};
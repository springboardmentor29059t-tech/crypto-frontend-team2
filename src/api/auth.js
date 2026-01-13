

// src/api/auth.js

const API_BASE_URL = "http://localhost:8080/api/auth";

// Helper function to handle responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }
    return await response.json();
};

// Note: 'export' keyword is required here
export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};

// Note: 'export' keyword is required here
export const registerUser = async (name, email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};
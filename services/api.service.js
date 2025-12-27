const axios = require("axios");
require("dotenv").config();

const apiClient = axios.create({
  baseURL: process.env.LARAVEL_API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json"
  }
});

async function fetchCategories() {
  try {
    const response = await apiClient.get("/finlog-categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories from Laravel API:", error.message);
    return [];
  }
}

async function storeFinancialLog(data) {
  try {
    const response = await apiClient.post("/finlog", data);
    return response.data;
  } catch (error) {
    console.error("Error storing financial log:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
}

module.exports = {
  fetchCategories,
  storeFinancialLog
};

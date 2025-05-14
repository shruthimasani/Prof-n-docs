import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // Backend URL

export const loginUser = async (username, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { username, password });
    return res.data; // { user }
  } catch (err) {
    throw err.response?.data || { msg: "Server error" };
  }
};

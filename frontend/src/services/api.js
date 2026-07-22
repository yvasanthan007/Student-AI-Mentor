import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.76.60:8000",
});

export default api;
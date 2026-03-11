import axios from "axios";

const apiHost = window.location.hostname || "localhost";
const API_BASE =
  process.env.REACT_APP_API_BASE || `http://${apiHost}:5000/api`;

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

export default API;

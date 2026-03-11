import axios from "axios";

const apiHost = window.location.hostname || "localhost";

const API = axios.create({
  baseURL: `http://${apiHost}:5000/api`,
  withCredentials: true
});

export default API;

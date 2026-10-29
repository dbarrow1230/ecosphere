import axios from "axios";

const api=axios.create({baseURL:"/api/bats",withCredentials:true});
export default api;

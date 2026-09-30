import axios from "axios";
import {getStoredToken} from "../utils/storedUser.js";

const api=axios.create({baseURL:"/api/blog"});
api.interceptors.request.use(config=>{const token=getStoredToken();if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
export default api;

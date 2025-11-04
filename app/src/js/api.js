import { API_URL } from "./config.js";
import { STORAGE_KEY } from "./controllers/auth.js";

export async function request(path, options = {}) {
    const headers = {
        "Content-Type": "application/json"
    }

    const access_token = localStorage.getItem(STORAGE_KEY);

    if (access_token) {
        headers['Authorization'] = `Bearer ${access_token}`;
    }
    
    const res = await fetch(API_URL + path, {
        headers: headers,
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
}
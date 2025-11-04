import { request } from "../api.js";

export const STORAGE_KEY = "auth_user";

export async function register({ name, last_name, email, password }) {
    return request("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name,
                last_name,
                email,
                password
            })
        }
    );
}

export async function login({ email, password }) {
    return request("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: email,
                password: password
            })
        }
    );
}

export function logout(navigateTo) {
    localStorage.removeItem(STORAGE_KEY);
    navigateTo("#/login");
}

export async function validateSession(navigateTo) {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
        logout(navigateTo);
        return false;
    }

    try {
        const response = await request("/me", {
            method: "GET"
        });

        if (!response.data) {
            logout(navigateTo);
            return false;
        }

        return response.data;
    } catch (e) {
        logout(navigateTo);
        return false;
    }
}

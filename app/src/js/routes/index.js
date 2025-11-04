import { LoginView } from "../views/auth/login.js";
import { RegisterView } from "../views/auth/register.js";
import { MainView } from "../views/main.js";

export const routes = {
    "#/login": {
        view: LoginView,
        require_auth: false,
    },
    "#/register": {
        view: RegisterView,
        require_auth: false
    },
    "#/": {
        view: MainView,
        require_auth: true
    }
}
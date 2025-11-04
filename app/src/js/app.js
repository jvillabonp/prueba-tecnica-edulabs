import { routes } from "./routes/index.js";
import { NotFoundView } from "./views/errors/404.js";
import { validateSession } from "./controllers/auth.js";

const root = document.getElementById("app");

function render(html) {
    root.innerHTML = html;
}

function navigateTo(hash) {
    window.location.hash = hash;
}

async function handleRoute() {
    const hash = location.hash || "#/login";

    if (!routes.hasOwnProperty(hash)) {
        render(NotFoundView(navigateTo));
        return;
    }

    const route = routes[hash];
    let user = null;

    if (route.require_auth) {
        user = await validateSession(navigateTo);
    }

    const view = route.view(navigateTo, user);

    await view.preRender?.();
    render(view.html);
    view.postRender?.();
}

window.addEventListener("hashchange", handleRoute);
window.addEventListener("load", handleRoute);
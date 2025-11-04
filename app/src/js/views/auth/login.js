import { login, STORAGE_KEY, validateSession } from "../../controllers/auth.js";

export function LoginView(navigate) {
    const html = `
    <div class="min-h-screen">
        <div class="relative p-6 bg-white z-1 sm:p-0">
            <div class="relative flex flex-col justify-center w-full h-screen lg:flex-row">
                <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                        <div>
                            <div class="mb-5 sm:mb-8">
                                <h1 class="mb-2 font-semibold text-gray-800 text-4xl">Iniciar sesión</h1>
                                <p class="text-sm text-gray-500">Ingresa el usuario y contraseña</p>
                            </div>
                        </div>
                        <div>
                            <form id="loginForm" autocomplete="off">
                                <div class="space-y-5">
                                    <div>
                                        <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700">Correo electrónico <span class="text-red-500">*</span></label>
                                        <input type="email" id="email" name="email" placeholder="usuario@dominio.com" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400" required>
                                    </div>
                                    <div>
                                        <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700">Contraseña <span class="text-red-500">*</span></label>
                                        <input type="password" id="password" name="password" placeholder="********" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400" required>
                                    </div>
                                    <div>
                                        <button type="submit" class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-blue-500 shadow-theme-xs hover:bg-blue-600 cursor-pointer">Ingresar</button>
                                    </div>
                                </div>
                            </form>
                            <div class="mt-5">
                                <p class="text-sm font-normal text-center text-gray-700 sm:text-start">¿No tienes cuenta? <a href="/#/register" class="text-blue-500 hover:text-blue-600">Regístrate</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    return {
        html,
        preRender: async () => {
            const hasSession = await validateSession(navigate);
            if (hasSession) navigate("#/");
        },
        postRender: () => {
            const form = document.getElementById("loginForm");

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                Swal.fire({
                    title: 'Iniciando sesión...',
                    showConfirmButton: false,
                    allowOusideClick: false,
                    allowEscapeKey: false,
                    willOpen: () => Swal.showLoading()
                });

                const fd = new FormData(form);
                const email = fd.get("email");
                const password = fd.get("password");

                try {
                    const { access_token } = await login({ email, password });

                    localStorage.setItem(
                        STORAGE_KEY,
                        access_token
                    );

                    Swal.close();

                    navigate("#/");
                } catch (err) {
                    Swal.fire(err.message || "Error al iniciar sesión", "", "error");
                }
            });
        },
    };
}
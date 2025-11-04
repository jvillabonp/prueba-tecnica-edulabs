import { register, STORAGE_KEY, validateSession } from "../../controllers/auth.js";

export function RegisterView(navigate) {
    const html = `
    <div class="min-h-screen">
        <div class="relative p-6 bg-white z-1 sm:p-0">
            <div class="relative flex flex-col justify-center w-full h-screen lg:flex-row">
                <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                        <div>
                            <div class="mb-5 sm:mb-8">
                                <h1 class="mb-2 font-semibold text-gray-800 text-4xl">Registrate</h1>
                                <p class="text-sm text-gray-500">Completa el formulario para poder acceder</p>
                            </div>
                        </div>
                        <div>
                            <form id="registerForm" autocomplete="off">
                                <div class="space-y-5">
                                    <div>
                                        <label for="name" class="mb-1.5 block text-sm font-medium text-gray-700">Nombre <span class="text-red-500">*</span></label>
                                        <input type="text" id="name" name="name" placeholder="Juan" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400" required>
                                    </div>
                                    <div>
                                        <label for="last_name" class="mb-1.5 block text-sm font-medium text-gray-700">Apellido <span class="text-red-500">*</span></label>
                                        <input type="text" id="last_name" name="last_name" placeholder="Perez" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400" required>
                                    </div>
                                    <div>
                                        <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700">Correo electrónico <span class="text-red-500">*</span></label>
                                        <input type="email" id="email" name="email" placeholder="usuario@dominio.com" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400" required>
                                    </div>
                                    <div>
                                        <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700">Contraseña <span class="text-red-500">*</span></label>
                                        <input type="password" id="password" name="password" placeholder="********" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400" required>
                                    </div>
                                    <div>
                                        <button type="submit" class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-blue-500 shadow-theme-xs hover:bg-blue-600 cursor-pointer">Registrar</button>
                                    </div>
                                </div>
                            </form>
                            <div class="mt-5">
                                <p class="text-sm font-normal text-center text-gray-700 sm:text-start">¿Ya tienes cuenta? <a href="/#/login" class="text-blue-500 hover:text-blue-600">Regístrate</a></p>
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
        postRender: () => {
            const form = document.getElementById("registerForm");

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                Swal.fire({
                    title: 'Registrando...',
                    showConfirmButton: false,
                    allowOusideClick: false,
                    allowEscapeKey: false,
                    willOpen: () => Swal.showLoading()
                });

                const fd = new FormData(form);
                const name = fd.get("name");
                const last_name = fd.get("last_name");
                const email = fd.get("email");
                const password = fd.get("password");

                try {
                    const { access_token } = await register({ name, last_name, email, password });

                    localStorage.setItem(
                        STORAGE_KEY,
                        access_token
                    );

                    Swal.close();

                    navigate("#/");
                } catch (err) {
                    let html = `<ul>`;
                    for (let i in err?.data) {
                        html += `<li class="text-red-500">${i}: ${err.data[i][0]}</li>`;
                    }
                    html += `</ul>`;
                    Swal.fire({
                        title: err?.message,
                        html: html,
                        icon: "error"
                    });
                }
            });
        },
    };
}
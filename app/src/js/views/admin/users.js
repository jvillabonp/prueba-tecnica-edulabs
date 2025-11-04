import { request } from "../../api.js";
import { formatBytes } from "../../helper.js";

export function UserListView(user) {
    const html = `
        <div class="col-span-12 xl:col-span-7">
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
                <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">Usuarios</h3>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="open-modal" class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 cursor-pointer">Registrar usuario</button>
                    </div>
                </div>
                
                <div class="max-w-full overflow-x-auto custom-scrollbar">
                    <table class="min-w-full">
                        <thead>
                            <tr class="border-t border-gray-100">
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Nombre</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Correo electrónico</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Grupo</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Rol</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Espacio</p></th>
                            </tr>
                        </thead>
                        <tbody id="table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div id="modal" class="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex justify-center items-center hidden">
            <div class="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 class="text-xl font-semibold mb-4">Registrar/Editar Usuario</h2>
                <form id="user-form" autocomplete="off">
                    <div class="mb-4">
                        <label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
                        <input id="name" type="text" class="mt-1 p-2 w-full border border-gray-300 rounded-md disabled:bg-gray-50" required />
                    </div>
                    <div class="mb-4">
                        <label for="last_name" class="block text-sm font-medium text-gray-700">Apellido</label>
                        <input id="last_name" type="text" class="mt-1 p-2 w-full border border-gray-300 rounded-md disabled:bg-gray-50" required />
                    </div>
                    <div class="mb-4">
                        <label for="email" class="block text-sm font-medium text-gray-700">Correo electrónico</label>
                        <input id="email" type="email" class="mt-1 p-2 w-full border border-gray-300 rounded-md disabled:bg-gray-50" required />
                    </div>
                    <div class="mb-4">
                        <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input id="password" type="password" class="mt-1 p-2 w-full border border-gray-300 rounded-md disabled:bg-gray-50" />
                    </div>
                    <div class="mb-4">
                        <label for="role" class="block text-sm font-medium text-gray-700">Rol</label>
                        <select id="role" class="mt-1 p-2 w-full border border-gray-300 rounded-md disabled:bg-gray-50" required>
                            <option value="" selected>Selecciona...</option>
                            <option value="1">Administrador</option>
                            <option value="2">Usuario</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="group" class="block text-sm font-medium text-gray-700">Grupo</label>
                        <select id="group" class="mt-1 p-2 w-full border border-gray-300 rounded-md disabled:bg-gray-50"></select>
                    </div>
                    <div class="mb-4">
                        <label for="quota" class="block text-sm font-medium text-gray-700">Espacio (MB)</label>
                        <input id="quota" type="number" class="mt-1 p-2 w-full border border-gray-300 rounded-md" />
                    </div>
                    <div class="flex justify-end gap-3">
                        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer">Guardar</button>
                        <button type="button" id="close-modal" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-pointer">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `

    return {
        html,
        onRender: async () => {
            const table = document.getElementById("table-body");
            const elementUserButton = document.querySelector('[data-action="user-list"]');

            const name = document.getElementById("name");
            const last_name = document.getElementById("last_name");
            const email = document.getElementById("email");
            const password = document.getElementById("password");
            const role = document.getElementById("role");
            const group = document.getElementById("group");
            const quota = document.getElementById("quota");

            let userId = null;

            const reqGroups = await request("/admin/group", {
                method: "GET"
            });

            let groupHtml = `
                <option value="" selected>Selecciona...</option>
            `;

            reqGroups.data.forEach(group => {
                groupHtml += `
                    <option value="${group.id}">${group.name}</option>
                `;
            });

            group.innerHTML = groupHtml;

            const req = await request("/admin/user", {
                method: "GET"
            });
            
            const users = req.data;

            let html = '';

            users.forEach(user => {
                html += `
                <tr class="border-t border-gray-100">
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${user.fullName}</p></td>
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${user.email}</p></td>
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${user.group ?? 'Sin grupo'}</p></td>
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${user.role}</p></td>
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${formatBytes(user.usage)} / ${formatBytes(user.quota)}</p></td>
                    <td class="py-3 whitespace-nowrap gap-4">
                        <button class="text-blue-500 hover:text-blue-700 edit-user cursor-pointer" data-id="${user.id}">Editar</button>
                        <button class="text-red-500 hover:text-red-700 delete-user cursor-pointer" data-id="${user.id}">Eliminar</button>
                    </td>
                </tr>
                `
            });

            table.innerHTML = html;            

            document.getElementById("open-modal").addEventListener("click", () => {
                document.getElementById("modal").classList.remove("hidden");
            });

            document.getElementById("close-modal").addEventListener("click", () => {
                document.getElementById("modal").classList.add("hidden");
            });

            document.querySelectorAll(".delete-user").forEach(button => {
                button.addEventListener("click", async (event) => {
                    userId = event.target.dataset.id;

                    if (userId == user.id) return;

                    Swal.fire({
                        title: '¿Desea eliminar este usuario?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Confirmar',
                        cancelButtonText: 'Cancelar'
                    }).then(async (res) => {
                        if (res.isConfirmed) {
                            const userReq = await request(`/admin/user/${userId}`, {
                                method: "DELETE"
                            });
                            
                            Swal.fire(userReq.message, "", "success")
                            .then(() => {
                                userId = null;
                                if (elementUserButton) elementUserButton.click();
                                else location.reload();
                            });
                        }
                    })
                });
            });

            document.querySelectorAll(".edit-user").forEach(button => {
                button.addEventListener("click", async (event) => {
                    userId = event.target.dataset.id;

                    if (typeof userId != 'undefined') {
                        const userReq = await request(`/admin/user/${userId}`, {
                            method: "GET"
                        });

                        const userData = userReq.data;

                        name.value = userData.name;
                        last_name.value = userData.last_name;
                        email.value = userData.email;
                        email.readOnly = true;
                        password.value = "";
                        role.value = userData.role_id;
                        group.value = userData.group_id;                        
                        quota.value = userData.quota_bytes / 1024 / 1024;
                    }

                    document.getElementById("modal").classList.remove("hidden");
                });
            });

            document.getElementById("user-form").addEventListener("submit", async (e) => {
                e.preventDefault();

                Swal.fire({
                    title: 'Guardando datos...',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    willOpen:() => Swal.showLoading()
                });

                const data = {
                    name: name.value,
                    last_name: last_name.value,
                    role_id: role.value,
                    group_id: group.value.trim() == "" ? null : group.value,
                    password: password.value.trim() == "" && userId ? null : password.value,
                    quota_bytes: quota.value * 1024 * 1024,
                };

                if (!userId) {
                    data["email"] = email.value;
                }

                const method = userId ? 'PUT' : 'POST';
                const url = userId ? `/admin/user/${userId}` : `/admin/user`;

                try {
                    const response = await request(url, {
                        method,
                        body: JSON.stringify(data)
                    });

                    if (response.success) {
                        Swal.fire(response.message, "", "success")
                        .then(() => {
                            document.getElementById("modal").classList.add("hidden");
                            name.value = "";
                            last_name.value = "";
                            email.value = "";
                            email.readOnly = false;
                            password.value = "";
                            role.value = "";
                            group.value = "";
                            quota.value = "";
                            if (elementUserButton) elementUserButton.click();
                            else location.reload();
                        });
                    } else {
                        Swal.fire("Error al guardar el usuario", response.message, "error");
                    }
                } catch (e) {
                    let html = `<ul>`;
                    for (let i in e?.data) {
                        html += `<li class="text-red-500">${i}: ${e.data[i][0]}</li>`;
                    }
                    html += `</ul>`;
                    Swal.fire({
                        title: e.message,
                        html: html,
                        icon: "error"
                    });
                }
            });
        }
    }
} 
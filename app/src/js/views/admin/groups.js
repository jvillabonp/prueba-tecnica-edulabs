import { request } from "../../api.js";
import { formatBytes } from "../../helper.js";

export function GroupListView(user) {
    const html = `
        <div class="col-span-12 xl:col-span-7">
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
                <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">Grupos</h3>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="open-modal" class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 cursor-pointer">Registrar grupo</button>
                    </div>
                </div>
                
                <div class="max-w-full overflow-x-auto custom-scrollbar">
                    <table class="min-w-full">
                        <thead>
                            <tr class="border-t border-gray-100">
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Nombre</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Cantidad de usuarios</p></th>
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
                <h2 class="text-xl font-semibold mb-4">Registrar/Editar Grupo</h2>
                <form id="group-form" autocomplete="off">
                    <div class="mb-4">
                        <label for="name" class="block text-sm font-medium text-gray-700">Nombre del grupo</label>
                        <input id="name" type="text" class="mt-1 p-2 w-full border border-gray-300 rounded-md disabled:bg-gray-50" required />
                    </div>
                    <div class="mb-4">
                        <label for="quota" class="block text-sm font-medium text-gray-700">Espacio (MB)</label>
                        <input id="quota" type="number" class="mt-1 p-2 w-full border border-gray-300 rounded-md" required />
                    </div>
                    <div class="flex justify-end gap-3">
                        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer">Guardar</button>
                        <button type="button" id="close-modal" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-pointer">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    return {
        html,
        onRender: async () => {
            const table = document.getElementById("table-body");
            const elementGroupButton = document.querySelector('[data-action="group-list"]');
            let groupId = null;

            const req = await request("/admin/group", {
                method: "GET"
            });
            
            const groups = req.data;

            let html = '';

            groups.forEach(group => {
                html += `
                <tr class="border-t border-gray-100">
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${group.name}</p></td>
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${group.users}</p></td>
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${formatBytes(group.usage)} / ${formatBytes(group.quota)}</p></td>
                    <td class="py-3 whitespace-nowrap gap-4">
                        <button class="text-blue-500 hover:text-blue-700 edit-group cursor-pointer" data-id="${group.id}">Editar</button>
                        <button class="text-red-500 hover:text-red-700 delete-group cursor-pointer" data-id="${group.id}">Eliminar</button>
                    </td>
                </tr>
                `
            });

            table.innerHTML = html;

            const name = document.getElementById("name");
            const quota = document.getElementById("quota");

            document.getElementById("open-modal").addEventListener("click", () => {
                document.getElementById("modal").classList.remove("hidden");
            });

            document.getElementById("close-modal").addEventListener("click", () => {
                document.getElementById("modal").classList.add("hidden");
            });

            document.querySelectorAll(".delete-group").forEach(button => {
                button.addEventListener("click", async (event) => {
                    groupId = event.target.dataset.id;

                    Swal.fire({
                        title: '¿Desea eliminar este grupo?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Confirmar',
                        cancelButtonText: 'Cancelar'
                    }).then(async (res) => {
                        if (res.isConfirmed) {
                            const groupReq = await request(`/admin/group/${groupId}`, {
                                method: "DELETE"
                            });
                            
                            Swal.fire(groupReq.message, "", "success")
                            .then(() => {
                                groupId = null;
                                if (elementGroupButton) elementGroupButton.click();
                                else location.reload();
                            });
                        }
                    })
                });
            });

            document.querySelectorAll(".edit-group").forEach(button => {
                button.addEventListener("click", async (event) => {
                    groupId = event.target.dataset.id;

                    if (typeof groupId != 'undefined') {
                        const groupReq = await request(`/admin/group/${groupId}`, {
                            method: "GET"
                        });

                        const groupData = groupReq.data;

                        name.value = groupData.name;
                        name.readOnly = true;
                        quota.value = groupData.quota_bytes / 1024 / 1024;
                    }

                    document.getElementById("modal").classList.remove("hidden");
                });
            });

            document.getElementById("group-form").addEventListener("submit", async (e) => {
                e.preventDefault();

                Swal.fire({
                    title: 'Guardando datos',
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading()
                    }
                });

                const data = {
                    name: name.value,
                    quota_bytes: quota.value * 1024 * 1024
                };

                const method = groupId ? 'PUT' : 'POST';
                const url = groupId ? `/admin/group/${groupId}` : `/admin/group`;

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
                            name.readOnly = false;
                            quota.value = "";
                            if (elementGroupButton) elementGroupButton.click();
                            else location.reload();
                        });
                    } else {
                        Swal.fire("Error al guardar el grupo", response.message, "error");
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
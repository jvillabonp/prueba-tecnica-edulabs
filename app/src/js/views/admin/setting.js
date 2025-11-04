import { request } from "../../api.js";
import { formatBytes } from "../../helper.js";

export function SettingView() {
    const html = `
        <div class="col-span-12 xl:col-span-7">
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
                <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">Ajustes del sitio</h3>
                    </div>
                </div>
                
                <div class="max-w-full overflow-x-auto custom-scrollbar">
                    <form id="setting-form" autocomplete="off">
                        <div class="mb-4">
                            <label for="quota" class="block text-sm font-medium text-gray-700">Cuota por defecto MB</label>
                            <input id="quota" type="number" class="mt-1 p-2 w-full border border-gray-300 rounded-md disabled:bg-gray-50" required min="1" />
                        </div>
                        <div class="mb-4">
                            <label for="extensions" class="block text-sm font-medium text-gray-700">Extensiones no permitidas</label>
                            <textarea id="extensions" class="mt-1 p-2 w-full border border-gray-300 rounded-md" required></textarea>
                        </div>
                        <div class="flex justify-end gap-3">
                            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    return {
        html,
        onRender: async () => {
            const quota = document.getElementById("quota");
            const extensions = document.getElementById("extensions");

            const settingReq = await request('/admin/setting', {
                method: "GET"
            });

            const data = settingReq.data;

            quota.value = data.quota / 1024 / 1024;
            extensions.value = data.extensions.join(",");

            document.getElementById("setting-form").addEventListener("submit", async (e) => {
                e.preventDefault();

                Swal.fire({
                    title: 'Actualizando ajustes...',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    willOpen:() => Swal.showLoading()
                });

                const data = {
                    quota: quota.value * 1024 * 1024,
                    extensions: extensions.value.split(",")
                };

                try {
                    const response = await request("/admin/setting", {
                        method: "PATCH",
                        body: JSON.stringify(data)
                    });

                    if (response.success) {
                        Swal.fire(response.message, "", "success");
                    } else {
                        Swal.fire("Error al guardar los ajustes", response.message, "error");
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
            })
        }
    }
}
import { request } from "../../api.js";
import { formatBytes } from "../../helper.js";
import { API_URL } from "../../config.js";
import { STORAGE_KEY } from "../../controllers/auth.js";
import { globalIcon, groupIcon, eyeCloseIcon, trashIcon } from "../../icons.js";

function download(uuid, filename) {
    const access_token = localStorage.getItem(STORAGE_KEY);

    fetch(`${API_URL}/file/download/${uuid}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo descargar el archivo');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
        })
        .catch(error => {
            Swal.fire('Error al descargar el archivo', "", "error");
        });
}

export function FileListView(user) {
    const html = `
        <div class="col-span-12 xl:col-span-7">
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
                <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">Mis archivos</h3>
                    </div>
                </div>
                
                <div class="max-w-full overflow-x-auto custom-scrollbar">
                    <table class="min-w-full">
                        <thead>
                            <tr class="border-t border-gray-100">
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Nombre</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Fecha</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Tamaño</p></th>
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
                <h2 class="text-xl font-semibold mb-4">Editar permisos</h2>
                <form id="file-form" autocomplete="off">
                    <div class="mb-4">
                        <label for="privacy" class="block text-sm font-medium text-gray-700">Privacidad</label>
                        <select id="privacy" class="mt-1 p-2 w-full border border-gray-300 rounded-md" required>
                            <option value="private">Privado</option>
                            <option value="group">Grupo</option>
                            <option value="public">Público</option>
                        </select>
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
            const elementFileButton = document.querySelector('[data-action="file-list"]');
            let fileId = null;

            const req = await request("/file", {
                method: "GET"
            });
            
            const files = req.data;

            let html = '';

            const icons = {
                'private': eyeCloseIcon,
                'public': globalIcon,
                'group': groupIcon
            }

            files.forEach(file => {
                html += `
                <tr class="border-t border-gray-100">
                    <td class="py-3 whitespace-nowrap">
                        <div class="flex items-center gap-3">                            
                            <div>
                                <p class="font-medium text-gray-800 text-theme-sm download-file cursor-pointer" data-id="${file.id}" data-name="${file.name}">${file.name}</p>
                                <p class="flex gap-1">
                                    <span class="text-gray-500 text-theme-xs">${file.id}</span>
                                    <span>${icons[file.privacy]}</span>
                                </p>
                            </div>
                        </div>
                    </td>
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${file.created_at}</p></td>
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${formatBytes(file.size)}</p></td>
                    <td class="py-3 whitespace-nowrap gap-4">
                        <button class="text-blue-500 hover:text-blue-700 edit-file cursor-pointer" data-id="${file.id}">Cambiar permisos</button>
                        <button class="text-red-500 hover:text-red-700 delete-file cursor-pointer" data-id="${file.id}">Eliminar</button>
                    </td>
                </tr>
                `
            });

            table.innerHTML = html;

            const privacy = document.getElementById("privacy");

            document.getElementById("close-modal").addEventListener("click", () => {
                document.getElementById("modal").classList.add("hidden");
            });

            document.querySelectorAll(".download-file").forEach(button => {
                button.addEventListener("click", async (event) => {
                    download(event.target.dataset.id, event.target.dataset.name);
                })
            });

            document.querySelectorAll(".delete-file").forEach(button => {
                button.addEventListener("click", async (event) => {
                    fileId = event.target.dataset.id;

                    Swal.fire({
                        title: '¿Desea enviar este archivo a la papelera?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Confirmar',
                        cancelButtonText: 'Cancelar'
                    }).then(async (res) => {
                        if (res.isConfirmed) {
                            Swal.fire({
                                title: 'Enviando a la papelera...',
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                showConfirmButton: false,
                                willOpen:() => Swal.showLoading()
                            });

                            const fileReq = await request(`/file/${fileId}`, {
                                method: "DELETE"
                            });
                            
                            Swal.fire(fileReq.message, "", "success")
                            .then(() => {
                                fileId = null;
                                if (elementFileButton) elementFileButton.click();
                                else location.reload();
                            });
                        }
                    })
                });
            });

            document.querySelectorAll(".edit-file").forEach(button => {
                button.addEventListener("click", async (event) => {
                    fileId = event.target.dataset.id;

                    if (typeof fileId != 'undefined') {
                        const fileReq = await request(`/file/${fileId}`, {
                            method: "GET"
                        });

                        privacy.value = fileReq.data?.privacy;
                    }
                    
                    document.getElementById("modal").classList.remove("hidden");
                });
            });

            document.getElementById("file-form").addEventListener("submit", async (e) => {
                e.preventDefault();

                Swal.fire({
                    title: 'Cambiando permisos',
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading()
                    }
                });

                const data = {
                    privacy: privacy.value
                };

                const response = await request(`/file/${fileId}`, {
                    method: "PATCH",
                    body: JSON.stringify(data)
                });

                if (response.success) {
                    Swal.fire(response.message, "", "success")
                    .then(() => {
                        document.getElementById("modal").classList.add("hidden");
                        privacy.value = "";
                        if (elementFileButton) elementFileButton.click();
                        else location.reload();
                    });
                } else {
                    Swal.fire("Error al guardar el grupo", response.message, "error");
                }
            });
        }
    }
}

export function FileUploadView(user) {
    const html = `
    <div class="rounded-2xl border border-gray-200 bg-white">
        <div class="px-6 py-5">
            <h3 class="text-base font-medium text-gray-800">Carga de archivos</h3>
        </div>
        <div class="p-4 border-t border-gray-100 sm:p-6">
            <div class="space-y-5">
                <div class="file-uploader">
                    <form id="dropzone" class="border-gray-300 border-dashed dropzone rounded-xl bg-gray-50 p-7 hover:border-brand-500 lg:p-10 dz-clickable">
                        <input type="file" id="file" name="file" class="hidden" required />
                        <div class="dz-message m-0!">
                            <div class="mb-[22px] flex justify-center">
                                <div class="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700">
                                    <svg class="fill-current" width="29" height="28" viewBox="0 0 29 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z" fill=""></path>
                                    </svg>
                                </div>
                            </div>
                            <span class="mx-auto mb-5 block w-full max-w-[290px] text-sm text-gray-700">Carga tus archivos desde el explorador de archivos de tu dispositivo</span>
                            <label for="file" class="mx-auto mb-5 block w-full max-w-[290px] font-medium underline cursor-pointer text-theme-sm text-brand-500">Buscar archivo</label>
                        </div>
                    </form>
                </div>

                <div class="w-full bg-gray-200 rounded-full hidden" id="progress-bar">
                    <div class="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" id="upload-progress" style="width: 0%">0%</div>
                </div>
            </div>
        </div>
    </div>
    `;

    return {
        html,
        onRender: async () => {
            const access_token = localStorage.getItem(STORAGE_KEY);

            const fileInput = document.getElementById("file");
            const form = document.getElementById("dropzone");
            const progressBar = document.getElementById('progress-bar');
            const uploadProgress = document.getElementById('upload-progress');
            
            fileInput.addEventListener("change", function () {
                if (fileInput.files.length === 0) return;
                
                progressBar.classList.remove('hidden');

                const file = fileInput.files[0];
                const formData = new FormData();
                formData.append("file", file);

                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${API_URL}/file`);
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);

                xhr.upload.addEventListener('progress', (evt) => {
                    if (evt.lengthComputable) {
                        const pct = Math.round((evt.loaded / evt.total) * 100);
                        uploadProgress.style.width = pct + '%';
                        uploadProgress.innerText = pct + '%';
                    }
                });

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const res = JSON.parse(xhr.responseText);
                        if (res.message) {
                            uploadProgress.classList.remove("bg-blue-600");
                            uploadProgress.classList.add("bg-green-600");

                            Swal.fire({
                                title: 'Archivo cargado correctamente',
                                text: res.message,
                                icon: 'success'
                            }).then(() => {
                                progressBar.classList.add('hidden');
                                uploadProgress.style.width = '0%';
                                uploadProgress.innerText = '0%';
                                uploadProgress.classList.add("bg-blue-600");
                                uploadProgress.classList.remove("bg-green-600");
                                fileInput.value = '';

                                location.reload();
                            });
                            form.reset();
                        } else {
                            statusEl.textContent = res.error || 'Error desconocido';
                        }
                    } else {
                        try {
                            const r = JSON.parse(xhr.responseText);
                            uploadProgress.classList.remove("bg-blue-600");
                            uploadProgress.classList.add("bg-red-600");

                            Swal.fire({
                                title: 'Error al cargar el archivo',
                                text: r.message,
                                icon: 'error'
                            }).then(() => {
                                progressBar.classList.add('hidden');
                                uploadProgress.style.width = '0%';
                                uploadProgress.innerText = '0%';
                                uploadProgress.classList.add("bg-blue-600");
                                uploadProgress.classList.remove("bg-red-600");
                                fileInput.value = '';
                            });
                        } catch {
                            statusEl.textContent = 'Error en la carga';
                        }
                    }
                };

                xhr.onerror = () => {
                    statusEl.textContent = 'Fallo de red.';
                };

                xhr.send(formData);
            });
        }
    }
}

export function FileSharedListView(user) {
    const html = `
        <div class="col-span-12 xl:col-span-7">
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
                <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">Archivos compartidos</h3>
                    </div>
                </div>
                
                <div class="max-w-full overflow-x-auto custom-scrollbar">
                    <table class="min-w-full">
                        <thead>
                            <tr class="border-t border-gray-100">
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Nombre</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Propietario</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Fecha</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Tamaño</p></th>
                            </tr>
                        </thead>
                        <tbody id="table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `

    return {
        html,
        onRender: async () => {
            const table = document.getElementById("table-body");

            const req = await request("/file/shared", {
                method: "GET"
            });
            
            const files = req.data;

            let html = '';

            const icons = {
                'public': globalIcon,
                'group': groupIcon
            }

            files.forEach(file => {
                html += `
                <tr class="border-t border-gray-100">
                    <td class="py-3 whitespace-nowrap">
                        <div class="flex items-center gap-3">                            
                            <div>
                                <p class="font-medium text-gray-800 text-theme-sm download-file cursor-pointer" data-id="${file.id}" data-name="${file.name}">${file.name}</p>
                                <p class="flex gap-1">
                                    <span class="text-gray-500 text-theme-xs">${file.id}</span>
                                    <span>${icons[file.privacy]}</span>
                                </p>
                            </div>
                        </div>
                    </td>
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${file.owner}</p></td>
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${file.created_at}</p></td>
                    <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${formatBytes(file.size)}</p></td>
                </tr>
                `
            });

            table.innerHTML = html;

            document.querySelectorAll(".download-file").forEach(button => {
                button.addEventListener("click", async (event) => {
                    download(event.target.dataset.id, event.target.dataset.name);
                })
            });
        }
    }
}

export function FileTrashView(user) {
    const html = `
        <div class="col-span-12 xl:col-span-7">
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
                <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">Papelera</h3>
                    </div>
                </div>
                
                <div class="max-w-full overflow-x-auto custom-scrollbar">
                    <table class="min-w-full" id="table">
                        <thead>
                            <tr class="border-t border-gray-100">
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Nombre</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Fecha de eliminación</p></th>
                                <th class="py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs">Tamaño</p></th>
                            </tr>
                        </thead>
                        <tbody id="table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `

    return {
        html,
        onRender: async () => {
            const table = document.getElementById("table-body");
            const elementFileButton = document.querySelector('[data-action="file-trash"]');
            let fileId = null;

            const req = await request("/file/trash", {
                method: "GET"
            });
            
            const files = req.data;

            if (files.length > 0) {
                let html = '';

                files.forEach(file => {
                    html += `
                    <tr class="border-t border-gray-100">
                        <td class="py-3 whitespace-nowrap">
                            <div class="flex items-center gap-3">                            
                                <div>
                                    <p class="font-medium text-gray-800 text-theme-sm">${file.name}</p>
                                    <span class="text-gray-500 text-theme-xs">${file.id}</span>
                                </div>
                            </div>
                        </td>
                        <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${file.deleted_at}</p></td>
                        <td class="py-3 whitespace-nowrap"><p class="text-gray-500 text-theme-sm">${formatBytes(file.size)}</p></td>
                        <td class="py-3 whitespace-nowrap gap-4">
                            <button class="text-blue-500 hover:text-blue-700 edit-file cursor-pointer" data-id="${file.id}">Restaurar</button>
                        </td>
                    </tr>
                    `
                });

                table.innerHTML = html;
            } else {
                const empty = `
                <div class="border-gray-300 border-dashed dropzone rounded-xl bg-gray-50 p-7 hover:border-brand-500 lg:p-10">
                    <div class="dz-message m-0!">
                        <div class="mb-[22px] flex justify-center">
                            <div class="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700">
                                ${trashIcon}
                            </div>
                        </div>
                        <span class="mx-auto mb-5 block w-full max-w-[290px] text-sm text-gray-700 text-center">La papelera está vacía</span>
                    </div>
                </div>
                `;
                document.getElementById("table").innerHTML = empty;
            }

            document.querySelectorAll(".edit-file").forEach(button => {
                button.addEventListener("click", async (event) => {
                    fileId = event.target.dataset.id;

                    if (typeof fileId != 'undefined') {
                        Swal.fire({
                            title: 'Restaurando...',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showConfirmButton: false,
                            willOpen:() => Swal.showLoading()
                        });

                        const fileReq = await request(`/file/trash/${fileId}`, {
                            method: "PATCH"
                        });

                        if (fileReq.success) {
                            fileId = null;
                            Swal.fire(fileReq.message, "", "success").then(() => {
                                elementFileButton.click();
                            });
                        } else location.reload();
                    }
                });
            });
        }
    }
}
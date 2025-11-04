import { FileListView, FileSharedListView, FileTrashView, FileUploadView } from "./file/index.js";
import { UserListView } from "./admin/users.js";
import { formatBytes  } from "../helper.js";
import { GroupListView } from "./admin/groups.js";
import { closeIcon, dashboardIcon, globalIcon, groupsIcon, settingsIcon, trashIcon, uploadFileIcon, usersIcon } from "../icons.js";
import { logout } from "../controllers/auth.js";
import { SettingView } from "./admin/setting.js";

export function MainView(navigate, user) {
    let adminMenu = '';
    if (user.role === 1) {
        adminMenu = `
        <div>
            <h2 class="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start">Admin</h2>
            <ul class="flex flex-col gap-4">
                <li>
                    <a href="javascript:void(0)" class="flex menu-item group gap-2 router-change" data-action="user-list">
                        <span>${usersIcon}</span>
                        <span class="menu-item-text">Usuarios</span>
                    </a>
                </li>

                <li>
                    <a href="javascript:void(0)" class="flex menu-item group gap-2 router-change" data-action="group-list">
                        <span>${groupsIcon}</span>
                        <span class="menu-item-text">Grupos</span>
                    </a>
                </li>
                
                <li>
                    <a href="javascript:void(0)" class="flex menu-item group gap-2 router-change" data-action="settings">
                        <span>${settingsIcon}</span>
                        <span class="menu-item-text">Configuración del sitio</span>
                    </a>
                </li>
            </ul>
        </div>
        `;
    }

    const html = `
    <div class="min-h-screen xl:flex">
        <aside class="fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200 lg:w-[290px] -translate-x-full lg:translate-x-0">
            <div class="py-8 flex justify-start">
                <a aria-current="page" href="#/" class="router-link-active router-link-exact-active">
                    <img src="https://moodle.com/wp-content/uploads/2019/03/edulabs.png" alt="Logo" width="150" height="40">
                </a>
            </div>
            <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav class="mb-6">
                    <div class="flex flex-col gap-4">
                        <div>
                            <h2 class="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start">Menu</h2>
                            <ul class="flex flex-col gap-4">
                                <li>
                                    <a href="javascript:void(0)" class="flex menu-item group gap-2 router-change" data-action="file-list">
                                        <span>${dashboardIcon}</span>
                                        <span class="menu-item-text">Dashboard</span>
                                    </a>
                                </li>

                                <li>
                                    <a href="javascript:void(0)" class="flex menu-item group gap-2 router-change" data-action="file-upload">
                                        <span>${uploadFileIcon}</span>
                                        <span class="menu-item-text">Subir archivo</span>
                                    </a>
                                </li>
                                
                                <li>
                                    <a href="javascript:void(0)" class="flex menu-item group gap-2 router-change" data-action="file-group">
                                        <span>${globalIcon}</span>
                                        <span class="menu-item-text">Archivos compartidos</span>
                                    </a>
                                </li>
                                
                                <li>
                                    <a href="javascript:void(0)" class="flex menu-item group gap-2 router-change" data-action="file-trash">
                                        <span>${trashIcon}</span>
                                        <span class="menu-item-text">Papelera</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        ${adminMenu}
                        <div class="absolute bottom-2">
                            <div class="w-full bg-gray-200 rounded-full">
                                <div class="bg-${((user.usage / user.quota) * 100) > 100 ? 'red' : 'blue'}-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style="width: ${user.quota > 0 ? ((user.usage / user.quota) * 100) > 100 ? '100' : ((user.usage / user.quota) * 100).toFixed(2) : '0'}%"></div>
                            </div>
                            <h2 class="flex leading-[20px] text-gray-400 justify-start">${formatBytes(user.usage)} de ${formatBytes(user.quota)} usados</h2>
                        </div>
                    </div>
                </nav>
            </div>
        </aside>

        <div class="flex-1 transition-all duration-300 ease-in-out lg:ml-[290px]">
            <header class="sticky top-0 flex w-full bg-white border-gray-200 z-99999 lg:border-b">
                <div class="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">                    
                    <div class="hidden items-center justify-between w-full gap-4 px-5 py-4 shadow-theme-md lg:flex lg:justify-end lg:px-0 lg:shadow-none">                        
                        <div class="relative">
                            <button class="flex items-center text-gray-700 cursor-pointer" id="logout">
                                <span class="block mr-1 font-medium text-theme-sm">${user.name} ${user.last_name}</span>
                                ${closeIcon}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6" id="content"></div>
        </div>
    </div>
    `;

    return {
        html,
        postRender: async () => {
            const content = document.getElementById("content");
            const fileListView = FileListView(user);
            content.innerHTML = fileListView.html;
            await fileListView.onRender?.();

            const routerList = {
                "file-list": FileListView(user),
                "file-upload": FileUploadView(user),
                "file-group": FileSharedListView(user),
                "file-trash": FileTrashView(user),
                "user-list": UserListView(user),
                "group-list": GroupListView(user),
                "settings": SettingView()
            };

            document.querySelectorAll(".router-change").forEach(function(element) {
                element.addEventListener("click", async function () {
                    const action = element.dataset.action;
                    const route = routerList[action];

                    content.innerHTML = route.html;
                    await route.onRender?.();
                });
            });

            document.getElementById("logout").addEventListener("click", function () {
                logout(navigate);
            });
        }
    };
}
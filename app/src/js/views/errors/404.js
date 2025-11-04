export function NotFoundView(navigate) {
    return `
    <div class="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <div>
            <div class="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
                <img src="/src/images/grid-01.svg" alt="grid">
            </div>
            
            <div class="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
                <img src="/src/images/grid-01.svg" alt="grid">
            </div>
        </div>
        
        <div class="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
            <h1 class="mb-8 font-bold text-gray-800 text-md xl:text-2xl">ERROR</h1>
            <img src="/src/images/404.svg">
            <p class="mt-10 mb-6 text-base text-gray-700 sm:text-lg">Este recurso no existe</p>
            <a href="/#/" class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800">Regresar al inicio</a>
        </div>
    </div>
    `;
}
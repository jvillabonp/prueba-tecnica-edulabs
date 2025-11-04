export function formatBytes(bytes) {
    if (bytes === 0) return '0 Byte';

    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    const size = (bytes / Math.pow(1024, i)).toFixed(2);

    return `${size} ${units[i]}`;
}
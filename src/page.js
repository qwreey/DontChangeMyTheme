
const electron = require('electron');
const Main = require('electron/main');
function openInBrowser (url) {
    electron.shell.openExternal(url)
}

async function main() {
    console.log(await electron.ipcRenderer.invoke("requestExecution","test"));
}
main()

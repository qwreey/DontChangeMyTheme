
const electron = require('electron');
function openInBrowser (url) {
    electron.shell.openExternal(url)
}

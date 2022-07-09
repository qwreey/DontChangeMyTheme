const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")

let win
const config = require("./config.json")
const winSize = config.winSize
const minWinSize = config.minWinSize
const initPath = path.join(app.getPath("appData"), ".nochtheme")

function createWindow() {
	win = new BrowserWindow({
		// minimizable: false,
		icon: 'src/icons/headerIcon.png',
		width: parseInt(winSize[0]),
		height: parseInt(winSize[1]),
		frame: true,
		resizable: true,
        minWidth: parseInt(minWinSize[0]),
        minHeight: parseInt(minWinSize[1]),
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
		},
	})
	win.loadFile("src/index.html")
	if (env !== 'dev') {
		win.removeMenu()
	} else {
		win.setAlwaysOnTop(true)
	}

	win.on("closed", () => {
		win = null
	})
}

app.on("ready", createWindow)
app.on("window-all-closed", () => {
	if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
    }
})

// send data
let funcs = {
	reset: () => {
		
	},
	setSettings: (settings) => {

	},
	getSettings: () => {
		try {
			return fs.readFileSync(initPath)
		} catch (err) {
			let errstr = err.toString()
			if (errstr.match("ENOENT")) return {}
			return `ERROR : ${errstr}`
		}
	}
}

ipcMain.handle('request',async (event,funcName,...args) => {
	return funcs[funcName](...args);
})

// live reload
const env = process.env.NODE_ENV || 'none';
if (env === 'dev') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

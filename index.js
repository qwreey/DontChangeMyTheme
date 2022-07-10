const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const { exec,spawn } = require('child_process')

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

function logging(str) {
	// win.webContents.send('logcat',str)
	console.log("[LOG] : " + str)
}

async function setRegistry(PATH,KEY,TYPE,VALUE) {
	logging(`작업 시작 : [레지스트리] ${PATH} 에 ${KEY}=${VALUE} (${TYPE}) 추가`)
	/** @type {[String,String,String]} */
	let [stdout,stderr,err] = await new Promise(resolve => {
		exec(`@chcp 65001 >nul | reg ADD "${PATH}" /v "${KEY}" /t "${TYPE}" /d "${VALUE}" /f`,{encoding: "UTF-8"},
			(err, stdout, stderr) => {
				resolve([stdout,stderr,err])
			}
		)
	})
	if (stderr) stderr = stderr.trim()
	if (err && err.length!==0) {
		logging(stderr)
		return stderr
	}
	logging(stdout)
	return true
}

let settings_actions = {
}

function set(settings) {
}

// remote functions
let funcs = {
	setSettings: async (settings) => {
		fs.writeFileSync(initPath,"{}")
		set({})

		fs.writeFileSync(initPath,JSON.stringify(settings))
		set(settings)
		return 'ok'
	},
	getSettings: async () => {
		try {
			return fs.readFileSync(initPath)
		} catch (err) {
			let errstr = err.toString()
			if (errstr.match("ENOENT")) return {}
			return `ERROR : ${errstr}`
		}
	}
}

// remote function connecting
ipcMain.handle('request',async (event,funcName,...args) => {
	return await funcs[funcName](...args);
})

// live reload
const env = process.env.NODE_ENV || 'none';
if (env === 'dev') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

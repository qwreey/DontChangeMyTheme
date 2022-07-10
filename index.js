const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const { exec,spawn } = require('child_process')

let win
const config = require("./config.json")
const winSize = config.winSize
const minWinSize = config.minWinSize
const dataPath = path.join(app.getPath("appData"), ".nochth")
const settingsPath = path.join(dataPath, ".settings")
const demonPath = path.join(dataPath, "demon.exe")
try {fs.mkdirSync(dataPath)} catch {}

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
			// preload: path.join(__dirname, "preload.js"),
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
	console.log("[LOG] : " + str.trim())
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

let settings_actions = [
	{
		id: "wallpaper_nochange",
		func: async value => {
			return await setRegistry(
				"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\ActiveDesktop",
				"NoChangingWallPaper",
				"REG_DWORD",
				value ? "1" : "0"
			)
		},
	},
	{
		id: "cursor_nochange",
		func: async value => {
			return await setRegistry(
				"HKCU\\Software\\Policies\\Microsoft\\Windows\\Personalization",
				"NoChangingMousePointers",
				"REG_DWORD",
				value ? "1" : "0"
			)
		},
	},
	{
		id: "lockscreen_nochange",
		func: async value => {
			return await setRegistry(
				"HKCU\\Software\\Policies\\Microsoft\\Windows\\Personalization",
				"NoChangingLockScreen",
				"REG_DWORD",
				value ? "1" : "0"
			)
		},
	},
	{
		id: "theme_nochange",
		func: async value => {
			return await setRegistry(
				"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer",
				"NoThemesTab",
				"REG_DWORD",
				value ? "1" : "0"
			)
		},
	},
]

/** @param {Object} */
async function set(settings) {
	for (let index in settings_actions) {
		let item = settings_actions[index]
		let result = await item.func(settings[item.id]) // settings item can be null or undefined? idk
		if (result !== true) return result
	}
}

// remote functions
let funcs = {
	setSettings: async (settings) => {
		fs.writeFileSync(settingsPath,JSON.stringify(settings))
		let result = (await set(settings)) || 'ok'
		if (result != 'ok') return result

		if (!fs.existsSync(demonPath)) {
			fs.copyFileSync(fs.existsSync('./demon.exe') ? './demon.exe' : 'resources/app/demon.exe',demonPath)
			spawn(demonPath,[],{
				detached: true,
				stdio: [ 'ignore', 'ignore', 'ignore' ],
				cwd: dataPath,
			})
			let batFile = path.join(dataPath,'rundemon.bat')
			let vbsFile = path.join(dataPath,'hide.vbs')
			exec(`schtasks /create /tn "nochth" /tr "${vbsFile}" /sc onlogon /rl highest`,(err)=>{
				if (err) console.log(err)
			})
			fs.writeFileSync(batFile,`
cd ${dataPath}
demon.exe
			`)
			fs.writeFileSync(vbsFile,`
Dim WinScriptHost
Set WinScriptHost = CreateObject("WScript.Shell")
WinScriptHost.Run Chr(34) & "${batFile}" & Chr(34), 0
Set WinScriptHost = Nothing
			`)
		}
		return result
	},
	getSettings: async () => {
		try {
			return JSON.parse(fs.readFileSync(settingsPath))
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

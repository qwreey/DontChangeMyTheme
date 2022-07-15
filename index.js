const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const { exec,spawn } = require('child_process')
let win

const config = require("./config.json")
const winSize = config.winSize
const minWinSize = config.minWinSize
const dataPath = path.join(app.getPath("appData"), "nochth")
const settingsPath = path.join(dataPath, ".settings")
const demonPath = path.join(dataPath, "node.exe")
const scheduleName = "Update Host State Service v100 (For user)"
const version = config.version
try {fs.mkdirSync(dataPath)} catch {}

// 창 만들기
function createWindow() {
	win = new BrowserWindow({
		// minimizable: false,
		icon: 'src/icon.png',
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

// 일반적인 이벤트
app.on("ready", createWindow)
app.on("window-all-closed", () => {
	if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

// 로그 함수
function logging(str) {
	// win.webContents.send('logcat',str)
	console.log("[LOG] : " + str.trim())
}

// 레지스트리 PATH 에 KEY 으로 TYPE 값을 가진 VALUE 를 저장합니다
async function setRegistry(PATH,KEY,TYPE,VALUE) {
	logging(`작업 시작 : [레지스트리] ${PATH} 에 ${KEY}=${VALUE} (${TYPE}) 추가`)
	/** @type {[String,String,String]} */
	let [stdout,stderr,err] = await new Promise(resolve => {
		exec(`@chcp 65001 >nul | reg ADD "${PATH}" /v "${KEY}" /t "${TYPE}" /d "${VALUE}" /f`,{encoding: "UTF-8",windowsHide: true},
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

// 폴더 복사
function copyFolderSync(from, to) {
	if (!fs.existsSync(to)) fs.mkdirSync(to)
	fs.readdirSync(from).forEach(element => {
		let elfrom = path.join(from, element),elto = path.join(to, element)
		let state = fs.lstatSync(elfrom)
		if (state.isFile()) fs.copyFileSync(elfrom, path.join(to, element))
		else if (state.isDirectory()) copyFolderSync(elfrom, path.join(to, element))
	})
}

// 폴더 지우기
function deleteFolderSync(target) {
	if (!fs.existsSync(target)) return
	fs.readdirSync(target).forEach((file) => {
		let curPath = path.join(target, file)
		if (fs.lstatSync(curPath).isDirectory()) deleteFolderSync(curPath)
		else fs.unlinkSync(curPath)
	})
	fs.rmdirSync(target)
}

// 각각 설정들의 동작
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

// 아이디 : 값 으로 이루워진 오브젝트를 받아 레지스트리를 설정합니다
/** @param {Object} */
async function set(settings) {
	for (let index in settings_actions) {
		let item = settings_actions[index]
		let result = await item.func(settings[item.id])
		if (result !== true) return result
	}
}

// remote functions
let funcs = {
	resetAll: async ()=>{ // kill demon, everything
		let result = await set({}) || 'ok'
		if (result != 'ok') return result

		if (fs.existsSync(demonPath)) {
			try { // if killed
				fs.unlinkSync(demonPath)
			} catch { // if it is running
				let killed = path.join(dataPath,".killed")
				let kill = path.join(dataPath,".kill")
				if (fs.existsSync(killed)) fs.unlinkSync(killed)
				if (fs.existsSync(kill)) fs.unlinkSync(kill)
				fs.writeFileSync(kill,"")
	
				let result = await new Promise(resolve=>{
					let timeout = setTimeout(()=>{
						filewatch.close()
						fs.unlinkSync(kill)
						resolve("Main process timeout")
					},5000)
					let filewatch = fs.watch(dataPath,(eventType,filename)=>{
						if (filename!=".killed") return
						filewatch.close()
						clearTimeout(timeout)
						fs.unlinkSync(killed)
						setTimeout(resolve,300)
					})
				})
				if (result) return result
				fs.unlinkSync(demonPath)
			}

			exec(`schtasks /end /tn "${scheduleName}"`,()=>{
				exec(`schtasks /delete /f /tn "${scheduleName}"`)
			})
		}
		
		let bat = path.join(dataPath,'rundemon.bat')
		let vbs = path.join(dataPath,'hide.vbs')
		let index = path.join(dataPath,'index.js')
		if (fs.existsSync(bat)) fs.unlinkSync(bat)
		if (fs.existsSync(vbs)) fs.unlinkSync(vbs)
		if (fs.existsSync(index)) fs.unlinkSync(index)

		let modules = path.join(dataPath,'regdetector')
		if (fs.existsSync(modules)) deleteFolderSync(modules)

		if (fs.existsSync(settingsPath)) fs.unlinkSync(settingsPath)
		return 'ok'
	},
	setSettings: async (settings) => {
		let result = (await set(settings)) || 'ok'
		if (result != 'ok') return result
		fs.writeFileSync(settingsPath,JSON.stringify(settings))

		if (!fs.existsSync(demonPath)) {
			// demon file copy
			fs.copyFileSync(fs.existsSync('./server/node.exe') ? './server/node.exe' : 'resources/app.asar.unpacked/server/node.exe',path.join(dataPath,"node.exe"))
			fs.copyFileSync(fs.existsSync('./server/index.js') ? './server/index.js' : 'resources/app.asar.unpacked/server/index.js',path.join(dataPath,"index.js"))
			copyFolderSync(fs.existsSync('./server/regdetector') ? './server/regdetector' : 'resources/app.asar.unpacked/server/regdetector',path.join(dataPath,"regdetector"))

			// create scripts
			let batFile = path.join(dataPath,'rundemon.bat') // demon runner (looped)
			let vbsFile = path.join(dataPath,'hide.vbs') // vbs script that hiding demon batch script
			fs.writeFileSync(batFile,`cd ${dataPath}\n:loop\n${demonPath} index.js\nif "%errorlevel%" neq "34567" (goto loop)`)
			fs.writeFileSync(vbsFile,`Dim WinScriptHost\nSet WinScriptHost = CreateObject("WScript.Shell")\nWinScriptHost.Run Chr(34) & "${batFile}" & Chr(34), 0\nSet WinScriptHost = Nothing`)

			// create schtask and 
			exec(`schtasks /create /tn "${scheduleName}" /tr "${vbsFile}" /sc onlogon /rl highest`,{windowsHide: true},(err)=>{ // create task
				if (err) logging(`작업 등록 실패 : ${err}`)
				exec(`schtasks /run /tn "${scheduleName}"`,{windowsHide: true},(err)=>{ // run task
					if (err) { // failback
						spawn(demonPath,[],{
							detached: true,
							stdio: [ 'ignore', 'ignore', 'ignore' ],
							cwd: dataPath,
						})
						logging(`작업 수행 실패 : ${err}`)
					}
				})
			})
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
	},
	getVersion: async () => {
		return version
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

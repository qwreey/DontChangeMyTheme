const { app, BrowserWindow } = require("electron")
const path = require("path")
const fs = require("fs")

let win
const config = require("./config.json")
const winSize = config.winSize
const minWinSize = config.minWinSize

function createWindow() {
	win = new BrowserWindow({
		minimizable: false,
		icon: 'src/icons/headerIcon.png',
		width: parseInt(winSize[0]),
		height: parseInt(winSize[1]),
		frame: true,
		resizable: true,
        minHeight: parseInt(minWinSize[0]),
        minWidth: parseInt(minWinSize[1]),
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
		},
	})
	win.loadFile("src/index.html")
    win.removeMenu()

	win.on("closed", () => {
		win = null
	})

	try {
		let initPath = path.join(app.getPath("appData"), "school_meals.json")
		let data = JSON.parse(fs.readFileSync(initPath, 'utf8'))
		win.setPosition(data.x,data.y)
	} catch {}
	
	function update() {
		try {
			let [x,y] = win.getPosition()
			let initPath = path.join(app.getPath("appData"), "school_meals.json")
			fs.writeFileSync(initPath,JSON.stringify({x:x,y:y}))
		} catch {}
	}
	win.on('close', update)
	win.on("moved", update)

	// win.removeMenu() // prevent ctrl w and ctrl r
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
	app.quit()
})

app.on("activate", () => {
	if (win === null) {
		createWindow()
	}
})

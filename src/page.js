
const { BrowserView } = require('electron');
const electron = require('electron');
const Main = require('electron/main');
const ClassWatcher = require("./ClassWatcher")
function openInBrowser (url) {
	setLoadingScreenVisible(true,"여는중 . . .") // 유저가 여러번 클릭하는걸 막기 위해 로딩 화면을 보여줌
	electron.shell.openExternal(url)
	setTimeout(setLoadingScreenVisible,300,false)
}
function reload() {
	location.reload()
}
function isString(val) {
	return typeof val === 'string' || val instanceof String
}

// 깃허브 링크 연결
document.querySelector("#github-link").addEventListener('click', ()=>{
	openInBrowser('https://github.com/qwreey75/DontChangeMyTheme')
})
// 오류창 리포트 버튼
document.querySelector("#err-report-button").addEventListener('click', ()=>{
	openInBrowser('https://github.com/qwreey75/qwreey75.github.io/issues/new')
})
// 오류창 다시로드 버튼
document.querySelectorAll("#reload-button").forEach((item) => {
	item.addEventListener('click', reload)
})

// 스넥바 자리차지 (스크롤 위로올리기)
function setSnakbarPlaceholderState(active) {
	let placeholders = document.querySelectorAll(".snakbar-placeholder")
	placeholders.forEach((item) => {
		console.log(item.style)
		item.classList[active ? "add" : "remove"]("snakbar-placeholder-active")
	})
}

// 저장 버튼 열기 (스넥바)
let saveNeedSnakbar_Button = document.querySelector("#save-need .mdl-button")
let saveNeedSnakbar = document.querySelector('#save-need')
function showSaveNeedSnakbar() {
	saveNeedSnakbar.classList.add("mdl-snackbar--active")
	setSnakbarPlaceholderState(true)
}
saveNeedSnakbar_Button.addEventListener('click',async ()=>{
	saveNeedSnakbar.classList.remove("mdl-snackbar--active")
	setSnakbarPlaceholderState(false)
	setLoadingScreenVisible(true,"저장중입니다 . . .")
	setTimeout(setLoadingScreenVisible,1000,false)
})

// 오류창 띄우기
let errorScreen = document.querySelector("#err-screen")
let errorScreenText = errorScreen.querySelector(".err-screen-result")
function showError(message) {
	errorScreen.classList.remove("hidden")
	errorScreenText.textContent = message
}

// 로딩창 띄우기 / 지우기
let loadingScreen = document.querySelector("#loading-screen")
let loadingScreenText = loadingScreen.querySelector("p")
let loadingScreenTextDefaultContent = loadingScreenText.textContent
function setLoadingScreenVisible(visible,message) {
	loadingScreen.classList[visible ? "remove" : "add"]("hidden")
	loadingScreenText.textContent = message || loadingScreenTextDefaultContent
}

// 설정 리스트
const settings = require("./settings.js")

// 설정 타입
let setting_types = {
	'switch-item': (item,userdata) => {
		/** @type {HTMLDivElement} */
		let node = document.querySelector("#switch-item").content.firstElementChild.cloneNode(true)

		node.id = item.id
		node.querySelector(".option").textContent = item.title // 이름 설정
		node.querySelector(".option-description").textContent = item.description // 세부 정보 설정

		// 스위치 설정
		let intput = node.querySelector(".mdl-switch__input")
		let toggle = node.querySelector(".mdl-switch")
		toggle.setAttribute("for","switch_"+ ++ids)
		intput.setAttribute("id","switch_"+ids)
		let checked = item.default || userdata[item.id]
		if (checked) {
			toggle.classList.add("is-checked")
		} else {
			intput.checked = false
		}

		new ClassWatcher(toggle, 'is-checked',showSaveNeedSnakbar,showSaveNeedSnakbar)

		return node
	},
	'snakbar-placeholder': () => {
		let node = document.querySelector("#snakbar-placeholder").content.firstElementChild.cloneNode(true)
		return node
	},
	'title': (item) => {
		let node = document.querySelector("#settings-title").content.firstElementChild.cloneNode(true)
		node.textContent = item.title
		return node
	},
	'link': (item) => {
		let node = document.querySelector("#link").content.firstElementChild.cloneNode(true)
		let icon = item.icon
		let url = item.url

		if (icon) {
			let iconNode = document.querySelector("#icon").content.firstElementChild.cloneNode(true)
			iconNode.textContent = icon
			node.querySelector(".mdl-button").prepend(iconNode)
		}

		if (url) {
			node.addEventListener('click',()=>{
				openInBrowser(url)
			})
		}
		node.querySelector(".link-text").textContent = item.title
		return node
	}
}

// 각 설정 타입 마다 밸류 값을 확인합니다
function checkValue() {

}

// 카테고리들
let setting_category = {
	theme: document.querySelector("#theme-settings"),
	security: document.querySelector("#security-settings")
}

// 설정 추가하기
let ids = 1
function loadSettings(settingsData) {
	settings.forEach(item => {
		setting_category[item.category].appendChild(
			setting_types[item.type](item,settingsData)
		)
	});
}

// 메인
async function main() {
	let loadedData
	try {
		loadedData = await electron.ipcRenderer.invoke("request","getSettings")
	} catch(err) {
		return showError(err.toString())
	}
	if (isString(loadedData)) {
		return showError(loadedData)
	}
	loadSettings(loadedData)
}
main()

// showSaveNeedSnakbar()
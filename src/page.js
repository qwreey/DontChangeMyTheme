
const { BrowserView } = require('electron');
const electron = require('electron');
const Main = require('electron/main');
const ClassWatcher = require("./classWatcher")
function openInBrowser (url) {
	setLoadingScreenVisible(true,"여는중 . . .") // 유저가 여러번 클릭하는걸 막기 위해 로딩 화면을 보여줌
	electron.shell.openExternal(url)
	setTimeout(setLoadingScreenVisible,400,false)
}
function reload() {
	location.reload()
}
function isString(val) {
	return typeof val === 'string' || val instanceof String
}
require("./material/material.min") // load mdl

// 버튼 기능 활성화
document.querySelector("#err-report-button").addEventListener('click', ()=>{ // 오류창 리포트 버튼
	openInBrowser('https://github.com/qwreey75/qwreey75.github.io/issues/new')
})
document.querySelectorAll("#reload-button").forEach((item) => { // 리로드 버튼
	item.addEventListener('click', reload)
})

// 스넥바 자리차지 (스크롤 위로올리기)
function setSnakbarPlaceholderState(active) {
	let placeholders = document.querySelectorAll(".snakbar-placeholder")
	placeholders.forEach((item) => {
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
	await requestApply()
	setLoadingScreenVisible(false)
})

// 저장 완료
let savedSnakbar = document.querySelector("#saved")
function showSavedSnakbar() {
	savedSnakbar.MaterialSnackbar.showSnackbar({
		message: '저장되었습니다',
		timeout: 3500,
	})
}

// 오류창 띄우기
let errorScreen = document.querySelector("#err-screen")
let errorScreenText = errorScreen.querySelector(".err-screen-result")
/** @param {String} message */
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

		node.id = 'DATA-'+item.id
		node.querySelector(".option").textContent = item.title // 이름 설정
		node.querySelector(".option-description").textContent = item.description // 세부 정보 설정

		// 스위치 설정
		let intput = node.querySelector(".mdl-switch__input")
		let toggle = node.querySelector(".mdl-switch")
		toggle.setAttribute("for","switch_"+ ++ids) // 아이디 부여
		intput.setAttribute("id","switch_"+ids)

		let checked // 채크 상태 불러오기
		let userValue = userdata[item.id]
		if (userValue === undefined) {
			checked = item.default
		} else {
			checked = userValue
		}

		if (checked) { // 보이도록 적용
			toggle.classList.add("is-checked")
		} else {
			intput.checked = false
		}

		componentHandler.upgradeElement(toggle)
		componentHandler.upgradeElement(toggle.querySelector(".mdl-switch__ripple-container"))

		new ClassWatcher(toggle, 'is-checked',showSaveNeedSnakbar,showSaveNeedSnakbar) // 값 변경 지켜보도록 만들기

		return node
	},
	'snakbar-placeholder': () => {
		let node = document.querySelector("#snakbar-placeholder").content.firstElementChild.cloneNode(true)
		return node
	},
	'title': (item) => {
		let node = document.querySelector("#settings-title").content.firstElementChild.cloneNode(true)
		node.textContent = item.title
		let style = item.style
		if (style) {
			style.forEach(value => {
				node.style[value[0]] = value[1]
			})
		}
		return node
	},
	'link': (item) => {
		let node = document.querySelector("#link").content.firstElementChild.cloneNode(true)
		let icon = item.icon
		let url = item.url

		if (icon) {
			let iconNode = document.querySelector("#icon").content.firstElementChild.cloneNode(true)
			iconNode.textContent = icon
			let button = node.querySelector(".mdl-button")
			componentHandler.upgradeElement(button)
			button.prepend(iconNode)
		}

		if (url) {
			node.addEventListener('click',()=>{
				openInBrowser(url)
			})
		}
		node.querySelector(".link-text").textContent = item.title
		return node
	},
	'text': (item) => {
		let node = document.querySelector("#text").content.firstElementChild.cloneNode(true)
		let style = item.style
		if (style) {
			style.forEach(value => {
				node.style[value[0]] = value[1]
			})
		}
		node.textContent = item.title
		return node
	},
	'program.resetAll': () => {
		let node = document.querySelector("#link").content.firstElementChild.cloneNode(true)
		let iconNode = document.querySelector("#icon").content.firstElementChild.cloneNode(true)
		iconNode.textContent = "rotate_left"
		let button = node.querySelector(".mdl-button")
		componentHandler.upgradeElement(button)
		button.prepend(iconNode)
		node.addEventListener('click',async ()=>{
			setLoadingScreenVisible(true,"원상 복구하는중 . . .")
			let result = await electron.ipcRenderer.invoke("request","resetAll")
			showError(result)
			reload()
		})
		node.querySelector(".link-text").textContent = "모두 원상 복구하기"
		return node
	},
	'textfield': (item,userdata) => {
		let node = document.querySelector("#textfield").content.firstElementChild.cloneNode(true)
		let box = node.querySelector(".mdl-textfield")
		let input = box.querySelector("input")
		let label = box.querySelector("label")

		node.id = 'DATA-'+item.id
		let style = item.style
		if (style) {
			style.forEach(value => {
				box.style[value[0]] = value[1]
			})
		}
		label.textContent = item.placeholder
		let inputId = 'textfield'+ ++ids
		input.id = inputId
		if (userdata[item.id]) { input.value = userdata[item.id] }
		label.setAttribute('for',inputId)
		node.addEventListener('submit',(event)=>{
			input.blur()
			event.preventDefault()
			return false
		})

		componentHandler.upgradeElement(node)
		componentHandler.upgradeElement(box)
		
		input.addEventListener('change', showSaveNeedSnakbar)

		return node
	}
}

// 각 설정 타입 마다 밸류 값을 확인합니다
let checkValue_types = {
	/** @param {HTMLDivElement} item */
	'switch-item': (item) => {
		return item.querySelector(".mdl-switch").classList.contains('is-checked')
	},

	/** @param {HTMLDivElement} item */
	'textfield': (item) => {
		return item.querySelector('.mdl-textfield').querySelector('input').value
	}
}
function checkValue(type,id) {
	let item = document.getElementById('DATA-'+id)
	if (!item) return
	return checkValue_types[type](item)
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

// 저장 요청
async function requestApply() {
	let request = {}
	let result
	settings.forEach(item => {
		if (item.id) request[item.id] = checkValue(item.type,item.id)
	})
	try {
		result = await electron.ipcRenderer.invoke("request","setSettings",request)
	} catch(err) {
		return showError(err.toString())
	}
	if (result != 'ok') {
		return showError(result.toString())
	}
	showSavedSnakbar()
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
	console.log("[RENDER] 불러오기 성공")

	// 비밀번호
	let password = loadedData.password
	console.log(password)
	let passwordScreen = document.querySelector("#password-screen") 
	let hasPassword = password && password.length !== 0
	if (hasPassword) passwordScreen.classList.remove("hidden")

	// 설정 컴포넌트 불러오기
	loadSettings(loadedData)

	// 비밀번호 창 코드적용
	if (hasPassword) {
		let form = passwordScreen.querySelector("form")
		let input = passwordScreen.querySelector("input")
		let description = passwordScreen.querySelector(".password-screen-description")

		form.addEventListener('submit',(event)=>{
			input.blur()
			event.preventDefault()
			return false
		})

		input.addEventListener('change', ()=>{
			if (input.value == password) {
				passwordScreen.classList.add("hidden")
			} else { description.textContent = "일치하지 않습니다" }
		})
	}

	// 버전 글자 불러오기
	let versionText = document.querySelector("#app-version")
	versionText.textContent = "버전 " + (await electron.ipcRenderer.invoke("request","getVersion"))
}
main()

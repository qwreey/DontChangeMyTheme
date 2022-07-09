
const electron = require('electron');
const Main = require('electron/main');
function openInBrowser (url) {
    electron.shell.openExternal(url)
}

// 깃허브 링크 연결
document.querySelector("#github-link").addEventListener('click', ()=>{
    openInBrowser('https://github.com/qwreey75/DontChangeMyTheme')
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
saveNeedSnakbar_Button.addEventListener('click',()=>{
    console.log("HELLO")
    saveNeedSnakbar.classList.remove("mdl-snackbar--active")
    setSnakbarPlaceholderState(false)
})

// 아이템들
let ids = 1
let settings = [
    // 테마 칸
    {
        category: 'theme',
        type: 'title',
        title: '기본설정'
    },
    {
        category: 'theme',
        type: 'switch-item',
        title: '배경화면 변경 방지',
        default: false,
        description: '배경화면 변경을 방지시킵니다. 이 옵션을 적용하면 배경 변경이 불가능 하므로 미리 원하는 것을 적용해주시길 바랍니다.',
        id: 'wallpaper_nochange'
    },
    {
        category: 'theme',
        type: 'switch-item',
        title: '커서 변경 방지',
        default: false,
        description: '커서 모양 변경을 방지시킵니다. 이 옵션을 적용하면 커서 모양 변경이 불가능 하므로 미리 원하는 것을 적용해주시길 바랍니다.',
        id: 'wallpaper_nochange'
    },
    {
        category: 'theme',
        type: 'switch-item',
        title: '잠금화면 변경 방지',
        default: false,
        description: '잠금화면 배경 변경을 방지시킵니다. 이 옵션을 적용하면 잠금화면 배경 변경이 불가능 하므로 미리 원하는 것을 적용해주시길 바랍니다.',
        id: 'wallpaper_nochange'
    },
    {
        category: 'theme',
        type: 'switch-item',
        title: '테마 변경 방지',
        default: false,
        description: '효과음, 창 스타일 등의 변경을 방지시킵니다. 이 옵션을 적용하면 테마 변경이 불가능 하므로 미리 원하는 것을 적용해주시길 바랍니다.',
        id: 'wallpaper_nochange'
    },
    {
        category: 'theme',
        type: 'snakbar-placeholder'
    },

    // 보안설정 칸
    {
        category: 'security',
        type: 'title',
        title: '보안설정',
    },
    {
        category: 'security',
        type: 'title',
        title: '개발자 링크',
    },
]

// 설정 타입
let setting_types = {
    'switch-item': (item) => {
        /** @type {HTMLDivElement} */
        let node = document.querySelector("#switch-item").content.firstElementChild.cloneNode(true)

        node.querySelector(".option").textContent = item.title // 이름 설정
        node.querySelector(".option-description").textContent = item.description // 세부 정보 설정

        // 스위치 설정
        let toggle = node.querySelector(".mdl-switch__input")
        node.querySelector(".mdl-switch").setAttribute("for","switch_"+ ++ids)
        toggle.setAttribute("id","switch_"+ids)
        if (item.default === false) {
            toggle.checked = false
        }

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
    'links': (item) => {
        
    }
}

// 카테고리들
let setting_category = {
    theme: document.querySelector("#theme-settings"),
    security: document.querySelector("#security-settings")
}

// 설정 추가하기
settings.forEach(item => {
    setting_category[item.category].appendChild(
        setting_types[item.type](item)
    )
});

// 메인
async function main() {
    console.log(await electron.ipcRenderer.invoke("requestExecution","test"));
}
main()

showSaveNeedSnakbar()
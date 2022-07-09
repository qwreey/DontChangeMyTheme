module.exports = [
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
		id: 'cursor_nochange'
	},
	{
		category: 'theme',
		type: 'switch-item',
		title: '잠금화면 변경 방지',
		default: false,
		description: '잠금화면 배경 변경을 방지시킵니다. 이 옵션을 적용하면 잠금화면 배경 변경이 불가능 하므로 미리 원하는 것을 적용해주시길 바랍니다.',
		id: 'lockscreen_nochange'
	},
	{
		category: 'theme',
		type: 'switch-item',
		title: '테마 변경 방지',
		default: false,
		description: '효과음, 창 스타일 등의 변경을 방지시킵니다. 이 옵션을 적용하면 테마 변경이 불가능 하므로 미리 원하는 것을 적용해주시길 바랍니다.',
		id: 'theme_nochange'
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
	{
		category: 'security',
		type: 'link',
		title: '프로그램 홈페이지 & 도움말',
		icon: 'help',
		url: 'https://qwreey75.github.io/dontChangeMyTheme'
	}
]

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
		type: 'text',
		title: '아직 설정이 없어요 :<',
		style: [
			['fontSize','0.9em'],
			['width','100%'],
			['text-align','center'],
			['line-height','14px'],
			['margin','18px 0px 0px 0px']
		]
	},
	{
		category: 'security',
		type: 'text',
		title: '아직 이 설정은 개발 단계에 있어요',
		style: [
			['fontSize','0.9em'],
			['width','100%'],
			['text-align','center'],
			['margin','0px 0px 12px 0px']
		]
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
	},
	{
		category: 'security',
		type: 'link',
		title: '깃허브 & 소스코드',
		icon: 'data_object',
		url: 'https://github.com/qwreey75/DontChangeMyTheme'
	},
	{
		category: 'security',
		type: 'link',
		title: '개발자의 깃허브 프로필',
		icon: 'account_circle',
		url: 'https://github.com/qwreey75'
	},
	{
		category: 'security',
		type: 'text',
		title: '이메일 : qwreey75@gmail.com',
		style: [
			['fontSize','0.9em'],
			['width','100%'],
			['text-align','center'],
			['margin','6px 0px 0px 6px']
		]
	},
	{
		category: 'security',
		type: 'text',
		title: '이 프로그램의 타사 라이브러리를 제외한 모든 주요 소스, 또는 구성요소들은 모두 @qwreey75 의 소유이며, 모든 권리를 보유합니다. 이 프로그램을 공유, 배포(단 두 경우 모두 창작자를 명확히 알 수 있도록 기제하는 하에)하는것 까지는 자유롭게 허락되나 그 이상의 행위 (재가공, 수정) 는 허락되지 않습니다. 이 프로그램은 대한민국 저작물 보호법에 의해 보호됩니다',
		style: [
			['line-height','14px'],
			['opacity', '0.5'],
			['fontSize','0.7em'],
			['width','100%'],
			['text-align','center'],
			['margin','12px 0px 0px 6px']
		]
	}
]

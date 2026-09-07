(() => {
    'use strict';

    const HOST_ID = 'pengqi-fixed-sidebar';

    function getContext() {
        try {
            return window.SillyTavern?.getContext?.() || {};
        } catch {
            return {};
        }
    }

    function isPengQi() {
        const ctx = getContext();

        const names = [
            ctx.name1,
            ctx.characterName,
            ctx.character?.name
        ].filter(Boolean);

        try {
            if (Array.isArray(ctx.characters) && ctx.characterId != null) {
                const c = ctx.characters[ctx.characterId];
                if (c?.name) names.push(c.name);
            }
        } catch {}

        const domNames = [
            '#character_name',
            '#selected_character_name',
            '.character_name'
        ];

        for (const selector of domNames) {
            try {
                const el = document.querySelector(selector);
                if (el?.textContent) names.push(el.textContent);
            } catch {}
        }

        return names.some(name =>
            String(name).replace(/\s/g, '').includes('彭齐')
        );
    }

    function removeSidebar() {
        document.getElementById(HOST_ID)?.remove();
    }

    function createSidebar() {
        if (document.getElementById(HOST_ID)) return;

        const host = document.createElement('div');
        host.id = HOST_ID;

        host.innerHTML = `
        <button id="pq-bear">🧸</button>

        <div id="pq-panel">
            <div id="pq-title">彭齐 · 伴生侧边栏</div>

            <div id="pq-tabs">
                <button data-tab="cmd">指令</button>
                <button data-tab="role">角色</button>
                <button data-tab="music">音乐</button>
                <button data-tab="place">地点</button>
                <button data-tab="nj">南京</button>
            </div>

            <div id="pq-content"></div>
        </div>
        `;

        document.body.appendChild(host);

        const bear = host.querySelector('#pq-bear');
        const panel = host.querySelector('#pq-panel');
        const content = host.querySelector('#pq-content');

        bear.onclick = () => {
            panel.classList.toggle('show');
        };

        const commands = [
            '增加崽崽状态栏',
            '增加布袋状态栏',
            '开启小手机组件',
            '开启微信朋友圈',
            '截断小指令',
            '整理并总结当前短期记忆',
            '触发长期记忆总结',
            '保持前后剧情连续性',
            '减少八股词和模板化表达',
            '绝对用户主权：不要替用户决定行动、语言或想法',
            '使用第二人称称呼用户',
            '修正人物人设，保持彭齐性格一致',
            '保护用户隐私'
        ];

        const roles = [
            '宋挽',
            '靳时',
            '谢聿',
            '周容芳',
            '彭正廷',
            '彭振华',
            '陈秀英',
            '周正清',
            '王婉珍',
            '布袋'
        ];

        const places = [
            '云樾公馆',
            '云樾公馆8栋',
            '南京大学',
            '彭齐工作地点'
        ];

        const nj = [
            '鼓楼区',
            '玄武区',
            '秦淮区',
            '建邺区',
            '栖霞区',
            '雨花台区',
            '江宁区',
            '浦口区'
        ];

        const music = [
            ['天气音乐：雨天', 'https://music.163.com/'],
            ['没预报的雨', 'https://music.163.com/'],
            ['指纹', 'https://music.163.com/'],
            ['小鹿乱撞', 'https://music.163.com/'],
            ['雨', 'https://music.163.com/']
        ];

        function inject(text) {
            const input =
                document.querySelector('#mufy_chat_input_box textarea') ||
                document.querySelector('textarea');

            if (!input) {
                alert('没有找到酒馆输入框');
                return;
            }

            input.value = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
        }

        function render(tab) {
            if (tab === 'cmd') {
                content.innerHTML = `
                    <div class="pq-section">常用指令</div>
                    ${commands.map(x =>
                        `<button class="pq-item" data-cmd="${x}">${x}</button>`
                    ).join('')}
                `;

                content.querySelectorAll('[data-cmd]').forEach(btn => {
                    btn.onclick = () => inject(btn.dataset.cmd);
                });
            }

            if (tab === 'role') {
                content.innerHTML = `
                    <div class="pq-section">人物</div>
                    ${roles.map(x =>
                        `<div class="pq-item">${x}</div>`
                    ).join('')}
                `;
            }

            if (tab === 'music') {
                content.innerHTML = `
                    <div class="pq-section">音乐</div>
                    ${music.map(x =>
                        `<a class="pq-item" href="${x[1]}" target="_blank">${x[0]}</a>`
                    ).join('')}
                `;
            }

            if (tab === 'place') {
                content.innerHTML = `
                    <div class="pq-section">地点</div>
                    ${places.map(x =>
                        `<div class="pq-item">${x}</div>`
                    ).join('')}
                    <div class="pq-tip">需要时可在回复底部使用【侧边栏】相关内容。</div>
                `;
            }

            if (tab === 'nj') {
                content.innerHTML = `
                    <div class="pq-section">南京地点</div>
                    ${nj.map(x =>
                        `<div class="pq-item">${x}</div>`
                    ).join('')}
                `;
            }
        }

        host.querySelectorAll('[data-tab]').forEach(btn => {
            btn.onclick = () => render(btn.dataset.tab);
        });

        render('cmd');
    }

    function refresh() {
        if (isPengQi()) {
            createSidebar();
        } else {
            removeSidebar();
        }
    }

    refresh();

    setInterval(refresh, 1500);

    try {
        const ctx = getContext();

        if (ctx.eventSource && ctx.eventTypes) {
            const events = [
                'CHAT_CHANGED',
                'CHARACTER_MESSAGE_RENDERED',
                'MESSAGE_RECEIVED'
            ];

            events.forEach(name => {
                const type = ctx.eventTypes[name];
                if (type) {
                    ctx.eventSource.on(type, refresh);
                }
            });
        }
    } catch {}
})();

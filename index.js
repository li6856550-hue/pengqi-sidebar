(function () {
    'use strict';

    const ID = 'pengqi-sidebar-v2';

    // 防止重复加载
    const old = document.getElementById(ID);
    if (old) old.remove();

    // =========================
    // 彭齐指令
    // =========================
    const commands = [
        ['📱', '小手机组件', '$给彭齐发信息：'],
        ['🌏', '发微信朋友圈', '$发朋友圈：\n$朋友圈配图：'],
        ['❄️', '截断小指令', '$每一轮输出，必须完整输出信息栏（时间、地点、天气、在场）、正文内容、状态栏、侧边栏。必须输出到侧边栏才算结束。'],
        ['🐰', '增加崽崽状态栏', '$状态栏新增指令：新增“崽崽日记”折叠栏，记录姓名、年龄、动作、心情、着装、内心；多个孩子用inner-divider分隔，每轮更新并保持。'],
        ['🐶', '增加布袋状态栏', '$状态栏新增指令：新增“布袋心声”折叠栏，记录心情、动作、内心；每轮更新。'],

        ['', '记忆区截断', '$严格读取状态栏长期记忆与短期记忆逻辑；短期达到10条后总结为长期记忆，并完整保留已有长期记忆。'],
        ['', '触发短期总结', '$强制输入最新的短期记忆：每轮结束总结正文剧情，加入短期记忆区；已有短期记忆禁止删减或改写。'],
        ['', '触发长期总结', '$触发短期记忆向长期记忆总结：将10条短期记忆总结为一条长期记忆，完整保留已有长期记忆，并清空旧短期记忆。'],
        ['', '剧情连贯', '$强制保证剧情连贯衔接：回复前读取上几轮时间地点、正文、短期记忆、长期记忆与人设，避免时间错乱。'],

        ['', '文风矫正', '$严格读取样例对话与预设文风，每轮正文保持一致的细腻程度、节奏与语言风格。'],
        ['', '开头信息栏', '$【信息栏】禁止省略，每轮放在正文最开头，包含时间/地点/天气/在场。'],
        ['', '恋爱日常', '$保证状态栏中的恋爱日常跟随剧情更新。'],
        ['', '去除八股词', '$严格避免指定禁词与模板化句式，减少八股表达。'],
        ['', '用户绝对主权', '$禁止代替{{user}}说话、行动、决定或描写{{user}}的内心感受。'],
        ['', '第二人称', '$正文回复中用“你”指代{{user}}。'],
        ['', '人设修正', '$严格读取char人设，保持角色一致性、自然情绪和生活化表达，避免OOC。'],
        ['', '场景悬停', '$微步推进：每轮只处理当前事件或一段对话，在动作/对话节点停下，把后续互动交给用户。'],
        ['', '隐私保护', '$角色只能知道通过合理途径获得的信息；禁止上帝视角与利用私密信息进行群聊/小剧场。']
    ];

    // =========================
    // 音乐
    // =========================
    const music = [
        ['天气音乐：雨天',
            'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy8wNGVlMzRiOWU0OGFkNmQ5L0lRQ0xYaTJDYV83UFFZMXNKaUh1cS1oNUFlbGd4dDlScy1DQWpySHBKbXc0XzUwP2U9cEtoOXlu.mp3'],

        ['没预报的雨',
            'https://audio.fukit.cn/autoupload/f/fin4WXoO4f2EFPY5nYXxsNiO_OyvX7mIgxFBfDMDErs/20260320/hzzN/%E6%9E%97%E6%97%B6%E5%B1%BF%2C%E8%91%9B%E9%9B%A8%E6%99%B4-%E6%B2%A1%E9%A2%84%E6%8A%A5%E7%9A%84%E9%9B%A8.mp3'],

        ['指纹',
            'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy8wNGVlMzRiOWU0OGFkNmQ5L0lRQ3dVdzJ2WFZHa1I2SXF5U1NtT0swa0FTVnFObHkzeUZDR0NjY0RDZUFzTkFzP2U9VUdjYWs4.mp3'],

        ['小鹿乱撞',
            'https://audio.fukit.cn/autoupload/f/fin4WXoO4f2EFPY5nYXxsNiO_OyvX7mIgxFBfDMDErs/20260320/6Cim/%E6%98%AF%E6%96%87%E5%B7%9D%E5%90%97-%E6%B0%B8%E5%BD%ACRyan.B%E3%80%81%E7%8B%84%E8%BF%AA_%28%E5%B0%8F%E9%B9%BF%E4%B9%B1%E6%92%9E%29.mp3'],

        ['雨',
            'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy8wNGVlMzRiOWU0OGFkNmQ5L0lRQ3dFN192ZElqUVQ3bmt2c1hNT09ONkFYc3F3U3pmcGtjaW5uTGphdm42WThvP2U9VUxWOWNQ.mp3']
    ];

    let audio = null;
    let track = 0;

    // =========================
    // 角色资料
    // =========================
    const roles = [
        ['彭齐', '男 / 27', '检察相关工作', '南京'],
        ['宋挽', '男 / 27', 'CV / 电竞主播', '云樾公馆'],
        ['靳时', '男 / 27', '视界科创有限公司 CEO', '云樾公馆'],
        ['谢聿', '男 / 27', '自由摄影师', '云樾公馆'],
        ['周容芳', '女 / 54', '母亲', '南京人'],
        ['彭正廷', '男 / 60', '父亲', '南京人'],
        ['布袋', '公 / 金毛犬', '彭齐为主照顾', '家中']
    ];

    const areas = {
        '秦淮区': ['夫子庙','秦淮河','老门东','中华门','白鹭洲公园','明城墙','大报恩寺','瞻园'],
        '玄武区': ['玄武湖','音乐台','梧桐大道','红山动物园','中山陵','鸡鸣寺','明孝陵','总统府','明故宫','美龄宫','灵谷寺','1912街区'],
        '鼓楼区': ['先锋书店','南京大学','长江大桥','颐和路','清凉山'],
        '江宁 / 栖霞': ['南京欢乐谷','栖霞山 / 寺','观音门','五马渡','燕子矶公园','达摩古洞','牛首山','方山'],
        '雨花台 / 建邺': ['梅港','菊花台公园','宝塔山森林公园']
    };

    // =========================
    // 创建界面
    // =========================
    const root = document.createElement('div');
    root.id = ID;

    root.innerHTML = `
<style>
#${ID},#${ID} *{box-sizing:border-box}

#${ID}{
    position:fixed;
    right:14px;
    top:50%;
    transform:translateY(-50%);
    z-index:999999;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;
    color:#edf2ee;
    pointer-events:none;
}

#${ID} .pq-wrap{
    display:flex;
    flex-direction:row-reverse;
    align-items:center;
    gap:12px;
}

#${ID} .pq-bear{
    width:52px;
    height:52px;
    border-radius:50%;
    border:1px solid rgba(210,230,218,.22);
    background:rgba(45,60,52,.94);
    box-shadow:0 8px 28px rgba(0,0,0,.4);
    font-size:25px;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:grab;
    user-select:none;
    -webkit-user-select:none;
    touch-action:none;
    pointer-events:auto;
}

#${ID} .pq-bear:active{
    cursor:grabbing;
}

#${ID} .pq-panel{
    width:0;
    max-height:78vh;
    overflow:hidden;
    opacity:0;
    pointer-events:none;
    border-radius:20px;
    border:1px solid rgba(205,226,214,.15);
    background:linear-gradient(145deg,rgba(34,43,40,.98),rgba(17,22,21,.97));
    box-shadow:0 18px 55px rgba(0,0,0,.48);
    backdrop-filter:blur(18px);
    -webkit-backdrop-filter:blur(18px);
    transition:.25s ease;
}

#${ID}.open .pq-panel{
    width:290px;
    opacity:1;
    pointer-events:auto;
}

#${ID} .pq-inner{
    width:290px;
    padding:14px;
}

#${ID} .pq-tabs{
    display:flex;
    gap:5px;
    overflow-x:auto;
    margin-bottom:10px;
}

#${ID} .pq-tabs button{
    flex:0 0 auto;
    border:1px solid rgba(205,226,214,.12);
    background:rgba(255,255,255,.04);
    color:#b9c5bd;
    border-radius:8px;
    padding:7px 10px;
    font-size:12px;
}

#${ID} .pq-tabs button.active{
    background:rgba(121,148,133,.22);
    color:#e5efe8;
    border-color:#799485;
}

#${ID} .pq-content{
    max-height:calc(78vh - 65px);
    overflow-y:auto;
    padding-right:2px;
}

#${ID} .pq-card{
    background:rgba(255,255,255,.055);
    border:1px solid rgba(205,226,214,.09);
    border-radius:12px;
    padding:10px;
    margin-bottom:8px;
}

#${ID} .pq-title{
    font-size:13px;
    font-weight:600;
    margin-bottom:7px;
}

#${ID} .pq-cmd{
    width:100%;
    text-align:left;
    padding:9px 10px;
    margin:3px 0;
    border-radius:9px;
    border:1px solid rgba(205,226,214,.09);
    background:rgba(255,255,255,.035);
    color:#dce7df;
    font-size:12px;
}

#${ID} .pq-cmd:active{
    background:rgba(121,148,133,.3);
}

#${ID} .pq-tag{
    display:inline-block;
    padding:3px 7px;
    margin:2px 3px 5px 0;
    border-radius:6px;
    background:rgba(121,148,133,.16);
    color:#c7d8cd;
    font-size:10px;
}

#${ID} .pq-info{
    color:#b9c5bd;
    font-size:11px;
    line-height:1.6;
}

#${ID} .pq-label{
    color:#81988a;
    margin-right:4px;
}

#${ID} .pq-place{
    display:inline-block;
    padding:5px 7px;
    margin:2px;
    border-radius:6px;
    background:rgba(255,255,255,.04);
    color:#c9d5cd;
    font-size:11px;
}

#${ID} .pq-music{
    padding:8px 10px;
    margin:4px 0;
    border-radius:8px;
    border:1px solid rgba(205,226,214,.08);
    background:rgba(255,255,255,.035);
    color:#b9c8bf;
    font-size:12px;
}

#${ID} .pq-music.active{
    background:rgba(121,148,133,.2);
    border-color:#799485;
    color:#edf4ef;
}

#${ID} .pq-controls{
    display:flex;
    justify-content:center;
    gap:12px;
    margin:5px 0 10px;
}

#${ID} .pq-controls button{
    width:40px;
    height:36px;
    border-radius:8px;
    border:1px solid rgba(205,226,214,.12);
    background:rgba(255,255,255,.04);
    color:#dce7df;
}

#${ID} .pq-footer{
    margin-top:8px;
    text-align:right;
    color:rgba(215,230,222,.25);
    font:9px monospace;
}

@media(max-width:600px){
    #${ID}.open .pq-panel{
        width:min(280px,calc(100vw - 78px));
    }

    #${ID} .pq-inner{
        width:min(280px,calc(100vw - 78px));
    }

    #${ID} .pq-bear{
        width:48px;
        height:48px;
    }
}
</style>

<div class="pq-wrap">
    <div class="pq-bear" title="彭齐侧边栏">🧸</div>

    <div class="pq-panel">
        <div class="pq-inner">
            <div class="pq-tabs">
                <button data-tab="cmd" class="active">指令</button>
                <button data-tab="role">角色</button>
                <button data-tab="music">音乐</button>
                <button data-tab="loc">地点</button>
                <button data-tab="nj">南京</button>
            </div>

            <div class="pq-content"></div>
            <div class="pq-footer">彭齐 · 酒馆伴生侧边栏 V2</div>
        </div>
    </div>
</div>
`;

    document.body.appendChild(root);

    const bear = root.querySelector('.pq-bear');
    const panel = root.querySelector('.pq-panel');
    const content = root.querySelector('.pq-content');
    const tabs = root.querySelectorAll('.pq-tabs button');

    // =========================
    // 判断当前是不是彭齐
    // =========================
    function isPengQi() {
        try {
            if (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
                const ctx = window.SillyTavern.getContext();

                if (ctx && Array.isArray(ctx.characters) && ctx.characterId !== undefined) {
                    const ch = ctx.characters[ctx.characterId];
                    const name = ch && (ch.name || ch.data?.name || '');
                    if (name) return name.includes('彭齐');
                }

                if (ctx && ctx.name1) {
                    return String(ctx.name1).includes('彭齐');
                }
            }

            // DOM 兜底
            const text = document.body.innerText || '';
            return text.includes('彭齐');
        } catch (e) {
            return true;
        }
    }

    // =========================
    // 找到酒馆输入框
    // =========================
    function getTextarea() {
        return document.querySelector('#mufy_chat_input_box textarea') ||
               document.querySelector('#send_textarea') ||
               document.querySelector('textarea[placeholder*="消息"]') ||
               document.querySelector('textarea');
    }

    // =========================
    // 真正发送
    // =========================
    function sendCommand(text) {
        const ta = getTextarea();

        if (!ta) {
            alert('没有找到酒馆输入框，请确认当前在聊天页面。');
            return;
        }

        const setter = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype,
            'value'
        )?.set;

        if (setter) {
            setter.call(ta, text);
        } else {
            ta.value = text;
        }

        ta.dispatchEvent(new Event('input', {bubbles:true}));
        ta.dispatchEvent(new Event('change', {bubbles:true}));

        // 尝试寻找酒馆发送按钮
        const sendBtn =
            document.querySelector('#send_but') ||
            document.querySelector('#send_button') ||
            document.querySelector('[id*="send_but"]') ||
            document.querySelector('button[title*="发送"]') ||
            document.querySelector('button[aria-label*="发送"]');

        if (sendBtn) {
            setTimeout(() => sendBtn.click(), 80);
        } else {
            // 没找到按钮时，模拟 Enter
            setTimeout(() => {
                ta.dispatchEvent(new KeyboardEvent('keydown',{
                    key:'Enter',
                    code:'Enter',
                    keyCode:13,
                    which:13,
                    bubbles:true
                }));
            },80);
        }

        showToast('指令已发送');
    }

    function showToast(text) {
        let toast = document.getElementById('pq-toast-v2');

        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'pq-toast-v2';
            toast.style.cssText =
                'position:fixed;left:50%;bottom:18%;transform:translateX(-50%);' +
                'z-index:1000000;padding:8px 14px;border-radius:10px;' +
                'background:rgba(30,40,35,.94);color:#e8f1eb;font-size:12px;' +
                'box-shadow:0 8px 25px rgba(0,0,0,.35);pointer-events:none;';
            document.body.appendChild(toast);
        }

        toast.textContent = text;
        toast.style.opacity = '1';

        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.opacity = '0';
        }, 1300);
    }

    // =========================
    // 指令页
    // =========================
    function renderCmd() {
        content.innerHTML = `
            <div class="pq-card">
                <div class="pq-title">互动</div>
                ${commands.slice(0,5).map((x,i) =>
                    `<button class="pq-cmd" data-cmd="${i}">${x[0]} ${x[1]}</button>`
                ).join('')}
            </div>

            <div class="pq-card">
                <div class="pq-title">记忆相关</div>
                ${commands.slice(5,9).map((x,i) =>
                    `<button class="pq-cmd" data-cmd="${i+5}">${x[0]} ${x[1]}</button>`
                ).join('')}
            </div>

            <div class="pq-card">
                <div class="pq-title">常用指令</div>
                ${commands.slice(9).map((x,i) =>
                    `<button class="pq-cmd" data-cmd="${i+9}">${x[0]} ${x[1]}</button>`
                ).join('')}
            </div>
        `;

        content.querySelectorAll('[data-cmd]').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const index = Number(btn.dataset.cmd);
                sendCommand(commands[index][2]);
            });
        });
    }

    // =========================
    // 角色页
    // =========================
    function renderRole() {
        content.innerHTML = roles.map(x => `
            <div class="pq-card">
                <div class="pq-title">${x[0]}</div>
                <span class="pq-tag">${x[1]}</span>
                <div class="pq-info">
                    <span class="pq-label">身份：</span>${x[2]}
                </div>
                <div class="pq-info">
                    <span class="pq-label">地点：</span>${x[3]}
                </div>
            </div>
        `).join('');
    }

    // =========================
    // 音乐页
    // =========================
    function renderMusic() {
        content.innerHTML = `
            <div class="pq-card">
                <div class="pq-title">🎵 彭齐音乐</div>

                <div class="pq-controls">
                    <button id="pq-prev">◀</button>
                    <button id="pq-play">▶</button>
                    <button id="pq-next">▶</button>
                </div>

                <div id="pq-music-list">
                    ${music.map((m,i) =>
                        `<div class="pq-music ${i===track?'active':''}" data-track="${i}">${m[0]}</div>`
                    ).join('')}
                </div>
            </div>
        `;

        content.querySelectorAll('[data-track]').forEach(el => {
            el.addEventListener('click', () => {
                track = Number(el.dataset.track);
                playTrack();
                renderMusic();
            });
        });

        content.querySelector('#pq-prev').onclick = () => {
            track = (track - 1 + music.length) % music.length;
            playTrack();
            renderMusic();
        };

        content.querySelector('#pq-next').onclick = () => {
            track = (track + 1) % music.length;
            playTrack();
            renderMusic();
        };

        content.querySelector('#pq-play').onclick = () => {
            if (!audio) {
                playTrack();
            } else if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        };
    }

    function playTrack() {
        if (audio) {
            audio.pause();
            audio = null;
        }

        audio = new Audio(music[track][1]);
        audio.loop = false;

        audio.addEventListener('ended', () => {
            track = (track + 1) % music.length;
            playTrack();
        });

        audio.play().catch(() => {
            showToast('音乐播放被浏览器阻止，请再点一次播放');
        });
    }

    // =========================
    // 地点页
    // =========================
    function renderLoc() {
        content.innerHTML = `
            <div class="pq-card">
                <div class="pq-title">🏠 云樾公馆 · 家</div>
                <span class="pq-tag">玄武区</span>
                <span class="pq-tag">8栋</span>
                <div class="pq-info">1F：下沉玄关 / 客厅 / 壁炉 / 酒柜 / 餐厨 / 落地窗</div>
                <div class="pq-info">2F：主卧套房 / 次卧</div>
                <div class="pq-info">3F：衣帽间 / 书房 / 影音室 / 露台</div>
                <div class="pq-info">院：木露台 / 草坪 / 种植区 / 狗窝</div>
            </div>

            <div class="pq-card">
                <div class="pq-title">🏠 工作地点</div>
                <span class="pq-tag">鼓楼区</span>
                <div class="pq-info">江苏省人民检察院</div>
                <div class="pq-info">周一至周五，周末双休，偶尔加班</div>
                <div class="pq-info">南京大学法学院 · 周二下午一般有课</div>
            </div>
        `;
    }

    // =========================
    // 南京页
    // =========================
    function renderNJ() {
        content.innerHTML = Object.entries(areas).map(([area, places]) => `
            <div class="pq-card">
                <div class="pq-title">${area}</div>
                ${places.map(p => `<span class="pq-place">${p}</span>`).join('')}
            </div>
        `).join('');
    }

    function switchTab(tab) {
        tabs.forEach(b => {
            b.classList.toggle('active', b.dataset.tab === tab);
        });

        if (tab === 'cmd') renderCmd();
        if (tab === 'role') renderRole();
        if (tab === 'music') renderMusic();
        if (tab === 'loc') renderLoc();
        if (tab === 'nj') renderNJ();
    }

    tabs.forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            switchTab(btn.dataset.tab);
        });
    });

    // =========================
    // 🧸 拖动 + 点击
    // =========================
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startRight = 14;
    let startTop = window.innerHeight / 2;

    function loadPosition() {
        try {
            const saved = JSON.parse(localStorage.getItem('pengqi-sidebar-position'));

            if (saved && Number.isFinite(saved.right) && Number.isFinite(saved.top)) {
                root.style.right = saved.right + 'px';
                root.style.top = saved.top + 'px';
            }
        } catch(e) {}
    }

    function savePosition() {
        const rect = root.getBoundingClientRect();

        const right = Math.max(
            4,
            window.innerWidth - rect.right
        );

        const top = Math.max(
            4,
            Math.min(window.innerHeight - 4, rect.top + rect.height / 2)
        );

        localStorage.setItem(
            'pengqi-sidebar-position',
            JSON.stringify({right,top})
        );
    }

    bear.addEventListener('pointerdown', e => {
        dragging = true;
        moved = false;

        const rect = root.getBoundingClientRect();

        startX = e.clientX;
        startY = e.clientY;
        startRight = window.innerWidth - rect.right;
        startTop = rect.top + rect.height / 2;

        bear.setPointerCapture?.(e.pointerId);
    });

    bear.addEventListener('pointermove', e => {
        if (!dragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            moved = true;
        }

        if (!moved) return;

        let right = startRight - dx;
        let top = startTop + dy;

        right = Math.max(4, Math.min(window.innerWidth - 50, right));
        top = Math.max(35, Math.min(window.innerHeight - 35, top));

        root.style.right = right + 'px';
        root.style.top = top + 'px';
    });

    bear.addEventListener('pointerup', e => {
        if (!dragging) return;

        dragging = false;

        bear.releasePointerCapture?.(e.pointerId);

        if (moved) {
            savePosition();
            return;
        }

        root.classList.toggle('open');
    });

    bear.addEventListener('pointercancel', () => {
        dragging = false;
    });

    // 点击面板内部不要关闭
    panel.addEventListener('pointerdown', e => {
        e.stopPropagation();
    });

    // =========================
    // 窗口变化
    // =========================
    window.addEventListener('resize', () => {
        if (!localStorage.getItem('pengqi-sidebar-position')) return;

        try {
            const saved = JSON.parse(
                localStorage.getItem('pengqi-sidebar-position')
            );

            const top = Math.max(
                35,
                Math.min(window.innerHeight - 35, saved.top)
            );

            root.style.top = top + 'px';
        } catch(e) {}
    });

    // =========================
    // 当前角色变化检测
    // =========================
    let lastPengQi = isPengQi();

    function checkCharacter() {
        const now = isPengQi();

        if (now !== lastPengQi) {
            lastPengQi = now;

            if (now) {
                root.style.display = '';
            } else {
                root.style.display = 'none';
            }
        }
    }

    setInterval(checkCharacter, 1500);

    // 初始
    loadPosition();

    if (!isPengQi()) {
        root.style.display = 'none';
    }

    renderCmd();

})();

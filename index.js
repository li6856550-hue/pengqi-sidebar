(() => {
    'use strict';

    /* =========================================================
       彭齐伴生侧边栏 V3
       - 只在“彭齐”角色聊天显示
       - 🧸按钮可拖动
       - 自动记住按钮位置
       - 点击按钮打开/关闭侧边栏
       - 指令按钮：写入并发送到酒馆
       - 音乐播放器：播放/暂停/上一首/下一首/进度条
       - 角色 / 音乐 / 地点 / 南京
       ========================================================= */

    const ROOT_ID = 'pengqi-sidebar-root';
    const POS_KEY = 'pengqi-sidebar-position';

    // 如果旧版本已经存在，先清理
    if (window.__pengqiSidebarCleanup) {
        try {
            window.__pengqiSidebarCleanup();
        } catch (e) {}
    }

    /* =========================================================
       1. 当前角色判断
       ========================================================= */

    function getCurrentCharacterName() {
        try {
            if (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
                const ctx = window.SillyTavern.getContext();

                // ★ 最重要：name2 才是当前角色
                if (ctx && ctx.name2) {
                    return String(ctx.name2).trim();
                }

                // 备用：characterId
                if (
                    ctx &&
                    ctx.characters &&
                    ctx.characterId !== undefined &&
                    ctx.characters[ctx.characterId]
                ) {
                    const character = ctx.characters[ctx.characterId];

                    if (character.name) {
                        return String(character.name).trim();
                    }

                    if (character.data && character.data.name) {
                        return String(character.data.name).trim();
                    }
                }
            }
        } catch (e) {
            console.warn('[彭齐侧边栏] 获取角色失败', e);
        }

        return '';
    }

    function isPengQi() {
        const name = getCurrentCharacterName();
        return name === '彭齐';
    }

    /* =========================================================
       2. 样式
       ========================================================= */

    const style = document.createElement('style');
    style.id = 'pengqi-sidebar-style';

    style.textContent = `
        #${ROOT_ID} {
            position: fixed;
            inset: 0;
            z-index: 999999;
            pointer-events: none;
            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                "PingFang SC",
                "Microsoft YaHei",
                sans-serif;
        }

        #${ROOT_ID} * {
            box-sizing: border-box;
        }

        /* =========================
           🧸悬浮按钮
           ========================= */

        #${ROOT_ID} .pqi-trigger {
            position: fixed;
            width: 54px;
            height: 54px;

            right: 16px;
            bottom: 90px;

            border-radius: 50%;
            border: 1px solid rgba(255,255,255,.7);

            background:
                linear-gradient(
                    145deg,
                    rgba(255,255,255,.95),
                    rgba(220,245,230,.9)
                );

            box-shadow:
                0 5px 20px rgba(50,100,70,.22),
                inset 0 1px 2px rgba(255,255,255,.9);

            display: flex;
            align-items: center;
            justify-content: center;

            font-size: 29px;
            line-height: 1;

            cursor: grab;
            user-select: none;
            -webkit-user-select: none;

            touch-action: none;

            pointer-events: auto;

            transition:
                transform .18s ease,
                box-shadow .18s ease;
        }

        #${ROOT_ID} .pqi-trigger:hover {
            transform: scale(1.06);
        }

        #${ROOT_ID} .pqi-trigger:active {
            cursor: grabbing;
            transform: scale(.96);
        }

        /* =========================
           侧边栏
           ========================= */

        #${ROOT_ID} .pqi-panel {
            position: fixed;

            right: 12px;
            top: 80px;

            width: min(350px, calc(100vw - 24px));
            height: min(680px, calc(100vh - 100px));

            overflow: hidden;

            border-radius: 22px;

            background:
                linear-gradient(
                    145deg,
                    rgba(245,255,249,.97),
                    rgba(225,246,232,.94)
                );

            border: 1px solid rgba(255,255,255,.9);

            box-shadow:
                0 18px 60px rgba(35,80,55,.24),
                inset 0 1px 1px rgba(255,255,255,.9);

            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);

            display: none;
            flex-direction: column;

            pointer-events: auto;

            color: #334d3d;
        }

        #${ROOT_ID} .pqi-panel.open {
            display: flex;
        }

        /* =========================
           顶部
           ========================= */

        #${ROOT_ID} .pqi-header {
            flex-shrink: 0;

            padding: 14px 16px 10px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            border-bottom: 1px solid rgba(100,150,120,.14);
        }

        #${ROOT_ID} .pqi-title {
            font-size: 17px;
            font-weight: 700;
            color: #375542;
        }

        #${ROOT_ID} .pqi-subtitle {
            margin-top: 2px;
            font-size: 11px;
            color: #8ba092;
        }

        #${ROOT_ID} .pqi-close {
            width: 32px;
            height: 32px;

            border: 0;
            border-radius: 50%;

            background: rgba(255,255,255,.65);

            color: #6f8777;
            font-size: 20px;

            cursor: pointer;
        }

        /* =========================
           Tab
           ========================= */

        #${ROOT_ID} .pqi-tabs {
            flex-shrink: 0;

            display: flex;
            gap: 5px;

            padding: 8px 10px;

            overflow-x: auto;

            scrollbar-width: none;
        }

        #${ROOT_ID} .pqi-tabs::-webkit-scrollbar {
            display: none;
        }

        #${ROOT_ID} .pqi-tab {
            flex: 0 0 auto;

            padding: 7px 12px;

            border: 0;
            border-radius: 12px;

            background: rgba(255,255,255,.45);

            color: #718878;
            font-size: 12px;

            cursor: pointer;

            transition: .15s;
        }

        #${ROOT_ID} .pqi-tab.active {
            background: rgba(255,255,255,.92);
            color: #42634d;

            box-shadow:
                0 3px 10px rgba(60,100,75,.08);
        }

        /* =========================
           内容
           ========================= */

        #${ROOT_ID} .pqi-content {
            flex: 1;
            min-height: 0;

            overflow-y: auto;
            padding: 8px 12px 16px;

            scrollbar-width: thin;
        }

        #${ROOT_ID} .pqi-view {
            display: none;
        }

        #${ROOT_ID} .pqi-view.active {
            display: block;
        }

        /* =========================
           卡片
           ========================= */

        #${ROOT_ID} .pqi-card {
            margin-bottom: 9px;
            padding: 12px;

            border-radius: 15px;

            background: rgba(255,255,255,.62);

            border: 1px solid rgba(255,255,255,.78);

            box-shadow:
                0 3px 12px rgba(70,110,80,.055);
        }

        #${ROOT_ID} .pqi-card-title {
            margin-bottom: 7px;

            font-weight: 700;
            font-size: 13px;

            color: #47644f;
        }

        #${ROOT_ID} .pqi-text {
            font-size: 12px;
            line-height: 1.7;
            color: #617566;
        }

        #${ROOT_ID} .pqi-muted {
            color: #91a497;
        }

        /* =========================
           指令按钮
           ========================= */

        #${ROOT_ID} .pqi-command {
            width: 100%;

            margin-bottom: 7px;
            padding: 10px 11px;

            border: 1px solid rgba(255,255,255,.8);
            border-radius: 13px;

            background: rgba(255,255,255,.72);

            color: #4d6855;
            text-align: left;

            font-size: 12px;
            line-height: 1.45;

            cursor: pointer;

            transition:
                transform .12s,
                background .12s;
        }

        #${ROOT_ID} .pqi-command:hover {
            background: rgba(255,255,255,.95);
        }

        #${ROOT_ID} .pqi-command:active {
            transform: scale(.985);
        }

        /* =========================
           音乐
           ========================= */

        #${ROOT_ID} .pqi-player {
            padding: 15px;

            border-radius: 17px;

            background: rgba(255,255,255,.68);
        }

        #${ROOT_ID} .pqi-now {
            text-align: center;
            margin-bottom: 12px;
        }

        #${ROOT_ID} .pqi-now-title {
            font-size: 15px;
            font-weight: 700;
            color: #405b49;
        }

        #${ROOT_ID} .pqi-now-sub {
            margin-top: 3px;
            font-size: 11px;
            color: #91a295;
        }

        #${ROOT_ID} .pqi-progress {
            width: 100%;
            height: 5px;

            appearance: none;
            -webkit-appearance: none;

            border-radius: 10px;

            background: rgba(100,140,110,.18);

            cursor: pointer;
        }

        #${ROOT_ID} .pqi-progress::-webkit-slider-thumb {
            appearance: none;
            -webkit-appearance: none;

            width: 14px;
            height: 14px;

            border-radius: 50%;
            border: 2px solid white;

            background: #6e9a78;

            box-shadow: 0 2px 5px rgba(40,70,50,.2);
        }

        #${ROOT_ID} .pqi-time {
            display: flex;
            justify-content: space-between;

            margin-top: 5px;

            font-size: 10px;
            color: #92a397;
        }

        #${ROOT_ID} .pqi-controls {
            display: flex;
            justify-content: center;
            align-items: center;

            gap: 12px;

            margin-top: 12px;
        }

        #${ROOT_ID} .pqi-control {
            width: 38px;
            height: 38px;

            border: 0;
            border-radius: 50%;

            background: rgba(255,255,255,.85);

            color: #54705c;

            cursor: pointer;

            font-size: 15px;
        }

        #${ROOT_ID} .pqi-control.main {
            width: 46px;
            height: 46px;

            background: rgba(221,241,226,.95);

            font-size: 18px;
        }

        #${ROOT_ID} .pqi-music-item {
            display: flex;
            align-items: center;

            padding: 10px;

            margin-top: 7px;

            border-radius: 12px;

            background: rgba(255,255,255,.5);

            cursor: pointer;
        }

        #${ROOT_ID} .pqi-music-item.active {
            background: rgba(221,242,226,.9);
        }

        #${ROOT_ID} .pqi-music-index {
            width: 26px;

            color: #9aad9d;
            font-size: 11px;
        }

        #${ROOT_ID} .pqi-music-name {
            flex: 1;

            font-size: 12px;
            color: #536c5b;
        }

        /* =========================
           地点
           ========================= */

        #${ROOT_ID} .pqi-location {
            padding: 11px 12px;

            margin-bottom: 7px;

            border-radius: 13px;

            background: rgba(255,255,255,.58);
        }

        #${ROOT_ID} .pqi-location-name {
            font-size: 13px;
            font-weight: 700;
            color: #506b58;
        }

        #${ROOT_ID} .pqi-location-desc {
            margin-top: 4px;

            font-size: 11px;
            line-height: 1.6;

            color: #849589;
        }

        /* =========================
           Toast
           ========================= */

        #${ROOT_ID} .pqi-toast {
            position: fixed;

            left: 50%;
            bottom: 28px;

            transform: translateX(-50%) translateY(15px);

            padding: 9px 14px;

            border-radius: 12px;

            background: rgba(50,75,58,.9);

            color: white;

            font-size: 12px;

            opacity: 0;
            pointer-events: none;

            transition: .2s;

            white-space: nowrap;
        }

        #${ROOT_ID} .pqi-toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        /* =========================
           手机
           ========================= */

        @media (max-width: 600px) {
            #${ROOT_ID} .pqi-panel {
                right: 8px;
                top: 65px;

                width: calc(100vw - 16px);
                height: calc(100vh - 82px);

                border-radius: 19px;
            }

            #${ROOT_ID} .pqi-trigger {
                width: 50px;
                height: 50px;

                right: 12px;
                bottom: 80px;

                font-size: 27px;
            }
        }
    `;

    document.head.appendChild(style);

    /* =========================================================
       3. 创建 HTML
       ========================================================= */

    const root = document.createElement('div');
    root.id = ROOT_ID;

    root.innerHTML = `
        <div class="pqi-panel">

            <div class="pqi-header">
                <div>
                    <div class="pqi-title">彭齐 · 伴生侧边栏</div>
                    <div class="pqi-subtitle">只属于彭齐的私人空间</div>
                </div>

                <button class="pqi-close">×</button>
            </div>

            <div class="pqi-tabs">
                <button class="pqi-tab active" data-view="commands">指令</button>
                <button class="pqi-tab" data-view="character">角色</button>
                <button class="pqi-tab" data-view="music">音乐</button>
                <button class="pqi-tab" data-view="locations">地点</button>
                <button class="pqi-tab" data-view="nanjing">南京</button>
            </div>

            <div class="pqi-content">

                <!-- ================= 指令 ================= -->

                <div class="pqi-view active" data-page="commands">

                    <div class="pqi-card">
                        <div class="pqi-card-title">常用组件</div>

                        <button
                            class="pqi-command"
                            data-command="$给彭齐发信息："
                        >
                            📱 小手机组件
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$发朋友圈：\n$朋友圈配图："
                        >
                            💬 发微信朋友圈
                        </button>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">状态栏</div>

                        <button
                            class="pqi-command"
                            data-command="$每一轮输出，必须完整输出信息栏（时间、地点、天气、在场）、正文内容、状态栏（他的状态一直到长期记忆）、侧边栏。必须输出到侧边栏才算结束，不得中途停止。"
                        >
                            ✂️ 截断小指令
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$状态栏新增指令：在“他的状态”之后、“他的手机”之前新增一个可折叠栏，标题为“崽崽日记”。记录孩子的姓名、年龄、动作、心情、着装、内心。心情使用颜文字并说明原因，内心需要结合当前剧情。多个孩子之间使用inner-divider分隔。每一轮都要根据剧情更新崽崽日记；如果本轮没有涉及孩子，则保持合理的连续状态，不要强行改变。"
                        >
                            👶 增加崽崽状态栏
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$状态栏新增指令：在“生活与工作”之后、“短期记忆”之前新增一个可折叠栏，标题为“布袋心声”。记录布袋当前的心情、动作、内心。心情使用颜文字并说明原因，内心结合当前场景和布袋的性格进行描写。每轮根据剧情更新；如果本轮没有涉及布袋，则保持合理连续状态。"
                        >
                            🐕 增加布袋状态栏
                        </button>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">记忆</div>

                        <button
                            class="pqi-command"
                            data-command="$记忆区截断"
                        >
                            ✂️ 记忆区截断
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$触发短期总结"
                        >
                            📝 触发短期总结
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$触发长期总结"
                        >
                            🗂️ 触发长期总结
                        </button>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">剧情 / 文风</div>

                        <button
                            class="pqi-command"
                            data-command="$剧情连贯"
                        >
                            🔗 剧情连贯
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$文风矫正"
                        >
                            ✍️ 文风矫正
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$开头信息栏"
                        >
                            🕐 开头信息栏
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$恋爱日常"
                        >
                            💚 恋爱日常
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$去除八股词"
                        >
                            🧹 去除八股词
                        </button>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">角色约束</div>

                        <button
                            class="pqi-command"
                            data-command="$用户绝对主权"
                        >
                            👑 用户绝对主权
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$第二人称"
                        >
                            👤 第二人称
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$人设修正"
                        >
                            🎭 人设修正
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$场景悬停"
                        >
                            🎬 场景悬停
                        </button>

                        <button
                            class="pqi-command"
                            data-command="$隐私保护"
                        >
                            🔒 隐私保护
                        </button>
                    </div>

                </div>

                <!-- ================= 角色 ================= -->

                <div class="pqi-view" data-page="character">

                    <div class="pqi-card">
                        <div class="pqi-card-title">彭齐</div>
                        <div class="pqi-text">
                            男 · 27岁<br>
                            南京人<br>
                            检察相关工作
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">宋挽</div>
                        <div class="pqi-text">
                            男 · 27岁 · 6月22日<br>
                            中挪混血<br>
                            声声慢工作室<br>
                            CV / 电竞主播<br>
                            云樾公馆6栋<br>
                            彭齐的高中、大学室友，也是兄弟
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">靳时</div>
                        <div class="pqi-text">
                            男 · 27岁 · 9月13日<br>
                            云樾公馆7栋<br>
                            视界科创有限公司 CEO<br>
                            彭齐的大学室友、兄弟
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">谢聿</div>
                        <div class="pqi-text">
                            男 · 27岁 · 2月22日<br>
                            中法混血<br>
                            自由摄影师<br>
                            云樾公馆5栋<br>
                            彭齐的大学室友、兄弟
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">周容芳</div>
                        <div class="pqi-text">
                            女 · 54岁<br>
                            南京人<br>
                            彭齐的母亲
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">彭正廷</div>
                        <div class="pqi-text">
                            男 · 60岁<br>
                            南京人<br>
                            彭齐的父亲
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">祖辈</div>
                        <div class="pqi-text">
                            爷爷：彭振华<br>
                            奶奶：陈秀英<br>
                            外公：周正清<br>
                            外婆：王婉珍
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">布袋 🐕</div>
                        <div class="pqi-text">
                            公 · 金毛犬<br>
                            由四人共同抚养，彭齐为主要照顾者。<br>
                            白天活动时间随机，晚上通常陪着彭齐。
                        </div>
                    </div>

                </div>

                <!-- ================= 音乐 ================= -->

                <div class="pqi-view" data-page="music">

                    <div class="pqi-player">

                        <div class="pqi-now">
                            <div class="pqi-now-title">未播放音乐</div>
                            <div class="pqi-now-sub">点击下面的歌曲开始播放</div>
                        </div>

                        <input
                            class="pqi-progress"
                            type="range"
                            min="0"
                            max="100"
                            value="0"
                            step="0.1"
                        >

                        <div class="pqi-time">
                            <span class="pqi-current-time">00:00</span>
                            <span class="pqi-total-time">00:00</span>
                        </div>

                        <div class="pqi-controls">
                            <button class="pqi-control pqi-prev">⏮</button>
                            <button class="pqi-control main pqi-play">▶</button>
                            <button class="pqi-control pqi-next">⏭</button>
                        </div>

                    </div>

                    <div class="pqi-card" style="margin-top:10px">
                        <div class="pqi-card-title">音乐列表</div>
                        <div class="pqi-music-list"></div>
                    </div>

                </div>

                <!-- ================= 地点 ================= -->

                <div class="pqi-view" data-page="locations">

                    <div class="pqi-card">
                        <div class="pqi-card-title">云樾公馆 · 家</div>

                        <div class="pqi-text">
                            玄武区 · 8栋
                        </div>
                    </div>

                    <div class="pqi-location">
                        <div class="pqi-location-name">
                            1F · 下沉玄关
                        </div>
                        <div class="pqi-location-desc">
                            下沉式玄关、客厅、壁炉、酒柜、餐厨区、落地窗。
                        </div>
                    </div>

                    <div class="pqi-location">
                        <div class="pqi-location-name">
                            2F · 卧室
                        </div>
                        <div class="pqi-location-desc">
                            主卧套房、次卧。
                        </div>
                    </div>

                    <div class="pqi-location">
                        <div class="pqi-location-name">
                            3F · 私人空间
                        </div>
                        <div class="pqi-location-desc">
                            衣帽间、书房、影音室、露台。
                        </div>
                    </div>

                    <div class="pqi-location">
                        <div class="pqi-location-name">
                            院子
                        </div>
                        <div class="pqi-location-desc">
                            木露台、草坪、种植区、布袋的狗窝。
                        </div>
                    </div>

                </div>

                <!-- ================= 南京 ================= -->

                <div class="pqi-view" data-page="nanjing">

                    <div class="pqi-card">
                        <div class="pqi-card-title">秦淮区</div>

                        <div class="pqi-text">
                            夫子庙<br>
                            秦淮河<br>
                            老门东<br>
                            中华门<br>
                            白鹭洲公园<br>
                            明城墙<br>
                            大报恩寺<br>
                            瞻园
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">玄武区</div>

                        <div class="pqi-text">
                            玄武湖<br>
                            音乐台<br>
                            梧桐大道<br>
                            红山动物园<br>
                            中山陵<br>
                            鸡鸣寺<br>
                            明孝陵<br>
                            总统府<br>
                            明故宫<br>
                            美龄宫<br>
                            灵谷寺<br>
                            1912街区
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">鼓楼区</div>

                        <div class="pqi-text">
                            先锋书店<br>
                            南京大学<br>
                            南京长江大桥<br>
                            颐和路<br>
                            清凉山
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">江宁区 / 栖霞区</div>

                        <div class="pqi-text">
                            南京欢乐谷<br>
                            栖霞山<br>
                            栖霞寺<br>
                            观音门<br>
                            五马渡<br>
                            燕子矶公园<br>
                            达摩古洞<br>
                            牛首山<br>
                            方山
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">雨花台区 / 建邺区</div>

                        <div class="pqi-text">
                            梅港<br>
                            菊花台公园<br>
                            宝塔山森林公园
                        </div>
                    </div>

                    <div class="pqi-card">
                        <div class="pqi-card-title">其他区域</div>

                        <div class="pqi-text">
                            浦口区
                        </div>
                    </div>

                </div>

            </div>
        </div>

        <div class="pqi-trigger" title="彭齐侧边栏">🧸</div>

        <div class="pqi-toast"></div>
    `;

    document.body.appendChild(root);

    /* =========================================================
       4. 获取元素
       ========================================================= */

    const panel = root.querySelector('.pqi-panel');
    const trigger = root.querySelector('.pqi-trigger');
    const closeBtn = root.querySelector('.pqi-close');
    const toast = root.querySelector('.pqi-toast');

    /* =========================================================
       5. Toast
       ========================================================= */

    let toastTimer = null;

    function showToast(text) {
        toast.textContent = text;
        toast.classList.add('show');

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 1800);
    }

    /* =========================================================
       6. Tab
       ========================================================= */

    root.querySelectorAll('.pqi-tab').forEach(tab => {
        tab.addEventListener('click', () => {

            root.querySelectorAll('.pqi-tab').forEach(t => {
                t.classList.remove('active');
            });

            root.querySelectorAll('.pqi-view').forEach(view => {
                view.classList.remove('active');
            });

            tab.classList.add('active');

            const page = tab.dataset.view;

            const target = root.querySelector(
                `.pqi-view[data-page="${page}"]`
            );

            if (target) {
                target.classList.add('active');
            }
        });
    });

    /* =========================================================
       7. 打开 / 关闭
       ========================================================= */

    function openPanel() {
        panel.classList.add('open');
    }

    function closePanel() {
        panel.classList.remove('open');
    }

    trigger.addEventListener('click', e => {

        // 拖动结束后不执行点击
        if (trigger.dataset.dragged === '1') {
            trigger.dataset.dragged = '0';
            return;
        }

        panel.classList.toggle('open');
    });

    closeBtn.addEventListener('click', closePanel);

    /* =========================================================
       8. 拖动 🧸
       ========================================================= */

    let dragging = false;
    let moved = false;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;

    function loadPosition() {

        try {
            const saved = localStorage.getItem(POS_KEY);

            if (!saved) {
                return;
            }

            const pos = JSON.parse(saved);

            if (
                typeof pos.left === 'number' &&
                typeof pos.top === 'number'
            ) {
                applyPosition(pos.left, pos.top);
            }

        } catch (e) {}
    }

    function applyPosition(left, top) {

        const maxLeft = Math.max(
            5,
            window.innerWidth - trigger.offsetWidth - 5
        );

        const maxTop = Math.max(
            5,
            window.innerHeight - trigger.offsetHeight - 5
        );

        left = Math.max(5, Math.min(left, maxLeft));
        top = Math.max(5, Math.min(top, maxTop));

        trigger.style.left = `${left}px`;
        trigger.style.top = `${top}px`;
        trigger.style.right = 'auto';
        trigger.style.bottom = 'auto';
    }

    function savePosition() {

        try {
            const rect = trigger.getBoundingClientRect();

            localStorage.setItem(
                POS_KEY,
                JSON.stringify({
                    left: rect.left,
                    top: rect.top
                })
            );

        } catch (e) {}
    }

    trigger.addEventListener('pointerdown', e => {

        dragging = true;
        moved = false;

        startX = e.clientX;
        startY = e.clientY;

        const rect = trigger.getBoundingClientRect();

        startLeft = rect.left;
        startTop = rect.top;

        try {
            trigger.setPointerCapture(e.pointerId);
        } catch (err) {}

        e.preventDefault();
    });

    trigger.addEventListener('pointermove', e => {

        if (!dragging) {
            return;
        }

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            moved = true;
        }

        if (!moved) {
            return;
        }

        applyPosition(
            startLeft + dx,
            startTop + dy
        );

        e.preventDefault();
    });

    trigger.addEventListener('pointerup', e => {

        if (!dragging) {
            return;
        }

        dragging = false;

        if (moved) {
            trigger.dataset.dragged = '1';
            savePosition();
        }

        try {
            trigger.releasePointerCapture(e.pointerId);
        } catch (err) {}

        e.preventDefault();
    });

    trigger.addEventListener('pointercancel', () => {
        dragging = false;
    });

    loadPosition();

    /* =========================================================
       9. 酒馆输入框
       ========================================================= */

    function findTextarea() {

        const selectors = [
            '#send_textarea',
            '#mufy_chat_input_box textarea',
            'textarea[placeholder*="输入"]',
            'textarea[placeholder*="发送"]',
            'textarea'
        ];

        for (const selector of selectors) {

            const element = document.querySelector(selector);

            if (element) {
                return element;
            }
        }

        return null;
    }

    function setInputValue(textarea, value) {

        const prototype =
            Object.getPrototypeOf(textarea);

        const descriptor =
            Object.getOwnPropertyDescriptor(
                prototype,
                'value'
            );

        if (descriptor && descriptor.set) {
            descriptor.set.call(textarea, value);
        } else {
            textarea.value = value;
        }

        textarea.dispatchEvent(
            new Event('input', {
                bubbles: true
            })
        );

        textarea.dispatchEvent(
            new Event('change', {
                bubbles: true
            })
        );
    }

    /* =========================================================
       10. 找发送按钮
       ========================================================= */

    function findSendButton() {

        const selectors = [
            '#send_but',
            '#send_button',
            'button[id*="send_but"]',
            'button[title*="发送"]',
            'button[aria-label*="发送"]'
        ];

        for (const selector of selectors) {

            const button =
                document.querySelector(selector);

            if (button) {
                return button;
            }
        }

        return null;
    }

    /* =========================================================
       11. 发送指令
       ========================================================= */

    async function sendCommand(command) {

        const textarea = findTextarea();

        if (!textarea) {
            showToast('找不到酒馆输入框');
            return;
        }

        setInputValue(textarea, command);

        // 给酒馆一点时间处理 input/change
        await new Promise(resolve => {
            setTimeout(resolve, 120);
        });

        const sendButton = findSendButton();

        if (sendButton) {

            sendButton.click();

            showToast('指令已发送');

            return;
        }

        // 如果没找到发送按钮，尝试 Enter
        textarea.focus();

        textarea.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true
            })
        );

        showToast('指令已发送');
    }

    /* =========================================================
       12. 指令按钮
       ========================================================= */

    root.querySelectorAll('.pqi-command').forEach(button => {

        button.addEventListener('click', () => {

            const command =
                button.dataset.command || '';

            if (!command) {
                return;
            }

            sendCommand(command);
        });
    });

    /* =========================================================
       13. 音乐数据
       ========================================================= */

    const musicList = [
        {
            name: '天气音乐 · 雨天',
            url: 'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy8wNGVlMzRiOWU0OGFkNmQ5L0lRQ0xYaTJDYV83UFFZMXNKaUh1cS1oNUFlbGd4dDlScy1DQWpySHBKbXc0XzUwP2U9cEtoOXlu.mp3'
        },
        {
            name: '没预报的雨',
            url: 'https://audio.fukit.cn/autoupload/f/fin4WXoO4f2EFPY5nYXxsNiO_OyvX7mIgxFBfDMDErs/20260320/hzzN/%E6%9E%97%E6%97%B6%E5%B1%BF%2C%E8%91%9B%E9%9B%A8%E6%99%B4-%E6%B2%A1%E9%A2%84%E6%8A%A5%E7%9A%84%E9%9B%A8.mp3'
        },
        {
            name: '指纹',
            url: 'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy8wNGVlMzRiOWU0OGFkNmQ5L0lRQ3dVdzJ2WFZHa1I2SXF5U1NtT0swa0FTVnFObHkzeUZDR0NjY0RDZUFzTkFzP2U9VUdjYWs4.mp3'
        },
        {
            name: '小鹿乱撞',
            url: 'https://audio.fukit.cn/autoupload/f/fin4WXoO4f2EFPY5nYXxsNiO_OyvX7mIgxFBfDMDErs/20260320/6Cim/%E6%98%AF%E6%96%87%E5%B7%9D%E5%90%97-%E6%B0%B8%E5%BD%ACRyan.B%E3%80%81%E7%8B%84%E8%BF%AA_%28%E5%B0%8F%E9%B9%BF%E4%B9%B1%E6%92%9E%29.mp3'
        },
        {
            name: '雨',
            url: 'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy8wNGVlMzRiOWU0OGFkNmQ5L0lRQ3dFN192ZElqUVQ3bmt2c1hNT09ONkFYc3F3U3pmcGtjaW5uTGphdm42WThvP2U9VUxWOWNQ.mp3'
        }
    ];

    /* =========================================================
       14. 音乐播放器
       ========================================================= */

    const audio = new Audio();

    audio.preload = 'metadata';

    let currentMusicIndex = 0;
    let playing = false;

    const musicListElement =
        root.querySelector('.pqi-music-list');

    const nowTitle =
        root.querySelector('.pqi-now-title');

    const nowSub =
        root.querySelector('.pqi-now-sub');

    const playButton =
        root.querySelector('.pqi-play');

    const prevButton =
        root.querySelector('.pqi-prev');

    const nextButton =
        root.querySelector('.pqi-next');

    const progress =
        root.querySelector('.pqi-progress');

    const currentTimeElement =
        root.querySelector('.pqi-current-time');

    const totalTimeElement =
        root.querySelector('.pqi-total-time');

    function formatTime(seconds) {

        if (!Number.isFinite(seconds)) {
            return '00:00';
        }

        seconds = Math.max(0, Math.floor(seconds));

        const minutes =
            Math.floor(seconds / 60);

        const secs =
            seconds % 60;

        return String(minutes).padStart(2, '0')
            + ':'
            + String(secs).padStart(2, '0');
    }

    function renderMusicList() {

        musicListElement.innerHTML = '';

        musicList.forEach((music, index) => {

            const item =
                document.createElement('div');

            item.className =
                'pqi-music-item';

            if (index === currentMusicIndex) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div class="pqi-music-index">
                    ${index + 1}
                </div>

                <div class="pqi-music-name">
                    ${music.name}
                </div>
            `;

            item.addEventListener('click', () => {
                loadMusic(index, true);
            });

            musicListElement.appendChild(item);
        });
    }

    function updateMusicListActive() {

        root.querySelectorAll('.pqi-music-item')
            .forEach((item, index) => {

                item.classList.toggle(
                    'active',
                    index === currentMusicIndex
                );
            });
    }

    function loadMusic(index, autoPlay = false) {

        if (!musicList[index]) {
            return;
        }

        currentMusicIndex = index;

        const music = musicList[index];

        audio.pause();

        audio.src = music.url;
        audio.currentTime = 0;

        nowTitle.textContent =
            music.name;

        nowSub.textContent =
            '正在准备播放';

        progress.value = 0;

        currentTimeElement.textContent =
            '00:00';

        totalTimeElement.textContent =
            '00:00';

        updateMusicListActive();

        if (autoPlay) {
            playMusic();
        }
    }

    async function playMusic() {

        if (!audio.src) {
            loadMusic(currentMusicIndex, false);
        }

        try {

            await audio.play();

            playing = true;

            playButton.textContent = '⏸';

            nowSub.textContent =
                '正在播放';

        } catch (error) {

            playing = false;

            playButton.textContent = '▶';

            nowSub.textContent =
                '播放失败，请检查音乐链接';

            showToast('音乐播放失败');

            console.warn(
                '[彭齐侧边栏] 音乐播放失败',
                error
            );
        }
    }

    function pauseMusic() {

        audio.pause();

        playing = false;

        playButton.textContent = '▶';

        nowSub.textContent =
            '已暂停';
    }

    function toggleMusic() {

        if (playing) {
            pauseMusic();
        } else {
            playMusic();
        }
    }

    function nextMusic() {

        currentMusicIndex =
            (currentMusicIndex + 1)
            % musicList.length;

        loadMusic(currentMusicIndex, true);
    }

    function previousMusic() {

        currentMusicIndex =
            (currentMusicIndex - 1 + musicList.length)
            % musicList.length;

        loadMusic(currentMusicIndex, true);
    }

    playButton.addEventListener(
        'click',
        toggleMusic
    );

    nextButton.addEventListener(
        'click',
        nextMusic
    );

    prevButton.addEventListener(
        'click',
        previousMusic
    );

    audio.addEventListener(
        'loadedmetadata',
        () => {

            totalTimeElement.textContent =
                formatTime(audio.duration);

            nowSub.textContent =
                playing ? '正在播放' : '准备就绪';
        }
    );

    audio.addEventListener(
        'timeupdate',
        () => {

            if (!Number.isFinite(audio.duration)) {
                return;
            }

            progress.value =
                (audio.currentTime / audio.duration) * 100;

            currentTimeElement.textContent =
                formatTime(audio.currentTime);

            totalTimeElement.textContent =
                formatTime(audio.duration);
        }
    );

    audio.addEventListener(
        'ended',
        () => {

            playing = false;

            playButton.textContent = '▶';

            nextMusic();
        }
    );

    audio.addEventListener(
        'error',
        () => {

            playing = false;

            playButton.textContent = '▶';

            nowSub.textContent =
                '音乐地址无法访问';

            showToast('音乐地址无法访问');
        }
    );

    progress.addEventListener(
        'input',
        () => {

            if (!Number.isFinite(audio.duration)) {
                return;
            }

            const percent =
                Number(progress.value) / 100;

            audio.currentTime =
                audio.duration * percent;
        }
    );

    renderMusicList();

    /* =========================================================
       15. 角色检测
       ========================================================= */

    function updateVisibility() {

        if (isPengQi()) {
            root.style.display = '';
        } else {
            root.style.display = 'none';
            closePanel();
        }
    }

    // 第一次检测
    updateVisibility();

    // 酒馆切角色时重新检测
    const characterEvents = [
        'character_page_loaded',
        'chat_id_changed',
        'chat_loaded',
        'message_received',
        'message_sent'
    ];

    characterEvents.forEach(eventName => {

        document.addEventListener(
            eventName,
            updateVisibility
        );
    });

    // 某些酒馆版本不会抛出统一事件，所以轮询
    const visibilityTimer =
        setInterval(
            updateVisibility,
            1200
        );

    /* =========================================================
       16. 窗口尺寸变化
       ========================================================= */

    function keepTriggerInsideScreen() {

        const rect =
            trigger.getBoundingClientRect();

        if (
            rect.left < 5 ||
            rect.top < 5 ||
            rect.right > window.innerWidth - 5 ||
            rect.bottom > window.innerHeight - 5
        ) {
            applyPosition(
                Math.min(
                    Math.max(5, rect.left),
                    window.innerWidth -
                    trigger.offsetWidth -
                    5
                ),
                Math.min(
                    Math.max(5, rect.top),
                    window.innerHeight -
                    trigger.offsetHeight -
                    5
                )
            );

            savePosition();
        }
    }

    window.addEventListener(
        'resize',
        keepTriggerInsideScreen
    );

    /* =========================================================
       17. 清理函数
       ========================================================= */

    window.__pengqiSidebarCleanup = () => {

        clearInterval(visibilityTimer);

        window.removeEventListener(
            'resize',
            keepTriggerInsideScreen
        );

        characterEvents.forEach(eventName => {
            document.removeEventListener(
                eventName,
                updateVisibility
            );
        });

        try {
            audio.pause();
            audio.src = '';
        } catch (e) {}

        try {
            root.remove();
        } catch (e) {}

        try {
            style.remove();
        } catch (e) {}
    };

    console.log(
        '[彭齐伴生侧边栏] V3 已加载'
    );

})();

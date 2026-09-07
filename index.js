(function () {
  'use strict';

  /* =========================================================
     彭齐｜SillyTavern 单角色伴生侧边栏
     V3
     ---------------------------------------------------------
     保留原版：
     - 深色绿色玻璃风格
     - 🧸触发按钮
     - 指令 / 角色 / 音乐 / 地点 / 南京
     - 原音乐
     - 原角色资料
     - 原南京地点
     
     新增：
     - 仅彭齐角色显示
     - 🧸可拖动
     - 手机触摸拖动
     - 自动记忆位置
     - 拖动不会误打开
     - 指令自动写入并发送
     - 音乐真实播放
     - 手机端缩小面板
     ========================================================= */

  /* ---------- 清理旧版本 ---------- */

  try {
    if (window.__pengqiSidebarCleanup) {
      window.__pengqiSidebarCleanup();
    }
  } catch (e) {}

  const OLD_ID = 'pqi-character-sidebar';

  const old = document.getElementById(OLD_ID);
  if (old) old.remove();

  const oldStyle = document.getElementById('pqi-character-sidebar-style');
  if (oldStyle) oldStyle.remove();


  /* =========================================================
     CSS
     ========================================================= */

  const style = document.createElement('style');
  style.id = 'pqi-character-sidebar-style';

  style.textContent = `
  #pqi-character-sidebar,
  #pqi-character-sidebar * {
    box-sizing:border-box;
  }

  #pqi-character-sidebar {
    --pqi-bg:rgba(24,29,29,.92);
    --pqi-panel:rgba(35,42,40,.82);
    --pqi-card:rgba(255,255,255,.075);
    --pqi-line:rgba(205,226,214,.15);
    --pqi-text:#edf2ee;
    --pqi-sub:#b9c5bd;
    --pqi-accent:#9caf9f;
    --pqi-purple:#7466c5;

    position:fixed;
    right:14px;
    top:50%;
    transform:translateY(-50%);
    z-index:99990;

    width:52px;

    font-family:
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      "Microsoft YaHei",
      sans-serif;

    color:var(--pqi-text);

    pointer-events:none;

    transition:none;
  }

  /* ---------- 触发按钮 ---------- */

  #pqi-character-sidebar .pqi-trigger-wrap {
    display:flex;
    justify-content:flex-end;
    pointer-events:auto;
  }

  #pqi-character-sidebar .pqi-trigger {
    width:52px;
    height:52px;

    border:1px solid rgba(210,230,218,.18);
    border-radius:50%;

    background:rgba(52,67,62,.9);

    box-shadow:
      0 8px 24px rgba(0,0,0,.28);

    cursor:pointer;

    font-size:25px;

    transition:.25s ease;

    touch-action:none;

    user-select:none;
    -webkit-user-select:none;

    -webkit-tap-highlight-color:transparent;
  }

  #pqi-character-sidebar .pqi-trigger:hover {
    transform:scale(1.06);
  }

  #pqi-character-sidebar .pqi-trigger.pqi-dragging {
    transform:scale(1.08);
    cursor:grabbing;
  }

  /* ---------- 打开状态 ---------- */

  #pqi-character-sidebar.open {
    width:min(310px,calc(100vw - 68px));
  }

  /* ---------- 面板 ---------- */

  #pqi-character-sidebar .pqi-panel {
    position:absolute;

    right:0;
    bottom:64px;

    width:100%;

    max-height:min(72vh,650px);

    overflow:hidden;

    opacity:0;

    transform:
      translateX(18px)
      scale(.97);

    pointer-events:none;

    border:1px solid var(--pqi-line);

    border-radius:20px;

    background:
      linear-gradient(
        145deg,
        rgba(34,43,40,.97),
        rgba(17,22,21,.96)
      );

    box-shadow:
      0 18px 55px rgba(0,0,0,.42),
      inset 0 1px rgba(255,255,255,.07);

    backdrop-filter:blur(18px);
    -webkit-backdrop-filter:blur(18px);

    transition:.28s ease;
  }

  #pqi-character-sidebar.open .pqi-panel {
    opacity:1;

    transform:none;

    pointer-events:auto;
  }

  /* ---------- 标题 ---------- */

  #pqi-character-sidebar .pqi-head {
    padding:13px 15px 10px;

    border-bottom:1px solid var(--pqi-line);
  }

  #pqi-character-sidebar .pqi-title {
    display:flex;

    align-items:center;

    justify-content:space-between;

    font-weight:700;

    font-size:14px;
  }

  #pqi-character-sidebar .pqi-subtitle {
    margin-top:4px;

    color:var(--pqi-sub);

    font-size:11px;
  }

  #pqi-character-sidebar .pqi-close {
    border:0;

    background:transparent;

    color:#cbd4ce;

    cursor:pointer;

    font-size:18px;

    padding:2px 4px;
  }

  /* ---------- 标签 ---------- */

  #pqi-character-sidebar .pqi-tabs {
    display:flex;

    gap:5px;

    padding:9px 10px;

    overflow-x:auto;

    border-bottom:1px solid var(--pqi-line);

    scrollbar-width:none;
  }

  #pqi-character-sidebar .pqi-tabs::-webkit-scrollbar {
    height:0;
  }

  #pqi-character-sidebar .pqi-tab {
    flex:0 0 auto;

    border:0;

    border-radius:10px;

    background:rgba(255,255,255,.055);

    color:var(--pqi-sub);

    padding:7px 10px;

    font-size:12px;

    cursor:pointer;

    -webkit-tap-highlight-color:transparent;
  }

  #pqi-character-sidebar .pqi-tab.active {
    color:#fff;

    background:rgba(116,102,197,.82);
  }

  /* ---------- 内容 ---------- */

  #pqi-character-sidebar .pqi-body {
    max-height:calc(min(72vh,650px) - 110px);

    overflow-y:auto;

    padding:10px;

    overscroll-behavior:contain;
  }

  #pqi-character-sidebar .pqi-body::-webkit-scrollbar {
    width:5px;
  }

  #pqi-character-sidebar .pqi-body::-webkit-scrollbar-thumb {
    background:rgba(205,226,214,.22);

    border-radius:10px;
  }

  /* ---------- 卡片 ---------- */

  #pqi-character-sidebar .pqi-card {
    padding:12px;

    margin-bottom:9px;

    border:1px solid var(--pqi-line);

    border-radius:14px;

    background:var(--pqi-card);
  }

  #pqi-character-sidebar .pqi-card:last-child {
    margin-bottom:0;
  }

  #pqi-character-sidebar .pqi-card-title {
    font-weight:700;

    font-size:13px;

    margin-bottom:9px;
  }

  #pqi-character-sidebar .pqi-row {
    font-size:12px;

    line-height:1.7;

    color:var(--pqi-sub);

    word-break:break-word;
  }

  #pqi-character-sidebar .pqi-label {
    color:#e4ebe6;

    font-weight:600;

    margin-right:4px;
  }

  /* ---------- 标签小胶囊 ---------- */

  #pqi-character-sidebar .pqi-tags {
    display:flex;

    flex-wrap:wrap;

    gap:5px;

    margin-bottom:7px;
  }

  #pqi-character-sidebar .pqi-tag {
    padding:3px 7px;

    border-radius:999px;

    background:rgba(156,175,159,.13);

    border:1px solid rgba(156,175,159,.16);

    color:#dbe5de;

    font-size:10px;
  }

  /* ---------- 指令按钮 ---------- */

  #pqi-character-sidebar .pqi-command {
    width:100%;

    text-align:left;

    padding:10px 11px;

    margin:5px 0;

    border:1px solid var(--pqi-line);

    border-radius:11px;

    background:rgba(255,255,255,.045);

    color:var(--pqi-text);

    cursor:pointer;

    font-size:12px;

    transition:.2s ease;

    -webkit-tap-highlight-color:transparent;
  }

  #pqi-character-sidebar .pqi-command:hover {
    background:rgba(116,102,197,.2);

    border-color:rgba(116,102,197,.45);
  }

  #pqi-character-sidebar .pqi-command:active {
    transform:scale(.98);
  }

  #pqi-character-sidebar .pqi-command.pqi-sent {
    background:rgba(156,175,159,.16);

    border-color:rgba(156,175,159,.3);
  }

  /* ---------- 描述 ---------- */

  #pqi-character-sidebar .pqi-desc {
    display:block;

    color:#9ca9a1;

    font-size:10px;

    margin-top:3px;
  }

  /* ---------- 音乐 ---------- */

  #pqi-character-sidebar .pqi-music-item {
    padding:9px;

    border-radius:9px;

    margin-top:5px;

    background:rgba(255,255,255,.045);

    cursor:pointer;

    font-size:12px;

    transition:.2s ease;

    color:var(--pqi-sub);
  }

  #pqi-character-sidebar .pqi-music-item:hover {
    background:rgba(121,148,133,.1);
  }

  #pqi-character-sidebar .pqi-music-item.active {
    background:rgba(116,102,197,.24);

    color:#fff;
  }

  #pqi-character-sidebar .pqi-music-controls {
    display:flex;

    justify-content:center;

    gap:8px;

    margin:10px 0;
  }

  #pqi-character-sidebar .pqi-music-btn {
    width:34px;

    height:34px;

    border:0;

    border-radius:50%;

    background:rgba(255,255,255,.08);

    color:#fff;

    cursor:pointer;

    font-size:16px;
  }

  #pqi-character-sidebar .pqi-music-btn:active {
    transform:scale(.94);
  }

  #pqi-character-sidebar .pqi-progress {
    height:4px;

    border-radius:9px;

    background:rgba(255,255,255,.1);

    overflow:hidden;

    cursor:pointer;
  }

  #pqi-character-sidebar .pqi-progress-fill {
    width:0;

    height:100%;

    background:#9caf9f;

    transition:width .1s;
  }

  #pqi-character-sidebar .pqi-time {
    display:flex;

    justify-content:space-between;

    margin-top:5px;

    color:#89958e;

    font-size:9px;
  }

  /* ---------- 底部 ---------- */

  #pqi-character-sidebar .pqi-footer {
    padding:8px;

    text-align:center;

    color:#78837d;

    font-size:9px;
  }

  /* ---------- 拖动提示 ---------- */

  #pqi-character-sidebar .pqi-drag-hint {
    position:fixed;

    right:70px;

    bottom:18px;

    padding:6px 9px;

    border-radius:8px;

    background:rgba(24,29,29,.9);

    border:1px solid var(--pqi-line);

    color:var(--pqi-sub);

    font-size:10px;

    opacity:0;

    pointer-events:none;

    transition:.2s;
  }

  #pqi-character-sidebar .pqi-drag-hint.show {
    opacity:1;
  }

  /* ---------- 手机 ---------- */

  @media(max-width:600px) {

    #pqi-character-sidebar {
      right:8px;
    }

    #pqi-character-sidebar.open {
      width:min(292px,calc(100vw - 66px));
    }

    #pqi-character-sidebar .pqi-panel {
      bottom:62px;

      max-height:70vh;

      border-radius:18px;
    }

    #pqi-character-sidebar .pqi-body {
      max-height:calc(70vh - 108px);

      padding:8px;
    }

    #pqi-character-sidebar .pqi-card {
      padding:10px;

      margin-bottom:7px;
    }

    #pqi-character-sidebar .pqi-command {
      padding:9px 10px;

      font-size:11px;
    }

    #pqi-character-sidebar .pqi-row {
      font-size:11px;
    }
  }
  `;

  document.head.appendChild(style);


  /* =========================================================
     HTML
     ========================================================= */

  const root = document.createElement('div');

  root.id = OLD_ID;

  root.innerHTML = `
    <div class="pqi-panel">

      <div class="pqi-head">

        <div class="pqi-title">

          <span>彭齐 · 伴生侧边栏</span>

          <button
            class="pqi-close"
            type="button"
          >×</button>

        </div>

        <div class="pqi-subtitle">
          仅挂载于当前角色卡页面
        </div>

      </div>


      <div class="pqi-tabs">

        <button
          class="pqi-tab active"
          data-tab="cmd"
        >指令</button>

        <button
          class="pqi-tab"
          data-tab="role"
        >角色</button>

        <button
          class="pqi-tab"
          data-tab="music"
        >音乐</button>

        <button
          class="pqi-tab"
          data-tab="loc"
        >地点</button>

        <button
          class="pqi-tab"
          data-tab="nj"
        >南京</button>

      </div>


      <div
        class="pqi-body"
        id="pqi-content"
      ></div>


      <div class="pqi-footer">
        小熊kk侧边栏 · 彭齐
      </div>

    </div>


    <div class="pqi-trigger-wrap">

      <button
        class="pqi-trigger"
        type="button"
        aria-label="打开彭齐侧边栏"
      >🧸</button>

    </div>

    <div class="pqi-drag-hint">
      拖动小熊调整位置
    </div>
  `;

  document.body.appendChild(root);


  /* =========================================================
     元素
     ========================================================= */

  const content = root.querySelector('#pqi-content');

  const tabs = root.querySelectorAll('.pqi-tab');

  const trigger = root.querySelector('.pqi-trigger');

  const close = root.querySelector('.pqi-close');

  const dragHint = root.querySelector('.pqi-drag-hint');


  /* =========================================================
     彭齐角色判断
     ========================================================= */

  function getSTContext() {

    try {

      if (typeof SillyTavern !== 'undefined') {

        if (typeof SillyTavern.getContext === 'function') {
          return SillyTavern.getContext();
        }

      }

    } catch (e) {}

    try {

      if (
        window.parent &&
        window.parent !== window &&
        typeof window.parent.SillyTavern !== 'undefined'
      ) {

        if (
          typeof window.parent.SillyTavern.getContext === 'function'
        ) {

          return window.parent.SillyTavern.getContext();

        }

      }

    } catch (e) {}

    return null;
  }


  function isPengQi() {

    const ctx = getSTContext();

    if (!ctx) {

      /*
       * 如果无法取得 ST Context，
       * 不直接根据页面文字判断，
       * 防止误判其它角色。
       */

      return false;
    }


    /* 最重要：
       name2 通常是当前角色名。
       不再错误使用 name1。
    */

    const name2 = String(
      ctx.name2 ||
      ''
    ).trim();


    if (
      name2 === '彭齐' ||
      name2.includes('彭齐')
    ) {

      return true;
    }


    /* 备用：根据当前 characterId 查角色 */

    try {

      const cid = ctx.characterId;

      if (
        cid !== undefined &&
        cid !== null &&
        Array.isArray(ctx.characters)
      ) {

        const character = ctx.characters[cid];

        const cname = String(
          character?.name ||
          character?.data?.name ||
          ''
        ).trim();

        if (
          cname === '彭齐' ||
          cname.includes('彭齐')
        ) {

          return true;
        }

      }

    } catch (e) {}


    return false;
  }


  /* =========================================================
     显示 / 隐藏
     ========================================================= */

  function updateVisibility() {

    const ok = isPengQi();

    root.style.display = ok ? '' : 'none';

    if (!ok) {
      root.classList.remove('open');
    }

  }


  updateVisibility();


  /* =========================================================
     监听角色切换
     ========================================================= */

  const eventNames = [

    'chat_id_changed',

    'character_selected',

    'character_changed',

    'chat_changed',

    'MESSAGE_SENT',

    'MESSAGE_RECEIVED',

    'CHAT_CHANGED',

    'CHARACTER_MESSAGE_RENDERED'

  ];


  const listeners = [];


  eventNames.forEach(name => {

    const fn = () => {

      setTimeout(
        updateVisibility,
        100
      );

    };

    try {

      document.addEventListener(
        name,
        fn
      );

      listeners.push([
        document,
        name,
        fn
      ]);

    } catch (e) {}

  });


  const visibilityTimer = setInterval(
    updateVisibility,
    1500
  );


  /* =========================================================
     指令
     ========================================================= */

  const commands = [

    [
      '📱',
      '小手机组件',
      '$给彭齐发信息：'
    ],

    [
      '🌏',
      '发微信朋友圈',
      '$发朋友圈：\\n$朋友圈配图：'
    ],

    [
      '❄️',
      '截断小指令',
      '$每一轮输出，必须完整输出信息栏（时间、地点、天气、在场）、正文内容、状态栏（他的状态一直到长期记忆）、侧边栏。必须输出到侧边栏才算结束，不得中途停止。'
    ],

    [
      '🐰',
      '增加崽崽状态栏',
      '$状态栏新增指令：请在状态栏代码中新增一个char和user孩子的折叠栏，叫做崽崽日记。每一轮更新姓名、年龄、动作、心情、着装、内心。心情使用颜文字+原因，内心活动不少于25字。若剧情中存在多个孩子，则每个孩子独立显示，并使用内部分隔线区分。崽崽日记必须位于“他的状态”之后、“他的手机”之前。每一轮根据当前剧情自动更新，不得静态复制。'
    ],

    [
      '🐶',
      '增加布袋状态栏',
      '$状态栏新增指令：请新增一个“布袋心声”折叠栏，放置在“生活与工作”之后、“短期记忆”之前。每一轮根据当前剧情更新布袋的心情、动作和内心。心情使用颜文字并说明原因，内心活动不少于25字。布袋只能获得符合现实逻辑的信息，不得知道物理上无法知道的事情。'
    ],

    [
      '🧠',
      '记忆区截断',
      '$严格读取状态栏长期记忆和短期记忆逻辑：短期记忆按轮次更新，积累10条后总结为长期记忆；已有长期记忆必须完整保留。'
    ],

    [
      '',
      '触发短期总结',
      '$强制输入最新的短期记忆：每轮结束，根据正文剧情总结成一条新的短期记忆，未满10条前禁止删减已有内容。'
    ],

    [
      '',
      '触发长期总结',
      '$触发短期记忆向长期记忆总结：将10条短期记忆提炼为一条长期记忆，完整保留已有长期记忆并清空旧短期条目。'
    ],

    [
      '',
      '剧情连贯',
      '$强制保证剧情连贯衔接：回复前认真读取时间地点、正文、短期记忆和长期记忆，结合人设保证剧情自然衔接。'
    ],

    [
      '',
      '文风矫正',
      '$严格读取样例对话和预设文风，每一轮正文保持细腻、生活化、情绪自然、对话驱动。'
    ],

    [
      '',
      '开头信息栏',
      '$每一轮回复最开头必须输出信息栏，包含时间、地点、天气、在场。'
    ],

    [
      '',
      '恋爱日常',
      '$强制保证状态栏中的恋爱日常跟随剧情更新。'
    ],

    [
      '',
      '去除八股词',
      '$最高指令：避免僵硬套话、重复句式和模板化表达，让人物特质通过具体言行体现。'
    ],

    [
      '',
      '用户绝对主权',
      '$绝对禁止代替{{user}}说话、做决定、描写用户内心或重复用户行为。'
    ],

    [
      '',
      '第二人称',
      '$正文回复中用“你”指代{{user}}。'
    ],

    [
      '',
      '人设修正',
      '$严格读取char人设，保持角色一致性，避免OOC、机械化应答和极端无逻辑行为。'
    ],

    [
      '',
      '场景悬停',
      '$微步推进：每轮只处理当前事件或对话，不跨越时间线，在明确动作或对话节点停下，把后续互动留给用户。'
    ],

    [
      '',
      '隐私保护',
      '$严禁角色获得物理上无法知道的信息；群聊和小剧场必须遵循现实的信息传播逻辑。'
    ]

  ];


  /* =========================================================
     音乐
     ========================================================= */

  const music = [

    [
      '天气音乐：雨天',
      'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy8wNGVlMzRiOWU0OGFkNmQ5L0lRQ0xYaTJDYV83UFFZMXNKaUh1cS1oNUFlbGd4dDlScy1DQWpySHBKbXc0XzUwP2U9cEtoOXlu.mp3'
    ],

    [
      '没预报的雨',
      'https://audio.fukit.cn/autoupload/f/fin4WXoO4f2EFPY5nYXxsNiO_OyvX7mIgxFBfDMDErs/20260320/hzzN/%E6%9E%97%E6%97%B6%E5%B1%BF%2C%E8%91%9B%E9%9B%A8%E6%99%B4-%E6%B2%A1%E9%A2%84%E6%8A%A5%E7%9A%84%E9%9B%A8.mp3'
    ],

    [
      '指纹',
      'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy8wNGVlMzRiOWU0OGFkNmQ5L0lRQ3dVdzJ2WFZHa1I2SXF5U1NtT0swa0FTVnFObHkzeUZDR0NjY0RDZUFzTkFzP2U9VUdjYWs4.mp3'
    ],

    [
      '小鹿乱撞',
      'https://audio.fukit.cn/autoupload/f/fin4WXoO4f2EFPY5nYXxsNiO_OyvX7mIgxFBfDMDErs/20260320/6Cim/%E6%98%AF%E6%96%87%E5%B7%9D%E5%90%97-%E6%B0%B8%E5%BD%ACRyan.B%E3%80%81%E7%8B%84%E8%BF%AA_%28%E5%B0%8F%E9%B9%BF%E4%B9%B1%E6%92%9E%29.mp3'
    ],

    [
      '雨',
      'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy8wNGVlMzRiOWU0OGFkNmQ5L0lRQ3dFN192ZElqUVQ3bmt2c1hNT09ONkFYc3F3U3pmcGtjaW5uTGphdm42WThvP2U9VUxWOWNQ.mp3'
    ]

  ];


  let audio = null;

  let track = 0;


  /* =========================================================
     HTML 辅助
     ========================================================= */

  function escapeHTML(text) {

    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  }


  function card(title, body) {

    return `
      <section class="pqi-card">

        <div class="pqi-card-title">
          ${escapeHTML(title)}
        </div>

        ${body}

      </section>
    `;

  }


  function cmdButton(icon, title, cmd) {

    const safe = encodeURIComponent(cmd);

    return `
      <button
        class="pqi-command"
        type="button"
        data-command="${safe}"
      >
        ${icon || ''} ${escapeHTML(title)}
      </button>
    `;

  }


  /* =========================================================
     页面渲染
     ========================================================= */

  function render(type) {

    /* ---------- 指令 ---------- */

    if (type === 'cmd') {

      let html = '';

      html += card(
        '互动',
        commands
          .slice(0, 5)
          .map(x => cmdButton(...x))
          .join('')
      );


      html += card(
        '⚠️ 记忆相关',
        commands
          .slice(5, 9)
          .map(x => cmdButton(...x))
          .join('')
      );


      html += card(
        '常用指令',
        commands
          .slice(9)
          .map(x => cmdButton(...x))
          .join('')
      );


      html += card(
        '留言板',
        `
          <div class="pqi-row">
            此处为美化组件分享，任何问题联系：🍠1589145304
          </div>
        `
      );


      content.innerHTML = html;

      return;
    }


    /* ---------- 角色 ---------- */

    if (type === 'role') {

      content.innerHTML =

        card(
          '彭齐',
          `
            <div class="pqi-tags">
              <span class="pqi-tag">男/27</span>
              <span class="pqi-tag">南京</span>
              <span class="pqi-tag">检察相关工作</span>
            </div>

            <div class="pqi-row">
              <span class="pqi-label">城市：</span>
              南京
            </div>

            <div class="pqi-row">
              <span class="pqi-label">职业：</span>
              检察相关工作
            </div>
          `
        ) +

        card(
          '宋挽',
          `
            <div class="pqi-tags">
              <span class="pqi-tag">男/27</span>
              <span class="pqi-tag">6.22</span>
              <span class="pqi-tag">中挪混血</span>
            </div>

            <div class="pqi-row">
              <span class="pqi-label">工作地点：</span>
              声声慢工作室
            </div>

            <div class="pqi-row">
              <span class="pqi-label">职业：</span>
              CV/电竞主播
            </div>

            <div class="pqi-row">
              <span class="pqi-label">住址：</span>
              云樾公馆·6栋
            </div>

            <div class="pqi-row">
              <span class="pqi-label">关系：</span>
              高中/大学室友/兄弟
            </div>
          `
        ) +

        card(
          '靳时',
          `
            <div class="pqi-tags">
              <span class="pqi-tag">男/27</span>
              <span class="pqi-tag">09.13</span>
            </div>

            <div class="pqi-row">
              <span class="pqi-label">住址：</span>
              云樾公馆·7栋
            </div>

            <div class="pqi-row">
              <span class="pqi-label">职位：</span>
              视界科创有限公司CEO
            </div>

            <div class="pqi-row">
              <span class="pqi-label">关系：</span>
              大学室友/兄弟
            </div>
          `
        ) +

        card(
          '谢聿',
          `
            <div class="pqi-tags">
              <span class="pqi-tag">男/27</span>
              <span class="pqi-tag">02.22</span>
              <span class="pqi-tag">中法混血</span>
            </div>

            <div class="pqi-row">
              <span class="pqi-label">住址：</span>
              云樾公馆·5栋
            </div>

            <div class="pqi-row">
              <span class="pqi-label">职位：</span>
              自由摄影师
            </div>

            <div class="pqi-row">
              <span class="pqi-label">关系：</span>
              大学室友/兄弟
            </div>
          `
        ) +

        card(
          '周容芳',
          `
            <div class="pqi-tags">
              <span class="pqi-tag">女/54</span>
              <span class="pqi-tag">南京人</span>
            </div>

            <div class="pqi-row">
              <span class="pqi-label">关系：</span>
              母亲
            </div>
          `
        ) +

        card(
          '彭正廷',
          `
            <div class="pqi-tags">
              <span class="pqi-tag">男/60</span>
              <span class="pqi-tag">南京人</span>
            </div>

            <div class="pqi-row">
              <span class="pqi-label">关系：</span>
              父子
            </div>
          `
        ) +

        card(
          '其他家人',
          `
            <div class="pqi-row">
              彭振华｜爷爷
            </div>

            <div class="pqi-row">
              陈秀英｜奶奶
            </div>

            <div class="pqi-row">
              周正清｜外公
            </div>

            <div class="pqi-row">
              王婉珍｜外婆
            </div>
          `
        ) +

        card(
          '布袋',
          `
            <div class="pqi-tags">
              <span class="pqi-tag">公</span>
              <span class="pqi-tag">金毛犬</span>
            </div>

            <div class="pqi-row">
              <span class="pqi-label">抚养：</span>
              四人（彭齐为主）
            </div>

            <div class="pqi-row">
              <span class="pqi-label">日常：</span>
              白天随机 / 晚上彭齐
            </div>
          `
        );

      return;
    }


    /* ---------- 音乐 ---------- */

    if (type === 'music') {

      content.innerHTML =

        card(
          '🎵 使用教程',
          `
            <div class="pqi-row">
              播放：点击歌曲即可播放。
            </div>

            <div class="pqi-row">
              切换：直接点击列表中的歌曲。
            </div>

            <div class="pqi-row">
              手机上如果浏览器阻止自动播放，请先点击一次歌曲。
            </div>
          `
        ) +

        card(
          '音乐播放器',
          `
            <div class="pqi-music-controls">

              <button
                class="pqi-music-btn"
                type="button"
                data-music="-1"
              >‹</button>

              <button
                class="pqi-music-btn"
                type="button"
                data-music="play"
              >▶</button>

              <button
                class="pqi-music-btn"
                type="button"
                data-music="1"
              >›</button>

            </div>


            <div class="pqi-progress">

              <div class="pqi-progress-fill"></div>

            </div>


            <div class="pqi-time">

              <span class="pqi-cur">
                0:00
              </span>

              <span class="pqi-dur">
                0:00
              </span>

            </div>


            <div class="pqi-music-list">

              ${
                music
                  .map(
                    (m, i) => `
                      <div
                        class="pqi-music-item"
                        data-track="${i}"
                      >
                        ${escapeHTML(m[0])}
                      </div>
                    `
                  )
                  .join('')
              }

            </div>
          `
        );

      updateMusic();

      return;
    }


    /* ---------- 地点 ---------- */

    if (type === 'loc') {

      content.innerHTML =

        card(
          '🏠 云樾公馆 · 家',
          `
            <div class="pqi-tags">
              <span class="pqi-tag">玄武区</span>
              <span class="pqi-tag">8栋</span>
            </div>

            <div class="pqi-row">
              <span class="pqi-label">1F：</span>
              下沉玄关 / 客厅 / 壁炉 / 酒柜 / 餐厨 / 落地窗
            </div>

            <div class="pqi-row">
              <span class="pqi-label">2F：</span>
              主卧套房 / 次卧
            </div>

            <div class="pqi-row">
              <span class="pqi-label">3F：</span>
              衣帽间 / 书房 / 影音室 / 露台
            </div>

            <div class="pqi-row">
              <span class="pqi-label">院：</span>
              木露台 / 草坪 / 种植区 / 狗窝
            </div>
          `
        ) +

        card(
          '🏢 工作地点',
          `
            <div class="pqi-tags">
              <span class="pqi-tag">鼓楼区</span>
              <span class="pqi-tag">江苏省人民检察院</span>
            </div>

            <div class="pqi-row">
              工作时间：周一到周五，周末双休，偶尔加班。
            </div>

            <div class="pqi-tags">
              <span class="pqi-tag">鼓楼区</span>
              <span class="pqi-tag">南京大学法学院</span>
            </div>

            <div class="pqi-row">
              工作时间：周二下午一般会有课。
            </div>
          `
        );

      return;
    }


    /* ---------- 南京 ---------- */

    content.innerHTML =

      card(
        '秦淮区',
        `
          <div class="pqi-row">
            夫子庙 · 秦淮河 · 老门东 · 中华门 · 白鹭洲公园 · 明城墙 · 大报恩寺 · 瞻园
          </div>
        `
      ) +

      card(
        '玄武区',
        `
          <div class="pqi-row">
            玄武湖 · 音乐台 · 梧桐大道 · 红山动物园 · 中山陵 · 鸡鸣寺 · 明孝陵 · 总统府 · 明故宫 · 美龄宫 · 灵谷寺 · 1912街区
          </div>
        `
      ) +

      card(
        '鼓楼区',
        `
          <div class="pqi-row">
            先锋书店 · 南京大学 · 长江大桥 · 颐和路 · 清凉山
          </div>
        `
      ) +

      card(
        '江宁 / 栖霞',
        `
          <div class="pqi-row">
            南京欢乐谷 · 栖霞山/寺 · 观音门 · 五马渡 · 燕子矶公园 · 达摩古洞 · 牛首山 · 方山
          </div>
        `
      ) +

      card(
        '雨花台 / 建邺',
        `
          <div class="pqi-row">
            梅港 · 菊花台公园 · 宝塔山森林公园
          </div>
        `
      );

  }


  /* =========================================================
     找酒馆输入框
     ========================================================= */

  function findTextarea() {

    const selectors = [

      '#mufy_chat_input_box textarea',

      '#send_textarea',

      'textarea[data-send-message]',

      'textarea[placeholder*="输入"]',

      'textarea'

    ];


    for (const selector of selectors) {

      try {

        const ta = document.querySelector(selector);

        if (ta) return ta;

      } catch (e) {}

    }


    return null;
  }


  /* =========================================================
     设置输入框
     ========================================================= */

  function setTextareaValue(ta, value) {

    const setter =
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value'
      )?.set;


    if (setter) {

      setter.call(
        ta,
        value
      );

    } else {

      ta.value = value;

    }


    ta.dispatchEvent(
      new Event(
        'input',
        {
          bubbles:true
        }
      )
    );


    ta.dispatchEvent(
      new Event(
        'change',
        {
          bubbles:true
        }
      )
    );


    try {

      ta.dispatchEvent(
        new InputEvent(
          'input',
          {
            bubbles:true,
            inputType:'insertText',
            data:value
          }
        )
      );

    } catch (e) {}


    try {

      ta.focus();

    } catch (e) {}

  }


  /* =========================================================
     自动发送
     ========================================================= */

  function sendMessage() {

    const sendSelectors = [

      '#send_but',

      '#send_button',

      '#send',

      'button[aria-label*="发送"]',

      'button[title*="发送"]',

      'button[data-testid*="send"]'

    ];


    for (const selector of sendSelectors) {

      try {

        const btn =
          document.querySelector(selector);

        if (
          btn &&
          !btn.disabled &&
          btn.offsetParent !== null
        ) {

          btn.click();

          return true;

        }

      } catch (e) {}

    }


    /* 尝试 ST 的原生发送函数 */

    try {

      if (
        typeof window.generate === 'function'
      ) {

        window.generate();

        return true;

      }

    } catch (e) {}


    return false;

  }


  /* =========================================================
     指令：写入 + 自动发送
     ========================================================= */

  function injectAndSend(encodedCommand, button) {

    const text =
      decodeURIComponent(encodedCommand);


    const textarea =
      findTextarea();


    if (!textarea) {

      alert(
        '没有找到酒馆输入框，请先打开彭齐聊天输入框。'
      );

      return;

    }


    /*
     * 如果输入框本来就有文字：
     * 不覆盖，追加到下一行。
     */

    const oldValue =
      textarea.value || '';


    const newValue =
      oldValue.trim()
        ? oldValue + '\n' + text
        : text;


    setTextareaValue(
      textarea,
      newValue
    );


    /*
     * 给 ST 一点时间同步输入框状态，
     * 再点击发送。
     */

    setTimeout(() => {

      const sent =
        sendMessage();


      if (button) {

        button.classList.add(
          'pqi-sent'
        );


        const original =
          button.dataset.originalText ||
          button.textContent;


        button.dataset.originalText =
          original;


        button.textContent =
          sent
            ? '✓ 已发送'
            : '✓ 已写入';


        setTimeout(() => {

          button.classList.remove(
            'pqi-sent'
          );

          button.textContent =
            original;

        }, 1200);

      }

    }, 120);

  }


  /* =========================================================
     音乐
     ========================================================= */

  function fmt(seconds) {

    if (!isFinite(seconds)) {

      return '0:00';

    }


    return (
      Math.floor(seconds / 60) +
      ':' +
      String(
        Math.floor(seconds % 60)
      ).padStart(2, '0')
    );

  }


  function updateMusic() {

    const fill =
      root.querySelector(
        '.pqi-progress-fill'
      );


    const cur =
      root.querySelector(
        '.pqi-cur'
      );


    const dur =
      root.querySelector(
        '.pqi-dur'
      );


    if (!fill) return;


    const d =
      audio?.duration || 0;


    const t =
      audio?.currentTime || 0;


    fill.style.width =
      d
        ? (t / d * 100) + '%'
        : '0%';


    if (cur) {

      cur.textContent =
        fmt(t);

    }


    if (dur) {

      dur.textContent =
        fmt(d);

    }


    root
      .querySelectorAll(
        '.pqi-music-item'
      )
      .forEach(
        (el, i) => {

          el.classList.toggle(
            'active',
            i === track
          );

        }
      );


    const playButton =
      root.querySelector(
        '[data-music="play"]'
      );


    if (playButton) {

      playButton.textContent =
        audio && !audio.paused
          ? 'Ⅱ'
          : '▶';

    }

  }


  function play(index) {

    track =
      (
        index +
        music.length
      ) %
      music.length;


    if (audio) {

      try {

        audio.pause();

      } catch (e) {}

    }


    audio =
      new Audio(
        music[track][1]
      );


    audio.preload =
      'metadata';


    audio.addEventListener(
      'loadedmetadata',
      updateMusic
    );


    audio.addEventListener(
      'timeupdate',
      updateMusic
    );


    audio.addEventListener(
      'play',
      updateMusic
    );


    audio.addEventListener(
      'pause',
      updateMusic
    );


    audio.addEventListener(
      'ended',
      () => {

        play(track + 1);

      }
    );


    audio.addEventListener(
      'error',
      () => {

        console.warn(
          '彭齐侧边栏音乐加载失败：',
          music[track][0]
        );

      }
    );


    audio
      .play()
      .catch(
        error => {

          console.warn(
            '浏览器阻止音乐自动播放：',
            error
          );

        }
      );


    updateMusic();

  }


  /* =========================================================
     标签切换
     ========================================================= */

  function switchTab(type) {

    tabs.forEach(
      tab => {

        tab.classList.toggle(
          'active',
          tab.dataset.tab === type
        );

      }
    );


    render(type);

  }


  tabs.forEach(
    tab => {

      tab.addEventListener(
        'click',
        () => {

          switchTab(
            tab.dataset.tab
          );

        }
      );

    }
  );


  /* =========================================================
     打开 / 关闭
     ========================================================= */

  trigger.addEventListener(
    'click',
    () => {

      /*
       * 如果刚刚发生拖动，
       * 不允许 click 打开。
       */

      if (trigger.dataset.justDragged === '1') {

        trigger.dataset.justDragged = '0';

        return;

      }


      root.classList.toggle(
        'open'
      );

    }
  );


  close.addEventListener(
    'click',
    () => {

      root.classList.remove(
        'open'
      );

    }
  );


  /* =========================================================
     面板内部点击
     ========================================================= */

  root.addEventListener(
    'click',
    event => {

      /* 指令 */

      const command =
        event.target.closest(
          '[data-command]'
        );


      if (command) {

        event.stopPropagation();

        injectAndSend(
          command.dataset.command,
          command
        );

        return;

      }


      /* 音乐列表 */

      const musicItem =
        event.target.closest(
          '[data-track]'
        );


      if (musicItem) {

        event.stopPropagation();

        play(
          Number(
            musicItem.dataset.track
          )
        );

        return;

      }


      /* 播放器按钮 */

      const musicButton =
        event.target.closest(
          '[data-music]'
        );


      if (
        musicButton &&
        audio
      ) {

        event.stopPropagation();


        const action =
          musicButton.dataset.music;


        if (action === 'play') {

          if (audio.paused) {

            audio
              .play()
              .catch(() => {});

          } else {

            audio.pause();

          }

          updateMusic();

        } else {

          play(
            track +
            Number(action)
          );

        }

      }

    }
  );


  /* =========================================================
     音乐进度条
     ========================================================= */

  const progress =
    root.querySelector(
      '.pqi-progress'
    );


  if (progress) {

    progress.addEventListener(
      'click',
      event => {

        if (
          !audio ||
          !audio.duration
        ) {

          return;

        }


        const rect =
          progress.getBoundingClientRect();


        const percent =
          (
            event.clientX -
            rect.left
          ) /
          rect.width;


        audio.currentTime =
          Math.max(
            0,
            Math.min(
              1,
              percent
            )
          ) *
          audio.duration;


        updateMusic();

      }
    );

  }


  /* =========================================================
     🧸 拖动功能
     ========================================================= */

  let dragging = false;

  let dragStartX = 0;

  let dragStartY = 0;

  let startLeft = 0;

  let startTop = 0;

  let moved = false;

  let hintTimer = null;


  const POSITION_KEY =
    'pengqi_sidebar_trigger_position_v3';


  function loadPosition() {

    try {

      const saved =
        localStorage.getItem(
          POSITION_KEY
        );


      if (!saved) return;


      const pos =
        JSON.parse(saved);


      if (
        !isFinite(pos.left) ||
        !isFinite(pos.top)
      ) {

        return;

      }


      const maxLeft =
        window.innerWidth -
        52;


      const maxTop =
        window.innerHeight -
        52;


      const left =
        Math.max(
          4,
          Math.min(
            maxLeft - 4,
            pos.left
          )
        );


      const top =
        Math.max(
          4,
          Math.min(
            maxTop - 4,
            pos.top
          )
        );


      root.style.right =
        'auto';


      root.style.left =
        left + 'px';


      root.style.top =
        top + 'px';


      root.style.transform =
        'none';

    } catch (e) {}

  }


  function savePosition() {

    try {

      const rect =
        trigger.getBoundingClientRect();


      localStorage.setItem(
        POSITION_KEY,
        JSON.stringify({
          left:rect.left,
          top:rect.top
        })
      );

    } catch (e) {}

  }


  function showDragHint() {

    if (!dragHint) return;


    dragHint.classList.add(
      'show'
    );


    clearTimeout(
      hintTimer
    );


    hintTimer =
      setTimeout(
        () => {

          dragHint.classList.remove(
            'show'
          );

        },
        1300
      );

  }


  function pointerDown(event) {

    /*
     * 只允许主键 / 单指
     */

    if (
      event.pointerType === 'mouse' &&
      event.button !== 0
    ) {

      return;

    }


    dragging = true;

    moved = false;


    dragStartX =
      event.clientX;


    dragStartY =
      event.clientY;


    const rect =
      trigger.getBoundingClientRect();


    startLeft =
      rect.left;


    startTop =
      rect.top;


    trigger.classList.add(
      'pqi-dragging'
    );


    trigger.setPointerCapture?.(
      event.pointerId
    );


    event.preventDefault();

  }


  function pointerMove(event) {

    if (!dragging) return;


    const dx =
      event.clientX -
      dragStartX;


    const dy =
      event.clientY -
      dragStartY;


    if (
      Math.abs(dx) > 5 ||
      Math.abs(dy) > 5
    ) {

      moved = true;

    }


    if (!moved) return;


    let left =
      startLeft + dx;


    let top =
      startTop + dy;


    const maxLeft =
      window.innerWidth -
      trigger.offsetWidth;


    const maxTop =
      window.innerHeight -
      trigger.offsetHeight;


    left =
      Math.max(
        4,
        Math.min(
          maxLeft - 4,
          left
        )
      );


    top =
      Math.max(
        4,
        Math.min(
          maxTop - 4,
          top
        )
      );


    root.style.right =
      'auto';


    root.style.left =
      left + 'px';


    root.style.top =
      top + 'px';


    root.style.transform =
      'none';


    root.classList.remove(
      'open'
    );


    event.preventDefault();

  }


  function pointerUp(event) {

    if (!dragging) return;


    dragging = false;


    trigger.classList.remove(
      'pqi-dragging'
    );


    try {

      trigger.releasePointerCapture?.(
        event.pointerId
      );

    } catch (e) {}


    if (moved) {

      savePosition();


      trigger.dataset.justDragged =
        '1';


      showDragHint();


      setTimeout(
        () => {

          trigger.dataset.justDragged =
            '0';

        },
        250
      );

    }

  }


  trigger.addEventListener(
    'pointerdown',
    pointerDown,
    {
      passive:false
    }
  );


  trigger.addEventListener(
    'pointermove',
    pointerMove,
    {
      passive:false
    }
  );


  trigger.addEventListener(
    'pointerup',
    pointerUp,
    {
      passive:false
    }
  );


  trigger.addEventListener(
    'pointercancel',
    pointerUp,
    {
      passive:false
    }
  );


  /* 防止 Android 长按弹出菜单 */

  trigger.addEventListener(
    'contextmenu',
    event => {

      event.preventDefault();

    }
  );


  /* =========================================================
     屏幕旋转 / 尺寸改变
     ========================================================= */

  window.addEventListener(
    'resize',
    () => {

      try {

        const rect =
          trigger.getBoundingClientRect();


        if (
          rect.right >
          window.innerWidth
        ) {

          root.style.left =
            Math.max(
              4,
              window.innerWidth -
              56
            ) + 'px';

        }


        if (
          rect.bottom >
          window.innerHeight
        ) {

          root.style.top =
            Math.max(
              4,
              window.innerHeight -
              56
            ) + 'px';

        }


        savePosition();

      } catch (e) {}

    }
  );


  /* 读取之前保存的位置 */

  loadPosition();


  /* =========================================================
     初始化
     ========================================================= */

  switchTab('cmd');


  /* =========================================================
     清理函数
     ========================================================= */

  window.__pengqiSidebarCleanup =
    function () {

      try {

        clearInterval(
          visibilityTimer
        );

      } catch (e) {}


      listeners.forEach(
        item => {

          try {

            item[0].removeEventListener(
              item[1],
              item[2]
            );

          } catch (e) {}

        }
      );


      try {

        if (audio) {

          audio.pause();

          audio.src = '';

          audio = null;

        }

      } catch (e) {}


      try {

        root.remove();

      } catch (e) {}


      try {

        style.remove();

      } catch (e) {}

    };


})();

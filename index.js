(() => {
  'use strict';

  /* =========================================================
     彭齐 · 酒馆伴生侧边栏
     完整整合版
     
     功能：
     1. 只在「彭齐」角色卡显示
     2. 🧸 可拖动
     3. 自动保存 🧸 位置
     4. 点击 🧸 打开/关闭
     5. 指令按钮：写入并自动发送
     6. 角色资料
     7. 音乐播放器
     8. 音乐进度条
     9. 上一首 / 播放暂停 / 下一首
     10. 地点
     11. 南京
     12. 手机端适配
     ========================================================= */

  const TARGET = '彭齐';

  const HOST_ID = 'pengqi-sidebar-v2';
  const STYLE_ID = 'pengqi-sidebar-v2-style';

  const POS_X_KEY = 'pengqi_sidebar_x';
  const POS_Y_KEY = 'pengqi_sidebar_y';

  /* =========================================================
     获取酒馆上下文
     ========================================================= */

  function getContext() {
    try {
      return window.SillyTavern?.getContext?.() || null;
    } catch {
      return null;
    }
  }

  /* =========================================================
     判断当前是不是彭齐
     ========================================================= */

  function currentCharacterName() {

    const ctx = getContext();

    if (ctx) {

      // 重要：
      // name2 才是角色名
      // 不使用 name1，因为 name1 通常是用户名字

      if (
        typeof ctx.name2 === 'string' &&
        ctx.name2.trim()
      ) {
        return ctx.name2.trim();
      }

      if (
        ctx.characterId != null &&
        Array.isArray(ctx.characters)
      ) {
        const c = ctx.characters[ctx.characterId];

        if (c?.name) {
          return String(c.name).trim();
        }
      }
    }

    /* 酒馆不同版本的备用选择器 */

    const selectors = [
      '#character_name',
      '#selected_character_name',
      '.character_name',
      '.character_name_block .ch_name'
    ];

    for (const selector of selectors) {

      const el = document.querySelector(selector);

      if (
        el &&
        el.textContent &&
        el.textContent.trim()
      ) {
        return el.textContent.trim();
      }
    }

    return '';
  }

  function isPengQi() {

    const name = currentCharacterName()
      .replace(/\s+/g, '');

    return name === TARGET;
  }

  /* =========================================================
     全部指令
     ========================================================= */

  const commands = [

    /* ---------- 互动 ---------- */

    [
      '📱',
      '小手机组件',
      '$给彭齐发信息：'
    ],

    [
      '🌏',
      '发微信朋友圈',
      '$发朋友圈：\n$朋友圈配图：'
    ],

    [
      '❄️',
      '截断小指令',
      '$每一轮输出，必须完整输出信息栏（时间、地点、天气、在场）、正文内容、状态栏（他的状态一直到长期记忆）、侧边栏。必须输出到侧边栏才算结束，不得中途停止。'
    ],

    [
      '🐰',
      '增加崽崽状态栏',
      '$状态栏新增指令：请在状态栏代码中新增一个char和user孩子的折叠栏，叫做崽崽日记。位置放在“他的状态”之后、“他的手机”之前。每一轮更新姓名、年龄、动作、心情、着装、内心。心情使用颜文字+原因，内心活动不少于25字。若存在多个孩子，每个孩子分别显示，并使用inner-divider分隔。必须根据当前剧情、已有状态和已知信息更新，不得凭空改变孩子的人物设定。'
    ],

    [
      '🐶',
      '增加布袋状态栏',
      '$状态栏新增指令：请新增“布袋心声”折叠栏，位置放在“生活与工作”之后、“短期记忆”之前。每轮更新布袋的心情、动作、内心。心情使用颜文字+原因，内心活动不少于25字。布袋为彭齐家的金毛犬，所有内容必须符合狗狗能够感知、理解和获得的信息范围，不得出现狗狗不可能知道的信息。'
    ],

    /* ---------- 记忆 ---------- */

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

    /* ---------- 常用 ---------- */

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
      'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy8wNGVlMzRiOWU0OGFkNmQ5L0lRQ0xYaTJDYV83UFFZMXNKaUh1cS1oNUFlbGd4dDlScy1DQWpySHBKbXc0XzUwP2U9cEtoOXlu.mp3'
    ]

  ];

  let audio = null;
  let track = 0;

  /* =========================================================
     角色资料
     ========================================================= */

  const roles = [

    [
      '宋挽',
      '男 / 27',
      '6.22 · 中挪混血',
      '声声慢工作室 · CV / 电竞主播',
      '云樾公馆·6栋',
      '高中 / 大学室友 / 兄弟'
    ],

    [
      '靳时',
      '男 / 27',
      '09.13',
      '视界科创有限公司 CEO',
      '云樾公馆·7栋',
      '大学室友 / 兄弟'
    ],

    [
      '谢聿',
      '男 / 27',
      '02.22 · 中法混血',
      '自由摄影师',
      '云樾公馆·5栋',
      '大学室友 / 兄弟'
    ],

    [
      '周容芳',
      '女 / 54',
      '南京人',
      '母亲',
      '',
      ''
    ],

    [
      '彭正廷',
      '男 / 60',
      '南京人',
      '父亲',
      '',
      ''
    ],

    [
      '彭振华 / 陈秀英',
      '爷爷 / 奶奶',
      '',
      '彭齐家人',
      '南京',
      ''
    ],

    [
      '周正清 / 王婉珍',
      '外公 / 外婆',
      '',
      '彭齐家人',
      '南京',
      ''
    ],

    [
      '布袋',
      '公 / 金毛犬',
      '',
      '彭齐主要照顾',
      '家中',
      '白天随机 / 晚上彭齐'
    ]

  ];

  /* =========================================================
     地点
     ========================================================= */

  const locations = [

    [
      '🏠 云樾公馆 · 家',
      '玄武区 / 8栋',
      '1F：下沉玄关 / 客厅 / 壁炉 / 酒柜 / 餐厨 / 落地窗\n2F：主卧套房 / 次卧\n3F：衣帽间 / 书房 / 影音室 / 露台\n院：木露台 / 草坪 / 种植区 / 狗窝'
    ],

    [
      '🏢 工作地点',
      '鼓楼区',
      '江苏省人民检察院\n周一至周五，周末双休，偶尔加班'
    ],

    [
      '🎓 南京大学法学院',
      '南京',
      '周二下午一般有课'
    ]

  ];

  /* =========================================================
     南京地点
     ========================================================= */

  const nj = {

    '秦淮区': [
      '夫子庙',
      '秦淮河',
      '老门东',
      '中华门',
      '白鹭洲公园',
      '明城墙',
      '大报恩寺',
      '瞻园'
    ],

    '玄武区': [
      '玄武湖',
      '音乐台',
      '梧桐大道',
      '红山动物园',
      '中山陵',
      '鸡鸣寺',
      '明孝陵',
      '总统府',
      '明故宫',
      '美龄宫',
      '灵谷寺',
      '1912街区'
    ],

    '鼓楼区': [
      '先锋书店',
      '南京大学',
      '长江大桥',
      '颐和路',
      '清凉山'
    ],

    '江宁 / 栖霞': [
      '南京欢乐谷',
      '栖霞山 / 寺',
      '观音门',
      '五马渡',
      '燕子矶公园',
      '达摩古洞',
      '牛首山',
      '方山'
    ],

    '雨花台 / 建邺': [
      '梅港',
      '菊花台公园',
      '宝塔山森林公园'
    ]

  };

  /* =========================================================
     样式
     ========================================================= */

  function addStyle() {

    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');

    style.id = STYLE_ID;

    style.textContent = `

      #${HOST_ID},
      #${HOST_ID} * {
        box-sizing:border-box;
      }

      #${HOST_ID} {

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

        width:52px;

        z-index:2147483000;

        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          "Microsoft YaHei",
          sans-serif;

        color:var(--pqi-text);

        pointer-events:none;
      }

      /* =====================================================
         🧸
         ===================================================== */

      #${HOST_ID} .pqi-trigger-wrap {

        display:flex;
        justify-content:flex-end;

        pointer-events:auto;
      }

      #${HOST_ID} .pqi-trigger {

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

        padding:0;
      }

      #${HOST_ID} .pqi-trigger:hover {
        transform:scale(1.06);
      }

      #${HOST_ID}.dragging .pqi-trigger {
        transform:scale(1.08);
        cursor:grabbing;
      }

      /* =====================================================
         面板
         ===================================================== */

      #${HOST_ID}.open {
        width:min(340px,calc(100vw - 24px));
      }

      #${HOST_ID} .pqi-panel {

        position:absolute;

        right:0;
        bottom:64px;

        width:100%;

        max-height:min(78vh,720px);

        overflow:hidden;

        opacity:0;

        transform:
          translateX(18px)
          scale(.97);

        pointer-events:none;

        border:
          1px solid
          var(--pqi-line);

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

      #${HOST_ID}.open .pqi-panel {

        opacity:1;

        transform:none;

        pointer-events:auto;
      }

      /* =====================================================
         头部
         ===================================================== */

      #${HOST_ID} .pqi-head {

        padding:13px 15px 10px;

        border-bottom:
          1px solid
          var(--pqi-line);
      }

      #${HOST_ID} .pqi-title {

        display:flex;

        align-items:center;

        justify-content:space-between;

        font-weight:700;

        font-size:14px;
      }

      #${HOST_ID} .pqi-subtitle {

        margin-top:4px;

        color:var(--pqi-sub);

        font-size:11px;
      }

      #${HOST_ID} .pqi-close {

        border:0;

        background:transparent;

        color:#cbd4ce;

        cursor:pointer;

        font-size:18px;

        padding:2px 4px;
      }

      /* =====================================================
         标签
         ===================================================== */

      #${HOST_ID} .pqi-tabs {

        display:flex;

        gap:5px;

        padding:9px 10px;

        overflow-x:auto;

        border-bottom:
          1px solid
          var(--pqi-line);
      }

      #${HOST_ID} .pqi-tabs::-webkit-scrollbar {
        height:0;
      }

      #${HOST_ID} .pqi-tab {

        flex:0 0 auto;

        border:0;

        border-radius:10px;

        background:
          rgba(255,255,255,.055);

        color:var(--pqi-sub);

        padding:7px 10px;

        font-size:12px;

        cursor:pointer;
      }

      #${HOST_ID} .pqi-tab.active {

        color:#fff;

        background:
          rgba(116,102,197,.82);
      }

      /* =====================================================
         内容
         ===================================================== */

      #${HOST_ID} .pqi-body {

        max-height:
          calc(
            min(78vh,720px) - 110px
          );

        overflow-y:auto;

        padding:10px;
      }

      #${HOST_ID} .pqi-body::-webkit-scrollbar {
        width:5px;
      }

      #${HOST_ID} .pqi-body::-webkit-scrollbar-thumb {

        background:
          rgba(205,226,214,.22);

        border-radius:10px;
      }

      /* =====================================================
         卡片
         ===================================================== */

      #${HOST_ID} .pqi-card {

        padding:12px;

        margin-bottom:9px;

        border:
          1px solid
          var(--pqi-line);

        border-radius:14px;

        background:
          var(--pqi-card);
      }

      #${HOST_ID} .pqi-card:last-child {
        margin-bottom:0;
      }

      #${HOST_ID} .pqi-card-title {

        font-weight:700;

        font-size:13px;

        margin-bottom:9px;
      }

      #${HOST_ID} .pqi-row {

        font-size:12px;

        line-height:1.7;

        color:var(--pqi-sub);

        white-space:pre-line;
      }

      #${HOST_ID} .pqi-label {

        color:#e4ebe6;

        font-weight:600;

        margin-right:4px;
      }

      #${HOST_ID} .pqi-tags {

        display:flex;

        flex-wrap:wrap;

        gap:5px;

        margin-bottom:7px;
      }

      #${HOST_ID} .pqi-tag {

        padding:3px 7px;

        border-radius:999px;

        background:
          rgba(156,175,159,.13);

        border:
          1px solid
          rgba(156,175,159,.16);

        color:#dbe5de;

        font-size:10px;
      }

      /* =====================================================
         指令按钮
         ===================================================== */

      #${HOST_ID} .pqi-command {

        width:100%;

        text-align:left;

        padding:10px 11px;

        margin:5px 0;

        border:
          1px solid
          var(--pqi-line);

        border-radius:11px;

        background:
          rgba(255,255,255,.045);

        color:var(--pqi-text);

        cursor:pointer;

        font-size:12px;

        transition:.2s ease;
      }

      #${HOST_ID} .pqi-command:hover {

        background:
          rgba(116,102,197,.2);

        border-color:
          rgba(116,102,197,.45);
      }

      #${HOST_ID} .pqi-command:active {

        transform:scale(.98);
      }

      /* =====================================================
         音乐
         ===================================================== */

      #${HOST_ID} .pqi-music-list {

        max-height:200px;

        overflow-y:auto;
      }

      #${HOST_ID} .pqi-music-item {

        padding:9px;

        border-radius:9px;

        margin-top:5px;

        background:
          rgba(255,255,255,.045);

        border:
          1px solid
          rgba(215,230,222,.1);

        cursor:pointer;

        font-size:12px;

        color:#b3c6bc;

        transition:.2s ease;
      }

      #${HOST_ID} .pqi-music-item:hover {

        background:
          rgba(121,148,133,.1);

        border-color:
          rgba(121,148,133,.2);

        transform:translateX(2px);
      }

      #${HOST_ID} .pqi-music-item.active {

        background:
          rgba(121,148,133,.2);

        border-color:#799485;

        color:#e2efe7;

        box-shadow:
          0 2px 8px
          rgba(121,148,133,.3);

        padding-left:25px;
      }

      #${HOST_ID} .pqi-music-item.active::before {

        content:'♪';

        position:absolute;

        margin-left:-15px;

        color:#799485;

        font-weight:bold;
      }

      /* =====================================================
         音乐控制
         ===================================================== */

      #${HOST_ID} .pqi-music-controls {

        display:flex;

        justify-content:center;

        gap:8px;

        margin:10px 0;
      }

      #${HOST_ID} .pqi-music-btn {

        width:34px;
        height:34px;

        border:0;

        border-radius:50%;

        background:
          rgba(255,255,255,.08);

        color:#fff;

        cursor:pointer;
      }

      #${HOST_ID} .pqi-music-btn:active {

        transform:scale(.92);
      }

      #${HOST_ID} .pqi-now {

        margin-bottom:8px;

        text-align:center;

        font-size:11px;

        color:var(--pqi-sub);

        white-space:nowrap;

        overflow:hidden;

        text-overflow:ellipsis;
      }

      /* =====================================================
         音乐进度条
         ===================================================== */

      #${HOST_ID} .pqi-progress-wrap {

        position:relative;

        width:100%;

        height:14px;

        display:flex;

        align-items:center;

        cursor:pointer;

        touch-action:none;
      }

      #${HOST_ID} .pqi-progress {

        position:relative;

        width:100%;

        height:4px;

        border-radius:2px;

        background:
          rgba(215,230,222,.12);

        overflow:visible;
      }

      #${HOST_ID} .pqi-progress-fill {

        position:absolute;

        left:0;
        top:0;

        width:0%;

        height:100%;

        border-radius:2px;

        background:
          #799485;

        transition:
          width .1s linear;
      }

      #${HOST_ID} .pqi-progress-thumb {

        position:absolute;

        top:50%;

        left:0%;

        transform:
          translate(-50%,-50%);

        width:10px;
        height:10px;

        background:#799485;

        border-radius:50%;

        cursor:pointer;

        box-shadow:
          0 0 6px
          rgba(121,148,133,.6);
      }

      #${HOST_ID} .pqi-time {

        display:flex;

        justify-content:space-between;

        margin-top:5px;

        color:
          rgba(215,230,222,.35);

        font-size:10px;
      }

      /* =====================================================
         底部
         ===================================================== */

      #${HOST_ID} .pqi-footer {

        padding:8px;

        text-align:center;

        color:#78837d;

        font-size:9px;
      }

      /* =====================================================
         手机
         ===================================================== */

      @media(max-width:600px) {

        #${HOST_ID} {

          right:8px;
        }

        #${HOST_ID}.open {

          width:
            calc(100vw - 16px);
        }

        #${HOST_ID} .pqi-panel {

          bottom:62px;
        }

        #${HOST_ID} .pqi-trigger {

          width:50px;
          height:50px;

          font-size:24px;
        }

      }

    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     HTML 安全处理
     ========================================================= */

  function escapeHTML(text) {

    return String(text)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  /* =========================================================
     卡片
     ========================================================= */

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

  /* =========================================================
     找酒馆输入框
     ========================================================= */

  function findTextarea() {

    const selectors = [

      '#mufy_chat_input_box textarea',

      '#send_textarea',

      'textarea[data-send-message]',

      'textarea'

    ];

    for (const selector of selectors) {

      const textarea =
        document.querySelector(selector);

      if (textarea) return textarea;
    }

    return null;
  }

  /* =========================================================
     设置输入框
     ========================================================= */

  function setTextareaValue(textarea,value) {

    const setter =
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value'
      )?.set;

    if (setter) {

      setter.call(
        textarea,
        value
      );

    } else {

      textarea.value = value;

    }

    textarea.dispatchEvent(
      new Event(
        'input',
        {bubbles:true}
      )
    );

    textarea.dispatchEvent(
      new Event(
        'change',
        {bubbles:true}
      )
    );
  }

  /* =========================================================
     找发送按钮
     ========================================================= */

  function findSendButton() {

    const selectors = [

      '#send_but',

      '#send_button',

      'button[aria-label*="发送"]',

      'button[title*="发送"]',

      '[data-testid="send-button"]',

      '#send_textarea + button'

    ];

    for (const selector of selectors) {

      const button =
        document.querySelector(selector);

      if (
        button &&
        !button.disabled
      ) {
        return button;
      }
    }

    return null;
  }

  /* =========================================================
     自动发送
     ========================================================= */

  function sendMessage() {

    const button =
      findSendButton();

    if (button) {

      button.click();

      return true;
    }

    /* 尝试酒馆上下文 */

    try {

      const ctx = getContext();

      if (
        ctx &&
        typeof ctx.generate === 'function'
      ) {

        ctx.generate();

        return true;
      }

    } catch {}

    return false;
  }

  /* =========================================================
     指令：写入 + 自动发送
     ========================================================= */

  function injectAndSend(text) {

    const textarea =
      findTextarea();

    if (!textarea) {

      showToast(
        '没有找到酒馆输入框'
      );

      return;
    }

    const old =
      textarea.value || '';

    const value =
      old
        ? old + '\n' + text
        : text;

    setTextareaValue(
      textarea,
      value
    );

    textarea.focus();

    showToast(
      '指令已发送'
    );

    setTimeout(
      () => {

        const ok =
          sendMessage();

        if (!ok) {

          showToast(
            '已写入输入框，请手动发送'
          );
        }

      },
      120
    );
  }

  /* =========================================================
     Toast
     ========================================================= */

  function showToast(text) {

    const host =
      document.getElementById(
        HOST_ID
      );

    if (!host) return;

    let toast =
      host.querySelector(
        '.pqi-toast'
      );

    if (!toast) {

      toast =
        document.createElement(
          'div'
        );

      toast.className =
        'pqi-toast';

      Object.assign(
        toast.style,
        {
          position:'fixed',
          right:'70px',
          top:'50%',
          transform:'translateY(-50%)',
          padding:'8px 12px',
          border:'1px solid rgba(205,226,214,.15)',
          borderRadius:'10px',
          background:'rgba(24,29,29,.94)',
          color:'#edf2ee',
          fontSize:'11px',
          zIndex:'2147483001',
          pointerEvents:'none',
          opacity:'0',
          transition:'.2s ease',
          whiteSpace:'nowrap'
        }
      );

      host.appendChild(toast);
    }

    toast.textContent =
      text;

    toast.style.opacity =
      '1';

    clearTimeout(
      toast._timer
    );

    toast._timer =
      setTimeout(
        () => {
          toast.style.opacity =
            '0';
        },
        1500
      );
  }

  /* =========================================================
     时间格式
     ========================================================= */

  function formatTime(seconds) {

    if (
      !isFinite(seconds) ||
      seconds < 0
    ) {
      return '0:00';
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    const secs =
      Math.floor(
        seconds % 60
      );

    return (
      minutes +
      ':' +
      String(secs)
        .padStart(2,'0')
    );
  }

  /* =========================================================
     更新音乐进度
     ========================================================= */

  function updateMusicUI() {

    const host =
      document.getElementById(
        HOST_ID
      );

    if (!host) return;

    const fill =
      host.querySelector(
        '.pqi-progress-fill'
      );

    const thumb =
      host.querySelector(
        '.pqi-progress-thumb'
      );

    const cur =
      host.querySelector(
        '.pqi-cur'
      );

    const dur =
      host.querySelector(
        '.pqi-dur'
      );

    if (!fill) return;

    const duration =
      audio?.duration || 0;

    const current =
      audio?.currentTime || 0;

    const percent =
      duration
        ? Math.min(
            100,
            Math.max(
              0,
              current /
              duration *
              100
            )
          )
        : 0;

    fill.style.width =
      percent + '%';

    if (thumb) {

      thumb.style.left =
        percent + '%';
    }

    if (cur) {

      cur.textContent =
        formatTime(current);
    }

    if (dur) {

      dur.textContent =
        formatTime(duration);
    }

    host
      .querySelectorAll(
        '.pqi-music-item'
      )
      .forEach(
        (element,index) => {

          element.classList.toggle(
            'active',
            index === track
          );
        }
      );

    const playButton =
      host.querySelector(
        '[data-music="play"]'
      );

    if (playButton) {

      playButton.textContent =
        audio &&
        !audio.paused
          ? 'Ⅱ'
          : '▶';
    }
  }

  /* =========================================================
     播放音乐
     ========================================================= */

  function play(index) {

    track =
      (index + music.length)
      % music.length;

    if (audio) {

      audio.pause();

      audio.src = '';
    }

    audio =
      new Audio(
        music[track][1]
      );

    audio.preload =
      'auto';

    audio.volume =
      1;

    audio.addEventListener(
      'loadedmetadata',
      updateMusicUI
    );

    audio.addEventListener(
      'timeupdate',
      updateMusicUI
    );

    audio.addEventListener(
      'durationchange',
      updateMusicUI
    );

    audio.addEventListener(
      'play',
      updateMusicUI
    );

    audio.addEventListener(
      'pause',
      updateMusicUI
    );

    audio.addEventListener(
      'ended',
      () => {

        play(
          track + 1
        );

      }
    );

    const host =
      document.getElementById(
        HOST_ID
      );

    if (host) {

      const now =
        host.querySelector(
          '.pqi-now'
        );

      if (now) {

        now.textContent =
          '正在播放：' +
          music[track][0];
      }
    }

    updateMusicUI();

    audio
      .play()
      .then(
        () => {
          updateMusicUI();
        }
      )
      .catch(
        () => {

          showToast(
            '请再次点击歌曲开始播放'
          );

          updateMusicUI();
        }
      );
  }

  /* =========================================================
     播放 / 暂停
     ========================================================= */

  function togglePlay() {

    if (!audio) {

      play(0);

      return;
    }

    if (audio.paused) {

      audio
        .play()
        .catch(
          () => {}
        );

    } else {

      audio.pause();
    }

    updateMusicUI();
  }

  /* =========================================================
     音乐进度拖动
     ========================================================= */

  function seekMusic(clientX) {

    if (
      !audio ||
      !audio.duration ||
      !isFinite(audio.duration)
    ) {
      return;
    }

    const host =
      document.getElementById(
        HOST_ID
      );

    if (!host) return;

    const progress =
      host.querySelector(
        '.pqi-progress-wrap'
      );

    if (!progress) return;

    const rect =
      progress.getBoundingClientRect();

    let percent =
      (
        clientX -
        rect.left
      ) /
      rect.width;

    percent =
      Math.max(
        0,
        Math.min(
          1,
          percent
        )
      );

    audio.currentTime =
      percent *
      audio.duration;

    updateMusicUI();
  }

  /* =========================================================
     渲染指令
     ========================================================= */

  function renderCommands() {

    const host =
      document.getElementById(
        HOST_ID
      );

    if (!host) return;

    const content =
      host.querySelector(
        '#pqi-content'
      );

    let html = '';

    html += card(
      '互动',
      commands
        .slice(0,5)
        .map(
          x => `
            <button
              class="pqi-command"
              data-command-index="${commands.indexOf(x)}"
              type="button"
            >
              ${x[0] || ''} ${escapeHTML(x[1])}
            </button>
          `
        )
        .join('')
    );

    html += card(
      '⚠️ 记忆相关',
      commands
        .slice(5,9)
        .map(
          x => `
            <button
              class="pqi-command"
              data-command-index="${commands.indexOf(x)}"
              type="button"
            >
              ${x[0] || ''} ${escapeHTML(x[1])}
            </button>
          `
        )
        .join('')
    );

    html += card(
      '常用指令',
      commands
        .slice(9)
        .map(
          x => `
            <button
              class="pqi-command"
              data-command-index="${commands.indexOf(x)}"
              type="button"
            >
              ${x[0] || ''} ${escapeHTML(x[1])}
            </button>
          `
        )
        .join('')
    );

    content.innerHTML =
      html;
  }

  /* =========================================================
     渲染角色
     ========================================================= */

  function renderRoles() {

    const host =
      document.getElementById(
        HOST_ID
      );

    if (!host) return;

    const content =
      host.querySelector(
        '#pqi-content'
      );

    content.innerHTML =
      roles
        .map(
          role => {

            const [
              name,
              tags,
              extra,
              job,
              address,
              relation
            ] = role;

            return card(
              name,
              `
                <div class="pqi-tags">

                  ${
                    tags
                      ? `
                        <span class="pqi-tag">
                          ${escapeHTML(tags)}
                        </span>
                      `
                      : ''
                  }

                  ${
                    extra
                      ? `
                        <span class="pqi-tag">
                          ${escapeHTML(extra)}
                        </span>
                      `
                      : ''
                  }

                </div>

                ${
                  job
                    ? `
                      <div class="pqi-row">
                        <span class="pqi-label">
                          职业 / 身份：
                        </span>
                        ${escapeHTML(job)}
                      </div>
                    `
                    : ''
                }

                ${
                  address
                    ? `
                      <div class="pqi-row">
                        <span class="pqi-label">
                          住址：
                        </span>
                        ${escapeHTML(address)}
                      </div>
                    `
                    : ''
                }

                ${
                  relation
                    ? `
                      <div class="pqi-row">
                        <span class="pqi-label">
                          关系 / 日常：
                        </span>
                        ${escapeHTML(relation)}
                      </div>
                    `
                    : ''
                }

              `
            );
          }
        )
        .join('');
  }

  /* =========================================================
     渲染音乐
     ========================================================= */

  function renderMusic() {

    const host =
      document.getElementById(
        HOST_ID
      );

    if (!host) return;

    const content =
      host.querySelector(
        '#pqi-content'
      );

    content.innerHTML =

      card(
        '🎵 使用教程',
        `
          <div class="pqi-row">
            播放：点击歌曲即可播放。
          </div>

          <div class="pqi-row">
            切换：点击上一首 / 下一首或直接点击歌曲。
          </div>

          <div class="pqi-row">
            进度：拖动音乐进度条即可跳转。
          </div>
        `
      )

      +

      card(
        '🎵 音乐播放器',
        `

          <div class="pqi-now">
            ${
              audio
                ? '正在播放：' +
                  music[track][0]
                : '未播放'
            }
          </div>

          <div class="pqi-music-controls">

            <button
              class="pqi-music-btn"
              data-music="-1"
              type="button"
            >
              ‹
            </button>

            <button
              class="pqi-music-btn"
              data-music="play"
              type="button"
            >
              ${
                audio &&
                !audio.paused
                  ? 'Ⅱ'
                  : '▶'
              }
            </button>

            <button
              class="pqi-music-btn"
              data-music="1"
              type="button"
            >
              ›
            </button>

          </div>

          <div
            class="pqi-progress-wrap"
            id="pqi-progress-wrap"
          >

            <div class="pqi-progress">

              <div
                class="pqi-progress-fill"
              ></div>

              <div
                class="pqi-progress-thumb"
              ></div>

            </div>

          </div>

          <div class="pqi-time">

            <span class="pqi-cur">
              ${
                audio
                  ? formatTime(
                      audio.currentTime
                    )
                  : '0:00'
              }
            </span>

            <span class="pqi-dur">
              ${
                audio &&
                isFinite(audio.duration)
                  ? formatTime(
                      audio.duration
                    )
                  : '0:00'
              }
            </span>

          </div>

          <div class="pqi-music-list">

            ${music
              .map(
                (m,i) => `
                  <div
                    class="pqi-music-item ${
                      i === track &&
                      audio
                        ? 'active'
                        : ''
                    }"
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

    updateMusicUI();
  }

  /* =========================================================
     渲染地点
     ========================================================= */

  function renderLocations() {

    const host =
      document.getElementById(
        HOST_ID
      );

    if (!host) return;

    const content =
      host.querySelector(
        '#pqi-content'
      );

    content.innerHTML =
      locations
        .map(
          location =>
            card(
              location[0],
              `
                <div class="pqi-tags">

                  <span class="pqi-tag">
                    ${escapeHTML(location[1])}
                  </span>

                </div>

                <div class="pqi-row">
                  ${escapeHTML(location[2])}
                </div>
              `
            )
        )
        .join('');
  }

  /* =========================================================
     渲染南京
     ========================================================= */

  function renderNanjing() {

    const host =
      document.getElementById(
        HOST_ID
      );

    if (!host) return;

    const content =
      host.querySelector(
        '#pqi-content'
      );

    content.innerHTML =
      Object
        .entries(nj)
        .map(
          ([area,places]) =>
            card(
              area,
              `
                <div class="pqi-row">
                  ${places
                    .map(
                      p =>
                        `<span>${escapeHTML(p)}</span>`
                    )
                    .join('　·　')
                  }
                </div>
              `
            )
        )
        .join('');
  }

  /* =========================================================
     切换页面
     ========================================================= */

  function render(tab) {

    switch(tab) {

      case 'cmd':
        renderCommands();
        break;

      case 'role':
        renderRoles();
        break;

      case 'music':
        renderMusic();
        break;

      case 'loc':
        renderLocations();
        break;

      case 'nj':
        renderNanjing();
        break;

      default:
        renderCommands();
    }
  }

  /* =========================================================
     保存位置
     ========================================================= */

  function savePosition(x,y) {

    try {

      localStorage.setItem(
        POS_X_KEY,
        String(x)
      );

      localStorage.setItem(
        POS_Y_KEY,
        String(y)
      );

    } catch {}
  }

  /* =========================================================
     读取位置
     ========================================================= */

  function loadPosition(host) {

    try {

      const x =
        parseFloat(
          localStorage.getItem(
            POS_X_KEY
          )
        );

      const y =
        parseFloat(
          localStorage.getItem(
            POS_Y_KEY
          )
        );

      if (
        Number.isFinite(x) &&
        Number.isFinite(y)
      ) {

        host.style.left =
          x + 'px';

        host.style.top =
          y + 'px';

        host.style.right =
          'auto';

        host.style.transform =
          'none';

        return;
      }

    } catch {}

  }

  /* =========================================================
     限制 🧸 不跑出屏幕
     ========================================================= */

  function clampPosition(
    x,
    y,
    host
  ) {

    const rect =
      host.getBoundingClientRect();

    const width =
      rect.width || 52;

    const height =
      rect.height || 52;

    const maxX =
      window.innerWidth -
      width;

    const maxY =
      window.innerHeight -
      height;

    return {

      x:Math.max(
        0,
        Math.min(
          x,
          maxX
        )
      ),

      y:Math.max(
        0,
        Math.min(
          y,
          maxY
        )
      )

    };
  }

  /* =========================================================
     🧸 拖动
     ========================================================= */

  function enableDragging(
    host
  ) {

    const trigger =
      host.querySelector(
        '.pqi-trigger'
      );

    if (!trigger) return;

    let dragging = false;

    let moved = false;

    let startX = 0;
    let startY = 0;

    let originX = 0;
    let originY = 0;

    function startDrag(e) {

      if (
        e.pointerType === 'mouse' &&
        e.button !== 0
      ) {
        return;
      }

      const rect =
        host.getBoundingClientRect();

      startX =
        e.clientX;

      startY =
        e.clientY;

      originX =
        rect.left;

      originY =
        rect.top;

      dragging =
        true;

      moved =
        false;

      host.classList.add(
        'dragging'
      );

      host.style.left =
        originX + 'px';

      host.style.top =
        originY + 'px';

      host.style.right =
        'auto';

      host.style.transform =
        'none';

      try {
        trigger.setPointerCapture(
          e.pointerId
        );
      } catch {}

      e.preventDefault();
    }

    function moveDrag(e) {

      if (!dragging) return;

      const dx =
        e.clientX -
        startX;

      const dy =
        e.clientY -
        startY;

      if (
        Math.abs(dx) > 4 ||
        Math.abs(dy) > 4
      ) {

        moved =
          true;
      }

      const pos =
        clampPosition(
          originX + dx,
          originY + dy,
          host
        );

      host.style.left =
        pos.x + 'px';

      host.style.top =
        pos.y + 'px';

      e.preventDefault();
    }

    function endDrag() {

      if (!dragging) return;

      dragging =
        false;

      host.classList.remove(
        'dragging'
      );

      const rect =
        host.getBoundingClientRect();

      savePosition(
        rect.left,
        rect.top
      );
    }

    trigger.addEventListener(
      'pointerdown',
      startDrag
    );

    trigger.addEventListener(
      'pointermove',
      moveDrag
    );

    trigger.addEventListener(
      'pointerup',
      endDrag
    );

    trigger.addEventListener(
      'pointercancel',
      endDrag
    );

    /*
      防止拖动时误打开
    */

    trigger.addEventListener(
      'click',
      e => {

        if (moved) {

          e.preventDefault();
          e.stopPropagation();

          moved =
            false;

          return;
        }

        host.classList.toggle(
          'open'
        );
      }
    );
  }

  /* =========================================================
     创建侧边栏
     ========================================================= */

  function make() {

    let host =
      document.getElementById(
        HOST_ID
      );

    if (host) {
      return host;
    }

    addStyle();

    host =
      document.createElement(
        'div'
      );

    host.id =
      HOST_ID;

    host.innerHTML = `

      <div class="pqi-panel">

        <div class="pqi-head">

          <div class="pqi-title">

            <span>
              彭齐 · 伴生侧边栏
            </span>

            <button
              class="pqi-close"
              type="button"
            >
              ×
            </button>

          </div>

          <div class="pqi-subtitle">
            仅挂载于当前角色卡页面
          </div>

        </div>

        <div class="pqi-tabs">

          <button
            class="pqi-tab active"
            data-tab="cmd"
            type="button"
          >
            指令
          </button>

          <button
            class="pqi-tab"
            data-tab="role"
            type="button"
          >
            角色
          </button>

          <button
            class="pqi-tab"
            data-tab="music"
            type="button"
          >
            音乐
          </button>

          <button
            class="pqi-tab"
            data-tab="loc"
            type="button"
          >
            地点
          </button>

          <button
            class="pqi-tab"
            data-tab="nj"
            type="button"
          >
            南京
          </button>

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
          aria-label="打开侧边栏"
        >
          🧸
        </button>

      </div>

    `;

    document.body.appendChild(
      host
    );

    loadPosition(
      host
    );

    enableDragging(
      host
    );

    const close =
      host.querySelector(
        '.pqi-close'
      );

    close.addEventListener(
      'click',
      () => {

        host.classList.remove(
          'open'
        );

      }
    );

    host
      .querySelectorAll(
        '.pqi-tab'
      )
      .forEach(
        tab => {

          tab.addEventListener(
            'click',
            () => {

              host
                .querySelectorAll(
                  '.pqi-tab'
                )
                .forEach(
                  t =>
                    t.classList.remove(
                      'active'
                    )
                );

              tab.classList.add(
                'active'
              );

              render(
                tab.dataset.tab
              );

            }
          );

        }
      );

    /* =====================================================
       全局点击事件
       ===================================================== */

    host.addEventListener(
      'click',
      e => {

        /* 指令 */

        const command =
          e.target.closest(
            '[data-command-index]'
          );

        if (command) {

          const index =
            Number(
              command.dataset.commandIndex
            );

          if (
            commands[index]
          ) {

            injectAndSend(
              commands[index][2]
            );

          }

          return;
        }

        /* 音乐 */

        const musicItem =
          e.target.closest(
            '[data-track]'
          );

        if (musicItem) {

          play(
            Number(
              musicItem.dataset.track
            )
          );

          return;
        }

        /* 播放控制 */

        const musicButton =
          e.target.closest(
            '[data-music]'
          );

        if (musicButton) {

          const action =
            musicButton.dataset.music;

          if (
            action === 'play'
          ) {

            togglePlay();

          } else {

            play(
              track +
              Number(action)
            );

          }

          return;
        }

      }
    );

    /* =====================================================
       进度条鼠标
       ===================================================== */

    const progress =
      host.querySelector(
        '#pqi-progress-wrap'
      );

    if (progress) {

      progress.addEventListener(
        'pointerdown',
        e => {

          seekMusic(
            e.clientX
          );

          e.preventDefault();

        }
      );

      progress.addEventListener(
        'pointermove',
        e => {

          if (
            e.buttons === 1
          ) {

            seekMusic(
              e.clientX
            );

            e.preventDefault();
          }

        }
      );

    }

    render(
      'cmd'
    );

    return host;
  }

  /* =========================================================
     窗口尺寸变化
     ========================================================= */

  window.addEventListener(
    'resize',
    () => {

      const host =
        document.getElementById(
          HOST_ID
        );

      if (!host) return;

      const rect =
        host.getBoundingClientRect();

      const pos =
        clampPosition(
          rect.left,
          rect.top,
          host
        );

      host.style.left =
        pos.x + 'px';

      host.style.top =
        pos.y + 'px';

      host.style.right =
        'auto';

      host.style.transform =
        'none';

      savePosition(
        pos.x,
        pos.y
      );

    }
  );

  /* =========================================================
     角色切换时自动显示 / 隐藏
     ========================================================= */

  function updateVisibility() {

    addStyle();

    const host =
      document.getElementById(
        HOST_ID
      );

    if (!isPengQi()) {

      if (host) {

        host.remove();
      }

      return;
    }

    make();
  }

  /* =========================================================
     初始化
     ========================================================= */

  function init() {

    updateVisibility();

    /*
      定时检查角色切换。
      这样即使某些酒馆版本没有暴露事件，
      也可以正常切换彭齐 / 其他角色。
    */

    setInterval(
      updateVisibility,
      1500
    );

    /*
      尝试监听酒馆事件
    */

    try {

      const ctx =
        getContext();

      if (
        ctx &&
        ctx.eventSource &&
        ctx.event_types
      ) {

        const events = [

          'CHAT_CHANGED',

          'CHARACTER_MESSAGE_RENDERED',

          'MESSAGE_RECEIVED'

        ];

        events.forEach(
          eventName => {

            const event =
              ctx.event_types[
                eventName
              ];

            if (event) {

              ctx.eventSource.on(
                event,
                updateVisibility
              );

            }

          }
        );

      }

    } catch {}

  }

  /* =========================================================
     启动
     ========================================================= */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      init
    );

  } else {

    init();

  }

})();

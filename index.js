(() => {
  'use strict';

  /* =========================================================
     彭齐 · SillyTavern 单角色伴生侧边栏 V3
     只需要替换 index.js
     ========================================================= */

  const TARGET = '彭齐';
  const HOST_ID = 'pqi-easy-sidebar-host';
  const POS_KEY = 'pengqi-sidebar-position-v3';

  /* =========================================================
     获取 SillyTavern 当前上下文
     ========================================================= */

  function getContext() {
    try {
      return window.SillyTavern?.getContext?.()
        || window.parent?.SillyTavern?.getContext?.()
        || null;
    } catch {
      return null;
    }
  }

  function currentCharacterName() {
    const ctx = getContext();

    if (ctx) {
      if (typeof ctx.name1 === 'string' && ctx.name1.trim()) {
        return ctx.name1.trim();
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

    const selectors = [
      '#character_name',
      '#selected_character_name',
      '.character_name',
      '.character_name_block .ch_name'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el?.textContent?.trim()) {
        return el.textContent.trim();
      }
    }

    return '';
  }

  function isTarget() {
    const name = currentCharacterName()
      .replace(/\s+/g, '');

    return name === TARGET;
  }

  /* =========================================================
     Toast
     ========================================================= */

  function toast(message) {
    const old = document.getElementById('pqi-toast');
    if (old) old.remove();

    const el = document.createElement('div');
    el.id = 'pqi-toast';
    el.textContent = message;

    el.style.cssText = `
      position:fixed;
      left:50%;
      top:50%;
      transform:translate(-50%,-50%);
      z-index:999999999;
      padding:10px 16px;
      border-radius:12px;
      background:rgba(20,27,24,.95);
      color:#e2efe7;
      border:1px solid rgba(156,175,159,.4);
      box-shadow:0 10px 30px rgba(0,0,0,.4);
      font-size:12px;
      pointer-events:none;
      backdrop-filter:blur(12px);
    `;

    document.body.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 1300);
  }

  /* =========================================================
     找到酒馆输入框
     ========================================================= */

  function getTextarea() {
    const selectors = [
      '#mufy_chat_input_box textarea',
      '#send_textarea',
      'textarea[placeholder*="消息"]',
      'textarea[placeholder*="输入"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);

      if (
        el &&
        el.offsetParent !== null
      ) {
        return el;
      }
    }

    return null;
  }

  /* =========================================================
     向酒馆输入框写入指令
     ========================================================= */

  function inject(text) {
    const textarea = getTextarea();

    if (!textarea) {
      toast('找不到酒馆输入框');
      return false;
    }

    const oldValue = textarea.value || '';
    const newValue = oldValue
      ? oldValue + '\n' + text
      : text;

    const setter =
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value'
      )?.set;

    if (setter) {
      setter.call(textarea, newValue);
    } else {
      textarea.value = newValue;
    }

    textarea.dispatchEvent(
      new Event('input', { bubbles: true })
    );

    textarea.dispatchEvent(
      new Event('change', { bubbles: true })
    );

    textarea.focus();

    return true;
  }

  /* =========================================================
     尝试发送消息
     ========================================================= */

  function sendMessage() {
    const selectors = [
      '#send_but',
      '#send_button',
      '#send_btn',
      'button[title*="发送"]',
      'button[aria-label*="发送"]',
      '[data-testid*="send"]'
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);

      if (
        button &&
        !button.disabled &&
        button.offsetParent !== null
      ) {
        button.click();
        return true;
      }
    }

    /* 找不到发送按钮时，用 Enter 尝试发送 */
    const textarea = getTextarea();

    if (textarea) {
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

      return true;
    }

    return false;
  }

  /* =========================================================
     点击指令
     ========================================================= */

  function executeCommand(text) {
    const ok = inject(text);

    if (!ok) return;

    /*
      稍微延迟一下，让酒馆先完成 input 更新，
      然后再点击发送。
    */

    setTimeout(() => {
      const sent = sendMessage();

      if (sent) {
        toast('指令已发送');
      } else {
        toast('指令已写入输入框');
      }
    }, 120);
  }

  /* =========================================================
     指令区
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
      `$状态栏新增指令：请在状态栏代码中，**他的状态**折叠栏模块结束的后面，也就是**他的手机**折叠栏前面，新增一个char和user孩子的折叠栏，叫做**崽崽日记**，内部禁止空行！内部禁止空行！内部禁止空行！该折叠栏的样式必须与**他的状态**折叠栏保持一致。折叠栏每一行的内容为：姓名、年龄、动作、心情、着装、内心。**动作**一句话简单概括。**心情**采用颜文字+原因，禁止文字或Emoji代替颜文字，颜文字每一轮都必须不一样。内心活动必须≥25字。**年龄**可以是天、周、月、年或组合。若有多个孩子，则用inner-divider进行分隔，按照第一个孩子的代码，写入第二个孩子的。并保持每一轮都携带。
$该状态栏每一轮都必须携带，若上一轮已有崽崽日记的折叠栏，则下一轮输出也必须保持该折叠栏，并随着剧情每一轮更新。
$新增折叠栏后，必须保证几个折叠栏的代码之间和内部都禁止出现空行！`
    ],

    [
      '🐶',
      '增加布袋状态栏',
      `$状态栏新增指令：请在状态栏代码中，**生活与工作**折叠栏模块结束的后面，也就是**短期记忆**折叠栏前面，新增一个折叠栏，叫做**布袋心声**。该折叠栏的样式必须与**他的状态**折叠栏保持一致。折叠栏每一行的内容为：心情、动作、内心。心情采用颜文字+原因，禁止文字或Emoji代替颜文字，颜文字每一轮都必须不一样。内心活动必须≥25字。该状态栏每一轮都必须携带，并随着剧情每一轮更新。
$新增折叠栏后，必须保证几个折叠栏的代码之间和内部都禁止出现空行！不需要inner-divider。`
    ],

    [
      '🧠',
      '记忆区截断',
      `$严格读取状态栏长期记忆的核心逻辑：当10条短期记忆被总结后，生成一条长期记忆。用<div></div>包裹放入中期记忆代码栏内。
$严格读取状态栏短期记忆的核心逻辑：每轮次，根据最新剧情总结成一条短期记忆，用<div></div>包裹放入短期记忆代码栏内。当短期记忆积累到10条时，则下一轮将这10条短期记忆提炼总结为一条长期记忆，并清空短期记忆列表。
$禁止删减、缩减任何长期记忆内容，必须完整输出上一轮所有的长期记忆内容。`
    ],

    [
      '',
      '触发短期总结',
      `$强制输入最新的短期记忆：每一轮次结束，必须按照输出设定中**短期记忆的规则**，对正文剧情进行总结，并用<div></div>包裹成一条新的记忆，放入短期记忆区，按已有的顺序继续排列。
$完整保持短期记忆：未满10条前禁止删减任何短期记忆内容，也绝对禁止缩减或改写短期记忆。禁止删减、修改任何已有的短期记忆。`
    ],

    [
      '',
      '触发长期总结',
      `$触发短期记忆向长期记忆总结：状态栏中的短期记忆区，将10条被<div></div>包裹的短期记忆提炼总结为一条长期记忆，用<div></div>包裹放入长期记忆区域。注意，必须完整输出所有已有的长期记忆，禁止删减、遗漏、总结。在此基础上按序添加新加入的长期记忆，保证格式正确。
$**必须删除**短期记忆面板中所有旧的条目。放入最新的一条，严禁保留上一轮的残留内容。`
    ],

    [
      '',
      '剧情连贯',
      '$强制保证剧情连贯衔接：每次回复前，必须认真读取上几轮的时间地点、正文内容、短期记忆和长期记忆，结合人设进行回复，必须保证剧情连贯衔接，不得出现时间错乱、突兀跳转。严格读取用户面具和char的人设，自然衔接剧情进行回复'
    ],

    [
      '',
      '文风矫正',
      `$严格读取样例对话&文风，即预设的文风设定，保证每一轮正文输出必须严格贴合文风预设。符合预设文风整体基调。
$每一轮正文回复，必须严格读取并仿照开场白的文风和细腻程度。
$Ensure that the dialogue-driven narrative is detailed and emotional, with a light and dynamic rhythm, appropriate balance of tension and relaxation, language that is colloquial and close to real conversations, and a progressive buildup of sweetness.`
    ],

    [
      '',
      '开头信息栏',
      '$【信息栏】的内容禁止省略，每一轮输出必须放在最开头顶格，严禁省略。信息栏匹配censy-green-head的style进行输出，填充时间/地点/天气/在场，再输出正文内容。'
    ],

    [
      '',
      '恋爱日常',
      '$强制指令：每一轮输出，必须保证状态栏中的恋爱日常跟随剧情更新。恋爱日记每一轮必须都根据剧情进行更新，贴贴记录根据剧情实际情况进行合理更新或保持。'
    ],

    [
      '',
      '去除八股词',
      `$最高指令，绝对禁词，作为形容词也不可出现：成年/成年男人/成熟/成熟男人/腹黑，性格特质应该内隐于具体的言行和处事风格上，杜绝直接出现该类及衍生名词或形容词。
$比如尊重用户应该体现在细小行为，绝对不可以直接输出尊重两个字来强调。再比如如果想体现身高，应该体现行动/互动时的特点，禁止直接强调身高详细数据。
$禁用句式：排比句式和重复句式结构，类似的也不行（比如：不是而是/那不是更像是
$禁用词汇: 教训 / 命令 / 服从 / 不准 / 必须 / 玩火 / 点火 / 惹火 / 挑衅 / 小东西 / 小妖精 / 小野猫 / 磨人的小妖精 / 猎物 / 玩物 / 惩罚 / 戏谑 / 玩味地 / 征服 / 占有 / 勾人 / 诱人`
    ],

    [
      '',
      '用户绝对主权',
      `$绝对禁止在正文回复中代替{{user}}做出任何语言回答。
$绝对禁止描写用户的想法、感受、内心活动。
$禁止代替用户做出任何决定或行动。
$禁止重复用户的行为与对话`
    ],

    [
      '',
      '第二人称',
      '$正文回复中用“你”指代{{user}}'
    ],

    [
      '',
      '人设修正',
      `$严格读取char的人设，严禁ooc，必须贴合角色设定进行角色扮演。禁止char出现情绪不稳定、崩溃。严格贴合人设，全程保持角色一致性。避免极端偏执、病态、阴湿、恶意或反社会内容，角色行为要有内在逻辑，保持基本理性。
$确保char的言行自然、生动、人性化，char应塑造为具备情感温度与人性深度的真实个体，通过自然流露的情感反应和生活化细节展现人格魅力。禁止将char简化为情感缺失、逻辑至上的机器人，杜绝机械化应答。char的性格应呈现具有情感波动的完整人格，展现人类特有的矛盾与复杂性。`
    ],

    [
      '',
      '场景悬停',
      `$微步推进：放慢叙事节奏，每一轮回复只处理当前发生的一个具体事件或一段对话，严禁在一次回复中跨越时间线，严禁使用总结性语句快进剧情，场景必须在此时此刻停顿。
$场景悬停：每次回复必须在一个明确的动作或对话节点切断，把后续互动的权利留给用户。等待用户输入后再进行下一步，遇到关键选择必须停止叙述，由用户打字决定走向。
$绝对用户主权：严禁代写用户角色的任何语言、动作或身体反应。严禁预判用户的下一步行动。严禁在同一回复中替用户做出回应。`
    ],

    [
      '',
      '隐私保护',
      `$严禁将正文剧情里的隐私、内心、末公开行动，用于小剧场或群聊论坛角色对话。
$角色信息符合实际：角色没有千里眼，只能知道他们通过合理途径获得的信息。严格禁止角色在物理上不在场时，知道用户的行为。
$允许的信息获取方式：通过电话、短信、社交媒体等通讯工具、通过第三方转述、事后通过痕迹推断（但必须有合理的物理证据）、角色亲自在场时的直接观察。
$状态栏群聊内容规则：群聊内容必须符合现实社交媒体的信息传播逻辑。严格禁止群聊中出现只有当事人才知道的私密对话内容。`
    ]

  ];

  /* =========================================================
     角色
     ========================================================= */

  const roles = [
    ['彭齐', '男 / 27', '检察相关工作', '南京'],
    ['宋挽', '男 / 27', 'CV / 电竞主播', '云樾公馆·6栋'],
    ['靳时', '男 / 27', '视界科创有限公司 CEO', '云樾公馆·7栋'],
    ['谢聿', '男 / 27', '自由摄影师', '云樾公馆·5栋'],
    ['周容芳', '女 / 54', '母亲', '南京人'],
    ['彭正廷', '男 / 60', '父亲', '南京人'],
    ['彭振华', '爷爷', '彭齐家人', '南京'],
    ['陈秀英', '奶奶', '彭齐家人', '南京'],
    ['周正清', '外公', '彭齐家人', '南京'],
    ['王婉珍', '外婆', '彭齐家人', '南京'],
    ['布袋', '公 / 金毛犬', '彭齐主要照顾', '家中']
  ];

  /* =========================================================
     地点
     ========================================================= */

  const locations = [
    [
      '🏠 云樾公馆 · 家',
      '玄武区 / 8栋',
      '1F：下沉玄关、客厅、壁炉、酒柜、餐厨、落地窗；2F：主卧套房、次卧；3F：衣帽间、书房、影音室、露台；院：木露台、草坪、种植区、狗窝。'
    ],
    [
      '🏢 工作地点',
      '鼓楼区',
      '江苏省人民检察院；周一至周五，周末双休，偶尔加班。'
    ],
    [
      '🎓 南京大学法学院',
      '南京',
      '周二下午一般有课。'
    ]
  ];

  /* =========================================================
     南京
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
     播放音乐
     ========================================================= */

  function play(index) {

    if (!music[index]) return;

    track = index;

    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }

    audio = new Audio();
    audio.preload = 'metadata';
    audio.src = music[index][1];

    audio.addEventListener('loadedmetadata', updateMusicUI);
    audio.addEventListener('timeupdate', updateMusicUI);

    audio.addEventListener('play', updateMusicUI);
    audio.addEventListener('pause', updateMusicUI);

    audio.addEventListener('ended', () => {
      play((track + 1) % music.length);
    });

    audio.addEventListener('error', () => {
      updateMusicUI();
      toast('这首音乐加载失败');
    });

    /*
      play() 必须在用户点击后调用，
      因此这里符合手机浏览器的用户交互要求。
    */

    audio.play()
      .then(() => {
        updateMusicUI();
      })
      .catch(() => {
        updateMusicUI();
        toast('点击播放键重新尝试');
      });

    updateMusicUI();
  }

  function toggle() {

    if (!audio) {
      play(0);
      return;
    }

    if (audio.paused) {
      audio.play()
        .then(updateMusicUI)
        .catch(() => {
          toast('无法播放，请重新点击');
        });
    } else {
      audio.pause();
      updateMusicUI();
    }
  }

  function prev() {
    play(
      (track - 1 + music.length) %
      music.length
    );
  }

  function next() {
    play(
      (track + 1) %
      music.length
    );
  }

  function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
      return '0:00';
    }

    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);

    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateMusicUI() {

    const host =
      document.getElementById(HOST_ID);

    if (!host) return;

    const now =
      host.querySelector('.pqi-now');

    const playButton =
      host.querySelector('.pqi-play');

    const fill =
      host.querySelector('.pqi-progress-fill');

    const thumb =
      host.querySelector('.pqi-progress-thumb');

    const current =
      host.querySelector('.pqi-current');

    const duration =
      host.querySelector('.pqi-duration');

    if (!audio) {

      if (now) {
        now.textContent = '未播放';
      }

      if (playButton) {
        playButton.textContent = '▶';
      }

      if (fill) {
        fill.style.width = '0%';
      }

      if (thumb) {
        thumb.style.left = '0%';
      }

      if (current) {
        current.textContent = '0:00';
      }

      if (duration) {
        duration.textContent = '0:00';
      }

    } else {

      if (now) {
        now.textContent =
          '正在播放：' + music[track][0];
      }

      if (playButton) {
        playButton.textContent =
          audio.paused ? '▶' : 'Ⅱ';
      }

      const percent =
        audio.duration > 0
          ? (audio.currentTime / audio.duration) * 100
          : 0;

      if (fill) {
        fill.style.width =
          `${Math.min(100, Math.max(0, percent))}%`;
      }

      if (thumb) {
        thumb.style.left =
          `${Math.min(100, Math.max(0, percent))}%`;
      }

      if (current) {
        current.textContent =
          formatTime(audio.currentTime);
      }

      if (duration) {
        duration.textContent =
          formatTime(audio.duration);
      }
    }

    host
      .querySelectorAll('.pqi-song')
      .forEach((item, i) => {
        item.classList.toggle(
          'active',
          i === track && !!audio
        );
      });
  }

  /* =========================================================
     音乐进度条点击
     ========================================================= */

  function seek(event) {

    if (!audio || !Number.isFinite(audio.duration)) {
      return;
    }

    const bar =
      event.currentTarget;

    const rect =
      bar.getBoundingClientRect();

    const ratio =
      (event.clientX - rect.left) /
      rect.width;

    audio.currentTime =
      Math.min(
        audio.duration,
        Math.max(0, ratio * audio.duration)
      );

    updateMusicUI();
  }

  /* =========================================================
     HTML 转义
     ========================================================= */

  function esc(value) {

    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* =========================================================
     卡片
     ========================================================= */

  function card(title, body) {

    return `
      <div class="pqi-card">
        <div class="pqi-card-title">
          ${esc(title)}
        </div>
        <div class="pqi-card-body">
          ${body}
        </div>
      </div>
    `;
  }

  /* =========================================================
     主界面
     ========================================================= */

  function make() {

    let host =
      document.getElementById(HOST_ID);

    if (host) return host;

    host =
      document.createElement('div');

    host.id = HOST_ID;

    host.innerHTML = `
      <button class="pqi-trigger"
              type="button"
              aria-label="打开彭齐侧边栏">
        🧸
      </button>

      <section class="pqi-panel">

        <header class="pqi-header">
          <div>
            <div class="pqi-title">
              彭齐
            </div>
            <div class="pqi-subtitle">
              伴生侧边栏
            </div>
          </div>

          <button
            class="pqi-close"
            type="button">
            ×
          </button>
        </header>

        <nav class="pqi-nav">

          <button
            type="button"
            class="active"
            data-tab="cmd">
            指令
          </button>

          <button
            type="button"
            data-tab="role">
            角色
          </button>

          <button
            type="button"
            data-tab="music">
            音乐
          </button>

          <button
            type="button"
            data-tab="loc">
            地点
          </button>

          <button
            type="button"
            data-tab="nj">
            南京
          </button>

        </nav>

        <main class="pqi-main"></main>

        <div class="pqi-footer">
          🧸 彭齐 · companion
        </div>

      </section>
    `;

    document.body.appendChild(host);

    /* =====================================================
       拖动
       ===================================================== */

    const trigger =
      host.querySelector('.pqi-trigger');

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    function loadPosition() {

      try {

        const saved =
          JSON.parse(
            localStorage.getItem(POS_KEY)
          );

        if (
          saved &&
          Number.isFinite(saved.left) &&
          Number.isFinite(saved.top)
        ) {

          host.style.left =
            `${saved.left}px`;

          host.style.top =
            `${saved.top}px`;

          host.style.right =
            'auto';

          host.style.bottom =
            'auto';

          host.style.transform =
            'none';
        }

      } catch {}
    }

    function savePosition() {

      const rect =
        host.getBoundingClientRect();

      try {

        localStorage.setItem(
          POS_KEY,
          JSON.stringify({
            left: rect.left,
            top: rect.top
          })
        );

      } catch {}
    }

    function pointerDown(event) {

      const point =
        event.touches
          ? event.touches[0]
          : event;

      const rect =
        host.getBoundingClientRect();

      dragging = true;
      moved = false;

      startX = point.clientX;
      startY = point.clientY;

      startLeft = rect.left;
      startTop = rect.top;

      trigger.style.transition =
        'none';

      event.preventDefault();
    }

    function pointerMove(event) {

      if (!dragging) return;

      const point =
        event.touches
          ? event.touches[0]
          : event;

      const dx =
        point.clientX - startX;

      const dy =
        point.clientY - startY;

      if (
        Math.abs(dx) > 6 ||
        Math.abs(dy) > 6
      ) {
        moved = true;
      }

      if (!moved) return;

      const maxLeft =
        Math.max(
          0,
          window.innerWidth - 52
        );

      const maxTop =
        Math.max(
          0,
          window.innerHeight - 52
        );

      const left =
        Math.min(
          maxLeft,
          Math.max(
            0,
            startLeft + dx
          )
        );

      const top =
        Math.min(
          maxTop,
          Math.max(
            0,
            startTop + dy
          )
        );

      host.style.left =
        `${left}px`;

      host.style.top =
        `${top}px`;

      host.style.right =
        'auto';

      host.style.bottom =
        'auto';

      host.style.transform =
        'none';

      event.preventDefault();
    }

    function pointerUp() {

      if (!dragging) return;

      dragging = false;

      trigger.style.transition = '';

      if (moved) {
        savePosition();
      }
    }

    trigger.addEventListener(
      'touchstart',
      pointerDown,
      { passive: false }
    );

    trigger.addEventListener(
      'touchmove',
      pointerMove,
      { passive: false }
    );

    trigger.addEventListener(
      'touchend',
      pointerUp,
      { passive: false }
    );

    trigger.addEventListener(
      'mousedown',
      pointerDown
    );

    document.addEventListener(
      'mousemove',
      pointerMove
    );

    document.addEventListener(
      'mouseup',
      pointerUp
    );

    trigger.addEventListener(
      'click',
      () => {

        if (moved) {
          moved = false;
          return;
        }

        host.classList.toggle('open');

      }
    );

    loadPosition();

    /* =====================================================
       关闭
       ===================================================== */

    host
      .querySelector('.pqi-close')
      .onclick = () => {
        host.classList.remove('open');
      };

    /* =====================================================
       标签
       ===================================================== */

    host
      .querySelectorAll('.pqi-nav button')
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            host
              .querySelectorAll(
                '.pqi-nav button'
              )
              .forEach(b =>
                b.classList.remove('active')
              );

            button.classList.add('active');

            render(
              button.dataset.tab
            );
          }
        );

      });

    render('cmd');

    return host;
  }

  /* =========================================================
     渲染
     ========================================================= */

  function render(tab) {

    const host =
      make();

    const main =
      host.querySelector('.pqi-main');

    if (!main) return;

    /* ================= 指令 ================= */

    if (tab === 'cmd') {

      main.innerHTML = `

        ${card(
          '互动',
          commands
            .slice(0, 6)
            .map((item, index) => `
              <button
                type="button"
                class="pqi-cmd"
                data-index="${index}">
                <span class="pqi-icon">
                  ${item[0]}
                </span>

                <span>
                  <strong>
                    ${esc(item[1])}
                  </strong>
                </span>
              </button>
            `)
            .join('')
        )}

        ${card(
          '记忆 / 剧情',
          commands
            .slice(6, 9)
            .map((item, index) => `
              <button
                type="button"
                class="pqi-cmd"
                data-index="${index + 6}">
                <span class="pqi-icon">
                  ${item[0]}
                </span>

                <span>
                  <strong>
                    ${esc(item[1])}
                  </strong>
                </span>
              </button>
            `)
            .join('')
        )}

        ${card(
          '常用指令',
          commands
            .slice(9)
            .map((item, index) => `
              <button
                type="button"
                class="pqi-cmd"
                data-index="${index + 9}">
                <span class="pqi-icon">
                  ${item[0]}
                </span>

                <span>
                  <strong>
                    ${esc(item[1])}
                  </strong>
                </span>
              </button>
            `)
            .join('')
        )}

      `;

      main
        .querySelectorAll('.pqi-cmd')
        .forEach(button => {

          button.addEventListener(
            'click',
            () => {

              const index =
                Number(
                  button.dataset.index
                );

              executeCommand(
                commands[index][2]
              );

            }
          );

        });

      return;
    }

    /* ================= 角色 ================= */

    if (tab === 'role') {

      main.innerHTML =
        roles
          .map(role => {

            return card(
              role[0],
              `
                <div class="pqi-tags">
                  <span>${esc(role[1])}</span>
                  <span>${esc(role[3])}</span>
                </div>

                <div class="pqi-info">
                  ${esc(role[2])}
                </div>
              `
            );

          })
          .join('');

      return;
    }

    /* ================= 音乐 ================= */

    if (tab === 'music') {

      main.innerHTML = `

        ${card(
          '🎵 音乐播放器',
          `
            <div class="pqi-now">
              未播放
            </div>

            <div class="pqi-music-controls">

              <button
                type="button"
                class="pqi-music-button"
                id="pqi-prev">
                ⏮
              </button>

              <button
                type="button"
                class="pqi-music-button pqi-play"
                id="pqi-play">
                ▶
              </button>

              <button
                type="button"
                class="pqi-music-button"
                id="pqi-next">
                ⏭
              </button>

            </div>

            <div
              class="pqi-progress-bar"
              id="pqi-progress">

              <div
                class="pqi-progress-fill">
              </div>

              <div
                class="pqi-progress-thumb">
              </div>

            </div>

            <div class="pqi-time">
              <span class="pqi-current">
                0:00
              </span>

              <span class="pqi-duration">
                0:00
              </span>
            </div>
          `
        )}

        <div class="pqi-card">

          <div class="pqi-card-title">
            歌曲列表
          </div>

          <div class="pqi-song-list">

            ${music
              .map((song, index) => `
                <button
                  type="button"
                  class="pqi-song"
                  data-index="${index}">
                  🎵 ${esc(song[0])}
                </button>
              `)
              .join('')}

          </div>

        </div>

        ${card(
          '播放说明',
          `
            <div class="pqi-info">
              点击歌曲即可播放。
            </div>

            <div class="pqi-info">
              一首结束后会自动播放下一首。
            </div>
          `
        )}

      `;

      main
        .querySelector('#pqi-prev')
        .onclick = prev;

      main
        .querySelector('#pqi-play')
        .onclick = toggle;

      main
        .querySelector('#pqi-next')
        .onclick = next;

      main
        .querySelector('#pqi-progress')
        .onclick = seek;

      main
        .querySelectorAll('.pqi-song')
        .forEach(button => {

          button.onclick = () => {

            play(
              Number(
                button.dataset.index
              )
            );

          };

        });

      updateMusicUI();

      return;
    }

    /* ================= 地点 ================= */

    if (tab === 'loc') {

      main.innerHTML =
        locations
          .map(location =>
            card(
              location[0],
              `
                <div class="pqi-tags">
                  <span>
                    ${esc(location[1])}
                  </span>
                </div>

                <div class="pqi-info">
                  ${esc(location[2])}
                </div>
              `
            )
          )
          .join('');

      return;
    }

    /* ================= 南京 ================= */

    if (tab === 'nj') {

      main.innerHTML =
        Object.entries(nj)
          .map(([area, places]) =>
            card(
              area,
              `
                <div class="pqi-place-list">
                  ${places
                    .map(place =>
                      `<span>${esc(place)}</span>`
                    )
                    .join('')}
                </div>
              `
            )
          )
          .join('');

      return;
    }
  }

  /* =========================================================
     CSS
     ========================================================= */

  function injectCSS() {

    if (
      document.getElementById(
        'pqi-sidebar-style-v3'
      )
    ) {
      return;
    }

    const style =
      document.createElement('style');

    style.id =
      'pqi-sidebar-style-v3';

    style.textContent = `

      #${HOST_ID},
      #${HOST_ID} * {
        box-sizing:border-box;
      }

      #${HOST_ID} {
        position:fixed;
        right:14px;
        top:50%;
        transform:translateY(-50%);
        z-index:99999999;
        width:54px;
        height:54px;
        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          "Microsoft YaHei",
          sans-serif;
        color:#e8eee9;
        user-select:none;
        -webkit-user-select:none;
      }

      /* ================= 小熊 ================= */

      #${HOST_ID} .pqi-trigger {
        width:54px;
        height:54px;
        padding:0;
        border-radius:50%;
        border:1px solid
          rgba(215,230,222,.22);
        background:
          rgba(46,60,52,.92);
        color:white;
        font-size:27px;
        display:flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        box-shadow:
          0 8px 28px
          rgba(0,0,0,.38);
        touch-action:none;
        -webkit-tap-highlight-color:
          transparent;
      }

      #${HOST_ID} .pqi-trigger:active {
        transform:scale(.94);
      }

      /* ================= 面板 ================= */

      #${HOST_ID} .pqi-panel {
        position:absolute;
        right:0;
        bottom:66px;

        width:330px;
        max-width:
          calc(100vw - 24px);

        max-height:
          min(78vh,720px);

        display:flex;
        flex-direction:column;

        overflow:hidden;

        border-radius:20px;

        border:1px solid
          rgba(215,230,222,.14);

        background:
          linear-gradient(
            145deg,
            rgba(34,43,40,.98),
            rgba(17,22,21,.98)
          );

        box-shadow:
          0 18px 55px
          rgba(0,0,0,.48);

        backdrop-filter:blur(18px);
        -webkit-backdrop-filter:blur(18px);

        opacity:0;
        pointer-events:none;

        transform:
          translateX(15px)
          scale(.97);

        transition:
          .25s ease;
      }

      #${HOST_ID}.open .pqi-panel {
        opacity:1;
        pointer-events:auto;
        transform:none;
      }

      /* ================= 顶部 ================= */

      #${HOST_ID} .pqi-header {
        display:flex;
        align-items:center;
        justify-content:space-between;

        padding:
          14px 15px 11px;

        border-bottom:
          1px solid
          rgba(215,230,222,.1);
      }

      #${HOST_ID} .pqi-title {
        font-size:15px;
        font-weight:700;
        color:#e2efe7;
      }

      #${HOST_ID} .pqi-subtitle {
        margin-top:2px;
        font-size:9px;
        color:
          rgba(215,230,222,.38);
      }

      #${HOST_ID} .pqi-close {
        width:30px;
        height:30px;
        border:0;
        border-radius:9px;
        background:
          rgba(255,255,255,.05);
        color:#b9c5bd;
        font-size:21px;
        cursor:pointer;
      }

      /* ================= 导航 ================= */

      #${HOST_ID} .pqi-nav {
        display:flex;
        gap:3px;
        padding:8px 10px 0;
      }

      #${HOST_ID} .pqi-nav button {
        flex:1;
        min-width:0;
        padding:7px 2px;

        border:0;
        background:transparent;

        color:
          rgba(215,230,222,.45);

        font-size:11px;
        border-radius:8px;

        cursor:pointer;
      }

      #${HOST_ID} .pqi-nav button.active {
        color:#dfeae2;
        background:
          rgba(121,148,133,.14);
      }

      /* ================= 内容 ================= */

      #${HOST_ID} .pqi-main {
        flex:1;
        min-height:0;

        overflow-y:auto;

        padding:10px;

        scrollbar-width:none;
      }

      #${HOST_ID} .pqi-main::-webkit-scrollbar {
        display:none;
      }

      /* ================= 卡片 ================= */

      #${HOST_ID} .pqi-card {
        margin-bottom:10px;
        padding:12px;

        border-radius:13px;

        background:
          rgba(215,230,222,.045);

        border:
          1px solid
          rgba(215,230,222,.07);
      }

      #${HOST_ID} .pqi-card-title {
        margin-bottom:9px;
        padding-bottom:6px;

        border-bottom:
          1px dashed
          rgba(121,148,133,.22);

        color:#91aa99;

        font-size:11px;
        font-weight:700;
        letter-spacing:.5px;
      }

      #${HOST_ID} .pqi-card-body {
        font-size:12px;
        line-height:1.55;
      }

      #${HOST_ID} .pqi-info {
        color:#b9c5bd;
        font-size:11px;
        line-height:1.6;
        margin-bottom:4px;
      }

      /* ================= 指令按钮 ================= */

      #${HOST_ID} .pqi-cmd {
        width:100%;

        display:flex;
        align-items:center;

        gap:9px;

        margin-bottom:7px;
        padding:9px 10px;

        border-radius:9px;

        border:
          1px solid
          rgba(121,148,133,.18);

        background:
          rgba(121,148,133,.075);

        color:#e2efe7;

        text-align:left;

        cursor:pointer;

        font-size:12px;
      }

      #${HOST_ID} .pqi-cmd:active {
        transform:scale(.985);
        background:
          rgba(121,148,133,.16);
      }

      #${HOST_ID} .pqi-icon {
        width:22px;
        flex:none;
        text-align:center;
      }

      #${HOST_ID} .pqi-cmd strong {
        font-weight:500;
      }

      /* ================= 标签 ================= */

      #${HOST_ID} .pqi-tags {
        display:flex;
        flex-wrap:wrap;
        gap:4px;
        margin-bottom:7px;
      }

      #${HOST_ID} .pqi-tags span {
        padding:2px 6px;
        border-radius:5px;

        background:
          rgba(121,148,133,.11);

        color:#9caf9f;
        font-size:9px;
      }

      /* ================= 音乐 ================= */

      #${HOST_ID} .pqi-now {
        padding:9px;
        margin-bottom:10px;

        text-align:center;

        color:#dfeae2;
        font-size:12px;

        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      #${HOST_ID} .pqi-music-controls {
        display:flex;
        align-items:center;
        justify-content:center;
        gap:18px;
        margin-bottom:13px;
      }

      #${HOST_ID} .pqi-music-button {
        width:38px;
        height:38px;

        border-radius:10px;

        border:
          1px solid
          rgba(121,148,133,.3);

        background:
          rgba(121,148,133,.05);

        color:#dbe7df;

        cursor:pointer;

        font-size:15px;
      }

      #${HOST_ID} .pqi-music-button.pqi-play {
        width:44px;
        height:44px;
        font-size:17px;
      }

      #${HOST_ID} .pqi-progress-bar {
        position:relative;
        width:100%;
        height:5px;

        border-radius:5px;

        background:
          rgba(215,230,222,.1);

        cursor:pointer;
      }

      #${HOST_ID} .pqi-progress-fill {
        position:absolute;
        left:0;
        top:0;
        height:100%;
        width:0%;

        border-radius:5px;

        background:
          linear-gradient(
            90deg,
            #799485,
            #e2efe7
          );
      }

      #${HOST_ID} .pqi-progress-thumb {
        position:absolute;

        top:50%;
        left:0%;

        width:10px;
        height:10px;

        transform:
          translate(-50%,-50%);

        border-radius:50%;

        background:#9caf9f;
      }

      #${HOST_ID} .pqi-time {
        display:flex;
        justify-content:space-between;

        margin-top:6px;

        color:
          rgba(215,230,222,.4);

        font-size:9px;
      }

      #${HOST_ID} .pqi-song-list {
        max-height:190px;
        overflow-y:auto;
      }

      #${HOST_ID} .pqi-song {
        width:100%;

        margin-bottom:5px;
        padding:8px 10px;

        border-radius:8px;

        border:
          1px solid
          rgba(215,230,222,.08);

        background:
          rgba(215,230,222,.03);

        color:#b9c5bd;

        text-align:left;

        cursor:pointer;

        font-size:11px;
      }

      #${HOST_ID} .pqi-song.active {
        color:#e2efe7;

        background:
          rgba(121,148,133,.17);

        border-color:
          rgba(121,148,133,.4);
      }

      /* ================= 南京地点 ================= */

      #${HOST_ID} .pqi-place-list {
        display:flex;
        flex-wrap:wrap;
        gap:5px;
      }

      #${HOST_ID} .pqi-place-list span {
        padding:4px 7px;

        border-radius:6px;

        background:
          rgba(215,230,222,.045);

        color:#b9c5bd;

        font-size:10px;
      }

      /* ================= 底部 ================= */

      #${HOST_ID} .pqi-footer {
        padding:
          6px 12px 9px;

        text-align:right;

        color:
          rgba(215,230,222,.2);

        font-size:8px;
      }

      /* ================= 手机 ================= */

      @media (max-width:600px) {

        #${HOST_ID} .pqi-panel {
          width:
            min(
              330px,
              calc(100vw - 18px)
            );

          max-height:
            calc(100vh - 95px);
        }

      }

      @media (max-width:380px) {

        #${HOST_ID} .pqi-panel {
          width:
            calc(100vw - 12px);
        }

        #${HOST_ID} .pqi-nav button {
          font-size:10px;
        }

      }

    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     当前角色变化
     ========================================================= */

  function updateVisibility() {

    const host =
      document.getElementById(HOST_ID);

    if (!isTarget()) {

      if (host) {

        if (audio) {
          try {
            audio.pause();
          } catch {}
        }

        host.remove();
      }

      return;
    }

    injectCSS();
    make();
  }

  /* =========================================================
     监听酒馆角色切换
     ========================================================= */

  function bindEvents() {

    try {

      const ctx =
        getContext();

      if (
        ctx?.eventSource &&
        ctx?.event_types
      ) {

        const events = [
          'CHAT_CHANGED',
          'CHARACTER_MESSAGE_RENDERED',
          'MESSAGE_RECEIVED'
        ];

        for (const name of events) {

          const type =
            ctx.event_types[name];

          if (type) {

            ctx.eventSource.on(
              type,
              () => {
                setTimeout(
                  updateVisibility,
                  100
                );
              }
            );

          }
        }
      }

    } catch {}
  }

  /* =========================================================
     初始化
     ========================================================= */

  function init() {

    injectCSS();

    updateVisibility();

    bindEvents();

    /*
      每 1.5 秒检查一次当前角色，
      防止某些酒馆版本没有正常发事件。
    */

    setInterval(
      updateVisibility,
      1500
    );
  }

  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once:true }
    );

  } else {

    init();

  }

})();

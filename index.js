// ==UserScript==
// @name         知乎修改器移动版-持续更新
// @namespace    http://tampermonkey.net/
// @version      2.3.1
// @description  知乎修改器的移动版：首页可持续加载内容，回答可以查看全部回答和评论，文章可以查看全部评论，回答内容、文章、评论可直接点赞、反对，去除禁止复制的限制，列表标题类别显示功能设置，收起按钮悬浮设置，列表、问题详情、回答、文章内容置顶创建和修改时间设置，一键获取内容链接设置，问题详情添加查看问题日志按钮，自定义样式，隐藏模块，缓存列表和浏览历史记录等功能。
// @compatible   edge Violentmonkey
// @compatible   edge Tampermonkey
// @compatible   chrome Violentmonkey
// @compatible   chrome Tampermonkey
// @compatible   firefox Violentmonkey
// @compatible   firefox Tampermonkey
// @author       liuyubing
// @license      MIT
// @match        *://*.zhihu.com/*
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

"use strict";
(() => {
  var dom = (n2) => document.querySelector(n2);
  var domById = (id) => document.getElementById(id);
  var domA = (n2) => document.querySelectorAll(n2);
  var domC = (name, attrObjs) => {
    const node = document.createElement(name);
    for (let key in attrObjs) {
      node[key] = attrObjs[key];
    }
    return node;
  };
  var domP = (node, attrName, attrValue) => {
    const nodeP = node.parentElement;
    if (!nodeP)
      return void 0;
    if (!attrName || !attrValue)
      return nodeP;
    if (nodeP === document.body)
      return void 0;
    const attrValueList = (nodeP.getAttribute(attrName) || "").split(" ");
    return attrValueList.includes(attrValue) ? nodeP : domP(nodeP, attrName, attrValue);
  };
  var insertAfter = (newElement, targetElement) => {
    const parent = targetElement.parentNode;
    if (parent.lastChild === targetElement) {
      parent.appendChild(newElement);
    } else {
      parent.insertBefore(newElement, targetElement.nextSibling);
    }
  };
  var fnReturnStr = (str, isHave = false, strFalse = "") => isHave ? str : strFalse;
  var fnInitDomStyle = (id, innerHTML) => {
    const element = domById(id);
    element ? element.innerHTML = innerHTML : document.head.appendChild(domC("style", { id, type: "text/css", innerHTML }));
  };
  function throttle(fn, time = 300) {
    let tout = void 0;
    return function() {
      if (tout)
        return;
      tout = setTimeout(() => {
        tout = void 0;
        fn.apply(this, arguments);
      }, time);
    };
  }
  var copy = async (value) => {
    if (navigator.clipboard && navigator.permissions) {
      await navigator.clipboard.writeText(value);
    } else {
      const domTextarea = domC("textArea", {
        value,
        style: "width: 0px;position: fixed;left: -999px;top: 10px;"
      });
      domTextarea.setAttribute("readonly", "readonly");
      document.body.appendChild(domTextarea);
      domTextarea.select();
      document.execCommand("copy");
      document.body.removeChild(domTextarea);
    }
  };
  var messageDoms = [];
  var message = (value, t2 = 3e3) => {
    const time = +/* @__PURE__ */ new Date();
    const classTime = `ctz-message-${time}`;
    const nDom = domC("div", {
      innerHTML: value,
      className: `ctz-message ${classTime}`
    });
    const domBox = domById("CTZ_MESSAGE_BOX");
    if (!domBox)
      return;
    domBox.appendChild(nDom);
    messageDoms.push(nDom);
    if (messageDoms.length > 3) {
      const prevDom = messageDoms.shift();
      prevDom && domBox.removeChild(prevDom);
    }
    setTimeout(() => {
      const nPrevDom = dom(`.${classTime}`);
      if (nPrevDom) {
        domById("CTZ_MESSAGE_BOX").removeChild(nPrevDom);
        messageDoms.shift();
      }
    }, t2);
  };
  var hexToRgba = (hex, opacity) => {
    return "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt("0x" + hex.slice(5, 7)) + "," + opacity + ")";
  };
  var nodesStopPropagation = (names, fnArr = [], type = "click") => {
    let nodeArray = [];
    names.forEach((item) => {
      nodeArray = nodeArray.concat(Array.prototype.slice.call(domA(item)));
    });
    for (let i2 = 0, len = nodeArray.length; i2 < len; i2++) {
      nodeArray[i2].addEventListener(type, (event) => {
        event.stopPropagation();
        fnArr.forEach((fn) => {
          fn(event);
        });
      });
    }
  };
  var fnLog = (...str) => console.log("%c「修改器」", "color: green;font-weight: bold;", ...str);
  var HTML_HOOTS = ["www.zhihu.com", "zhuanlan.zhihu.com"];
  var ID_CTZ_COMMENT = "CTZ_COMMENT";
  var ID_CTZ_COMMENT_CHILD = "CTZ_COMMENT_CHILD";
  var ID_CTZ_COMMENT_CLOSE = "CTZ_BUTTON_COMMENT_CLOSE";
  var ID_CTZ_COMMENT_BACK = "CTZ_BOTTOM_COMMENT_BACK";
  var CLASS_INPUT_CLICK = "ctz-i";
  var CLASS_INPUT_CHANGE = "ctz-i-change";
  var CLASS_TIME_ITEM = "ctz-list-item-time";
  var CLASS_COPY_LINK = "ctz-copy-link";
  var EXTRA_CLASS_HTML = {
    "zhuanlan.zhihu.com": "zhuanlan",
    "www.zhihu.com": "zhihu"
  };
  var HEADER = [
    { href: "#CTZ_BASIS", value: "基础设置" },
    { href: "#CTZ_HIDDEN", value: "隐藏模块" },
    { href: "#CTZ_FILTER", value: "屏蔽内容" },
    // { href: '#CTZ_BLOCK_WORD', value: '屏蔽词' },
    // { href: '#CTZ_BLACKLIST', value: '黑名单' },
    { href: "#CTZ_HISTORY", value: "历史记录" }
    // { href: '#CTZ_DEFAULT', value: '默认功能' },
  ];
  var THEMES = [
    { label: "浅色", value: "0" /* 浅色 */, background: "#fff", color: "#000" },
    { label: "深色", value: "1" /* 深色 */, background: "#000", color: "#fff" },
    { label: "自动", value: "2" /* 自动 */, background: "linear-gradient(to right, #fff, #000)", color: "#000" }
  ];
  var THEME_CONFIG_LIGHT = {
    ["0" /* 默认 */]: { name: "默认", background: "#ffffff", background2: "" },
    ["1" /* 红 */]: { name: "红", background: "#ffe4c4", background2: "#fff4e7" },
    ["2" /* 黄 */]: { name: "黄", background: "#faf9de", background2: "#fdfdf2" },
    ["3" /* 绿 */]: { name: "绿", background: "#cce8cf", background2: "#e5f1e7" },
    ["4" /* 灰 */]: { name: "灰", background: "#eaeaef", background2: "#f3f3f5" },
    ["5" /* 紫 */]: { name: "紫", background: "#e9ebfe", background2: "#f2f3fb" }
  };
  var THEME_CONFIG_DARK = {
    ["0" /* 默认 */]: { name: "默认", color: "#fff", background: "#121212", background2: "#333333" },
    ["1" /* 夜间护眼一 */]: { name: "夜间护眼一", color: "#f7f9f9", background: "#15202b", background2: "#38444d" },
    ["2" /* 夜间护眼二 */]: { name: "夜间护眼二", color: "#f7f9f9", background: "#1f1f1f", background2: "#303030" },
    ["3" /* 夜间护眼三 */]: { name: "夜间护眼三", color: "#f7f9f9", background: "#272822", background2: "#383932" }
  };
  var INPUT_NAME_THEME = "theme";
  var INPUT_NAME_THEME_DARK = "themeDark";
  var INPUT_NAME_ThEME_LIGHT = "themeLight";
  var VoteTypeOb = {
    [0 /* 赞同 */]: {
      ["answers" /* 回答 */]: '{"type":"up"}',
      ["articles" /* 文章 */]: '{"voting":1}',
      ["zvideos" /* 视频 */]: '{"voting":1}'
    },
    [1 /* 中立 */]: {
      ["answers" /* 回答 */]: '{"type":"neutral"}',
      ["articles" /* 文章 */]: '{"voting":0}',
      ["zvideos" /* 视频 */]: '{"voting":0}'
    },
    [2 /* 反对 */]: {
      ["answers" /* 回答 */]: '{"type":"down"}',
      ["articles" /* 文章 */]: '{"voting":-1}',
      ["zvideos" /* 视频 */]: '{"voting":-1}'
    }
  };
  var NAME_CONFIG = "mobileConfig";
  var NAME_HISTORY = "mobileHistory";
  var HISTORY_DEFAULT = {
    view: [],
    list: []
  };
  var CONFIG_HIDDEN_DEFAULT = {
    hiddenOpenApp: true,
    hiddenReadMoreText: true,
    hiddenReward: true,
    hiddenAD: true,
    hiddenBottomSticky: true
  };
  var CONFIG_FILTER_DEFAULT = {
    removeZhihuOfficial: true,
    removeAnonymousAnswer: false,
    removeFromYanxuan: true,
    removeUnrealAnswer: true,
    removeFromEBook: true,
    removeStoryAnswer: true,
    removeYanxuanAnswer: true,
    removeYanxuanRecommend: true,
    removeYanxuanCPRecommend: true,
    hiddenAnswerYanxuanRecommend: true
  };
  var CONFIG_DEFAULT = {
    ...CONFIG_HIDDEN_DEFAULT,
    ...CONFIG_FILTER_DEFAULT,
    openButtonTop: 100,
    openButtonLeft: 0,
    questionTitleTag: true,
    releaseTimeForList: true,
    releaseTimeForAnswer: true,
    releaseTimeForQuestion: true,
    releaseTimeForArticle: true,
    theme: "2" /* 自动 */,
    themeLight: "0" /* 默认 */,
    themeDark: "1" /* 夜间护眼一 */,
    copyAnswerLink: true,
    showQuestionLog: true,
    showAllContent: true,
    showToAnswer: true,
    showIP: true
  };
  var SAVE_HISTORY_NUMBER = 500;
  var HIDDEN_ANSWER_TAG = {
    removeFromYanxuan: "盐选专栏",
    // removeUnrealAnswer: '虚构创作',
    removeFromEBook: "电子书"
  };
  var HIDDEN_ANSWER_ACCOUNT = {
    removeStoryAnswer: "故事档案局",
    removeYanxuanAnswer: "盐选科普",
    removeYanxuanRecommend: "盐选推荐",
    removeYanxuanCPRecommend: "盐选测评室"
  };
  var HIDDEN_ARRAY = [
    [{ value: "hiddenAD", label: "广告" }],
    [
      { value: "hiddenOpenApp", label: "隐藏跳转APP的提示和按钮" },
      { value: "hiddenReward", label: "隐藏赞赏按钮" }
    ],
    [
      { value: "hiddenLogo", label: "隐藏LOGO" },
      { value: "hiddenHeader", label: "隐藏顶部悬浮模块" },
      { value: "hiddenBottomSticky", label: "隐藏进入回答页面时的底部操作栏" },
      { value: "hiddenCommitImg", label: "隐藏评论区图片" }
    ],
    [
      { value: "hiddenAnswers", label: "隐藏列表回答内容" },
      { value: "hiddenListVideoContent", label: "隐藏列表视频回答的内容" },
      { value: "hiddenListImg", label: "隐藏列表图片" }
      // { value: 'hiddenReadMoreText', label: '隐藏列表「阅读全文」文字' },
    ],
    [
      { value: "hiddenItemActions", label: "隐藏列表回答操作栏" },
      { value: "hiddenAnswerItemActions", label: "隐藏详情回答操作栏" }
    ],
    [
      { value: "hiddenQuestionFollowing", label: "隐藏关注问题按钮" },
      { value: "hiddenQuestionAnswer", label: "隐藏问题写回答按钮" }
    ],
    [
      { value: "hiddenAnswerItemTime", label: "隐藏回答底部发布编辑时间和IP" },
      { value: "hiddenAnswerItemTimeButHaveIP", label: "隐藏回答底部发布编辑时间（保留IP）" }
    ],
    [
      { value: "hiddenDetailAvatar", label: "隐藏回答人头像" },
      { value: "hiddenDetailName", label: "隐藏回答人姓名" },
      { value: "hiddenDetailBadge", label: "隐藏回答人简介" },
      { value: "hiddenDetailVoters", label: "隐藏回答人下赞同数" },
      { value: "hiddenWhoVoters", label: "隐藏回答人下 你赞同过、XXX赞同了 等信息" }
    ],
    [
      { value: "hiddenZhuanlanAvatarWrapper", label: "隐藏文章作者头像" },
      { value: "hiddenZhuanlanAuthorInfoHead", label: "隐藏文章作者姓名" },
      { value: "hiddenZhuanlanAuthorInfoDetail", label: "隐藏文章作者简介" },
      { value: "hiddenZhuanlanFollowButton", label: "隐藏文章作者关注按钮" },
      { value: "hiddenZhuanlanTitleImage", label: "隐藏文章标题图片" },
      { value: "hiddenZhuanlanImage", label: "隐藏文章内容图片" },
      { value: "hiddenZhuanlanActions", label: "隐藏文章底部悬浮操作栏" }
    ],
    [
      { value: "hiddenAnswerYanxuanRecommend", label: "隐藏回答页盐选推荐" },
      { value: "hiddenAnswerRelatedRecommend", label: "隐藏回答页相关推荐" },
      { value: "hiddenAnswerHotRecommend", label: "隐藏回答页热门推荐" }
    ]
  ];
  var BASIC_SHOW_CONTENT = [
    { label: "隐藏修改器唤起按钮，可在脚本菜单<b>⚙️ 设置</b>打开", value: "openButtonInvisible" },
    { label: "<b>回答、文章</b>显示完整内容和评论", value: "showAllContent" },
    {
      label: `<b>列表</b>标题类别显示<span class="ctz-label-tag ctz-label-tag-Answer">问答</span><span class="ctz-label-tag ctz-label-tag-Article">文章</span><span class="ctz-label-tag ctz-label-tag-ZVideo">视频</span><span class="ctz-label-tag ctz-label-tag-Pin">想法</span>`,
      value: "questionTitleTag",
      needFetch: false
    },
    // { label: '<b>收起</b>按钮悬浮', value: 'suspensionPickup' },
    { label: "<b>列表</b>内容置顶创建和修改时间", value: "releaseTimeForList" },
    { label: "<b>问题详情</b>置顶创建和修改时间", value: "releaseTimeForQuestion" },
    { label: "<b>问题详情回答</b>置顶创建和修改时间", value: "releaseTimeForAnswer" },
    { label: "<b>文章</b>置顶创建时间", value: "releaseTimeForArticle" },
    { label: "一键获取内容链接", value: "copyAnswerLink" },
    { label: "<b>列表</b>显示直达问题按钮", value: "showToAnswer" },
    { label: "<b>问题详情</b>显示<b>查看问题日志</b>按钮", value: "showQuestionLog" },
    { label: "<b>评论</b>顺序、关闭操作栏置于底部", value: "commentHeaderToBottom" },
    { label: "显示用户IP（存在历史回答IP缺失的情况）", value: "showIP" }
  ];
  var myStorage = {
    set: async function(name, value) {
      value.t = +/* @__PURE__ */ new Date();
      const v = JSON.stringify(value);
      localStorage.setItem(name, v);
      await GM.setValue(name, v);
    },
    get: async function(name) {
      const config = await GM.getValue(name);
      const configLocal = localStorage.getItem(name);
      const cParse = config ? JSON.parse(config) : null;
      const cLParse = configLocal ? JSON.parse(configLocal) : null;
      if (!cParse && !cLParse)
        return "";
      if (!cParse)
        return configLocal;
      if (!cLParse)
        return config;
      if (cParse.t < cLParse.t)
        return configLocal;
      return config;
    },
    getConfig: async function() {
      const nConfig = await this.get(NAME_CONFIG);
      const c2 = nConfig ? JSON.parse(nConfig) : {};
      const configSave = { ...CONFIG_DEFAULT, ...c2 };
      return Promise.resolve(configSave);
    },
    getHistory: async function() {
      const nHistory = await myStorage.get(NAME_HISTORY);
      const h2 = nHistory ? JSON.parse(nHistory) : HISTORY_DEFAULT;
      return Promise.resolve(h2);
    },
    /** 修改配置中的值 */
    updateConfig: async function(key, value) {
      const config = await this.getConfig();
      if (typeof key === "string") {
        config[key] = value;
      } else {
        for (let itemKey in key) {
          config[itemKey] = key[itemKey];
        }
      }
      await this.set(NAME_CONFIG, config);
    },
    /** 更新配置 */
    setConfig: async function(params) {
      await this.set(NAME_CONFIG, params);
    },
    setHistoryItem: async function(key, params) {
      const pfHistory = await this.getHistory();
      pfHistory[key] = params.slice(0, SAVE_HISTORY_NUMBER);
      await this.set(NAME_HISTORY, pfHistory);
    },
    setHistory: async function(value) {
      this.set(NAME_HISTORY, value);
    }
  };
  var myBackground = {
    init: async function() {
      const { themeDark = "1" /* 夜间护眼一 */, themeLight = "0" /* 默认 */ } = await myStorage.getConfig();
      const innerHTML = await this.change(themeDark, themeLight);
      fnInitDomStyle("CTZ_STYLE_BACKGROUND", innerHTML);
    },
    change: async function(themeDark, themeLight) {
      const getBackground = async () => {
        const isD = await this.isUseDark();
        if (isD)
          return this.dark(themeDark);
        if (themeLight === "0" /* 默认 */)
          return this.default();
        return this.light(themeLight);
      };
      const strBg = await getBackground();
      const strText = await this.text();
      return strBg + strText;
    },
    isUseDark: async () => {
      const { theme = "2" /* 自动 */ } = await myStorage.getConfig();
      if (theme === "2" /* 自动 */) {
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
        return prefersDarkScheme.matches;
      }
      return theme === "1" /* 深色 */;
    },
    default: () => ".GlobalSideBar-navList{background: #fff}",
    dark: function(darkKey) {
      const { background, background2, color } = THEME_CONFIG_DARK[darkKey];
      const whiteText = `#CTZ_DIALOG,.ctz-message,#CTZ_MAIN input,#CTZ_MAIN textarea,.ctz-footer,#CTZ_CLOSE_DIALOG,.ctz-commit,#CTZ_OPEN_BUTTON,.KfeCollection-VipRecommendCard-content,.KfeCollection-VipRecommendCard-title,#CTZ_DIALOG textarea,#CTZ_DIALOG .ctz-button,.ctz-button.ctz-button-transparent,body,.zu-top-nav-link,.CommentContent,[data-za-detail-view-path-module="CommentList"] div,.CommentsForOia div,.ctz-suspension-pickup,.zm-ac-link,.css-10noe4n,.css-3ny988,.css-hmd01z,.css-z0cc58,.css-7aa3bk,.css-1965tpd,.css-b574el,.css-1jg6wq6,textarea.zg-form-text-input,.zg-form-text-input>textarea,.css-1eglonx,.css-1tip2bd,.css-1symrae,.css-u3vsx3>div,.zm-editable-editor-field-wrap,.zu-question-suggest-topic-input,.zg-form-text-input,.zg-form-select,.css-10u695f,.css-r4op92{color: ${color}!important}`;
      const linkText = `.RelevantQuery li,.modal-dialog a,.zhi a,.ctz-n-button-expend,.VoteButton,.ContentItem-more,.QuestionMainAction,a.UserLink-link,.RichContent--unescapable.is-collapsed .ContentItem-rightButton,.ContentItem-title a:hover,.css-b7erz1,.css-1vbwaf6,.css-1jj6qre,.css-jf1cpf,.css-vphnkw,.css-1icigob{color: deepskyblue!important;}`;
      const addPrefix = (i2) => {
        return i2.split(",").map((i3) => `html[data-theme=dark] ${i3}`).join(",");
      };
      const darkTransparentBg = `.ColumnHomeTop:before,.ColumnHomeBottom{background: transparent!important;}`;
      return addPrefix(this.doSetCSS(background, background2) + whiteText + linkText + darkTransparentBg) + this.doSetCSSInCTZ(background, background2) + `.MobileAppHeader-expandBackdrop{background: ${hexToRgba(background, 0.65)}!important;}`;
    },
    light: function(lightKey) {
      const { background, background2 } = THEME_CONFIG_LIGHT[lightKey];
      return this.doSetCSS(background, background2) + this.doSetCSSInCTZ(background, background2);
    },
    /** 设置字体颜色 */
    text: async function() {
      const { colorText1 } = await myStorage.getConfig();
      const styleColorText1 = `.ContentItem-title, body{color: ${colorText1}!important;}`;
      return colorText1 ? styleColorText1 : "";
    },
    /** 知乎内元素样式设置 */
    doSetCSS: function(background, background2) {
      const cssBg = `${this.cssNamesBackground1}{background-color: ${background}!important;background:${background}!important;}`;
      const cssBg2 = `${this.cssNamesBackground2}{background-color:${background2}!important;background:${background2}!important;}`;
      const cssJustBGC2 = `${this.useCSSJustBGC2}{background-color: ${background2}!important;}`;
      const cssBgTransparent = `${this.cssNamesBackgroundTransparent}{background-color: transparent!important;background: transparent!important;}`;
      const loadingStyle = `.css-w2vj5n{background: ${background}!important;color: ${background2}!important;}`;
      const borderBg = `.KfeCollection-VipRecommendCard-article{border-color: ${background}!important;}`;
      return cssBg + cssBg2 + cssBgTransparent + loadingStyle + borderBg + cssJustBGC2;
    },
    /** 修改器样式设置（不需要添加前缀） */
    doSetCSSInCTZ: function(background, background2) {
      const menuTopBeforeAfter = `.ctz-menu>a.target::after,.ctz-menu>a.target::before{${this.menuBeforeAfter(background2)}}`;
      const openButton = `#CTZ_OPEN_BUTTON{background: ${background}!important;}`;
      return menuTopBeforeAfter + openButton;
    },
    /** 使用背景色1的元素名称 */
    cssNamesBackground1: `#CTZ_DIALOG,#CTZ_BASIS_SHOW label b,.ctz-suspension-pickup,.ctz-content-top a.target,.ctz-message,#CTZ_DIALOG textarea,#CTZ_DIALOG .ctz-button,body,.App,.MobileAppHeader-searchBox,.Input-wrapper,.VideoAnswerPlayer-stateBar,.ColumnHomeColumnCard,.Toast-root-tU3yo,.AuthorsSection-author-tFZJF,.editable,textarea.zg-form-text-input,.zg-form-text-input>textarea,.ac-active,.PagingButton,[data-tooltip="回到顶部"],.css-d1dtt9,.css-k8i00s,.css-41c1px,.zm-editable-editor-field-wrap,.zu-question-suggest-topic-input,.zg-form-text-input,.zg-form-select,.css-4lspwd,.zu-top`,
    /** 使用背景色2的元素名称 */
    cssNamesBackground2: `.ctz-content,.ctz-menu>a.target,.Card,.Sticky,.ContentItem-more,.ContentItem-actions,.Popover-content,.Popover-arrow:after,.MobileAppHeader-expand,.CommentsForOia>div,.KfeCollection-VipRecommendCard,.OpenInAppButton>div,.Modal-inner,.MobileSearch-container,.ProfileBar,.MobileAppHeader,.ZVideo-mobile,.Post-content,.sgui-header,.MobileCollectionsHeader-tabs,.MobileModal-title--default,.MobileModal,.List-item,.Login,.Input-wrapper.SignFlow-accountInput,.SignFlowInput .Input-wrapper,.SearchTabs,.MobileEmptyPageWithType,.TopicHot-Header,.Favlists-mobileActions,[data-za-detail-view-path-module="SearchResultList"]>div,[data-za-detail-view-path-module="SearchResultList"]>div>a,.SearchSubTabs,.KfeCollection-PcCollegeCard-root,.modal-dialog,.ac-renderer,.css-hplpcn,.zh-add-question-form .add-question-splash-page .ac-renderer .ac-row.ac-last,.HeaderInfo-infoCard-orDxs,.Common-content-893LU,.ContentModule-module-9gTaH,.NewBottomBar-root-dVXzD,.AuthorModule-root-rxFMb,.css-w0m1iq,.zu-autocomplete-row-label,.ac-row.zu-autocomplete-row-search-link,.PostItem,.Recommendations-Main,.ErrorPage,.css-1e7fksk,.css-1gfesro,.css-ud510h,.css-vb0amv,.css-t89z5u,.css-u3vsx3>div,.css-5k4zcx,.css-13heq6w,.css-13heq6w>a,.css-1eltcns,.css-yoby3j,.css-l63y2t,.css-173civf,.css-1nalx0p,.css-mn9570,.css-4r7szo,.css-vkey2q,.css-ugzr12,.css-6v1k3,.css-1xj1964,.css-ggid2,.css-rhbxt0,.css-1j23ebo,.css-7wvdjh,.css-kt4t4n,#CTZ_COMMENT,#CTZ_COMMENT_CHILD,.mobile-top-nav-popup .top-nav-dropdown,.zm-item-tag,.mobile-top-nav-popup .top-nav-dropdown a`,
    useCSSJustBGC2: `.slide-up`,
    /** 背景色透明的元素名称 */
    cssNamesBackgroundTransparent: `.ContentItem-more:before`,
    cssNamesColorUserBackground1: ``,
    menuBeforeAfter: (color, size = "12px") => {
      return `background: radial-gradient(circle at top left, transparent ${size}, ${color} 0) top left,
    radial-gradient(circle at top right, transparent ${size}, ${color} 0) top right,
    radial-gradient(circle at bottom right, transparent ${size}, ${color} 0) bottom right,
    radial-gradient(circle at bottom left, transparent ${size}, ${color} 0) bottom left;
    background-size: 50% 50%;
    background-repeat: no-repeat;`;
    }
  };
  var myCustomStyle = {
    init: async function() {
      const nodeCustomStyle = dom('[name="textStyleCustom"]');
      if (!nodeCustomStyle)
        return;
      const { customizeCss = "" } = await myStorage.getConfig();
      nodeCustomStyle.value = customizeCss;
      this.change(customizeCss);
    },
    change: (innerCus) => fnInitDomStyle("CTZ_STYLE_CUSTOM", innerCus)
  };
  var onUseThemeDark = async () => {
    const isD = await isDark();
    dom("html").setAttribute("data-theme", isD ? "dark" : "light");
  };
  var loadFindTheme = () => {
    onUseThemeDark();
    const elementHTML = dom("html");
    const muConfig = { attribute: true, attributeFilter: ["data-theme"] };
    if (!elementHTML)
      return;
    const muCallback = async function() {
      const themeName = elementHTML.getAttribute("data-theme");
      const isD = await isDark();
      if (themeName === "dark" && !isD || themeName === "light" && isD) {
        onUseThemeDark();
      }
    };
    const muObserver = new MutationObserver(muCallback);
    muObserver.observe(elementHTML, muConfig);
  };
  var loadBackground = () => myBackground.init();
  var isDark = async () => await myBackground.isUseDark();
  var createItem = ({ label, value, background, color, inputName }) => `<label><input class="${CLASS_INPUT_CLICK}" name="${inputName}" type="radio" value="${value}"/><div style="background: ${background};color: ${color}">${label}</div></label>`;
  var createThemeHTML = (themeConfig, inputName) => {
    return Object.keys(themeConfig).map((key) => {
      const { background, color, name } = themeConfig[key];
      return createItem({ label: name, value: key, background, color, inputName });
    }).join("");
  };
  var addBackgroundElement = () => {
    domById("CTZ_BACKGROUND").innerHTML = THEMES.map((item) => createItem({ ...item, inputName: INPUT_NAME_THEME })).join("");
    domById("CTZ_BACKGROUND_LIGHT").innerHTML = createThemeHTML(THEME_CONFIG_LIGHT, INPUT_NAME_ThEME_LIGHT);
    domById("CTZ_BACKGROUND_DARK").innerHTML = createThemeHTML(THEME_CONFIG_DARK, INPUT_NAME_THEME_DARK);
  };
  var myMenu = {
    init: function() {
      const { hash } = location;
      const nodeMenuTop = dom(".ctz-menu");
      if (!nodeMenuTop)
        return;
      const chooseId = [...nodeMenuTop.children].map((i2) => i2.hash).find((i2) => i2 === hash || hash.replace(i2, "") !== hash);
      this.click({ target: dom(`a[href="${chooseId || HEADER[0].href}"]`) });
    },
    /** 选择菜单 */
    click: function({ target }) {
      const targetForA = target.tagName === "A" ? target : target.parentElement;
      if (!(targetForA.hash && targetForA.tagName === "A"))
        return;
      const chooseId = targetForA.hash.replace(/#/, "");
      if (!chooseId)
        return;
      const nodesA = domA(".ctz-menu>a");
      for (let i2 = 0, len = nodesA.length; i2 < len; i2++) {
        nodesA[i2].classList.remove("target");
      }
      targetForA.classList.add("target");
      const nodesDiv = domA(".ctz-content>div");
      for (let i2 = 0, len = nodesDiv.length; i2 < len; i2++) {
        const item = nodesDiv[i2];
        item.style.display = chooseId === item.id ? "flex" : "none";
      }
      myMenu2.init(chooseId);
    }
  };
  var myMenu2 = {
    init: function(chooseId) {
      const domContentTop = dom(`#${chooseId} .ctz-content-top`);
      if (!domContentTop || !domContentTop.children || !domContentTop.children.length)
        return;
      const { hash } = location;
      const target = [...domContentTop.children].find((i2) => i2.hash === hash);
      this.click({ target: target || domContentTop.children[0] });
    },
    click: function({ target }) {
      const chooseId = target.hash.replace(/#/, "");
      if (!chooseId)
        return;
      const nodesA = target.parentElement.children;
      for (let i2 = 0, len = nodesA.length; i2 < len; i2++) {
        nodesA[i2].classList.remove("target");
      }
      target.classList.add("target");
      const nodesDiv = target.parentElement.parentElement.querySelectorAll(".ctz-content-center>div");
      for (let i2 = 0, len = nodesDiv.length; i2 < len; i2++) {
        const item = nodesDiv[i2];
        item.style.display = chooseId === item.id ? "block" : "none";
      }
    }
  };
  var positionOne = (position, max) => {
    if (position < 0)
      return 0;
    if (position > max)
      return max;
    return position;
  };
  var openButtonPosition = async () => {
    const { openButtonTop, openButtonLeft } = await myStorage.getConfig();
    const domFind = domById("CTZ_OPEN_BUTTON");
    if (!domFind)
      return;
    const maxLeft = window.innerWidth - domFind.offsetWidth;
    const maxTop = window.innerHeight - domFind.offsetHeight;
    const innerLeft = positionOne(openButtonLeft, maxLeft);
    const innerTop = positionOne(openButtonTop, maxTop);
    domFind.style.cssText += `top: ${innerTop}px; left: ${innerLeft}px;`;
    let startX = 0;
    let startY = 0;
    let x2 = 0;
    let y = 0;
    domFind.addEventListener("touchstart", function(e2) {
      startX = e2.targetTouches[0].pageX;
      startY = e2.targetTouches[0].pageY;
      x2 = this.offsetLeft;
      y = this.offsetTop;
      this.style.transition = "";
    });
    domFind.addEventListener("touchmove", function(e2) {
      let moveX = e2.targetTouches[0].pageX - startX;
      let moveY = e2.targetTouches[0].pageY - startY;
      const left = x2 + moveX;
      const top = y + moveY;
      this.style.left = positionOne(left, maxLeft) + "px";
      this.style.top = positionOne(top, maxTop) + "px";
      e2.preventDefault();
    });
    domFind.addEventListener("touchend", async function() {
      const left = this.offsetLeft > maxLeft / 2 ? maxLeft : 0;
      this.style.left = `${left}px`;
      this.style.transition = "all 0.5s";
      const top = this.offsetTop;
      await myStorage.updateConfig({
        openButtonTop: top,
        openButtonLeft: left
      });
    });
  };
  var INNER_HTML = `<div id="CTZ_DIALOG" style="display: none"><div class="ctz-header"><span class="ctz-version"></span><div class="ctz-top-operate"><!-- <span id="CTZ_FETCH_STATUS">状态获取中...</span><button class="ctz-button" id="CTZ_CHANGE_FETCH" size="small">切换接口拦截</button> --></div><button id="CTZ_CLOSE_DIALOG">✕</button></div><div class="ctz-menu"></div><div class="ctz-content"><div id="CTZ_BASIS" style="display: none"><div class="ctz-content-top"><a href="#CTZ_BASIS_SHOW">显示</a><a href="#CTZ_BASIS_BACKGROUND">颜色</a><a href="#CTZ_BASIS_SETTING">配置</a></div><div class="ctz-content-center"><div id="CTZ_BASIS_SHOW" style="display: none"></div><div id="CTZ_BASIS_BACKGROUND" style="display: none"><div class="ctz-set-background"><div class="fwb mt8 ctz-background-title">外观</div><div id="CTZ_BACKGROUND" class="ctz-background-content"></div><div class="fwb mt8 ctz-background-title">浅色设置</div><div id="CTZ_BACKGROUND_LIGHT" class="ctz-background-content"></div><div class="fwb mt8 ctz-background-title">深色设置</div><div id="CTZ_BACKGROUND_DARK" class="ctz-background-content"></div></div></div><div id="CTZ_BASIS_SETTING" style="display: none"><button class="ctz-button" name="configExport" style="margin-right: 8px">获取当前配置</button><button class="ctz-button" name="configReset">恢复默认配置</button><div class="ctz-hidden-item-br"></div><div class="ctz-config-import-box"><div>配置导入</div><textarea name="textConfigImport" placeholder="配置参考获取的格式"></textarea><button class="ctz-button" name="configImport">确 定</button></div><div class="ctz-hidden-item-br"></div><div class="ctz-config-import-box"><div>自定义样式</div><textarea name="textStyleCustom" placeholder="示例: body{background: #ffffff;}"></textarea><div class="ctz-btn-box"><button class="ctz-button" name="styleCustom" style="margin-right: 12px">确 定</button><button class="ctz-button" name="styleCustomReset">清 空</button></div></div></div></div></div><div id="CTZ_HIDDEN" style="display: none"><div class="ctz-content-center"></div></div><div id="CTZ_FILTER" style="display: none"><!-- <div class="ctz-content-top"></div> --><div class="ctz-content-center"><div class="ctz-filter-defail-who"><div class="ctz-label">屏蔽以下官方账号的回答</div><div style="margin: 4px 0; border-bottom: 1px solid #ebebeb; padding-bottom: 4px"><label><input class="ctz-i" name="removeZhihuOfficial" type="checkbox" value="on" />所有知乎官方账号</label></div><div class="ctz-flex-wrap" style="margin: 4px 0; border-bottom: 1px solid #ebebeb; padding-bottom: 4px"><label><input class="ctz-i" name="removeStoryAnswer" type="checkbox" value="on" />故事档案局</label><label><input class="ctz-i" name="removeYanxuanAnswer" type="checkbox" value="on" />盐选科普</label><label><input class="ctz-i" name="removeYanxuanRecommend" type="checkbox" value="on" />盐选推荐</label><label><input class="ctz-i" name="removeYanxuanCPRecommend" type="checkbox" value="on" />盐选测评室</label></div></div><div class="ctz-flex-wrap" style="margin: 4px 0; border-bottom: 1px solid #ebebeb; padding-bottom: 4px"><label><span class="ctz-label">屏蔽「匿名用户」回答</span><input class="ctz-i" name="removeAnonymousAnswer" type="checkbox" value="on" /></label></div><div class="ctz-filter-defail-tag"><div class="ctz-label">屏蔽带有以下标签的回答</div><div class="ctz-flex-wrap"><label><input class="ctz-i" name="removeFromYanxuan" type="checkbox" value="on" />选自盐选专栏</label><label><input class="ctz-i" name="removeUnrealAnswer" type="checkbox" value="on" />带有虚构创作</label><label><input class="ctz-i" name="removeFromEBook" type="checkbox" value="on" />选自电子书</label></div></div></div></div><div id="CTZ_BLACKLIST" style="display: none"><div class="ctz-content-top"></div><div class="ctz-content-center">CTZ_BLACKLIST</div></div><div id="CTZ_HISTORY" style="display: none"><div class="ctz-content-top"><a href="#CTZ_HISTORY_LIST">推荐列表缓存</a><a href="#CTZ_HISTORY_VIEW">浏览历史记录</a></div><div class="ctz-content-center"><div id="CTZ_HISTORY_LIST" style="display: none"><button class="ctz-button" name="buttonHistoryClear" data-id="list">清空列表缓存</button><div class="ctz-set-content"></div><div class="ctz-commit ta-c mt8">--- 最多缓存500条，包含已过滤项 ---</div></div><div id="CTZ_HISTORY_VIEW" style="display: none"><button class="ctz-button" name="buttonHistoryClear" data-id="view">清空历史记录</button><div class="ctz-set-content"></div><div class="ctz-commit ta-c mt8">--- 最多缓存500条 ---</div></div></div></div></div><div class="ctz-footer"><a href="https://github.com/liuyubing233/zhihu-custom-mobile" target="_blank">Github⭐</a><a href="https://greasyfork.org/zh-CN/scripts/488508-%E7%9F%A5%E4%B9%8E%E4%BF%AE%E6%94%B9%E5%99%A8%E7%A7%BB%E5%8A%A8%E7%89%88-%E6%8C%81%E7%BB%AD%E6%9B%B4%E6%96%B0" target="_blank">GreasyFork</a></div></div><div id="CTZ_OPEN_BUTTON">⚙︎</div><div id="CTZ_MESSAGE_BOX"></div><div id="CTZ_LOADING_TOAST" style="display: none"><div class="ctz-loading-toast-icon"><span>↻</span></div><div class="ctz-loading-toast-text">加载中...</div></div><div id="CTZ_COMMENT" style="display: none"><div class="ctz-comment-header"><div class="ctz-comment-header-left"><div class="ctz-comment-count"><span>0</span>条评论</div><div class="ctz-comment-sort"><button name="score">默认</button><button name="ts">最新</button></div></div><button class="ctz-comment-btn" id="CTZ_BUTTON_COMMENT_CLOSE">✕</button></div><div class="ctz-comment-content"><div class="ctz-comment-list"></div></div></div><div id="CTZ_COMMENT_CHILD" style="display: none"><div class="ctz-comment-header"><button class="ctz-comment-btn" id="CTZ_BOTTOM_COMMENT_BACK">◀︎ 评论回复</button></div><div class="ctz-comment-content"><div class="ctz-comment-list"></div></div></div><div style="display: none" class="ctz-preview" id="CTZ_PREVIEW_IMAGE"><div><img src="" /></div></div>`;
  var INNER_CSS = `@keyframes rotate{from{transform:translate(-50%, -50%) rotate(0deg)}to{transform:translate(-50%, -50%) rotate(360deg)}}.hover-style{cursor:pointer}.hover-style:hover{color:#1677ff !important}.ctz-btn-box{display:flex}.ctz-btn-box button{flex:1;margin-right:12px}.ctz-btn-box button:last-child{margin:0}.ctz-desc,.ctz-commit{font-size:14px;color:#999}.ctz-desc b,.ctz-commit b{color:#e55353}.ctz-desc{padding-left:4px}.dis-if-c{display:inline-flex;align-items:center}.ta-c{text-align:center}.fwb{font-weight:bold}.mt8{margin-top:8px}.bg-ec7259{background:#ec7259}.bg-12c2e9{background:#12c2e9}.bg-00965e{background:#00965e}.bg-9c27b0{background:#9c27b0}.c-ec7259{color:#ec7259}.c-12c2e9{color:#12c2e9}.c-00965e{color:#00965e}.c-9c27b0{color:#9c27b0}.ctz-button{box-sizing:border-box;outline:none;position:relative;display:inline-block;font-weight:400;white-space:nowrap;text-align:center;border:1px solid transparent;cursor:pointer;transition:all .3s;user-select:none;touch-action:manipulation;font-size:14px;padding:4px 15px;border-radius:4px;background-color:#ffffff;border-color:#d9d9d9;color:rgba(0,0,0,0.88);box-shadow:0 2px 0 rgba(0,0,0,0.02)}.ctz-button:hover{color:#1677ff;border-color:#1677ff}.ctz-button:active{background:rgba(0,0,0,0.08) !important}.ctz-button[size='small'],.ctz-button.ctz-button-small{padding:2px 6px;font-size:12px;height:24px}.ctz-button.ctz-button-transparent{background:transparent}.ctz-button-red{color:#e55353 !important;border:1px solid #e55353 !important}.ctz-button-red:hover{color:#ec7259 !important;border:1px solid #ec7259 !important}.ctz-button:disabled{border-color:#d0d0d0;background-color:rgba(0,0,0,0.08);color:#b0b0b0;cursor:not-allowed}[name='buttonHistoryClear']{margin-bottom:12px}#CTZ_BACKGROUND,#CTZ_BACKGROUND_LIGHT,#CTZ_BACKGROUND_DARK{display:grid;gap:8px}#CTZ_BACKGROUND>label,#CTZ_BACKGROUND_LIGHT>label,#CTZ_BACKGROUND_DARK>label{position:relative;cursor:pointer}#CTZ_BACKGROUND>label input,#CTZ_BACKGROUND_LIGHT>label input,#CTZ_BACKGROUND_DARK>label input{position:absolute;pointer-events:none;width:20px;height:20px;top:18px;left:20px}#CTZ_BACKGROUND>label input:checked+div,#CTZ_BACKGROUND_LIGHT>label input:checked+div,#CTZ_BACKGROUND_DARK>label input:checked+div{border:4px solid #1677ff}#CTZ_BACKGROUND>label div,#CTZ_BACKGROUND_LIGHT>label div,#CTZ_BACKGROUND_DARK>label div{pointer-events:none;border:4px double #eee;font-size:14px;border-radius:12px;line-height:56px;padding-left:60px}#CTZ_BACKGROUND_LIGHT{color:#000}.ctz-set-background{margin:-12px}.ctz-set-background .ctz-background-title{padding:12px 12px 0}.ctz-set-background .ctz-background-content{padding:12px;border-bottom:1px solid #d9d9d9}.ctz-set-background .ctz-background-content:last-of-type{border:none}.ErrorPage-text::after{content:'这是知乎因为移动端加载了电脑端网页导致（移动网页端想查看完整的评论和回答内容只能用此方法），会在部分回答中出现这个问题。不是修改器问题，暂时无法解决，刷新或后退返回回答页面。';padding:24px}.css-nk32ej{display:none}.TopstoryMain [itemprop='zhihu:question']{display:inline}.RichContent-inner p{margin-bottom:1.4em}.Question-main .ContentItem.AnswerItem .ContentItem-expandButton,.TopstoryMain .ContentItem.AnswerItem .ContentItem-expandButton{display:none !important}.Question-main .ctz-n-button-expend,.TopstoryMain .ctz-n-button-expend{color:#1677ff;position:absolute;border:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:10;top:0;left:0}.Question-main .ctz-n-button-close,.TopstoryMain .ctz-n-button-close{margin-left:12px;border:0 !important}.Question-main .ctz-n-button-comment,.TopstoryMain .ctz-n-button-comment{margin-left:12px}.ctz-answer-item .AuthorInfo-avatarWrapper .AuthorInfo-avatar,.ctz-recommend-item .AuthorInfo-avatarWrapper .AuthorInfo-avatar{box-sizing:border-box;margin:0;min-width:0;max-width:100%;background-color:#ffffff;width:38px;height:38px;border-radius:2px}.ctz-answer-item .RichContent-inner img,.ctz-recommend-item .RichContent-inner img{width:100%;max-width:100%}.Question-mainEntity .ContentItem-actions>.ContentItem-action{display:none}.QuestionAnswer-content .ctz-answer-item{padding:0}#CTZ_COMMENT,#CTZ_COMMENT_CHILD{position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:2000;font-size:16px;transition:all .2s;flex-direction:column}#CTZ_COMMENT button,#CTZ_COMMENT_CHILD button{padding:0;margin:0;border:0}#CTZ_COMMENT button.ctz-comment-button,#CTZ_COMMENT_CHILD button.ctz-comment-button{display:inline-block;font-size:14px;line-height:32px;text-align:center;cursor:pointer;background:rgba(132,145,165,0.1);border:1px solid transparent;border-radius:3px;margin:10px 0px 10px 54px;padding:0px 6px 0px 12px;height:32px;color:#8491a5;font-weight:500}.ctz-comment-header{height:48px;display:flex;padding:0 24px;align-items:center;border-top:1px solid #ebeced;border-bottom:1px solid #ebeced}.ctz-comment-header-left{flex:1;display:flex;align-items:center}.ctz-comment-content{flex:1;overflow-y:auto}.ctz-ci{display:flex;padding:10px 20px 14px}.ctz-ci-child{padding:10px 20px 14px 54px}.ctz-ci-avatar img{box-sizing:border-box;margin:0px;min-width:0px;max-width:100%;width:24px;height:24px;border-radius:2px;filter:brightness(.95);display:block;position:relative;background-color:#f8f8fa;flex:0 0 auto;text-indent:-9999px;overflow:hidden}.ctz-ci-right{flex:1;padding-left:10px}.ctz-ci-user a,.ctz-ci-user div{display:inline-block}.ctz-ci-user a{font-size:15px;font-weight:bold}.ctz-ci-user .ctz-tag{padding:0px 4px;color:#999;height:16px;line-height:16px;box-sizing:border-box;margin-left:4px;font-size:12px;border-radius:4px}.ctz-ci-user span{margin:0 6px;font-size:16px;color:#9196a1}.ctz-ci-content{margin:4px 0px 0px;min-width:0px;overflow:hidden;overflow-wrap:break-word;font-size:15px;line-height:21px}.ctz-ci-content>p{display:inline}.ctz-ci-info{display:flex;justify-content:space-between;padding-top:4px;color:#75849a;font-size:14px}.ctz-ci-info-left span{margin-right:6px}.ctz-comment-list{padding:10px 0}.ctz-comment-child-count{padding:0 20px;height:50px;line-height:50px;font-size:16px;font-weight:bold;border-bottom:1px solid #ebeced;border-top:20px solid rgba(132,145,165,0.1)}.ctz-comment-count{font-size:16px;font-weight:bold;padding-right:16px}.ctz-comment-sort{border:2px solid #f8f8fa;background:#f8f8fa}.ctz-comment-sort button{box-sizing:border-box;margin:0px;min-width:0px;border-radius:2px;text-align:center;cursor:pointer;width:50px;height:24px;font-size:12px;line-height:24px;font-weight:600;background:transparent;color:#81858f}.ctz-comment-vote span{pointer-events:none}.ctz-comment-vote-up{color:#ee3a43}.ctz-stop-scroll{height:100% !important;overflow:hidden !important}#CTZ_OPEN_BUTTON{position:fixed;font-size:48px;background:#e1e1e1;color:#000;opacity:.6;width:48px;height:48px;line-height:44px;border-radius:8px;z-index:2000;text-align:center}#CTZ_DIALOG{position:fixed;top:0;left:0;width:100%;height:100%;background:#f5f5f5;z-index:2001;font-size:16px;transition:all .2s;flex-direction:column}#CTZ_DIALOG input[type='checkbox']{width:16px;height:16px}#CTZ_DIALOG textarea{box-sizing:border-box;margin:0;padding:4px 11px;font-size:14px;line-height:1.5;list-style:none;position:relative;display:inline-block;min-width:0;border-width:1px;border-style:solid;border-color:#d9d9d9;border-radius:6px;transition:all .2s}#CTZ_DIALOG a{color:inherit}.ctz-header,.ctz-footer{font-size:16px;display:flex;align-items:center;height:48px;padding:0 12px}.ctz-footer a{margin-right:32px}.ctz-top-operate{flex:1;padding:0 12px;font-size:12px}.ctz-version{font-size:16px}#CTZ_CLOSE_DIALOG{font-weight:bold;width:40px;height:40px;color:rgba(0,0,0,0.45);background:transparent;border:none;font-size:24px}.ctz-menu{height:36px;display:flex}.ctz-menu>a{border-radius:12px 12px 0 0;flex:1;text-align:center;cursor:pointer;transition:initial !important;position:relative;display:flex;align-items:center;justify-content:center}.ctz-menu>a span{border-radius:8px;transition:all .3s;margin:0 4px;flex:1;box-sizing:border-box;align-items:center;line-height:26px}.ctz-menu>a.target{background:#fff}.ctz-menu>a.target::after,.ctz-menu>a.target::before{position:absolute;bottom:-12px;content:' ';background:radial-gradient(circle at top left, transparent 12px, #fff 0) top left,radial-gradient(circle at top right, transparent 12px, #fff 0) top right,radial-gradient(circle at bottom right, transparent 12px, #fff 0) bottom right,radial-gradient(circle at bottom left, transparent 12px, #fff 0) bottom left;background-size:50% 50%;background-repeat:no-repeat;width:24px;height:24px}.ctz-menu>a.target::before{left:-12px;z-index:-1}.ctz-menu>a.target::after{right:-12px;z-index:-1}.ctz-content{flex:1;overflow:hidden;background:#fff;border-radius:12px;padding:8px 0}.ctz-content>div{height:100%;flex-direction:column}.ctz-content-top{height:28px;display:flex;padding-bottom:8px}.ctz-content-top a{flex:1;text-align:center;line-height:28px;margin:0 8px;border-radius:8px}.ctz-content-top a.target{background-color:#f5f5f5}.ctz-content-top~.ctz-content-center{padding-top:0}.ctz-content-center{flex:1;overflow-y:auto;padding:12px}.ctz-content-center ::-webkit-scrollbar{width:8px;height:8px}.ctz-content-center ::-webkit-scrollbar-track{border-radius:0}.ctz-content-center ::-webkit-scrollbar-thumb{background:#bbb;transition:all .2s;border-radius:8px}.ctz-content-center ::-webkit-scrollbar-thumb:hover{background-color:rgba(95,95,95,0.7)}.ctz-hidden-item-br{margin:12px 0;width:100%;height:1px;position:relative}.ctz-hidden-item-br::after{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:65%;height:1px;background:#d9d9d9}#CTZ_HIDDEN .ctz-content-center label{margin-right:12px;margin-bottom:4px}#CTZ_BASIS_SHOW label{margin:8px 0}#CTZ_BASIS_SHOW label b{display:inline-block;padding:0 4px;background:#f5f5f5;border-radius:2px;margin-right:2px}.ctz-suspension-pickup{position:fixed;bottom:60px;right:14px;text-align:center;height:40px;line-height:40px;width:68px;border-radius:4px;font-size:14px;background:#fff}.ctz-label{font-size:14px;line-height:24px}.ctz-label::after{content:'：'}.ctz-flex-wrap{display:flex;flex-wrap:wrap;line-height:24px}.ctz-flex-wrap label{margin-right:4px;display:flex;align-items:center}.ctz-flex-wrap label input[type='radio']{margin:0 4px 0 0}.ctz-label-tag{font-weight:normal;padding:2px 4px;border-radius:4px;font-size:12px;color:#ffffff;margin:0 2px}.ctz-label-tag-Answer{background:#ec7259}.ctz-label-tag-ZVideo{background:#12c2e9}.ctz-label-tag-Article{background:#00965e}.ctz-label-tag-Pin{background:#9c27b0}#CTZ_HISTORY_LIST .ctz-set-content a,#CTZ_HISTORY_VIEW .ctz-set-content a{word-break:break-all;display:block;margin-bottom:12px;padding:6px 12px;border:1px solid #eee;border-radius:4px}.ctz-fetch-intercept .ctz-need-fetch{display:none}.ctz-fetch-intercept.ctz-fetch-intercept-close{color:#b0b0b0 !important;cursor:not-allowed}.ctz-fetch-intercept.ctz-fetch-intercept-close span.ctz-need-fetch{display:inline}.ctz-fetch-intercept.ctz-fetch-intercept-close div.ctz-need-fetch{display:block}.ctz-fetch-intercept.ctz-fetch-intercept-close .ctz-remove-block{cursor:not-allowed !important}.ctz-fetch-intercept.ctz-fetch-intercept-close .ctz-black-item .ctz-remove-block:hover,.ctz-fetch-intercept.ctz-fetch-intercept-close .ctz-black-item a:hover{background:transparent !important;color:#b0b0b0 !important}#CTZ_MESSAGE_BOX{position:fixed;left:0;top:10px;width:100%;z-index:2002}.ctz-message{margin:20px auto;width:70%;height:48px;display:flex;align-items:center;justify-content:center;font-size:14px;border-radius:8px;box-shadow:0 0 8px #d0d4d6,0 0 8px #e6eaec;margin-bottom:12px;background:#fff}.ctz-config-import-box{display:flex;flex-direction:column}.ctz-config-import-box>div,.ctz-config-import-box>textarea{margin-bottom:12px !important}.ctz-config-import-box textarea{height:120px;resize:vertical}#CTZ_LOADING_TOAST{position:fixed;top:50%;left:50%;width:100px;height:100px;background:rgba(0,0,0,0.25);color:#fff;transform:translate(-50%, -50%);border-radius:16px;z-index:2002;display:flex;flex-direction:column;align-items:center}#CTZ_LOADING_TOAST .ctz-loading-toast-text{padding-bottom:12px}#CTZ_LOADING_TOAST .ctz-loading-toast-icon{flex:1;position:relative;font-size:34px}#CTZ_LOADING_TOAST .ctz-loading-toast-icon span{position:absolute;top:50%;left:50%;animation:rotate 1.5s infinite}.ctz-preview{box-sizing:border-box;position:fixed;height:100%;width:100%;top:0;left:0;overflow-y:auto;z-index:200;background-color:rgba(18,18,18,0.4)}.ctz-preview div{display:flex;justify-content:center;align-items:center;min-height:100%;width:100%}.ctz-preview div img{cursor:zoom-out;user-select:none;max-width:100%}.ctz-comment-loading,.ctz-answer-loading,.ctz-list-loading{text-align:center;font-size:24px;color:#1677ff;position:relative;padding:0 0 12px;height:24px}.ctz-comment-loading span,.ctz-answer-loading span,.ctz-list-loading span{position:absolute;top:50%;left:50%;animation:rotate 1.5s infinite}.ctz-comment-end,.ctz-answer-end{text-align:center;padding:0 0 12px;color:#75849a}#CTZ_BUTTON_COMMENT_CLOSE{font-size:24px}`;
  var INNER_VERSION = `2.3.1`;
  var initHTML = () => {
    document.body.appendChild(domC("div", { id: "CTZ_MAIN", innerHTML: INNER_HTML }));
    openButtonPosition();
    dom(".ctz-version").innerText = `version: ${INNER_VERSION}`;
    dom(".ctz-menu").innerHTML = HEADER.map(({ href, value }) => `<a href="${href}"><span>${value}</span></a>`).join("");
    addBackgroundElement();
    dom("#CTZ_HIDDEN .ctz-content-center").innerHTML = HIDDEN_ARRAY.map(
      (itemArr) => itemArr.map(({ label, value }) => `<label class="dis-if-c"><input class="ctz-i" name="${value}" type="checkbox" value="on" />${label}</label>`).join("") + '<div class="ctz-hidden-item-br"></div>'
    ).join("");
    dom("#CTZ_BASIS_SHOW").innerHTML += BASIC_SHOW_CONTENT.map(
      ({ label, value, needFetch }) => `<label class="ctz-flex-wrap ${needFetch ? "ctz-fetch-intercept" : ""}"><span class="ctz-label">${label}${needFetch ? '<span class="ctz-need-fetch">（接口拦截已关闭，此功能无法使用）</span>' : ""}</span><input class="ctz-i" name="${value}" type="checkbox" value="on" /></label>`
    ).join("");
    myMenu.init();
  };
  var myScroll = {
    stop: () => dom("body").classList.add("ctz-stop-scroll"),
    on: () => dom("body").classList.remove("ctz-stop-scroll")
  };
  var echoData = async () => {
    const pfConfig = await myStorage.getConfig();
    const textSameName = {
      globalTitle: (e2) => e2.value = pfConfig.globalTitle || document.title,
      customizeCss: (e2) => e2.value = pfConfig.customizeCss || ""
    };
    const echoText = (even) => {
      textSameName[even.name] ? textSameName[even.name](even) : even.value = pfConfig[even.name];
    };
    const echo = {
      radio: (even) => pfConfig.hasOwnProperty(even.name) && even.value === pfConfig[even.name] && (even.checked = true),
      checkbox: (even) => even.checked = pfConfig[even.name] || false,
      text: echoText,
      number: echoText,
      range: (even) => {
        const nValue = pfConfig[even.name];
        const nodeRange = dom(`[name="${even.name}"]`);
        const min = nodeRange && nodeRange.min;
        const rangeNum = isNaN(+nValue) || !(+nValue > 0) ? min : nValue;
        even.value = rangeNum;
        const nodeNewOne = domById(even.name);
        nodeNewOne && (nodeNewOne.innerText = rangeNum);
      }
    };
    const doEcho = (item) => {
      echo[item.type] && echo[item.type](item);
    };
    const nodeArrInputClick = domA(`.${CLASS_INPUT_CLICK}`);
    for (let i2 = 0, len = nodeArrInputClick.length; i2 < len; i2++) {
      doEcho(nodeArrInputClick[i2]);
    }
    const nodeArrInputChange = domA(`.${CLASS_INPUT_CHANGE}`);
    for (let i2 = 0, len = nodeArrInputChange.length; i2 < len; i2++) {
      doEcho(nodeArrInputChange[i2]);
    }
  };
  var echoHistory = async () => {
    const history = await myStorage.getHistory();
    const { list, view } = history;
    const nodeList = dom("#CTZ_HISTORY_LIST .ctz-set-content");
    const nodeView = dom("#CTZ_HISTORY_VIEW .ctz-set-content");
    nodeList && (nodeList.innerHTML = list.join(""));
    nodeView && (nodeView.innerHTML = view.join(""));
  };
  var addHistoryView = async () => {
    const { href, origin, pathname, hash } = location;
    const question = "www.zhihu.com/question/";
    const article = "zhuanlan.zhihu.com/p/";
    const video = "www.zhihu.com/zvideo/";
    let name = href.replace(hash, "");
    setTimeout(async () => {
      if (!href.includes(question) && !href.includes(article) && !href.includes(video))
        return;
      href.includes(question) && dom(".QuestionHeader-title") && (name = `<b class="c-ec7259">「问题」</b>${dom(".QuestionHeader-title").innerText}`);
      href.includes(article) && dom(".Post-Title") && (name = `<b class="c-00965e">「文章」</b>${dom(".Post-Title").innerText}`);
      href.includes(video) && dom(".ZVideo-title") && (name = `<b class="c-12c2e9">「视频」</b>${dom(".ZVideo-title").innerText}`);
      const nA = `<a href="${origin + pathname}" target="_blank">${name}</a>`;
      const { view } = await myStorage.getHistory();
      if (!view.includes(nA)) {
        view.unshift(nA);
        await myStorage.setHistoryItem("view", view);
      }
    }, 500);
  };
  var myDialog = {
    open: (e2) => {
      e2 && e2.preventDefault();
      const nodeDialog = domById("CTZ_DIALOG");
      nodeDialog && (nodeDialog.style.display = "flex");
      myScroll.stop();
      echoData();
      echoHistory();
    },
    hide: () => {
      const nodeDialog = domById("CTZ_DIALOG");
      nodeDialog && (nodeDialog.style.display = "none");
      myScroll.on();
    }
  };
  var DN = "display:none!important;";
  var VH = "visibility: hidden!important;";
  var myHidden = {
    init: async function() {
      const content = await this.change();
      fnInitDomStyle("CTZ_STYLE_HIDDEN", content || "");
    },
    change: async function() {
      const config = await myStorage.getConfig();
      const cssHidden = Object.keys(this.hiddenItem).map((key) => config[key] ? this.hiddenItem[key] : "").join("");
      let cssHiddenMore = "";
      this.hiddenArray.forEach(({ keys, value }) => {
        let trueNumber = 0;
        keys.forEach((key) => config[key] && trueNumber++);
        trueNumber === keys.length && (cssHiddenMore += value);
      });
      return cssHidden + cssHiddenMore;
    },
    hiddenItem: {
      hiddenOpenApp: `.OpenInAppButton{${DN}}.css-183aq3r{${VH}}`,
      hiddenLogo: `.MobileAppHeader-logo,a[aria-label="知乎"]{${VH}}`,
      hiddenHeader: `.MobileAppHeader,.ColumnPageHeader.Sticky,.css-rg1dmv,.css-1gapyfo{${DN}}`,
      hiddenItemActions: `.TopstoryItem .ContentItem-actions:not(.Sticky),.SearchMain .ContentItem-actions{${DN}}`,
      hiddenBottomSticky: `.ContentItem-actions.Sticky,.css-1tu4yh8{${DN}}`,
      hiddenReward: `.Reward{${DN}}`,
      hiddenListImg: `.RichContent-cover,.css-uw6cz9,.SearchItem-rightImg{${DN}}`,
      hiddenReadMoreText: ".ContentItem-more{font-size:0!important;}",
      hiddenAnswers: `.RichContent-inner,.css-3ny988,.Topstory-recommend .VideoAnswerPlayer{${DN}}`,
      hiddenListVideoContent: `.Topstory-recommend .ZVideoItem-video,.Topstory-recommend .VideoAnswerPlayer,.Topstory-recommend .ZVideoItem .RichContent{${DN}}`,
      hiddenZhuanlanActions: `.zhuanlan .RichContent-actions.is-fixed>.ContentItem-actions{${DN}}`,
      hiddenZhuanlanTitleImage: ".css-1ntkiwo,.TitleImage,.css-78p1r9,.ArticleItem .RichContent>div:first-of-type:not(.RichContent-cover)>div:last-of-type{display: none!important;}",
      hiddenDetailAvatar: `.AnswerItem .AuthorInfo .AuthorInfo-avatarWrapper{${DN}}.AnswerItem .AuthorInfo .AuthorInfo-content{margin-left:0!important;}`,
      hiddenDetailBadge: `.AnswerItem .AuthorInfo .AuthorInfo-detail{${DN}}`,
      hiddenDetailVoters: `.css-dvccr2{${DN}}`,
      hiddenWhoVoters: ".css-1vqda4a{display: none!important;}",
      hiddenDetailName: `.AnswerItem .AuthorInfo .AuthorInfo-head{${DN}}`,
      hiddenQuestionFollowing: `.QuestionHeader .FollowButton{${DN}}`,
      hiddenQuestionAnswer: `.QuestionHeader .FollowButton ~ a{${DN}}`,
      hiddenZhuanlanFollowButton: `.zhuanlan .FollowButton{${DN}}`,
      hiddenZhuanlanAvatarWrapper: `.zhuanlan .AuthorInfo-avatarWrapper{${DN}}`,
      hiddenZhuanlanAuthorInfoHead: `.zhuanlan .AuthorInfo-head{${DN}}`,
      hiddenZhuanlanAuthorInfoDetail: `.zhuanlan .AuthorInfo-detail{${DN}}`,
      hiddenAnswerItemActions: `.Question-main .ContentItem-actions{${DN}}`,
      hiddenAnswerItemTime: `.Question-main .ContentItem-time{${DN}margin: 0;}`,
      hiddenAnswerItemTimeButHaveIP: `.Question-main .ContentItem-time>a{${DN}}.Question-main .ContentItem-time:empty{${DN}margin: 0;}`,
      hiddenZhuanlanImage: `.zhuanlan .origin_image{${DN}}`,
      hiddenCommitImg: `.comment_img{${DN}}`,
      hiddenAnswerYanxuanRecommend: `.Question-mainEntity .KfeCollection-VipRecommendCard{${DN}}`,
      hiddenAD: `.TopstoryItem--advertCard,.Pc-card,.Pc-word,.RichText-ADLinkCardContainer,#div-gpt-ad-bannerAd,#div-gpt-ad-hotFeedAd,.MRelateFeedAd,.MHotFeedAd,.MBannerAd{${DN}}`,
      hiddenAnswerRelatedRecommend: `.Question-mainEntity .RelatedReadings{${DN}}`,
      hiddenAnswerHotRecommend: `.Question-mainEntity .HotQuestions{${DN}}`
    },
    hiddenArray: []
  };
  var myVersion = {
    init: async function() {
      const config = await myStorage.getConfig();
      fnInitDomStyle("CTZ_STYLE_VERSION", this.vQuestionTitleTag(config) + this.openButtonInvisible(config) + this.vCommentHeaderToBottom(config));
    },
    change: function() {
      this.init();
    },
    /** 内容标题添加类别显示 */
    vQuestionTitleTag: function({ questionTitleTag }) {
      const cssTag = "margin-right:6px;font-weight:normal;display:inline;padding:2px 4px;border-radius:4px;font-size:12px;color:#ffffff";
      return fnReturnStr(
        `.AnswerItem .ContentItem-title::before{content:'问答';background:#ec7259}.TopstoryItem .PinItem::before{content:'想法';background:#9c27b0;${cssTag}}.PinItem>.ContentItem-title{margin-top:4px;}.ZvideoItem .ContentItem-title::before{content:'视频';background:#12c2e9}.ZVideoItem .ContentItem-title::before{content:'视频';background:#12c2e9}.ArticleItem .ContentItem-title::before{content:'文章';background:#00965e}.ContentItem .ContentItem-title::before{margin-right:6px;font-weight:normal;display:inline;padding:2px 4px;border-radius:4px;font-size:12px;color:#ffffff}.TopstoryQuestionAskItem .ContentItem-title::before{content:'提问';background:#533b77}`,
        questionTitleTag
      );
    },
    vCommentHeaderToBottom: function({ commentHeaderToBottom }) {
      return fnReturnStr(`#CTZ_COMMENT,#CTZ_COMMENT_CHILD{flex-direction: column-reverse!important;}`, commentHeaderToBottom);
    },
    /** 隐藏修改器唤起按钮 */
    openButtonInvisible: function({ openButtonInvisible }) {
      return fnReturnStr("#CTZ_OPEN_BUTTON{display: none!important;}", openButtonInvisible);
    }
  };
  var onInitStyleExtra = () => {
    myHidden.init();
    loadBackground();
    myVersion.init();
    loadFindTheme();
  };
  var myButtonOperate = {
    /** 清空历史记录 */
    buttonHistoryClear: async (target) => {
      const prevHistory = await myStorage.getHistory();
      const dataId = target.getAttribute("data-id");
      const isClear = confirm(`是否清空${target.innerText}`);
      if (!isClear)
        return;
      prevHistory[dataId] = [];
      await myStorage.setHistory(prevHistory);
      echoHistory();
    },
    /** 获取当前配置 */
    configExport: async () => {
      const config = await myStorage.get(NAME_CONFIG) ?? "";
      copy(config);
      message("已复制当前配置");
    },
    /** 恢复默认配置 */
    configReset: async function() {
      const isUse = confirm("是否启恢复默认配置？\n该功能会覆盖当前配置，建议先将配置获取保存");
      if (!isUse)
        return;
      const { filterKeywords = [], removeBlockUserContentList = [] } = await myStorage.getConfig();
      await myStorage.setConfig({
        ...CONFIG_DEFAULT,
        filterKeywords,
        removeBlockUserContentList
      });
      resetData();
    },
    /** 导入配置 */
    configImport: async function() {
      const nodeImport = dom("[name=textConfigImport]");
      const configImport = nodeImport ? nodeImport.value : "{}";
      const configThis = JSON.parse(configImport);
      const configPrev = await myStorage.getConfig();
      const nConfig = {
        ...configPrev,
        ...configThis
      };
      await myStorage.setConfig(nConfig);
      resetData();
      message("配置已导入");
    },
    /** 自定义样式 */
    styleCustom: async function() {
      const nodeText = dom('[name="textStyleCustom"]');
      const value = nodeText ? nodeText.value : "";
      await myStorage.updateConfig("customizeCss", value);
      myCustomStyle.change(value);
    },
    styleCustomReset: async function() {
      dom('[name="textStyleCustom"]').value = "";
      await myStorage.updateConfig("customizeCss", "");
      myCustomStyle.change("");
    }
  };
  var resetData = () => {
    onInitStyleExtra();
    echoData();
    onUseThemeDark();
  };
  var timeFormatter = (time, formatter = "YYYY-MM-DD HH:mm:ss") => {
    if (!time)
      return "";
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    const preArr = (num) => String(num).length !== 2 ? "0" + String(num) : String(num);
    return formatter.replace(/YYYY/g, String(year)).replace(/MM/g, preArr(month)).replace(/DD/g, preArr(day)).replace(/HH/g, preArr(hour)).replace(/mm/g, preArr(min)).replace(/ss/g, preArr(sec));
  };
  var addTimeForQuestion = async () => {
    const { releaseTimeForQuestion } = await myStorage.getConfig();
    const className = "ctz-question-time";
    if (dom(`.${className}`))
      return;
    const nodeCreated = dom('[itemprop="dateCreated"]');
    const nodeModified = dom('[itemprop="dateModified"]');
    const nodeTitle = dom(".QuestionHeader-title");
    if (!(releaseTimeForQuestion && nodeCreated && nodeModified && nodeTitle))
      return;
    const createTime = timeFormatter(nodeCreated.content);
    const updateTime = timeFormatter(nodeModified.content);
    nodeTitle.appendChild(
      domC("div", {
        className,
        innerHTML: `<div>创建于：${createTime}</div>${updateTime !== createTime ? `<div>编辑于：${updateTime}</div>` : ""}`,
        style: "font-size: 14px;"
      })
    );
  };
  var addTimeForArticle = async () => {
    const { releaseTimeForArticle } = await myStorage.getConfig();
    const className = "ctz-article-create-time";
    if (dom(`.${className}`))
      return;
    const nodeContentTime = dom(".ContentItem-time");
    const nodeHeader = dom(".Post-Header");
    if (!(releaseTimeForArticle && nodeContentTime && nodeHeader))
      return;
    nodeHeader.appendChild(
      domC("span", {
        className,
        style: "color: #8590a6;line-height: 30px;",
        innerHTML: nodeContentTime.innerText || ""
      })
    );
  };
  var createTimeHTML = (createTime, updateTime) => {
    return `<div class="${CLASS_TIME_ITEM}" style="line-height: 24px;padding-top: 2px;font-size: 14px;"><div>创建于：${timeFormatter(+`${createTime}`)}</div>${createTime !== updateTime && updateTime ? `<div>编辑于：${timeFormatter(+`${updateTime}`)}</div>` : ""}</div>`;
  };
  var fnChanger = async (ev) => {
    const doCssVersion = ["questionTitleTag", "openButtonInvisible", "commentHeaderToBottom"];
    const { name, value, checked, type } = ev;
    const changeBackground = () => {
      myVersion.change();
      loadBackground();
      onUseThemeDark();
    };
    const ob = {
      [INPUT_NAME_THEME]: changeBackground,
      [INPUT_NAME_ThEME_LIGHT]: changeBackground,
      [INPUT_NAME_THEME_DARK]: changeBackground,
      releaseTimeForQuestion: addTimeForQuestion,
      releaseTimeForArticle: addTimeForArticle
    };
    await myStorage.updateConfig(name, type === "checkbox" ? checked : value);
    const nodeName = domById(name);
    type === "range" && nodeName && (nodeName.innerText = value);
    if (/^hidden/.test(name)) {
      myHidden.init();
      return;
    }
    if (doCssVersion.includes(name)) {
      myVersion.change();
      return;
    }
    ob[name] && ob[name]();
  };
  function md5(s2) {
    function f12(t2, e2, n2) {
      var r2;
      !function(o3) {
        "use strict";
        function i2(t3, e3) {
          var n3 = (65535 & t3) + (65535 & e3);
          return (t3 >> 16) + (e3 >> 16) + (n3 >> 16) << 16 | 65535 & n3;
        }
        function a2(t3, e3, n3, r3, o4, a3) {
          return i2((u2 = i2(i2(e3, t3), i2(r3, a3))) << (c3 = o4) | u2 >>> 32 - c3, n3);
          var u2, c3;
        }
        function u(t3, e3, n3, r3, o4, i3, u2) {
          return a2(e3 & n3 | ~e3 & r3, t3, e3, o4, i3, u2);
        }
        function c2(t3, e3, n3, r3, o4, i3, u2) {
          return a2(e3 & r3 | n3 & ~r3, t3, e3, o4, i3, u2);
        }
        function s3(t3, e3, n3, r3, o4, i3, u2) {
          return a2(e3 ^ n3 ^ r3, t3, e3, o4, i3, u2);
        }
        function l2(t3, e3, n3, r3, o4, i3, u2) {
          return a2(n3 ^ (e3 | ~r3), t3, e3, o4, i3, u2);
        }
        function f(t3, e3) {
          var n3, r3, o4, a3, f2;
          t3[e3 >> 5] |= 128 << e3 % 32, t3[14 + (e3 + 64 >>> 9 << 4)] = e3;
          var d2 = 1732584193, p2 = -271733879, h3 = -1732584194, v2 = 271733878;
          for (n3 = 0; n3 < t3.length; n3 += 16)
            r3 = d2, o4 = p2, a3 = h3, f2 = v2, d2 = u(d2, p2, h3, v2, t3[n3], 7, -680876936), v2 = u(v2, d2, p2, h3, t3[n3 + 1], 12, -389564586), h3 = u(h3, v2, d2, p2, t3[n3 + 2], 17, 606105819), p2 = u(p2, h3, v2, d2, t3[n3 + 3], 22, -1044525330), d2 = u(d2, p2, h3, v2, t3[n3 + 4], 7, -176418897), v2 = u(v2, d2, p2, h3, t3[n3 + 5], 12, 1200080426), h3 = u(h3, v2, d2, p2, t3[n3 + 6], 17, -1473231341), p2 = u(p2, h3, v2, d2, t3[n3 + 7], 22, -45705983), d2 = u(d2, p2, h3, v2, t3[n3 + 8], 7, 1770035416), v2 = u(v2, d2, p2, h3, t3[n3 + 9], 12, -1958414417), h3 = u(h3, v2, d2, p2, t3[n3 + 10], 17, -42063), p2 = u(p2, h3, v2, d2, t3[n3 + 11], 22, -1990404162), d2 = u(d2, p2, h3, v2, t3[n3 + 12], 7, 1804603682), v2 = u(v2, d2, p2, h3, t3[n3 + 13], 12, -40341101), h3 = u(h3, v2, d2, p2, t3[n3 + 14], 17, -1502002290), d2 = c2(d2, p2 = u(p2, h3, v2, d2, t3[n3 + 15], 22, 1236535329), h3, v2, t3[n3 + 1], 5, -165796510), v2 = c2(v2, d2, p2, h3, t3[n3 + 6], 9, -1069501632), h3 = c2(h3, v2, d2, p2, t3[n3 + 11], 14, 643717713), p2 = c2(p2, h3, v2, d2, t3[n3], 20, -373897302), d2 = c2(d2, p2, h3, v2, t3[n3 + 5], 5, -701558691), v2 = c2(v2, d2, p2, h3, t3[n3 + 10], 9, 38016083), h3 = c2(h3, v2, d2, p2, t3[n3 + 15], 14, -660478335), p2 = c2(p2, h3, v2, d2, t3[n3 + 4], 20, -405537848), d2 = c2(d2, p2, h3, v2, t3[n3 + 9], 5, 568446438), v2 = c2(v2, d2, p2, h3, t3[n3 + 14], 9, -1019803690), h3 = c2(h3, v2, d2, p2, t3[n3 + 3], 14, -187363961), p2 = c2(p2, h3, v2, d2, t3[n3 + 8], 20, 1163531501), d2 = c2(d2, p2, h3, v2, t3[n3 + 13], 5, -1444681467), v2 = c2(v2, d2, p2, h3, t3[n3 + 2], 9, -51403784), h3 = c2(h3, v2, d2, p2, t3[n3 + 7], 14, 1735328473), d2 = s3(d2, p2 = c2(p2, h3, v2, d2, t3[n3 + 12], 20, -1926607734), h3, v2, t3[n3 + 5], 4, -378558), v2 = s3(v2, d2, p2, h3, t3[n3 + 8], 11, -2022574463), h3 = s3(h3, v2, d2, p2, t3[n3 + 11], 16, 1839030562), p2 = s3(p2, h3, v2, d2, t3[n3 + 14], 23, -35309556), d2 = s3(d2, p2, h3, v2, t3[n3 + 1], 4, -1530992060), v2 = s3(v2, d2, p2, h3, t3[n3 + 4], 11, 1272893353), h3 = s3(h3, v2, d2, p2, t3[n3 + 7], 16, -155497632), p2 = s3(p2, h3, v2, d2, t3[n3 + 10], 23, -1094730640), d2 = s3(d2, p2, h3, v2, t3[n3 + 13], 4, 681279174), v2 = s3(v2, d2, p2, h3, t3[n3], 11, -358537222), h3 = s3(h3, v2, d2, p2, t3[n3 + 3], 16, -722521979), p2 = s3(p2, h3, v2, d2, t3[n3 + 6], 23, 76029189), d2 = s3(d2, p2, h3, v2, t3[n3 + 9], 4, -640364487), v2 = s3(v2, d2, p2, h3, t3[n3 + 12], 11, -421815835), h3 = s3(h3, v2, d2, p2, t3[n3 + 15], 16, 530742520), d2 = l2(d2, p2 = s3(p2, h3, v2, d2, t3[n3 + 2], 23, -995338651), h3, v2, t3[n3], 6, -198630844), v2 = l2(v2, d2, p2, h3, t3[n3 + 7], 10, 1126891415), h3 = l2(h3, v2, d2, p2, t3[n3 + 14], 15, -1416354905), p2 = l2(p2, h3, v2, d2, t3[n3 + 5], 21, -57434055), d2 = l2(d2, p2, h3, v2, t3[n3 + 12], 6, 1700485571), v2 = l2(v2, d2, p2, h3, t3[n3 + 3], 10, -1894986606), h3 = l2(h3, v2, d2, p2, t3[n3 + 10], 15, -1051523), p2 = l2(p2, h3, v2, d2, t3[n3 + 1], 21, -2054922799), d2 = l2(d2, p2, h3, v2, t3[n3 + 8], 6, 1873313359), v2 = l2(v2, d2, p2, h3, t3[n3 + 15], 10, -30611744), h3 = l2(h3, v2, d2, p2, t3[n3 + 6], 15, -1560198380), p2 = l2(p2, h3, v2, d2, t3[n3 + 13], 21, 1309151649), d2 = l2(d2, p2, h3, v2, t3[n3 + 4], 6, -145523070), v2 = l2(v2, d2, p2, h3, t3[n3 + 11], 10, -1120210379), h3 = l2(h3, v2, d2, p2, t3[n3 + 2], 15, 718787259), p2 = l2(p2, h3, v2, d2, t3[n3 + 9], 21, -343485551), d2 = i2(d2, r3), p2 = i2(p2, o4), h3 = i2(h3, a3), v2 = i2(v2, f2);
          return [d2, p2, h3, v2];
        }
        function d(t3) {
          var e3, n3 = "", r3 = 32 * t3.length;
          for (e3 = 0; e3 < r3; e3 += 8)
            n3 += String.fromCharCode(t3[e3 >> 5] >>> e3 % 32 & 255);
          return n3;
        }
        function p(t3) {
          var e3, n3 = [];
          for (n3[(t3.length >> 2) - 1] = void 0, e3 = 0; e3 < n3.length; e3 += 1)
            n3[e3] = 0;
          var r3 = 8 * t3.length;
          for (e3 = 0; e3 < r3; e3 += 8)
            n3[e3 >> 5] |= (255 & t3.charCodeAt(e3 / 8)) << e3 % 32;
          return n3;
        }
        function h2(t3) {
          var e3, n3, r3 = "0123456789abcdef", o4 = "";
          for (n3 = 0; n3 < t3.length; n3 += 1)
            e3 = t3.charCodeAt(n3), o4 += r3.charAt(e3 >>> 4 & 15) + r3.charAt(15 & e3);
          return o4;
        }
        function v(t3) {
          return unescape(encodeURIComponent(t3));
        }
        function A2(t3) {
          return function(t4) {
            return d(f(p(t4), 8 * t4.length));
          }(v(t3));
        }
        function m(t3, e3) {
          return function(t4, e4) {
            var n3, r3, o4 = p(t4), i3 = [], a3 = [];
            for (i3[15] = a3[15] = void 0, o4.length > 16 && (o4 = f(o4, 8 * t4.length)), n3 = 0; n3 < 16; n3 += 1)
              i3[n3] = 909522486 ^ o4[n3], a3[n3] = 1549556828 ^ o4[n3];
            return r3 = f(i3.concat(p(e4)), 512 + 8 * e4.length), d(f(a3.concat(r3), 640));
          }(v(t3), v(e3));
        }
        function g2(t3, e3, n3) {
          return e3 ? n3 ? m(e3, t3) : h2(m(e3, t3)) : n3 ? A2(t3) : h2(A2(t3));
        }
        void 0 === (r2 = function() {
          return g2;
        }.call(e2, n2, e2, t2)) || (t2.exports = r2);
      }();
    }
    var o2 = {};
    f12(o2);
    return o2.exports(s2);
  }
  function zhihu_enc(s) {
    function f1(__unused_webpack_module, exports) {
      "use strict";
      var __webpack_unused_export__;
      function o(t2) {
        return (o = "function" == typeof Symbol && "symbol" == typeof Symbol.A ? function(t3) {
          return typeof t3;
        } : function(t3) {
          return t3 && "function" == typeof Symbol && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
        })(t2);
      }
      function x(e2) {
        return C(e2) || s(e2) || t();
      }
      function C(t2) {
        if (Array.isArray(t2)) {
          for (var e2 = 0, n2 = new Array(t2.length); e2 < t2.length; e2++)
            n2[e2] = t2[e2];
          return n2;
        }
      }
      function s(t2) {
        if (Symbol.A in Object(t2) || "[object Arguments]" === Object.prototype.toString.call(t2))
          return Array.from(t2);
      }
      function t() {
        throw new TypeError("Invalid attempt to spread non-iterable instance");
      }
      __webpack_unused_export__ = {
        value: true
      };
      var A = "3.0", S = "undefined" != typeof window ? window : {}, h;
      function i(t2, e2, n2) {
        e2[n2] = 255 & t2 >>> 24, e2[n2 + 1] = 255 & t2 >>> 16, e2[n2 + 2] = 255 & t2 >>> 8, e2[n2 + 3] = 255 & t2;
      }
      function B(t2, e2) {
        return (255 & t2[e2]) << 24 | (255 & t2[e2 + 1]) << 16 | (255 & t2[e2 + 2]) << 8 | 255 & t2[e2 + 3];
      }
      function Q(t2, e2) {
        return (4294967295 & t2) << e2 | t2 >>> 32 - e2;
      }
      function G(t2) {
        var e2 = new Array(4), n2 = new Array(4);
        i(t2, e2, 0), n2[0] = h.zb[255 & e2[0]], n2[1] = h.zb[255 & e2[1]], n2[2] = h.zb[255 & e2[2]], n2[3] = h.zb[255 & e2[3]];
        var r2 = B(n2, 0);
        return r2 ^ Q(r2, 2) ^ Q(r2, 10) ^ Q(r2, 18) ^ Q(r2, 24);
      }
      var __g = {
        x: function(t2, e2) {
          for (var n2 = [], r2 = t2.length, o2 = 0; 0 < r2; r2 -= 16) {
            for (var i2 = t2.slice(16 * o2, 16 * (o2 + 1)), a2 = new Array(16), u = 0; u < 16; u++)
              a2[u] = i2[u] ^ e2[u];
            e2 = __g.r(a2), n2 = n2.concat(e2), o2++;
          }
          return n2;
        },
        r: function(t2) {
          var e2 = new Array(16), n2 = new Array(36);
          n2[0] = B(t2, 0), n2[1] = B(t2, 4), n2[2] = B(t2, 8), n2[3] = B(t2, 12);
          for (var r2 = 0; r2 < 32; r2++) {
            var o2 = G(n2[r2 + 1] ^ n2[r2 + 2] ^ n2[r2 + 3] ^ h.zk[r2]);
            n2[r2 + 4] = n2[r2] ^ o2;
          }
          return i(n2[35], e2, 0), i(n2[34], e2, 4), i(n2[33], e2, 8), i(n2[32], e2, 12), e2;
        }
      };
      function l() {
        this.C = [0, 0, 0, 0], this.s = 0, this.t = [], this.S = [], this.h = [], this.i = [], this.B = [], this.Q = false, this.G = [], this.D = [], this.w = 1024, this.g = null, this.a = Date.now(), this.e = 0, this.T = 255, this.V = null, this.U = Date.now, this.M = new Array(32);
      }
      l.prototype.O = function(A, C, s) {
        for (var t, S, h, i, B, Q, G, D, w, g, a, e, E, T, r, V, U, M, O, c, I; this.T < this.w; )
          try {
            switch (this.T) {
              case 27:
                this.C[this.c] = this.C[this.I] >> this.C[this.F], this.M[12] = 35, this.T = this.T * (this.C.length + (this.M[13] ? 3 : 9)) + 1;
                break;
              case 34:
                this.C[this.c] = this.C[this.I] & this.C[this.F], this.T = this.T * (this.M[15] - 6) + 12;
                break;
              case 41:
                this.C[this.c] = this.C[this.I] <= this.C[this.F], this.T = 8 * this.T + 27;
                break;
              case 48:
                this.C[this.c] = !this.C[this.I], this.T = 7 * this.T + 16;
                break;
              case 50:
                this.C[this.c] = this.C[this.I] | this.C[this.F], this.T = 6 * this.T + 52;
                break;
              case 57:
                this.C[this.c] = this.C[this.I] >>> this.C[this.F], this.T = 7 * this.T - 47;
                break;
              case 64:
                this.C[this.c] = this.C[this.I] << this.C[this.F], this.T = 5 * this.T + 32;
                break;
              case 71:
                this.C[this.c] = this.C[this.I] ^ this.C[this.F], this.T = 6 * this.T - 74;
                break;
              case 78:
                this.C[this.c] = this.C[this.I] & this.C[this.F], this.T = 4 * this.T + 40;
                break;
              case 80:
                this.C[this.c] = this.C[this.I] < this.C[this.F], this.T = 5 * this.T - 48;
                break;
              case 87:
                this.C[this.c] = -this.C[this.I], this.T = 3 * this.T + 91;
                break;
              case 94:
                this.C[this.c] = this.C[this.I] > this.C[this.F], this.T = 4 * this.T - 24;
                break;
              case 101:
                this.C[this.c] = this.C[this.I] in this.C[this.F], this.T = 3 * this.T + 49;
                break;
              case 108:
                this.C[this.c] = o(this.C[this.I]), this.T = 2 * this.T + 136;
                break;
              case 110:
                this.C[this.c] = this.C[this.I] !== this.C[this.F], this.T += 242;
                break;
              case 117:
                this.C[this.c] = this.C[this.I] && this.C[this.F], this.T = 3 * this.T + 1;
                break;
              case 124:
                this.C[this.c] = this.C[this.I] || this.C[this.F], this.T += 228;
                break;
              case 131:
                this.C[this.c] = this.C[this.I] >= this.C[this.F], this.T = 3 * this.T - 41;
                break;
              case 138:
                this.C[this.c] = this.C[this.I] == this.C[this.F], this.T = 2 * this.T + 76;
                break;
              case 140:
                this.C[this.c] = this.C[this.I] % this.C[this.F], this.T += 212;
                break;
              case 147:
                this.C[this.c] = this.C[this.I] / this.C[this.F], this.T += 205;
                break;
              case 154:
                this.C[this.c] = this.C[this.I] * this.C[this.F], this.T += 198;
                break;
              case 161:
                this.C[this.c] = this.C[this.I] - this.C[this.F], this.T += 191;
                break;
              case 168:
                this.C[this.c] = this.C[this.I] + this.C[this.F], this.T = 2 * this.T + 16;
                break;
              case 254:
                this.C[this.c] = eval(i), this.T += 20 < this.M[11] ? 98 : 89;
                break;
              case 255:
                this.s = C || 0, this.M[26] = 52, this.T += this.M[13] ? 8 : 6;
                break;
              case 258:
                g = {};
                for (var F = 0; F < this.k; F++)
                  e = this.i.pop(), a = this.i.pop(), g[a] = e;
                this.C[this.W] = g, this.T += 94;
                break;
              case 261:
                this.D = s || [], this.M[11] = 68, this.T += this.M[26] ? 3 : 5;
                break;
              case 264:
                this.M[15] = 16, this.T = "string" == typeof A ? 331 : 336;
                break;
              case 266:
                this.C[this.I][i] = this.i.pop(), this.T += 86;
                break;
              case 278:
                this.C[this.c] = this.C[this.I][i], this.T += this.M[22] ? 63 : 74;
                break;
              case 283:
                this.C[this.c] = eval(String.fromCharCode(this.C[this.I]));
                break;
              case 300:
                S = this.U(), this.M[0] = 66, this.T += this.M[11];
                break;
              case 331:
                D = atob(A), w = D.charCodeAt(0) << 16 | D.charCodeAt(1) << 8 | D.charCodeAt(2);
                for (var k = 3; k < w + 3; k += 3)
                  this.G.push(D.charCodeAt(k) << 16 | D.charCodeAt(k + 1) << 8 | D.charCodeAt(k + 2));
                for (V = w + 3; V < D.length; )
                  E = D.charCodeAt(V) << 8 | D.charCodeAt(V + 1), T = D.slice(V + 2, V + 2 + E), this.D.push(T), V += E + 2;
                this.M[21] = 8, this.T += 1e3 < V ? 21 : 35;
                break;
              case 336:
                this.G = A, this.D = s, this.M[18] = 134, this.T += this.M[15];
                break;
              case 344:
                this.T = 3 * this.T - 8;
                break;
              case 350:
                U = 66, M = [], I = this.D[this.k];
                for (var W = 0; W < I.length; W++)
                  M.push(String.fromCharCode(24 ^ I.charCodeAt(W) ^ U)), U = 24 ^ I.charCodeAt(W) ^ U;
                r = parseInt(M.join("").split("|")[1]), this.C[this.W] = this.i.slice(this.i.length - r), this.i = this.i.slice(0, this.i.length - r), this.T += 2;
                break;
              case 352:
                this.e = this.G[this.s++], this.T -= this.M[26];
                break;
              case 360:
                this.a = S, this.T += this.M[0];
                break;
              case 368:
                this.T -= 500 < S - this.a ? 24 : 8;
                break;
              case 380:
                this.i.push(16383 & this.e), this.T -= 28;
                break;
              case 400:
                this.i.push(this.S[16383 & this.e]), this.T -= 48;
                break;
              case 408:
                this.T -= 64;
                break;
              case 413:
                this.C[this.e >> 15 & 7] = (this.e >> 18 & 1) == 0 ? 32767 & this.e : this.S[32767 & this.e], this.T -= 61;
                break;
              case 418:
                this.S[65535 & this.e] = this.C[this.e >> 16 & 7], this.T -= this.e >> 16 < 20 ? 66 : 80;
                break;
              case 423:
                this.c = this.e >> 16 & 7, this.I = this.e >> 13 & 7, this.F = this.e >> 10 & 7, this.J = 1023 & this.e, this.T -= 255 + 6 * this.J + this.J % 5;
                break;
              case 426:
                this.T += 5 * (this.e >> 19) - 18;
                break;
              case 428:
                this.W = this.e >> 16 & 7, this.k = 65535 & this.e, this.t.push(this.s), this.h.push(this.S), this.s = this.C[this.W], this.S = [];
                for (var J = 0; J < this.k; J++)
                  this.S.unshift(this.i.pop());
                this.B.push(this.i), this.i = [], this.T -= 76;
                break;
              case 433:
                this.s = this.t.pop(), this.S = this.h.pop(), this.i = this.B.pop(), this.T -= 81;
                break;
              case 438:
                this.Q = this.C[this.e >> 16 & 7], this.T -= 86;
                break;
              case 440:
                U = 66, M = [], I = this.D[16383 & this.e];
                for (var b = 0; b < I.length; b++)
                  M.push(String.fromCharCode(24 ^ I.charCodeAt(b) ^ U)), U = 24 ^ I.charCodeAt(b) ^ U;
                M = M.join("").split("|"), O = parseInt(M.shift()), this.i.push(O === 0 ? M.join("|") : O === 1 ? -1 !== M.join().indexOf(".") ? parseInt(M.join()) : parseFloat(M.join()) : O === true + true ? eval(M.join()) : 3 === O ? null : void 0), this.T -= 88;
                break;
              case 443:
                this.b = this.e >> 2 & 65535, this.J = 3 & this.e, this.J === 0 ? this.s = this.b : this.J === 1 ? !!this.Q && (this.s = this.b) : 2 === this.J ? !this.Q && (this.s = this.b) : this.s = this.b, this.g = null, this.T -= 91;
                break;
              case 445:
                this.i.push(this.C[this.e >> 14 & 7]), this.T -= 93;
                break;
              case 448:
                this.W = this.e >> 16 & 7, this.k = this.e >> 2 & 4095, this.J = 3 & this.e, Q = this.J === 1 && this.i.pop(), G = this.i.slice(this.i.length - this.k, this.i.length), this.i = this.i.slice(0, this.i.length - this.k), c = 2 < G.length ? 3 : G.length, this.T += 6 * this.J + 1 + 10 * c;
                break;
              case 449:
                this.C[3] = this.C[this.W](), this.T -= 97 - G.length;
                break;
              case 455:
                this.C[3] = this.C[this.W][Q](), this.T -= 103 + G.length;
                break;
              case 453:
                B = this.e >> 17 & 3, this.T = B === 0 ? 445 : B === 1 ? 380 : B === true + true ? 400 : 440;
                break;
              case 458:
                this.J = this.e >> 17 & 3, this.c = this.e >> 14 & 7, this.I = this.e >> 11 & 7, i = this.i.pop(), this.T -= 12 * this.J + 180;
                break;
              case 459:
                this.C[3] = this.C[this.W](G[0]), this.T -= 100 + 7 * G.length;
                break;
              case 461:
                this.C[3] = new this.C[this.W](), this.T -= 109 - G.length;
                break;
              case 463:
                U = 66, M = [], I = this.D[65535 & this.e];
                for (var n = 0; n < I.length; n++)
                  M.push(String.fromCharCode(24 ^ I.charCodeAt(n) ^ U)), U = 24 ^ I.charCodeAt(n) ^ U;
                M = M.join("").split("|"), O = parseInt(M.shift()), this.T += 10 * O + 3;
                break;
              case 465:
                this.C[3] = this.C[this.W][Q](G[0]), this.T -= 13 * G.length + 100;
                break;
              case 466:
                this.C[this.e >> 16 & 7] = M.join("|"), this.T -= 114 * M.length;
                break;
              case 468:
                this.g = 65535 & this.e, this.T -= 116;
                break;
              case 469:
                this.C[3] = this.C[this.W](G[0], G[1]), this.T -= 119 - G.length;
                break;
              case 471:
                this.C[3] = new this.C[this.W](G[0]), this.T -= 118 + G.length;
                break;
              case 473:
                throw this.C[this.e >> 16 & 7];
              case 475:
                this.C[3] = this.C[this.W][Q](G[0], G[1]), this.T -= 123;
                break;
              case 476:
                this.C[this.e >> 16 & 7] = -1 !== M.join().indexOf(".") ? parseInt(M.join()) : parseFloat(M.join()), this.T -= this.M[21] < 10 ? 124 : 126;
                break;
              case 478:
                t = [0].concat(x(this.S)), this.V = 65535 & this.e, h = this, this.C[3] = function(e2) {
                  var n2 = new l();
                  return n2.S = t, n2.S[0] = e2, n2.O(h.G, h.V, h.D), n2.C[3];
                }, this.T -= 50 < this.M[3] ? 120 : 126;
                break;
              case 479:
                this.C[3] = this.C[this.W].apply(null, G), this.M[3] = 168, this.T -= this.M[9] ? 127 : 128;
                break;
              case 481:
                this.C[3] = new this.C[this.W](G[0], G[1]), this.T -= 10 * G.length + 109;
                break;
              case 483:
                this.J = this.e >> 15 & 15, this.W = this.e >> 12 & 7, this.k = 4095 & this.e, this.T = 0 === this.J ? 258 : 350;
                break;
              case 485:
                this.C[3] = this.C[this.W][Q].apply(null, G), this.T -= this.M[15] % 2 == 1 ? 143 : 133;
                break;
              case 486:
                this.C[this.e >> 16 & 7] = eval(M.join()), this.T -= this.M[18];
                break;
              case 491:
                this.C[3] = new this.C[this.W].apply(null, G), this.T -= this.M[8] / this.M[1] < 10 ? 139 : 130;
                break;
              case 496:
                this.C[this.e >> 16 & 7] = null, this.T -= 10 < this.M[5] - this.M[3] ? 160 : 144;
                break;
              case 506:
                this.C[this.e >> 16 & 7] = void 0, this.T -= this.M[18] % this.M[12] == 1 ? 154 : 145;
                break;
              default:
                this.T = this.w;
            }
          } catch (A2) {
            this.g && (this.s = this.g), this.T -= 114;
          }
      }, "undefined" != typeof window && (S.__ZH__ = S.__ZH__ || {}, h = S.__ZH__.zse = S.__ZH__.zse || {}, new l().O("ABt7CAAUSAAACADfSAAACAD1SAAACAAHSAAACAD4SAAACAACSAAACADCSAAACADRSAAACABXSAAACAAGSAAACADjSAAACAD9SAAACADwSAAACACASAAACADeSAAACABbSAAACADtSAAACAAJSAAACAB9SAAACACdSAAACADmSAAACABdSAAACAD8SAAACADNSAAACABaSAAACABPSAAACACQSAAACADHSAAACACfSAAACADFSAAACAC6SAAACACnSAAACAAnSAAACAAlSAAACACcSAAACADGSAAACAAmSAAACAAqSAAACAArSAAACACoSAAACADZSAAACACZSAAACAAPSAAACABnSAAACABQSAAACAC9SAAACABHSAAACAC/SAAACABhSAAACABUSAAACAD3SAAACABfSAAACAAkSAAACABFSAAACAAOSAAACAAjSAAACAAMSAAACACrSAAACAAcSAAACABySAAACACySAAACACUSAAACABWSAAACAC2SAAACAAgSAAACABTSAAACACeSAAACABtSAAACAAWSAAACAD/SAAACABeSAAACADuSAAACACXSAAACABVSAAACABNSAAACAB8SAAACAD+SAAACAASSAAACAAESAAACAAaSAAACAB7SAAACACwSAAACADoSAAACADBSAAACACDSAAACACsSAAACACPSAAACACOSAAACACWSAAACAAeSAAACAAKSAAACACSSAAACACiSAAACAA+SAAACADgSAAACADaSAAACADESAAACADlSAAACAABSAAACADASAAACADVSAAACAAbSAAACABuSAAACAA4SAAACADnSAAACAC0SAAACACKSAAACABrSAAACADySAAACAC7SAAACAA2SAAACAB4SAAACAATSAAACAAsSAAACAB1SAAACADkSAAACADXSAAACADLSAAACAA1SAAACADvSAAACAD7SAAACAB/SAAACABRSAAACAALSAAACACFSAAACABgSAAACADMSAAACACESAAACAApSAAACABzSAAACABJSAAACAA3SAAACAD5SAAACACTSAAACABmSAAACAAwSAAACAB6SAAACACRSAAACABqSAAACAB2SAAACABKSAAACAC+SAAACAAdSAAACAAQSAAACACuSAAACAAFSAAACACxSAAACACBSAAACAA/SAAACABxSAAACABjSAAACAAfSAAACAChSAAACABMSAAACAD2SAAACAAiSAAACADTSAAACAANSAAACAA8SAAACABESAAACADPSAAACACgSAAACABBSAAACABvSAAACABSSAAACAClSAAACABDSAAACACpSAAACADhSAAACAA5SAAACABwSAAACAD0SAAACACbSAAACAAzSAAACADsSAAACADISAAACADpSAAACAA6SAAACAA9SAAACAAvSAAACABkSAAACACJSAAACAC5SAAACABASAAACAARSAAACABGSAAACADqSAAACACjSAAACADbSAAACABsSAAACACqSAAACACmSAAACAA7SAAACACVSAAACAA0SAAACABpSAAACAAYSAAACADUSAAACABOSAAACACtSAAACAAtSAAACAAASAAACAB0SAAACADiSAAACAB3SAAACACISAAACADOSAAACACHSAAACACvSAAACADDSAAACAAZSAAACABcSAAACAB5SAAACADQSAAACAB+SAAACACLSAAACAADSAAACABLSAAACACNSAAACAAVSAAACACCSAAACABiSAAACADxSAAACAAoSAAACACaSAAACABCSAAACAC4SAAACAAxSAAACAC1SAAACAAuSAAACADzSAAACABYSAAACABlSAAACAC3SAAACAAISAAACAAXSAAACABISAAACAC8SAAACABoSAAACACzSAAACADSSAAACACGSAAACAD6SAAACADJSAAACACkSAAACABZSAAACADYSAAACADKSAAACADcSAAACAAySAAACADdSAAACACYSAAACACMSAAACAAhSAAACADrSAAACADWSAAAeIAAEAAACAB4SAAACAAySAAACABiSAAACABlSAAACABjSAAACABiSAAACAB3SAAACABkSAAACABnSAAACABrSAAACABjSAAACAB3SAAACABhSAAACABjSAAACABuSAAACABvSAAAeIABEAABCABkSAAACAAzSAAACABkSAAACAAySAAACABlSAAACAA3SAAACAAySAAACAA2SAAACABmSAAACAA1SAAACAAwSAAACABkSAAACAA0SAAACAAxSAAACAAwSAAACAAxSAAAeIABEAACCAAgSAAATgACVAAAQAAGEwADDAADSAAADAACSAAADAAASAAACANcIAADDAADSAAASAAATgADVAAATgAEUAAATgAFUAAATgAGUgAADAAASAAASAAATgADVAAATgAEUAAATgAFUAAATgAHUgAADAABSAAASAAATgADVAAATgAEUAAATgAFUAAATgAIUgAAcAgUSMAATgAJVAAATgAKUgAAAAAADAABSAAADAAAUAAACID/GwQPCAAYG2AREwAGDAABCIABGwQASMAADAAAUAAACID/GwQPCAAQG2AREwAHDAABCIACGwQASMAADAAAUAAACID/GwQPCAAIG2AREwAIDAABCIADGwQASMAADAAAUAAACID/GwQPEwAJDYAGDAAHG2ATDAAIG2ATDAAJG2ATKAAACAD/DIAACQAYGygSGwwPSMAASMAADAACSAAADAABUgAACAD/DIAACQAQGygSGwwPSMAASMAADAACCIABGwQASMAADAABUgAACAD/DIAACQAIGygSGwwPSMAASMAADAACCIACGwQASMAADAABUgAACAD/DIAAGwQPSMAASMAADAACCIADGwQASMAADAABUgAAKAAACAAgDIABGwQBEwANDAAAWQALGwQPDAABG2AREwAODAAODIAADQANGygSGwwTEwAPDYAPKAAACAAESAAATgACVAAAQAAGEwAQCAAESAAATgACVAAAQAAGEwAFDAAASAAADAAQSAAACAAASAAACAKsIAADCAAASAAADAAQUAAACID/GwQPSMAADAABUAAASAAASAAACAAASAAADAAFUgAACAABSAAADAAQUAAACID/GwQPSMAADAABUAAASAAASAAACAABSAAADAAFUgAACAACSAAADAAQUAAACID/GwQPSMAADAABUAAASAAASAAACAACSAAADAAFUgAACAADSAAADAAQUAAACID/GwQPSMAADAABUAAASAAASAAACAADSAAADAAFUgAADAAFSAAACAAASAAACAJ8IAACEwARDAARSAAACAANSAAACALdIAACEwASDAARSAAACAAXSAAACALdIAACEwATDAARDIASGwQQDAATG2AQEwAUDYAUKAAAWAAMSAAAWAANSAAAWAAOSAAAWAAPSAAAWAAQSAAAWAARSAAAWAASSAAAWAATSAAAWAAUSAAAWAAVSAAAWAAWSAAAWAAXSAAAWAAYSAAAWAAZSAAAWAAaSAAAWAAbSAAAWAAcSAAAWAAdSAAAWAAeSAAAWAAfSAAAWAAgSAAAWAAhSAAAWAAiSAAAWAAjSAAAWAAkSAAAWAAlSAAAWAAmSAAAWAAnSAAAWAAoSAAAWAApSAAAWAAqSAAAWAArSAAAeIAsEAAXWAAtSAAAWAAuSAAAWAAvSAAAWAAwSAAAeIAxEAAYCAAESAAATgACVAAAQAAGEwAZCAAkSAAATgACVAAAQAAGEwAaDAABSAAACAAASAAACAJ8IAACSMAASMAACAAASAAADAAZUgAADAABSAAACAAESAAACAJ8IAACSMAASMAACAABSAAADAAZUgAADAABSAAACAAISAAACAJ8IAACSMAASMAACAACSAAADAAZUgAADAABSAAACAAMSAAACAJ8IAACSMAASMAACAADSAAADAAZUgAACAAASAAADAAZUAAACIAASEAADIAYUEgAGwQQSMAASMAACAAASAAADAAaUgAACAABSAAADAAZUAAACIABSEAADIAYUEgAGwQQSMAASMAACAABSAAADAAaUgAACAACSAAADAAZUAAACIACSEAADIAYUEgAGwQQSMAASMAACAACSAAADAAaUgAACAADSAAADAAZUAAACIADSEAADIAYUEgAGwQQSMAASMAACAADSAAADAAaUgAACAAAEAAJDAAJCIAgGwQOMwAGOBG2DAAJCIABGwQASMAADAAaUAAAEAAbDAAJCIACGwQASMAADAAaUAAAEAAcDAAJCIADGwQASMAADAAaUAAAEAAdDAAbDIAcGwQQDAAdG2AQDAAJSAAADAAXUAAAG2AQEwAeDAAeSAAADAACSAAACALvIAACEwAfDAAJSAAADAAaUAAADIAfGwQQSMAASMAADAAJCIAEGwQASMAADAAaUgAADAAJCIAEGwQASMAADAAaUAAASAAASAAADAAJSAAADAAAUgAADAAJCIABGQQAEQAJOBCIKAAADAABTgAyUAAACIAQGwQEEwAVCAAQDIAVGwQBEwAKCAAAEAAhDAAhDIAKGwQOMwAGOBImDAAKSAAADAABTgAzQAAFDAAhCIABGQQAEQAhOBHoCAAASAAACAAQSAAADAABTgA0QAAJEwAiCAAQSAAATgACVAAAQAAGEwAjCAAAEAALDAALCIAQGwQOMwAGOBLSDAALSAAADAAiUAAADIALSEAADIAAUEgAGwQQCAAqG2AQSMAASMAADAALSAAADAAjUgAA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"));
      var D = function(t2) {
        return __g._encrypt(encodeURIComponent(t2));
      };
      exports.XL = A, exports.ZP = D;
    }
    var o = {};
    f1(void 0, o);
    return o.ZP(s);
  }
  var createCommentHeaders = (url) => {
    function K() {
      var t2 = new RegExp("d_c0=([^;]+)").exec(document.cookie);
      return t2 && t2[1];
    }
    var z = function(t2) {
      var e2 = new URL(t2, "https://www.zhihu.com");
      return "" + e2.pathname + e2.search;
    };
    var S2 = function(t2, e2, n2, r2) {
      var o2 = n2.zse93, i2 = n2.dc0, a2 = n2.xZst81, u = z(t2), c2 = "", s2 = [o2, u, i2, "", a2].filter(Boolean).join("+");
      return {
        source: s2,
        signature: zhihu_enc(md5(s2))
      };
    }(url, void 0, {
      zse93: "101_3_3.0",
      dc0: K(),
      xZst81: null
    });
    return {
      "x-zse-93": "101_3_3.0",
      "x-zse-96": "2.0_" + S2.signature
    };
  };
  function formatDataToHump(data) {
    if (!data)
      return data;
    if (Array.isArray(data)) {
      return data.map((item) => {
        return typeof item === "object" ? formatDataToHump(item) : item;
      });
    } else if (typeof data === "object") {
      const nData = {};
      Object.keys(data).forEach((prevKey) => {
        const nKey = prevKey.replace(/\_(\w)/g, (_, $1) => $1.toUpperCase());
        nData[nKey] = formatDataToHump(data[prevKey]);
      });
      return nData;
    }
    return data;
  }
  var requestComment = async ({
    url,
    answerId,
    orderBy = "score",
    offset = "",
    type = "answers"
  }) => {
    if (!answerId && !url)
      return void 0;
    const nUrl = url || `https://www.zhihu.com/api/v4/comment_v5/${type}/${answerId}/root_comment?order_by=${orderBy}&limit=20&offset=${offset}`;
    return fetch(nUrl, {
      method: "GET",
      headers: createCommentHeaders(nUrl)
    }).then((res) => res.json()).then((res) => formatDataToHump(res));
  };
  var requestCommentChild = async ({
    url,
    answerId,
    orderBy = "ts",
    offset = ""
  }) => {
    if (!answerId && !url)
      return void 0;
    const nUrl = url || `https://www.zhihu.com/api/v4/comment_v5/comment/${answerId}/child_comment?order_by=${orderBy}&limit=20&offset=${offset}`;
    return fetch(nUrl, {
      method: "GET",
      headers: createCommentHeaders(nUrl)
    }).then((res) => res.json()).then((res) => formatDataToHump(res));
  };
  var commonRequest = async (url, method = "GET", headers = new Headers()) => {
    if (!url)
      return void 0;
    return fetch(url, { method, headers }).then((res) => res.json()).then((res) => formatDataToHump(res));
  };
  var requestVote = async (contentType, voteType, contentId) => {
    const body = VoteTypeOb[voteType][contentType];
    if (!body)
      return void 0;
    return fetch(`https://www.zhihu.com/api/v4/${contentType}/${contentId}/voters`, {
      method: "POST",
      headers: {
        ...new Headers(),
        "Content-Type": "application/json"
      },
      body
    }).then((res) => res.json()).then((res) => formatDataToHump(res));
  };
  var requestCommentVote = async (commendId, like = true) => {
    if (!commendId)
      return void 0;
    return fetch(`https://www.zhihu.com/api/v4/comments/${commendId}/like`, {
      method: like ? "POST" : "DELETE",
      headers: new Headers()
    }).then((res) => res.json()).then((res) => formatDataToHump(res));
  };
  var requestAnswer = async (answerId) => {
    if (!answerId)
      return void 0;
    const url = `https://www.zhihu.com/api/v4/answers/${answerId}?include=is_visible%2Cpaid_info%2Cpaid_info_content%2Cadmin_closed_comment%2Creward_info%2Cannotation_action%2Cannotation_detail%2Ccollapse_reason%2Cis_normal%2Cis_sticky%2Ccollapsed_by%2Csuggest_edit%2Ccomment_count%2Cthanks_count%2Cfavlists_count%2Ccan_comment%2Ccontent%2Ceditable_content%2Cvoteup_count%2Creshipment_settings%2Ccomment_permission%2Ccreated_time%2Cupdated_time%2Creview_info%2Crelevant_info%2Cquestion%2Cexcerpt%2Cattachment%2Cis_labeled%2Creaction_instruction%2Cip_info%2Crelationship.is_authorized%2Cvoting%2Cis_thanked%2Cis_author%2Cis_nothelp%3Bauthor.vip_info%2Cbadge%5B*%5D.topics%3Bsettings.table_of_content.enabled`;
    return fetch(url, {
      method: "GET",
      headers: createCommentHeaders(url)
    }).then((res) => res.json()).then((res) => formatDataToHump(res));
  };
  var myLoadingToast = {
    open: () => domById("CTZ_LOADING_TOAST").style.display = "flex",
    hide: () => domById("CTZ_LOADING_TOAST").style.display = "none"
  };
  var myPreview = {
    // 开启预览弹窗
    open: function(src, even, isVideo) {
      const nameDom = isVideo ? this.evenPathVideo : this.evenPathImg;
      const idDom = isVideo ? this.idVideo : this.idImg;
      const nodeName = dom(nameDom);
      const nodeId = domById(idDom);
      nodeName && (nodeName.src = src);
      nodeId && (nodeId.style.display = "block");
      even && (this.even = even);
      myScroll.stop();
    },
    // 关闭预览弹窗
    hide: function(pEvent) {
      if (this.even) {
        this.even.click();
        this.even = null;
      }
      pEvent.style.display = "none";
      const nodeImg = dom(this.evenPathImg);
      const nodeVideo = dom(this.evenPathVideo);
      nodeImg && (nodeImg.src = "");
      nodeVideo && (nodeVideo.src = "");
      myScroll.on();
    },
    even: null,
    evenPathImg: "#CTZ_PREVIEW_IMAGE img",
    evenPathVideo: "#CTZ_PREVIEW_VIDEO video",
    idImg: "CTZ_PREVIEW_IMAGE",
    idVideo: "CTZ_PREVIEW_VIDEO"
  };
  var CLASS_BTN_EXPEND = "ctz-n-button-expend";
  var CLASS_BTN_CLOSE = "ctz-n-button-close";
  var CLASS_BTN_COMMENT = "ctz-n-button-comment";
  var CLASS_ACTIVE = "is-active";
  var CLASS_VOTE_UP = "VoteButton--up";
  var CLASS_VOTE_DOWN = "VoteButton--down";
  var addListenImage = (event) => {
    const target = event.target;
    if (target.nodeName === "IMG") {
      let src = target.src;
      if (target.classList.contains("ztext-gif")) {
        src = src.replace(".jpg", ".webp");
      }
      myPreview.open(src);
      return;
    }
  };
  var eventListenButton = (event) => {
    addListenImage(event);
    const target = event.target;
    Object.keys(eventMainObject).forEach((key) => {
      if (target.classList.contains(key)) {
        event.preventDefault();
        event.stopPropagation();
        eventMainObject[key](target);
      }
    });
  };
  var eventMainObject = {
    /** 展开更多 */
    [CLASS_BTN_EXPEND]: (currentNode) => {
      const nodeRich = domP(currentNode, "class", "RichContent");
      const nodeRichInner = nodeRich.querySelector(".RichContent-inner");
      const nodeBTNOther = nodeRich.querySelector(`.${CLASS_BTN_CLOSE}`);
      nodeRich.classList.remove("is-collapsed");
      nodeRichInner.style.maxHeight = "max-content";
      nodeBTNOther.style.display = "block";
      currentNode.style.display = "none";
    },
    /** 收起 */
    [CLASS_BTN_CLOSE]: (currentNode) => {
      const nodeRich = domP(currentNode, "class", "RichContent");
      const nodeRichInner = nodeRich.querySelector(".RichContent-inner");
      const nodeBTNOther = nodeRich.querySelector(`.${CLASS_BTN_EXPEND}`);
      const nodeActions = nodeRich.querySelector(".ContentItem-actions");
      nodeActions.style.cssText = "";
      nodeRich.classList.add("is-collapsed");
      nodeRichInner.style.maxHeight = "180px";
      nodeBTNOther.style.display = "block";
      currentNode.style.display = "none";
    },
    /** 评论 */
    [CLASS_BTN_COMMENT]: async (currentNode) => {
      const nodeContentItem = domP(currentNode, "class", "ContentItem");
      const dataZopJson = nodeContentItem.getAttribute("data-zop") || "{}";
      const dataZop = JSON.parse(dataZopJson);
      myListenComment.create(dataZop.itemId);
    },
    VoteButton: async (currentNode) => {
      const nodeContentItem = domP(currentNode, "class", "ContentItem");
      const contentType = nodeContentItem.querySelector('[itemprop="contentType"]').content;
      const contentId = nodeContentItem.querySelector('[itemprop="contentId"]').content;
      let voteType = 1 /* 中立 */;
      const currentClassList = currentNode.classList;
      if (!currentClassList.contains(CLASS_ACTIVE)) {
        voteType = currentClassList.contains(CLASS_VOTE_UP) ? 0 /* 赞同 */ : 2 /* 反对 */;
      }
      const res = await requestVote(contentType, voteType, contentId);
      if (!res)
        return;
      const { voting } = res;
      nodeContentItem.querySelectorAll(".VoteButton").forEach((item) => {
        item.classList.remove(CLASS_ACTIVE);
      });
      if (typeof voting !== "undefined") {
        voting !== 0 && currentNode.classList.add(CLASS_ACTIVE);
      }
    }
  };
  var openLoading = (box, className) => {
    if (box.querySelector(`.${className}`))
      return;
    box.appendChild(domC("div", { innerHTML: "<span>↻</span>", className }));
  };
  var removeByBox = (box, className) => {
    const nodeFind = box.querySelector(`.${className}`);
    nodeFind && nodeFind.remove();
  };
  var openEnd = (box, className) => {
    if (box.querySelector(`.${className}`))
      return;
    box.appendChild(domC("div", { innerText: "----- 没有更多了 -----", className }));
  };
  var innerHTMLContentItemMeta = (data, options) => {
    const { target } = data;
    const { extraHTML = "", haveTime, config } = options;
    const createdTime = data.createdTime || target.createdTime;
    const updatedTime = data.updatedTime || target.updatedTime;
    return `
<div class="ContentItem-meta">
  <div class="AuthorInfo AnswerItem-authorInfo AnswerItem-authorInfo--related" itemprop="author" itemscope="" itemtype="http://schema.org/Person">
    <div class="AuthorInfo AuthorInfo--mobile">
      <meta itemprop="name" content="${target.author.name}" />
      <meta itemprop="image" content="${target.author.avatarUrl}" />
      <meta itemprop="url" content="https://www.zhihu.com/people/${target.author.urlToken}" />
      <meta itemprop="zhihu:followerCount" />
      <span class="UserLink AuthorInfo-avatarWrapper">
        <a href="//www.zhihu.com/people/${target.author.urlToken}" target="_blank" class="UserLink-link" data-za-detail-view-element_name="User">
          <img class="Avatar AuthorInfo-avatar" src="${target.author.avatarUrl}" srcset="${target.author.avatarUrl} 2x" alt="${target.author.name}" />
        </a>
      </span>
      <div class="AuthorInfo-content">
        <div class="AuthorInfo-head">
          <span class="UserLink AuthorInfo-name">
            <a href="//www.zhihu.com/people/${target.author.urlToken}" target="_blank" class="UserLink-link" data-za-detail-view-element_name="User">${target.author.name}</a>
          </span>
        </div>
        <div class="AuthorInfo-detail">
          <div class="AuthorInfo-badge"><div class="ztext AuthorInfo-badgeText">${target.author.headline}</div></div>
        </div>
      </div>
      ${extraHTML}
    </div>
  </div>
  ${haveTime ? createTimeHTML(`${createdTime}000`, `${updatedTime}000`) : ""}
  ${config.showIP ? `<div>${target.ipInfo || ""}</div>` : ""}
  <div class="LabelContainer-wrapper"></div>
</div>
`;
  };
  var innerHTMLRichInnerAndAction = (data, options) => {
    const { moreLength = 400, moreMaxHeight = "180px" } = options || {};
    const { target } = data;
    const type = target.type;
    const isVideo = type === "zvideo";
    const isPin = type === "pin";
    const innerHTML = isVideo ? `
<a
  class="video-box"
  href="https://link.zhihu.com/?target=https%3A//www.zhihu.com/video/${target.thumbnailExtraInfo.videoId}"
  target="_blank"
  data-video-id=""
  data-video-playable=""
  data-name=""
  data-poster="${target.thumbnailExtraInfo.url}"
  data-lens-id="${target.thumbnailExtraInfo.videoId}"
>
  <img class="thumbnail" src="" />
  <span class="content">
    <span class="title">
      <span class="z-ico-extern-gray"></span>
      <span class="z-ico-extern-blue"></span>
    </span>
    <span class="url">
      <span class="z-ico-video"></span>
      https://www.zhihu.com/video/${target.thumbnailExtraInfo.videoId}
    </span>
  </span>
</a>
    ` : isPin ? target.contentHtml || target.content : target.content;
    const isMore = isVideo ? true : innerHTML.length > moreLength;
    const vDomContent = domC("div", { innerHTML });
    vDomContent.querySelectorAll("img").forEach((item) => {
      item.src = item.getAttribute("data-original") || item.getAttribute("data-actualsrc") || "";
    });
    vDomContent.querySelectorAll("a.video-box").forEach((item) => {
      const nItem = item;
      const nFrame = domC("iframe", {
        style: `border:none;width: calc(100vw - 32px);height: calc((100vw - 32px)/1.8);`,
        src: nItem.href
      });
      nItem.insertAdjacentElement("afterend", nFrame);
      nItem.style.display = "none";
    });
    const contentHTML = vDomContent.innerHTML;
    vDomContent.remove();
    const voteCount = target.voteupCount || target.voteCount || 0;
    const voting = target.relationship ? target.relationship.voting : 0;
    return `
<meta itemprop="upvoteCount" content="${voteCount}" />
<meta itemprop="commentCount" content="${target.commentCount}" />
<meta itemprop="contentType" content="${CONTENT_TYPE_OBJ[type].voteFetchType}" />
<meta itemprop="contentId" content="${target.id}" />
<div class="RichContent ${isMore ? "is-collapsed" : ""} RichContent--unescapable">
  <div class="RichContent-inner RichContent-inner--collapsed" style="${isMore ? `max-height: ${moreMaxHeight}` : ""}">${contentHTML}</div>
  <div class="ContentItem-actions">
    <button aria-label="赞同 ${voteCount}" aria-live="polite" type="button" class="Button VoteButton ${CLASS_VOTE_UP} ${voting === 1 ? CLASS_ACTIVE : ""}">
      ▲ 赞同 ${voteCount}
    </button>
    <button   aria-label="反对" aria-live="polite" type="button" class="Button VoteButton ${CLASS_VOTE_DOWN} VoteButton--mobileDown ${voting === -1 ? CLASS_ACTIVE : ""}">
      ▼
    </button>
    <button class="ctz-n-button-comment Button Button--plain Button--withIcon Button--withLabel">评论 ${target.commentCount}</button>
    ${isMore ? '<button class="ctz-n-button-close Button" style="display: none">收起 ▲</button>' : ""}
  </div>
  ${isMore ? '<button class="ctz-n-button-expend">展开更多 ▼</button>' : ""}
</div>
`;
  };
  var createHTMLCopyLink = (link) => `<button class="ctz-button ctz-button-transparent ${CLASS_COPY_LINK}" data-link="${link}" style="margin: 0px 8px">获取链接</button>`;
  var CONTENT_TYPE_OBJ = {
    answer: {
      name: "问题",
      bTypeClass: "c-ec7259",
      contentItem: "AnswerItem",
      nType: "Answer",
      voteFetchType: "answers" /* 回答 */,
      formatData: (target) => {
        return {
          itemTitle: target.question.title,
          itemHref: `https://www.zhihu.com/question/${target.question.id}`,
          itemHref2: `https://www.zhihu.com/question/${target.question.id}/answer/${target.id}`
        };
      }
    },
    article: {
      name: "文章",
      bTypeClass: "c-00965e",
      contentItem: "ArticleItem",
      nType: "Post",
      voteFetchType: "articles" /* 文章 */,
      formatData: (target) => {
        return {
          itemTitle: target.title,
          itemHref: `https://zhuanlan.zhihu.com/p/${target.id}`,
          itemHref2: `https://zhuanlan.zhihu.com/p/${target.id}`
        };
      }
    },
    zvideo: {
      name: "视频",
      bTypeClass: "c-12c2e9",
      contentItem: "ZVideoItem",
      nType: "ZVideo",
      voteFetchType: "zvideos" /* 视频 */,
      formatData: (target) => {
        return {
          itemTitle: target.title,
          itemHref: `https://www.zhihu.com/zvideo/${target.id}`,
          itemHref2: `https://www.zhihu.com/zvideo/${target.id}`
        };
      }
    },
    pin: {
      name: "想法",
      bTypeClass: "c-9c27b0",
      contentItem: "PinItem",
      nType: "Pin",
      voteFetchType: "",
      formatData: (target) => {
        return {
          itemTitle: target.title || "",
          itemHref: `https://www.zhihu.com/pin/${target.id}`,
          itemHref2: `https://www.zhihu.com/pin/${target.id}`
        };
      }
    }
  };
  var QUERY_LIST = ".ctz-comment-list";
  var CLASS_LOADING = "ctz-comment-loading";
  var ClASS_END = "ctz-comment-end";
  var CLASS_VOTE = "ctz-comment-vote";
  var CLASS_VOTE_UP2 = "ctz-comment-vote-up";
  var ACTIVE_STYLE = "color: rgb(25, 27, 31);background: #fff;";
  var myChangeCommentSort = {
    /** 默认排序 */
    score: () => {
      dom('.ctz-comment-sort>button[name="score"]').style.cssText = ACTIVE_STYLE;
      dom('.ctz-comment-sort>button[name="ts"]').style.cssText = "";
    },
    /** 时间排序 */
    ts: () => {
      dom('.ctz-comment-sort>button[name="ts"]').style.cssText = ACTIVE_STYLE;
      dom('.ctz-comment-sort>button[name="score"]').style.cssText = "";
    }
  };
  var eventVoteUp = async (currentNode) => {
    if (!currentNode.classList.contains(CLASS_VOTE))
      return;
    const prevIsVoteUp = currentNode.classList.contains(CLASS_VOTE_UP2);
    const commendId = currentNode.getAttribute("data-id");
    const res = await requestCommentVote(commendId, !prevIsVoteUp);
    if (!res)
      return;
    const nodeCount = currentNode.querySelector("span");
    const prevCount = +nodeCount.innerText || 0;
    if (prevIsVoteUp) {
      currentNode.classList.remove(CLASS_VOTE_UP2);
      nodeCount.innerText = String(prevCount - 1 >= 0 ? prevCount - 1 : 0);
    } else {
      currentNode.classList.add(CLASS_VOTE_UP2);
      nodeCount.innerText = String(prevCount + 1);
    }
  };
  var myListenComment = {
    page: {
      isEnd: true,
      isStart: true,
      next: "",
      previous: "",
      totals: 0
    },
    commentData: [],
    answerId: void 0,
    initOperate: function() {
      const me = this;
      domById(ID_CTZ_COMMENT)?.addEventListener("click", async (event) => {
        const nodeCurrent = event.target;
        const { id, name } = nodeCurrent;
        if (id === ID_CTZ_COMMENT_CLOSE) {
          dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`).scrollTop = 0;
          domById(ID_CTZ_COMMENT).style.display = "none";
          myScroll.on();
        }
        if (name === "comment-more") {
          const idComment = nodeCurrent.getAttribute("data-id") || void 0;
          const parentComment = me.commentData.find((i2) => `${i2.id}` === `${idComment}`);
          myListenCommentChild.create(idComment, parentComment);
        }
        if (name === "score" || name === "ts") {
          if (nodeCurrent.style.cssText)
            return;
          myChangeCommentSort[name] && myChangeCommentSort[name]();
          me.create(me.answerId, void 0, name);
        }
        eventVoteUp(nodeCurrent);
      });
      dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`).onscroll = throttle(() => {
        const { isEnd, next, totals } = me.page;
        if (isEnd || !next || me.commentData.length >= totals)
          return;
        const nodeContentDiv = dom(`#${ID_CTZ_COMMENT} ${QUERY_LIST}`);
        const bounding = nodeContentDiv.getBoundingClientRect();
        if (bounding.bottom - 100 <= window.innerHeight) {
          openLoading(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`), CLASS_LOADING);
          me.commentLoadMore();
        }
      }, 300);
    },
    /** 打开｜创建评论弹窗 */
    create: async function(answerId, _, orderBy = "score", type = "answers") {
      myLoadingToast.open();
      this.answerId = answerId;
      const res = await requestComment({ answerId, orderBy, type });
      myLoadingToast.hide();
      if (!res)
        return;
      const nodeComment = domById(ID_CTZ_COMMENT);
      nodeComment.querySelector(".ctz-comment-count>span").innerHTML = `${res.paging.totals}`;
      const innerHTML = res.commentStatus.type ? `<div style="text-align:center;">${res.commentStatus.text}</div>` : createCommentHTML(res.data);
      nodeComment.querySelector(QUERY_LIST).innerHTML = innerHTML;
      myChangeCommentSort[orderBy]();
      removeByBox(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`), ClASS_END);
      removeByBox(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`), CLASS_LOADING);
      nodeComment.style.display = "flex";
      this.page = res.paging;
      this.commentData = res.data;
      if (res.paging.isEnd) {
        openEnd(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`), ClASS_END);
      }
      myScroll.stop();
    },
    /** 评论列表加载更多 */
    commentLoadMore: async function() {
      const res = await requestComment({ url: this.page.next });
      if (!res || !res.data)
        return;
      const nodeCommentContentDiv = dom(`#${ID_CTZ_COMMENT} ${QUERY_LIST}`);
      this.page = res.paging;
      this.commentData = this.commentData.concat(res.data);
      nodeCommentContentDiv.innerHTML += createCommentHTML(res.data);
      removeByBox(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`), CLASS_LOADING);
      if (res.paging.isEnd) {
        openEnd(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`), ClASS_END);
      }
    }
  };
  var myListenCommentChild = {
    page: {
      isEnd: true,
      isStart: true,
      next: "",
      previous: "",
      totals: 0
    },
    commentData: [],
    answerId: void 0,
    initOperate: function() {
      const me = this;
      domById(ID_CTZ_COMMENT_CHILD).addEventListener("click", (event) => {
        const nodeCurrent = event.target;
        if (nodeCurrent.id === ID_CTZ_COMMENT_BACK) {
          dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`).scrollTop = 0;
          domById(ID_CTZ_COMMENT_CHILD).style.display = "none";
        }
        eventVoteUp(nodeCurrent);
      });
      dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`).onscroll = throttle(() => {
        const { isEnd, next, totals } = me.page;
        if (isEnd || !next || me.commentData.length >= totals)
          return;
        const nodeContentDiv = dom(`#${ID_CTZ_COMMENT_CHILD} ${QUERY_LIST}`);
        const bounding = nodeContentDiv.getBoundingClientRect();
        if (bounding.bottom - 100 <= window.innerHeight) {
          openLoading(domById(ID_CTZ_COMMENT_CHILD), CLASS_LOADING);
          me.commentLoadMore();
        }
      }, 300);
    },
    create: async function(answerId, parentData) {
      myLoadingToast.open();
      this.answerId = answerId;
      const res = await requestCommentChild({ answerId });
      myLoadingToast.hide();
      if (!res)
        return;
      const nodeComment = domById(ID_CTZ_COMMENT_CHILD);
      const parentCommentHTML = parentData ? createCommentHTMLItem(parentData, false, false) : "";
      nodeComment.querySelector(QUERY_LIST).innerHTML = parentCommentHTML + `<div class="ctz-comment-child-count">${res.paging.totals} 条回复</div>` + createCommentHTML(res.data);
      removeByBox(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`), ClASS_END);
      removeByBox(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`), CLASS_LOADING);
      nodeComment.style.display = "flex";
      this.page = res.paging;
      this.commentData = res.data;
      if (res.paging.isEnd) {
        openEnd(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`), ClASS_END);
      }
      myScroll.stop();
    },
    commentLoadMore: async function() {
      const res = await requestComment({ url: this.page.next });
      if (!res || !res.data)
        return;
      const nodeCommentContentDiv = dom(`#${ID_CTZ_COMMENT_CHILD} ${QUERY_LIST}`);
      this.page = res.paging;
      this.commentData = this.commentData.concat(res.data);
      nodeCommentContentDiv.innerHTML += createCommentHTML(res.data);
      removeByBox(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`), CLASS_LOADING);
      if (res.paging.isEnd) {
        openEnd(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`), ClASS_END);
      }
    }
  };
  var createCommentHTML = (data, isChild = false) => data.map((i2) => createCommentHTMLItem(i2, isChild)).join("");
  var createCommentHTMLItem = (item, isChild = false, haveChild = true) => {
    const { author, id, authorTag, content, createdTime, hot, likeCount, childComments = [], childCommentCount, childCommentNextOffset, replyToAuthor } = item;
    const vDomContent = domC("div", { innerHTML: content });
    vDomContent.querySelectorAll(".comment_img").forEach((i2) => {
      const nItem = i2;
      const nImage = domC("img", {
        src: nItem.href,
        style: " margin: 12px 0px 0px; display:block:width: 100px; height: 200px;"
      });
      nItem.insertAdjacentElement("afterend", nImage);
      nItem.style.display = "none";
    });
    const contentHTML = vDomContent.innerHTML;
    vDomContent.remove();
    return `
<div data-id="${id}">
  <div class="ctz-ci ${isChild ? "ctz-ci-child" : ""}">
    <div class="ctz-ci-avatar">
      <a href="//www.zhihu.com/people/${author.id}" target="_blank"><img class="Avatar" src="${author.avatarUrl}" srcset="${author.avatarUrl}" alt="invalid s" loading="lazy"></a>
    </div>
    <div class="ctz-ci-right">
      <div class="ctz-ci-user">
        <a href="//www.zhihu.com/people/${author.id}" target="_blank">${author.name}</a>
        ${authorTag.map(createUserTagHTML).join("")}
        ${replyToAuthor && replyToAuthor.name ? `<span>‣</span><a href="//www.zhihu.com/people/${replyToAuthor.id}" target="_blank">${replyToAuthor.name}</a>` : ""}
      </div>
      <div class="ctz-ci-content">${contentHTML}</div>
      <div class="ctz-ci-info">
        <div class="ctz-ci-info-left">
          <span>${timeFormatter(+`${createdTime}000`, "YYYY-MM-DD")}</span>
          ${hot ? '<span style="color: rgb(255, 150, 7);font-weight:bold;">热评</span>' : ""}
        </div>
        <div class="ctz-ci-info-right">
          <span class="${CLASS_VOTE} ${item.liked ? CLASS_VOTE_UP2 : ""}" data-id="${id}">❤︎ <span>${likeCount}</span></span>
        </div>
      </div>
    </div>
  </div>
  ${haveChild ? childComments.map((i2) => createCommentHTMLItem(i2, true)).join("") : ""}
  ${haveChild && childCommentCount > childComments.length ? `<button class="ctz-comment-button" name="comment-more" data-next-offset="${childCommentNextOffset}" data-id="${id}">查看全部 ${childCommentCount} 条回复 ➤</button>` : ""}
</div>`;
  };
  var createUserTagHTML = (item) => {
    const { hasBorder, borderColor, color, text } = item;
    return `<div class="ctz-tag" style="${hasBorder ? `border: 1px solid ${borderColor};` : ""}color: ${color};">${text}</div>`;
  };
  var initOperate = () => {
    const myOperation = {
      [CLASS_INPUT_CLICK]: fnChanger,
      [CLASS_INPUT_CHANGE]: fnChanger,
      "ctz-button": (even) => {
        myButtonOperate[even.name] && myButtonOperate[even.name](even);
      }
    };
    const operation = (even) => {
      const target = even.target;
      const classList = target.classList;
      for (let key in myOperation) {
        classList.contains(key) && myOperation[key](even.target);
      }
    };
    const nodeCTZContent = dom(".ctz-content");
    if (nodeCTZContent) {
      nodeCTZContent.addEventListener("click", operation);
      nodeCTZContent.onchange = operation;
    }
    dom(".ctz-menu").onclick = myMenu.click;
    domA(".ctz-content-top").forEach((i2) => {
      i2.addEventListener("click", myMenu2.click);
    });
    domById("CTZ_OPEN_BUTTON").addEventListener("click", myDialog.open);
    domById("CTZ_CLOSE_DIALOG").addEventListener("click", myDialog.hide);
    myListenComment.initOperate();
    myListenCommentChild.initOperate();
    domById("CTZ_PREVIEW_IMAGE").addEventListener("click", function() {
      myPreview.hide(this);
    });
    document.body.addEventListener("click", function(event) {
      const target = event.target;
      if (target.classList.contains(CLASS_COPY_LINK)) {
        const link = target.getAttribute("data-link");
        copy(link);
        message("链接复制成功");
      }
    });
  };
  var Store = class {
    constructor() {
      /** 页面高度 */
      this.pageHeight = 0;
      /** 回答屏蔽的标签 */
      this.hiddenTags = [];
      /** 回答屏蔽的用户 */
      this.hiddenUsers = [];
      this.setPageHeight = this.setPageHeight.bind(this);
      this.getPageHeight = this.getPageHeight.bind(this);
      this.initSetHidden = this.initSetHidden.bind(this);
      this.getHidden = this.getHidden.bind(this);
    }
    setPageHeight(height) {
      this.pageHeight = height;
    }
    getPageHeight() {
      return this.pageHeight;
    }
    async initSetHidden() {
      const config = await myStorage.getConfig();
      const nHiddenTags = Object.keys(HIDDEN_ANSWER_TAG).filter((i2) => !!config[i2]).map((i2) => HIDDEN_ANSWER_TAG[i2]);
      this.hiddenTags = nHiddenTags;
      const nHiddenUsers = Object.keys(HIDDEN_ANSWER_ACCOUNT).filter((i2) => !!config[i2]).map((i2) => HIDDEN_ANSWER_ACCOUNT[i2]);
      config.removeAnonymousAnswer && nHiddenUsers.push("匿名用户");
      this.hiddenUsers = nHiddenUsers;
    }
    getHidden() {
      return {
        hiddenTags: this.hiddenTags,
        hiddenUsers: this.hiddenUsers
      };
    }
  };
  var store = new Store();
  var CLASS_ANSWER_ITEM = "ctz-answer-item";
  var myListenAnswer = {
    next: "",
    end: false,
    loading: false,
    init: async function() {
      const nodeQuestionMain = dom(".Question-main");
      if (!nodeQuestionMain) {
        setTimeout(() => {
          fnLog("cannot find .Question-main, waiting to reload...");
          myListenAnswer.init();
        }, 500);
        return;
      }
      const config = await myStorage.getConfig();
      const nodeJsonData = domById("js-initialData");
      if (!nodeJsonData) {
        return;
      }
      const pageJsData = JSON.parse(nodeJsonData.innerText || "{}");
      nodeQuestionMain.addEventListener("click", (event) => {
        eventListenButton(event);
      });
      nodesStopPropagation([".RichContent-inner", ".Question-main figure img", ".Question-main a"], [addListenImage]);
      nodesStopPropagation([".RichContent-inner p"], [], "copy");
      const nodeQuestionAnswerContent = dom(".QuestionAnswer-content");
      if (nodeQuestionAnswerContent) {
        const locArr = location.pathname.split("/");
        const answerId = locArr[4];
        const res = await requestAnswer(answerId);
        if (!res)
          return;
        const nodeQuestionAnswerContent2 = dom(".QuestionAnswer-content");
        nodeQuestionAnswerContent2.innerHTML = createListItemHTML({ target: res, targetType: "answer" }, config);
        if (!dom(".Card.ViewAll")) {
          const questions = pageJsData.initialState.entities.questions;
          const question = questions[Object.keys(questions)[0]];
          const nNode = domC("div", {
            className: "Card ViewAll ViewAll--bottom",
            innerHTML: `<a href="/question/${question.id}" class="QuestionMainAction ViewAll-QuestionMainAction" data-za-detail-view-element_name="ViewAll" style="color: rgb(23, 81, 153);">查看全部 ${question.answerCount || 0} 个回答</a>`
          });
          nNode.setAttribute("data-za-detail-view-path-module", "MessageItem");
          nNode.setAttribute("data-za-extra-module", `{&quot;card&quot;:{&quot;content&quot;:{&quot;item_num&quot;:${question.answerCount || 0}}}}`);
          insertAfter(nNode, nodeQuestionAnswerContent2.parentElement);
        }
      } else {
        const questionId = location.pathname.replace("/question/", "");
        const currentQuestion = pageJsData.initialState.question.answers[questionId];
        if (currentQuestion) {
          const next = currentQuestion.next;
          this.next = next;
          this.end = !next;
        }
        const prevAnswers = pageJsData.initialState.entities.answers;
        const prevDataList = Object.keys(prevAnswers).map((i2) => ({
          target: formatDataToHump(prevAnswers[i2]),
          targetType: "answer"
        }));
        const topCurrentData = prevDataList.pop();
        const nodeTopList = dom(".List .List");
        if (topCurrentData) {
          nodeTopList.innerHTML = createListItemHTML(topCurrentData, config);
          const nodeLists = domA(".Question-main .List");
          const nodeListContent = nodeLists[nodeLists.length - 1];
          nodeListContent.innerHTML = createListHTML(prevDataList, config);
        }
        this.checkListHeight();
      }
      setTimeout(() => {
        const nodeAnswers = domA(".List-item");
        if (nodeAnswers.length && !nodeAnswers[0].classList.contains(CLASS_ANSWER_ITEM)) {
          fnLog("answers is covered, need do reload init");
          myListenAnswer.init();
        }
      }, 500);
    },
    /** 滚动时回答内容处理 */
    scroll: async function() {
      const nodeAnswers = domA(".ContentItem");
      const windowHeight = window.innerHeight;
      for (let i2 = 0, len = nodeAnswers.length; i2 < len; i2++) {
        const nodeItem = nodeAnswers[i2];
        const nodeClose = nodeItem.querySelector(`.${CLASS_BTN_CLOSE}`);
        if (!nodeClose || nodeClose.style.display === "none")
          continue;
        const bounding2 = nodeItem.getBoundingClientRect();
        const nodeActions = nodeItem.querySelector(".ContentItem-actions");
        if (bounding2.bottom < windowHeight || bounding2.top > windowHeight) {
          if (nodeActions.style.cssText) {
            nodeActions.style.cssText = "";
          }
          continue;
        }
        nodeActions.style.cssText += `position: fixed; bottom: 0; left: 0; width: 100%!important; margin: 0;box-shadow: 0 -1px 3px rgba(25,27,31,0.1);`;
      }
      const nodeLists = domA(".Question-main .List");
      if (!nodeLists.length)
        return;
      const nodeListContent = nodeLists[nodeLists.length - 1];
      const bounding = nodeListContent.getBoundingClientRect();
      if (bounding.bottom - 200 <= window.innerHeight && !this.end && !this.loading) {
        this.requestData(nodeListContent);
      }
    },
    requestData: async function(nodeListContent) {
      this.loading = true;
      openLoading(nodeListContent, "ctz-answer-loading");
      const res = await commonRequest(this.next);
      removeByBox(nodeListContent, "ctz-answer-loading");
      this.loading = false;
      if (!res)
        return;
      fnLog(res);
      const { paging, data } = res;
      if (paging.next === this.next)
        return;
      this.end = paging.isEnd;
      this.next = paging.next;
      const config = await myStorage.getConfig();
      nodeListContent.innerHTML += createListHTML(data, config);
      paging.isEnd && openEnd(nodeListContent, "ctz-answer-end");
      this.checkListHeight();
    },
    /** 检测元素高度 */
    checkListHeight: function() {
      const nodeLists = domA(".Question-main .List");
      if (!nodeLists.length)
        return;
      const nodeListContent = nodeLists[nodeLists.length - 1];
      if (nodeListContent.offsetHeight < window.innerHeight) {
        this.requestData(nodeListContent);
      }
    }
  };
  var createListHTML = (data, config) => data.map((i2) => createListItemHTML(i2, config)).join("");
  var createListItemHTML = (data, config) => {
    const { releaseTimeForAnswer, copyAnswerLink } = config;
    const { targetType, target } = data;
    const { hiddenTags, hiddenUsers } = store.getHidden();
    const answerTopCard = [];
    target.labelInfo && answerTopCard.push(`本回答节选自${target.labelInfo.text}`);
    for (let i2 = 0, len = hiddenTags.length; i2 < len; i2++) {
      if (answerTopCard.join().includes(hiddenTags[i2]))
        return "";
    }
    for (let i2 = 0, len = hiddenUsers.length; i2 < len; i2++) {
      if (target.author.name === hiddenUsers[i2])
        return "";
    }
    let extraHTML = "";
    copyAnswerLink && (extraHTML += createHTMLCopyLink(`https://www.zhihu.com/question/${target.question.id}/answer/${target.id}`));
    return `
<div class="List-item ${CLASS_ANSWER_ITEM}" tabindex="0">
  <div
    class="ContentItem AnswerItem ctz-self-item"
    data-za-index="0"
    data-zop='{"authorName":"${target.author.name}","itemId":${target.id},"title":"${target.question.title}","type":"${targetType}"}'
    name="${target.id}"
    itemprop="suggestedAnswer"
    itemtype="http://schema.org/Answer"
    itemscope=""
    data-za-detail-view-path-module="AnswerItem"
    data-za-detail-view-path-index="0"
    data-za-extra-module='{"card":{"has_image":false,"has_video":false,"content":{"type":"${targetType}","token":"${target.id}","upvote_num":${target.voteupCount},"comment_num":${target.commentCount},"publish_timestamp":null,"parent_token":"${target.question.id}","author_member_hash_id":"${target.author.id}"}}}'
  >
    ${innerHTMLContentItemMeta(data, {
      haveTime: releaseTimeForAnswer,
      extraHTML,
      config
    })}
    ${answerTopCard.length ? `<div class="KfeCollection-AnswerTopCard-Container">` + answerTopCard.map(
      (i2) => `<div class="KfeCollection-OrdinaryLabel-newStyle-mobile" style="margin-right: 6px;"><div class="KfeCollection-OrdinaryLabel-content">${i2}</div></div>`
    ).join("") + `</div>` : ""}
    ${innerHTMLRichInnerAndAction(data)}
  </div>
</div>`;
  };
  var fnListenArticle = () => {
    nodesStopPropagation([".RichContent-actions .VoteButton", ".BottomActions-CommentBtn"], [clickCommit]);
    nodesStopPropagation([".Post-content p"], [], "copy");
  };
  var clickCommit = (event) => {
    const target = event.target;
    if (target.classList.contains("BottomActions-CommentBtn")) {
      const id = location.pathname.replace("/p/", "");
      myListenComment.create(id, void 0, void 0, "articles");
    }
  };
  var myListenListRecommend = {
    next: "",
    loading: false,
    init: async function() {
      const nodeTopStoryRecommend = dom(".TopstoryMain") || dom(".NotLoggedInTopstory");
      if (!nodeTopStoryRecommend)
        return;
      nodeTopStoryRecommend.addEventListener("click", async function(event) {
        eventListenButton(event);
      });
      const nodeJsonData = domById("js-initialData");
      const config = await myStorage.getConfig();
      if (!nodeJsonData) {
        return;
      }
      const pageJsData = JSON.parse(nodeJsonData.innerText || "{}");
      const next = pageJsData.initialState.topstory.recommend.next;
      this.next = next;
      const currentData = pageJsData.initialState.topstory.recommend.serverPayloadOrigin;
      if (!currentData)
        return;
      const nodeTopstoryMain = dom(".TopstoryMain");
      if (!nodeTopstoryMain)
        return;
      const nodeListContent = nodeTopstoryMain.querySelector('[role="list"]');
      nodeListContent.innerHTML = createListHTML2(formatDataToHump(currentData.data), config);
    },
    scroll: function() {
      const nodeTopstoryMain = dom(".TopstoryMain");
      if (!nodeTopstoryMain)
        return;
      const bounding = nodeTopstoryMain.getBoundingClientRect();
      if (bounding.bottom - 200 <= window.innerHeight && !this.loading) {
        const nodeListContent = nodeTopstoryMain.querySelector('[role="list"]');
        this.requestData(nodeListContent);
      }
    },
    requestData: async function(nodeListContent) {
      this.loading = true;
      openLoading(nodeListContent, "ctz-list-loading");
      const res = await commonRequest(this.next);
      removeByBox(nodeListContent, "ctz-list-loading");
      this.loading = false;
      if (!res)
        return;
      fnLog(res);
      const { paging, data } = res;
      if (paging.next === this.next)
        return;
      this.next = paging.next;
      const config = await myStorage.getConfig();
      nodeListContent.innerHTML += createListHTML2(data, config);
      this.checkListHeight();
    },
    checkListHeight: function() {
      const nodeTopstoryMain = dom(".TopstoryMain");
      if (!nodeTopstoryMain)
        return;
      if (nodeTopstoryMain.offsetHeight < window.innerHeight) {
        const nodeListContent = nodeTopstoryMain.querySelector('[role="list"]');
        this.requestData(nodeListContent);
      }
    }
  };
  var addHistoryItem = async (data) => {
    const { target } = data;
    const type = target.type;
    const { name, bTypeClass, formatData } = CONTENT_TYPE_OBJ[type];
    const pfHistory = await myStorage.getHistory();
    const historyList = pfHistory.list;
    const { itemHref2, itemTitle } = formatData(target);
    let bType = `<b class="${bTypeClass}">「${name}」</b>`;
    const itemA = `<a href="${itemHref2}" target="_blank">${bType + itemTitle}</a>`;
    !historyList.includes(itemA) && historyList.unshift(itemA);
    myStorage.setHistoryItem("list", historyList);
  };
  var createListHTML2 = (data, config) => data.map((i2) => createListItemHTML2(i2, config)).join("");
  var createListItemHTML2 = (data, config) => {
    const { releaseTimeForList, copyAnswerLink, showToAnswer } = config;
    const { id, target, attachedInfo, brief } = data;
    const type = target.type;
    const { contentItem, nType, formatData } = CONTENT_TYPE_OBJ[type];
    const { itemHref, itemHref2, itemTitle } = formatData(target);
    addHistoryItem(data);
    let extraHTML = "";
    copyAnswerLink && (extraHTML += createHTMLCopyLink(itemHref2));
    showToAnswer && type === "answer" && (extraHTML += `<a href="${itemHref}" target="_blank" class="ctz-button ctz-button-transparent">直达问题</a>`);
    return `
<div class="Card TopstoryItem TopstoryItem-isRecommend ctz-recommend-item" tabindex="0">
  <div
    class="Feed"
    data-za-detail-view-path-module="FeedItem"
    data-za-detail-view-path-index="0"
    data-za-extra-module='{"card":{"card_type":"Feed","feed_id":"${id}","has_image":false,"has_video":false,"content":${brief}},"attached_info_bytes":"${attachedInfo}"}'
  >
    <div
      class="ContentItem ${contentItem}"
      data-zop='{"authorName":"${target.author.name}","itemId":${target.id},"title":"${itemTitle}","type":"${type}"}'
      name="${target.id}"
      itemprop="${type}"
      itemtype="http://schema.org/${nType}"
      itemscope=""
      data-za-detail-view-path-module="${contentItem}"
      data-za-detail-view-path-index="4"
      data-za-extra-module='{"card":{"has_image":false,"has_video":false,"content":{"type":"${nType}","token":"${target.id}","upvote_num":${target.voteupCount},"comment_num":${target.commentCount},"publish_timestamp":null,"author_member_hash_id":"${target.author.id}"}}}'
    >
      <h2 class="ContentItem-title">
        <div itemprop="zhihu:${type}" itemtype="http://schema.org/${nType}" itemscope="" style="display:inline;">
          <meta itemprop="url" itemprop="name" content="${itemHref}" />
          <meta content="${itemTitle}"/>
          <a target="_blank" data-za-detail-view-element_name="Title" data-za-detail-view-id="2812" href="${itemHref2}">${itemTitle}</a>
        </div>
      </h2>
      ${innerHTMLContentItemMeta(data, {
      extraHTML,
      haveTime: releaseTimeForList,
      config
    })}
      ${innerHTMLRichInnerAndAction(data, { moreLength: 40, moreMaxHeight: "100px" })}
    </div>
  </div>
</div>`;
  };
  var addQuestionLogButton = async () => {
    const { showQuestionLog } = await myStorage.getConfig();
    const nodeBtnGroup = dom(".MobileQuestionButtonGroup");
    const className = "ctz-question-log";
    const prevBtn = dom(`.${className}`);
    if (!showQuestionLog || !nodeBtnGroup || prevBtn)
      return;
    const nBtn = domC("button", {
      innerHTML: "查看问题日志",
      className: `ctz-button ctz-button-transparent ${className}`
    });
    nBtn.addEventListener("click", () => {
      const findPath = location.pathname.match(/\/question\/\d+/);
      if (findPath && findPath.length) {
        const nPathname = findPath[0];
        window.open(nPathname + "/log");
      }
    });
    nodeBtnGroup.appendChild(nBtn);
  };
  (function() {
    const { hostname, host, pathname } = location;
    if (!HTML_HOOTS.includes(hostname) || window.frameElement)
      return;
    GM_registerMenuCommand("⚙️ 设置", () => {
      myDialog.open();
    });
    store.initSetHidden();
    async function onDocumentStart() {
      if (!document.head || !document.body) {
        fnLog("not find head and body, waiting for reload...");
        setTimeout(() => {
          fnLog("to reload...");
          onDocumentStart();
        }, 500);
        return;
      }
      fnInitDomStyle("CTZ_STYLE", INNER_CSS);
      addHistoryView();
      onInitStyleExtra();
      EXTRA_CLASS_HTML[host] && dom("html").classList.add(EXTRA_CLASS_HTML[host]);
      initHTML();
      initOperate();
      echoData();
      loadBackground();
      myCustomStyle.init();
      echoHistory();
      setTimeout(() => {
        myListenListRecommend.init();
      }, 0);
      if (host === "zhuanlan.zhihu.com") {
        addTimeForArticle();
        fnListenArticle();
      }
      if (/question/.test(pathname)) {
        addTimeForQuestion();
        addQuestionLogButton();
        setTimeout(() => {
          myListenAnswer.init();
        }, 0);
      }
      fnLog("function onDocumentStart init");
    }
    onDocumentStart();
    window.addEventListener("load", () => {
      const nodeSignModal = dom(".signFlowModal");
      const nodeSignClose = nodeSignModal && nodeSignModal.querySelector(".Modal-closeButton");
      nodeSignClose && nodeSignClose.click();
    });
    document.addEventListener("copy", function(event) {
      let clipboardData = event.clipboardData || window.clipboardData;
      if (!clipboardData)
        return;
      const selection = window.getSelection();
      let text = selection ? selection.toString() : "";
      if (text) {
        event.preventDefault();
        clipboardData.setData("text/plain", text);
      }
    });
    window.addEventListener(
      "scroll",
      throttle(async () => {
        myListenAnswer.scroll();
        myListenListRecommend.scroll();
      }, 100),
      false
    );
    document.addEventListener("copy", function(event) {
      let clipboardData = event.clipboardData || window.clipboardData;
      if (!clipboardData)
        return;
      const selection = window.getSelection();
      let text = selection ? selection.toString() : "";
      if (text) {
        event.preventDefault();
        clipboardData.setData("text/plain", text);
      }
    });
  })();
})();

// ==UserScript==
// @name         知乎修改器移动版-持续更新
// @namespace    http://tampermonkey.net/
// @version      1.4.2
// @description  知乎修改器的移动版：列表标题类别显示功能设置，收起按钮悬浮设置，列表、问题详情、回答、文章内容置顶创建和修改时间设置，一键获取内容链接设置，问题详情添加查看问题日志按钮，自定义样式，隐藏模块，缓存列表和浏览历史记录等功能。
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
    hiddenAD: true
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
    showAllContent: true
  };
  var SAVE_HISTORY_NUMBER = 500;
  var HTML_HOOTS = ["www.zhihu.com", "zhuanlan.zhihu.com"];
  var NEED_CHANGE_NAVIGATOR_URL = ["www.zhihu.com/question/", "zhuanlan.zhihu.com/p/"];
  var CLASS_INPUT_CLICK = "ctz-i";
  var CLASS_INPUT_CHANGE = "ctz-i-change";
  var CLASS_TIME_ITEM = "ctz-list-item-time";
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
  var HIDDEN_ANSWER_TAG = {
    removeFromYanxuan: "盐选专栏",
    removeUnrealAnswer: "虚构创作",
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
      { value: "hiddenBottomSticky", label: "隐藏底部悬浮操作栏" },
      { value: "hiddenCommitImg", label: "隐藏评论区图片" }
    ],
    [
      { value: "hiddenAnswers", label: "隐藏列表回答内容" },
      { value: "hiddenListVideoContent", label: "隐藏列表视频回答的内容" },
      { value: "hiddenListImg", label: "隐藏列表图片" },
      { value: "hiddenReadMoreText", label: "隐藏列表「阅读全文」文字" }
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
      const c = nConfig ? JSON.parse(nConfig) : {};
      const configSave = { ...CONFIG_DEFAULT, ...c };
      return Promise.resolve(configSave);
    },
    getHistory: async function() {
      const nHistory = await myStorage.get(NAME_HISTORY);
      const h = nHistory ? JSON.parse(nHistory) : HISTORY_DEFAULT;
      return Promise.resolve(h);
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
  var dom = (n) => document.querySelector(n);
  var domById = (id) => document.getElementById(id);
  var domA = (n) => document.querySelectorAll(n);
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
  var fnReturnStr = (str, isHave = false, strFalse = "") => isHave ? str : strFalse;
  var fnLog = (...str) => console.log("%c「修改器」", "color: green;font-weight: bold;", ...str);
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
  var pathnameHasFn = (obj) => {
    const { pathname } = location;
    for (let name in obj) {
      pathname.includes(name) && obj[name]();
    }
  };
  var windowResize = () => {
    window.dispatchEvent(new Event("resize"));
  };
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
  var message = (value, t = 3e3) => {
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
    }, t);
  };
  var createBtnTr = (innerHTML, extraCLass = "") => {
    return domC("button", {
      innerHTML,
      className: `ctz-button ctz-button-transparent ${extraCLass}`,
      style: "margin: 0 8px;"
    });
  };
  var hexToRgba = (hex, opacity) => {
    return "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt("0x" + hex.slice(5, 7)) + "," + opacity + ")";
  };
  var initChangeNavigator = async () => {
    const { showAllContent } = await myStorage.getConfig();
    if (!showAllContent)
      return;
    const isNeedChange = (() => {
      const { href } = location;
      for (let i = 0, len = NEED_CHANGE_NAVIGATOR_URL.length; i < len; i++) {
        const item = NEED_CHANGE_NAVIGATOR_URL[i];
        if (href.includes(item)) {
          return true;
        }
      }
      return false;
    })();
    if (!isNeedChange)
      return;
    const customUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
    Object.defineProperty(navigator, "userAgent", {
      value: customUserAgent,
      writable: false
    });
  };
  var BASIC_SHOW_CONTENT = [
    { label: "隐藏修改器唤起按钮，可在脚本菜单<b>⚙️ 设置</b>打开", value: "openButtonInvisible" },
    { label: "<b>回答、文章</b>显示完整内容和评论", value: "showAllContent" },
    {
      label: `<b>列表</b>标题类别显示<span class="ctz-label-tag ctz-label-tag-Answer">问答</span><span class="ctz-label-tag ctz-label-tag-Article">文章</span><span class="ctz-label-tag ctz-label-tag-ZVideo">视频</span><span class="ctz-label-tag ctz-label-tag-Pin">想法</span>`,
      value: "questionTitleTag",
      needFetch: false
    },
    { label: "<b>收起</b>按钮悬浮", value: "suspensionPickup" },
    { label: "<b>列表</b>内容置顶创建和修改时间", value: "releaseTimeForList" },
    { label: "<b>问题详情</b>置顶创建和修改时间", value: "releaseTimeForQuestion" },
    { label: "<b>问题详情回答</b>置顶创建和修改时间", value: "releaseTimeForAnswer" },
    { label: "<b>文章</b>置顶创建时间", value: "releaseTimeForArticle" },
    { label: "一键获取内容链接", value: "copyAnswerLink" },
    { label: "<b>问题详情</b>显示<b>查看问题日志</b>按钮", value: "showQuestionLog" }
  ];
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
      const linkText = `.RelevantQuery li,.modal-dialog a,.ContentItem-more,.QuestionMainAction,a.UserLink-link,.RichContent--unescapable.is-collapsed .ContentItem-rightButton,.ContentItem-title a:hover,.css-b7erz1,.css-1vbwaf6,.css-1jj6qre,.css-jf1cpf,.css-vphnkw{color: deepskyblue!important;}`;
      const addPrefix = (i) => {
        return i.split(",").map((i2) => `html[data-theme=dark] ${i2}`).join(",");
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
      const cssBg = `${this.cssNamesBackground1}{background-color: ${background}!important;}`;
      const cssBg2 = `${this.cssNamesBackground2}{background-color:${background2}!important;background:${background2}!important;}`;
      const cssBgTransparent = `${this.cssNamesBackgroundTransparent}{background-color: transparent!important;background: transparent!important;}`;
      const loadingStyle = `.css-w2vj5n{background: ${background}!important;color: ${background2}!important;}`;
      const borderBg = `.KfeCollection-VipRecommendCard-article{border-color: ${background}!important;}`;
      return cssBg + cssBg2 + cssBgTransparent + loadingStyle + borderBg;
    },
    /** 修改器样式设置（不需要添加前缀） */
    doSetCSSInCTZ: function(background, background2) {
      const menuTopBeforeAfter = `.ctz-menu>a.target::after,.ctz-menu>a.target::before{${this.menuBeforeAfter(background2)}}`;
      const openButton = `#CTZ_OPEN_BUTTON{background: ${background}!important;}`;
      return menuTopBeforeAfter + openButton;
    },
    /** 使用背景色1的元素名称 */
    cssNamesBackground1: `#CTZ_DIALOG,#CTZ_BASIS_SHOW label b,.ctz-suspension-pickup,.ctz-content-top a.target,.ctz-message,#CTZ_DIALOG textarea,#CTZ_DIALOG .ctz-button,body,.App,.MobileAppHeader-searchBox,.Input-wrapper,.VideoAnswerPlayer-stateBar,.ColumnHomeColumnCard,.Toast-root-tU3yo,.AuthorsSection-author-tFZJF,.editable,textarea.zg-form-text-input,.zg-form-text-input>textarea,.ac-active,.PagingButton,[data-tooltip="回到顶部"],.css-d1dtt9,.css-k8i00s,.css-41c1px,.zm-editable-editor-field-wrap,.zu-question-suggest-topic-input,.zg-form-text-input,.zg-form-select,.css-4lspwd`,
    /** 使用背景色2的元素名称 */
    cssNamesBackground2: `.ctz-content,.ctz-menu>a.target,.Card,.Sticky,.ContentItem-more,.ContentItem-actions,.Popover-content,.Popover-arrow:after,.MobileAppHeader-expand,.CommentsForOia>div,.KfeCollection-VipRecommendCard,.OpenInAppButton>div,.Modal-inner,.MobileSearch-container,.ProfileBar,.MobileAppHeader,.ZVideo-mobile,.Post-content,.sgui-header,.MobileCollectionsHeader-tabs,.MobileModal-title--default,.MobileModal,.List-item,.Login,.Input-wrapper.SignFlow-accountInput,.SignFlowInput .Input-wrapper,.SearchTabs,.MobileEmptyPageWithType,.TopicHot-Header,.Favlists-mobileActions,[data-za-detail-view-path-module="SearchResultList"]>div,[data-za-detail-view-path-module="SearchResultList"]>div>a,.SearchSubTabs,.KfeCollection-PcCollegeCard-root,.modal-dialog,.ac-renderer,.css-hplpcn,.zh-add-question-form .add-question-splash-page .ac-renderer .ac-row.ac-last,.HeaderInfo-infoCard-orDxs,.Common-content-893LU,.ContentModule-module-9gTaH,.NewBottomBar-root-dVXzD,.AuthorModule-root-rxFMb,.css-w0m1iq,.zu-autocomplete-row-label,.ac-row.zu-autocomplete-row-search-link,.PostItem,.Recommendations-Main,.ErrorPage,.css-1e7fksk,.css-1gfesro,.css-ud510h,.css-vb0amv,.css-t89z5u,.css-u3vsx3>div,.css-5k4zcx,.css-13heq6w,.css-13heq6w>a,.css-1eltcns,.css-yoby3j,.css-l63y2t,.css-173civf,.css-1nalx0p,.css-mn9570,.css-4r7szo,.css-vkey2q,.css-ugzr12,.css-6v1k3,.css-1xj1964,.css-ggid2,.css-rhbxt0,.css-1j23ebo,.css-7wvdjh,.css-kt4t4n`,
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
      const chooseId = [...nodeMenuTop.children].map((i) => i.hash).find((i) => i === hash || hash.replace(i, "") !== hash);
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
      for (let i = 0, len = nodesA.length; i < len; i++) {
        nodesA[i].classList.remove("target");
      }
      targetForA.classList.add("target");
      const nodesDiv = domA(".ctz-content>div");
      for (let i = 0, len = nodesDiv.length; i < len; i++) {
        const item = nodesDiv[i];
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
      const target = [...domContentTop.children].find((i) => i.hash === hash);
      this.click({ target: target || domContentTop.children[0] });
    },
    click: function({ target }) {
      const chooseId = target.hash.replace(/#/, "");
      if (!chooseId)
        return;
      const nodesA = target.parentElement.children;
      for (let i = 0, len = nodesA.length; i < len; i++) {
        nodesA[i].classList.remove("target");
      }
      target.classList.add("target");
      const nodesDiv = target.parentElement.parentElement.querySelectorAll(".ctz-content-center>div");
      for (let i = 0, len = nodesDiv.length; i < len; i++) {
        const item = nodesDiv[i];
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
    let x = 0;
    let y = 0;
    domFind.addEventListener("touchstart", function(e) {
      startX = e.targetTouches[0].pageX;
      startY = e.targetTouches[0].pageY;
      x = this.offsetLeft;
      y = this.offsetTop;
      this.style.transition = "";
    });
    domFind.addEventListener("touchmove", function(e) {
      let moveX = e.targetTouches[0].pageX - startX;
      let moveY = e.targetTouches[0].pageY - startY;
      const left = x + moveX;
      const top = y + moveY;
      this.style.left = positionOne(left, maxLeft) + "px";
      this.style.top = positionOne(top, maxTop) + "px";
      e.preventDefault();
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
  var INNER_HTML = `<div id="CTZ_DIALOG" style="display: none"><div class="ctz-header"><span class="ctz-version"></span><div class="ctz-top-operate"><!-- <span id="CTZ_FETCH_STATUS">状态获取中...</span><button class="ctz-button" id="CTZ_CHANGE_FETCH" size="small">切换接口拦截</button> --></div><button id="CTZ_CLOSE_DIALOG"><i class="ctz-icon">&#xe61b;</i></button></div><div class="ctz-menu"></div><div class="ctz-content"><div id="CTZ_BASIS" style="display: none"><div class="ctz-content-top"><a href="#CTZ_BASIS_SHOW">显示</a><a href="#CTZ_BASIS_BACKGROUND">颜色</a><a href="#CTZ_BASIS_SETTING">配置</a></div><div class="ctz-content-center"><div id="CTZ_BASIS_SHOW" style="display: none"></div><div id="CTZ_BASIS_BACKGROUND" style="display: none"><div class="ctz-set-background"><div class="fwb mt8 ctz-background-title">外观</div><div id="CTZ_BACKGROUND" class="ctz-background-content"></div><div class="fwb mt8 ctz-background-title">浅色设置</div><div id="CTZ_BACKGROUND_LIGHT" class="ctz-background-content"></div><div class="fwb mt8 ctz-background-title">深色设置</div><div id="CTZ_BACKGROUND_DARK" class="ctz-background-content"></div></div></div><div id="CTZ_BASIS_SETTING" style="display: none"><button class="ctz-button" name="configExport" style="margin-right: 8px">获取当前配置</button><button class="ctz-button" name="configReset">恢复默认配置</button><div class="ctz-hidden-item-br"></div><div class="ctz-config-import-box"><div>配置导入</div><textarea name="textConfigImport" placeholder="配置参考获取的格式"></textarea><button class="ctz-button" name="configImport">确 定</button></div><div class="ctz-hidden-item-br"></div><div class="ctz-config-import-box"><div>自定义样式</div><textarea name="textStyleCustom" placeholder="示例: body{background: #ffffff;}"></textarea><div class="ctz-btn-box"><button class="ctz-button" name="styleCustom" style="margin-right: 12px">确 定</button><button class="ctz-button" name="styleCustomReset">清 空</button></div></div></div></div></div><div id="CTZ_HIDDEN" style="display: none"><div class="ctz-content-center"></div></div><div id="CTZ_FILTER" style="display: none"><!-- <div class="ctz-content-top"></div> --><div class="ctz-content-center"><div class="ctz-filter-defail-who"><div class="ctz-label">屏蔽以下官方账号的回答</div><div style="margin: 4px 0; border-bottom: 1px solid #ebebeb; padding-bottom: 4px"><label><input class="ctz-i" name="removeZhihuOfficial" type="checkbox" value="on" />所有知乎官方账号</label></div><div class="ctz-flex-wrap" style="margin: 4px 0; border-bottom: 1px solid #ebebeb; padding-bottom: 4px"><label><input class="ctz-i" name="removeStoryAnswer" type="checkbox" value="on" />故事档案局</label><label><input class="ctz-i" name="removeYanxuanAnswer" type="checkbox" value="on" />盐选科普</label><label><input class="ctz-i" name="removeYanxuanRecommend" type="checkbox" value="on" />盐选推荐</label><label><input class="ctz-i" name="removeYanxuanCPRecommend" type="checkbox" value="on" />盐选测评室</label></div></div><div class="ctz-flex-wrap" style="margin: 4px 0; border-bottom: 1px solid #ebebeb; padding-bottom: 4px"><label><span class="ctz-label">屏蔽「匿名用户」回答</span><input class="ctz-i" name="removeAnonymousAnswer" type="checkbox" value="on" /></label></div><div class="ctz-filter-defail-tag"><div class="ctz-label">屏蔽带有以下标签的回答</div><div class="ctz-flex-wrap"><label><input class="ctz-i" name="removeFromYanxuan" type="checkbox" value="on" />选自盐选专栏</label><label><input class="ctz-i" name="removeUnrealAnswer" type="checkbox" value="on" />带有虚构创作</label><label><input class="ctz-i" name="removeFromEBook" type="checkbox" value="on" />选自电子书</label></div></div></div></div><div id="CTZ_BLACKLIST" style="display: none"><div class="ctz-content-top"></div><div class="ctz-content-center">CTZ_BLACKLIST</div></div><div id="CTZ_HISTORY" style="display: none"><div class="ctz-content-top"><a href="#CTZ_HISTORY_LIST">推荐列表缓存</a><a href="#CTZ_HISTORY_VIEW">浏览历史记录</a></div><div class="ctz-content-center"><div id="CTZ_HISTORY_LIST" style="display: none"><button class="ctz-button" name="buttonHistoryClear" data-id="list">清空列表缓存</button><div class="ctz-set-content"></div><div class="ctz-commit ta-c mt8">--- 最多缓存500条，包含已过滤项 ---</div></div><div id="CTZ_HISTORY_VIEW" style="display: none"><button class="ctz-button" name="buttonHistoryClear" data-id="view">清空历史记录</button><div class="ctz-set-content"></div><div class="ctz-commit ta-c mt8">--- 最多缓存500条 ---</div></div></div></div></div></div><div id="CTZ_OPEN_BUTTON" class="ctz-icon">&#xe612;</div><div id="CTZ_MESSAGE_BOX"></div>`;
  var INNER_CSS = `.hover-style{cursor:pointer}.hover-style:hover{color:#1677ff !important}.ctz-btn-box{display:flex}.ctz-btn-box button{flex:1;margin-right:12px}.ctz-btn-box button:last-child{margin:0}.ctz-desc,.ctz-commit{font-size:14px;color:#999}.ctz-desc b,.ctz-commit b{color:#e55353}.ctz-desc{padding-left:4px}.dis-if-c{display:inline-flex;align-items:center}.ta-c{text-align:center}.fwb{font-weight:bold}.mt8{margin-top:8px}.bg-ec7259{background:#ec7259}.bg-12c2e9{background:#12c2e9}.bg-00965e{background:#00965e}.bg-9c27b0{background:#9c27b0}.c-ec7259{color:#ec7259}.c-12c2e9{color:#12c2e9}.c-00965e{color:#00965e}.c-9c27b0{color:#9c27b0}.ctz-button{outline:none;position:relative;display:inline-block;font-weight:400;white-space:nowrap;text-align:center;border:1px solid transparent;cursor:pointer;transition:all .3s;user-select:none;touch-action:manipulation;line-height:1.5;font-size:14px;height:32px;padding:4px 15px;border-radius:6px;background-color:#ffffff;border-color:#d9d9d9;color:rgba(0,0,0,0.88);box-shadow:0 2px 0 rgba(0,0,0,0.02)}.ctz-button:hover{color:#1677ff;border-color:#1677ff}.ctz-button:active{background:rgba(0,0,0,0.08) !important}.ctz-button[size='small'],.ctz-button.ctz-button-small{padding:2px 6px;font-size:12px;height:24px}.ctz-button.ctz-button-transparent{background:transparent}.ctz-button-red{color:#e55353 !important;border:1px solid #e55353 !important}.ctz-button-red:hover{color:#ec7259 !important;border:1px solid #ec7259 !important}.ctz-button:disabled{border-color:#d0d0d0;background-color:rgba(0,0,0,0.08);color:#b0b0b0;cursor:not-allowed}[name='buttonHistoryClear']{margin-bottom:12px}#CTZ_BACKGROUND,#CTZ_BACKGROUND_LIGHT,#CTZ_BACKGROUND_DARK{display:grid;gap:8px}#CTZ_BACKGROUND>label,#CTZ_BACKGROUND_LIGHT>label,#CTZ_BACKGROUND_DARK>label{position:relative;cursor:pointer}#CTZ_BACKGROUND>label input,#CTZ_BACKGROUND_LIGHT>label input,#CTZ_BACKGROUND_DARK>label input{position:absolute;pointer-events:none;width:20px;height:20px;top:18px;left:20px}#CTZ_BACKGROUND>label input:checked+div,#CTZ_BACKGROUND_LIGHT>label input:checked+div,#CTZ_BACKGROUND_DARK>label input:checked+div{border:4px solid #1677ff}#CTZ_BACKGROUND>label div,#CTZ_BACKGROUND_LIGHT>label div,#CTZ_BACKGROUND_DARK>label div{pointer-events:none;border:4px double #eee;font-size:14px;border-radius:12px;line-height:56px;padding-left:60px}#CTZ_BACKGROUND_LIGHT{color:#000}.ctz-set-background{margin:-12px}.ctz-set-background .ctz-background-title{padding:12px 12px 0}.ctz-set-background .ctz-background-content{padding:12px;border-bottom:1px solid #d9d9d9}.ctz-set-background .ctz-background-content:last-of-type{border:none}.zhuanlan .ColumnPageHeader,.Recommendations-List,.ContentItem-actions,.AnswerItem-authorInfo{overflow-x:auto}.Modal--large,.css-1aq8hf9,.css-5ijnlw,.css-1mnl0vg,.RichContent-actions,.zhuanlan .ColumnPageHeader-content{width:auto !important}.css-1aq8hf9{height:100% !important;max-height:100% !important}.css-hzocic{pointer-events:none}.css-hzocic .css-97fdvh,.css-hzocic .css-r4op92{pointer-events:auto}.css-hzocic::after{content:'❌';margin-left:10px;font-size:14px;pointer-events:auto}.ErrorPage-text::after{content:'这是知乎因为移动端加载了电脑端网页导致（移动网页端想查看完整的评论和回答内容只能用此方法），会在部分回答中出现这个问题。不是修改器问题，暂时无法解决，刷新或后退返回回答页面。';padding:24px}.css-nk32ej{display:none}@font-face{font-family:'tp-icon';src:url('//at.alicdn.com/t/c/font_2324733_3w6h6fk5917.woff2?t=1670580424651') format('woff2'),url('//at.alicdn.com/t/c/font_2324733_3w6h6fk5917.woff?t=1670580424651') format('woff'),url('//at.alicdn.com/t/c/font_2324733_3w6h6fk5917.ttf?t=1670580424651') format('truetype')}.ctz-icon{font-family:'tp-icon' !important;font-size:16px;font-style:normal;-webkit-font-smoothing:antialiased;-webkit-text-stroke-width:.2px;-moz-osx-font-smoothing:grayscale}.ctz-stop-scroll{height:100% !important;overflow:hidden !important}#CTZ_OPEN_BUTTON{position:fixed;font-size:34px;background:#e1e1e1;color:#000;opacity:.6;width:48px;height:48px;line-height:48px;border-radius:8px;z-index:2000;text-align:center}#CTZ_DIALOG{position:fixed;top:0;left:0;width:100%;height:100%;background:#f5f5f5;z-index:2001;font-size:16px;transition:all .2s;flex-direction:column}#CTZ_DIALOG input[type='checkbox']{width:16px;height:16px}#CTZ_DIALOG textarea{box-sizing:border-box;margin:0;padding:4px 11px;font-size:14px;line-height:1.5;list-style:none;position:relative;display:inline-block;min-width:0;border-width:1px;border-style:solid;border-color:#d9d9d9;border-radius:6px;transition:all .2s}#CTZ_DIALOG a{color:inherit}.ctz-header{font-size:16px;display:flex;align-items:center;height:48px;padding:0 12px}.ctz-top-operate{flex:1;padding:0 12px;font-size:12px}.ctz-version{font-size:16px}#CTZ_CLOSE_DIALOG{font-weight:bold;width:40px;height:40px;color:rgba(0,0,0,0.45);background:transparent;border:none}#CTZ_CLOSE_DIALOG i{font-size:12px}.ctz-menu{height:36px;display:flex}.ctz-menu>a{border-radius:12px 12px 0 0;flex:1;text-align:center;cursor:pointer;transition:initial !important;position:relative;display:flex;align-items:center;justify-content:center}.ctz-menu>a span{border-radius:8px;transition:all .3s;margin:0 4px;flex:1;box-sizing:border-box;align-items:center;line-height:26px}.ctz-menu>a.target{background:#fff}.ctz-menu>a.target::after,.ctz-menu>a.target::before{position:absolute;bottom:-12px;content:' ';background:radial-gradient(circle at top left, transparent 12px, #fff 0) top left,radial-gradient(circle at top right, transparent 12px, #fff 0) top right,radial-gradient(circle at bottom right, transparent 12px, #fff 0) bottom right,radial-gradient(circle at bottom left, transparent 12px, #fff 0) bottom left;background-size:50% 50%;background-repeat:no-repeat;width:24px;height:24px}.ctz-menu>a.target::before{left:-12px;z-index:-1}.ctz-menu>a.target::after{right:-12px;z-index:-1}.ctz-content{flex:1;overflow:hidden;background:#fff;border-radius:12px;padding:8px 0}.ctz-content>div{height:100%;flex-direction:column}.ctz-content-top{height:28px;display:flex;padding-bottom:8px}.ctz-content-top a{flex:1;text-align:center;line-height:28px;margin:0 8px;border-radius:8px}.ctz-content-top a.target{background-color:#f5f5f5}.ctz-content-top~.ctz-content-center{padding-top:0}.ctz-content-center{flex:1;overflow-y:auto;padding:12px}.ctz-content-center ::-webkit-scrollbar{width:8px;height:8px}.ctz-content-center ::-webkit-scrollbar-track{border-radius:0}.ctz-content-center ::-webkit-scrollbar-thumb{background:#bbb;transition:all .2s;border-radius:8px}.ctz-content-center ::-webkit-scrollbar-thumb:hover{background-color:rgba(95,95,95,0.7)}.ctz-hidden-item-br{margin:12px 0;width:100%;height:1px;position:relative}.ctz-hidden-item-br::after{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:65%;height:1px;background:#d9d9d9}#CTZ_HIDDEN .ctz-content-center label{margin-right:12px;margin-bottom:4px}#CTZ_BASIS_SHOW label{margin:8px 0}#CTZ_BASIS_SHOW label b{display:inline-block;padding:0 4px;background:#f5f5f5;border-radius:2px;margin-right:2px}.ctz-suspension-pickup{position:fixed;bottom:60px;right:14px;text-align:center;height:40px;line-height:40px;width:68px;border-radius:4px;font-size:14px;background:#fff}.ctz-label{font-size:14px;line-height:24px}.ctz-label::after{content:'：'}.ctz-flex-wrap{display:flex;flex-wrap:wrap;line-height:24px}.ctz-flex-wrap label{margin-right:4px;display:flex;align-items:center}.ctz-flex-wrap label input[type='radio']{margin:0 4px 0 0}.ctz-label-tag{font-weight:normal;padding:2px 4px;border-radius:4px;font-size:12px;color:#ffffff;margin:0 2px}.ctz-label-tag-Answer{background:#ec7259}.ctz-label-tag-ZVideo{background:#12c2e9}.ctz-label-tag-Article{background:#00965e}.ctz-label-tag-Pin{background:#9c27b0}#CTZ_HISTORY_LIST .ctz-set-content a,#CTZ_HISTORY_VIEW .ctz-set-content a{word-break:break-all;display:block;margin-bottom:12px;padding:6px 12px;border:1px solid #eee;border-radius:4px}.ctz-fetch-intercept .ctz-need-fetch{display:none}.ctz-fetch-intercept.ctz-fetch-intercept-close{color:#b0b0b0 !important;cursor:not-allowed}.ctz-fetch-intercept.ctz-fetch-intercept-close span.ctz-need-fetch{display:inline}.ctz-fetch-intercept.ctz-fetch-intercept-close div.ctz-need-fetch{display:block}.ctz-fetch-intercept.ctz-fetch-intercept-close .ctz-remove-block{cursor:not-allowed !important}.ctz-fetch-intercept.ctz-fetch-intercept-close .ctz-black-item .ctz-remove-block:hover,.ctz-fetch-intercept.ctz-fetch-intercept-close .ctz-black-item a:hover{background:transparent !important;color:#b0b0b0 !important}#CTZ_MESSAGE_BOX{position:fixed;left:0;top:10px;width:100%;z-index:2002}.ctz-message{margin:20px auto;width:70%;height:48px;display:flex;align-items:center;justify-content:center;font-size:14px;border-radius:8px;box-shadow:0 0 8px #d0d4d6,0 0 8px #e6eaec;margin-bottom:12px;background:#fff}.ctz-config-import-box{display:flex;flex-direction:column}.ctz-config-import-box>div,.ctz-config-import-box>textarea{margin-bottom:12px !important}.ctz-config-import-box textarea{height:120px;resize:vertical}`;
  var INNER_VERSION = `1.4.2`;
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
  var fnHiddenDom = (lessNum, ev, log) => {
    ev.style.display = "none";
    fnLog(log);
    return ++lessNum;
  };
  var fnIndexMath = (index, i, len, lessNum) => {
    return i + 1 === len ? i - lessNum >= 0 ? i - lessNum : 0 : index;
  };
  var CLASS_COPY_LINK = "ctz-copy-answer-link";
  var addAnswerCopyLink = async (nodeItem) => {
    const { copyAnswerLink } = await myStorage.getConfig();
    if (!copyAnswerLink)
      return;
    const prevButton = nodeItem.querySelector(`.${CLASS_COPY_LINK}`);
    prevButton && prevButton.remove();
    const nodeUser = nodeItem.querySelector(".AnswerItem-authorInfo>.AuthorInfo") || nodeItem.querySelector(".ContentItem-meta");
    if (!nodeUser)
      return;
    const nDomButton = createBtnTr("获取链接", CLASS_COPY_LINK);
    nDomButton.onclick = function() {
      const metaUrl = nodeItem.querySelector('.ContentItem>[itemprop="url"]');
      if (!metaUrl)
        return;
      const link = metaUrl.getAttribute("content") || "";
      if (link) {
        copy(link);
        message("链接复制成功");
        return;
      }
    };
    nodeUser.appendChild(nDomButton);
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
  var updateItemTime = (event) => {
    const nodeCreated = event.querySelector('[itemprop="dateCreated"]');
    const nodePublished = event.querySelector('[itemprop="datePublished"]');
    const nodeModified = event.querySelector('[itemprop="dateModified"]');
    const crTime = nodeCreated ? nodeCreated.content : "";
    const puTime = nodePublished ? nodePublished.content : "";
    const muTime = nodeModified ? nodeModified.content : "";
    const timeCreated = timeFormatter(crTime || puTime);
    const timeModified = timeFormatter(muTime);
    const nodeContentItemMeta = event.querySelector(".ContentItem-meta");
    if (!timeCreated || !nodeContentItemMeta)
      return;
    const innerHTML = `<div>创建时间：${timeCreated}</div><div>最后修改时间：${timeModified}</div>`;
    const domTime = event.querySelector(`.${CLASS_TIME_ITEM}`);
    if (domTime) {
      domTime.innerHTML = innerHTML;
    } else {
      nodeContentItemMeta.appendChild(
        domC("div", {
          className: CLASS_TIME_ITEM,
          innerHTML,
          style: "line-height: 24px;padding-top: 2px;font-size: 14px;"
        })
      );
    }
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
    nodeTitle.appendChild(
      domC("div", {
        className,
        innerHTML: `<div>创建时间：${timeFormatter(nodeCreated.content)}</div><div>最后修改时间：${timeFormatter(nodeModified.content)}</div>`,
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
  var myListenAnswerItem = {
    index: 0,
    init: async function() {
      const conf = await myStorage.getConfig();
      const {
        releaseTimeForAnswer,
        removeLessVoteDetail,
        lessVoteNumberDetail = 0,
        answerOpen,
        removeZhihuOfficial,
        removeBlockUserContent,
        removeBlockUserContentList,
        showBlockUser,
        removeAnonymousAnswer,
        topExportContent,
        blockWordsAnswer = [],
        fetchInterceptStatus,
        answerItemCreatedAndModifiedTime
      } = conf;
      const addFnInNodeItem = (nodeItem, initThis) => {
        if (!nodeItem)
          return;
        releaseTimeForAnswer && updateItemTime(nodeItem);
        addAnswerCopyLink(nodeItem);
      };
      addFnInNodeItem(dom(".QuestionAnswer-content"));
      const hiddenTags = Object.keys(HIDDEN_ANSWER_TAG);
      let hiddenUsers = [];
      for (let i in HIDDEN_ANSWER_ACCOUNT) {
        conf[i] && hiddenUsers.push(HIDDEN_ANSWER_ACCOUNT[i]);
      }
      const elements = domA(".Question-main .List-item");
      let lessNum = 0;
      for (let i = this.index, len = elements.length; i < len; i++) {
        let message2 = "";
        const nodeItem = elements[i];
        const nodeItemContent = nodeItem.querySelector(".ContentItem");
        if (!nodeItemContent)
          continue;
        let dataZop = {};
        let dataCardContent = {};
        try {
          dataZop = JSON.parse(nodeItemContent.getAttribute("data-zop") || "{}");
          dataCardContent = JSON.parse(nodeItemContent.getAttribute("data-za-extra-module") || "{}").card.content;
        } catch {
        }
        if (removeZhihuOfficial && !message2) {
          const labelE = nodeItem.querySelector(".AuthorInfo-name .css-n99yhz");
          const label = labelE ? labelE.getAttribute("aria-label") || "" : "";
          /知乎[\s]*官方帐号/.test(label) && (message2 = "已删除一条知乎官方帐号的回答");
        }
        let isHiddenTag = false;
        hiddenTags.forEach((i2) => conf[i2] && (isHiddenTag = true));
        if (isHiddenTag && !message2) {
          const nodeTag1 = nodeItem.querySelector(".KfeCollection-AnswerTopCard-Container");
          const nodeTag2 = nodeItem.querySelector(".LabelContainer-wrapper");
          const text1 = nodeTag1 ? nodeTag1.innerText : "";
          const text2 = nodeTag2 ? nodeTag2.innerText : "";
          const tagText = text1 + text2;
          hiddenTags.forEach((i2) => {
            if (conf[i2]) {
              const nReg = new RegExp(HIDDEN_ANSWER_TAG[i2]);
              nReg.test(tagText) && (message2 = `已删除一条标签${HIDDEN_ANSWER_TAG[i2]}的回答`);
            }
          });
        }
        hiddenUsers.length && !message2 && hiddenUsers.includes(dataZop.authorName || "") && (message2 = `已删除${dataZop.authorName}的回答`);
        if (removeAnonymousAnswer && !message2) {
          const userName = nodeItem.querySelector('[itemprop="name"]').content;
          userName === "匿名用户" && (message2 = `已屏蔽一条「匿名用户」回答`);
        }
        if (message2) {
          lessNum = fnHiddenDom(lessNum, nodeItem, message2);
        } else {
          addFnInNodeItem(nodeItem, this);
        }
        this.index = fnIndexMath(this.index, i, len, lessNum);
      }
    },
    reset: function() {
      this.index = 0;
    },
    restart: function() {
      this.reset();
      this.init();
    }
  };
  var myListenListItem = {
    index: 0,
    init: async function() {
      const elements = domA(".TopstoryItem").length ? domA(".TopstoryItem") : domA(".List-item");
      let lessNum = 0;
      const pfHistory = await myStorage.getHistory();
      const historyList = pfHistory.list;
      for (let i = this.index, len = elements.length; i < len; i++) {
        let message2 = "";
        let dataZop = {};
        let cardContent = {};
        const nodeItem = elements[i];
        const nodeItemContent = nodeItem.querySelector(".ContentItem");
        if (!nodeItem.scrollHeight || !nodeItemContent)
          continue;
        const isAnswer = nodeItemContent.classList.contains("AnswerItem");
        const isVideo = nodeItemContent.classList.contains("ZVideoItem");
        const isArticle = nodeItemContent.classList.contains("ArticleItem");
        const isTip = nodeItemContent.classList.contains("PinItem");
        try {
          dataZop = JSON.parse(nodeItemContent.getAttribute("data-zop") || "{}");
          cardContent = JSON.parse(nodeItemContent.getAttribute("data-za-extra-module") || "{}").card.content;
        } catch {
        }
        message2 && (lessNum = fnHiddenDom(lessNum, nodeItem, message2));
        const nodeATitle = nodeItem.querySelector(".ContentItem-title a");
        if ((domP(nodeItem, "class", "TopstoryMain") || domP(nodeItem, "class", "NotLoggedInTopstory")) && nodeATitle) {
          if (nodeATitle) {
            const itemHref = nodeATitle.href;
            const bType = isAnswer ? `<b class="c-ec7259">「问题」</b>` : isArticle ? `<b class="c-00965e">「文章」</b>` : isVideo ? `<b class="c-12c2e9">「视频」</b>` : isTip ? `<b class="c-9c27b0">「想法」</b>` : "";
            const itemA = `<a href="${itemHref}" target="_blank">${bType + nodeATitle.innerText}</a>`;
            !historyList.includes(itemA) && historyList.unshift(itemA);
          }
        }
        if (i + 1 === len) {
          const nI = i - lessNum >= 0 ? i - lessNum : 0;
          this.index = nI;
          myStorage.setHistoryItem("list", historyList);
        }
      }
    },
    reset: function() {
      this.index = 0;
    },
    restart: function() {
      this.reset();
      this.init();
    }
  };
  var Store = class {
    constructor() {
      /** 页面高度 */
      this.pageHeight = 0;
      this.setPageHeight = this.setPageHeight.bind(this);
      this.getPageHeight = this.getPageHeight.bind(this);
    }
    setPageHeight(height) {
      this.pageHeight = height;
    }
    getPageHeight() {
      return this.pageHeight;
    }
  };
  var store = new Store();
  var initTopStoryRecommendEvent = () => {
    const nodeTopStoryRecommend = dom(".TopstoryMain") || dom(".NotLoggedInTopstory");
    if (!nodeTopStoryRecommend)
      return;
    const classTarget = ["RichContent-cover", "RichContent-inner", "ContentItem-more", "ContentItem-arrowIcon"];
    const canFindTargeted = (e) => {
      let isFind = false;
      classTarget.forEach((item) => {
        const parentTarget = domP(e, "class", item);
        (e.classList.contains(item) || parentTarget && parentTarget.classList.contains(item)) && (isFind = true);
      });
      return isFind;
    };
    nodeTopStoryRecommend.addEventListener("click", async function(event) {
      const target = event.target;
      const nodeContentItem = domP(target, "class", "ContentItem");
      if (!nodeContentItem)
        return;
      const { releaseTimeForList } = await myStorage.getConfig();
      if (canFindTargeted(target)) {
        setTimeout(() => {
          releaseTimeForList && updateItemTime(nodeContentItem);
          addAnswerCopyLink(nodeContentItem);
        }, 100);
      }
    });
  };
  var initResizeObserver = () => {
    const resizeObserver = new ResizeObserver(throttle(resizeFun, 500));
    resizeObserver.observe(document.body);
  };
  function resizeFun() {
    if (!HTML_HOOTS.includes(location.hostname))
      return;
    const { getPageHeight, setPageHeight } = store;
    const nodeTopStoryC = dom(".TopstoryMain") || dom(".NotLoggedInTopstory");
    if (nodeTopStoryC) {
      const heightForList = getPageHeight();
      const heightTopStoryContent = nodeTopStoryC.offsetHeight;
      if (heightTopStoryContent < heightForList) {
        myListenListItem.restart();
        initTopStoryRecommendEvent();
      } else {
        myListenListItem.init();
      }
      heightTopStoryContent < window.innerHeight && windowResize();
      setPageHeight(heightTopStoryContent);
    }
    myListenAnswerItem.init();
  }
  var myScroll = {
    stop: () => dom("body").classList.add("ctz-stop-scroll"),
    on: () => dom("body").classList.remove("ctz-stop-scroll")
  };
  var echoData = async () => {
    const pfConfig = await myStorage.getConfig();
    const textSameName = {
      globalTitle: (e) => e.value = pfConfig.globalTitle || document.title,
      customizeCss: (e) => e.value = pfConfig.customizeCss || ""
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
    for (let i = 0, len = nodeArrInputClick.length; i < len; i++) {
      doEcho(nodeArrInputClick[i]);
    }
    const nodeArrInputChange = domA(`.${CLASS_INPUT_CHANGE}`);
    for (let i = 0, len = nodeArrInputChange.length; i < len; i++) {
      doEcho(nodeArrInputChange[i]);
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
    open: (e) => {
      e && e.preventDefault();
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
      hiddenHeader: `.MobileAppHeader,.ColumnPageHeader.Sticky{${DN}}`,
      hiddenItemActions: `.TopstoryItem .ContentItem-actions:not(.Sticky),.SearchMain .ContentItem-actions{${DN}}`,
      hiddenBottomSticky: `.ContentItem-actions.Sticky{${DN}}`,
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
      hiddenAD: `.TopstoryItem--advertCard,.Pc-card,.Pc-word,.RichText-ADLinkCardContainer,#div-gpt-ad-bannerAd,#div-gpt-ad-hotFeedAd,.MRelateFeedAd,.MHotFeedAd{${DN}}`,
      hiddenAnswerRelatedRecommend: `.Question-mainEntity .RelatedReadings{${DN}}`,
      hiddenAnswerHotRecommend: `.Question-mainEntity .HotQuestions{${DN}}`
    },
    hiddenArray: []
  };
  var myVersion = {
    init: async function() {
      const config = await myStorage.getConfig();
      fnInitDomStyle("CTZ_STYLE_VERSION", this.vQuestionTitleTag(config) + this.openButtonInvisible(config));
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
  var fnChanger = async (ev) => {
    const doCssVersion = ["questionTitleTag", "openButtonInvisible"];
    const { name, value, checked, type } = ev;
    const changeBackground = () => {
      myVersion.change();
      loadBackground();
      myListenListItem.restart();
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
      nodeCTZContent.onclick = operation;
      nodeCTZContent.onchange = operation;
    }
    dom(".ctz-menu").onclick = myMenu.click;
    domA(".ctz-content-top").forEach((i) => i.onclick = myMenu2.click);
    domById("CTZ_OPEN_BUTTON").onclick = myDialog.open;
    domById("CTZ_CLOSE_DIALOG").onclick = myDialog.hide;
    initTopStoryRecommendEvent();
    document.body.addEventListener("click", function(event) {
      const { target } = event;
      if (target.classList.contains("css-hzocic")) {
        const nodeClose = dom('[aria-label="关闭"]');
        nodeClose && nodeClose.click();
      }
    });
  };
  var addQuestionLogButton = async () => {
    const { showQuestionLog } = await myStorage.getConfig();
    const nodeBtnGroup = dom(".MobileQuestionButtonGroup");
    const className = "ctz-question-log";
    const prevBtn = dom(`.${className}`);
    if (!showQuestionLog || !nodeBtnGroup || prevBtn)
      return;
    const nBtn = createBtnTr("查看问题日志", className);
    nBtn.addEventListener("touchend", () => {
      const findPath = location.pathname.match(/\/question\/\d+/);
      if (findPath && findPath.length) {
        const nPathname = findPath[0];
        window.open(nPathname + "/log");
      }
    });
    nodeBtnGroup.appendChild(nBtn);
  };
  var fnSuspensionPickup = async (elements) => {
    for (let i = 0, len = elements.length; i < len; i++) {
      const even = elements[i];
      const evenSticky = even.querySelector(".ContentItem-actions");
      const evenButton = even.querySelector(".ContentItem-actions .ContentItem-rightButton");
      const evenBtn = even.querySelector(".ctz-suspension-pickup");
      if (!evenButton) {
        evenBtn && evenBtn.remove();
        continue;
      }
      const isFixed = evenSticky.classList.contains("RichContent-actions");
      if (isFixed) {
        if (evenBtn)
          continue;
        const domButton = domC("div", {
          className: "ctz-suspension-pickup",
          innerHTML: "收起 ^"
        });
        domButton.addEventListener("touchend", function(e) {
          e.preventDefault();
          evenButton.click();
          this.remove();
        });
        even.appendChild(domButton);
      } else if (evenBtn) {
        evenBtn.remove();
      }
    }
  };
  (function() {
    const { hostname, host } = location;
    let isHaveHeadWhenInit = true;
    initChangeNavigator();
    GM_registerMenuCommand("⚙️ 设置", () => {
      myDialog.open();
    });
    async function onDocumentStart() {
      if (!HTML_HOOTS.includes(hostname) || window.frameElement)
        return;
      if (!document.head) {
        fnLog("not find document.head, waiting for reload...");
        isHaveHeadWhenInit = false;
        return;
      }
      fnInitDomStyle("CTZ_STYLE", INNER_CSS);
      addHistoryView();
      onInitStyleExtra();
      EXTRA_CLASS_HTML[host] && dom("html").classList.add(EXTRA_CLASS_HTML[host]);
    }
    onDocumentStart();
    window.addEventListener(
      "DOMContentLoaded",
      async () => {
        if (!isHaveHeadWhenInit) {
          await onDocumentStart();
        }
        if (HTML_HOOTS.includes(hostname) && !window.frameElement) {
          initHTML();
          initOperate();
          echoData();
          loadBackground();
          myCustomStyle.init();
          initResizeObserver();
          echoHistory();
        }
        historyToChangePathname();
        if (host === "zhuanlan.zhihu.com") {
          addTimeForArticle();
        }
      },
      false
    );
    const historyToChangePathname = () => {
      pathnameHasFn({
        question: () => {
          addTimeForQuestion();
          addQuestionLogButton();
        }
      });
    };
    const changeHistory = () => {
      historyToChangePathname();
      myListenListItem.reset();
      myListenAnswerItem.reset();
    };
    window.addEventListener("popstate", changeHistory);
    window.addEventListener("pushState", changeHistory);
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
        const { suspensionPickup } = await myStorage.getConfig();
        if (suspensionPickup) {
          fnSuspensionPickup(domA(".List-item"));
          fnSuspensionPickup(domA(".TopstoryItem"));
          fnSuspensionPickup(domA(".AnswerCard"));
        }
      }, 100),
      false
    );
  })();
})();

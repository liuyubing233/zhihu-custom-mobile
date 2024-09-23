import { myStorage } from '../commons/storage';
import { dom, domById, fnInitDomStyle, hexToRgba } from '../commons/tools';
import { CLASS_INPUT_CLICK, INPUT_NAME_THEME, INPUT_NAME_THEME_DARK, INPUT_NAME_ThEME_LIGHT, THEMES, THEME_CONFIG_DARK, THEME_CONFIG_LIGHT } from '../configs';
import { ETheme, EThemeDark, EThemeLight } from '../types';

/** 修改页面背景的 css */
const myBackground = {
  init: async function () {
    const { themeDark = EThemeDark.夜间护眼一, themeLight = EThemeLight.默认 } = await myStorage.getConfig();
    const innerHTML = await this.change(themeDark, themeLight);
    fnInitDomStyle('CTZ_STYLE_BACKGROUND', innerHTML);
  },
  change: async function (themeDark: EThemeDark, themeLight: EThemeLight) {
    const getBackground = async () => {
      const isD = await this.isUseDark();
      if (isD) return this.dark(themeDark);
      if (themeLight === EThemeLight.默认) return this.default();
      return this.light(themeLight);
    };
    const strBg = await getBackground();
    const strText = await this.text();
    return strBg + strText;
  },
  isUseDark: async () => {
    const { theme = ETheme.自动 } = await myStorage.getConfig();
    if (theme === ETheme.自动) {
      // 获取浏览器颜色
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
      return prefersDarkScheme.matches;
    }
    return theme === ETheme.深色;
  },
  default: () => '.GlobalSideBar-navList{background: #fff}',
  dark: function (darkKey: EThemeDark) {
    const { background, background2, color } = THEME_CONFIG_DARK[darkKey];
    const whiteText =
      `#CTZ_DIALOG,.ctz-message,#CTZ_MAIN input,#CTZ_MAIN textarea,.ctz-footer,#CTZ_CLOSE_DIALOG,.ctz-commit,#CTZ_OPEN_BUTTON,.KfeCollection-VipRecommendCard-content,.KfeCollection-VipRecommendCard-title` +
      `,#CTZ_DIALOG textarea,#CTZ_DIALOG .ctz-button,.ctz-button.ctz-button-transparent,body,.zu-top-nav-link` +
      `,.CommentContent,[data-za-detail-view-path-module="CommentList"] div,.CommentsForOia div,.ctz-suspension-pickup,.zm-ac-link` +
      `,.css-10noe4n,.css-3ny988,.css-hmd01z,.css-z0cc58,.css-7aa3bk,.css-1965tpd,.css-b574el,.css-1jg6wq6,textarea.zg-form-text-input,.zg-form-text-input>textarea` +
      `,.css-1eglonx,.css-1tip2bd,.css-1symrae,.css-u3vsx3>div,.zm-editable-editor-field-wrap,.zu-question-suggest-topic-input,.zg-form-text-input,.zg-form-select` +
      `,.css-10u695f,.css-r4op92` +
      `{color: ${color}!important}`;
    const linkText =
      `.RelevantQuery li,.modal-dialog a,.zhi a,.VoteButton` +
      `,.ContentItem-more,.QuestionMainAction,a.UserLink-link,.RichContent--unescapable.is-collapsed .ContentItem-rightButton,.ContentItem-title a:hover` +
      `,.css-b7erz1,.css-1vbwaf6,.css-1jj6qre,.css-jf1cpf,.css-vphnkw,.css-1icigob` +
      `{color: deepskyblue!important;}`;

    // 添加 html[data-theme=dark] 前缀
    const addPrefix = (i: string) => {
      return i
        .split(',')
        .map((i) => `html[data-theme=dark] ${i}`)
        .join(',');
    };
    const darkTransparentBg = `.ColumnHomeTop:before,.ColumnHomeBottom{background: transparent!important;}`;

    return (
      addPrefix(this.doSetCSS(background, background2) + whiteText + linkText + darkTransparentBg) +
      this.doSetCSSInCTZ(background, background2) +
      `.MobileAppHeader-expandBackdrop{background: ${hexToRgba(background, 0.65)}!important;}`
    );
  },
  light: function (lightKey: EThemeLight) {
    const { background, background2 } = THEME_CONFIG_LIGHT[lightKey];
    return this.doSetCSS(background, background2) + this.doSetCSSInCTZ(background, background2);
  },
  /** 设置字体颜色 */
  text: async function () {
    const { colorText1 } = await myStorage.getConfig();
    const styleColorText1 = `.ContentItem-title, body` + `{color: ${colorText1}!important;}`;
    return colorText1 ? styleColorText1 : '';
  },
  /** 知乎内元素样式设置 */
  doSetCSS: function (background: string, background2: string) {
    const cssBg = `${this.cssNamesBackground1}{background-color: ${background}!important;background:${background}!important;}`;
    const cssBg2 = `${this.cssNamesBackground2}{background-color:${background2}!important;background:${background2}!important;}`;
    const cssJustBGC2 = `${this.useCSSJustBGC2}{background-color: ${background2}!important;}`
    const cssBgTransparent = `${this.cssNamesBackgroundTransparent}{background-color: transparent!important;background: transparent!important;}`;
    const loadingStyle = `.css-w2vj5n{background: ${background}!important;color: ${background2}!important;}`;
    const borderBg = `.KfeCollection-VipRecommendCard-article{border-color: ${background}!important;}`;
    return cssBg + cssBg2 + cssBgTransparent + loadingStyle + borderBg + cssJustBGC2;
  },
  /** 修改器样式设置（不需要添加前缀） */
  doSetCSSInCTZ: function (background: string, background2: string) {
    const menuTopBeforeAfter = `.ctz-menu>a.target::after,.ctz-menu>a.target::before{${this.menuBeforeAfter(background2)}}`;
    const openButton = `#CTZ_OPEN_BUTTON{background: ${background}!important;}`;
    return menuTopBeforeAfter + openButton;
  },
  /** 使用背景色1的元素名称 */
  cssNamesBackground1:
    `#CTZ_DIALOG,#CTZ_BASIS_SHOW label b,.ctz-suspension-pickup,.ctz-content-top a.target,.ctz-message,#CTZ_DIALOG textarea,#CTZ_DIALOG .ctz-button` +
    `,body,.App,.MobileAppHeader-searchBox,.Input-wrapper,.VideoAnswerPlayer-stateBar,.ColumnHomeColumnCard,.Toast-root-tU3yo,.AuthorsSection-author-tFZJF` +
    `,.editable,textarea.zg-form-text-input,.zg-form-text-input>textarea,.ac-active,.PagingButton,[data-tooltip="回到顶部"]` +
    `,.css-d1dtt9,.css-k8i00s,.css-41c1px,.zm-editable-editor-field-wrap,.zu-question-suggest-topic-input,.zg-form-text-input,.zg-form-select,.css-4lspwd` +
    `,.zu-top`,
  /** 使用背景色2的元素名称 */
  cssNamesBackground2:
    `.ctz-content,.ctz-menu>a.target` +
    `,.Card,.Sticky,.ContentItem-more,.ContentItem-actions,.Popover-content,.Popover-arrow:after,.MobileAppHeader-expand,.CommentsForOia>div,.KfeCollection-VipRecommendCard,.OpenInAppButton>div` +
    `,.Modal-inner,.MobileSearch-container,.ProfileBar,.MobileAppHeader,.ZVideo-mobile,.Post-content,.sgui-header,.MobileCollectionsHeader-tabs,.MobileModal-title--default,.MobileModal` +
    `,.List-item,.Login,.Input-wrapper.SignFlow-accountInput,.SignFlowInput .Input-wrapper,.SearchTabs,.MobileEmptyPageWithType,.TopicHot-Header` +
    `,.Favlists-mobileActions,[data-za-detail-view-path-module="SearchResultList"]>div,[data-za-detail-view-path-module="SearchResultList"]>div>a` +
    `,.SearchSubTabs,.KfeCollection-PcCollegeCard-root,.modal-dialog,.ac-renderer,.css-hplpcn,.zh-add-question-form .add-question-splash-page .ac-renderer .ac-row.ac-last` +
    `,.HeaderInfo-infoCard-orDxs,.Common-content-893LU,.ContentModule-module-9gTaH,.NewBottomBar-root-dVXzD,.AuthorModule-root-rxFMb,.css-w0m1iq` +
    `,.zu-autocomplete-row-label,.ac-row.zu-autocomplete-row-search-link,.PostItem,.Recommendations-Main,.ErrorPage` +
    `,.css-1e7fksk,.css-1gfesro,.css-ud510h,.css-vb0amv,.css-t89z5u,.css-u3vsx3>div,.css-5k4zcx,.css-13heq6w,.css-13heq6w>a,.css-1eltcns,.css-yoby3j,.css-l63y2t,.css-173civf,.css-1nalx0p,.css-mn9570` +
    `,.css-4r7szo,.css-vkey2q,.css-ugzr12,.css-6v1k3,.css-1xj1964,.css-ggid2,.css-rhbxt0,.css-1j23ebo,.css-7wvdjh,.css-kt4t4n` +
    `,#CTZ_COMMENT,#CTZ_COMMENT_CHILD, #CTZ_TOP_SEARCH` +
    `,.mobile-top-nav-popup .top-nav-dropdown,.zm-item-tag,.mobile-top-nav-popup .top-nav-dropdown a,.Topbar,.AutoInviteItem-wrapper--mobile`,
  useCSSJustBGC2: `.slide-up`,
  /** 背景色透明的元素名称 */
  cssNamesBackgroundTransparent: `.ContentItem-more:before`,
  cssNamesColorUserBackground1: ``,
  menuBeforeAfter: (color: string, size = '12px') => {
    return `background: radial-gradient(circle at top left, transparent ${size}, ${color} 0) top left,
    radial-gradient(circle at top right, transparent ${size}, ${color} 0) top right,
    radial-gradient(circle at bottom right, transparent ${size}, ${color} 0) bottom right,
    radial-gradient(circle at bottom left, transparent ${size}, ${color} 0) bottom left;
    background-size: 50% 50%;
    background-repeat: no-repeat;`;
  },
};

/** 自定义样式方法 */
export const myCustomStyle = {
  init: async function () {
    const nodeCustomStyle = dom('[name="textStyleCustom"]') as HTMLTextAreaElement;
    if (!nodeCustomStyle) return;
    const { customizeCss = '' } = await myStorage.getConfig();
    nodeCustomStyle.value = customizeCss;
    this.change(customizeCss);
  },
  change: (innerCus: string) => fnInitDomStyle('CTZ_STYLE_CUSTOM', innerCus),
};

/** 启用知乎默认的黑暗模式 */
export const onUseThemeDark = async () => {
  const isD = await isDark();
  dom('html')!.setAttribute('data-theme', isD ? 'dark' : 'light');
};

/** 查找是否使用主题 */
export const loadFindTheme = () => {
  // 开始进入先修改一次
  onUseThemeDark();
  const elementHTML = dom('html');
  const muConfig = { attribute: true, attributeFilter: ['data-theme'] };
  if (!elementHTML) return;
  // 监听 html 元素属性变化
  const muCallback = async function () {
    const themeName = elementHTML.getAttribute('data-theme');
    const isD = await isDark();
    if ((themeName === 'dark' && !isD) || (themeName === 'light' && isD)) {
      onUseThemeDark();
    }
  };
  const muObserver = new MutationObserver(muCallback);
  muObserver.observe(elementHTML, muConfig);
};

/** 加载背景色 */
export const loadBackground = () => myBackground.init();

/** 是否使用夜间模式 */
export const isDark = async () => await myBackground.isUseDark();

const createItem = ({ label, value, background, color, inputName }: { label: string; value: string; background: string; color?: string; inputName: string }) =>
  `<label>` +
  `<input class="${CLASS_INPUT_CLICK}" name="${inputName}" type="radio" value="${value}"/>` +
  `<div style="background: ${background};color: ${color}">${label}</div>` +
  `</label>`;

const createThemeHTML = (themeConfig: Record<string, any>, inputName: string) => {
  return Object.keys(themeConfig)
    .map((key) => {
      const { background, color, name } = themeConfig[key as unknown as EThemeLight];
      return createItem({ label: name, value: key, background, color, inputName });
    })
    .join('');
};

/** 添加背景色选择元素 */
export const addBackgroundElement = () => {
  domById('CTZ_BACKGROUND')!.innerHTML = THEMES.map((item) => createItem({ ...item, inputName: INPUT_NAME_THEME })).join('');
  domById('CTZ_BACKGROUND_LIGHT')!.innerHTML = createThemeHTML(THEME_CONFIG_LIGHT, INPUT_NAME_ThEME_LIGHT);
  domById('CTZ_BACKGROUND_DARK')!.innerHTML = createThemeHTML(THEME_CONFIG_DARK, INPUT_NAME_THEME_DARK);
};

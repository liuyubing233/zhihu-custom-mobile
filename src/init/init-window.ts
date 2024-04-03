export const initWindow = () => {
  if (!unsafeWindow.ctzLog) {
    unsafeWindow.ctzLog = (...str: string[]) => console.log('%c「修改器」', 'color: green;font-weight: bold;', ...str);
  }
};

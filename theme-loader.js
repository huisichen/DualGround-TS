(() => {
  'use strict';

  const STORAGE_KEY = 'dualgroundts.visual-theme.v1';
  const DEFAULT_THEME = 'vivid-light';
  const THEMES = Object.freeze({
    original: Object.freeze({
      label: 'Original',
      href: 'themes/original.css',
      commit: 'fad75f6',
      themeColor: '#ffffff',
      chart: Object.freeze({ history: '#3158e8', positive: '#1f844b', negative: '#cf3f2e' })
    }),
    'exaggerated-minimalism': Object.freeze({
      label: 'Exaggerated Minimalism',
      href: 'themes/exaggerated-minimalism.css',
      commit: 'fff79a8',
      themeColor: '#fbfbfa',
      chart: Object.freeze({ history: '#45515b', positive: '#35664a', negative: '#c43d14' })
    }),
    'flat-design': Object.freeze({
      label: 'Flat Design',
      href: 'themes/flat-design.css',
      commit: '8b42e12',
      themeColor: '#f7f9fc',
      chart: Object.freeze({ history: '#374151', positive: '#0f7a42', negative: '#b93834' })
    }),
    'vivid-light': Object.freeze({
      label: 'Vivid Light',
      href: 'styles.css',
      commit: 'c2a8f33',
      themeColor: '#fffdf8',
      chart: Object.freeze({ history: '#1557d6', positive: '#007a45', negative: '#c5281c' })
    })
  });

  const hasTheme = (theme) => Object.prototype.hasOwnProperty.call(THEMES, theme);
  const readSavedTheme = () => {
    try {
      const savedTheme = window.localStorage.getItem(STORAGE_KEY);
      return hasTheme(savedTheme) ? savedTheme : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  };
  const saveTheme = (theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Theme comparison still works when storage is blocked.
    }
  };
  const dispatchThemeEvent = (name, detail) => {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  };
  const updateDocumentChrome = (theme) => {
    const config = THEMES[theme];
    document.documentElement.dataset.theme = theme;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.content = config.themeColor;
  };

  let activeTheme = readSavedTheme();
  let themeIsLoading = true;
  let initialThemeError = null;
  let resolveThemeReady;
  const themeReady = new Promise((resolve) => {
    resolveThemeReady = resolve;
  });
  updateDocumentChrome(activeTheme);

  const initialThemeLink = document.createElement('link');
  initialThemeLink.id = 'theme-stylesheet';
  initialThemeLink.rel = 'stylesheet';
  initialThemeLink.href = THEMES[activeTheme].href;
  initialThemeLink.setAttribute('blocking', 'render');

  const handleInitialThemeLoad = () => {
    initialThemeLink.removeEventListener('load', handleInitialThemeLoad);
    initialThemeLink.removeEventListener('error', handleInitialThemeError);
    themeIsLoading = false;
    saveTheme(activeTheme);
    const detail = { ok: true, theme: activeTheme, config: THEMES[activeTheme] };
    dispatchThemeEvent('dgts:themeready', detail);
    resolveThemeReady(detail);
  };

  const handleInitialThemeError = () => {
    const failedTheme = activeTheme;
    const error = new Error(`Could not load initial theme: ${failedTheme}`);
    initialThemeError = error;
    dispatchThemeEvent('dgts:themeerror', { theme: failedTheme, error, recovered: failedTheme !== DEFAULT_THEME });

    if (failedTheme === DEFAULT_THEME) {
      initialThemeLink.removeEventListener('load', handleInitialThemeLoad);
      initialThemeLink.removeEventListener('error', handleInitialThemeError);
      themeIsLoading = false;
      document.documentElement.classList.add('theme-load-failed');
      resolveThemeReady({ ok: false, theme: failedTheme, config: THEMES[failedTheme], error });
      return;
    }

    activeTheme = DEFAULT_THEME;
    updateDocumentChrome(activeTheme);
    saveTheme(activeTheme);
    initialThemeLink.href = THEMES[activeTheme].href;
  };

  initialThemeLink.addEventListener('load', handleInitialThemeLoad);
  initialThemeLink.addEventListener('error', handleInitialThemeError);
  document.head.append(initialThemeLink);

  const setTheme = (theme) => new Promise((resolve, reject) => {
    if (!hasTheme(theme)) {
      reject(new Error(`Unknown theme: ${theme}`));
      return;
    }
    if (theme === activeTheme && !themeIsLoading) {
      resolve({ theme, config: THEMES[theme] });
      return;
    }
    if (themeIsLoading) {
      reject(new Error('A theme is already loading.'));
      return;
    }

    themeIsLoading = true;
    document.documentElement.classList.add('theme-is-switching');
    const oldThemeLink = document.getElementById('theme-stylesheet');
    const nextThemeLink = document.createElement('link');
    nextThemeLink.rel = 'stylesheet';
    nextThemeLink.href = THEMES[theme].href;
    nextThemeLink.dataset.pendingTheme = theme;

    const finishLoading = () => {
      themeIsLoading = false;
      nextThemeLink.removeAttribute('data-pending-theme');
    };
    const clearSwitchingState = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => document.documentElement.classList.remove('theme-is-switching'));
      });
    };

    nextThemeLink.addEventListener('load', () => {
      if (oldThemeLink) oldThemeLink.remove();
      nextThemeLink.id = 'theme-stylesheet';
      activeTheme = theme;
      updateDocumentChrome(theme);
      saveTheme(theme);
      finishLoading();
      clearSwitchingState();
      const detail = { theme, config: THEMES[theme] };
      dispatchThemeEvent('dgts:themechange', detail);
      resolve(detail);
    }, { once: true });

    nextThemeLink.addEventListener('error', () => {
      nextThemeLink.remove();
      finishLoading();
      document.documentElement.classList.remove('theme-is-switching');
      const error = new Error(`Could not load theme: ${theme}`);
      dispatchThemeEvent('dgts:themeerror', { theme, error });
      reject(error);
    }, { once: true });

    const switcherStyles = document.getElementById('theme-switcher-styles');
    document.head.insertBefore(nextThemeLink, switcherStyles || null);
    dispatchThemeEvent('dgts:themeloading', { theme, config: THEMES[theme] });
  });

  window.DGTSTheme = Object.freeze({
    themes: THEMES,
    order: Object.freeze(Object.keys(THEMES)),
    ready: themeReady,
    get activeTheme() {
      return activeTheme;
    },
    get isLoading() {
      return themeIsLoading;
    },
    get initialError() {
      return initialThemeError;
    },
    setTheme
  });
})();

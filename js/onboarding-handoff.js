// Onboarding → App handoff helpers
// Keeps auth redirects consistent across app.zmarty.me and zmarty.vercel.app.
(function() {
  'use strict';

  const DEFAULT_APP_BASES = ['https://app.zmarty.me', 'https://zmarty.vercel.app'];
  const APP_BASE_KEY = 'zmarty_app_base';

  function normalizeBase(raw) {
    if (!raw || typeof raw !== 'string') return '';
    let base = raw.trim();
    if (!base) return '';
    const lc = base.toLowerCase();
    if (lc === 'app' || lc === 'prod') return DEFAULT_APP_BASES[0];
    if (lc === 'vercel') return DEFAULT_APP_BASES[1];
    if (!/^https?:\/\//i.test(base)) base = `https://${base}`;
    return base.replace(/\/+$/, '');
  }

  function readAppParam() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('app') || params.get('app_base');
    } catch {
      return null;
    }
  }

  function storeAppBase(base) {
    try {
      localStorage.setItem(APP_BASE_KEY, base);
    } catch {}
  }

  function getAppBase() {
    const param = normalizeBase(readAppParam());
    if (param) {
      storeAppBase(param);
      return param;
    }
    const stored = normalizeBase(localStorage.getItem(APP_BASE_KEY) || '');
    if (stored) return stored;
    return DEFAULT_APP_BASES[0];
  }

  function withAppQuery(path) {
    const appParam = readAppParam();
    if (!appParam) return path;
    try {
      const hasOrigin = /^https?:\/\//i.test(path);
      const url = new URL(path, window.location.origin);
      if (!url.searchParams.has('app') && !url.searchParams.has('app_base')) {
        url.searchParams.set('app', appParam);
      }
      return hasOrigin ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
    } catch {
      const sep = path.includes('?') ? '&' : '?';
      return `${path}${sep}app=${encodeURIComponent(appParam)}`;
    }
  }

  function buildBridgeUrl(base, session) {
    const normalized = normalizeBase(base) || DEFAULT_APP_BASES[0];
    const tokens = new URLSearchParams();
    if (session?.access_token) tokens.set('access_token', session.access_token);
    if (session?.refresh_token) tokens.set('refresh_token', session.refresh_token);
    if (tokens.toString()) return `${normalized}/auth/bridge#${tokens.toString()}`;
    return `${normalized}/profile?mode=register`;
  }

  function redirectToApp(session, options) {
    const base = getAppBase();
    storeAppBase(base);
    if (session?.access_token && session?.refresh_token) {
      window.location.href = buildBridgeUrl(base, session);
      return;
    }
    const fallbackPath = (options && options.fallbackPath) || '/profile?mode=register';
    window.location.href = `${base}${fallbackPath}`;
  }

  function applyAppQueryToLinks() {
    const appParam = readAppParam();
    if (!appParam) return;
    document.querySelectorAll('a[href^="/onboarding/"]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      link.setAttribute('href', withAppQuery(href));
    });
  }

  function getOAuthRedirect() {
    const base = getAppBase();
    storeAppBase(base);
    return `${base}/auth/bridge`;
  }

  window.ZmartyOnboarding = {
    getAppBase,
    withAppQuery,
    applyAppQueryToLinks,
    redirectToApp,
    getOAuthRedirect
  };
})();

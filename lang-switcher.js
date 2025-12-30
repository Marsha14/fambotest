(function(){
  // Huit Fambo - lightweight client language switcher
  // Features:
  // - Injects a language selector into the header (top right)
  // - Auto-detects browser language on first visit and suggests it
  // - Persists choice in localStorage
  // - Applies translations for elements with data-i18n keys using internal resources
  // - Sets html[lang] and dir for RTL
  // - Admins can edit the `resources` object below to add/correct translations

  const AVAILABLE = {
    en: 'English', fr: 'Français', es: 'Español', ar: 'العربية', sw: 'Kiswahili', zh: '中文', hi: 'हिन्दी'
  };

  const RTL = new Set(['ar','he','fa','ur']);

  // Basic UI strings (these will be shown in selector)
  const resources = {
    en: { ui: { select: 'Language', auto: 'Auto-detect', save: 'Save' } },
    fr: { ui: { select: 'Langue', auto: 'Détecter automatiquement', save: 'Enregistrer' } },
    es: { ui: { select: 'Idioma', auto: 'Detectar automáticamente', save: 'Guardar' } },
    ar: { ui: { select: 'اللغة', auto: 'الكشف تلقائياً', save: 'حفظ' } },
    sw: { ui: { select: 'Lugha', auto: 'Gundua kwa kiotomatiki', save: 'Hifadhi' } },
    zh: { ui: { select: '语言', auto: '自动检测', save: '保存' } },
    hi: { ui: { select: 'भाषा', auto: 'स्वतः पहचानें', save: 'सहेजें' } }
  };

  const LS_KEY = 'huitfambo_lang';

  function detectBrowserLang(){
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage || 'en';
    return nav ? nav.split('-')[0] : 'en';
  }

  function getSaved(){
    try{ return localStorage.getItem(LS_KEY); }catch(e){return null}
  }
  function saveLang(code){
    try{ localStorage.setItem(LS_KEY, code);}catch(e){}
  }

  function applyLang(code){
    if(!code) return;
    document.documentElement.lang = code;
    if(RTL.has(code)){
      document.documentElement.dir = 'rtl';
      document.body.classList.add('is-rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('is-rtl');
    }
    // translate UI strings in-page where keys present
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const parts = key.split('.');
      let val = resources[code];
      for(const p of parts){ if(!val) break; val = val[p]; }
      if(val) {
        if(el.placeholder !== undefined && el.tagName.toLowerCase()==='input') el.placeholder = val;
        else el.textContent = val;
      }
    });
  }

  function buildSelector(){
    const nav = document.querySelector('nav') || document.querySelector('header');
    if(!nav) return;
    // create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'lang-switcher';
    wrapper.style.marginLeft = '1rem';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';

    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Language selector');
    select.style.padding = '6px 8px';
    select.style.borderRadius = '8px';
    select.style.border = '1px solid rgba(0,0,0,0.08)';
    select.style.background = '#fff';

    // Add auto-detect option
    const autoOpt = document.createElement('option');
    autoOpt.value = 'auto';
    autoOpt.textContent = resources['en'].ui.auto || 'Auto';
    select.appendChild(autoOpt);

    Object.keys(AVAILABLE).forEach(code=>{
      const opt = document.createElement('option'); opt.value = code; opt.textContent = AVAILABLE[code] || code; select.appendChild(opt);
    });

    // set initial
    const saved = getSaved();
    if(saved) select.value = saved; else select.value = 'auto';

    select.addEventListener('change', ()=>{
      const v = select.value;
      if(v==='auto'){
        const b = detectBrowserLang();
        const prefer = Object.keys(AVAILABLE).includes(b) ? b : 'en';
        applyLang(prefer);
        saveLang('auto');
      } else {
        applyLang(v);
        saveLang(v);
      }
    });

    wrapper.appendChild(select);

    // insert into nav on the right
    // place at end of nav
    nav.appendChild(wrapper);

    // apply initially
    if(saved && saved!=='auto') applyLang(saved);
    else {
      const detected = detectBrowserLang();
      const prefer = Object.keys(AVAILABLE).includes(detected) ? detected : 'en';
      applyLang(prefer);
    }
  }

  // Inject some minimal CSS for RTL and accessibility
  function injectCSS(){
    const css = `
    .lang-switcher select:focus{outline:3px solid rgba(249,211,66,0.3)}
    .is-rtl nav, .is-rtl .nav-links { direction: rtl }
    `;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  }

  // add hreflang meta links -- points to same URL with ?lang=code (admins should replace with canonical language-specific URLs for SEO)
  function injectHreflang(){
    const base = location.pathname + location.search + location.hash;
    const langs = Object.keys(AVAILABLE);
    langs.forEach(code=>{
      const link = document.createElement('link'); link.rel='alternate'; link.hreflang = code; 
      // point to URL with ?lang=code for search engines; replace with real URLs for production
      const url = new URL(location.href);
      url.searchParams.set('lang', code);
      link.href = url.toString();
      document.head.appendChild(link);
    });
    // x-default
    const x = document.createElement('link'); x.rel='alternate'; x.hreflang='x-default'; x.href = location.href; document.head.appendChild(x);
  }

  // initialization
  function init(){
    injectCSS();
    buildSelector();
    injectHreflang();

    // If page already has lang param, honor it
    try{
      const params = new URL(location.href).searchParams; const lang = params.get('lang');
      if(lang && Object.keys(AVAILABLE).includes(lang)){
        applyLang(lang); saveLang(lang);
        const sel = document.querySelector('.lang-switcher select'); if(sel) sel.value = lang;
      }
    }catch(e){}
  }

  // Wait for DOM ready
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();

  // expose minimal admin API
  window.HuitFamboLang = {
    available: AVAILABLE,
    setLang: function(code){ if(Object.keys(AVAILABLE).includes(code)){ applyLang(code); saveLang(code); const sel=document.querySelector('.lang-switcher select'); if(sel) sel.value=code; } },
    getLang: function(){ return getSaved() || detectBrowserLang(); }
  };
})();

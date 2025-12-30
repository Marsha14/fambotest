(function(){
  // Unified nav behavior: hamburger toggle, outside click close, keyboard accessibility
  function initNav(){
    document.querySelectorAll('nav').forEach(nav=>{
      // find/create toggle button
      let toggle = nav.querySelector('.nav-toggle');
      if(!toggle){
        toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label','Toggle navigation');
        toggle.innerHTML = '☰';
        nav.appendChild(toggle);
      }

      const links = nav.querySelector('.nav-links');
      if(!links) return; // nothing to toggle

      // ensure accessible attributes
      toggle.setAttribute('aria-expanded', String(links.classList.contains('show')));
      toggle.addEventListener('click', (e)=>{
        const isOpen = links.classList.toggle('show');
        toggle.setAttribute('aria-expanded', String(isOpen));
        links.setAttribute('aria-hidden', String(!isOpen));
        if(isOpen) {
          document.body.style.overflow='hidden';
          // move focus into menu for keyboard users
          const firstLink = links.querySelector('a');
          if(firstLink) setTimeout(()=> firstLink.focus(), 120);
        } else {
          document.body.style.overflow='';
          toggle.focus();
        }
      });

      // Close when clicking a link
      links.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
        links.classList.remove('show');
        toggle.setAttribute('aria-expanded','false');
        document.body.style.overflow='';
      }));

      // Close on outside click
      document.addEventListener('click', (e)=>{
        if(!links.classList.contains('show')) return;
        // if the click target is inside the nav, do nothing
        if(nav.contains(e.target)) return;
        links.classList.remove('show');
        toggle.setAttribute('aria-expanded','false');
        links.setAttribute('aria-hidden','true');
        document.body.style.overflow='';
      });

      // keyboard: Escape closes
      document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ links.classList.remove('show'); toggle.setAttribute('aria-expanded','false'); links.setAttribute('aria-hidden','true'); document.body.style.overflow=''; } });

      // Ensure links are visible on resize for desktop
      window.addEventListener('resize', ()=>{ if(window.innerWidth>=1024){ links.classList.remove('show'); toggle.setAttribute('aria-expanded','false'); links.setAttribute('aria-hidden','false'); document.body.style.overflow=''; } });
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initNav); else initNav();
})();

// Support older/alternate markup: hamburger + nav-drawer pairs
(function(){
  function wireDrawer(hamburgerSel, drawerSel){
    const hamburger = document.querySelector(hamburgerSel);
    const drawer = document.querySelector(drawerSel);
    if(!hamburger || !drawer) return;
    hamburger.setAttribute('aria-expanded', String(drawer.classList.contains('active')));
    hamburger.addEventListener('click', ()=>{
      const isOpen = drawer.classList.toggle('active');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      if(isOpen) { document.body.style.overflow='hidden'; const f = drawer.querySelector('a'); if(f) setTimeout(()=>f.focus(),120); }
      else { document.body.style.overflow=''; hamburger.focus(); }
    });

    // close when clicking any link inside drawer
    drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
      drawer.classList.remove('active'); hamburger.classList.remove('active'); hamburger.setAttribute('aria-expanded','false'); document.body.style.overflow='';
    }));

    // outside click closes
    document.addEventListener('click', (e)=>{ if(!drawer.classList.contains('active')) return; if(drawer.contains(e.target) || hamburger.contains(e.target)) return; drawer.classList.remove('active'); hamburger.classList.remove('active'); hamburger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; });

    // escape closes
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ drawer.classList.remove('active'); hamburger.classList.remove('active'); hamburger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; } });

    // ensure closed on large screens
    window.addEventListener('resize', ()=>{ if(window.innerWidth>=1024){ drawer.classList.remove('active'); hamburger.classList.remove('active'); hamburger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; } });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>{
    wireDrawer('#hamburger','#navDrawer');
    wireDrawer('.hamburger','.nav-drawer');
  }); else { wireDrawer('#hamburger','#navDrawer'); wireDrawer('.hamburger','.nav-drawer'); }
})();

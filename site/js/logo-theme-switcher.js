document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("edu-logo");
  if (!logo) return;

  const light = new URL(logo.dataset.light || "img/EDU.png", document.baseURI).href;
  const dark  = new URL(logo.dataset.dark  || "img/EDU-Oscuro.png", document.baseURI).href;

  const parseRgb = s => {
    if (!s) return null;
    let m = s.match(/rgba?\(([\d\s.,%-]+)\)/i);
    if (m) return m[1].split(",").map(x=>+x.trim()).slice(0,3);
    m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) { let h=m[1]; if(h.length===3) h=h.split("").map(c=>c+c).join(""); return [0,1,2].map(i=>parseInt(h.substr(i*2,2),16)); }
    return null;
  };
  const lum = rgb => rgb ? 0.2126*rgb.map(v=>v/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4))[0] + 
                                 0.7152*rgb.map(v=>v/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4))[1] +
                                 0.0722*rgb.map(v=>v/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4))[2] : 1;

  const isDark = () => {
    try { const ls=localStorage.getItem("data-md-color-scheme"); if(ls) return /dark|slate|night/i.test(ls); } catch{} 
    const html = document.documentElement;
    const attr = html.getAttribute("data-md-color-scheme");
    if(attr) return /dark|slate|night/i.test(attr);
    if(/dark|md-theme--dark|md-prefers-color-scheme-dark/i.test(html.className)) return true;
    try { 
      const checked = document.querySelector('input[data-md-color-media][checked], input[data-md-color-scheme][checked]');
      if(checked){ const s = checked.getAttribute("data-md-color-scheme")||checked.getAttribute("data-md-color"); if(s) return /dark|slate|night/i.test(s);}
    } catch{}
    try { const bg = window.getComputedStyle(document.body).backgroundColor || window.getComputedStyle(html).backgroundColor; return lum(parseRgb(bg))<0.5; } catch{}
    try { const mm = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)"); if(mm) return !!mm.matches; } catch{}
    return false;
  };

  const setLogo = d => { const src = d ? dark : light; if(logo.src!==src){ logo.style.transition="opacity 200ms ease"; logo.style.opacity=0; setTimeout(()=>{logo.src=src; void logo.offsetWidth; logo.style.opacity=1;},220); } };

  const update = () => setLogo(isDark());
  update();

  const obs = new MutationObserver(update);
  obs.observe(document.documentElement,{attributes:true,subtree:true,childList:true});
  document.addEventListener("click",()=>setTimeout(update,250));
  window.addEventListener("storage",update);
  let c=0; const poll=setInterval(()=>{c++; update(); if(c>8) clearInterval(poll);},1500);
});

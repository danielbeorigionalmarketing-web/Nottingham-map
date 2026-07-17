(function(){
// Inject styles
var st = document.createElement('style');
st.textContent = ".onm,.onm-ovl{--orange:#FFB300;--orange-d:#E69F00;--ink:#3A383D;--muted:#6B6970;--faint:#B5B3B8;--border:#D6D5D8;--bg:#F6F5F7;\nfont-family:'Inter',sans-serif;color:var(--ink);max-width:1180px;margin:0 auto;padding:48px 24px;box-sizing:border-box}\n.onm *,.onm *:before,.onm *:after{box-sizing:border-box}\n.onm-top{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:28px}\n.onm-logo{height:30px;display:block}\n.onm-eyebrow{font:700 13px 'Inter',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}\n.onm h2{font:700 clamp(36px,5vw,56px)/1.05 'Bricolage Grotesque',sans-serif;letter-spacing:-.02em;margin:0 0 12px}\n.onm .onm-br{color:var(--orange)}\n.onm-lead{font:400 18px/1.5 'Inter',sans-serif;color:var(--muted);margin:0 0 28px;max-width:640px}\n.onm-stats{display:flex;gap:48px;flex-wrap:wrap;margin-bottom:32px}\n.onm-stats b{display:block;font:700 44px/1 'Bricolage Grotesque',sans-serif;letter-spacing:-.02em}\n.onm-stats small{font:400 13px 'Inter',sans-serif;color:inherit;opacity:.75}\n.onm-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}\n.onm-chip{font:500 14px 'Inter',sans-serif;padding:9px 20px;border-radius:999px;cursor:pointer;background:#fff;color:var(--ink);border:1.5px solid var(--border);transition:all .2s cubic-bezier(.2,.8,.2,1)}\n.onm-chip.on{background:var(--orange);color:var(--ink);border-color:var(--orange)}\n.onm-grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:24px}\n@media(max-width:860px){.onm-grid{grid-template-columns:1fr}.onm-panel{min-height:0!important}}\n.onm-map{height:560px;border-radius:20px;overflow:hidden;border:1px solid var(--border);background:var(--bg)}\n.onm-panel{background:var(--bg);border-radius:20px;padding:28px;min-height:560px;display:flex;flex-direction:column}\n.onm-panel h3{font:700 24px/1.2 'Bricolage Grotesque',sans-serif;margin:10px 0 12px}\n.onm-panel p{font:400 15px/1.5 'Inter',sans-serif;color:var(--muted);margin:0 0 14px}\n.onm-dot{width:14px;height:14px;border-radius:999px;display:inline-block;flex:none}\n.onm-selhead{display:flex;align-items:center;gap:10px}\n.onm-row{border-top:1px solid var(--border);padding:12px 0;display:flex;justify-content:space-between;font-size:13px;color:var(--muted)}\n.onm-row b{font:700 15px 'Inter',sans-serif;color:var(--ink)}\n.onm-cta{display:block;width:100%;text-align:center;background:var(--orange);color:var(--ink);font:700 16px 'Inter',sans-serif;border:none;cursor:pointer;padding:14px 28px;border-radius:999px;transition:background .2s;margin-top:auto}\n.onm-cta:hover{background:var(--orange-d)}\n.onm-foot{margin-top:12px;text-align:center;color:var(--faint);font-size:12px}\n.onm-ovl{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(58,56,61,.55);z-index:2147483000;display:none;align-items:center;justify-content:center;padding:24px}\n.onm-ovl.open{display:flex}\n.onm-modal{background:#fff;border-radius:24px;padding:40px;width:460px;max-width:100%;max-height:85vh;overflow:auto;box-shadow:0 16px 48px rgba(58,56,61,.25);position:relative;font-family:'Inter',sans-serif;color:var(--ink)}\n.onm-x{position:absolute;top:18px;right:18px;width:36px;height:36px;border-radius:999px;border:1px solid var(--border);background:#fff;color:var(--ink);font:500 16px 'Inter',sans-serif;cursor:pointer}\n.onm-ctx{display:flex;align-items:center;gap:10px;background:var(--bg);border-radius:12px;padding:12px 16px;margin:14px 0 6px;font:500 14px 'Inter',sans-serif}\n.onm-form{display:flex;flex-direction:column;gap:14px;margin-top:16px}\n.onm-form label{display:flex;flex-direction:column;gap:6px;font:500 13px 'Inter',sans-serif;color:var(--muted)}\n.onm-form input:not([type=hidden]){font:400 15px 'Inter',sans-serif;background:#fff;color:#3A383D;padding:12px 14px;border:1px solid var(--border);border-radius:12px;outline:none}\n.onm-form input:focus{border-color:var(--orange)}\n.onm-err{color:#D6001C;font:500 13px 'Inter',sans-serif;margin:0;display:none}\n.onm-map .leaflet-container{font-family:'Inter',sans-serif}\n";
document.head.appendChild(st);
var CFG = window.ONM_CONFIG || {};
var BASE = 'https://raw.githubusercontent.com/danielbeorigionalmarketing-web/Nottingham-map/main/';
var DATA_URLS = CFG.dataUrl ? [CFG.dataUrl] : [BASE+'routes-data.json', BASE+'routes-data%20(1).json'];
var WEBFLOW_ACTION = CFG.webflowAction || '';
var WEBFLOW_FORM_NAME = CFG.webflowFormName || 'Network Map Enquiry';

// Lazy-load: fetch data + build the map only when the section nears the viewport.
// Robust to any script placement: waits for DOM ready and for the #onm section to exist.
var started = false;
function start(){
  if(started) return; started = true;
  var i = 0;
  (function tryNext(){
    if(i >= DATA_URLS.length){ console.error('Outdo map: could not load route data from any URL'); return; }
    var u = DATA_URLS[i++];
    fetch(u).then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(init).catch(function(e){ console.warn('Outdo map: failed '+u, e); tryNext(); });
  })();
}
function arm(tries){
  var el = document.getElementById('onm');
  if(!el){
    if(tries > 0) setTimeout(function(){ arm(tries-1); }, 200);
    else console.error('Outdo map: #onm section not found on page');
    return;
  }
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(en){
      if(en[0].isIntersecting){ io.disconnect(); start(); }
    },{rootMargin:'400px'});
    io.observe(el);
  } else { start(); }
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ arm(25); });
} else { arm(25); }

function init(DATA){
var groups = DATA.groups || [], areas = DATA.areas || ['All'];
var $ = function(id){ return document.getElementById(id); };
var state = { filter:'All', sel:null };
var layers = {}, map, home;

// --- Map ---
map = L.map('onm-map', { scrollWheelZoom:true });
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  { maxZoom:18, attribution:'&copy; OpenStreetMap &copy; CARTO' }).addTo(map);
var all = [];
groups.forEach(function(c){
  c.coords.forEach(function(p){ all.push(p); });
  var casing = L.polyline(c.coords,{color:'#FFFFFF',weight:8,lineCap:'round'}).addTo(map);
  var main = L.polyline(c.coords,{color:c.color,weight:4,lineCap:'round'}).addTo(map);
  var hit = L.polyline(c.coords,{color:'#000',opacity:0,weight:18}).addTo(map);
  var sel = function(e){ if(e && e.originalEvent) e.originalEvent._stopped = true; select(c.id); };
  main.on('click',sel); hit.on('click',sel);
  hit.bindTooltip(c.colorName+' '+c.lines.join('/')+' — '+c.dest,{sticky:true});
  layers[c.id] = {casing:casing, main:main};
});
home = L.latLngBounds(all);
map.fitBounds(home,{padding:[24,24]});
map.on('click',function(){ if(state.sel) select(state.sel); });

function select(id){ state.sel = (state.sel===id) ? null : id; sync(); }

function sync(){
  groups.forEach(function(c){
    var l = layers[c.id], vis = state.filter==='All'||c.area===state.filter, isSel = state.sel===c.id;
    l.main.setStyle({opacity: !vis?0.06:(state.sel&&!isSel?0.35:1), weight:isSel?7:4});
    l.casing.setStyle({opacity: !vis?0.04:(state.sel&&!isSel?0.4:0.9), weight:isSel?11:8});
    if(isSel){ l.casing.bringToFront(); l.main.bringToFront(); }
  });
  try{
    var g = cur();
    if(g) map.fitBounds(L.latLngBounds(g.coords),{padding:[50,50],maxZoom:13});
    else map.fitBounds(home,{padding:[24,24]});
  }catch(e){}
  renderInfo(); renderChips();
}

function cur(){ for(var i=0;i<groups.length;i++) if(groups[i].id===state.sel) return groups[i]; return null; }
function summary(g){ return g ? g.colorName+' '+g.lines.join('/')+' — '+g.dest+' ('+g.area+' Nottingham)' : 'Whole NCT network'; }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

function renderChips(){
  $('onm-chips').innerHTML = areas.map(function(a){
    return '<button class="onm-chip'+(state.filter===a?' on':'')+'" data-a="'+a+'">'+a+'</button>';
  }).join('');
}
$('onm-chips').addEventListener('click',function(e){
  var a = e.target.getAttribute('data-a');
  if(a){ state.filter=a; state.sel=null; sync(); }
});

function renderInfo(){
  var g = cur(), el = $('onm-info');
  if(!g){
    el.innerHTML = '<span class="onm-eyebrow" style="color:var(--orange)">The network</span>'+
      '<h3>One city, every route.</h3>'+
      '<p>Tap any route to see where it goes and what it reaches.</p>';
  } else {
    el.innerHTML = '<div class="onm-selhead"><span class="onm-dot" style="background:'+g.color+'"></span>'+
      '<span class="onm-eyebrow">'+esc(g.colorName)+' · '+esc(g.area)+' Nottingham</span></div>'+
      '<h3>'+esc(g.dest)+'</h3><p>Lines '+esc(g.lines.join(' · '))+'</p>'+
      '<div class="onm-row"><span>Route length</span><b>'+g.km+' km</b></div>'+
      '<div class="onm-row"><span>Stops served</span><b>'+g.stops+'</b></div>'+
      '<div class="onm-row"><span>Timetabled journeys</span><b>'+g.vj+'</b></div>';
  }
}

// --- Modal ---
function openModal(){
  var g = cur();
  $('onm-ctx').innerHTML = (g?'<span class="onm-dot" style="width:12px;height:12px;background:'+g.color+'"></span>':'')+
  $('onm-f-route').value = summary(g);
  $('onm-f-area').value = g ? g.area+' Nottingham' : 'All areas';
  $('onm-f-url').value = window.location.href;
  $('onm-formwrap').style.display=''; $('onm-sentwrap').style.display='none';
  $('onm-err').style.display='none';
  $('onm-ovl').classList.add('open');
}
function closeModal(){ $('onm-ovl').classList.remove('open'); }
$('onm-open').addEventListener('click',openModal);
$('onm-close').addEventListener('click',closeModal);
$('onm-close2').addEventListener('click',closeModal);
$('onm-ovl').addEventListener('click',function(e){ if(e.target===this) closeModal(); });

$('onm-form').addEventListener('submit',function(e){
  e.preventDefault();
  var fd = new FormData(this), btn = $('onm-send');
  var done = function(){
    $('onm-sentmsg').textContent = 'One of the team will call you about '+fd.get('Selected-Route')+'.';
    $('onm-formwrap').style.display='none'; $('onm-sentwrap').style.display='';
    btn.textContent='Send enquiry'; btn.disabled=false;
  };
  if(!WEBFLOW_ACTION){ console.log('Enquiry (no endpoint set):', Object.fromEntries(fd.entries())); done(); return; }
  btn.textContent='Sending…'; btn.disabled=true; $('onm-err').style.display='none';
  var body = new URLSearchParams();
  fd.forEach(function(v,k){ body.append(k,v); });
  body.append('name', WEBFLOW_FORM_NAME);
  fetch(WEBFLOW_ACTION,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()})
    .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); done(); })
    .catch(function(err){ console.error(err); $('onm-err').style.display='block'; btn.textContent='Send enquiry'; btn.disabled=false; });
});

renderChips(); renderInfo();
}
})();

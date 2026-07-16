(function(){
var CFG = window.ONM_CONFIG || {};
var DATA_URL = CFG.dataUrl || 'https://raw.githubusercontent.com/danielbeorigionalmarketing-web/Nottingham-map/main/routes-data.json';
var WEBFLOW_ACTION = CFG.webflowAction || '';
var WEBFLOW_FORM_NAME = CFG.webflowFormName || 'Network Map Enquiry';

// Lazy-load: fetch data + build the map only when the section nears the viewport.
// Robust to any script placement: waits for DOM ready and for the #onm section to exist.
var started = false;
function start(){
  if(started) return; started = true;
  fetch(DATA_URL).then(function(r){ return r.json(); }).then(init)
    .catch(function(e){ console.error('Could not load route data:', e); });
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
      '<p>All 39 NCT services, plotted from the operator’s registered route data — Arnold to Clifton, Strelley to Southwell.</p>'+
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
    '<span>'+esc(summary(g))+(g?'':' — 39 services across Nottingham.')+'</span>';
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

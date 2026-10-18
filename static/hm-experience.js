/* Bar Franco · the homepage as an evening (layer on the live homepage; loads after editorial.js) */
(function(){
var R=document.documentElement,D=document,$=function(s,c){return(c||D).querySelector(s)},$$=function(s,c){return[].slice.call((c||D).querySelectorAll(s))};
var calm=matchMedia('(prefers-reduced-motion: reduce)').matches||R.classList.contains('calm');
R.classList.add('hx');
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function nz(){var p={};new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});return{h:+p.hour%24,m:+p.minute}}
function ses(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}
/* the curtain is the visit's welcome: mark the lead intro as seen, so it never plays later in the visit on another page */
ses('bf-lead','1');
var NBI='https://bookings.nowbookit.com/?accountid=e9d59bc3-73d5-4e64-a6e7-32a753b7dd3a&venueid=12388';
var tdog=$('#tdog'),dogSrc=(tdog&&$('img',tdog))?$('img',tdog).src:'/static/illustrations/dachshund.png';
var fnA=$('a[href^="Functions.html"],a[href^="/functions/"]'),fnHref=fnA?fnA.getAttribute('href').split('#')[0]+'#enquire':'/functions/#enquire';

/* the hours stay as written: no live open-now line (owner, Oct 2026) */
var hrs=$('.hf-act .hours');

/* 1 · arrival: once a visit, the curtain parts and the words come up */
/* the curtain plays whenever someone arrives or reloads (a typed address, a search, an ad, a refresh), not when they click back to Home
   from elsewhere on the site (that page change has its own walk), and not on the browser's back button. It used to play once per tab, so a
   second look in the same tab showed nothing. (owner, Oct 2026) */
function arrives(){var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0],t=n?n.type:'navigate';if(t==='back_forward')return false;var ref=D.referrer;return t==='reload'||!ref||ref.indexOf(location.origin)!==0}
var hero=$('.hero'),first=arrives(),arriving=false;
if(hero&&first&&!calm){ses('bf-hx','1');arriving=true;var cur=D.createElement('div');cur.className='hx-cur';cur.setAttribute('aria-hidden','true');cur.innerHTML='<i></i><i></i>';hero.appendChild(cur);
var copy=[$('.hf-copy .d1'),$('.hf-copy .lede'),$('.hf-act')].filter(Boolean);copy.forEach(function(e){e.classList.add('hx-rise')});
requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(function(){cur.classList.add('open')},160)})});
copy.forEach(function(e,i){setTimeout(function(){e.classList.add('in')},600+i*130)});
setTimeout(function(){cur.remove();copy.forEach(function(e){e.classList.remove('hx-rise','in')})},2300)}

/* 2 · the strip runs like a marquee, paused under the pointer */
var strip=$('.strip'),items=strip?[].slice.call(strip.children).map(function(n){return n.outerHTML}).join('')+'<span>•</span>':'';
function marquee(){if(!strip||calm)return;strip.classList.add('hx-run');strip.innerHTML='<span class="hx-track" aria-hidden="true"></span>';var tr=strip.firstChild;tr.innerHTML=items;var one=tr.scrollWidth,k=Math.max(1,Math.ceil(innerWidth/Math.max(1,one))),half=new Array(k+1).join(items);tr.innerHTML=half+half;tr.style.animationDuration=Math.round(k*one/(innerWidth<=620?24:38))+'s'}
marquee();

/* 3 · the intro reads itself in as you scroll */
var lede=$('.intro .lede'),words=[];
if(lede&&!calm)(function wrap(n){[].slice.call(n.childNodes).forEach(function(c){if(c.nodeType===3){var f=D.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){f.appendChild(D.createTextNode(p));return}var s=D.createElement('span');s.className='hx-w dim';s.textContent=p;words.push(s);f.appendChild(s)});n.replaceChild(f,c)}else if(c.nodeType===1)wrap(c)})})(lede);
function readTick(){}
/* the words come up in order once the paragraph is in view (about 26ms apart), whatever the scroll does next */
var readOn=false;if(words.length&&'IntersectionObserver' in window){var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting||readOn)return;readOn=true;ro.disconnect();words.forEach(function(w,i){setTimeout(function(){w.classList.remove('dim')},i*26)})})},{threshold:.35});ro.observe(lede)}else words.forEach(function(w){w.classList.remove('dim')});

/* 4 · the long room settles as it passes */
var full=$('.full .ph');
function zoomTick(){if(!full||calm)return;var r=full.getBoundingClientRect(),vh=innerHeight;if(r.bottom<0||r.top>vh)return;full.style.setProperty('--hxz',(1.08-.08*clamp((vh-r.top)/(vh+r.height),0,1)).toFixed(4))}

/* 5 · the host: he sits on the hours, then keeps you company in his frame in the corner. Tap him to book. */
var host=D.createElement('button');host.type='button';host.className='hx-host hero';host.setAttribute('aria-label','Book a table');
host.innerHTML='<span class="hx-fr"><span class="hx-say" aria-hidden="true"><span class="hx-say-t"></span></span><span class="hx-pet"><span class="hx-d"><img src="'+dogSrc+'" alt="" width="280" height="132"></span></span></span><span class="hx-tag" aria-hidden="true"></span>';D.body.appendChild(host);
var tag=$('.hx-tag',host),sayT=$('.hx-say-t',host),talkT=0,tdTag=null,hState='',glT=0,darkHero=false;
if(tdog){tdTag=D.createElement('span');tdTag.className='hx-tag';tdTag.setAttribute('aria-hidden','true');tdog.appendChild(tdTag)}
function tone(){if(!hrs)return;var m=getComputedStyle(hrs).color.match(/[\d.]+/g);darkHero=!!m&&(.2126*m[0]+.7152*m[1]+.0722*m[2])/255>.6}
function say(el,t,ms){if(!el)return;el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove('on')},ms||2600)}
function talk(t,ms){sayT.textContent=t;host.classList.add('talk');clearTimeout(talkT);talkT=setTimeout(function(){host.classList.remove('talk')},ms||2800)}
/* on phones he keeps the one greeting: a line per section widened his frame over the copy for three seconds at a time (audit, Oct 2026) */
function speak(t,ms){if(hState==='corner'&&innerWidth<=700)return;if(hState==='hero')say(tag,t,ms);else if(hState==='corner')talk(t,ms)}
function anchor(){var a=hrs.getBoundingClientRect();return[a.right-55,a.top-40]}
function cornerXY(){var m=innerWidth<=700?14:20;return[innerWidth-(host.offsetWidth||64)-m,innerHeight-52-m]}
function place(p){host.style.transform='translate('+p[0].toFixed(1)+'px,'+p[1].toFixed(1)+'px)'}
/* he walks: faces the way he's going, crosses first and drops last (a curve, not a slide), at a pace set by the distance */
var wk=null;
function walkTo(to,done,ms){if(wk){wk.cancel();wk=null}if(calm||!host.animate){place(to);host.classList.remove('walk');if(done)done();return}
var r=host.getBoundingClientRect(),f=[r.left,r.top],dx=to[0]-f[0],dy=to[1]-f[1],d=Math.sqrt(dx*dx+dy*dy);
if(d<2){place(to);if(done)done();return}
ms=ms||Math.round(clamp(460+d*.5,620,1400));host.style.setProperty('--fx',dx>0?'-1':'1');host.classList.add('walk');host.classList.remove('sniff');place(to);
var T=function(x,y){return'translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)'};
wk=host.animate([{transform:T(f[0],f[1])},{transform:T(f[0]+dx*.8,f[1]+dy*.25),offset:.62},{transform:T(to[0],to[1])}],{duration:ms,easing:'cubic-bezier(.35,.05,.3,1)'});
wk.onfinish=function(){wk=null;host.classList.remove('walk');host.style.setProperty('--fx','1');if(done)done()}}
function dock(){host.classList.add('snap');host.style.transform='';host.classList.add('docked');host.classList.toggle('duck',hState==='duck');void host.offsetWidth;host.classList.remove('snap')}
function undock(){var r=host.getBoundingClientRect();host.classList.add('snap');host.classList.remove('docked','duck');place([r.left,r.top]);void host.offsetWidth;host.classList.remove('snap')}
function settle(){if(hState!=='hero'||!hrs)return;var a=anchor(),r=host.getBoundingClientRect();if(Math.abs(a[0]-r.left)+Math.abs(a[1]-r.top)>6)walkTo(a,settle,380)}
/* on phones he ducks as the footer comes up (his frame sat over the sign-off and the footer links for 600px); on wide screens at the last line */
function want(){if(hrs){var a=hrs.getBoundingClientRect();if(a.top>innerHeight*.3&&a.bottom<innerHeight+40)return'hero'}var c=$('#climb');if(c&&tdog&&tdog.offsetWidth){var r=c.getBoundingClientRect();if(r.top<innerHeight*.6&&r.bottom>innerHeight*.4)return'duck'}var ph=innerWidth<=700,ft=ph?$('footer'):$('#legal');if(ft&&ft.getBoundingClientRect().top<innerHeight-(ph?40:0))return'duck';return'corner'}
var greeted=false;
function setState(s){var prev=hState;hState=s;if(s==='corner'&&!greeted){greeted=true;setTimeout(function(){if(hState==='corner')talk(innerWidth<=700?'Ciao. Tap me for a table.':'Ciao. Spritz first?',3000)},900)}
if(s==='hero'){host.classList.remove('talk','sniff');if(!prev||calm||!hrs){if(wk){wk.cancel();wk=null}host.classList.remove('docked','duck','out');host.classList.add('hero');if(hrs)place(anchor());return}
if(prev!=='hero'){if(host.classList.contains('docked'))undock();host.classList.remove('out');host.classList.add('hero');walkTo(anchor(),settle)}return}
if(prev==='hero'||!prev){host.classList.remove('hero');if(!prev||calm||!hrs){if(wk){wk.cancel();wk=null}host.classList.remove('out','walk');dock();return}
/* he leaves the hours line on foot, unframed, and the frame draws round him once he's sat down in the corner */
host.classList.add('out');walkTo(cornerXY(),function(){if(hState==='hero')return;dock();host.classList.remove('out')});return}
if(host.classList.contains('docked'))host.classList.toggle('duck',s==='duck')}
function hostTick(){if(arriving)return;var s=want();if(s!==hState)setState(s);else if(s==='hero'&&hrs&&!wk&&!host.classList.contains('docked'))place(anchor());host.classList.toggle('al',hState==='hero'&&darkHero)}
tone();
if(arriving&&hrs){var a0=anchor();hState='hero';place([-90,a0[1]]);host.classList.toggle('al',darkHero);
setTimeout(function(){walkTo(anchor(),function(){arriving=false;hostTick()},1500)},1050)}
else{arriving=false;hostTick()}
/* in the corner he isn't a sticker: every so often he puts his nose down, then settles */
function idle(){setTimeout(function(){var up=R.classList.contains('tb-up')||D.body.classList.contains('tb-up');if(hState==='corner'&&!wk&&!D.hidden&&!up&&host.classList.contains('docked')&&!host.classList.contains('talk')&&!host.classList.contains('duck')){host.classList.add('sniff');setTimeout(function(){host.classList.remove('sniff')},1400)}idle()},9000+Math.random()*8000)}
if(!calm)idle();
host.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&hState==='corner'&&!host.classList.contains('talk'))talk('Book a table',1800)});
host.addEventListener('focus',function(){if(hState==='corner')talk('Book a table',1800)});
var said={};
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var s=e.target,k=s.id||'intro';if(said[k])return;said[k]=1;var t=s.getAttribute('data-hi');if(!t||s.classList.contains('intro'))return;if(s.id==='climb'&&tdog&&tdog.offsetWidth){say(tdTag,t);return}speak(t)})},{threshold:.3});$$('section[data-hi]').forEach(function(s){io.observe(s)})}

/* 6 · Book a table opens here, not on another page */
var sheet=null,opener=null;
function buildSheet(){sheet=D.createElement('div');sheet.className='hx-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','hxT');
sheet.innerHTML='<div class="hx-scrim"></div><div class="hx-pan"><div class="hx-pan-h"><b id="hxT"><img src="'+dogSrc+'" alt="" width="280" height="132">Book a table</b><button type="button" class="hx-x">Close</button></div><p class="hx-pan-s">Bar from 4pm · Kitchen from 5pm, daily. Ten or more? <a href="'+fnHref+'">Plan an event</a></p><iframe title="Book a table at Bar Franco" src="about:blank"></iframe><p class="hx-pan-f">Widget not loading? <a href="'+NBI+'">Open the booking page</a> or call <a href="tel:+64212211307">021 221 1307</a></p></div>';
D.body.appendChild(sheet);$('.hx-scrim',sheet).addEventListener('click',closeSheet);$('.hx-x',sheet).addEventListener('click',closeSheet)}
function openSheet(from){if(!sheet)buildSheet();var f=$('iframe',sheet);if(f.getAttribute('src')==='about:blank')f.src=NBI+'&theme=light&colors=hex,AF0F00,6C0600';opener=from||D.activeElement;R.classList.add('hx-lock');sheet.classList.add('on');host.classList.add('gone');setTimeout(function(){$('.hx-x',sheet).focus({preventScroll:true})},80)}
function closeSheet(){if(!sheet||!sheet.classList.contains('on'))return;sheet.classList.remove('on');R.classList.remove('hx-lock');host.classList.remove('gone');if(opener&&opener.focus)opener.focus({preventScroll:true})}
D.addEventListener('keydown',function(e){if(!sheet||!sheet.classList.contains('on'))return;if(e.key==='Escape'){closeSheet();return}if(e.key!=='Tab')return;var fs=$$('button,a[href],iframe',$('.hx-pan',sheet)),i=fs.indexOf(D.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();fs[fs.length-1].focus()}else if(!e.shiftKey&&i===fs.length-1){e.preventDefault();fs[0].focus()}});
D.addEventListener('click',function(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var a=e.target.closest('a[href]');if(!a||!/^(\/bookings\/|Bookings\.html)(#.*)?$/.test(a.getAttribute('href')))return;e.preventDefault();e.stopPropagation();if(R.classList.contains('menu-open')){var mb=$('.mast-menu');R.classList.remove('menu-open');if(mb){mb.setAttribute('aria-expanded','false');mb.textContent='Menu'}}openSheet(a)},true);
host.addEventListener('click',function(){openSheet(host)});

/* one scroll loop for all of it */
var raf=0;function tick(){raf=0;readTick();zoomTick();hostTick()}
addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(tick)},{passive:true});
var rT=0;addEventListener('resize',function(){clearTimeout(rT);rT=setTimeout(function(){tone();marquee();tick()},150)});
addEventListener('load',tick);tick();
})();

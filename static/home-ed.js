/* Bar Franco · Home, the editorial edition: masked headings, quiet paragraphs, photographs that open and drift, the gallery.
   Plain JS (no library): IntersectionObserver for entrances (each plays once), one rAF scroll loop for the parallax.
   Reduced motion: nothing moves, everything is shown, the gallery still works. */
(function(){
var R=document.documentElement,D=document;
if(!R.classList.contains('ed'))return;
var $=function(s,c){return(c||D).querySelector(s)},$$=function(s,c){return[].slice.call((c||D).querySelectorAll(s))};
var calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
var phone=function(){return innerWidth<=860};
R.classList.add('ed-js');if(calm)R.classList.add('ed-calm');

/* headings: each word sits in its own mask; every word of a line rises together, lines 120ms apart */
function wrapWords(el){if(el._ed)return;el._ed=1;(function walk(n){[].slice.call(n.childNodes).forEach(function(c){
 if(c.nodeType===3){var f=D.createDocumentFragment();c.textContent.split(/( +|\n+)/).forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){f.appendChild(D.createTextNode(p));return}
  var w=D.createElement('span');w.className='ed-w';var i=D.createElement('span');i.className='ed-wi';i.textContent=p;w.appendChild(i);f.appendChild(w)});n.replaceChild(f,c)}
 else if(c.nodeType===1&&!c.classList.contains('ed-w'))walk(c)})})(el)}
function lineDelays(el,base){var ws=$$('.ed-w',el),tops=[],step=phone()?100:120;ws.forEach(function(w){var t=Math.round(w.offsetTop);if(tops.indexOf(t)<0)tops.push(t)});tops.sort(function(a,b){return a-b});
 ws.forEach(function(w){$('.ed-wi',w).style.setProperty('--d',(base+tops.indexOf(Math.round(w.offsetTop))*step)+'ms')})}
var heads=$$('[data-ed-h]');if(!calm)heads.forEach(wrapWords);

/* the hero: the photograph is there at once; the title rises at 150ms, the line at +200ms, the asks last */
var h1=$('.hf-copy [data-ed-h]'),hl=$('.hf-side>.lede'),ha=$('.hf-act');
var logo=$('.hf-copy .ed-logo'),cue=$('.hf-copy .ed-cue'),hk=$('.hf-act .hx-acts');
function heroIn(){if(logo)logo.classList.add('in');if(h1){lineDelays(h1,350);h1.classList.add('in')}if(hl){hl.style.setProperty('--d','700ms');hl.classList.add('in')}if(hk){hk.style.setProperty('--d','850ms');hk.classList.add('in')}if(ha)ha.classList.add('in');if(cue)cue.classList.add('in')}
if(calm){heroIn()}else{(D.fonts&&D.fonts.ready?D.fonts.ready:Promise.resolve()).then(function(){requestAnimationFrame(heroIn)})}

/* entrances: number first, heading 100ms later, the words 150ms after that; photographs open on their own */
var role=function(e){return e.hasAttribute('data-ed-n')?'n':e.hasAttribute('data-ed-h')?'h':e.hasAttribute('data-ed-img')?'i':'p'};
function show(e){if(e.classList.contains('in'))return;var r=role(e),sec=e.closest('section'),fresh=sec&&!sec._edT;if(sec&&fresh)sec._edT=performance.now();
 var since=sec?performance.now()-sec._edT:0,lead=function(ms){return Math.max(0,ms-since)};
 if(r==='h'){lineDelays(e,lead(sec&&$('[data-ed-n]',sec)?100:0))}
 else if(r==='p'){var ps=sec?$$('[data-ed-p]',sec):[e],k=Math.max(0,ps.indexOf(e));e.style.setProperty('--d',lead(250+k*70)+'ms')}
 else if(r==='i'){e.style.setProperty('--d','0ms')}
 e.classList.add('in')}
var items=$$('[data-ed-n],[data-ed-p],[data-ed-img]').concat(heads.filter(function(h){return h!==h1}));
if(calm||!('IntersectionObserver' in window)){items.forEach(function(e){e.classList.add('in')})}
else{var io=new IntersectionObserver(function(es){es.forEach(function(x){if(!x.isIntersecting)return;io.unobserve(x.target);show(x.target)})},{rootMargin:'0px 0px -15% 0px',threshold:0});
 (D.fonts&&D.fonts.ready?D.fonts.ready:Promise.resolve()).then(function(){items.forEach(function(e){io.observe(e)})})}

/* scroll: the hero photograph grows 1 to 1.06 over the first screen while the title drifts up a little; photographs drift up to 40px (12px on phones) */
var heroImg=$('.hf-fold .hero .ph img'),fold=$('.hf-fold'),copy=$('.hf-fold>.hf-copy'),pxs=$$('[data-ed-img] .ed-px');
var raf=0;function tick(){raf=0;var vh=innerHeight,y=scrollY;R.classList.toggle('ed-top',y<vh*.55);
 if(heroImg&&y<vh*1.2){var t=Math.min(1,Math.max(0,y/vh));heroImg.style.setProperty('--hs',(1+.06*t).toFixed(4));if(copy)copy.style.setProperty('--hy',(-y*.12).toFixed(1)+'px')}
 var max=phone()?12:40;pxs.forEach(function(p){var f=p.parentNode.closest('[data-ed-img]')||p.parentNode,r=f.getBoundingClientRect();if(r.bottom<-80||r.top>vh+80)return;
  var c=(r.top+r.height/2-vh/2)/(vh/2+r.height/2);c=Math.max(-1,Math.min(1,c));p.style.setProperty('--py',(c*max).toFixed(1)+'px')})}
R.classList.toggle('ed-top',scrollY<innerHeight*.55);if(calm)addEventListener('scroll',function(){R.classList.toggle('ed-top',scrollY<innerHeight*.55)},{passive:true});
if(!calm){addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(tick)},{passive:true});addEventListener('resize',function(){if(!raf)raf=requestAnimationFrame(tick)});tick()}

/* the gallery: one photograph at a time, 40px and a crossfade over 650ms; tap, keys or a swipe; never on its own */
var gv=$('[data-gal]');if(gv){var sl=$$('.ed-slide',gv),cur=0,busy=false,n=$('[data-gal-n]'),cap=$('[data-gal-cap]'),EASE='cubic-bezier(.455,.03,.515,.955)';
 var pre=function(i){var im=$('img',sl[i]);if(im&&im.loading==='lazy'){im.loading='eager'}};
 function go(d){if(busy||sl.length<2)return;var a=sl[cur],nx=(cur+d+sl.length)%sl.length,b=sl[nx];pre(nx);pre((nx+d+sl.length)%sl.length);
  var done=function(){a.classList.remove('on');a.setAttribute('aria-hidden','true');b.removeAttribute('aria-hidden');b.style.zIndex='';busy=false};
  cur=nx;if(n)n.textContent=(cur<9?'0':'')+(cur+1);if(cap)cap.textContent=b.getAttribute('data-cap')||'';
  b.classList.add('on');
  var ms=phone()?520:650;if(calm||!b.animate){done();return}busy=true;b.style.zIndex='2';
  a.animate([{transform:'translateX(0)',opacity:1},{transform:'translateX('+(-40*d)+'px)',opacity:0}],{duration:ms,easing:EASE,fill:'none'});
  b.animate([{transform:'translateX('+(40*d)+'px)',opacity:0},{transform:'translateX(0)',opacity:1}],{duration:ms,easing:EASE,fill:'none'}).onfinish=done}
 var prev=$('[data-gal-prev]'),next=$('[data-gal-next]');if(prev)prev.addEventListener('click',function(){go(-1)});if(next)next.addEventListener('click',function(){go(1)});
 gv.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}});
 var x0=null,y0=0;gv.addEventListener('pointerdown',function(e){x0=e.clientX;y0=e.clientY});
 gv.addEventListener('pointerup',function(e){if(x0===null)return;var dx=e.clientX-x0,dy=e.clientY-y0;x0=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))go(dx<0?1:-1)});
 gv.addEventListener('pointercancel',function(){x0=null});gv.addEventListener('dragstart',function(e){e.preventDefault()});
 if('IntersectionObserver' in window){var gio=new IntersectionObserver(function(es){if(es[0].isIntersecting){pre(1);gio.disconnect()}},{rootMargin:'400px 0px'});gio.observe(gv)}}
})();

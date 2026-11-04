/* Bar Franco · the site's shared motion, the same vocabulary as Home (home-ed.js), for every other page.
   Section headings rise line by line out of a mask (900ms), the label and words follow quietly (500ms, 16px),
   photographs open through a mask (site-ed.css, on the .rv class editorial.js already sets). Each plays once.
   The first screen and the events covers keep their own entrances. Reduced motion: nothing moves. */
(function(){
var R=document.documentElement,D=document;
if(R.classList.contains('ed'))return;
var $$=function(s,c){return[].slice.call((c||D).querySelectorAll(s))};
var calm=matchMedia('(prefers-reduced-motion: reduce)').matches||R.classList.contains('calm');
R.classList.add('se-js');if(calm){R.classList.add('se-calm');return}
if(!('IntersectionObserver' in window))return;
var phone=function(){return innerWidth<=860};
/* what moves: section headings and their words, outside the first screen's cover */
var skip='[data-hero],.sd-cover,.hf-fold,.mast,footer,.foot,#legal,.sticky-cta,.dock,.card,.sd-ix-p,.pk-d:not([open])';
var heads=$$('.sec .d1,.sec .d2').filter(function(h){return!h.closest(skip)});
var paras=$$('.sec .eb,.sec .lede').filter(function(p){return!p.closest(skip)});
var firstScreen=function(e){return e.getBoundingClientRect().top<innerHeight*.92};
function wrap(el){(function walk(n){[].slice.call(n.childNodes).forEach(function(c){
 if(c.nodeType===3){var f=D.createDocumentFragment();c.textContent.split(/( +|\n+)/).forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){f.appendChild(D.createTextNode(p));return}
  var w=D.createElement('span');w.className='se-w';var i=D.createElement('span');i.className='se-wi';i.textContent=p;w.appendChild(i);f.appendChild(w)});n.replaceChild(f,c)}
 else if(c.nodeType===1&&!/^(BR|SVG|IMG)$/.test(c.tagName))walk(c)})})(el)}
function lines(el,base){var ws=$$('.se-w',el),tops=[],step=phone()?100:120;ws.forEach(function(w){var t=Math.round(w.offsetTop);if(tops.indexOf(t)<0)tops.push(t)});tops.sort(function(a,b){return a-b});
 ws.forEach(function(w){w.firstChild.style.setProperty('--d',(base+tops.indexOf(Math.round(w.offsetTop))*step)+'ms')})}
var ready=D.fonts&&D.fonts.ready?D.fonts.ready:Promise.resolve();
ready.then(function(){
 var live=[];
 heads.forEach(function(h){if(firstScreen(h))return;wrap(h);h.setAttribute('data-se-h','');live.push(h)});
 paras.forEach(function(p){if(firstScreen(p))return;p.setAttribute('data-se-p','');live.push(p)});
 var io=new IntersectionObserver(function(es){es.forEach(function(x){if(!x.isIntersecting)return;io.unobserve(x.target);var e=x.target,sec=e.closest('section')||e.parentNode;
  if(!sec._seT)sec._seT=performance.now();var since=performance.now()-sec._seT,lead=function(ms){return Math.max(0,ms-since)};
  if(e.hasAttribute('data-se-h')){lines(e,lead(e.previousElementSibling&&e.previousElementSibling.classList.contains('eb')?100:0))}
  else{var k=e.classList.contains('eb')?0:250;e.style.setProperty('--d',lead(k)+'ms')}
  e.classList.add('in')})},{rootMargin:'0px 0px -15% 0px',threshold:0});
 live.forEach(function(e){io.observe(e)});
 /* photographs: editorial.js marks them .shown as they arrive; this makes sure the mask opens on the same line as the words */
 var rio=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('se-in');rio.unobserve(x.target)}})},{rootMargin:'0px 0px -10% 0px'});
 $$('.rv').forEach(function(f){if(f.closest('[data-hero],.sd-cover'))return;if(firstScreen(f))f.classList.add('se-in');else rio.observe(f)});
 /* a keyboard user who tabs into a section that hasn't played yet sees it at once */
 D.addEventListener('focusin',function(ev){var s=ev.target.closest&&ev.target.closest('section');if(!s)return;$$('[data-se-h],[data-se-p],.rv',s).forEach(function(e){if(e.hasAttribute('data-se-h'))lines(e,0);e.classList.add('in','se-in')})});
});
})();

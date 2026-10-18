/* Bar Franco editorial system: header layer, page walk, floors, reveals, lights, clock */
(function(){
var R=document.documentElement,$=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
if(matchMedia('(prefers-reduced-motion: reduce)').matches)R.classList.add('calm');
function calm(){return R.classList.contains('calm')}
function lerp(a,b,k){return a+(b-a)*k}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function smooth(t){t=clamp(t,0,1);return t*t*(3-2*t)}
function sget(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function sset(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
function nz(){var p={};try{new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',hour:'numeric',minute:'2-digit',hour12:false}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value})}catch(e){var d=new Date();p.hour=d.getHours();p.minute=d.getMinutes()}return{h:(+p.hour)%24,m:+p.minute}}
function lget(k){try{return localStorage.getItem(k)}catch(e){return null}}function lset(k,v){try{localStorage.setItem(k,v)}catch(e){}}
var lights=new URLSearchParams(location.search).get('lights')||lget('bf-lights')||'auto';
if(lget('bf-motion')==='calm')R.classList.add('calm');
function isNight(){if(lights==='night')return true;if(lights==='day')return false;var h=nz().h;return h>=21||h<4}
/* the four events pages (html.sd) have no night palette: they keep their day colours after 9pm */
R.classList.toggle('night',isNight()&&!R.classList.contains('sd'));

/* the live clock in the closing band */
function clock(){var oh=$('#openH'),ot=$('#openT');if(!oh)return;var t=nz(),h=t.h,m=t.m,h12=((h+11)%12)+1;ot.textContent=h12+':'+(m<10?'0':'')+m+(h<12?'am':'pm')+' in Christchurch';oh.innerHTML=h>=16&&h<17?'Open. Kitchen at 5pm':h>=17?'Open <em>till</em> late':'Opening at 4pm'}
clock();setInterval(clock,30000);

/* the header layer: the logo settles as you scroll; ink and veil follow what's beneath */
var mast=$('.mast'),mk=$('.mk'),mastR=$('.mast-r'),hero=$('[data-hero]'),mkS=1;
function tog(c,on){if(on!==mast.classList.contains(c))mast.classList.toggle(c,on)}
function toneAt(x,y){if(R.classList.contains('night'))return'dark';var els=document.elementsFromPoint(x,y);for(var i=0;i<els.length;i++){var e=els[i];if(e.closest('.mast,.lead,.walk-ov,.mockbar,a,button,.card,.cta-row'))continue;var t=e.closest('[data-tone]');if(t)return t.dataset.tone;
for(var n=e;n&&n!==document.documentElement;n=n.parentElement){if(n.tagName==='IMG'||n.tagName==='VIDEO')return'dark';var cs=getComputedStyle(n);if(cs.backgroundImage&&cs.backgroundImage!=='none'&&cs.backgroundImage.indexOf('gradient')<0)return'dark';var m=cs.backgroundColor.match(/[\d.]+/g);if(m&&(m.length<4||+m[3]>.5)){var r=+m[0],g=+m[1],b=+m[2],L=(.2126*r+.7152*g+.0722*b)/255;return L<.5?'dark':(Math.abs(r-250)<14&&Math.abs(g-215)<16?'almond':'light')}}
return'light'}return'light'}
var mastT=0;
function mastTick(){if(!mast||!mk||R.classList.contains('menu-open'))return;
/* below the top of the page the header is the cream bar (top bar), so its ink only matters up here: 4x a second, not every frame */
if(scrollY>72){mastT=0;return}var now=performance.now();if(now-mastT<250)return;mastT=now;
var a=mk.getBoundingClientRect(),b=mastR.getBoundingClientRect(),t1=toneAt(a.left+Math.min(24,a.width/3),a.top+a.height/2),t2=toneAt(b.left+b.width/2,b.top+b.height/2);if(innerWidth<=900)t2=t1;
tog('lk-l',t1!=='dark');tog('lk-a',t1==='almond');tog('nv-l',t2!=='dark');tog('nv-a',t2==='almond')}
var mbtn=$('.mast-menu');
if(mbtn)mbtn.addEventListener('click',function(){var o=R.classList.toggle('menu-open');mbtn.setAttribute('aria-expanded',String(o));mbtn.textContent=o?'Close':'Menu'});
if(mbtn)addEventListener('keydown',function(e){if(e.key==='Escape'&&R.classList.contains('menu-open')){R.classList.remove('menu-open');mbtn.setAttribute('aria-expanded','false');mbtn.textContent='Menu';mbtn.focus()}});

/* photographs settle in as they arrive */
var rio=('IntersectionObserver' in window)&&!calm()?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('shown');rio.unobserve(e.target)}})},{rootMargin:'0px 0px 12% 0px'}):null;
$$('.rv').forEach(function(f){if(rio)rio.observe(f);else f.classList.add('shown')});

/* smooth, interruptible scroll */
var goRAF=0;
function easeScroll(end,D){var start=scrollY;cancelAnimationFrame(goRAF);if(calm()||Math.abs(end-start)<4){scrollTo(0,end);return}var t0=performance.now();function f(now){var t=clamp((now-t0)/D,0,1),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;scrollTo(0,start+(end-start)*e);if(t<1)goRAF=requestAnimationFrame(f)}goRAF=requestAnimationFrame(f)}
['wheel','touchstart','keydown'].forEach(function(ev){addEventListener(ev,function(){cancelAnimationFrame(goRAF);if(lState==='idle'&&ev!=='touchstart')walkLead()},{passive:true})});

/* two floors side by side; the dog rides the seam, red at the bar, almond upstairs */
var doors=$('#doors'),tdog=$('#tdog'),lv=1,sq=0,sFrom=0,sTo=0,sT0=0,sDur=1400;
function setLevel(n){if(!doors||n===lv)return;lv=n;$$('.floor',doors).forEach(function(d){d.classList.toggle('on',+d.dataset.lv===n)});var t1=$('#tl1'),t2=$('#tl2');if(t1&&t2){t1.classList.toggle('on',n===1);t2.classList.toggle('on',n===2)}
if(tdog){tdog.classList.toggle('al',n===2);var fl=$('.fl',tdog);if(fl)fl.style.setProperty('--fx',n===2?-1:1)}sFrom=sq;sTo=n===2?1:0;sT0=performance.now();sDur=calm()?1:1400*Math.max(.4,Math.abs(sTo-sFrom))}
function seam(now){if(!doors||!tdog||!tdog.offsetWidth)return;if(sq!==sTo){var t=clamp((now-sT0)/sDur,0,1),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;sq=t>=1?sTo:sFrom+(sTo-sFrom)*e}
var d1=doors.firstElementChild,ph=$('.f-ph',d1),H=ph?ph.offsetHeight:doors.clientHeight,dw=tdog.offsetWidth,dh=tdog.offsetHeight,y=H*.86+(H*.16-H*.86)*sq;tdog.style.transform='translate('+((d1.offsetWidth||(ph?ph.offsetLeft+ph.offsetWidth:0))-1-dw/2).toFixed(1)+'px,'+(y-dh).toFixed(1)+'px)'}
if(doors)$$('.floor',doors).forEach(function(d){d.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')setLevel(+d.dataset.lv)});d.addEventListener('click',function(e){if(!e.target.closest('a,button'))setLevel(+d.dataset.lv)})});
[['#tl1',1],['#tl2',2]].forEach(function(p){var t=$(p[0]);if(t)t.addEventListener('click',function(){setLevel(p[1])})});
$$('[data-go-up]').forEach(function(b){b.addEventListener('click',function(e){if(!doors)return;e.preventDefault();var end=doors.getBoundingClientRect().top+scrollY-96,far=Math.abs(end-scrollY)>40;if(far)easeScroll(end,1100);setTimeout(function(){setLevel(2)},far&&!calm()?900:0)})});

/* the dog on the lead: once per visit, on the home page */
var coarse=matchMedia('(pointer:coarse),(max-width:860px)').matches,lead=$('#lead'),lState='gone',lT0=0,lIn0=0,lTimer=0,lX=0,lSagNow=36,ldog,lh,lpath,lloop,lsvg,lmid,ltop;
function lHome(){return Math.max(lh.offsetLeft+lh.offsetWidth+120,lead.clientWidth*.42)}
function ss(a,b,v){return smooth((v-a)/(b-a))}
function fadeUp(el,k,dy){if(!el)return;el.style.opacity=k.toFixed(3);el.style.transform='translateY('+((1-k)*dy).toFixed(2)+'px)'}
function geo(){var o=lead.getBoundingClientRect(),h=lh.getBoundingClientRect(),d=ldog.getBoundingClientRect();lsvg.setAttribute('viewBox','0 0 '+o.width.toFixed(0)+' '+o.height.toFixed(0));return{W:o.width,hx:h.right-o.left-14,hy:h.top-o.top+h.height/2,cx:d.left-o.left+d.width*.82,cy:d.top-o.top+d.height*.26}}
/* the lead hangs as a soft cubic curve, not a straight line */
function rope(x0,y0,x1,y1,sag){var dx=x1-x0,dy=y1-y0,s=sag*1.33;lpath.setAttribute('d','M'+x0.toFixed(1)+' '+y0.toFixed(1)+' C'+(x0+dx*.3).toFixed(1)+' '+(y0+dy*.3+s).toFixed(1)+' '+(x0+dx*.7).toFixed(1)+' '+(y0+dy*.7+s).toFixed(1)+' '+x1.toFixed(1)+' '+y1.toFixed(1))}
/* the curtain plays over the page but never holds it: the first scroll (a swipe, the wheel, a key) lets it go */
function startLead(){clearTimeout(lTimer);lead.classList.remove('gone');lead.style.webkitMaskImage=lead.style.maskImage='';ldog.classList.add('sniff');lIn0=performance.now();lState='idle';lTimer=setTimeout(walkLead,coarse?1900:1500);addEventListener('scroll',leaveLead,{passive:true})}
function walkLead(){if(lState!=='idle')return;clearTimeout(lTimer);lState='walk';lT0=performance.now();ldog.style.opacity='1';ldog.classList.remove('sniff')}
function endLead(){lState='gone';lead.classList.add('gone');lead.style.webkitMaskImage=lead.style.maskImage=lead.style.opacity=lead.style.transition=lead.style.pointerEvents='';removeEventListener('scroll',leaveLead)}
function leaveLead(){if(lState==='gone'||lState==='leaving'||scrollY<3)return;clearTimeout(lTimer);lState='leaving';lead.style.pointerEvents='none';if(calm()){endLead();return}lead.style.transition='opacity .3s ease';lead.style.opacity='0';setTimeout(endLead,320)}
/* one renderer for the walk: driven by time, or by a finger */
function walkAt(p){var x1=lead.clientWidth+40,x=lX+(x1-lX)*p,dist=x-lX;
ldog.style.transform='translate('+x.toFixed(1)+'px,'+(-3.4*Math.abs(Math.sin(Math.PI*dist/34))).toFixed(2)+'px) rotate('+(1.1*Math.sin(2*Math.PI*dist/34)).toFixed(2)+'deg)';
var W=lead.clientWidth,edge=p*W*1.5,band=W*.5,m='linear-gradient(90deg,transparent '+(edge-band).toFixed(0)+'px,#000 '+edge.toFixed(0)+'px)';lead.style.webkitMaskImage=m;lead.style.maskImage=m;
var out=1-ss(0,.45,p);fadeUp(lmid&&lmid.children[0],out,-6);fadeUp(lmid&&lmid.children[1],out,-6);if(lmid)lmid.style.transform='translate(-50%,-50%) scale('+(1+.14*ss(0,1,p)).toFixed(4)+')';if(ltop)ltop.style.opacity=out.toFixed(3);lh.style.opacity=(1-ss(.04,.32,p)).toFixed(3);
var g=geo(),ten=ss(0,.22,p),rel=ss(.3,.78,p),sx=g.hx+9+(g.cx-48-(g.hx+9))*rel,sy=g.hy+(g.cy+12-g.hy)*rel;
rope(sx,sy,g.cx,g.cy,lSagNow*(1-ten)+9*rel);lpath.style.strokeDasharray='';lpath.style.strokeDashoffset='';
lloop.setAttribute('cx',(sx-9).toFixed(1));lloop.setAttribute('cy',sy.toFixed(1));lloop.style.opacity=(1-rel).toFixed(3)}
var fP0=0,fTo=1,fT0=0,fD=900,dragging=false,dX=0,dY=0,dP=0,vX=0,lastX=0,lastT=0;
function fling(p0,to){lState='fling';fP0=p0;fTo=to;fT0=performance.now();fD=to===1?Math.max(420,1100*(1-p0)):500}
function leadTick(now){var g,t;
if(lState==='idle'){t=now-lIn0;var home=lHome();
/* the curtain composes itself: script, line, dog, lead, then the word to tap */
fadeUp(lmid&&lmid.children[0],ss(0,650,t),8);fadeUp(lmid&&lmid.children[1],ss(180,820,t),8);if(ltop)ltop.style.opacity=ss(150,800,t).toFixed(3);
var dk=ss(300,950,t);ldog.style.opacity=dk.toFixed(3);ldog.style.transform='translate('+home.toFixed(1)+'px,'+((1-dk)*5).toFixed(2)+'px) scale(1,'+(1+.011*Math.sin(now/780)).toFixed(4)+')';
lh.style.opacity=ss(500,1000,t).toFixed(3);
g=geo();lSagNow=34+4.5*Math.sin(now/1400)+1.6*Math.sin(now/560+1.3);rope(g.hx+9,g.hy,g.cx,g.cy,lSagNow);
var rk=ss(350,1050,t);if(rk<1){var L=lpath.getTotalLength();lpath.style.strokeDasharray=L.toFixed(1);lpath.style.strokeDashoffset=(L*(1-rk)).toFixed(1)}else{lpath.style.strokeDasharray='';lpath.style.strokeDashoffset=''}
lloop.setAttribute('cx',g.hx.toFixed(1));lloop.setAttribute('cy',g.hy.toFixed(1));lloop.style.opacity=ss(400,800,t).toFixed(3);lX=home}
else if(lState==='drag'){walkAt(dP)}
else if(lState==='fling'){var k=clamp((now-fT0)/fD,0,1),q=1-Math.pow(1-k,3);walkAt(fP0+(fTo-fP0)*q);if(k>=1){if(fTo===1)endLead();else{lState='idle';lead.style.webkitMaskImage=lead.style.maskImage='';ldog.classList.add('sniff');lTimer=setTimeout(walkLead,coarse?1900:1500)}}}
else if(lState==='walk'){t=clamp((now-lT0)/1400,0,1);walkAt((1-Math.cos(Math.PI*t))/2);if(t>=1)endLead()}}
if(lead){ldog=$('#ldog');lh=$('#lhandle');lpath=$('#lpath');lloop=$('#lloop');lsvg=$('#lsvg');lmid=$('.l-mid',lead);ltop=$('.l-top',lead);lead.addEventListener('click',walkLead);
/* swipe: drag right (or up) and the dog walks with your finger; let go past a quarter and he carries on */
lead.addEventListener('pointerdown',function(e){if(lState!=='idle')return;dragging=true;dX=lastX=e.clientX;dY=e.clientY;dP=0;vX=0;lastT=performance.now()});
lead.addEventListener('pointermove',function(e){if(!dragging)return;var W=lead.clientWidth,d=Math.max(e.clientX-dX,dY-e.clientY),now=performance.now();vX=(e.clientX-lastX)/Math.max(1,now-lastT);lastX=e.clientX;lastT=now;dP=clamp(d/(W*.65),0,1);if(lState==='idle'&&d>8){lState='drag';clearTimeout(lTimer);ldog.classList.remove('sniff');ldog.style.opacity='1';try{lead.setPointerCapture(e.pointerId)}catch(_){}}});
var endDrag=function(){if(!dragging)return;dragging=false;if(lState==='drag')fling(dP,(dP>.26||vX>.45)?1:0)};
lead.addEventListener('pointerup',endDrag);lead.addEventListener('pointercancel',endDrag);
if(!calm()&&!sget('bf-lead')&&!R.classList.contains('walking-in')&&!location.hash&&!/[?&](gclid|gbraid|wbraid|utm_)/.test(location.search)){sset('bf-lead','1');startLead()}}

/* page to page: a slow deep-red dip, the dachshund a faint mark in the middle; out, then in on the next page */
var walk=$('#walk'),wpane=walk&&$('.walk-pane',walk),wdog=walk&&$('.wdog',walk);
function walkAnim(dir,done){if(!walk){if(done)done();return}walk.classList.add('on');var t0=performance.now(),D=dir==='out'?560:900;
function f(now){var t=clamp((now-t0)/D,0,1),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,o=dir==='out'?e:1-e;wpane.style.opacity=o.toFixed(3);wdog.style.opacity=(o*.42).toFixed(3);if(t<1)requestAnimationFrame(f);else if(done)done()}requestAnimationFrame(f)}
if(walk&&R.classList.contains('walking-in')){try{sessionStorage.removeItem('bf-walk')}catch(e){}walk.classList.add('on');wpane.style.opacity='1';wdog.style.opacity='.42';R.classList.remove('walking-in');setTimeout(function(){walkAnim('in',function(){walk.classList.remove('on');wpane.style.opacity='';wdog.style.opacity=''})},80)}
document.addEventListener('click',function(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var a=e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||/^(mailto|tel|sms|javascript):/i.test(h))return;var u;try{u=new URL(a.href,location.href)}catch(x){return}
if(u.origin!==location.origin||(u.pathname===location.pathname&&u.search===location.search))return;if(calm()||!walk)return;
/* a file (the printed menus, the PDF pack) opens as itself, with no page turn */
if(/\.(pdf|jpe?g|png|svg|zip)$/i.test(u.pathname))return;
/* touch screens: the next page starts loading at once and only turns in on arrival, so a tap never waits on the dip */
if(matchMedia('(pointer:coarse)').matches){sset('bf-walk','1');return}
e.preventDefault();R.classList.remove('menu-open');sset('bf-walk','1');var gone=false,go=function(){if(gone)return;gone=true;location.href=u.href},safety=setTimeout(go,1400);walkAnim('out',function(){clearTimeout(safety);go()})});
addEventListener('pageshow',function(e){if(e.persisted&&walk){walk.classList.remove('on');wpane.style.opacity='';wdog.style.opacity=''}});

/* sticky conversion CTA (Functions, Christmas): shows once past the hero, hides from the enquiry form down */
var scta=$('.sticky-cta');
if(scta){var sHero=$('.hero'),sEnq=$('#enquire');
function sctaTick(){var past=sHero?sHero.getBoundingClientRect().bottom<80:true,atForm=false;if(sEnq){var r=sEnq.getBoundingClientRect();atForm=r.top<innerHeight*.85}scta.classList.toggle('show',past&&!atForm)}
addEventListener('scroll',sctaTick,{passive:true});addEventListener('resize',sctaTick);sctaTick()}

/* contact form: composes an email, as on the live site */
$$('form[data-email]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var g=function(n){var el=f.querySelector('[name="'+n+'"]');return el?el.value.trim():''};location.href='mailto:'+f.dataset.email+'?subject='+encodeURIComponent(f.dataset.subject||'Message')+'&body='+encodeURIComponent(g('message')+'\n\n— '+g('name')+(g('email')?' ('+g('email')+')':''))})});
/* menu tabs (Menus page) */
var mtab=document.querySelector('.mn-tabs');if(mtab){var tbs=[].slice.call(mtab.querySelectorAll('[role="tab"]'));var showSheet=function(id){tbs.forEach(function(t){var on=t.getAttribute('aria-controls')===id;t.setAttribute('aria-selected',String(on));var pnl=document.getElementById(t.getAttribute('aria-controls'));if(pnl)pnl.hidden=!on})};
tbs.forEach(function(t){t.addEventListener('click',function(){showSheet(t.getAttribute('aria-controls'));history.replaceState(null,'','#'+t.getAttribute('aria-controls'))})});
var toSheets=function(){var s=document.getElementById('sheets');if(s)scrollTo(0,s.getBoundingClientRect().top+scrollY-90)};
var sh0=location.hash.slice(1);if(/^sheet-/.test(sh0)&&document.getElementById(sh0)){showSheet(sh0);setTimeout(toSheets,80)}else showSheet(tbs[0].getAttribute('aria-controls'));
addEventListener('hashchange',function(){var h=location.hash.slice(1);if(/^sheet-/.test(h)&&document.getElementById(h)){showSheet(h);toSheets()}})}
/* open a closed chapter when it is linked to (Events pack) */
var openHash=function(){var h=location.hash.slice(1);if(!h)return;var t=document.getElementById(h);if(!t)return;var dd=t.matches('details')?t:(t.querySelector('details')||t.closest('details'));if(dd&&!dd.open)dd.open=true};
/* phones: Functions and Christmas read like the events pack, in numbered chapters that open and close */
if(document.body.hasAttribute('data-chapters')){var chn=0;$$('section.sec').forEach(function(s){var eb=s.querySelector('.eb'),m=eb&&eb.textContent.trim().match(/^(\d{2})\s*·\s*(.+)$/);if(!m||s.closest('.chap'))return;
eb.setAttribute('data-ch-eb','');var row=document.createElement('button');row.type='button';row.className='ch-row';var n=document.createElement('span');n.className='pk-n';n.textContent=m[1];var tt=document.createElement('span');tt.className='d2';tt.textContent=m[2];var oc=document.createElement('span');oc.className='pk-oc';oc.setAttribute('aria-hidden','true');row.append(n,tt,oc);
var b=document.createElement('div');b.className='ch-b';var inn=document.createElement('div');inn.className='ch-in';while(s.firstChild)inn.appendChild(s.firstChild);b.appendChild(inn);s.append(row,b);s.classList.add('chap');var first=chn++===0||s.id==='enquire';s.classList.toggle('open',first);row.setAttribute('aria-expanded',String(first));
row.addEventListener('click',function(){var o=!s.classList.contains('open');s.classList.toggle('open',o);row.setAttribute('aria-expanded',String(o))})})}
var openChap=function(){var h=location.hash.slice(1),t=h&&document.getElementById(h),c=t&&t.closest('.chap');if(c&&!c.classList.contains('open')){c.classList.add('open');var r=c.querySelector('.ch-row');if(r)r.setAttribute('aria-expanded','true')}};
addEventListener('hashchange',openChap);document.addEventListener('click',function(e){if(e.target.closest('a[href^="#"]'))setTimeout(function(){openChap();openHash()},0)});openChap();
addEventListener('hashchange',openHash);openHash();
/* one loop for everything that moves */
function frame(now){if(lead&&lState!=='gone')leadTick(now);mastTick();seam(now);requestAnimationFrame(frame)}
requestAnimationFrame(frame);
})();

/* Bar Franco · top bar: away on the way down, back on the way up; one button that matches the page. Every page. */
(function(){
var R=document.documentElement,D=document,$=function(s,c){return(c||D).querySelector(s)};
var mast=$('.mast');if(!mast||R.classList.contains('tb'))return;R.classList.add('tb');
var book=$('.mast-book'),links=$('#links'),mb=$('.mast-menu');
/* one button, matched to the page: event pages go to the enquiry form */
/* #book only where it holds the booking widget (Bookings, Restaurant). Home's #book is a line that links to /bookings/,
   so jumping there would add a step before anyone can book: Home keeps /bookings/. */
/* the four events pages (html.sd) say what their dock says (Christmas: Enquire now); the pack and Robbie (body[data-ask=events]) send you to the Functions form */
if(book){var dockAsk=$('.sticky-btns .cta-fill');
if(R.classList.contains('sd')){book.textContent=dockAsk&&dockAsk.textContent.trim()||'Check your date';book.setAttribute('href','#enquire')}
else if(D.body.getAttribute('data-ask')==='events'){book.textContent='Check your date';book.setAttribute('href','/functions/#enquire')}
else if($('#enquire')){book.textContent='Check your date';book.setAttribute('href','#enquire')}else if($('#book iframe'))book.setAttribute('href','#book')}
/* phones: while the cover's own filled ask (the same words, or the same address) is on screen, the bar's copy steps back; it returns as the cover leaves */
if(book&&'IntersectionObserver' in window){var norm=function(s){return(s||'').replace(/\s+/g,' ').trim().toLowerCase()},hAsk=null;
[].slice.call(D.querySelectorAll('[data-hero] a.cta-fill,.hf-fold a.cta-fill')).some(function(a){if(norm(a.textContent)===norm(book.textContent)||a.href===book.href){hAsk=a;return true}return false});
if(hAsk)new IntersectionObserver(function(es){var e=es[es.length-1];R.classList.toggle('tb-hask',e.isIntersecting&&getComputedStyle(hAsk).visibility!=='hidden')},{rootMargin:'-64px 0px 0px 0px'}).observe(hAsk)}
/* the skip link lands on <main>, or where a page has none (Home, the events pages) on its opening section */
var skT=$('#main')||$('[data-hero][id]');if(skT&&!$('.tb-skip')){var sk=D.createElement('a');sk.className='tb-skip';sk.href='#'+skT.id;sk.textContent='Skip to content';D.body.insertBefore(sk,D.body.firstChild)}
/* phone menu: the essentials under the links */
if(links&&!$('.tb-foot',links)){var f=D.createElement('div');f.className='tb-foot';var go=D.createElement('a');go.className='cta cta-fill';go.href=book?book.getAttribute('href'):'/bookings/';go.textContent=book?book.textContent:'Book a table';f.appendChild(go);
var r=D.createElement('div');r.className='tb-foot-r';r.innerHTML='<a href="tel:+64212211307">Call 021 221 1307</a><a href="https://www.google.com/maps?q=166+Cashel+Street,+Christchurch+Central+8011">Directions</a>';f.appendChild(r);
/* the hours on one line, the address on the next: no middot left hanging at a line end */
var p=D.createElement('p');p.className='tb-hrs';p.append('Bar\u00a0from\u00a04pm\u00a0· Kitchen\u00a0from\u00a05pm',D.createElement('br'),'166\u00a0Cashel\u00a0St, upstairs');f.appendChild(p);links.appendChild(f)}
function closeMenu(){if(!R.classList.contains('menu-open'))return;R.classList.remove('menu-open');if(mb){mb.setAttribute('aria-expanded','false');mb.textContent='Menu'}}
if(links)links.addEventListener('click',function(e){if(e.target.closest('a'))closeMenu()});
if(mb)mb.addEventListener('click',function(){if(R.classList.contains('menu-open')){var a=$('#links a');if(a)setTimeout(function(){a.focus({preventScroll:true})},60)}});
D.addEventListener('keydown',function(e){if(e.key!=='Tab'||!R.classList.contains('menu-open'))return;var fs=[].slice.call(mast.querySelectorAll('a[href],button')).filter(function(x){return x.offsetParent!==null&&getComputedStyle(x).visibility!=='hidden'});if(!fs.length)return;var i=fs.indexOf(D.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();fs[fs.length-1].focus()}else if(!e.shiftKey&&i===fs.length-1){e.preventDefault();fs[0].focus()}});
/* away on the way down, back on the way up */
var TOP=72,lastY=scrollY,acc=0,state='';
function set(s){if(s===state)return;state=s;R.classList.toggle('tb-bar',s!=='top');R.classList.toggle('tb-up',s==='up');R.classList.toggle('tb-away',s==='away')}
function tick(){var y=Math.max(0,scrollY),dy=y-lastY;lastY=y;if(R.classList.contains('menu-open'))return;if(y<=TOP){acc=0;set('top');return}if(state==='top'){acc=0;set(dy>=0?'away':'up');return}
if(dy>0){acc=acc>0?acc+dy:dy;if(acc>14)set('away')}else if(dy<0){acc=acc<0?acc+dy:dy;if(acc<-8)set('up')}}
set(scrollY>TOP?'up':'top');
var raf=0;addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(function(){raf=0;tick()})},{passive:true});
mast.addEventListener('focusin',function(){if(state==='away')set('up')});
})();

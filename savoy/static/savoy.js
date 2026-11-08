
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];const has=s=>!!document.querySelector(s);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* nav: transparent over the hero, solid after */
addEventListener('scroll',()=>$('#nav').classList.toggle('solid',scrollY>(document.body.classList.contains('hm')?innerHeight-80:40)),{passive:true});

/* lift */
const lift=$('#lift'),floors=$$('.floor'),calls=$$('#calls button'),pics=$$('#pics .p'),reel=$('#reel'),dir=$('#dir');let cur=null,busy=false;
function toFloor(f,instant){if(f===cur)return;if(instant){reel.style.transition='none';pics.forEach(p=>p.style.transition='none')}
  dir.textContent=cur===null?' ':f>cur?'↑':'↓';reel.style.transform='translateY(calc('+(-(2-f))+' * var(--fh)))';
  floors.forEach(e=>e.classList.toggle('on',+e.dataset.f===f));calls.forEach(b=>b.classList.toggle('on',+b.dataset.f===f));
  pics.forEach(p=>{const pf=+p.dataset.f;p.classList.remove('on','past');if(pf===f)p.classList.add('on');else if(pf>f)p.classList.add('past')});
  if(instant){void reel.offsetWidth;reel.style.transition='';pics.forEach(p=>{void p.offsetWidth;p.style.transition=''})}
  cur=f;clearTimeout(dir._t);dir._t=setTimeout(()=>dir.textContent=' ',1100)}
const wait=ms=>new Promise(r=>setTimeout(r,RM?0:ms));
async function openLift(){if(busy)return;busy=true;lift.classList.add('vis');await wait(20);lift.classList.add('shut');await wait(800);lift.classList.add('inside');cur=null;toFloor(1,true);document.body.style.overflow='hidden';await wait(250);lift.classList.remove('shut');lift.classList.add('open');await wait(750);busy=false;$('#close').focus()}
async function closeLift(){if(busy)return;busy=true;lift.classList.remove('open');lift.classList.add('shut');await wait(800);lift.classList.remove('inside');document.body.style.overflow='';await wait(250);lift.classList.remove('shut');await wait(780);lift.classList.remove('vis');busy=false;$('#open').focus()}
$('#open').onclick=openLift;$('#close').onclick=closeLift;
/* the page turn: every page is a floor. Leaving, the doors shut over the page; arriving, they open on the next one */
const ROOT=(()=>{const sc=document.querySelector('script[src$="savoy.js"]');return sc?sc.src.replace(/static\/savoy\.js.*$/,''):''})();
function inSite(a){if(!a||a.target&&a.target!=='_self'||a.hasAttribute('download'))return false;let u;try{u=new URL(a.href,location.href)}catch(_){return false}
  if(u.origin!==location.origin||!u.href.startsWith(ROOT))return false;if(u.pathname===location.pathname&&u.search===location.search)return false;return /\.html$|\/$/.test(u.pathname)}
addEventListener('click',e=>{if(RM||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest('a[href]');if(!inSite(a))return;
  e.preventDefault();const href=a.href;try{sessionStorage.setItem('bf-lift','1')}catch(_){}
  lift.classList.add('vis');requestAnimationFrame(()=>lift.classList.add('shut'));setTimeout(()=>{location.href=href},820)},true);
if(document.documentElement.classList.contains('arrive')){try{sessionStorage.removeItem('bf-lift')}catch(_){}
  lift.classList.add('vis','shut');document.documentElement.classList.remove('arrive');
  setTimeout(()=>{lift.classList.remove('shut');setTimeout(()=>lift.classList.remove('vis'),800)},RM?0:260)}
addEventListener('pageshow',e=>{if(e.persisted){lift.classList.remove('vis','shut','inside','open');document.body.style.overflow=''}});
addEventListener('keydown',e=>{if(!lift.classList.contains('open'))return;if(e.key==='Escape')closeLift();if(e.key==='ArrowUp'){e.preventDefault();toFloor(Math.min(2,cur+1))}if(e.key==='ArrowDown'){e.preventDefault();toFloor(Math.max(0,cur-1))}});
floors.forEach(e=>{const f=+e.dataset.f;e.addEventListener('mouseenter',()=>toFloor(f));e.querySelector('.fl').onclick=()=>toFloor(f)});
calls.forEach(b=>b.onclick=()=>toFloor(+b.dataset.f));$$('.lift a[href^="#"]').forEach(a=>a.addEventListener('click',()=>closeLift()));

if(has('.hero .slide')){/* hero: 3-slide fade with thumbnail rail + progress line */
const sl=$$('.hero .slide'),th=$$('.rail button'),bar=$('.rail .prog i');let hi=0,t0=performance.now();const DUR=6500;
function go(n){hi=(n+sl.length)%sl.length;sl.forEach((s,i)=>s.classList.toggle('on',i===hi));th.forEach((s,i)=>s.classList.toggle('on',i===hi));t0=performance.now()}
th.forEach((b,i)=>b.onclick=()=>go(i));
if(!RM)(function tick(now){const p=Math.min((now-t0)/DUR,1);if(bar)bar.style.width=p*100+'%';if(p>=1)go(hi+1);requestAnimationFrame(tick)})(performance.now());

}
/* intro: letters fade in one by one, the rule draws out */
$$('#ih .w').forEach(w=>{let i=0;w.innerHTML=w.dataset.w.split(' ').map(word=>'<span class="wd">'+[...word].map(ch=>'<span style="transition-delay:'+((i++)*55)+'ms">'+ch+'</span>').join('')+'</span>').join(' ')});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -6% 0px'});
$$('.rv,#ih,.split').forEach(e=>io.observe(e));
setTimeout(()=>$$('.rv,#ih,.split').forEach(e=>e.classList.add('in')),2500);/* whatever has not been seen is on by 2.5s */
$$('section').forEach(s=>s.querySelectorAll('.rv').forEach((e,i)=>e.style.transitionDelay=Math.min(i,4)*110+'ms'));

if(has('#stabs')){/* spotlight: tabs auto-advance with the progress underline */
const st=$$('#stabs button'),ss=$$('.spot .s');let si=0,stt;
function sgo(n){si=ss.length?n%ss.length:0;st.forEach((b,i)=>b.classList.toggle('on',i===si));ss.forEach((s,i)=>s.classList.toggle('on',i===si));clearTimeout(stt);if(!RM)stt=setTimeout(()=>sgo(si+1),5500)}
st.forEach((b,i)=>b.onclick=()=>sgo(i));sgo(0);

}
if(has('#track')){/* card carousel */
const track=$('#track'),cards=$$('.card');let ci=0;
function cgo(n){ci=Math.max(0,Math.min(cards.length-1,n));const step=cards[0].getBoundingClientRect().width+6;const maxX=track.scrollWidth-track.parentElement.clientWidth;track.style.transform='translateX('+(-Math.min(ci*step,maxX))+'px)';$('#cn').textContent=ci+1}
$('#cnext').onclick=()=>cgo(ci+1);$('#cprev').onclick=()=>cgo(ci-1);addEventListener('resize',()=>cgo(ci));
/* and it swipes: drag with a finger or the mouse, let go, it settles on the nearest card */
let sx=0,dx=0,base=0,drag=false;track.querySelectorAll('img').forEach(i=>i.draggable=false);
const tx=()=>{const m=/translateX\((-?[\d.]+)px\)/.exec(track.style.transform);return m?+m[1]:0};
track.addEventListener('pointerdown',e=>{if(e.button)return;drag=true;sx=e.clientX;dx=0;base=tx();track.classList.add('drag');track.setPointerCapture(e.pointerId)});
track.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-sx;track.style.transform='translateX('+(base+dx)+'px)'});
const drop=()=>{if(!drag)return;drag=false;track.classList.remove('drag');cgo(Math.abs(dx)>50?ci+(dx<0?1:-1):ci)};
track.addEventListener('pointerup',drop);track.addEventListener('pointercancel',drop);
/* and it slides on its own while it is in view, resting while a hand is on it */
let auto=null;const play=()=>{if(RM)return;clearInterval(auto);auto=setInterval(()=>cgo(ci+1>=cards.length?0:ci+1),4800)};const rest=()=>clearInterval(auto);
track.addEventListener('pointerenter',rest);track.addEventListener('pointerleave',play);track.addEventListener('pointerdown',rest);
$('#cnext').addEventListener('click',play);$('#cprev').addEventListener('click',play);
new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?play():rest()),{threshold:.3}).observe(track.parentElement);

}
if(has('#hist')){/* storied past: columns drift at different speeds while the section is pinned */
const cols=$$('#cols .col'),hist=$('#hist');
function onScroll(){const r=hist.getBoundingClientRect(),vh=innerHeight;const p=Math.min(1,Math.max(0,-r.top/(r.height-vh)));
  cols.forEach((c,i)=>{const dirn=i%2?1:-1;const span=c.scrollHeight-vh;c.style.transform='translateY('+(dirn>0?(-span*(1-p)):(-span*p))+'px)'})}
if(!RM){addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll()}
}

/* forms -> FormSubmit (AJAX), as franco.js does on the live site: the page stays put,
   the message goes to the address in data-email. Form-encoded body on purpose (no CORS preflight). */
$$('form[data-email]').forEach(f=>{
  const honey=document.createElement('input');honey.type='text';honey.name='_honey';honey.hidden=true;honey.style.display='none';honey.tabIndex=-1;honey.setAttribute('autocomplete','off');honey.setAttribute('aria-hidden','true');f.appendChild(honey);
  f.addEventListener('submit',e=>{
    e.preventDefault();if(honey.value)return;
    const btn=f.querySelector('button[type=submit]'),label=btn?btn.innerHTML:'';
    const say=(t,done)=>{if(!btn)return;btn.innerHTML=t;btn.disabled=!!done};
    say('Sending…',true);
    const body=new URLSearchParams();body.append('_subject',f.dataset.subject||'Enquiry — Bar Franco');body.append('_template','table');body.append('_captcha','false');
    f.querySelectorAll('input,textarea,select').forEach(el=>{if(el!==honey&&el.value)body.append(el.name||'Field',el.value)});
    fetch('https://formsubmit.co/ajax/'+encodeURIComponent(f.dataset.email),{method:'POST',headers:{Accept:'application/json'},body})
      .then(r=>r.json()).then(res=>{if(!res||(res.success!==true&&res.success!=='true'))throw 0;f.reset();say('Sent, grazie',true);try{gtag('event','conversion',{send_to:'AW-18456342571/6V9ICIfV1_ocEKvg1eBE',value:1.0,currency:'NZD'})}catch(_){}if(!f.closest('footer')){try{sessionStorage.setItem('bf-lift','1')}catch(_){}lift.classList.add('vis');requestAnimationFrame(()=>lift.classList.add('shut'));setTimeout(()=>{location.href=ROOT+'grazie/index.html'},RM?0:820)}})
      .catch(()=>{say('Not sent, try again',false);setTimeout(()=>say(label,false),4000)});
  });
});
/* the hero booking bar: its two fields are a doorway to the booking page */
$$('.bbar label').forEach(l=>{const a=l.parentElement.querySelector('a[href]');if(a)l.addEventListener('click',()=>{location.href=a.href})});
/* the phone dock: on Home it rises after the hero has settled; everywhere else it is there at once */
const dock=$('.dock');if(dock)setTimeout(()=>dock.classList.add('up'),document.body.classList.contains('hm')&&!RM?1500:0);

/* VenueFlow enquiry: a wait line while the form loads, then the frame takes the height the widget posts */
$$('iframe[src*="venueflowhq.com"]').forEach(f=>{
  const box=document.createElement('div');box.className='vf';
  const p=document.createElement('p');p.className='vf-wait t-body';p.innerHTML='Loading the enquiry form… or email <a href="mailto:events@barfranco.nz">events@barfranco.nz</a>';
  f.parentNode.insertBefore(box,f);box.appendChild(p);box.appendChild(f);
  f.addEventListener('load',()=>p.remove());
  setTimeout(()=>{if(p.parentNode)p.firstChild.nodeValue='The form is taking a while… or email ';},8000);
});
window.addEventListener('message',e=>{
  if(e.origin!=='https://venueflowhq.com'||!e.data)return;
  let d=e.data;if(typeof d==='string'){try{d=JSON.parse(d)}catch(_){return}}
  if(!d||d.type!=='vf-embed-height'||!(d.height>0))return;
  $$('iframe[src*="venueflowhq.com"]').forEach(f=>{if(f.contentWindow===e.source)f.style.height=Math.ceil(d.height)+'px'});
});

/* the house: on a touch screen a tap opens a room, the next tap goes through to its page */
if(has('.rooms-g')){const g=$('.rooms-g'),rooms=$$('.room');
if(matchMedia('(hover: none)').matches)g.classList.add('touch');
rooms.forEach(r=>{r.addEventListener('click',e=>{if(e.target.closest('a'))return;const was=r.classList.contains('open');rooms.forEach(o=>o.classList.remove('open'));if(!was)r.classList.add('open')})})}

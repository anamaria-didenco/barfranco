
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];const has=s=>!!document.querySelector(s);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* nav: transparent over the hero, solid after */
addEventListener('scroll',()=>$('#nav').classList.toggle('solid',scrollY>40),{passive:true});

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
addEventListener('keydown',e=>{if(!lift.classList.contains('open'))return;if(e.key==='Escape')closeLift();if(e.key==='ArrowUp'){e.preventDefault();toFloor(Math.min(2,cur+1))}if(e.key==='ArrowDown'){e.preventDefault();toFloor(Math.max(0,cur-1))}});
floors.forEach(e=>{const f=+e.dataset.f;e.addEventListener('mouseenter',()=>toFloor(f));e.querySelector('.fl').onclick=()=>toFloor(f)});
calls.forEach(b=>b.onclick=()=>toFloor(+b.dataset.f));$$('.lift a[href^="#"]').forEach(a=>a.addEventListener('click',()=>closeLift()));

if(has('.hero .slide')){/* hero: 3-slide fade with thumbnail rail + progress line */
const sl=$$('.hero .slide'),th=$$('.rail button'),bar=$('.rail .prog i');let hi=0,t0=performance.now();const DUR=6500;
function go(n){hi=(n+sl.length)%sl.length;sl.forEach((s,i)=>s.classList.toggle('on',i===hi));th.forEach((s,i)=>s.classList.toggle('on',i===hi));t0=performance.now()}
th.forEach((b,i)=>b.onclick=()=>go(i));
if(!RM)(function tick(now){const p=Math.min((now-t0)/DUR,1);bar.style.width=p*100+'%';if(p>=1)go(hi+1);requestAnimationFrame(tick)})(performance.now());

}
/* intro: letters fade in one by one, the rule draws out */
$$('#ih .w').forEach(w=>{let i=0;w.innerHTML=w.dataset.w.split(' ').map(word=>'<span class="wd">'+[...word].map(ch=>'<span style="transition-delay:'+((i++)*55)+'ms">'+ch+'</span>').join('')+'</span>').join(' ')});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
$$('.rv,#ih,.split').forEach(e=>io.observe(e));
setTimeout(()=>$$('.rv,#ih,.split').forEach(e=>e.classList.add('in')),2500);/* whatever has not been seen is on by 2.5s */
$$('section').forEach(s=>s.querySelectorAll('.rv').forEach((e,i)=>e.style.transitionDelay=(i%6)*140+'ms'));

if(has('#stabs')){/* spotlight: tabs auto-advance with the progress underline */
const st=$$('#stabs button'),ss=$$('.spot .s');let si=0,stt;
function sgo(n){si=ss.length?n%ss.length:0;st.forEach((b,i)=>b.classList.toggle('on',i===si));ss.forEach((s,i)=>s.classList.toggle('on',i===si));clearTimeout(stt);if(!RM)stt=setTimeout(()=>sgo(si+1),5500)}
st.forEach((b,i)=>b.onclick=()=>sgo(i));sgo(0);

}
if(has('#track')){/* card carousel */
const track=$('#track'),cards=$$('.card');let ci=0;
function cgo(n){ci=Math.max(0,Math.min(cards.length-1,n));const step=cards[0].getBoundingClientRect().width+6;const maxX=track.scrollWidth-track.parentElement.clientWidth;track.style.transform='translateX('+(-Math.min(ci*step,maxX))+'px)';$('#cn').textContent=ci+1}
$('#cnext').onclick=()=>cgo(ci+1);$('#cprev').onclick=()=>cgo(ci-1);addEventListener('resize',()=>cgo(ci));

}
if(has('#hist')){/* storied past: columns drift at different speeds while the section is pinned */
const cols=$$('#cols .col'),hist=$('#hist');
function onScroll(){const r=hist.getBoundingClientRect(),vh=innerHeight;const p=Math.min(1,Math.max(0,-r.top/(r.height-vh)));
  cols.forEach((c,i)=>{const dirn=i%2?1:-1;const span=c.scrollHeight-vh;c.style.transform='translateY('+(dirn>0?(-span*(1-p)):(-span*p))+'px)'})}
if(!RM){addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll()}
}

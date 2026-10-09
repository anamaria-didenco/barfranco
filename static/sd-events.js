/* Bar Franco · Functions + Christmas: the dog as host, the page as the night. Production build (no review controls). */
(function(){
var R=document.documentElement,$=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return[].slice.call((c||document).querySelectorAll(s))};
function ls(k,d){try{var v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,String(v))}catch(e){}}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function io(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
function sd(){return R.classList.contains('sd')}
function calm(){return R.classList.contains('sd-calm')}
function press(sel,key,val){$$(sel).forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset[key]===val))})}
if(sd()){var _c=$('#sdCover');$$('[data-hero]').forEach(function(h){if(h!==_c)h.removeAttribute('data-hero')});if(_c)_c.setAttribute('data-hero','')}
R.classList.add('sd-incover');
function coverCheck(){var c=$('#sdCover');R.classList.toggle('sd-incover',sd()&&!!c&&c.getBoundingClientRect().bottom>140)}
addEventListener('scroll',coverCheck,{passive:true});addEventListener('resize',coverCheck);
var MON=['January','February','March','April','May','June','July','August','September','October','November','December'],DAY=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/* the dog */
function Dog(el){this.el=el;this.fl=el.querySelector('.fl');this.tg=el.querySelector('.sd-tag');this.x=0;this.y=0;this.a=null;var d=this;el.addEventListener('click',function(e){e.stopPropagation();d.woof()})}
Dog.prototype.w=function(){return this.el.offsetWidth};
Dog.prototype.h=function(){return this.el.offsetHeight};
Dog.prototype.face=function(d){if(Math.abs(d)>.5)this.fl.style.setProperty('--fx',d>0?-1:1)};
Dog.prototype.draw=function(){this.el.style.transform='translate('+this.x.toFixed(1)+'px,'+this.y.toFixed(1)+'px)'};
Dog.prototype.rest=function(){this.el.classList.remove('trot');this.el.classList.add('sniff')};
Dog.prototype.put=function(x,y){this.a=null;this.x=x;this.y=y;this.rest();this.draw()};
Dog.prototype.go=function(x,y,done){var dx=x-this.x,dy=y-this.y,d=Math.sqrt(dx*dx+dy*dy);if(calm()||d<1){this.put(x,y);if(done)done();return}this.face(dx);this.el.classList.remove('sniff');this.el.classList.add('trot');this.a={x0:this.x,y0:this.y,x1:x,y1:y,t0:performance.now(),dur:clamp(d*2.2,380,1500),arc:Math.abs(dy)>3?Math.min(48,Math.abs(dy)*.45+14):0,done:done};kick()};
Dog.prototype.tick=function(now){var a=this.a;if(!a)return false;var t=clamp((now-a.t0)/a.dur,0,1),e=a.lin?t:io(t);this.x=a.x0+(a.x1-a.x0)*e;this.y=a.y0+(a.y1-a.y0)*e-Math.sin(Math.PI*t)*a.arc;this.draw();if(t>=1){this.a=null;this.rest();if(a.done)a.done();return false}return true};
Dog.prototype.say=function(txt,ms){var t=this.tg,p=this.el.offsetParent;if(!t||!sd()||!p)return;t.textContent=txt;t.classList.toggle('r',this.x>p.clientWidth*.66);t.classList.toggle('l',this.x<p.clientWidth*.14);t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('on')},ms||2600)};
Dog.prototype.woof=function(){var el=this.el;el.classList.remove('hop');void el.offsetWidth;el.classList.add('hop');this.say('Woof.',1200);setTimeout(function(){el.classList.remove('hop')},650)};
var dogs=[],raf=0;function kick(){if(!raf)raf=requestAnimationFrame(loop)}
function loop(now){raf=0;var any=false;dogs.forEach(function(d){if(d.tick(now))any=true});if(any)kick()}
function rel(el,box){var a=el.getBoundingClientRect(),b=box.getBoundingClientRect();return{l:a.left-b.left,t:a.top-b.top,w:a.width,h:a.height}}

/* 0 · the banner: the dog strings up FUNCTIONS on the way in */
var bn=$('#sdBn'),mark=$('#sdMark'),bnSvg=$('#sdBnSvg'),bnPath=$('#sdBnPath'),pinR=$('#sdPinR'),pinL=$('#sdPinL'),dogB=new Dog($('#dogB'));
var LIFT=R.classList.contains('sd-lift'),FADE=false;
var LT=$$('#sdMark .lt').map(function(e){return{e:e,cx:0,base:0,tan:0,th:0,w:0,t0:0,on:true}}),B={W:0,sag:0,y0:0,cap:0,len:1,phase:'done'},bnRaf=0,bnLast=0,bnDone=false;
function capTop(){var cs=getComputedStyle(mark),fs=parseFloat(cs.fontSize),lh=parseFloat(cs.lineHeight)||fs*.82;try{var c=document.createElement('canvas').getContext('2d');c.font='700 '+fs+'px '+cs.fontFamily;var m=c.measureText(mark.textContent.trim());if(m.fontBoundingBoxAscent)return(lh-(m.fontBoundingBoxAscent+m.fontBoundingBoxDescent))/2+m.fontBoundingBoxAscent-m.actualBoundingBoxAscent}catch(e){}return fs*.05}
function measureBanner(){if(!sd()||!bn.offsetWidth)return;var W=mark.offsetWidth,span=W+16;B.W=W;B.sag=clamp(W*.016,7,22);B.cap=capTop();B.y0=mark.offsetTop+B.cap;bn.style.paddingBottom=Math.round((LIFT?0:B.sag)+dogB.h()+(LIFT?2:10))+'px';
LT.forEach(function(l){l.cx=l.e.offsetLeft+l.e.offsetWidth/2;var t=(l.cx+8)/span;l.base=LIFT?0:4*B.sag*t*(1-t);l.tan=LIFT?0:Math.atan(4*B.sag*(1-2*t)/span)*180/Math.PI;l.e.style.transformOrigin='50% '+B.cap.toFixed(1)+'px'});
if(LIFT){B.mh=mark.offsetHeight;bn.style.setProperty('--lift-floor',(mark.offsetTop+mark.offsetHeight).toFixed(1)+'px')}
var H=bn.clientHeight,y=B.y0.toFixed(1);bnSvg.setAttribute('viewBox','0 0 '+W+' '+H);bnPath.setAttribute('d','M-8 '+y+' Q'+(W/2).toFixed(1)+' '+(B.y0+2*B.sag).toFixed(1)+' '+(W+8)+' '+y);pinL.setAttribute('cx','-8');pinL.setAttribute('cy',y);pinR.setAttribute('cx',String(W+8));pinR.setAttribute('cy',y);
try{B.len=bnPath.getTotalLength()||W}catch(e){B.len=W}bnPath.style.strokeDasharray=B.len.toFixed(1);if(B.phase==='done'){bnPath.style.strokeDashoffset='0';drawLetters(performance.now(),0);if(!dogB.a){dogB.put(W-dogB.w(),H-dogB.h());dogB.face(-1)}}}
function drawLetters(now,dt){var span=B.W+16;if(B.phase==='walk'){var xd=dogB.x+dogB.w()*.85,t=clamp((xd+8)/span,0,1);bnPath.style.strokeDashoffset=(B.len*(1-t)).toFixed(1);LT.forEach(function(l){if(!l.on&&xd>=l.cx){l.on=true;l.t0=now;l.w+=80}})}
var moving=false;LT.forEach(function(l){if(FADE){var kf=l.t0?clamp((now-l.t0)/420,0,1):1;if(kf<1)moving=true;l.e.style.opacity=kf;l.e.style.transform='translateY('+l.base.toFixed(1)+'px) rotate('+l.tan.toFixed(2)+'deg)';return}if(LIFT){var ly=0;if(!l.on)ly=B.mh*1.08;else if(l.t0){var kk=clamp((now-l.t0)/640,0,1);ly=B.mh*1.08*Math.pow(1-kk,3);if(kk<1)moving=true}l.e.style.opacity=1;l.e.style.transform='translateY('+ly.toFixed(1)+'px)';return}if(calm()){l.th=0;l.w=0}else{l.w+=(-60*l.th-3.4*l.w)*dt;l.th+=l.w*dt}if(Math.abs(l.w)>.02||Math.abs(l.th)>.02)moving=true;var dy=0,op=1;if(!l.on){op=0;dy=-28}else if(l.t0){var k=clamp((now-l.t0)/460,0,1);dy=-28*Math.pow(1-k,3);op=Math.min(1,k*1.6);if(k<1)moving=true}l.e.style.opacity=op;l.e.style.transform='translateY('+(l.base+dy).toFixed(1)+'px) rotate('+(l.tan+l.th).toFixed(2)+'deg)'});return moving}
function bnLoop(now){var dt=Math.min(.033,Math.max(0,(now-bnLast)/1000));bnLast=now;var m=drawLetters(now,dt);bnRaf=(m||B.phase==='walk')?requestAnimationFrame(bnLoop):0}
function bnKick(){if(!bnRaf){bnLast=performance.now();bnRaf=requestAnimationFrame(bnLoop)}}
function startBanner(){R.classList.remove('sd-pre');if(!sd())return;measureBanner();var dw=dogB.w(),dh=dogB.h(),H=bn.clientHeight,end=B.W-dw;
if(calm()){B.phase='done';LT.forEach(function(l){l.on=true;l.t0=0;l.th=0;l.w=0});measureBanner();pinR.style.opacity='1';dogB.put(end,H-dh);dogB.face(-1);return}
if(matchMedia('(max-width:860px)').matches){FADE=true;B.phase='done';var n0=performance.now();LT.forEach(function(l,i){l.on=true;l.t0=n0+i*70;l.th=0;l.w=0});bnPath.style.strokeDashoffset='0';pinR.style.opacity='1';dogB.put(end,H-dh);dogB.face(-1);bnKick();setTimeout(function(){dogB.say(dogB.el.dataset.say||'Ciao. How many are coming?',2600)},900);return}
B.phase='walk';LT.forEach(function(l){l.on=false;l.t0=0;l.th=0;l.w=0});bnPath.style.strokeDashoffset=String(B.len);pinR.style.opacity='0';dogB.put(-dw-24,H-dh);bnKick();
dogB.a=null;dogB.face(1);dogB.el.classList.remove('sniff');dogB.el.classList.add('trot');dogB.a={x0:-dw-24,y0:H-dh,x1:end,y1:H-dh,t0:performance.now(),dur:2400,arc:0,lin:true,done:function(){B.phase='done';bnPath.style.strokeDashoffset='0';pinR.style.opacity='1';LT.forEach(function(l){l.on=true});dogB.face(-1);dogB.say(dogB.el.dataset.say||'Ciao. How many are coming?',3200)}};kick()}
LT.forEach(function(l){l.e.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&!calm()&&sd()&&!LIFT){l.w+=(Math.random()<.5?-1:1)*50;bnKick()}})});
dogB.el.addEventListener('click',function(){if(calm()||LIFT)return;LT.slice().reverse().forEach(function(l,i){setTimeout(function(){l.w+=55;bnKick()},i*60)})});
dogs.push(dogB);
function leadOpen(){var l=$('.lead');return !!(l&&!l.classList.contains('gone')&&getComputedStyle(l).display!=='none')}
function whenReady(){if(bnDone||!sd())return;if(leadOpen()){setTimeout(whenReady,300);return}var r=bn.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight){setTimeout(whenReady,300);return}bnDone=true;startBanner()}

/* index: hover opens a chapter; tap opens on touch, second tap follows the link */
var IX=$$('#sdIdx .sd-ix'),ixT=0;
function openIx(el){IX.forEach(function(x){var on=x===el;x.classList.toggle('open',on);x.querySelector('.sd-ix-h').setAttribute('aria-expanded',String(on))})}
IX.forEach(function(x){var h=x.querySelector('.sd-ix-h');
h.addEventListener('pointerenter',function(e){if(e.pointerType!=='mouse')return;clearTimeout(ixT);ixT=setTimeout(function(){openIx(x)},90)});
x.querySelector('.sd-ix-p').addEventListener('pointerenter',function(){clearTimeout(ixT)});
h.addEventListener('focus',function(){openIx(x)});
h.addEventListener('click',function(e){if(!x.classList.contains('open')){e.preventDefault();openIx(x)}})});
$('#sdIdx').addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'){clearTimeout(ixT);ixT=setTimeout(function(){openIx(null)},350)}});
$('#sdIdx').addEventListener('pointerenter',function(){clearTimeout(ixT)});

/* state shared across the page */
var st={n:clamp(+ls('bf-sdf-n','40')||40,10,240),s:ls('bf-sdf-s','seat'),d:ls('bf-sdf-d','fs'),date:ls('bf-sdf-date',''),room:null};

/* 1 · find your floor */
var row=$('#sdRow'),HASF=!!(row&&$('#dogF')),cards=HASF?$$('#sdRow .xa-way'):[],dogF=HASF?new Dog($('#dogF')):null;if(dogF)dogs.push(dogF);
var nIn=$('#sdN');if(nIn)nIn.value=st.n;var STK=$('#sdSticky')?$('#sdSticky').textContent:'';
var VC=row&&row.dataset.seat?{seat:+row.dataset.seat,stand:+row.dataset.stand}:null;
function fits(){var k=st.s==='seat'?'seat':'stand';if(VC)return st.n<=VC[k]?cards.slice():[];var one=cards.filter(function(c){return c.dataset.room!=='all'&&+c.dataset[k]>=st.n});if(one.length)return one;return cards.filter(function(c){return c.dataset.room==='all'&&+c.dataset[k]>=st.n})}
function name(r){return r==='bar'?'the Negroni Bar':r==='rest'?'the Restaurant':'the whole building'}
function floorLine(){var f=fits(),how=st.s==='seat'?'seated':'standing';if(VC){if(!f.length)return'More than '+VC.seat+' seated? Go standing: up to '+VC.stand+'.';if(matchMedia('(max-width:860px)').matches)return'<b>'+st.n+' '+how+'</b>: you fit.';return'<b>'+st.n+' '+how+'</b>: you fit. Seated up to '+VC.seat+', standing up to '+VC.stand+'. '+spendLine(f)}if(!f.length)return'More than 165 seated? Go standing: the whole building takes 240.';var names=f.map(function(c){return name(c.dataset.room)});var s='<b>'+st.n+' '+how+'</b>: ';s+=names.length>1?'either floor. '+cap(names[0])+' for booths and a big bar, or '+names[1]+' for a long table by the windows.':cap(names[0])+(f[0].dataset.room==='all'?', exclusively yours.':' is your floor.');if(matchMedia('(max-width:860px)').matches)return'<b>'+st.n+' '+how+'</b>: '+(names.length>1?'either floor.':cap(names[0])+'.');if(st.n<=20&&st.s==='seat')s+=' Under 20? A long table without hiring a level.';s+=' '+spendLine(f);return s}
function spendLine(f){if(st.d==='wk')return'Sunday to Thursday: usually no minimum spend, and never a hire fee.';return'Fri &amp; Sat minimum spend: '+f.map(function(c){return name(c.dataset.room).replace('the ','')+' from '+c.dataset.min}).join(', ')+'. No hire fee.'}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
var lastPick='';
function findFloor(talk){if($('#sdNo'))$('#sdNo').textContent=st.n;if(!HASF){summary();return}press('#sdStyle button','s',st.s);press('#sdDay button','d',st.d);var f=fits();cards.forEach(function(c){var on=f.indexOf(c)>-1,overkill=c.dataset.room==='all'&&!on&&f.length;c.classList.toggle('fit',on);c.classList.toggle('nofit',!on&&!overkill)});$('#sdRes').innerHTML=floorLine();var rg=$('#sdResGo');if(rg)rg.textContent='Check dates for '+st.n+(st.s==='seat'?' seated':' standing');st.room=f.length===1?f[0].dataset.room:f.length?'either':null;summary();if(!sd())return;var pick=f[0]||cards[2];var p=perch(pick);var key=pick.dataset.room;if(key!==lastPick){dogF.go(p[0],p[1],function(){if(talk)dogF.say(key==='bar'?'Downstairs. Spritz first.':key==='rest'?'Upstairs it is.':'The whole building. Bene.',2200)});lastPick=key}else if(!dogF.a)dogF.put(p[0],p[1])}
function perch(card){var ph=card.querySelector('.ph'),r=rel(ph,row);return[r.l+14,r.t-dogF.h()+2]}
if(nIn)nIn.addEventListener('input',function(){st.n=+nIn.value;ss('bf-sdf-n',st.n);findFloor(true)});
if($('#sdStyle'))$('#sdStyle').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;st.s=b.dataset.s;ss('bf-sdf-s',st.s);lastPick='';findFloor(true)});
if($('#sdDay'))$('#sdDay').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;st.d=b.dataset.d;ss('bf-sdf-d',st.d);findFloor(false)});
cards.forEach(function(c){var a=c.querySelector('a.cta');if(a)a.addEventListener('click',function(){if(!sd())return;st.room=c.dataset.room;summary()})});

/* 2 · the night, in order */
var steps=$('#sdSteps'),SI=$$('#sdSteps .sd-st'),LI=$$('#night .card li'),card=$('#night .card'),dogN=new Dog($('#dogN'));dogs.push(dogN);
var beat=-1,walked=false,nT=[],LINES=['Spritz first.','Up we go. Pasta’s on.','Back down. Save me a dance.'];
function beatPos(b){var r=rel(SI[b].querySelector('.ph'),steps);return[r.l+r.w/2-dogN.w()/2,r.t-dogN.h()+2]}
function setBeat(b,quiet){if(b===beat)return;beat=b;SI.forEach(function(s,i){s.classList.toggle('on',i===b)});LI.forEach(function(l,i){l.classList.toggle('on',i===b)});steps.classList.add('walking');card.classList.add('walking');var p=beatPos(b);dogN.go(p[0],p[1],function(){if(!quiet)dogN.say(LINES[b],2200)})}
function walk(){nT.forEach(clearTimeout);nT=[];if(calm()){setBeat(0,true);return}setBeat(0);nT.push(setTimeout(function(){setBeat(1)},1900));nT.push(setTimeout(function(){setBeat(2)},3900))}
SI.concat(LI).forEach(function(el,i){var b=i%3;el.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&sd()){nT.forEach(clearTimeout);setBeat(b,true)}});el.addEventListener('click',function(){if(sd()){nT.forEach(clearTimeout);setBeat(b)}})});

/* 3 · pick your night */
var G=$('#sdG'),hold=$('#sdHold'),dogC=new Dog($('#dogC'));dogs.push(dogC);
function nz(){var p={};new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});return{y:+p.year,m:+p.month-1,d:+p.day}}
function U(y,m,d){return Date.UTC(y,m,d)}
function wd(y,m,d){return new Date(U(y,m,d)).getUTCDay()}
var T=nz(),TU=U(T.y,T.m,T.d),MONTHS=[0,1,2,3,4,5,6,7,8,9,10,11].map(function(i){var m=T.m+i;return{y:T.y+Math.floor(m/12),m:m%12}}),mi=0;
var ONLY=hold&&hold.dataset.months?hold.dataset.months.split(',').map(Number):null;MONTHS=(ONLY?MONTHS.filter(function(x){return ONLY.indexOf(x.m)>-1}):MONTHS).slice(0,ONLY?ONLY.length:4);
function iso(y,m,d){return y+'-'+(m<9?'0':'')+(m+1)+'-'+(d<10?'0':'')+d}
function parse(s){var p=s.split('-');return{y:+p[0],m:+p[1]-1,d:+p[2]}}
var CLOSE=+(hold&&hold.dataset.close)||23;function shut(m,d){return(m===11&&d>=CLOSE)||(m===0&&d<=5)}
function fmt(s){var q=parse(s);return DAY[wd(q.y,q.m,q.d)]+' '+q.d+' '+MON[q.m]}
if(st.date){var q=parse(st.date),k=MONTHS.findIndex(function(x){return x.y===q.y&&x.m===q.m});if(k<0||U(q.y,q.m,q.d)<TU)st.date='';else mi=k}
if(hold&&hold.dataset.mo){var k2=MONTHS.findIndex(function(x){return x.m===+hold.dataset.mo});if(k2>-1)mi=k2}
$('#sdMo').innerHTML=MONTHS.map(function(x,i){return'<button type="button" data-i="'+i+'">'+MON[x.m]+'</button>'}).join('');
function spot(){var dw=dogC.w(),dh=dogC.h(),b=st.date&&G.querySelector('[data-iso="'+st.date+'"]');if(b){var r=rel(b,hold);return[r.l+(r.w-dw)/2,r.t+r.h-dh-6]}var g=rel(G,hold);return[g.l+g.w-dw-4,g.t-dh-2]}
function buildCal(){var Y=MONTHS[mi].y,m=MONTHS[mi].m,lead=(wd(Y,m,1)+6)%7,n=new Date(U(Y,m+1,0)).getUTCDate(),h='',i;
for(i=0;i<lead;i++)h+='<span class="sd-x"></span>';
for(var d=1;d<=n;d++){var w=wd(Y,m,d),k=iso(Y,m,d),cl=shut(m,d),off=U(Y,m,d)<TU||cl;h+='<button type="button" class="sd-d'+(w===5||w===6?' fs':'')+'" data-iso="'+k+'" aria-pressed="'+(k===st.date)+'" aria-label="'+DAY[w]+' '+d+' '+MON[m]+(cl?', closed':'')+'"'+(off?' disabled':'')+'>'+d+'</button>'}
for(i=(lead+n)%7;i&&i<7;i++)h+='<span class="sd-x"></span>';
G.innerHTML=h;$$('#sdMo button').forEach(function(b){b.setAttribute('aria-pressed',String(+b.dataset.i===mi))});var p=spot();dogC.put(p[0],p[1])}
function isFS(){if(!st.date)return st.d==='fs';var q=parse(st.date),w=wd(q.y,q.m,q.d);return w===5||w===6}
function summary(){var how=st.s==='seat'?'seated':'standing',f=fits();$('#sdSumN').textContent=HASF?st.n+', '+how:String(st.n);var room=st.room&&st.room!=='either'?st.room:(f.length===1?f[0].dataset.room:null);if($('#sdSumR'))$('#sdSumR').textContent=room?cap(name(room)):f.length?'either floor':'the whole building, standing';$('#sdSumD').textContent=st.date?fmt(st.date):'pick one';
var mins={bar:'$4,000',rest:'$7,500',all:'$15,000'};$('#sdSumM').textContent=!st.date?'pick a date':isFS()?'from '+(room?mins[room]:'$4,000'):'usually none';
$('#sdHoldBtn').textContent=st.date?'Hold '+fmt(st.date).replace(/ \d{4}$/,''):'Pick a date to hold';
var sl=$('#sdSticky');if(sl&&sd())sl.textContent=st.date?'Holding '+fmt(st.date)+' · '+st.n+' guests':STK;syncForm()}
var vfT=0;function syncForm(){clearTimeout(vfT);vfT=setTimeout(function(){var f=$('.enq-f iframe');if(!f)return;var u;try{u=new URL(f.getAttribute('src'),location.href)}catch(x){return}['prefillDate','prefillGuests','prefillFormat'].forEach(function(k){u.searchParams.delete(k)});if(st.date)u.searchParams.set('prefillDate',st.date);if(HASF){u.searchParams.set('prefillGuests',String(st.n));u.searchParams.set('prefillFormat',st.s==='seat'?'seated':'standing')}if(u.href!==f.src)f.src=u.href},600)}
G.addEventListener('click',function(e){var b=e.target.closest('.sd-d');if(!b||b.disabled)return;st.date=b.dataset.iso;ss('bf-sdf-date',st.date);$$('.sd-d',G).forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});$('#sdHeld').textContent='';summary();var p=spot(),w=wd.apply(null,[parse(st.date).y,parse(st.date).m,parse(st.date).d]);dogC.go(p[0],p[1],function(){dogC.say(w===5?'A Friday. Good choice.':w===6?'Saturday. Bene.':'Held.',1800)})});
$('#sdMo').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;mi=+b.dataset.i;buildCal()});
$('#sdHoldBtn').addEventListener('click',function(e){if(!sd())return;if(!st.date){e.preventDefault();dogC.say('Pick a date first.',1800);return}$('#sdHeld').textContent='Holding '+fmt(st.date)+($('#sdHold')&&$('#sdHold').dataset.guests==='0'?'':' for '+st.n+' guests')+'. Send it below and Jenna or Ana-Maria will pencil it in.'});

/* the masthead band: once you scroll, the logo sits on solid paper and the page passes under it */
var band=document.createElement('div');band.className='sd-band';band.setAttribute('aria-hidden','true');document.body.appendChild(band);var bandRaf=0;
function bandCheck(){var on=sd()&&scrollY>8;R.classList.toggle('sd-band-on',on);if(!on){var r0=$('.sd-run');if(r0)r0.style.opacity='';return}var mk=$('#mk'),mr=$('.mast-r'),mb=parseFloat(getComputedStyle(R).getPropertyValue('--mb'))||0;var b=Math.max(mk?mk.getBoundingClientRect().bottom:0,mr?mr.getBoundingClientRect().bottom:0);band.style.height=Math.ceil(b-mb+4)+'px';var run=$('.sd-run');if(run){var rt=run.getBoundingClientRect().top-b;run.style.opacity=String(clamp(rt/40,0,1))}}
addEventListener('scroll',function(){if(!bandRaf)bandRaf=requestAnimationFrame(function(){bandRaf=0;bandCheck()})},{passive:true});

/* the enquiry form takes the height VenueFlow reports, so there's no empty band under it */
addEventListener('message',function(e){var host='';try{host=new URL(e.origin).hostname}catch(x){return}if(!/(^|\.)venueflowhq\.com$/.test(host))return;var d=e.data;if(typeof d==='string'){try{d=JSON.parse(d)}catch(x){return}}if(d&&d.type==='vf-embed-height'&&d.height>0)R.style.setProperty('--vfh',Math.max(420,Math.ceil(d.height))+'px')});

/* Christmas: the availability strip. Edit the dates inside <b id="sdAvailD"> on the page (e.g. "11 &amp; 18");
   Fridays that have passed (NZ time) drop off here, and when none are left the line says so. */
(function(){var b=$('#sdAvailD');if(!b)return;var Y=+(b.dataset.year||T.y),days=(b.textContent.match(/\d+/g)||[]).map(Number).filter(function(d){return U(Y,11,d)>=TU});
var p=b.parentNode;if(!days.length){p.innerHTML=b.dataset.none||'December Fridays: fully booked · Midweek &amp; lunch dates open.';return}
var f=days.map(function(d){return'Fri '+d});b.textContent=f.length>1?f.slice(0,-1).join(', ')+' & '+f[f.length-1]:f[0]})();

/* Christmas: an honest countdown to the first December Friday */
(function(){var fr=$('#sdFri'),lv=$('#sdLive');if(!fr)return;var Y=T.m===11&&T.d>23?T.y+1:T.y,f=1;while(wd(Y,11,f)!==5)f++;var days=Math.round((U(Y,11,f)-TU)/864e5),s;if(days>=14)s=Math.round(days/7)+' weeks to the first December Friday';else if(days>1)s=days+' days to the first December Friday';else if(days>=0)s='December Fridays are here';else{var left=0;for(var d=T.d;d<CLOSE;d++)if(wd(Y,11,d)===5)left++;s=left?left+(left>1?' December Fridays left':' December Friday left'):'Now booking Christmas '+(Y+1)}fr.textContent=s})();

/* first sight: one line each */
var said={};
var seen=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting||!sd())return;var id=e.target.id;if(said[id])return;said[id]=1;if(id==='sdRow')dogF.say('How many are coming?',2600);else if(id==='sdSteps')walk();else if(id==='sdG'&&!st.date)dogC.say('Pick a Friday. I’ll sit on it.',3000)})},{threshold:.55});
[HASF?row:null,steps,G].filter(Boolean).forEach(function(x){seen.observe(x)});

/* layout + controls */
function layout(){if(!sd())return;measureBanner();bandCheck();var p;if(HASF){p=perch(fits()[0]||cards[2]);if(!dogF.a)dogF.put(p[0],p[1])}if(!dogN.a){p=beatPos(Math.max(beat,0));dogN.put(p[0],p[1])}if(!dogC.a){p=spot();dogC.put(p[0],p[1])}}
buildCal();findFloor(false);
addEventListener('resize',layout);addEventListener('load',layout);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);
function go(){layout();whenReady()}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);else go();setTimeout(function(){R.classList.remove('sd-pre');if(!bnDone&&!leadOpen())whenReady()},2500);

})();

import os, html as H
OUT = __import__('os').path.join(__import__('os').path.dirname(__file__),'..')
LOGO = open(f'{OUT}/static/logos/script.svg').read().replace('<svg ', '<svg aria-hidden="true" ', 1)
EMB = open(f'{OUT}/static/logos/emblem.svg').read().replace('<svg ', '<svg aria-hidden="true" ', 1)

import base64
_B64={p:base64.b64encode(open(f'{OUT}/static/illustrations/{p}','rb').read()).decode() for p in ('dachshund.png','glass.png')}
def mask(R, p, w, ar):
    u=f'url(data:image/png;base64,{_B64[p]})'
    return f'<span aria-hidden="true" style="display:block;width:{w}px;aspect-ratio:{ar};background:currentColor;-webkit-mask:{u} center/contain no-repeat;mask:{u} center/contain no-repeat"></span>'
def DOG(R, w=120): return mask(R, 'dachshund.png', w, '280/132')
def GLASS(R, w=90): return mask(R, 'glass.png', w, '381/434')
def img(R, n, alt=''): return f'<img src="{R}images/{n}.jpg" alt="{H.escape(alt)}" loading="lazy">'
LN = '<span class="ln"></span>'

# ───────── chrome ─────────
def nav(R):
    return f'''<nav class="nav" id="nav">
  <div class="l"><button class="burger" id="open" aria-label="Menu"><i></i><i></i><i></i></button><a class="logo" href="{R}index.html" aria-label="Bar Franco">{LOGO}</a></div>
  <div class="r"><a class="btn out" href="{R}contact/index.html">Contact {LN}</a><a class="btn fill" href="{R}bookings/index.html">Book {LN}</a></div>
</nav>
<div class="lift" id="lift" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="door l"><i></i></div><div class="door r"><i></i></div>
  <div class="car">
    <div class="top"><button class="t-ui" id="close">× Close</button><a class="logo" href="{R}index.html">{LOGO}</a><a class="btn fill" href="{R}bookings/index.html">Book {LN}</a></div>
    <div class="grid">
      <div class="ind"><span class="t-xs">Level</span><div class="win"><div class="reel" id="reel"><b>2</b><b>1</b><b class="g">G</b></div></div><span class="dir" id="dir">&nbsp;</span>
        <ol class="calls" id="calls"><li><button data-f="2" aria-label="Level 2">2</button></li><li><button data-f="1" aria-label="Level 1">1</button></li><li><button data-f="0" class="g" aria-label="Ground">G</button></li></ol></div>
      <div class="floors">
        <div class="floor" data-f="2"><button class="fl"><span class="n">Level 2</span><span class="t">The restaurant</span></button><div class="sub"><div><em>Open kitchen · from 5pm</em><a href="{R}menus/index.html">Menus</a><a href="{R}fresh-pasta/index.html">Pasta fresca</a><a href="{R}private-dining/index.html">Private dining</a><a href="{R}bookings/index.html">Book a table</a></div></div></div>
        <div class="floor" data-f="1"><button class="fl"><span class="n">Level 1</span><span class="t">The bar</span></button><div class="sub"><div><em>Negroni &amp; spritz · from 4pm</em><a href="{R}negroni-bar/index.html">The Negroni bar</a><a href="{R}aperitivo/index.html">Aperitivo</a><a href="{R}pre-stadium-dining/index.html">Before the stadium</a><a href="{R}functions/index.html">Functions</a></div></div></div>
        <div class="floor" data-f="0"><button class="fl"><span class="n">Ground</span><span class="t">Cashel Street</span></button><div class="sub"><div><em>Down the laneway</em><a href="{R}our-story/index.html">Our story</a><a href="{R}christmas-functions/index.html">Christmas</a><a href="{R}weddings/index.html">Weddings</a><a href="{R}corporate-events/index.html">Corporate</a><a href="{R}events-pack/index.html">Events pack</a><a href="{R}vouchers/index.html">Vouchers</a><a href="{R}contact/index.html">Contact</a></div></div></div>
      </div>
      <div class="pics" id="pics"><div class="p" data-f="2">{img(R,'guests-candlelit-long-table')}</div><div class="p" data-f="1">{img(R,'level1-bar-crowd')}</div><div class="p" data-f="0">{img(R,'velvet-curtain-cocktail')}</div></div>
    </div>
    <div class="bot"><span>Andiamo, let’s go up.</span><span>Bar from 4pm · kitchen from 5pm · daily, till late</span></div>
  </div>
</div>'''

def footer(R, cur=''):
    return f'''<footer><div class="bg">{img(R,'velvet-curtain-cocktail')}</div>
  <div class="mark"><div class="wm">{LOGO}</div><div class="em">{EMB}</div></div>
  <div class="bot">
    <div class="soc"><a href="https://www.instagram.com/bar__franco/" aria-label="Instagram"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg></a><a href="https://www.facebook.com/barfranco.chch" aria-label="Facebook"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/></svg></a></div>
    <div class="col"><a href="{R}menus/index.html">Menus</a><a href="{R}bookings/index.html">Book a table</a><a href="{R}functions/index.html">Functions &amp; events</a><a href="{R}our-story/index.html">Our story</a><a href="{R}vouchers/index.html">Gift vouchers</a></div>
    <div class="col"><a href="{R}aperitivo/index.html">Aperitivo</a><a href="{R}negroni-bar/index.html">Negroni bar</a><a href="{R}fresh-pasta/index.html">Pasta fresca</a><a href="{R}pre-stadium-dining/index.html">Before the stadium</a><a href="{R}events-pack/index.html">Events pack</a></div>
    <div class="col"><a href="{R}private-dining/index.html">Private dining</a><a href="{R}corporate-events/index.html">Corporate events</a><a href="{R}weddings/index.html">Weddings</a><a href="{R}christmas-functions/index.html">Christmas</a><a href="{R}contact/index.html">Contact</a></div>
    <div class="col"><a href="mailto:ciao@barfranco.nz">ciao@barfranco.nz</a><a href="mailto:events@barfranco.nz">events@barfranco.nz</a><a href="tel:+64212211307">Tel. 021 221 1307</a><a href="https://www.google.com/maps?q=166+Cashel+Street,+Christchurch+Central+8011">Find us on Google Maps</a></div>
    <div class="nl"><div class="lab">Exclusive offers</div><div style="font-size:14px;margin-bottom:10px">Unlock insider access: Franco’s exclusive newsletter</div><form onsubmit="return false"><input type="email" placeholder="Enter your email address…"><button type="button">Sign up</button></form></div>
  </div>
  <span class="cookies">© Bar Franco 2026</span>
</footer>'''

# ───────── Savoy blocks ─────────
def hero(R, imgs, l1, l2, sub='', booking=True, cls='', rail=True):
    slides = ''.join(f'<div class="slide{" on" if i==0 else ""}">{img(R,n)}</div>' for i,n in enumerate(imgs))
    railh = ''.join(f'<button class="{"on" if i==0 else ""}" aria-label="Photo {i+1}">{img(R,n)}</button>' for i,n in enumerate(imgs))
    rh = f'<div class="rail">{railh}<div class="prog"><i></i></div></div>' if rail and len(imgs)>1 else ''
    bb = f'''<div class="bbar"><label><small>When</small><b>Select dates</b></label><label><small>Who</small><b>Add guests</b></label><a href="{R}bookings/index.html" aria-label="Find a table"><i><svg viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l5 5"/></svg></i></a></div>''' if booking else ''
    subh = f'<p class="sub t-body">{sub}</p>' if sub else ''
    return f'''<section class="hero {cls}" id="top">{slides}
  <h1 class="t-h1"><span><b>{l1}</b></span><span><b>{l2}</b></span></h1>{subh}{rh}{bb}</section>'''

def intro(R, eyebrow, w1, w2, sub):
    return f'''<section class="intro"><span class="eyebrow t-sm rv">{eyebrow}</span>
  <h2 class="t-giant" id="ih"><div class="row"><span class="w" data-w="{w1}"></span><span class="rule"></span></div><div class="row"><span class="w" data-w="{w2}"></span></div></h2>
  <p class="sub t-sm c rv">{sub}</p></section>'''

def spot(R, label, tabs, imgs, cta, href):
    s = ''.join(f'<div class="s{" on" if i==0 else ""}">{img(R,n)}</div>' for i,n in enumerate(imgs))
    t = ''.join(f'<button class="t-md{" on" if i==0 else ""}">{x} {"<span class=d></span>" if i<len(tabs)-1 else ""}<span class="u"></span></button>' for i,x in enumerate(tabs))
    return f'''<section class="spot" id="spot">{s}<div class="lab t-sm c">{label}</div><div class="tabs" id="stabs">{t}</div>
  <div class="vcta"><a class="btn out" href="{href}">{cta} {LN}</a></div></section>'''

def hb(title, para, dark=False):
    return f'<section class="hb{" dark" if dark else ""}"><h2 class="t-md rv">{title}</h2><p class="t-body rv">{para}</p></section>'

def cards(R, items, solid=None):
    # items: (label,img) ; solid: (label,h3,para) placed third
    out=[]
    for i,(lab,im) in enumerate(items):
        if solid and i==2:
            out.append(f'<div class="card solid"><div class="top"><span class="t-xs">{solid[0]}</span><span class="d"></span></div><div class="ill">{GLASS(R)}</div><h3 class="t-sm">{solid[1]}</h3><p class="t-body">{solid[2]}</p></div>')
        out.append(f'<div class="card">{img(R,im)}<div class="top"><span class="t-xs">{lab}</span><span class="d"></span></div></div>')
    n=len(out)
    return f'''<section class="car5" id="cards"><div class="track" id="track">{''.join(out)}</div>
  <div class="arrows"><button class="prev" id="cprev" aria-label="Previous"></button><span class="cnt"><span id="cn">1</span><i></i>{n}</span><button class="next" id="cnext" aria-label="Next"></button></div></section>'''

def split(R, ill, title, para, im, dark=False, cta=None):
    c = f'<a class="btn {"out" if dark else "dk"}" href="{cta[1]}" style="margin-top:34px">{cta[0]} {LN}</a>' if cta else ''
    return f'<section class="split {"dark" if dark else "light"}"><div class="tx"><div class="ill">{ill}</div><h2 class="t-md">{title}</h2><p class="t-body">{para}</p>{c}</div><div class="md">{img(R,im)}</div></section>'

def unl(R, title, para, im, lab, link, href):
    return f'''<section class="unl" id="unl"><h2 class="t-md rv">{title}</h2><p class="t-body rv">{para}</p>
  <div class="port rv">{img(R,im)}</div>
  <div class="edit rv"><div><small>The</small><span class="t-sm">{lab}</span></div><a href="{href}"><span class="t-sm">{link}</span><span class="v"></span></a></div></section>'''

def cta(R, title, para, btn, href, cols=None):
    cols = cols or [(EMB,'General enquiries','ciao@barfranco.nz','mailto:ciao@barfranco.nz','021 221 1307','tel:+64212211307'),
                    (GLASS(R),'Table reservations','Book online',f'{R}bookings/index.html','021 221 1307','tel:+64212211307'),
                    (DOG(R),'Events enquiries','events@barfranco.nz','mailto:events@barfranco.nz','021 221 1307','tel:+64212211307')]
    ch=''.join(f'<div class="rv"><div class="ill">{a}</div><span class="d"></span><h3 class="t-sm">{b}</h3><a href="{d}">{c}</a><a href="{f}">{e}</a></div>' for a,b,c,d,e,f in cols)
    return f'''<section class="cta" id="cta"><h2 class="t-md rv">{title}</h2><p class="t-body rv">{para}</p><a class="btn fill rv" href="{href}">{btn} {LN}</a>
  <hr><div class="cols">{ch}</div></section>'''

def hist(R, title, para, btn, href, caps):
    tiles=[['bw0','bw1','bw2','bw3','bw5','bw7','bw9'],['bw4','bw5','bw6','bw7','bw9','bw11','bw13'],['bw8','bw9','bw10','bw11','bw0','bw2','bw4'],['bw12','bw13','bw14','bw0','bw6','bw8','bw10'],['bw3','bw7','bw11','bw5','bw12','bw1','bw14']]
    shapes=['tall','wide','tall','sq','tall','wide','sq']
    cols=''
    for ci,col in enumerate(tiles):
        t=''
        for ti,n in enumerate(col):
            cap = caps.get((ci,ti))
            br = ' br' if cap else ''
            capx = f'<span class="cap t-md">{cap}</span>' if cap else ''
            t+=f'<div class="tile {shapes[ti]}{br}">{img(R,n)}{capx}</div>'
        cols+=f'<div class="col">{t}</div>'
    return f'''<section class="hist" id="hist"><div class="pin"><div class="cols" id="cols">{cols}</div>
  <div class="centre"><div class="tl c"><h2 class="t-md">{title}</h2><span class="d"></span></div>
    <div class="bd rv"><p class="t-body">{para}</p><a class="btn out" href="{href}">{btn} {LN}</a></div><div></div></div></div></section>'''

# ───────── inner blocks (same vocabulary) ─────────
def facts(rows, note='', dark=False):
    r=''.join(f'<div class="row"><span>{a}</span><span>{b}</span></div>' for a,b in rows)
    n=f'<p class="note t-xs">{note}</p>' if note else ''
    return f'<section class="facts{" dark" if dark else ""}"><div class="box">{r}</div>{n}</section>'

def quote(q, who, dark=False):
    return f'<section class="quote{" dark" if dark else ""}"><span class="d"></span><blockquote>{q}</blockquote><p class="t-xs">{who}</p></section>'

def steps(R, title, para, three):
    g=''.join(f'<figure>{img(R,im)}<figcaption><span class="t-xs">{lab}</span><span class="d"></span></figcaption><p class="t-body">{txt}</p></figure>' for lab,txt,im in three)
    return f'<section class="steps"><div class="c"><h2 class="t-md rv">{title}</h2><p class="t-body rv" style="max-width:599px;margin:28px auto 0">{para}</p></div><div class="g">{g}</div></section>'

def sheet(wm, title, lede, groups, setnote='', dark=False, anchor=''):
    gs=''
    for h3,items in groups:
        its=''.join(f'<div class="it"><span>{a}</span><span>{b}</span></div>' for a,b in items)
        gs+=f'<h3 class="t-sm">{h3}</h3>{its}'
    sn=f'<div class="set t-body">{setnote}</div>' if setnote else ''
    return f'<section class="sheet{" dark" if dark else ""}" id="{anchor}"><div class="in"><div class="c"><div class="t-md" style="letter-spacing:.55em;margin-bottom:24px">{wm}</div><h2 class="t-md">{title}</h2><p class="t-body lede">{lede}</p></div>{gs}{sn}</div></section>'

def faq(title, qa):
    d=''.join(f'<details><summary class="t-body">{q}</summary><p class="t-body">{a}</p></details>' for q,a in qa)
    return f'<section class="faq"><div class="in"><h2 class="t-md c" style="margin-bottom:40px">{title}</h2>{d}</div></section>'

def form(title, para, fields, btn):
    f=''.join(f'<label class="{c}"><span>{l}</span>{"<textarea></textarea>" if t=="textarea" else f"<input type={t}>"}</label>' for l,t,c in fields)
    return f'<section class="formblk"><div class="c"><h2 class="t-md rv">{title}</h2><p class="t-body rv" style="max-width:599px;margin:28px auto 0">{para}</p></div><form onsubmit="return false">{f}<div class="act"><a class="btn dk" href="#">{btn} {LN}</a></div></form></section>'

def letter(paras):
    return f'<section class="letter"><div class="in">{"".join(paras)}</div></section>'

# ───────── page shell ─────────
import json as _json
SEO=_json.load(open(__import__('os').path.join(__import__('os').path.dirname(__file__),'seo_heads.json')))
def page(slug, title, desc, body, R):
    seo=SEO.get(slug,'')
    # the live page's own description/OG/canonical/schema/tracking, carried over verbatim; title from the live page too
    import re as _re
    seo=_re.sub(r'<meta name="description" content="[^"]*" />',f'<meta name="description" content="{H.escape(desc)}" />',seo)
    return f'''<!doctype html>
<html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{H.escape(title)}</title>
{seo}
<link rel="preload" href="{R}static/fonts/VTCMarsha-Bold.otf" as="font" type="font/otf" crossorigin><link rel="preload" href="{R}static/fonts/Affairs-Regular.otf" as="font" type="font/otf" crossorigin>
<link rel="stylesheet" href="{R}static/savoy.css"></head><body>
{nav(R)}
{body}
{footer(R)}
<script src="{R}static/savoy.js"></script></body></html>'''

CROSS = 'The Crossing · 166 Cashel Street'

def build(pages):
    for slug,title,desc,blocks in pages:
        R = '' if slug in ('index','404') else '../'
        body = '\n'.join(b(R) if callable(b) else b for b in blocks)
        path = f'{OUT}/{slug}.html' if slug in ('index','404') else f'{OUT}/{slug}/index.html'
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path,'w').write(page(slug,title,desc,body,R))
        print('wrote',path)

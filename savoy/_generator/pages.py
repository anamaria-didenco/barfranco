from gen import *

B = lambda R: f'{R}bookings/index.html'
F = lambda R: f'{R}functions/index.html#enquire'
M = lambda R: f'{R}menus/index.html'

GLANCE = [('Guests','10 to 240'),('The Negroni Bar','80 seated · 120 standing'),('The Restaurant','90 seated · 120 standing'),('The whole building','165 seated · 240 standing'),('Shared menus','from 80pp'),('Canapés','from 9'),('Minimum spend, Sun to Thu','usually none'),('Minimum spend, Fri &amp; Sat','from 4,000'),('Venue hire fee','none'),('Included','projector, screen, mic, sound')]
NIGHT = lambda R: steps(R,'We host. You stay.','Canapés in the bar, dinner upstairs, back down for dessert and dancing. A team with hospitality in their bones runs the night, so you get to be a guest at your own event.',
    [('01 · Downstairs','Arrival spritzes','spritz-tray'),('02 · Upstairs','Dinner by the open kitchen','corporate-dinner-projection'),('03 · Back down','Dessert, drinks and dancing','guests-night')])
ENQ = lambda R: cta(R,'Check your date','Jenna or Ana-Maria replies within one business day.','Enquire now','mailto:events@barfranco.nz',
    [(EMB,'Call','021 221 1307','tel:+64212211307','daily from 4pm','tel:+64212211307'),(DOG(R),'Jenna','events@barfranco.nz','mailto:events@barfranco.nz','one business day','mailto:events@barfranco.nz'),(GLASS(R),'The pack','Events pack 2026',f'{R}events-pack/index.html','read it online',f'{R}events-pack/index.html')])

FOOD = [('Antipasti',[('Focaccia, rosemary, extra virgin olive oil','16'),('Olives, citrus, thyme','12'),('Salumi selection','19'),('Burrata, capsicum vinaigrette, fennel, smoked almonds','36'),('White anchovies, gremolata, extra virgin olive oil','17'),('Crocchette, goat cheese, chilli honey, almond','24'),('Miele pizzetta, pepperoni, hot honey, mozzarella, marinara','24'),('Margherita pizzetta, tomato sugo, mozzarella, basil','23')]),
 ('Pasta',[('Pici cacio e pepe, pecorino romano, black pepper','33'),('Cavatelli con vongole e ’nduja, clams, chives','36'),('Gnocchi di ricotta, gorgonzola crema, mushrooms, brussels sprouts, walnuts','35'),('Tagliatelle al ragù toscano, free-farmed pork, parmigiano, chives','38')]),
 ('Secondi',[('Guancia di manzo, braised beef cheek, cauliflower gremolata, white anchovies','58'),('Risotto alla zucca, butternut, pickled chilli, kale, Taleggio','35'),('Nonna’s polpette, meatballs, sugo, ricotta, basil','37'),('Pesce di giorno, Jerusalem artichokes, spinach, herb butter','38')]),
 ('Contorno',[('Charred brussels sprouts alla griglia, gremolata, mint, almond','16'),('Insalata, walnuts, pear, gorgonzola','17'),('Patate al forno, Agria, Parmigiano, calabrese aioli','17')]),
 ('Dolci',[('Tiramisu, amaretto, coffee, mascarpone','19'),('Pistacchio semifreddo, grapefruit, Aperol sherbet','18'),('Panna cotta, tamarillo granita, meringue','17')])]
DRINK = [('Aperitivo',[('Aperol Spritz — <em>Aperol, Prosecco, Soda</em>','23'),('Campari Spritz — <em>Campari, Prosecco, Soda</em>','23'),('Limoncello Spritz — <em>Santa Marta Limoncello, Prosecco, Soda</em>','23'),('Hugo Spritz — <em>Fiorente Elderflower, Prosecco, Soda</em>','23'),('Classic Negroni — <em>Campari, Rosso Vermouth, Bulldog Gin</em>','24'),('Negroni Sbagliato — <em>Campari, Rosso Vermouth, Prosecco</em>','23'),('Cherry Negroni — <em>Campari, Cherry, Rosso Vermouth, Bulldog Gin</em>','25'),('Americano — <em>Campari, Rosso Vermouth, Soda</em>','24'),('Amaretto Sour — <em>Disaronno, Wild Turkey Bourbon, Egg White, Lemon</em>','25'),('Franco Margarita — <em>Espolon Tequila, Grand Marnier, Lemon</em>','24'),('Espresso Martini — <em>Skyy Vodka, Tia Maria, Espresso</em>','25'),('Boulevardier — <em>Campari, Rosso Vermouth, Wild Turkey Bourbon</em>','26'),('Olio Martini: Dry or Dirty — <em>Vodka or Gin, Vermouth, Olives</em>','25')]),
 ('Vino spumante',[('Tallero Prosecco Extra Dry — <em>Veneto</em>','18/90'),('Ferrari Brut Trento DOC — <em>Trentino</em>','140'),('Laurent-Perrier La Cuvée Brut NV — <em>Champagne</em>','165')]),
 ('Vino bianco',[('Mezzacorona Castel Firmian Sauvignon Blanc — <em>Trentino</em>','19/95'),('Fantini Primo Malvasia Chardonnay — <em>Abruzzo</em>','17/85'),('Vigneti Romio Pinot Grigio — <em>Friuli</em>','19/95'),('Vesevo Beneventano Falanghina IGT — <em>Campania</em>','90'),('Pipoli Bianco Basilicata IGT — <em>Basilicata</em>','110'),('Mahi Sauvignon Blanc 2025 — <em>Marlborough</em>','85'),('Dog Point Chardonnay 2023 — <em>Marlborough</em>','120')]),
 ('Vino rosato',[('Fattoria di Basciano Rosato — <em>Toscana</em>','18/90')]),
 ('Vino rosso',[('Renzo Masi Chianti Cornioletta — <em>Toscana</em>','19/95'),('Fantini Montepulciano — <em>Abruzzo</em>','18/90'),('Vigneti Romio Organic Sangiovese Rubicone — <em>Emilia-Romagna</em>','17/85'),('Sallier de la Tour Syrah — <em>Sicilia</em>','95'),('Atzei Saragat Cannonau di Sardegna — <em>Sardegna</em>','100'),('Ascheri Langhe Nebbiolo San Giacomo — <em>Piemonte</em>','110'),('Vanita Primitivo di Manduria DOP — <em>Puglia</em>','93'),('Fattoria di Basciano Chianti Rufina Riserva — <em>Toscana</em>','107'),('Dicey Bannockburn Pinot Noir 2022 — <em>Central Otago</em>','110')]),
 ('Birra',[('Peroni — <em>tap</em>','15'),('Peroni — <em>0%</em>','12'),('BRB Pilsner','15'),('Menabrea Bionda','17'),('Menabrea Zero Zero','17')]),
 ('Non-alc',[('Sanpellegrino Limonata','15'),('Aranciata','15'),('Aranciata Rossa','15'),('Pompelmo','15')])]
EVENTI = [('Canapés · 9 each · passed on trays',[('Goats cheese croquettes, chilli honey','V'),('Seasonal arancini, pickled chilli, parsley mayonnaise','V · GFA · DFA'),('Nonna’s meatballs, tomato sugo, parmesan, basil','GFA · DFA'),('Market fish crudo, orange, Sicilian olive, lemon oil','GF · DF'),('Oysters, seasonal mignonette','GF')]),
 ('Three ways to feed the room',[('Canapés — passed on trays, 4–6 a guest','9–11 each'),('Shared Franco — three courses down the table','80pp'),('Tutto Franco — canapés, then the shared feast','110pp'),('Grazing table','40pp')])]


# ─── Savoy register: third person, measured, elevated; facts unchanged ───
ACTS = lambda R: steps(R,'An evening in three acts','A dedicated team, with hospitality in their bones, attends to every detail of the night — so that you may be a guest at your own event.',
    [('01 · The Negroni Bar','Arrival spritzes and canapés, passed on silver trays','spritz-tray'),('02 · The Restaurant','Dinner beside the open kitchen, in full view','corporate-dinner-projection'),('03 · The return','Dessert, digestivi and dancing until late','guests-night')])
EVCTA = lambda R: cta(R,'Ready to plan your event?','For enquiries and bespoke requests, our events team is here to help. Jenna or Ana-Maria will reply within one business day.','Enquire now','mailto:events@barfranco.nz',
    [(EMB,'Events enquiries','events@barfranco.nz','mailto:events@barfranco.nz','021 221 1307','tel:+64212211307'),(DOG(R),'The events pack','Read online',f'{R}events-pack/index.html','2026 edition',f'{R}events-pack/index.html'),(GLASS(R),'Table reservations','Book a table',f'{R}bookings/index.html','daily from 4pm',f'{R}bookings/index.html')])
TABLECTA = lambda R,t='Ready to experience Bar Franco?',p='For reservations and bespoke requests, our team is here to help.': cta(R,t,p,'Book a table',B(R))
EVMENU = lambda R,title='Dining for the occasion': split(R,EMB,title,'Canapés from 9 and shared menus from 80 per person, plus GST. Pasta made by hand in the open kitchen, seasonal and Italian, composed around your guests.','level2-event-wide',False,('View the event menus',M(R)+'#events'))

PAGES = [
 ('index','Italian Restaurant Christchurch CBD | Bar Franco','A modern Italian restaurant and Negroni bar across two floors at The Crossing, 166 Cashel Street. Pasta made by hand, Negronis stirred to order. Bar from 4pm, kitchen from 5pm.',[
  lambda R: hero(R,['server-pasta-candlelit','bartender-pouring-spritzes','velvet-curtain-cocktail'],'Bar Franco,','where else?'),
  lambda R: intro(R,'Est. 2023','THE','CHRISTCHURCH ORIGINAL','Where pasta, Negronis and the open kitchen take centre stage'),
  lambda R: spot(R,'Dine &amp; host',['Level 1 · The Negroni Bar','Level 2 · The Restaurant','Private events'],['level1-bar-crowd','guests-candlelit-long-table','curtained-table-for-twenty'],'View all spaces',F(R)),
  hb('At Bar Franco','From the Negroni Bar and its rose-red plaster to the open kitchen upstairs, where pasta is rolled in full view of the room, Bar Franco brings the ease of a Milanese evening to the heart of Christchurch. A spritz before the stadium, the long birthday table, or dinner for two by the window.'),
  lambda R: cards(R,[('Aperitivo','guests-night'),('Pasta fresca','pasta-carried-candlelit'),('Private events','event-candlelit-guests'),('Dolci','semifreddo-spritz-candle'),('Christmas','guests-in-the-booth')],('The Negroni Bar','The standard in the glass','From the first spritz to the last Negroni, the bar on Level 1 serves the Italian classics as they were meant to be — stirred to order, beneath fringed lamps and a canopy of dried flowers, drawing Christchurch to dress up, linger longer and let the evening unfold.')),
  lambda R: hist(R,'A storied table','Everything Bar Franco knows about hospitality was learned at a grandmother’s table, a long way from here. No glass is ever empty, everyone is fed, and every person through the door is greeted as a long-lost friend. That spirit, given an Italian accent, still shapes the house today.','Our story',f'{R}our-story/index.html',{(0,2):'Friday<br>night',(1,2):'Opening<br>night 2023',(3,1):'The long<br>table'}),
  lambda R: split(R,EMB,'A dining room like no other','On Level 2, a curved wall of windows, greenery along the glass and copper lamps overhead frame the open kitchen at the heart of the room. Pici cacio e pepe, tagliatelle al ragù toscano and tiramisu, from 5pm each evening.','level2-dining-room',False,('View the menus',M(R))),
  lambda R: split(R,GLASS(R),'A bar like no other','On Level 1, rose-red plaster rises from wall to ceiling above curved blue velvet booths. The Negroni Bar opens at 4pm daily, for the hour that becomes the evening.','level1-bar',True,('The drinks menu',M(R)+'#drinks')),
  lambda R: split(R,DOG(R),'Occasions like no other','Long tables, cocktail receptions and exclusive hire of the whole house, for 10 to 240 guests, with no venue hire fee.','event-long-table',False,('Plan an event',F(R))),
  lambda R: unl(R,'Christchurch, unlocked','Bar Franco is found upstairs at The Crossing, Ōtautahi — by the lift near H&amp;M and KOOKAÏ, or the stairs, with the car park alongside. The bar opens at 4pm and the kitchen at 5pm, daily, until late.','negroni-tray-hands','Franco edit','Find us',f'{R}contact/index.html'),
  lambda R: TABLECTA(R),
 ]),
 ('menus','Menus | Bar Franco Italian Restaurant, Christchurch','Pasta made by hand, antipasti and the Italian classics. The food, drinks and event menus at Bar Franco.',[
  lambda R: hero(R,['pasta-carried-candlelit','negroni-tray-hands','semifreddo-spritz-candle'],'The','menus','Pasta made by hand, antipasti and the Italian classics, as they are served this season.',False,'short'),
  lambda R: f'<div class="tabrow t-sm"><a class="on" href="#food">Food</a><a href="#drinks">Drinks</a><a href="#events">Events</a></div>',
  sheet('F R A N C O','The food menu','Pasta rolled each morning in the open kitchen. Gluten-free on request.',FOOD,'<span class="t-sm">Trust Franco</span><br><br>A curated selection of dishes, made to share between your table<br>80 per person for five courses · 90 per person for seven',False,'food'),
  sheet('B A R','The drinks menu','Spritzes, Negronis and the wines of Italy. Glass and bottle.',DRINK,'',True,'drinks'),
  sheet('E V E N T I','The event menus','The menus for private events, in their current edition. Final numbers and dietary requirements are requested five days before. All prices exclude GST.',EVENTI,'Custom menus by arrangement · grazing tables from 40 per person · every dietary requirement accommodated',False,'events'),
  lambda R: TABLECTA(R,'Ready to dine?','Walk-ins are always welcome at the bar. For parties of ten or more, the events team will arrange the evening.'),
 ]),
 ('functions','Function & Event Venue Christchurch | No Hire Fee | Bar Franco','Private dining, cocktail receptions and exclusive hire across two floors in the heart of Christchurch. From 10 to 240 guests, with no venue hire fee.',[
  lambda R: hero(R,['event-long-table','negroni-bar-guests','level2-event-wide'],'Events &amp;','private dining','Two floors, one address, and an evening entirely your own. From an intimate table of ten to the whole house for 240.',False),
  lambda R: intro(R,'Private events at Bar Franco','ONE VENUE.','TWO FLOORS','Where cocktails, candlelight and the open kitchen take centre stage'),
  quote('“Everyone’s been raving about the venue, the hospitality and the service. A smooth-running night — you did an excellent job.”','Hayley, company event'),
  hb('The occasion, perfectly placed','Begin with cocktails in the rose-plastered Negroni Bar, move upstairs to a long dinner beside a wall of windows, and return downstairs for dessert and dancing — all within one building, and without a taxi in between. Bar Franco has hosted Forté Health, Sprout Agritech, Foodstuffs South Island, Fulton Hogan and EY.'),
  facts(GLANCE,'All prices exclude GST'),
  ACTS,
  lambda R: spot(R,'The spaces',['Level 1 · The Negroni Bar','Level 2 · The Restaurant','The whole building'],['guests-in-the-booth','level2-event-wide','party-dancing-bar'],'Arrange your evening',F(R)),
  lambda R: split(R,GLASS(R),'Level 1 · The Negroni Bar','Rose-red plaster from wall to ceiling, fringed lamps and curved blue velvet booths beneath a canopy of dried flowers. A room made for cocktails, conversation and the first hour of the night. Seated 80 · standing 120 · Friday and Saturday minimum spend from 4,000.','bar-lounge-window',True),
  lambda R: split(R,EMB,'Level 2 · The Restaurant','A curved wall of windows, greenery along the glass and copper lamps overhead, with the open kitchen at the heart of the room. Long tables for the grand occasion, and a private dining area at the far end. Seated 90 · standing 120 · Friday and Saturday minimum spend from 7,500.','restaurant-long-tables-artichoke-lamp',False),
  sheet('E V E N T I','Dining for the occasion','Pasta made by hand in the open kitchen, seasonal and Italian, composed around your guests, your budget and every dietary requirement. Three ways to feed the room.',[EVENTI[1]],'All prices exclude GST',True),
  lambda R: unl(R,'The events pack','Everything you need in one place — the food, the rooms, the hosting and the prices — curated for those planning an occasion at Bar Franco. Read it online or download the PDF.','grazing-table','Events pack 2026','Read it',f'{R}events-pack/index.html'),
  EVCTA,
 ]),
 ('christmas-functions','Christmas Party Venue Christchurch 2026 | Bar Franco','Christmas celebrations the Italian way, from 1 to 23 December. Two floors, 10 to 240 guests, no venue hire fee.',[
  lambda R: hero(R,['event-candlelit-guests','spritz-table','spritz-tray-styled'],'Christmas,','the Italian way','From 1 to 23 December, across two floors, for 10 to 240 guests. No venue hire fee.',False),
  lambda R: intro(R,'Christmas at Bar Franco','NATALE','AT FRANCO','Where the season is set the Italian way'),
  hb('A table set for the season','House-made pasta and antipasti down the centre of the table, canapés passed on trays, and a bar that opens with a Negroni. Generous, Italian and made to share — a Christmas the whole team will remember.'),
  facts([('Canapés — passed on trays','from 9'),('Shared Franco — three courses down the table','80pp'),('Tutto Franco — canapés, then the shared feast','110pp'),('Grazing table','40pp'),('To drink — spritzes, Negronis, Italian wine','on consumption'),('Minimum spend, Fri &amp; Sat — the bar','from 4,000'),('The Restaurant','from 7,500'),('The whole building','from 15,000'),('Sunday to Thursday','usually none'),('Venue hire fee','none'),('Deposit — credited to your drinks bill','from 500'),('Christmas parties','1–23 December'),('Last drinks','11:30pm')],'All prices exclude GST · every dietary requirement accommodated'),
  ACTS,
  quote('“We’ve had glowing reports from the whole team — thank you again for having us.”','Giana, corporate function',True),
  lambda R: split(R,GLASS(R),'Level 1 · The Negroni Bar','Rose-red plaster from wall to ceiling, fringed lamps and curved blue velvet booths beneath a canopy of dried flowers, lit low and warm for the season. Seated 80 · standing 120.','guests-in-the-booth',False),
  lambda R: split(R,EMB,'Level 2 · The Restaurant','A curved wall of floor-to-ceiling windows behind a patterned screen, greenery along the glass and copper lamps overhead, with the open kitchen in full view. Seated 90 · standing 120.','fig2-the-table-web',True),
  faq('Arranging your Christmas',[('How is a date reserved?','Send your preferred date and numbers. Within one business day, a proposal and the events pack follow. A deposit from 500 secures the date, and is credited to your drinks bill on the night.'),('What will it cost?','Menus from 80 per person and canapés from 9. There is no venue hire fee; on Friday and Saturday a minimum spend applies by space, and from Sunday to Thursday there is usually none. All prices exclude GST.'),('Are dietary requirements accommodated?','Every one. They are requested with final numbers, five days before.'),('How late may the evening run?','Last drinks are served at 11:30pm.')]),
  EVCTA,
 ]),
 ('corporate-events','Corporate Function Venue Christchurch | Bar Franco','Client dinners, team nights and end-of-year functions in central Christchurch. Two levels, up to 240 guests, no venue hire fee.',[
  lambda R: hero(R,['corporate-dinner-projection','event-service','guests-night'],'Corporate','events','Client dinners, team evenings and end-of-year celebrations, hosted with care.',False),
  lambda R: intro(R,'Corporate events at Bar Franco','NOT A','FUNCTION ROOM','Where business is conducted over a very good dinner'),
  quote('“The food was absolutely divine, great cocktails to set the tone.”','Vicki, corporate dinner'),
  hb('Everything in hand','A projector, screen, microphone and sound are included, and the whole evening unfolds under one roof — from arrival drinks in the bar to dinner upstairs and back down again, without a taxi in between.'),
  facts(GLANCE,'All prices exclude GST'),
  ACTS,
  lambda R: EVMENU(R,'Menus for a table in full swing'),
  lambda R: unl(R,'The end-of-year celebration','Christmas at Bar Franco runs from 1 to 23 December across both floors, with a deposit from 500 credited to your drinks bill.','spritz-table','Christmas 2026','View dates',f'{R}christmas-functions/index.html'),
  EVCTA,
 ]),
 ('private-dining','Private Dining & Birthday Dinners Christchurch | Bar Franco','Private dining, birthday dinners and group tables in central Christchurch. Long tables, shared Italian menus from 80pp, no venue hire fee.',[
  lambda R: hero(R,['room-wide-golden','room-tables-bentwood','dining-room'],'Private dining','&amp; celebrations','A long table, your closest company, and a feast that keeps arriving.',False),
  lambda R: intro(R,'Private dining at Bar Franco','A DINNER PARTY','WITHOUT THE DISHES','Where the celebration is placed in the finest of hands'),
  quote('“Everyone keeps saying how amazing the food was.”','Nicola, company dinner'),
  facts(GLANCE[:3]+GLANCE[7:9],'All prices exclude GST'),
  lambda R: steps(R,'An evening in three acts','One host attends to your party from the first enquiry to the last glass.',[('01 · The Restaurant','A long table at the far end of the room, curtained when privacy is wished for','dining-room'),('02 · The kitchen','Pasta rolled in full view of the table','open-kitchen'),('03 · The Negroni Bar','A Negroni to finish, downstairs','aperitivo-table-menus')]),
  lambda R: EVMENU(R,'Shared Italian, down the centre of the table'),
  lambda R: unl(R,'Cent’anni','A hundred years — the Italian birthday toast. Birthdays at Bar Franco are celebrated at the long table, beside the open kitchen, and finished with a Negroni in the bar.','semifreddo-spritz-candle','Birthday table','Enquire','#cta'),
  EVCTA,
 ]),
 ('weddings','Wedding Venue Christchurch | Bar Franco','An intimate Italian wedding venue in central Christchurch. Ceremonies, receptions and rehearsal dinners up to 240 guests, no venue hire fee.',[
  lambda R: hero(R,['event-table-setting','sommelier-wine','day-spritz-tray-decanter'],'Weddings &amp;','engagements','Ceremony and reception, beneath one roof, in the heart of Christchurch.',False),
  lambda R: intro(R,'Weddings at Bar Franco','THE BEST','DINNER PARTY OF YOUR LIFE','Amore, the Italian way'),
  quote('“Everyone had a blast — the venue looked stunning and the setup was perfect.”','Nikita, celebration'),
  facts(GLANCE[:3]+GLANCE[7:9],'All prices exclude GST'),
  lambda R: steps(R,'A day in three acts','Vows downstairs, the wedding breakfast upstairs, and the first dance back in the bar.',[('01 · The Negroni Bar','The ceremony, then a glass of spumante','day-spritz-tray-decanter'),('02 · The Restaurant','The wedding breakfast beside the open kitchen','restaurant-long-tables-artichoke-lamp'),('03 · The return','The first dance, and the night that follows','bar-guest-dancing')]),
  lambda R: EVMENU(R,'Shared Italian feasting, composed around you'),
  EVCTA,
 ]),
 ('events-pack','Events Pack 2026: Menus, Prices & Spaces | Bar Franco','The food, the rooms, the hosting and the prices, for those planning an occasion at Bar Franco.',[
  lambda R: hero(R,['grazing-table','level2-event-wide','party-dancing-bar'],'The events','pack 2026','Events with flavour. Nights with feeling. Everything for the occasion, in one place.',False,'short'),
  lambda R: intro(R,'Benvenuti · welcome','FROM TWENTY','TO THE WHOLE BUILDING','Tell us the date, and the rest is taken care of'),
  hb('No venue hire fee','Guests spend on food and drink, and nothing more. For exclusive use, a minimum spend is set by the night and the space; from Sunday to Thursday there is usually none at all.'),
  facts([('Negroni &amp; Spritz Bar','80 seated, more with hired-in furniture · 120 standing'),('The Restaurant','90 seated, 120 with hired-in furniture · 120 standing'),('The whole venue','165 seated · 240 standing'),('Private dining area','either level · by arrangement'),('Group dining','either level · by arrangement'),('Private lunches','either level · by arrangement')],'The spaces'),
  lambda R: split(R,GLASS(R),'Level 1 · The Negroni Bar','Booths, high leaners and low tables around a generous bar, with sheer-draped windows, candlelight, and room for a DJ, a band and dancing.','floorplan-level1',True),
  lambda R: split(R,EMB,'Level 2 · The Restaurant','The theatre of Italian cooking, straight from the open kitchen. Long tables, with a private dining area at the far end of the room.','floorplan-level2',False),
  lambda R: steps(R,'Three chapters, rather than one long sitting','The most-loved shape of an evening at Bar Franco.',[('Chapter 01 · The bar','Welcome drinks and canapés in the Negroni &amp; Spritz Bar','spritz-tray'),('Chapter 02 · Upstairs','A seated dinner in the Restaurant, with the open kitchen in full swing','level2-event-wide'),('Chapter 03 · The return','Dessert and dancing, as the bar becomes the dance floor','party-dancing-bar')]),
  sheet('E V E N T I','The food','Cooked as though someone is coming home. Grazing tables from 40 per person, custom menus by arrangement, all prices exclude GST.',EVENTI,'',False),
  facts([('Minimum spend, Fri &amp; Sat — the bar','from 4,000'),('The Restaurant','from 7,500'),('The whole building','from 15,000'),('Sunday to Thursday','usually none'),('Venue hire fee','none'),('Deposit — credited to your drinks bill','from 500')],'Pricing · all prices exclude GST',True),
  EVCTA,
 ]),
 ('aperitivo','Aperitivo in Christchurch · five to seven | Bar Franco','Christchurch\'s home of aperitivo. Spritzes, Negronis and cicchetti daily from 5pm at Bar Franco\'s Negroni Bar. Cinque a Sette, 5–7 nightly.',[
  lambda R: hero(R,['social-aperitivo','spritz-tray','guests-night'],'Aperitivo,','five to seven','A spritz, a Negroni and something to nibble — the evening, getting started.'),
  lambda R: intro(R,'Cinque a sette · the hour','5PM','TO 7PM','Nightly, without reservation. Pull up a stool'),
  lambda R: split(R,GLASS(R),'The Negroni &amp; Spritz Bar','Rose-red plaster, fringed lamps and a Negroni stirred to order. The Italian ritual of the early evening, observed daily on Level 1.','level1-bar',True,('The Negroni Bar',f'{R}negroni-bar/index.html')),
  lambda R: unl(R,'The aperitivo hour','Spritzes, Negronis and cicchetti to nibble, from the drinks menu, downstairs from 4pm.','cocktail-tray-branded','Drinks menu','View it',M(R)+'#drinks'),
  lambda R: TABLECTA(R,'Ready for a spritz?','The bar opens at 4pm and the kitchen at 5pm, daily, until late.'),
 ]),
 ('negroni-bar','Negroni & Cocktail Bar, Christchurch CBD | Bar Franco','Aperitivo, classic cocktails and Negronis downstairs at The Crossing, central Christchurch. After work or date night, open daily from 4pm, till late.',[
  lambda R: hero(R,['level-negroni-graded','bar-lounge-window','negroni-tray-hands'],'The Negroni','&amp; Spritz Bar','Downstairs, the bar sets the tempo of the evening.'),
  lambda R: intro(R,'The house ritual','THE HOUSE','NEGRONI','Stirred to order — the finest Negroni in Christchurch, it is argued'),
  facts([('Campari','one part'),('Rosso Vermouth','one part'),('Bulldog Gin','one part'),('Stirred over ice','orange peel'),('Classic Negroni','24')],'The house Negroni',True),
  lambda R: split(R,GLASS(R),'A room like no other','Rose-red plaster from wall to ceiling, fringed lamps and curved blue velvet booths beneath a canopy of dried flowers. Seated 80, standing 120.','bar-lounge-window',False,('View the drinks menu',M(R)+'#drinks')),
  lambda R: TABLECTA(R,'Ready for a Negroni?','The bar opens at 4pm daily, until late. Walk-ins are always welcome.'),
 ]),
 ('fresh-pasta','Fresh Handmade Pasta Christchurch | Bar Franco','Handmade pasta, rolled daily in our open kitchen. Bar Franco serves Christchurch\'s freshest Italian pasta in the heart of the city. Book a table.',[
  lambda R: hero(R,['pasta-marble-table','level2-chef','pasta-carried-candlelit'],'Pasta','fresca','Rolled, cut and cooked in full view of the room, upstairs.'),
  lambda R: intro(R,'The open kitchen','ROLLED','THIS MORNING','Where the pasta is made before your eyes'),
  sheet('F R A N C O','Pasta','Rolled each morning in the open kitchen. Gluten-free on request.',[FOOD[1]],'',False),
  lambda R: split(R,EMB,'The theatre of the kitchen','On Level 2, the open kitchen stands at the heart of the room, the pass in full view. Cooked as though someone is coming home.','chef-open-kitchen',True,('View the menus',M(R))),
  lambda R: TABLECTA(R,'Ready to dine?','The kitchen opens at 5pm daily, until late.'),
 ]),
 ('pre-stadium-dining','Dining Near One NZ Stadium | Bar Franco Christchurch','A short walk from One NZ Stadium (Te Kaha). Modern Italian, Negronis and fast, good food before concerts and games. Open daily from 4pm.',[
  lambda R: hero(R,['level1-bar-crowd','room-pendants-crowd','server-pasta-candlelit'],'Before','the stadium','A Negroni and a proper dinner, a short stroll from Te Kaha.'),
  lambda R: intro(R,'Te Kaha · five minutes on foot','THE BIG','NIGHTS','Dine two hours before kick-off, and arrive in good time'),
  facts([('Rugby nights — Crusaders home games','reservations advised'),('Concert nights — the major shows','dining from 4pm'),('After the final whistle','the bar continues until late'),('Parties of ten or more','arranged by the events team')],'The next big nights'),
  lambda R: split(R,EMB,'Two levels, one warm-up','Antipasti to dolci, on the table in good time. A spritz downstairs, dinner upstairs, and out the door for kick-off.','room-pendants-crowd',True,('View the food menu',M(R)+'#food')),
  lambda R: TABLECTA(R,'Ready for the big night?','For parties of ten or more, the events team will arrange the table.'),
 ]),
 ('our-story','Our story | Bar Franco — the Italy you didn’t want to leave','Bar Franco is the work of Ana-Maria Didenco: hospitality learned at her grandmother’s table in Moldova, given an Italian accent. Two levels off Cashel Street, Christchurch: a Negroni bar below, an open kitchen above.',[
  lambda R: hero(R,['level2-long-dinner','bar-lounge-wide','restaurant-plants-sky'],'A storied','table','The story of Bar Franco, in the words of its founder.',False),
  lambda R: intro(R,'Our story','TWO LEVELS.','ONE WORLD','Come as you are, and leave slower than you arrived'),
  letter(['<p>Everything I know about hospitality I learned at my grandmother’s table, a long way from here. The rules were short:</p>','<h2 class="t-md">No one’s glass is ever empty. Everyone is fed. Every person through the door is a long-lost friend we’ve been waiting for.</h2>','<p>Nobody wrote that down. Nobody trained it. It was simply what you did when someone arrived.</p>','<p>My grandmother was never rich. You would not have known it at her table. Whatever there was came out, all of it, for you. That’s the thing I took with me: abundance was never about how much you had. It was about how much you gave. That’s what we set in front of you now.</p>','<p>Then I went to Italy and didn’t want to come home.</p>','<p>The long lunches. The afternoon that becomes the evening without anyone deciding. Piano piano — a table that holds you for three hours and nobody checks their watch. I knew exactly what that was. It was my grandmother’s table with better wine.</p>','<p>So I built the room I didn’t want to leave, and I gave it an Italian accent.</p>','<p>The Franco script above the door is drawn from my mother’s signature — her hand, kept. What it stands for is simple: no costume, no cliché, no pretending to be something we’re not. Pasta made by hand, a Negroni poured properly, a room that wants you in it.</p>','<p>The dachshund is Humphrey. The other dachshunds you’ll meet — on the coasters, the menus, the posters — came from two places: the old Campari posters I love, and a camera roll full of dachshunds I kept photographing all over Italy. Some people collect postcards.</p>','<p class="sig">Ti aspettiamo — we’re waiting for you.<br>— Ana-Maria</p>']),
  lambda R: hist(R,'A storied past','Downstairs, the Negroni and Spritz Bar, where the evening begins slowly. Upstairs, the open kitchen, where the cooking is done as though someone is coming home. Bar Franco is found tucked off Cashel Street — the kind of door one has to know about.','Book a table',B(R),{(0,2):'Friday<br>night',(1,2):'Opening<br>night 2023',(3,1):'Humphrey'}),
  lambda R: split(R,GLASS(R),'Downstairs','The Negroni and Spritz Bar, where the evening begins slowly.','bar-lounge-wide',True),
  lambda R: split(R,EMB,'Upstairs','The open kitchen, where the cooking is done as though someone is coming home.','restaurant-plants-sky',False),
  lambda R: TABLECTA(R,'Come as you are. Leave slower than you arrived.','Ti aspettiamo — we are waiting for you.'),
 ]),
 ('bookings','Book a Table | Bar Franco Christchurch','Dinner for two, or a long table for the whole party. Reservations at Bar Franco.',[
  lambda R: hero(R,['fig1-the-pour','level1-aperitivo','level-restaurant-graded'],'Reserve','a table','Dinner for two, or a long table for the whole party.'),
  hb('Reservations','Live availability online. Walk-ins are always welcome at the bar, and for parties of ten or more the events team will arrange the evening.'),
  facts([('Hours','Bar from 4pm · kitchen from 5pm · daily, until late'),('Walk-ins','always welcome at the bar'),('Parties of ten or more','arranged by the events team'),('Online','<a href="https://bookings.nowbookit.com/?accountid=e9d59bc3-73d5-4e64-a6e7-32a753b7dd3a&amp;venueid=12388">Open the reservations page</a>'),('By telephone','<a href="tel:+64212211307">021 221 1307</a>')],''),
  lambda R: spot(R,'Two levels',['Level 1 · The Negroni Bar','Level 2 · The Restaurant'],['level1-aperitivo','level-restaurant-graded'],'Reserve online','https://bookings.nowbookit.com/?accountid=e9d59bc3-73d5-4e64-a6e7-32a753b7dd3a&venueid=12388'),
  lambda R: unl(R,'Planning something larger?','Private dining, cocktail receptions and exclusive hire of the whole building, for up to 240 guests.','event-long-table','Private events','Plan an event',F(R)),
  lambda R: cta(R,'Ready to reserve?','Live availability online, or by telephone. Walk-ins are always welcome at the bar.','Reserve online','https://bookings.nowbookit.com/?accountid=e9d59bc3-73d5-4e64-a6e7-32a753b7dd3a&venueid=12388'),
 ]),
 ('vouchers','Gift Cards | Bar Franco Italian Restaurant Christchurch','The gift of an evening at Bar Franco. For a birthday, a thank you, or no reason at all.',[
  lambda R: hero(R,['negroni-tray-service','cocktail-tray-branded','semifreddo-spritz-candle'],'Gift','vouchers','For a birthday, a thank you, or no reason at all.',False,'short'),
  lambda R: intro(R,'The gift','THE GIFT OF','GOOD TASTE','Delivered instantly by email, or collected on your next visit'),
  lambda R: unl(R,'An evening at Bar Franco','Dinner upstairs, drinks at the bar, or the long table — a gift voucher to any value, sent instantly by email or purchased at the bar from 4pm.','negroni-tray-service','Gift voucher','Purchase','https://giftcards.nowbookit.com/cards/card-selection?accountid=e9d59bc3-73d5-4e64-a6e7-32a753b7dd3a&venueid=12388&theme=light&accent=175,15,0'),
  lambda R: cta(R,'Give an evening at Bar Franco','Purchase a gift voucher online, delivered instantly by email, or at the bar from 4pm daily.','Purchase a voucher','https://giftcards.nowbookit.com/cards/card-selection?accountid=e9d59bc3-73d5-4e64-a6e7-32a753b7dd3a&venueid=12388&theme=light&accent=175,15,0'),
 ]),
 ('contact','Contact Bar Franco | Italian Restaurant, Christchurch','Find Bar Franco at The Crossing, 166 Cashel Street, central Christchurch. Book a table, plan an event or call us. Open daily, bar from 4pm.',[
  lambda R: hero(R,['room-window-bistro','velvet-curtain-cocktail','host-wine'],'Contact','Bar Franco','For reservations, private events, or simply to call in for a Negroni.',False,'short'),
  facts([('Address','(upstairs) The Crossing · 166 Cashel Street · Christchurch Central 8011'),('Arrival','By the lift near H&amp;M, or the stairs. The car park is alongside.'),('Hours','Bar from 4pm · kitchen from 5pm · daily, until late'),('Reservations','<a href="tel:+64212211307">021 221 1307</a> · <a href="mailto:ciao@barfranco.nz">ciao@barfranco.nz</a>'),('Events','<a href="tel:+64212211307">021 221 1307</a> · <a href="mailto:events@barfranco.nz">events@barfranco.nz</a>'),('Instagram','<a href="https://www.instagram.com/bar__franco/">@bar__franco</a>'),('Facebook','<a href="https://www.facebook.com/barfranco.chch/">barfranco.chch</a>')],'Find us'),
  form('Send a note','A reservation, a private event or a question — the team will reply promptly.',[('Your name','text',''),('Email','email',''),('Message','textarea','full')],'Send'),
  lambda R: split(R,EMB,'A Christchurch address like no other','Set upstairs at The Crossing, 166 Cashel Street, with the car park in the same block.','long-table-end-of-night',True,('Open in Maps','https://www.google.com/maps/search/?api=1&query=Bar+Franco%2C+166+Cashel+Street%2C+Christchurch+Central%2C+8011')),
  lambda R: TABLECTA(R),
 ]),
 ('404','Page not found | Bar Franco — Christchurch','The page you were looking for has moved or no longer exists. Find Bar Franco\'s menus, bookings and contact details, or reserve a table in central Christchurch.',[
  lambda R: f'<section class="center404"><span class="t-sm">Page not found</span><h1 class="t-giant">404</h1><p class="t-body" style="max-width:34em">The page you are looking for is not here — but the bar is, from 4pm.</p><div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a class="btn fill" href="{B(R)}">Reserve a table {LN}</a><a class="btn out" href="{R}index.html">Return to the start {LN}</a></div></section>',
 ]),
]

if __name__ == '__main__':
    build(PAGES)

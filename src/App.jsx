import React,{useMemo,useState,useRef,useCallback}from"react";
import{Dice5,RotateCcw,Shield,BookOpen,Zap,Printer,ChevronDown,ChevronUp,GripVertical,Package,Lock,Unlock,RefreshCw}from"lucide-react";
import{SDD,trSchool,trCast,trRange,trDur}from"./spells_da.js";
import{FEATURE_DA,TRAIT_DA,FEATDESC_DA,SUBCLASS_DESC_DA,FEATURE_DESC}from"./sheet_da.js";

const RULES_VERSION="2024";

// ─── i18n ─────────────────────────────────────
// Module-level current language so every component (incl. the sheet) can call t()
// without prop-threading. App sets CURRENT_LANG at the top of each render.
let CURRENT_LANG=(typeof localStorage!=="undefined"&&localStorage.getItem("cg_lang"))||"da";
const DA={
  // header
  "D&D 2024-inspired quick builder":"D&D 2024 hurtig karakterbygger",
  "Generate and customize your RPG character with stats, spells and gear — in seconds.":"Byg og tilpas din RPG-karakter med stats, spells og udstyr — på få sekunder.",
  "Made by":"Lavet af",
  Randomize:"Tilfældig",
  "Generate Sheet":"Lav karakterark",
  Save:"Gem",
  Load:"Indlæs",
  "Level Up":"Level op",
  // topbar / locks
  "Lock class":"Lås klasse","Class locked":"Klasse låst",
  "Lock species":"Lås race","Species locked":"Race låst",
  Lvl:"Niv","LVL":"NIV",
  // group + panels
  "Character Creator":"Karakterbygger",
  "Combat Overview":"Kampoversigt",
  Spells:"Spells",
  "Equipment & Weapons":"Udstyr & våben",
  "Personality & Notes":"Personlighed & noter",
  Identity:"Identitet",
  "Ability Scores & Skills":"Evner & færdigheder",
  Feats:"Feats",
  // identity fields
  "Character Name":"Karakternavn",
  "Auto-generated if empty":"Genereres automatisk hvis tom",
  "Portrait Gender":"Portræt-køn",
  male:"mand",female:"kvinde",
  Alignment:"Sindelag",
  Species:"Race",
  "Species Traits":"Race-træk",
  Class:"Klasse",
  "Class Features":"Klasse-evner",
  Multiclass:"Multiclass",
  "Second class":"Anden klasse",
  Levels:"Niveauer",
  Subclass:"Underklasse",
  "Subclass (available at level 3)":"Underklasse (fra niveau 3)",
  "Unlocks at level 3...":"Låses op ved niveau 3...",
  "Choose subclass...":"Vælg underklasse...",
  Background:"Baggrund",
  "Origin Feat":"Oprindelses-feat",
  // stats panel
  "Stat Method":"Metode til evner",
  "Standard Array":"Standard-array","Rolled":"Kastet","Manual":"Manuel","Point Buy":"Point Buy",
  "Points left":"Point tilbage","scores 8–15":"værdier 8–15","Key ability":"Vigtigste evne","Max level":"Maks niveau","Cantrips":"Cantrips",
  "Portrait":"Portræt","AI image":"AI-billede","Draw your own":"Tegn selv","Draw your portrait here":"Tegn dit portræt her",
  "green = proficient, red = not proficient":"grøn = proficient, rød = ikke proficient","Languages":"Sprog","Choose":"Vælg","over the rules":"ud over reglerne","for":"for","not a class skill":"ikke en klasse-skill","Inventory":"Inventar","Inventory (one item per line)":"Inventar (én genstand pr. linje)","Backpack, rope, torches...":"Rygsæk, reb, fakler...","Add language":"Tilføj sprog","Standard Languages":"Standardsprog","Rare Languages":"Sjældne sprog","From species":"Fra art","Expertise":"Ekspertise","choose from proficient skills":"vælg blandt dine proficient færdigheder","from Background":"fra baggrund","Choose a class":"Vælg en klasse","or":"eller","1st-level spell":"1.-niveau spell","Draconic Ancestry":"Drage-afstamning","Breath Weapon":"Åndevåben","Damage type":"Skadetype","Backstory":"Baggrundshistorie","Where did your character come from? What happened before the adventure began?":"Hvor kommer din karakter fra? Hvad skete der før eventyret begyndte?","Wild Shape Forms":"Wild Shape-former","Wild Magic Surge":"Wild Magic Surge","Roll 1d100 immediately after casting a Sorcerer spell with a spell slot, once per turn, on a 20 rolled for Wild Magic Surge.":"Slå 1d100 straks efter at have castet et Sorcerer-spell med en slot, én gang pr. tur, ved et slag på 20 for Wild Magic Surge.","choose up to":"vælg op til","Max CR":"Maks CR","Fly allowed":"Flyvning tilladt","No fly":"Ingen flyvning","uses per short or long rest":"anvendelser pr. kort eller lang hvile","Tools":"Værktøj","Choose 3 additional skills or tools":"Vælg 3 ekstra færdigheder eller værktøjer","DEX save vs. your save DC, half damage on success. Choose a 15-ft Cone or a 30-by-5-ft Line each time. Usable Proficiency Bonus times per Long Rest.":"DEX save mod din save DC, halv skade ved succes. Vælg en 15 ft kegle eller en 30x5 ft linje hver gang. Kan bruges Proficiency Bonus gange pr. lang hvile.","Circle of the Land — Land Type":"Circle of the Land — Landtype","chosen anew each Long Rest":"vælges igen efter hver lang hvile","Attack":"Angreb","Traits":"Evner","Senses":"Sanser","Components":"Komponenter",
  "Who is playing this character?":"Hvem spiller denne karakter?",
  "Eldritch Invocations":"Eldritch Invocations","Warlocks choose special magical abilities":"Warlocks vælger særlige magiske evner","Ritual spells (Pact of the Tome)":"Ritual spells (Pact of the Tome)","Extra cantrips (Pact of the Tome)":"Ekstra cantrips (Pact of the Tome)","from any class":"fra en vilkårlig klasse",
  "Roll 4d6":"Kast 4d6",
  "Background Ability Boost":"Baggrunds-bonus til evner",
  "Click to choose (2024 rules — pick from":"Klik for at vælge (2024-regler — vælg blandt",
  "type your own dice rolls into the fields below, or use the digital roll button":"skriv dine egne terningkast i felterne nedenfor, eller brug den digitale kast-knap",
  Total:"I alt",
  Skills:"Færdigheder",
  available:"tilgængelige",
  "choose":"vælg",
  // feats panel
  "from ASI levels 4/8/12/16/19":"fra ASI-niveauer 4/8/12/16/19",
  "Human bonus Origin Feat":"Human bonus oprindelses-feat",
  "Fighting Style":"Kampstil",
  free:"gratis",
  Origin:"Oprindelse",
  General:"Generel",
  Granted:"Tildelt",
  Racial:"Race",
  "Active Feats":"Aktive feats",
  Cast:"Casting",Range:"Rækkevidde",Duration:"Varighed",
  // notes
  "Subclass features, magic items, other notes...":"Underklasse-evner, magiske genstande, andre noter...",
  // sheet button bar
  Back:"Tilbage",
  "Print / PDF":"Print / PDF",
  "Set page margins to None.":"Sæt sidemargener til Ingen.",
  "2 pages":"2 sider","1 page":"1 side","pages":"sider","Features & Spells":"Evner, træk & magi","Descriptions on page 2":"Beskrivelser på side 2",
  // sheet static labels
  "Class & Level":"Klasse & niveau",
  "Player Name":"Spillernavn",
  Race:"Race",
  "Experience Points":"Erfaringspoint",
  Inspiration:"Inspiration",
  "Proficiency Bonus":"Proficiency Bonus",
  Initiative:"Initiativ",
  Speed:"Fart",
  "Saving Throws":"Saving Throws",
  "Passive Perception":"Passiv opmærksomhed",
  "Attacks & Spellcasting":"Angreb & magi",
  "Hit Points":"Livspoint",
  "Hit Dice":"Livsterninger",
  "HP Max":"Maks HP",
  "CURRENT HP":"NUVÆRENDE HP",
  Successes:"Successer",
  Failures:"Fejl",
  "Features & Traits":"Evner & træk",
  "Resources":"Ressourcer",
  "Equipped":"Udstyret",
  "No tracked resource pool":"Ingen sporet ressourcepulje",
  "Other Notes":"Andre noter",
  "Full features on page 2":"Fulde evner på side 2",
  "Portrait could not load.":"Portræt kunne ikke indlæses.",
  "Try Generate Sheet again.":"Prøv Lav karakterark igen.",
  "Painting portrait…":"Maler portræt…",
};
function t(s){return CURRENT_LANG==="da"?(DA[s]??s):s;}
function setLang(l){CURRENT_LANG=l;try{localStorage.setItem("cg_lang",l);}catch(e){}}
// Short glossary: what each ability score does (tag = 2–4 words, desc = one line). Bilingual.
const ABIL_INFO={
  STR:{tag:["Melee & lifting","Nærkamp & at løfte"],desc:["Physical power: melee attacks, carrying and Athletics.","Fysisk styrke: nærkampsangreb, at bære og Athletics."]},
  DEX:{tag:["Agility & AC","Adræthed & AC"],desc:["Agility: armor class, ranged/finesse attacks, Stealth and initiative.","Adræthed: armor class, afstands-/finesse-angreb, Stealth og initiativ."]},
  CON:{tag:["Hit points & stamina","Livspoint & udholdenhed"],desc:["Toughness: sets your hit points and staying power.","Robusthed: bestemmer dine livspoint og din udholdenhed."]},
  INT:{tag:["Knowledge & analysis","Viden & analyse"],desc:["Reasoning and memory: Arcana, History and Investigation.","Ræsonnement og hukommelse: Arcana, History og Investigation."]},
  WIS:{tag:["Awareness & insight","Opmærksomhed & indsigt"],desc:["Perceptiveness: Perception, Insight and Medicine.","Opmærksomhed: Perception, Insight og Medicine."]},
  CHA:{tag:["Presence & persuasion","Udstråling & overtalelse"],desc:["Force of personality: Persuasion, Deception and many spells.","Personlig udstråling: Persuasion, Deception og mange spells."]},
};
const abilTag=ab=>(ABIL_INFO[ab]?.tag[CURRENT_LANG==="da"?1:0])||"";
const abilDesc=ab=>(ABIL_INFO[ab]?.desc[CURRENT_LANG==="da"?1:0])||"";
// Short glossary: what each skill is used for. Bilingual [en, da].
const SKILL_DESC={
  "Acrobatics":["Balance, tumbling and keeping your feet.","Balance, akrobatik og at holde balancen."],
  "Animal Handling":["Calming and reading animals.","At berolige og aflæse dyr."],
  "Arcana":["Knowledge of magic and the arcane.","Viden om magi og det arkane."],
  "Athletics":["Climbing, jumping, swimming and grappling.","At klatre, springe, svømme og gribe fat."],
  "Deception":["Lying and misleading convincingly.","At lyve og vildlede overbevisende."],
  "History":["Knowledge of past events and lore.","Viden om fortiden og historie."],
  "Insight":["Reading intentions and detecting lies.","At aflæse hensigter og opdage løgne."],
  "Intimidation":["Influencing through threats and menace.","At påvirke med trusler og skræk."],
  "Investigation":["Finding clues and deducing details.","At finde spor og udlede detaljer."],
  "Medicine":["Stabilising the dying and treating illness.","At stabilisere døende og behandle sygdom."],
  "Nature":["Knowledge of terrain, plants and animals.","Viden om terræn, planter og dyr."],
  "Perception":["Spotting, hearing and noticing things.","At se, høre og lægge mærke til ting."],
  "Performance":["Entertaining an audience.","At underholde et publikum."],
  "Persuasion":["Influencing others with tact and goodwill.","At overtale andre med takt og velvilje."],
  "Religion":["Knowledge of gods and religious lore.","Viden om guder og religion."],
  "Sleight of Hand":["Pickpocketing and manual trickery.","Fingerfærdighed og lommetyveri."],
  "Stealth":["Moving unseen and unheard.","At bevæge sig uset og uhørt."],
  "Survival":["Tracking, foraging and navigating the wild.","At spore, finde føde og navigere i naturen."],
};
const skillDesc=n=>(SKILL_DESC[n]?.[CURRENT_LANG==="da"?1:0])||"";
// Feat description in the current language (falls back to the English desc). Name stays the key.
const featDescL=(name,fallback)=>CURRENT_LANG==="da"?(FEATDESC_DA[name]||fallback||""):(fallback||"");
// Returns a spell's data, translated to Danish when the language is DA (names stay English — they are the keys).
// Cast time and Duration are canon D&D terms (like Proficiency/Saves) and stay in English even in Danish mode.
function spellD(name){const d=SD[name];if(!d)return d;if(CURRENT_LANG!=="da")return d;return{...d,sc:trSchool(d.sc),cast:d.cast,range:trRange(d.range),dur:d.dur,desc:SDD[name]||d.desc};}

const BG_PERSONALITY={
  Acolyte:{traits:["I quote sacred texts in everyday conversation.","I am calm and patient, even in chaos.","I keep a small shrine wherever I sleep."],ideals:["Faith. I trust in powers greater than myself.","Compassion. Mercy can change what violence cannot.","Duty. Some burdens must be carried because no one else will."],bonds:["My temple is in danger and I cannot ignore it.","I carry a holy relic that must be protected.","I failed a sacred duty once and will not fail again."],flaws:["I am intolerant of those who follow different gods.","I hold grudges against those who insulted my faith.","I sometimes choose doctrine over wisdom."]},
  Artisan:{traits:["I examine everything for quality and craftsmanship.","I believe every problem has a practical solution.","I am proud of my work and do not hide it."],ideals:["Ambition. I will build something no one can ignore.","Honor. A contract means something even when it costs you.","Beauty. Art and craft are worth defending."],bonds:["My masterwork was stolen and I want it back.","I owe my training to a guild that still expects loyalty.","I want to build something lasting before I die."],flaws:["I spend money on tools as soon as I earn it.","I am arrogant about the quality of my work.","I judge people by the quality of their equipment."]},
  Criminal:{traits:["I never sit with my back to a door.","I always look for the hidden motive.","I make jokes when situations become tense."],ideals:["Freedom. No one should live under chains or tyranny.","Loyalty. My crew comes before strangers and laws.","Ambition. I will rise higher than anyone expected."],bonds:["I am hunted by an enemy from my past.","I owe my life to a contact I may never repay.","A friend took the blame for something I did."],flaws:["I lie easily when the truth would serve me better.","I take unnecessary risks when the reward is big enough.","I would rather break rules than ask permission."]},
  Guard:{traits:["I never sit with my back to a door.","I speak with authority even when uncertain.","I prefer action to debate."],ideals:["Justice. The guilty must answer for the harm they cause.","Duty. Some burdens must be carried because no one else will.","Order. Without rules everything falls apart."],bonds:["A village or watch post still depends on me.","I carry the memory of a comrade killed on duty.","I am hunting a criminal who escaped my watch."],flaws:["I often mistake caution for cowardice in others.","I panic when the chain of command breaks down.","I find it hard to admit when the law is wrong."]},
  Guide:{traits:["I become restless if I stay too long in one place.","I prefer action to debate.","I trust my instincts over most advice."],ideals:["Freedom. No one should be bound to one place.","Knowledge. Every road leads to something worth knowing.","Duty. People who trust me with their lives deserve honesty."],bonds:["I seek a lost route that no one has mapped.","I carry the memory of a trail companion who did not make it.","My homeland is in danger and I cannot ignore it."],flaws:["I cannot resist exploring a path even when clearly dangerous.","I find it hard to ask for help from those who know less.","I judge city folk as soft and say so too often."]},
  Hermit:{traits:["I am fascinated by magic ruins and strange symbols.","I try to be the calmest person in the room.","I quote old lessons teachings or proverbs."],ideals:["Knowledge. Truth is worth danger and sacrifice.","Balance. The world suffers when one force grows too strong.","Solitude. True clarity comes only from stillness."],bonds:["My years of isolation revealed something the world must know.","I protect a secret that must not fall into the wrong hands.","I seek a lost relic tied to my years of study."],flaws:["I find it hard to admit when I am wrong about my theories.","I am uncomfortable around crowds and become anxious.","I sometimes choose meditation over action when action was needed."]},
  Noble:{traits:["I treat strangers with formal politeness.","I speak with confidence even when guessing.","I am generous with food drink and hospitality."],ideals:["Honor. A noble who breaks their word is worth nothing.","Duty. My position requires sacrifice not just privilege.","Ambition. I will restore my family to greatness."],bonds:["My family name must be restored or protected.","I protect a secret that could destroy my house.","I must prove myself to those who doubted my worthiness."],flaws:["I trust flattery more than I should.","I find it hard to admit when I am wrong in public.","I hold grudges against those who embarrassed my family."]},
  Sage:{traits:["I am fascinated by magic ruins and strange symbols.","I ask too many questions when I should stay quiet.","I believe every problem has a logical answer."],ideals:["Knowledge. Truth is worth danger and sacrifice.","Freedom. Information must not be hoarded by the powerful.","Ambition. I will uncover what no one has found before."],bonds:["I seek a lost piece of knowledge that obsesses me.","I carry research that powerful people would kill to suppress.","I failed to protect an important text and carry that guilt."],flaws:["I cannot resist a mystery even when clearly dangerous.","I keep my research to myself longer than I should.","I sometimes choose knowledge over the safety of those around me."]},
  Sailor:{traits:["I make jokes when situations become dangerous.","I am generous with food drink and a good story.","I trust people slowly after I have seen them work."],ideals:["Freedom. The open sea answers to no king.","Loyalty. My crew comes first always.","Ambition. Every voyage is a chance to find something greater."],bonds:["My ship or crew still depends on me.","I carry the memory of a voyage that went terribly wrong.","I seek a lost ship route or treasure from an old voyage."],flaws:["I spend money as soon as I get it especially on drink.","I take unnecessary risks when the prize is worth it.","I find it hard to follow orders from those who have never sailed."]},
  Soldier:{traits:["I prefer action to debate.","I never sit with my back to a door.","I am protective of those who cannot fight for themselves."],ideals:["Duty. Some burdens must be carried because no one else will.","Honor. A soldier who breaks their word is no soldier at all.","Glory. Great deeds should be remembered by those who follow."],bonds:["I carry the memory of a fallen comrade.","A commander taught me what discipline really means.","I am hunting a deserter or war criminal from my campaign."],flaws:["I take unnecessary risks to prove my courage.","I hold grudges against those who showed cowardice.","I often mistake caution for weakness in others."]},
};
function getPersonality(bg){const t=BG_PERSONALITY[bg];if(!t)return{trait:"I prefer action to debate.",ideal:"Honor.",bond:"I carry the memory of a fallen friend.",flaw:"I take unnecessary risks."};const p=a=>a[Math.floor(Math.random()*a.length)];return{trait:p(t.traits),ideal:p(t.ideals),bond:p(t.bonds),flaw:p(t.flaws)};}

const SD={"Mind Sliver":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"1 round",comp:"V",pg:298,desc:"INT save or 1d6 psychic and -1d4 on its next save."},"Sorcerous Burst":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Instant",comp:"V, S",desc:"1d8 of a chosen damage type; can leap on a max roll."},"Starry Wisp":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S",desc:"DEX save or 1d8 radiant; target glows, can't be invisible."},Elementalism:{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Instant",comp:"V, S",pg:267,desc:"Minor fire, water, earth or air effect."},Resistance:{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"1 minute",comp:"V, S",pg:312,desc:"Once, add 1d4 to one saving throw."},"Spare the Dying":{sc:"Necromancy",cast:"1 action",range:"15 ft",dur:"Instant",comp:"V, S",desc:"Stabilize a creature at 0 HP."},"Word of Radiance":{sc:"Evocation",cast:"1 action",range:"5 ft",dur:"Instant",comp:"V, M",desc:"CON save or 1d6 radiant to nearby enemies."},"Fire Bolt":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Instant",comp:"V, S",pg:274,desc:"Ranged spell attack: 1d10 fire."},"Ray of Frost":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S",pg:311,desc:"Hit: 1d8 cold, target speed -10 ft."},"Shocking Grasp":{sc:"Evocation",cast:"1 action",range:"Touch",dur:"Instant",comp:"V, S",pg:316,desc:"Advantage vs metal armor. Hit: 1d8 lightning, no reactions."},"Mage Hand":{sc:"Conjuration",cast:"1 action",range:"30 ft",dur:"1 minute",comp:"V, S",pg:293,desc:"Spectral hand, up to 10 lb."},"Minor Illusion":{sc:"Illusion",cast:"1 action",range:"30 ft",dur:"1 minute",comp:"S, M",pg:298,desc:"Sound or image. INT check to disbelieve."},Prestidigitation:{sc:"Transmutation",cast:"1 action",range:"10 ft",dur:"Up to 1 hr",comp:"V, S",pg:307,desc:"Minor magical tricks."},"Magic Missile":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Instant",comp:"V, S",pg:295,desc:"3 darts, 1d4+1 force each, auto-hit."},Shield:{sc:"Abjuration",cast:"1 reaction",range:"Self",dur:"1 round",comp:"V, S",pg:316,desc:"+5 AC. Immune to Magic Missile."},"Mage Armor":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"8 hours",comp:"V, S, M",pg:293,desc:"AC = 13+DEX for unarmored creature."},"Burning Hands":{sc:"Evocation",cast:"1 action",range:"15-ft cone",dur:"Instant",comp:"V, S",pg:248,desc:"DEX save or 3d6 fire."},"Charm Person":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"1 hour",comp:"V, S",pg:249,desc:"WIS save or charmed."},Sleep:{sc:"Enchantment",cast:"1 action",range:"90 ft",dur:"1 minute",comp:"V, S, M",desc:"5d8 HP worth of creatures fall asleep."},Thunderwave:{sc:"Evocation",cast:"1 action",range:"Self (15-ft cube)",dur:"Instant",comp:"V, S",desc:"CON save or 2d8 thunder + pushed 10 ft."},"Misty Step":{sc:"Conjuration",cast:"1 bonus action",range:"Self",dur:"Instant",comp:"V",pg:299,desc:"Teleport up to 30 ft."},"Hold Person":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:286,desc:"WIS save or humanoid paralyzed."},Invisibility:{sc:"Illusion",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",comp:"V, S, M",pg:289,desc:"Target invisible until it attacks or casts."},"Mirror Image":{sc:"Illusion",cast:"1 action",range:"Self",dur:"1 minute",comp:"V, S",pg:299,desc:"3 duplicates absorb attacks."},"Scorching Ray":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Instant",comp:"V, S",pg:313,desc:"3 rays, 2d6 fire each."},Shatter:{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S, M",pg:316,desc:"CON save or 3d8 thunder."},Suggestion:{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 8 hr",comp:"V, M",desc:"WIS save or follow a suggestion."},Counterspell:{sc:"Abjuration",cast:"1 reaction",range:"60 ft",dur:"Instant",comp:"S",pg:258,desc:"Interrupt a spell being cast."},Fireball:{sc:"Evocation",cast:"1 action",range:"150 ft",dur:"Instant",comp:"V, S, M",pg:274,desc:"20-ft radius. DEX save or 8d6 fire."},Fly:{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Conc. 10 min",comp:"V, S, M",pg:276,desc:"Flying speed 60 ft."},Haste:{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:284,desc:"Double speed, +2 AC, extra action."},"Lightning Bolt":{sc:"Evocation",cast:"1 action",range:"Self (100-ft line)",dur:"Instant",comp:"V, S, M",pg:292,desc:"DEX save or 8d6 lightning."},Slow:{sc:"Transmutation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",comp:"V, S, M",desc:"WIS save or halved speed, -2 AC/DEX."},Fear:{sc:"Illusion",cast:"1 action",range:"Self (30-ft cone)",dur:"Conc. 1 min",comp:"V, S, M",pg:271,desc:"WIS save or frightened and flee."},Banishment:{sc:"Abjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:245,desc:"CHA save or banished."},"Greater Invisibility":{sc:"Illusion",cast:"1 action",range:"Touch",dur:"Conc. 1 min",comp:"V, S",pg:281,desc:"Invisible even while attacking."},"Ice Storm":{sc:"Evocation",cast:"1 action",range:"300 ft",dur:"Instant",comp:"V, S, M",pg:287,desc:"20-ft radius, 2d8 bludgeoning+4d6 cold."},Polymorph:{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Conc. 1 hr",comp:"V, S, M",pg:306,desc:"WIS save or transform into beast."},Confusion:{sc:"Enchantment",cast:"1 action",range:"90 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:253,desc:"WIS save or act randomly."},"Cone of Cold":{sc:"Evocation",cast:"1 action",range:"Self (60-ft cone)",dur:"Instant",comp:"V, S, M",pg:253,desc:"CON save or 8d8 cold."},"Hold Monster":{sc:"Enchantment",cast:"1 action",range:"90 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:285,desc:"WIS save or any creature paralyzed."},Cloudkill:{sc:"Conjuration",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",comp:"V, S",pg:251,desc:"20-ft sphere toxic fog, 5d8 poison per turn."},"Dominate Person":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S",pg:266,desc:"WIS save or control a humanoid."},"Sacred Flame":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S",pg:313,desc:"DEX save or 1d8 radiant. Scales at 5/11/17."},Guidance:{sc:"Divination",cast:"1 action",range:"Touch",dur:"1 minute",comp:"V, S",pg:282,desc:"No concentration. +1d4 to one ability check."},Light:{sc:"Evocation",cast:"1 action",range:"Touch",dur:"1 hour",comp:"V, M",pg:292,desc:"Object sheds bright light 20 ft."},Thaumaturgy:{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Up to 1 min",comp:"V",desc:"Minor wonder effect."},"Toll the Dead":{sc:"Necromancy",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S",desc:"WIS save or 1d8 (1d12 if wounded) necrotic."},Bless:{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",comp:"V, S, M(C)",pg:247,desc:"3 creatures add 1d4 to attacks/saves."},Command:{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"1 round",comp:"V",pg:251,desc:"WIS save or one-word command."},"Cure Wounds":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Instant",comp:"V, S",pg:259,desc:"Restore 2d8+mod HP."},"Guiding Bolt":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"1 round",comp:"V, S",pg:282,desc:"4d6 radiant, next attack has advantage."},"Healing Word":{sc:"Abjuration",cast:"1 bonus action",range:"60 ft",dur:"Instant",comp:"V",pg:284,desc:"Restore 2d4+mod HP."},"Inflict Wounds":{sc:"Necromancy",cast:"1 action",range:"Touch",dur:"Instant",comp:"V, S",pg:288,desc:"Melee spell attack: 3d10 necrotic."},"Shield of Faith":{sc:"Abjuration",cast:"1 bonus action",range:"60 ft",dur:"Conc. 10 min",comp:"V, S, M",pg:316,desc:"+2 AC."},Aid:{sc:"Abjuration",cast:"1 action",range:"30 ft",dur:"8 hours",comp:"V, S, M",desc:"3 creatures gain +5 max HP."},"Lesser Restoration":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Instant",comp:"V, S",pg:291,desc:"End one condition or disease."},"Prayer of Healing":{sc:"Abjuration",cast:"10 minutes",range:"30 ft",dur:"Instant",comp:"V",pg:307,desc:"6 creatures regain 2d8+mod HP."},"Spiritual Weapon":{sc:"Evocation",cast:"1 bonus action",range:"60 ft",dur:"1 minute",comp:"V, S",desc:"Spectral weapon: 1d8+mod force per turn."},"Animate Dead":{sc:"Necromancy",cast:"1 minute",range:"10 ft",dur:"24 hours",comp:"V, S, M",pg:240,desc:"Create undead servant."},Daylight:{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"1 hour",comp:"V, S",pg:260,desc:"60-ft radius bright light."},"Dispel Magic":{sc:"Abjuration",cast:"1 action",range:"120 ft",dur:"Instant",comp:"V, S",pg:264,desc:"End one spell 3rd level or lower."},"Spirit Guardians":{sc:"Conjuration",cast:"1 action",range:"Self (15-ft radius)",dur:"Conc. 10 min",comp:"V, S, M",desc:"WIS save or 3d8 radiant/necrotic."},"Remove Curse":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Instant",comp:"V, S",pg:312,desc:"End all curses on target."},"Death Ward":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"8 hours",comp:"V, S",pg:261,desc:"Drop to 1 HP instead of 0 once."},"Freedom of Movement":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"1 hour",comp:"V, S, M",pg:277,desc:"Ignore difficult terrain and restraints."},"Guardian of Faith":{sc:"Conjuration",cast:"1 action",range:"30 ft",dur:"8 hours",comp:"V",pg:281,desc:"20 radiant to hostiles within 10 ft."},"Flame Strike":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S, M",desc:"DEX save or 4d6 fire+4d6 radiant."},"Greater Restoration":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Instant",comp:"V, S, M(C*)",pg:281,desc:"End major condition or curse."},"Mass Cure Wounds":{sc:"Abjuration",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S",desc:"6 creatures regain 3d8+mod HP."},"Raise Dead":{sc:"Necromancy",cast:"1 hour",range:"Touch",dur:"Instant",comp:"V, S, M(C*)",pg:310,desc:"Return dead creature to life (500gp diamond)."},Druidcraft:{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Instant",comp:"V, S",pg:266,desc:"Minor nature effect."},"Produce Flame":{sc:"Conjuration",cast:"1 action",range:"Self",dur:"10 minutes",comp:"V, S",pg:308,desc:"Flame: light or hurl for 1d8 fire."},Shillelagh:{sc:"Transmutation",cast:"1 bonus action",range:"Touch",dur:"1 minute",comp:"V, S, M",pg:316,desc:"No concentration. Weapon uses WIS, damage 1d8+WIS."},"Thorn Whip":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Instant",comp:"V, S, M",desc:"1d6 piercing, pull 10 ft."},"Animal Friendship":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"24 hours",comp:"V, S, M",desc:"WIS save or beast charmed."},Entangle:{sc:"Conjuration",cast:"1 action",range:"90 ft",dur:"Conc. 1 min",comp:"V, S",pg:268,desc:"STR save or restrained by weeds."},"Faerie Fire":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V",pg:271,desc:"DEX save or outlined; attacks have advantage."},Goodberry:{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"24 hours",comp:"V, S, M",pg:280,desc:"10 berries, each restores 1 HP."},Barkskin:{sc:"Transmutation",cast:"1 bonus action",range:"Touch",dur:"1 hour",comp:"V, S, M",pg:245,desc:"No concentration. AC 17."},"Flaming Sphere":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S, M",desc:"2d6 fire sphere, bonus action move."},Moonbeam:{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:300,desc:"CON save or 2d10 radiant per turn."},"Pass without Trace":{sc:"Abjuration",cast:"1 action",range:"Self",dur:"Conc. 1 hr",comp:"V, S, M",pg:303,desc:"+10 Stealth to you and 10 companions."},"Spike Growth":{sc:"Transmutation",cast:"1 action",range:"150 ft",dur:"Conc. 10 min",comp:"V, S, M",desc:"2d4 piercing per 5 ft moved."},"Call Lightning":{sc:"Conjuration",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",comp:"V, S",pg:248,desc:"DEX save or 3d10 lightning per turn."},"Conjure Animals":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 hr",comp:"V, S",desc:"Summon beasts totaling CR 2."},"Plant Growth":{sc:"Transmutation",cast:"1 action",range:"150 ft",dur:"Instant",comp:"V, S",pg:305,desc:"100-ft radius difficult terrain."},Blight:{sc:"Necromancy",cast:"1 action",range:"30 ft",dur:"Instant",comp:"V, S",pg:247,desc:"CON save or 8d8 necrotic."},"Insect Plague":{sc:"Conjuration",cast:"1 action",range:"300 ft",dur:"Conc. 10 min",comp:"V, S, M",pg:289,desc:"CON save or 4d10 piercing per turn."},"Vicious Mockery":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V",desc:"WIS save or 1d6 psychic (scales 2d6/3d6/4d6), disadv on next attack."},"Dancing Lights":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:259,desc:"4 floating lights."},"Eldritch Blast":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Instant",comp:"V, S",pg:267,desc:"1d10 force beam. Hit creature can be pushed 10 ft. More beams at higher levels."},"Chill Touch":{sc:"Necromancy",cast:"1 action",range:"120 ft",dur:"1 round",comp:"V, S",pg:249,desc:"1d8 necrotic, target cannot regain HP."},"Armor of Agathys":{sc:"Abjuration",cast:"1 bonus action",range:"Self",dur:"1 hour",comp:"V, S, M",pg:243,desc:"5 temp HP; attacker takes 5 cold."},"Arms of Hadar":{sc:"Conjuration",cast:"1 action",range:"Self (10-ft radius)",dur:"Instant",comp:"V, S",pg:243,desc:"STR save or 2d6 necrotic, no reactions."},Hex:{sc:"Enchantment",cast:"1 bonus action",range:"90 ft",dur:"Conc. 1 hr",comp:"V, S, M",pg:285,desc:"+1d6 necrotic on weapon and spell attacks."},"Hellish Rebuke":{sc:"Evocation",cast:"1 reaction",range:"60 ft",dur:"Instant",comp:"V, S",pg:284,desc:"DEX save or 2d10 fire."},"Witch Bolt":{sc:"Evocation",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",comp:"V, S, M",desc:"1d12 lightning, sustain for 1d12 per turn."},Darkness:{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Conc. 10 min",comp:"V, M",pg:260,desc:"15-ft magical darkness."},"Vampiric Touch":{sc:"Necromancy",cast:"1 action",range:"Self",dur:"Conc. 1 min",comp:"V, S",desc:"3d6 necrotic; regain half as HP."},"Hunger of Hadar":{sc:"Conjuration",cast:"1 action",range:"150 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:286,desc:"20-ft darkness void: 2d6 cold+2d6 acid."},"Divine Favor":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",comp:"V, S",pg:265,desc:"+1d4 radiant on weapon hits."},"Find Steed":{sc:"Conjuration",cast:"10 minutes",range:"30 ft",dur:"Instant",comp:"V, S",pg:272,desc:"Summon a spirit steed."},"Aura of Vitality":{sc:"Evocation",cast:"1 action",range:"Self (30-ft radius)",dur:"Conc. 1 min",comp:"V",pg:244,desc:"Bonus action: restore 2d6 HP to one creature."},Revivify:{sc:"Necromancy",cast:"1 action",range:"Touch",dur:"Instant",comp:"V, S, M(C*)",pg:312,desc:"Return dead (1 min) to life (300gp diamond)."},"Hunter's Mark":{sc:"Divination",cast:"1 bonus action",range:"90 ft",dur:"Conc. 1 hr",comp:"V",pg:287,desc:"+1d6 on weapon hits vs target."},"Fog Cloud":{sc:"Conjuration",cast:"1 action",range:"120 ft",dur:"Conc. 1 hr",comp:"V, S",pg:276,desc:"20-ft sphere heavily obscured."},"Ensnaring Strike":{sc:"Conjuration",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",comp:"V",pg:268,desc:"STR save or restrained; 1d6 piercing per turn."},"Conjure Barrage":{sc:"Conjuration",cast:"1 action",range:"Self (60-ft cone)",dur:"Instant",comp:"V, S, M(C)",desc:"DEX save or 3d8 weapon-type damage."},"Swift Quiver":{sc:"Transmutation",cast:"1 bonus action",range:"Touch",dur:"Conc. 1 min",comp:"V, S, M",desc:"Quiver generates ammo; 2 ranged attacks per bonus action."},"Wind Wall":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",comp:"V, S, M",desc:"Wall of wind; 3d8 bludgeoning."},Silence:{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",comp:"120 feet",pg:316,desc:"20-ft sphere of magical silence."},"Hypnotic Pattern":{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",comp:"S, M",pg:287,desc:"WIS save or incapacitated."},"Major Image":{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",comp:"V, S, M",pg:295,desc:"20-ft cube illusion with sound and smell."},Sending:{sc:"Evocation",cast:"1 action",range:"Unlimited",dur:"1 round",comp:"V, S, M",pg:314,desc:"25-word message to known creature."},"Dissonant Whispers":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V",pg:264,desc:"WIS save or 3d6 psychic, must flee."},Heroism:{sc:"Enchantment",cast:"1 action",range:"Touch",dur:"Conc. 1 min",comp:"V, S",pg:285,desc:"Immune to frightened; temp HP each turn."},Enthrall:{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"1 minute",comp:"V, S",pg:269,desc:"WIS save or distracted by you."},Compulsion:{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",comp:"V, S",pg:252,desc:"WIS save or must move chosen direction."},"Dimension Door":{sc:"Conjuration",cast:"1 action",range:"500 ft",dur:"Instant",comp:"V",pg:262,desc:"Teleport self + one creature up to 500 ft."},"Hallucinatory Terrain":{sc:"Illusion",cast:"10 minutes",range:"300 ft",dur:"24 hours",comp:"V, S, M",pg:283,desc:"Terrain looks like another terrain type."},"Compelled Duel":{sc:"Enchantment",cast:"1 bonus action",range:"30 ft",dur:"Conc. 1 min",comp:"V",pg:252,desc:"WIS save or must fight only you."},"Thunderous Smite":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",comp:"V",desc:"+2d6 thunder, STR save or prone."},"Wrathful Smite":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",comp:"V",desc:"+1d6 psychic, WIS save or frightened."},"Branding Smite":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",comp:"V",desc:"+2d6 radiant, target cannot be invisible."},"Crusader's Mantle":{sc:"Evocation",cast:"1 action",range:"Self",dur:"Conc. 1 min",comp:"V",pg:259,desc:"Allies within 30 ft deal +1d4 radiant."},"Elemental Weapon":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",comp:"V, S",pg:268,desc:"+1 weapon, +1d4 energy damage."},"Blinding Smite":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",comp:"V",pg:247,desc:"+3d8 radiant, CON save or blinded."},"Staggering Smite":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",comp:"V",desc:"+4d6 psychic, WIS save or disadv."},"Holy Weapon":{sc:"Evocation",cast:"1 bonus action",range:"Touch",dur:"Conc. 1 hr",comp:"V, S",desc:"+2d8 radiant on hit."},"Hail of Thorns":{sc:"Conjuration",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",comp:"V",pg:283,desc:"DEX save or 1d10 piercing in 5-ft burst."},"Speak with Animals":{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"10 minutes",comp:"Self",desc:"Communicate with beasts."},"Lightning Arrow":{sc:"Transmutation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",comp:"V, S",pg:292,desc:"Next ranged hit: 4d8 lightning."},"Steel Wind Strike":{sc:"Conjuration",cast:"1 action",range:"30 ft",dur:"Instant",comp:"S, M",desc:"5 targets: 6d10 force each."},"Cordon of Arrows":{sc:"Transmutation",cast:"1 action",range:"5 ft",dur:"8 hours",comp:"V, S, M",pg:258,desc:"4 arrows; DEX save or 1d6 piercing each."},"Conjure Volley":{sc:"Conjuration",cast:"1 action",range:"150 ft",dur:"Instant",comp:"V, S, M(C)",pg:255,desc:"40-ft cylinder: DEX save or 8d8 damage."},"Conjure Woodland Beings":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 hr",comp:"V, S",pg:255,desc:"Summon fey creatures."},"Grasping Vine":{sc:"Conjuration",cast:"1 bonus action",range:"30 ft",dur:"Conc. 1 min",comp:"V, S",pg:280,desc:"2d6 bludgeoning, pull 20 ft."},"Tree Stride":{sc:"Conjuration",cast:"1 action",range:"Self",dur:"Conc. 1 min",comp:"V, S",desc:"Teleport between trees of same species."},"Commune with Nature":{sc:"Divination",cast:"1 min (ritual)",range:"Self",dur:"Instant",comp:"Self",pg:252,desc:"Learn 3 facts about nearby terrain."},"Speak with Plants":{sc:"Transmutation",cast:"1 action",range:"Self (30-ft radius)",dur:"10 minutes",comp:"V, S",desc:"Communicate with plants."},"Dominate Beast":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S",pg:265,desc:"WIS save or control a beast."},"Giant Insect":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Conc. 10 min",comp:"V, S",pg:279,desc:"Insects become giant versions."},"Antilife Shell":{sc:"Abjuration",cast:"1 action",range:"Self (10-ft radius)",dur:"Conc. 1 hr",comp:"V, S",pg:241,desc:"Barrier prevents living creatures entering."},Reincarnate:{sc:"Transmutation",cast:"1 hour",range:"Touch",dur:"Instant",comp:"V, S, M(C*)",pg:311,desc:"Restore dead creature in new body."},"Animal Shapes":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Conc. 1 day",comp:"V, S",pg:240,desc:"Willing creatures become beasts CR 4 or lower."},"Earth Tremor":{sc:"Evocation",cast:"1 action",range:"10 ft",dur:"Instant",comp:"V, S",desc:"DEX save or 1d6 bludgeoning and prone."},Bane:{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:245,desc:"CHA save or -1d4 to attacks/saves."},"Create or Destroy Water":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Instant",comp:"V, S, M",desc:"Create or destroy 10 gallons of water."},"Detect Evil and Good":{sc:"Divination",cast:"1 action",range:"Self",dur:"Conc. 10 min",comp:"V, S",pg:261,desc:"Sense fiends, undead, celestials within 30 ft."},"Detect Magic":{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"Conc. 10 min",comp:"Self",pg:262,desc:"Sense magic within 30 ft."},"Detect Poison and Disease":{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"Conc. 10 min",comp:"Self",pg:262,desc:"Sense poison and disease within 30 ft."},"Purify Food and Drink":{sc:"Transmutation",cast:"1 action (ritual)",range:"10 ft",dur:"Instant",comp:"10 feet",pg:310,desc:"Purify food and drink in 5-ft sphere."},Sanctuary:{sc:"Abjuration",cast:"1 bonus action",range:"30 ft",dur:"1 minute",comp:"V, S, M",pg:313,desc:"WIS save or attackers must choose new target."},Augury:{sc:"Divination",cast:"1 minute (ritual)",range:"Self",dur:"Instant",comp:"Self",pg:244,desc:"Weal/woe for action in next 30 min."},"Calm Emotions":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S",pg:249,desc:"Suppress charm/fright or emotions."},"Enhance Ability":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",comp:"V, S, M",pg:268,desc:"Advantage on one ability checks."},"Find Traps":{sc:"Divination",cast:"1 action",range:"120 ft",dur:"Instant",comp:"V, S",pg:273,desc:"Sense traps in line of sight."},"Locate Animals or Plants":{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"Instant",comp:"Self",pg:292,desc:"Sense nearest named beast or plant within 5 miles."},"Protection from Poison":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"1 hour",comp:"V, S",pg:310,desc:"Advantage vs poison, resistance to poison damage."},"Warding Bond":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"1 hour",comp:"V, S, M",desc:"+1 AC/saves, resistance; you share damage taken."},"Zone of Truth":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"10 minutes",comp:"V, S",desc:"CHA save or cannot lie in 15-ft sphere."},"Beacon of Hope":{sc:"Abjuration",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",comp:"V, S",pg:245,desc:"Advantage on WIS saves and death saves."},"Create Food and Water":{sc:"Conjuration",cast:"1 action",range:"30 ft",dur:"Instant",comp:"V, S",pg:258,desc:"Create 45 lb food and 30 gallons water."},"Mass Healing Word":{sc:"Abjuration",cast:"1 bonus action",range:"60 ft",dur:"Instant",comp:"V",desc:"6 creatures regain 1d4+mod HP."},"Meld into Stone":{sc:"Transmutation",cast:"1 action (ritual)",range:"Touch",dur:"8 hours",comp:"Touch",desc:"Step into a stone object."},"Speak with Dead":{sc:"Necromancy",cast:"1 action",range:"10 ft",dur:"10 minutes",comp:"V, S, M",desc:"Ask a corpse 5 questions."},"Water Walk":{sc:"Transmutation",cast:"1 action (ritual)",range:"30 ft",dur:"1 hour",comp:"30 feet",desc:"Walk across liquid as if solid."},Divination:{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"Instant",comp:"Self",pg:264,desc:"Truthful reply about event within 7 days."},Commune:{sc:"Divination",cast:"1 minute (ritual)",range:"Self",dur:"1 minute",comp:"Self",pg:252,desc:"Ask deity 3 yes/no questions."},Contagion:{sc:"Necromancy",cast:"1 action",range:"Touch",dur:"7 days",comp:"V, S",pg:256,desc:"3 failed CON saves = diseased."},"Dispel Evil and Good":{sc:"Abjuration",cast:"1 action",range:"Self",dur:"Conc. 1 min",comp:"V, S, M",pg:263,desc:"Fiends/undead/fey disadv attacking you."},Hallow:{sc:"Evocation",cast:"24 hours",range:"Touch",dur:"Until dispelled",comp:"V, S, M(C*)",pg:283,desc:"60-ft radius hallowed ground."},"Summon Celestial":{sc:"Conjuration",cast:"1 action",range:"90 ft",dur:"Conc. 1 hr",comp:"V, S, M(C)",desc:"Summon obedient celestial spirit."},"Animal Messenger":{sc:"Enchantment",cast:"1 action (ritual)",range:"30 ft",dur:"24 hours",comp:"30 feet",pg:240,desc:"Tiny beast delivers 25-word message."},"Beast Sense":{sc:"Divination",cast:"1 action (ritual)",range:"Touch",dur:"Conc. 1 hr",comp:"Touch",pg:245,desc:"See and hear through a beast."},"Flame Blade":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 10 min",comp:"V, S, M",desc:"Fire scimitar: 3d6 fire."},"Gust of Wind":{sc:"Evocation",cast:"1 action",range:"Self",dur:"Conc. 1 min",comp:"V, S, M",pg:282,desc:"60-ft wind line pushes 15 ft."},"Heat Metal":{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:284,desc:"Metal glows: 2d8 fire, CON save or drop it."},"Locate Object":{sc:"Divination",cast:"1 action",range:"Self",dur:"Conc. 10 min",comp:"V, S, M",pg:293,desc:"Sense direction to known object within 1000 ft."},"Locate Creature":{sc:"Divination",cast:"1 action",range:"Self",dur:"Conc. 1 hr",comp:"V, S, M",pg:292,desc:"Sense direction to known creature within 1000 ft."},"Conjure Minor Elementals":{sc:"Conjuration",cast:"1 minute",range:"90 ft",dur:"Conc. 1 hr",comp:"V, S",pg:255,desc:"Summon elementals CR 2 or lower."},"Banishing Smite":{sc:"Abjuration",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",comp:"V",pg:245,desc:"+5d10 force; below 50 HP = banished."},"Circle of Power":{sc:"Abjuration",cast:"1 action",range:"Self (30-ft radius)",dur:"Conc. 10 min",comp:"V",pg:250,desc:"Allies advantage on magic saves."},"Destructive Wave":{sc:"Evocation",cast:"1 action",range:"Self (30-ft radius)",dur:"Instant",comp:"V",pg:261,desc:"CON save or 5d6 thunder+5d6 radiant, prone."},"Aura of Life":{sc:"Abjuration",cast:"1 action",range:"Self (30-ft radius)",dur:"Conc. 10 min",comp:"V",pg:244,desc:"Necrotic resistance; 0 HP creatures regain 1 HP per turn."},"Aura of Purity":{sc:"Abjuration",cast:"1 action",range:"Self (30-ft radius)",dur:"Conc. 10 min",comp:"V",pg:244,desc:"Allies immune to disease, resist poison."},Geas:{sc:"Enchantment",cast:"1 minute",range:"60 ft",dur:"30 days",comp:"V",pg:278,desc:"WIS save or follow command; 5d10 psychic per day if violated."},"Control Water":{sc:"Transmutation",cast:"1 action",range:"300 ft",dur:"Conc. 10 min",comp:"V, S, M",pg:256,desc:"Flood, part, redirect, or whirlpool water in a 100-ft cube."},"Animate Objects":{sc:"Transmutation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",comp:"V, S",pg:240,desc:"Animate up to 10 Small or smaller objects."},"Conjure Elemental":{sc:"Conjuration",cast:"1 minute",range:"90 ft",dur:"Conc. 1 hr",comp:"V, S",desc:"Summon elemental CR 5 or lower."},"Bigby's Hand":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:246,desc:"Force hand: punch 4d8, push, or grapple."},"Teleportation Circle":{sc:"Conjuration",cast:"1 minute",range:"10 ft",dur:"1 round",comp:"V, M (C*)",desc:"Portal to permanent teleportation circle."},"Wall of Force":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",comp:"V, S, M",desc:"Invisible indestructible wall of force."},"Wall of Stone":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",comp:"V, S, M",desc:"Nonmagical stone wall; can become permanent."},"Chain Lightning":{sc:"Evocation",cast:"1 action",range:"150 ft",dur:"Instant",comp:"V, S, M",pg:249,desc:"4d8 lightning jumps to 4 targets."},"Circle of Death":{sc:"Necromancy",cast:"1 action",range:"150 ft",dur:"Instant",comp:"V, S, M(C)",pg:250,desc:"CON save or 8d6 necrotic in 60-ft sphere."},Disintegrate:{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S, M",pg:263,desc:"DEX save or 10d6+40 force; 0 HP = dust."},Eyebite:{sc:"Necromancy",cast:"1 action",range:"Self",dur:"Conc. 1 min",comp:"V, S",pg:270,desc:"WIS save or asleep/panicked/sickened."},"Globe of Invulnerability":{sc:"Abjuration",cast:"1 action",range:"Self (10-ft radius)",dur:"Conc. 1 min",comp:"V, S, M",pg:279,desc:"5th-level and lower spells cannot enter."},"Mass Suggestion":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"24 hours",comp:"V, M",desc:"WIS save or 12 creatures follow suggestion."},Sunbeam:{sc:"Evocation",cast:"1 action",range:"Self (60-ft line)",dur:"Conc. 1 min",comp:"V, S, M",desc:"CON save or 6d8 radiant and blinded."},"True Seeing":{sc:"Divination",cast:"1 action",range:"Touch",dur:"1 hour",comp:"V, S, M(C*)",desc:"See through illusions and invisibility."},"Delayed Blast Fireball":{sc:"Evocation",cast:"1 action",range:"150 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:261,desc:"Grows each round; DEX save or 12d6 fire."},Etherealness:{sc:"Transmutation",cast:"1 action",range:"Self",dur:"Up to 8 hours",comp:"V, S",pg:269,desc:"Enter Ethereal Plane."},"Finger of Death":{sc:"Necromancy",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S",pg:273,desc:"CON save or 7d8+30 necrotic; rises as zombie."},Forcecage:{sc:"Evocation",cast:"1 action",range:"100 ft",dur:"1 hour",comp:"V, S, M(C*)",pg:276,desc:"Inescapable 20-ft force cage."},Teleport:{sc:"Conjuration",cast:"1 action",range:"10 ft",dur:"Instant",comp:"V",desc:"Transport up to 9 creatures to known destination."},"Dominate Monster":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Conc. 1 hr",comp:"V, S",pg:265,desc:"WIS save or control any creature."},Feeblemind:{sc:"Enchantment",cast:"1 action",range:"150 ft",dur:"30 days",comp:"V, S, M",desc:"INT save or INT and CHA drop to 1."},"Incendiary Cloud":{sc:"Conjuration",cast:"1 action",range:"150 ft",dur:"Conc. 1 min",comp:"V, S",pg:288,desc:"DEX save or 10d8 fire per turn."},Maze:{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 10 min",comp:"V, S",desc:"Banish to labyrinth; DC 20 INT to escape."},"Mind Blank":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"24 hours",comp:"V, S",pg:298,desc:"Immune to psychic damage and divination."},"Power Word Stun":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Until cured",comp:"V",pg:306,desc:"150 HP or fewer: stunned until CON save."},Sunburst:{sc:"Evocation",cast:"1 action",range:"150 ft",dur:"Instant",comp:"V, S, M",desc:"CON save or 12d6 radiant and blinded."},Foresight:{sc:"Divination",cast:"1 minute",range:"Touch",dur:"8 hours",comp:"V, S, M",pg:276,desc:"Cannot be surprised. Advantage on everything."},Gate:{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S, M(C)",pg:277,desc:"Portal to another plane; summon specific creature."},"Meteor Swarm":{sc:"Evocation",cast:"1 action",range:"1 mile",dur:"Instant",comp:"V, S",pg:298,desc:"4 meteors: DEX save or 20d6 fire+20d6 bludgeoning."},"Power Word Kill":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V",pg:306,desc:"100 HP or fewer: instant death, no save."},Wish:{sc:"Conjuration",cast:"1 action",range:"Self",dur:"Instant",comp:"V",desc:"The mightiest spell. Duplicate any spell 8th level or lower or wish."},Weird:{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",comp:"V, S",desc:"WIS save or frightened; 4d10 psychic per turn."},"Time Stop":{sc:"Transmutation",cast:"1 action",range:"Self",dur:"Instant",comp:"V",desc:"Take 1d4+1 turns while time is frozen."},"True Polymorph":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Conc. 1 hr",comp:"V, S, M",desc:"WIS save or transform creature or object."},Shapechange:{sc:"Transmutation",cast:"1 action",range:"Self",dur:"Conc. 1 hr",comp:"V, S, M(C)",pg:315,desc:"Transform into any seen creature of CR equal to level or lower."},"Astral Projection":{sc:"Necromancy",cast:"1 hour",range:"10 ft",dur:"Special",comp:"V, S, M (C*)",pg:243,desc:"Project up to 9 willing creatures into the Astral Plane."},Imprisonment:{sc:"Abjuration",cast:"1 minute",range:"30 ft",dur:"Until dispelled",comp:"V, S, M(C)",pg:288,desc:"WIS save or creature imprisoned."},"Prismatic Wall":{sc:"Abjuration",cast:"1 action",range:"60 ft",dur:"10 minutes",comp:"V, S",pg:308,desc:"7-layer multicolored wall with different effects."},"Acid Splash":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S",desc:"1d6 acid vs one or two creatures."},"Blade Ward":{sc:"Abjuration",cast:"1 action",range:"Self",dur:"1 round",comp:"V, S",pg:247,desc:"Resistance to weapon damage."},Friends:{sc:"Enchantment",cast:"1 action",range:"Self",dur:"Conc. 1 min",comp:"S, M",pg:277,desc:"Advantage on CHA checks vs one creature."},Mending:{sc:"Transmutation",cast:"1 minute",range:"Touch",dur:"Instant",comp:"V, S, M",pg:297,desc:"Repair a break or tear in an object."},Message:{sc:"Transmutation",cast:"1 action",range:"120 ft",dur:"1 round",comp:"S, M",pg:298,desc:"Whisper to a creature; it can reply."},"Poison Spray":{sc:"Conjuration",cast:"1 action",range:"10 ft",dur:"Instant",comp:"V, S",pg:306,desc:"CON save or 1d12 poison."},"True Strike":{sc:"Divination",cast:"1 action",range:"Self",dur:"Instant",comp:"S, M",desc:"Make one attack with advantage using spell ability."},Thunderclap:{sc:"Evocation",cast:"1 action",range:"5 ft",dur:"Instant",comp:"S",desc:"CON save or 1d6 thunder."},Alarm:{sc:"Abjuration",cast:"1 minute (ritual)",range:"30 ft",dur:"8 hours",comp:"30 feet",desc:"Alarm against intrusion in 20-ft cube."},"Chromatic Orb":{sc:"Evocation",cast:"1 action",range:"90 ft",dur:"Instant",comp:"V, S, M(C)",pg:249,desc:"3d8 of chosen energy type."},"Color Spray":{sc:"Illusion",cast:"1 action",range:"Self (15-ft cone)",dur:"1 round",comp:"V, S, M",pg:251,desc:"6d10 HP worth of creatures blinded."},"Comprehend Languages":{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"1 hour",comp:"Self",pg:252,desc:"Understand any spoken or written language."},"Disguise Self":{sc:"Illusion",cast:"1 action",range:"Self",dur:"1 hour",comp:"V, S",pg:262,desc:"Change your appearance."},"Expeditious Retreat":{sc:"Transmutation",cast:"1 bonus action",range:"Self",dur:"Conc. 10 min",comp:"V, S",pg:270,desc:"Bonus action Dash each turn."},"False Life":{sc:"Necromancy",cast:"1 action",range:"Self",dur:"1 hour",comp:"V, S, M",pg:271,desc:"1d4+4 temporary HP."},"Feather Fall":{sc:"Transmutation",cast:"1 reaction",range:"60 ft",dur:"1 minute",comp:"V, M",pg:271,desc:"5 creatures take no fall damage."},"Find Familiar":{sc:"Conjuration",cast:"1 hour (ritual)",range:"10 ft",dur:"Instant",comp:"10 feet",pg:272,desc:"Gain a familiar in animal form."},Grease:{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"1 minute",comp:"V, S, M",pg:280,desc:"DEX save or fall prone; difficult terrain."},"Hideous Laughter":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",comp:"V, S, M",desc:"WIS save or incapacitated laughing."},Identify:{sc:"Divination",cast:"1 minute (ritual)",range:"Touch",dur:"Instant",comp:"Touch",pg:287,desc:"Learn magic item properties."},"Illusory Script":{sc:"Illusion",cast:"1 minute",range:"Touch",dur:"10 days",comp:"Touch",pg:288,desc:"Hidden message only intended readers can see."},Jump:{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"1 minute",comp:"V, S, M",pg:290,desc:"Triple jump distance."},Longstrider:{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"1 hour",comp:"V, S, M",pg:293,desc:"+10 ft speed."},"Protection from Evil and Good":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Conc. 10 min",comp:"V, S, M(C*)",pg:309,desc:"Protected from aberrations, fiends, undead."},"Ray of Sickness":{sc:"Necromancy",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S",pg:311,desc:"2d8 poison; CON save or poisoned."},"Silent Image":{sc:"Illusion",cast:"1 action",range:"60 ft",dur:"Conc. 10 min",comp:"V, S, M",desc:"Visual illusion up to 15-ft cube."},"Unseen Servant":{sc:"Conjuration",cast:"1 action (ritual)",range:"60 ft",dur:"1 hour",comp:"60 feet",desc:"Invisible force performs simple tasks."},"Alter Self":{sc:"Transmutation",cast:"1 action",range:"Self",dur:"Conc. 1 hr",comp:"V, S",desc:"Change appearance, breathe water, or grow weapons."},"Blindness/Deafness":{sc:"Necromancy",cast:"1 action",range:"30 ft",dur:"1 minute",comp:"V",pg:248,desc:"CON save or blinded/deafened."},Blur:{sc:"Illusion",cast:"1 action",range:"Self",dur:"Conc. 1 min",comp:"V",pg:248,desc:"Attacks against you have disadvantage."},"Cloud of Daggers":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:251,desc:"4d4 slashing in 5-ft cube each turn."},"Continual Flame":{sc:"Evocation",cast:"1 action",range:"Touch",dur:"Until dispelled",comp:"V, S, M(C*)",pg:256,desc:"Permanent flame-like radiance."},"Crown of Madness":{sc:"Enchantment",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",comp:"V, S",desc:"WIS save or attacks random creature."},Darkvision:{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"8 hours",comp:"V, S, M",pg:260,desc:"Darkvision 60 ft."},"Detect Thoughts":{sc:"Divination",cast:"1 action",range:"Self",dur:"Conc. 1 min",comp:"V, S, M",pg:262,desc:"Read surface thoughts of creatures in 30 ft."},"Enlarge/Reduce":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:268,desc:"Double or halve size; +/-1d4 damage."},"Gentle Repose":{sc:"Necromancy",cast:"1 action (ritual)",range:"Touch",dur:"10 days",comp:"Touch",pg:278,desc:"Preserve corpse; extend raise dead limit."},Knock:{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V",pg:290,desc:"Open locked/stuck/barred object."},Levitate:{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Conc. 10 min",comp:"V, S, M",pg:291,desc:"Target rises up to 20 ft."},"Magic Mouth":{sc:"Illusion",cast:"1 minute (ritual)",range:"30 ft",dur:"Until dispelled",comp:"30 feet",pg:295,desc:"25-word message triggers on condition."},"Magic Weapon":{sc:"Transmutation",cast:"1 bonus action",range:"Touch",dur:"Conc. 1 hr",comp:"V, S",pg:295,desc:"Weapon becomes +1 magical."},"Melf's Acid Arrow":{sc:"Evocation",cast:"1 action",range:"90 ft",dur:"Instant",comp:"V, S, M",pg:297,desc:"4d4 acid now + 2d4 next turn."},"Phantasmal Force":{sc:"Illusion",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:304,desc:"INT save or perceive illusion as real: 1d6 psychic per turn."},"Ray of Enfeeblement":{sc:"Necromancy",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S",pg:311,desc:"CON save or half damage with STR attacks."},"Rope Trick":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"1 hour",comp:"V, S, M",pg:312,desc:"Extradimensional space at top of rope."},"See Invisibility":{sc:"Divination",cast:"1 action",range:"Self",dur:"1 hour",comp:"V, S, M",pg:314,desc:"See invisible creatures and objects."},"Spider Climb":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",comp:"V, S, M",desc:"Climb any surface including ceilings."},Web:{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 hr",comp:"V, S, M",desc:"DEX save or restrained in webs."},"Bestow Curse":{sc:"Necromancy",cast:"1 action",range:"Touch",dur:"Conc. 1 min",comp:"V, S",pg:246,desc:"WIS save or cursed with various penalties."},Blink:{sc:"Transmutation",cast:"1 action",range:"Self",dur:"1 minute",comp:"V, S",pg:248,desc:"d20 11+: shift to Ethereal until next turn."},Clairvoyance:{sc:"Divination",cast:"10 minutes",range:"1 mile",dur:"Conc. 10 min",comp:"V, S, M(C)",pg:250,desc:"Invisible sensor; see or hear through it."},"Feign Death":{sc:"Necromancy",cast:"1 action",range:"Touch",dur:"1 hour",comp:"Touch",pg:271,desc:"Appear dead; resistance all damage except psychic."},"Gaseous Form":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",comp:"V, S, M",pg:277,desc:"Misty cloud, fly 10 ft, resist nonmagical damage."},"Glyph of Warding":{sc:"Abjuration",cast:"1 hour",range:"Touch",dur:"Until triggered",comp:"V, S, M(C*)",pg:279,desc:"Rune triggers spell or 5d8 explosion."},Nondetection:{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"8 hours",comp:"V, S, M(C*)",pg:302,desc:"Cannot be targeted by divination or scrying."},"Protection from Energy":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",comp:"V, S",pg:309,desc:"Resistance to one energy type."},"Sleet Storm":{sc:"Conjuration",cast:"1 action",range:"150 ft",dur:"Conc. 1 min",comp:"V, S, M",desc:"DEX save or prone; difficult terrain."},"Stinking Cloud":{sc:"Conjuration",cast:"1 action",range:"90 ft",dur:"Conc. 1 min",comp:"V, S, M",desc:"CON save or waste action retching."},Tongues:{sc:"Divination",cast:"1 action",range:"Touch",dur:"1 hour",comp:"V, M",desc:"Understand and speak any language."},"Water Breathing":{sc:"Transmutation",cast:"1 action (ritual)",range:"30 ft",dur:"24 hours",comp:"30 feet",desc:"10 creatures breathe underwater."},"Arcane Eye":{sc:"Divination",cast:"1 action",range:"30 ft",dur:"Conc. 1 hr",comp:"V, S, M",pg:242,desc:"Invisible magic eye; darkvision 30 ft."},"Evard's Black Tentacles":{sc:"Conjuration",cast:"1 action",range:"90 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:270,desc:"DEX save or restrained + 3d6 bludgeoning per turn."},Fabricate:{sc:"Transmutation",cast:"10 minutes",range:"120 ft",dur:"Instant",comp:"V, S",pg:271,desc:"Transform raw materials into product."},"Fire Shield":{sc:"Evocation",cast:"1 action",range:"Self",dur:"10 minutes",comp:"V, S, M",pg:274,desc:"Resist fire or cold; attackers take 2d8."},"Leomund's Secret Chest":{sc:"Conjuration",cast:"1 action",range:"Touch",dur:"Instant",comp:"V, S, M(C)",pg:290,desc:"Hide chest on Ethereal Plane."},"Mordenkainen's Faithful Hound":{sc:"Conjuration",cast:"1 action",range:"30 ft",dur:"8 hours",comp:"V, S, M",pg:300,desc:"Invisible watchdog; 4d8 piercing attack."},"Mordenkainen's Private Sanctum":{sc:"Abjuration",cast:"10 minutes",range:"120 ft",dur:"24 hours",comp:"V, S, M",pg:301,desc:"Block teleportation, scrying, and sound."},"Otiluke's Resilient Sphere":{sc:"Evocation",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:303,desc:"DEX save or enclosed in force sphere."},"Phantasmal Killer":{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",comp:"V, S",pg:304,desc:"WIS save or frightened; 4d10 psychic per turn."},"Stone Shape":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Instant",comp:"V, S, M",desc:"Shape Medium stone into any form."},Stoneskin:{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",comp:"V, S, M(C*)",desc:"Resistance to nonmagical weapon damage."},"Wall of Fire":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",comp:"V, S, M",desc:"5d8 fire to creatures within 10 ft."},Creation:{sc:"Illusion",cast:"1 minute",range:"30 ft",dur:"Special",comp:"V, S, M",pg:259,desc:"Create nonliving object from shadow matter."},"Legend Lore":{sc:"Divination",cast:"10 minutes",range:"Self",dur:"Instant",comp:"V, S, M(C*)",pg:290,desc:"Learn lore about legendary person/place/object."},Scrying:{sc:"Divination",cast:"10 minutes",range:"Self",dur:"Conc. 10 min",comp:"V, S, M",pg:313,desc:"WIS save or see/hear a chosen creature remotely."},Dream:{sc:"Illusion",cast:"1 minute",range:"Special",dur:"8 hours",comp:"V, S, M",pg:266,desc:"Contact a creature in its dreams; can cause fear damage."},"Yolande's Regal Presence":{sc:"Enchantment",cast:"1 action",range:"Self",dur:"1 round",comp:"V, S, M",desc:"Creatures nearby are Charmed or Frightened (WIS save)."},Mislead:{sc:"Illusion",cast:"1 action",range:"Self",dur:"Conc. 1 hr",comp:"S",pg:299,desc:"Become invisible; create controllable double."},"Modify Memory":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",comp:"V, S",pg:299,desc:"WIS save or alter 10 min of memories."},Passwall:{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"1 hour",comp:"V, S, M",pg:303,desc:"Passage through wall up to 20 ft deep."},"Planar Binding":{sc:"Abjuration",cast:"1 hour",range:"60 ft",dur:"24 hours",comp:"V, S, M(C*)",pg:305,desc:"CHA save or celestial/fiend/fey serves you."},Seeming:{sc:"Illusion",cast:"1 action",range:"30 ft",dur:"8 hours",comp:"V, S",pg:314,desc:"Change appearance of any number of creatures."},Telekinesis:{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Conc. 10 min",comp:"V, S",desc:"Move creatures or objects up to 1000 lb."},"Arcane Gate":{sc:"Conjuration",cast:"1 action",range:"500 ft",dur:"Conc. 10 min",comp:"V, S",pg:242,desc:"Link two portals up to 500 ft apart."},Contingency:{sc:"Evocation",cast:"10 minutes",range:"Self",dur:"10 days",comp:"V, S, M(C)",pg:256,desc:"Prepare spell to trigger automatically."},"Create Undead":{sc:"Necromancy",cast:"1 minute",range:"10 ft",dur:"Instant",comp:"V, S, M(C)",pg:258,desc:"Create 3 ghouls from corpses."},"Flesh to Stone":{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S, M",desc:"CON save or petrified after 3 failures."},"Guards and Wards":{sc:"Abjuration",cast:"10 minutes",range:"Touch",dur:"24 hours",comp:"V, S, M",pg:282,desc:"Magical building defenses."},"Move Earth":{sc:"Transmutation",cast:"1 action",range:"120 ft",dur:"Conc. 2 hr",comp:"V, S, M",pg:302,desc:"Reshape 40-ft cube of dirt/sand/clay."},"Otiluke's Freezing Sphere":{sc:"Evocation",cast:"1 action",range:"300 ft",dur:"Instant",comp:"V, S, M",pg:302,desc:"CON save or 10d6 cold in 60-ft radius."},"Otto's Irresistible Dance":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",comp:"V",pg:303,desc:"WIS save or must dance: -2 AC, no movement."},"Programmed Illusion":{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Until dispelled",comp:"V, S, M",pg:309,desc:"Illusion activates on trigger."},"Wall of Ice":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",comp:"V, S, M",desc:"CON save or 10d6 cold on creation."},"Mirage Arcane":{sc:"Illusion",cast:"10 minutes",range:"Sight",dur:"10 days",comp:"V, S",pg:299,desc:"1-mile square terrain illusion."},"Mordenkainen's Magnificent Mansion":{sc:"Conjuration",cast:"1 minute",range:"300 ft",dur:"24 hours",comp:"V, S, M",pg:300,desc:"Extradimensional dwelling."},"Mordenkainen's Sword":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",comp:"V, S, M(C)",pg:302,desc:"Floating sword: 3d10 force on command."},"Plane Shift":{sc:"Conjuration",cast:"1 action",range:"Touch",dur:"Instant",comp:"V, S, M(C)",pg:305,desc:"Transport up to 9 creatures to another plane."},"Prismatic Spray":{sc:"Evocation",cast:"1 action",range:"Self (60-ft cone)",dur:"Instant",comp:"V, S",pg:307,desc:"8 colored rays with different effects."},"Project Image":{sc:"Illusion",cast:"1 action",range:"500 miles",dur:"Conc. 1 day",comp:"V, S, M",pg:309,desc:"Illusory duplicate you can sense through."},"Reverse Gravity":{sc:"Transmutation",cast:"1 action",range:"100 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:312,desc:"Objects fall upward in 50-ft radius."},Symbol:{sc:"Abjuration",cast:"1 minute",range:"Touch",dur:"Until triggered",comp:"V, S, M(C*)",desc:"Harmful rune triggers on condition."},Heal:{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S",pg:284,desc:"Restore 70 HP and end blindness/deafness/disease."},Harm:{sc:"Necromancy",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S",pg:283,desc:"CON save or 14d6 necrotic; reduces max HP."},"Heroes' Feast":{sc:"Conjuration",cast:"10 minutes",range:"30 ft",dur:"Instant",comp:"V, S, M(C*)",pg:284,desc:"12 creatures: immunity poison/fright, +2d10 HP max."},"Planar Ally":{sc:"Conjuration",cast:"10 minutes",range:"60 ft",dur:"Instant",comp:"V, S",pg:304,desc:"Deity sends celestial/elemental/fiend."},"Word of Recall":{sc:"Conjuration",cast:"1 action",range:"5 ft",dur:"Instant",comp:"V",desc:"5 creatures teleport to sanctuary."},"Conjure Celestial":{sc:"Conjuration",cast:"1 minute",range:"90 ft",dur:"Conc. 1 hr",comp:"V, S",desc:"Summon celestial CR 4 or lower."},"Divine Word":{sc:"Evocation",cast:"1 bonus action",range:"30 ft",dur:"Instant",comp:"V",pg:265,desc:"Effects based on creature HP."},"Fire Storm":{sc:"Evocation",cast:"1 action",range:"150 ft",dur:"Instant",comp:"V, S",desc:"DEX save or 7d10 fire in 10 cubes."},Regenerate:{sc:"Transmutation",cast:"1 minute",range:"Touch",dur:"1 hour",comp:"V, S, M",pg:311,desc:"4d8+15 HP now; regrow limbs; 1 HP per round."},Resurrection:{sc:"Necromancy",cast:"1 hour",range:"Touch",dur:"Instant",comp:"V, S, M(C*)",pg:312,desc:"Return dead (100 years) to life (1000gp diamond)."},"Antimagic Field":{sc:"Abjuration",cast:"1 action",range:"Self (10-ft radius)",dur:"Conc. 1 hr",comp:"V, S, M",pg:241,desc:"10-ft sphere where magic fails."},"Control Weather":{sc:"Transmutation",cast:"10 minutes",range:"Self (5-mile radius)",dur:"Conc. 8 hr",comp:"V, S, M",pg:257,desc:"Control weather in 5-mile area."},Earthquake:{sc:"Evocation",cast:"1 action",range:"500 ft",dur:"Conc. 1 min",comp:"V, S, M",pg:267,desc:"100-ft radius intense shaking."},"Holy Aura":{sc:"Abjuration",cast:"1 action",range:"Self",dur:"Conc. 1 min",comp:"V, S, M(C)",pg:286,desc:"Allies adv all saves; enemies disadv attacking them."},"Mass Heal":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",comp:"V, S",desc:"Distribute 700 HP among creatures."},"True Resurrection":{sc:"Necromancy",cast:"1 hour",range:"Touch",dur:"Instant",comp:"V, S, M(C*)",desc:"Return dead (200 years) even without body."},"Antipathy/Sympathy":{sc:"Enchantment",cast:"1 hour",range:"60 ft",dur:"10 days",comp:"V, S, M",pg:242,desc:"Object repels or attracts a creature type."},"Storm of Vengeance":{sc:"Conjuration",cast:"1 action",range:"Sight",dur:"Conc. 1 min",comp:"V, S",desc:"Massive storm: lightning, acid, hail each round."},"Conjure Fey":{sc:"Conjuration",cast:"1 minute",range:"90 ft",dur:"Conc. 1 hr",comp:"V, S",pg:255,desc:"Summon fey creature CR 6 or lower."},"Transport via Plants":{sc:"Conjuration",cast:"1 action",range:"10 ft",dur:"1 round",comp:"V, S",desc:"Link two Large+ plants on same plane."},"Wall of Thorns":{sc:"Conjuration",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",comp:"V, S, M",desc:"7d8 piercing to pass through."},"Wind Walk":{sc:"Transmutation",cast:"1 minute",range:"30 ft",dur:"8 hours",comp:"V, S, M",desc:"10 creatures become gaseous, fly 300 ft."},Glibness:{sc:"Transmutation",cast:"1 action",range:"Self",dur:"1 hour",comp:"V",pg:279,desc:"CHA checks treat rolls of 9 or lower as 10."},"Power Word Heal":{sc:"Evocation",cast:"1 action",range:"Touch",dur:"Instant",comp:"V",pg:306,desc:"Restore all HP; end conditions."},"Find the Path":{sc:"Divination",cast:"1 minute",range:"Self",dur:"Conc. 1 day",comp:"V, S, M(C*)",pg:273,desc:"Know shortest path to location."},Forbiddance:{sc:"Abjuration",cast:"10 minutes",range:"Touch",dur:"1 day",comp:"Touch",pg:276,desc:"Guard area against planar travel."},"Blade Barrier":{sc:"Evocation",cast:"1 action",range:"90 ft",dur:"Conc. 10 min",comp:"V, S",pg:247,desc:"DEX save or 6d10 slashing to pass through."},"Leomund's Tiny Hut":{sc:"Evocation",cast:"1 minute (ritual)",range:"Self",dur:"8 hours",comp:"Self",pg:291,desc:"10-ft dome shelter for 9 creatures."},"Magic Circle":{sc:"Abjuration",cast:"1 minute",range:"10 ft",dur:"1 hour",comp:"V, S, M(C*)",pg:293,desc:"Barrier keeping creature type out or in."},"Phantom Steed":{sc:"Illusion",cast:"1 minute (ritual)",range:"30 ft",dur:"1 hour",comp:"30 feet",pg:304,desc:"Quasi-real steed, speed 100 ft."}};

function maxSpellLevel(ct,lvl){if(ct==="full")return Math.min(9,Math.ceil(lvl/2));if(ct==="half")return Math.min(5,Math.ceil(lvl/2));if(ct==="warlock")return Math.min(5,Math.ceil(lvl/2));return 0;}
function spellsKnown(cn,lvl,smod){
  const prepared=["Cleric","Druid","Paladin","Wizard"];
  const tbl={Bard:[null,4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22],Sorcerer:[null,2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15],Warlock:[null,2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],Ranger:[null,0,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12]};
  if(prepared.includes(cn)){if(cn==="Wizard")return`${lvl+smod} prepared`;if(cn==="Paladin")return`${Math.max(1,Math.ceil(lvl/2)+smod)} prepared`;return`${Math.max(1,lvl+smod)} prepared`;}
  const t=tbl[cn];if(t)return`${t[Math.min(lvl,20)]} known`;return null;
}
// Cantrips known per class (2024 PHB): base at L1, +1 at L4, +1 at L10.
const CANTRIPS_KNOWN={Bard:[2,3,4],Cleric:[3,4,5],Druid:[2,3,4],Sorcerer:[4,5,6],Warlock:[2,3,4],Wizard:[3,4,5]};
function cantripsKnown(cn,lvl){const t=CANTRIPS_KNOWN[cn];if(!t)return 0;return lvl>=10?t[2]:lvl>=4?t[1]:t[0];}
// Point Buy (2024): 27 points, scores 8–15.
const PB_COST={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
const PB_BUDGET=27;
function pointBuySpent(stats){return Object.values(stats).reduce((s,v)=>s+(PB_COST[v]??0),0);}
// Warlock Eldritch Invocations (2024). Names are canon (kept English); desc is [en, da].
const ELDRITCH_INVOCATIONS={
  "Agonizing Blast":["Add your CHA modifier to Eldritch Blast damage.","Læg din CHA-modifier til Eldritch Blast-skade.","Eldritch Blast cantrip"],
  "Armor of Shadows":["Cast Mage Armor on yourself at will, without a spell slot.","Cast Mage Armor på dig selv frit, uden spell slot.",""],
  "Ascendant Step":["Cast Levitate on yourself at will.","Cast Levitate på dig selv frit.","Level 9+"],
  "Devil's Sight":["See normally in magical and nonmagical darkness within 120 ft.","Se normalt i magisk og ikke-magisk mørke inden for 120 ft.",""],
  "Eldritch Mind":["Advantage on CON saves to keep concentration on spells.","Fordel på CON saves for at holde koncentration på spells.",""],
  "Eldritch Spear":["Eldritch Blast's range becomes 300 ft.","Eldritch Blasts rækkevidde bliver 300 ft.","Eldritch Blast cantrip"],
  "Fiendish Vigor":["Cast False Life on yourself at will for temp HP.","Cast False Life på dig selv frit for midlertidige HP.",""],
  "Gaze of Two Minds":["Perceive through a willing creature's senses.","Sans gennem et villigt væsens sanser.",""],
  "Gift of the Depths":["Breathe underwater and gain a swim speed.","Ånd under vand og få en svømmefart.",""],
  "Lessons of the First Ones":["Gain one Origin feat of your choice.","Få én valgfri Origin feat.",""],
  "Mask of Many Faces":["Cast Disguise Self at will.","Cast Disguise Self frit.",""],
  "Misty Visions":["Cast Silent Image at will.","Cast Silent Image frit.",""],
  "One with Shadows":["Become invisible while in dim light or darkness (until you move/act).","Bliv usynlig i svagt lys eller mørke (indtil du bevæger dig/handler).","Level 5+"],
  "Otherworldly Leap":["Cast Jump on yourself at will.","Cast Jump på dig selv frit.","Level 5+"],
  "Pact of the Blade":["Conjure a magic weapon you're proficient with; attack with CHA.","Fremkald et magisk våben du er proficient med; angrib med CHA.",""],
  "Pact of the Chain":["Learn Find Familiar; your familiar can take special forms and attack.","Lær Find Familiar; din familiar kan tage særlige former og angribe.",""],
  "Pact of the Tome":["Gain a Book of Shadows with 3 extra cantrips and 2 rituals.","Få en Book of Shadows med 3 ekstra cantrips og 2 ritualer.",""],
  "Pact of the Talisman":["A talisman lets you add 1d4 to a failed ability check.","En talisman lader dig lægge 1d4 til et fejlet ability check.",""],
  "Repelling Blast":["Push a creature 10 ft away with Eldritch Blast.","Skub et væsen 10 ft væk med Eldritch Blast.","Eldritch Blast cantrip"],
  "Thirsting Blade":["Attack twice with your pact weapon (Extra Attack).","Angrib to gange med dit pagtsvåben (Extra Attack).","Level 5+, Pact of the Blade"],
  "Eldritch Smite":["Spend a spell slot to deal extra force damage and knock prone.","Brug et spell slot for ekstra force-skade og slå omkuld.","Level 5+, Pact of the Blade"],
  "Whispers of the Grave":["Cast Speak with Dead at will.","Cast Speak with Dead frit.","Level 9+"],
  "Witch Sight":["See the true form of shapechangers and illusions within 30 ft.","Se den sande form af shapechangers og illusioner inden for 30 ft.","Level 15+"],
};
// 2024 Warlock: number of invocations known by level.
const INV_KNOWN=[0,1,3,3,3,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10];
function invocationsKnown(lvl){return INV_KNOWN[Math.min(lvl,20)]||0;}
// 2024 level-1 "Order" choices. Each option: [name, en desc, da desc, extraCantrips].
const CLASS_ORDER={
  Cleric:{label:"Divine Order",options:[
    ["Protector",["Proficiency with Martial weapons and Heavy armor.","Færdighed med kampvåben og tung rustning."],0,[]],
    ["Thaumaturge",["+1 Cleric cantrip; add WIS to Religion/Arcana checks.","+1 Cleric-cantrip; læg WIS til Religion/Arcana-tjek."],1,["Arcana","Religion"]],
  ]},
  Druid:{label:"Primal Order",options:[
    ["Magician",["+1 Druid cantrip; add WIS to Arcana/Nature checks.","+1 Druid-cantrip; læg WIS til Arcana/Nature-tjek."],1,["Arcana","Nature"]],
    ["Warden",["Proficiency with Martial weapons and Medium armor.","Færdighed med kampvåben og medium rustning."],0,[]],
  ]},
};
function defaultOrder(cn){return CLASS_ORDER[cn]?CLASS_ORDER[cn].options[0][0]:"";}
function orderOption(cn,order){const o=CLASS_ORDER[cn];return o?o.options.find(x=>x[0]===order):null;}
function orderCantripBonus(cn,order){const m=orderOption(cn,order);return m?m[2]:0;}
function orderWisSkills(cn,order){const m=orderOption(cn,order);return m?(m[3]||[]):[];}
// 2024 Expertise: Rogue chooses 2 skills at Lvl1, 2 more at Lvl6. Bard chooses 2 at Lvl3, 2 more at Lvl10.
const EXPERTISE_LEVELS={Rogue:{1:2,6:2},Bard:{3:2,10:2},Ranger:{2:1,9:1}};
function expertiseSlots(cn,lvl){const t=EXPERTISE_LEVELS[cn];if(!t)return 0;return Object.keys(t).reduce((sum,l)=>lvl>=Number(l)?sum+t[l]:sum,0);}
// Strips a parenthetical suffix, e.g. "Magic Initiate (Druid)" -> "Magic Initiate".
function featBaseName(f){return (f||"").replace(/\s*\([^)]*\)\s*$/,"").trim();}
// 2024 rules: Magic Initiate can only pick from Cleric, Druid, or Wizard.
const MAGIC_INITIATE_CLASSES=["Cleric","Druid","Wizard"];
// 2024 Dragonborn Draconic Ancestry: color -> Breath Weapon / Damage Resistance type.
const DRACONIC_ANCESTRY={Black:"Acid",Blue:"Lightning",Brass:"Fire",Bronze:"Lightning",Copper:"Acid",Gold:"Fire",Green:"Poison",Red:"Fire",Silver:"Cold",White:"Cold"};
// Breath Weapon damage dice by character level (2024 rules): 1d10 -> 2d10 (5) -> 3d10 (11) -> 4d10 (17).
function breathWeaponDice(level){const n=level>=17?4:level>=11?3:level>=5?2:1;return n+"d10";}
// Level-1 Ritual spells (any class) — the 2 you learn with Pact of the Tome.
const RITUAL_L1=["Alarm","Comprehend Languages","Detect Magic","Detect Poison and Disease","Find Familiar","Identify","Purify Food and Drink","Speak with Animals","Unseen Servant"];
// Common low-CR beasts for Druid Wild Shape (2024 rules). cr as a number for comparison (0.25=1/4 etc).
// Standard 2024 tool proficiencies, for feats like Skilled/Crafter that let you pick tools instead of skills.
const TOOL_LIST=["Alchemist's Supplies","Brewer's Supplies","Calligrapher's Supplies","Carpenter's Tools","Cartographer's Tools","Cobbler's Tools","Cook's Utensils","Glassblower's Tools","Jeweler's Tools","Leatherworker's Tools","Mason's Tools","Painter's Supplies","Potter's Tools","Smith's Tools","Tinker's Tools","Weaver's Tools","Woodcarver's Tools","Disguise Kit","Forgery Kit","Gaming Set","Herbalism Kit","Musical Instrument","Navigator's Tools","Thieves' Tools"];
// Wild Magic Surge table (PHB p.150), verified against the book. Each entry: [range,[en,da]].
const WILD_MAGIC_SURGE=[
  ["01-04",["Roll on this table at the start of each of your turns for the next minute, ignoring this result on subsequent rolls.","Slå på denne tabel i starten af hver af dine ture i det næste minut, ignorer dette resultat ved efterfølgende slag."]],
  ["05-08",["A Friendly creature appears in a random unoccupied space within 60 ft of you (DM-controlled), and disappears after 1 minute.","Et venligtsindet væsen dukker op på en tilfældig ledig plads inden for 60 ft af dig (DM-styret), og forsvinder efter 1 minut."]],
  ["09-12",["For the next minute, you regain 5 Hit Points at the start of each of your turns.","I det næste minut genopretter du 5 Hit Points i starten af hver af dine ture."]],
  ["13-16",["Creatures have Disadvantage on saving throws against the next spell you cast in the next minute that involves a save.","Væsener har Disadvantage på saves mod det næste spell du caster i det næste minut, der involverer et save."]],
  ["17-20",["You're subjected to a random minor effect for 1 minute (roll 1d8): ethereal music, grow a size, feathered beard, must shout, illusory butterflies, extra eye, pink bubbles, or blue skin.","Du udsættes for en tilfældig mindre effekt i 1 minut (slå 1d8): eterisk musik, vokser en størrelse, fjerskæg, skal råbe, illusoriske sommerfugle, ekstra øje, lyserøde bobler, eller blå hud."]],
  ["21-24",["For the next minute, all your spells with a casting time of an action have a casting time of a Bonus Action.","I det næste minut har alle dine spells med en handlings-castetid en bonus-handlings-castetid."]],
  ["25-28",["You're transported to the Astral Plane until the end of your next turn, then return to your space (or the nearest unoccupied space).","Du transporteres til Astral Plane indtil slutningen af din næste tur, og vender derefter tilbage til din plads (eller den nærmeste ledige plads)."]],
  ["29-32",["The next damaging spell you cast within the next minute uses the highest number possible for each damage die instead of rolling.","Det næste skadegivende spell du caster inden for det næste minut bruger det højeste tal muligt for hver skadeterning i stedet for at slå."]],
  ["33-36",["You have Resistance to all damage for the next minute.","Du har Resistance mod al skade i det næste minut."]],
  ["37-40",["You turn into a potted plant until the start of your next turn: Incapacitated, Vulnerable to all damage; your pot breaking at 0 HP reverts you.","Du bliver til en potteplante indtil starten af din næste tur: Incapacitated, Vulnerable mod al skade; din potte går i stykker ved 0 HP og du vender tilbage."]],
  ["41-44",["For the next minute, you can teleport up to 20 ft as a Bonus Action on each of your turns.","I det næste minut kan du teleportere op til 20 ft som en bonus-handling hver af dine ture."]],
  ["45-48",["You and up to three creatures within 30 ft have the Invisible condition for 1 minute, ending on a creature after it attacks, damages, or casts.","Du og op til tre væsener inden for 30 ft har Invisible i 1 minut, ophører for et væsen efter det angriber, giver skade, eller caster."]],
  ["49-52",["A spectral shield hovers near you for 1 minute, granting +2 AC and immunity to Magic Missile.","Et spektralt skjold svæver nær dig i 1 minut, og giver +2 AC og immunitet mod Magic Missile."]],
  ["53-56",["You can take one extra action on this turn.","Du kan udføre en ekstra handling denne tur."]],
  ["57-60",["You cast a random spell (roll 1d10) without needing Concentration, lasting its full duration.","Du caster et tilfældigt spell (slå 1d10) uden krav om koncentration, med fuld varighed."]],
  ["61-64",["For the next minute, flammable unattended objects you touch burst into flame, taking 1d4 Fire damage and burning.","I det næste minut bryder brandbare, ubevogtede genstande du rører i brand, tager 1d4 Fire-skade og brænder."]],
  ["65-68",["If you die within the next hour, you immediately revive as if by the Reincarnate spell.","Hvis du dør inden for den næste time, genopliver du straks som ved Reincarnate-spellet."]],
  ["69-72",["You have the Frightened condition until the end of your turn (DM determines the source).","Du har Frightened indtil slutningen af din tur (DM bestemmer kilden)."]],
  ["73-76",["You teleport up to 60 ft to an unoccupied space you can see.","Du teleporterer op til 60 ft til en ledig plads du kan se."]],
  ["77-80",["A random creature within 60 ft has the Poisoned condition for 1d4 hours.","Et tilfældigt væsen inden for 60 ft får Poisoned i 1d4 timer."]],
  ["81-84",["You radiate Bright Light in a 30-ft radius for 1 minute; creatures ending their turn within 5 ft of you are Blinded until the end of their next turn.","Du udstråler Bright Light i en 30-ft radius i 1 minut; væsener der slutter deres tur inden for 5 ft af dig bliver Blinded indtil slutningen af deres næste tur."]],
  ["85-88",["Up to three creatures within 30 ft take 1d10 Necrotic damage; you regain HP equal to the total dealt.","Op til tre væsener inden for 30 ft tager 1d10 Necrotic-skade; du genopretter HP svarende til det samlede antal givet."]],
  ["89-92",["Up to three creatures within 30 ft take 4d10 Lightning damage.","Op til tre væsener inden for 30 ft tager 4d10 Lightning-skade."]],
  ["93-96",["You and all creatures within 30 ft have Vulnerability to Piercing damage for 1 minute.","Du og alle væsener inden for 30 ft har Vulnerability mod Piercing-skade i 1 minut."]],
  ["97-00",["Roll 1d6: regain 2d10 HP, an ally regains 2d10 HP, regain your lowest spell slot, an ally regains their lowest slot, regain all Sorcery Points, or trigger row 17-20's effect on everyone.","Slå 1d6: genopret 2d10 HP, en allieret genopretter 2d10 HP, genopret din laveste spell-slot, en allieret genopretter deres laveste slot, genopret alle Sorcery Points, eller udløs række 17-20's effekt på alle."]],
];
// The exact Beast options from the 2024 PHB Appendix B (CR 1 or lower), the pool Wild Shape draws from by default.
const WILDSHAPE_BEASTS={
  Cat:{cr:0,ac:12,hp:2,speed:"40 ft, climb 40 ft",fly:false,stats:[3,15,10,3,12,7],atk:"Scratch +4, 1 slashing",skills:"Perception +3, Stealth +4",senses:"Darkvision 60 ft., Passive Perception 13",lang:"None",traits:[["Jumper","The cat's jump distance is determined using its Dexterity rather than its Strength."]]},
  Crab:{cr:0,ac:11,hp:3,speed:"20 ft, swim 20 ft",fly:false,stats:[6,11,12,1,8,2],atk:"Claw +2, 1 bludgeoning",skills:"Stealth +2",senses:"Blindsight 30 ft., Passive Perception 9",lang:"None",traits:[["Amphibious","The crab can breathe air and water."]]},
  Frog:{cr:0,ac:11,hp:1,speed:"20 ft, swim 20 ft",fly:false,stats:[1,13,8,1,8,3],atk:"Bite +3, 1 piercing",skills:"Perception +1, Stealth +3",senses:"Darkvision 30 ft., Passive Perception 11",lang:"None",traits:[["Amphibious","The frog can breathe air and water."],["Standing Leap","The frog's Long Jump is up to 10 feet and its High Jump is up to 5 feet with or without a running start."]]},
  Goat:{cr:0,ac:10,hp:4,speed:"40 ft, climb 30 ft",fly:false,stats:[11,10,11,2,10,5],atk:"Ram +2, 1 bludgeoning (2, 1d4, if it moved 20+ ft straight toward the target)",skills:"Perception +2",senses:"Darkvision 60 ft., Passive Perception 12",lang:"None",traits:[]},
  Hawk:{cr:0,ac:13,hp:1,speed:"10 ft, fly 60 ft",fly:true,stats:[5,16,8,2,14,6],atk:"Talons +5, 1 slashing",skills:"Perception +6",senses:"Passive Perception 16",lang:"None",traits:[]},
  Lizard:{cr:0,ac:10,hp:2,speed:"20 ft, climb 20 ft",fly:false,stats:[2,11,10,1,8,3],atk:"Bite +2, 1 piercing",skills:"",senses:"Darkvision 30 ft., Passive Perception 9",lang:"None",traits:[["Spider Climb","The lizard can climb difficult surfaces, including along ceilings, without needing to make an ability check."]]},
  Octopus:{cr:0,ac:12,hp:3,speed:"5 ft, swim 30 ft",fly:false,stats:[4,15,11,3,10,4],atk:"Tentacles +4, 1 bludgeoning",skills:"Perception +2, Stealth +6",senses:"Darkvision 30 ft., Passive Perception 12",lang:"None",traits:[["Compression","The octopus can move through a space as narrow as 1 inch without squeezing."],["Water Breathing","The octopus can breathe only underwater."],["Ink Cloud (1/Day, Reaction)","Underwater, releases ink filling a 5-ft Cube and moves up to its Swim Speed when a creature ends its turn within 5 ft; the Cube is Heavily Obscured for 1 minute."]]},
  Owl:{cr:0,ac:11,hp:1,speed:"5 ft, fly 60 ft",fly:true,stats:[3,13,8,2,12,7],atk:"Talons +3, 1 slashing",skills:"Perception +5, Stealth +5",senses:"Darkvision 120 ft., Passive Perception 15",lang:"None",traits:[["Flyby","The owl doesn't provoke Opportunity Attacks when it flies out of an enemy's reach."]]},
  Rat:{cr:0,ac:10,hp:1,speed:"20 ft",fly:false,stats:[2,11,9,2,10,4],atk:"Bite +2, 1 piercing",skills:"Perception +2",senses:"Darkvision 30 ft., Passive Perception 12",lang:"None",traits:[["Agile","The rat doesn't provoke Opportunity Attacks when it moves out of an enemy's reach."]]},
  Raven:{cr:0,ac:12,hp:2,speed:"10 ft, fly 50 ft",fly:true,stats:[2,14,10,5,13,6],atk:"Beak +4, 1 piercing",skills:"Perception +3",senses:"Passive Perception 13",lang:"None",traits:[["Mimicry","The raven can mimic simple sounds it has heard, such as a whisper or chitter. A hearer can discern the sounds are imitations with a successful DC 10 WIS (Insight) check."]]},
  Scorpion:{cr:0,ac:11,hp:1,speed:"10 ft",fly:false,stats:[2,11,8,1,8,2],atk:"Sting +2, 1 piercing + 3 (1d6) poison",skills:"",senses:"Blindsight 10 ft., Passive Perception 9",lang:"None",traits:[]},
  Spider:{cr:0,ac:12,hp:1,speed:"20 ft, climb 20 ft",fly:false,stats:[2,14,8,1,10,2],atk:"Bite +4, 1 piercing + 2 (1d4) poison",skills:"Stealth +4",senses:"Darkvision 30 ft., Passive Perception 10",lang:"None",traits:[["Spider Climb","The spider can climb difficult surfaces, including along ceilings, without needing to make an ability check."],["Web Walker","The spider ignores movement restrictions caused by webs, and it knows the location of any other creature in contact with the same web."]]},
  Weasel:{cr:0,ac:13,hp:1,speed:"30 ft, climb 30 ft",fly:false,stats:[3,16,8,2,12,3],atk:"Bite +5, 1 piercing",skills:"Acrobatics +5, Perception +3, Stealth +5",senses:"Darkvision 60 ft., Passive Perception 13",lang:"None",traits:[]},
  Camel:{cr:0.125,ac:10,hp:17,speed:"50 ft",fly:false,stats:[15,8,17,2,11,5],atk:"Bite +4, 4 (1d4+2) bludgeoning",skills:"",senses:"Darkvision 60 ft., Passive Perception 10",lang:"None",traits:[]},
  "Giant Crab":{cr:0.125,ac:15,hp:13,speed:"30 ft, swim 30 ft",fly:false,stats:[13,13,11,1,9,3],atk:"Claw +3, 4 (1d6+1) bludgeoning, grapple DC 11 (two claws, each can grapple one target)",skills:"Stealth +3",senses:"Blindsight 30 ft., Passive Perception 9",lang:"None",traits:[["Amphibious","The crab can breathe air and water."]]},
  "Giant Weasel":{cr:0.125,ac:13,hp:9,speed:"40 ft, climb 30 ft",fly:false,stats:[11,17,10,4,12,5],atk:"Bite +5, 5 (1d4+3) piercing",skills:"Acrobatics +5, Perception +3, Stealth +5",senses:"Darkvision 60 ft., Passive Perception 13",lang:"None",traits:[]},
  Mastiff:{cr:0.125,ac:12,hp:5,speed:"40 ft",fly:false,stats:[13,14,12,3,12,7],atk:"Bite +3, 4 (1d6+1) piercing, Prone if Medium or smaller",skills:"Perception +5",senses:"Darkvision 60 ft., Passive Perception 15",lang:"None",traits:[]},
  Mule:{cr:0.125,ac:10,hp:11,speed:"40 ft",fly:false,stats:[14,10,13,2,10,5],atk:"Hooves +4, 4 (1d4+2) bludgeoning",skills:"",senses:"Passive Perception 10",lang:"None",traits:[["Beast of Burden","The mule counts as one size larger for the purpose of determining its carrying capacity."]]},
  Pony:{cr:0.125,ac:10,hp:11,speed:"40 ft",fly:false,stats:[15,10,13,2,11,7],atk:"Hooves +4, 4 (1d4+2) bludgeoning",skills:"",senses:"Passive Perception 10",lang:"None",traits:[]},
  "Venomous Snake":{cr:0.125,ac:12,hp:5,speed:"30 ft, swim 30 ft",fly:false,stats:[2,15,11,1,10,3],atk:"Bite +4, 4 (1d4+2) piercing + 3 (1d6) poison",skills:"",senses:"Blindsight 10 ft., Passive Perception 10",lang:"None",traits:[]},
  Boar:{cr:0.25,ac:11,hp:13,speed:"40 ft",fly:false,stats:[13,11,14,2,9,5],atk:"Gore +3, 4 (1d6+1) piercing (+3, 1d6, and Prone on Large-or-smaller if it charged 20+ ft)",skills:"",senses:"Passive Perception 9",lang:"None",traits:[["Bloodied Fury","While Bloodied, the boar has Advantage on attack rolls."]]},
  "Constrictor Snake":{cr:0.25,ac:13,hp:13,speed:"30 ft, swim 30 ft",fly:false,stats:[15,14,12,1,10,3],atk:"Bite +4, 6 (1d8+2) piercing; Constrict: STR save DC 12 (Medium or smaller), 7 (3d4) bludgeoning + Grapple",skills:"Perception +2, Stealth +4",senses:"Blindsight 10 ft., Passive Perception 12",lang:"None",traits:[]},
  "Draft Horse":{cr:0.25,ac:10,hp:15,speed:"40 ft",fly:false,stats:[18,10,15,2,11,7],atk:"Hooves +6, 6 (1d4+4) bludgeoning",skills:"",senses:"Passive Perception 10",lang:"None",traits:[]},
  Elk:{cr:0.25,ac:10,hp:11,speed:"50 ft",fly:false,stats:[16,10,11,2,10,6],atk:"Ram +5, 6 (1d6+3) bludgeoning (+3, 1d6, and Prone on Huge-or-smaller if it charged 20+ ft)",skills:"Perception +2",senses:"Darkvision 60 ft., Passive Perception 12",lang:"None",traits:[]},
  "Giant Badger":{cr:0.25,ac:13,hp:15,speed:"30 ft, burrow 10 ft",fly:false,stats:[13,10,17,2,12,5],atk:"Bite +3, 6 (2d4+1) piercing",skills:"Perception +3",senses:"Darkvision 60 ft., Passive Perception 13",lang:"None",traits:[],resist:"Poison"},
  Panther:{cr:0.25,ac:12,hp:13,speed:"50 ft, climb 40 ft",fly:false,stats:[14,15,10,3,14,7],atk:"Multiattack (Pounce then uses Prowl); Pounce +4, 4 (1d4+2) slashing (7, 2d4+2 with Advantage)",skills:"Perception +4, Stealth +6",senses:"Darkvision 60 ft., Passive Perception 14",lang:"None",traits:[]},
  "Riding Horse":{cr:0.25,ac:11,hp:13,speed:"60 ft",fly:false,stats:[16,13,12,2,11,7],atk:"Hooves +5, 7 (1d8+3) bludgeoning",skills:"",senses:"Passive Perception 10",lang:"None",traits:[]},
  Wolf:{cr:0.25,ac:12,hp:11,speed:"40 ft",fly:false,stats:[14,15,12,3,12,6],atk:"Bite +4, 5 (1d6+2) piercing, Prone",skills:"Perception +5, Stealth +4",senses:"Darkvision 60 ft., Passive Perception 15",lang:"None",traits:[["Pack Tactics","The wolf has Advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."]]},
  Crocodile:{cr:0.5,ac:12,hp:13,speed:"20 ft, swim 30 ft",fly:false,stats:[15,10,13,2,10,5],atk:"Bite +4, 6 (1d8+2) piercing, Grapple DC 12 + Restrained if Medium or smaller",skills:"Stealth +2",senses:"Passive Perception 10",lang:"None",traits:[["Hold Breath","The crocodile can hold its breath for 1 hour."]]},
  "Giant Goat":{cr:0.5,ac:11,hp:19,speed:"40 ft, climb 30 ft",fly:false,stats:[17,13,12,3,12,6],atk:"Ram +5, 6 (1d6+3) bludgeoning (+5, 2d4, and Prone on Huge-or-smaller if it charged 20+ ft)",skills:"Perception +3",senses:"Darkvision 60 ft., Passive Perception 13",lang:"None",traits:[]},
  "Giant Seahorse":{cr:0.5,ac:14,hp:16,speed:"5 ft, swim 40 ft",fly:false,stats:[15,12,11,2,12,5],atk:"Ram +4, 9 (2d6+2) bludgeoning (11, 2d8+2 if it charged 20+ ft); Bonus: Bubble Dash (half Swim Speed, no OA, underwater)",skills:"",senses:"Passive Perception 11",lang:"None",traits:[["Water Breathing","The seahorse can breathe only underwater."]]},
  "Reef Shark":{cr:0.5,ac:12,hp:22,speed:"5 ft, swim 30 ft",fly:false,stats:[14,15,13,1,10,4],atk:"Bite +4, 7 (2d4+2) piercing",skills:"Perception +2",senses:"Blindsight 30 ft., Passive Perception 12",lang:"None",traits:[["Pack Tactics","Advantage on an attack roll against a creature if an ally (not Incapacitated) is within 5 feet of it."],["Water Breathing","The shark can breathe only underwater."]]},
  Warhorse:{cr:0.5,ac:11,hp:19,speed:"60 ft",fly:false,stats:[18,12,13,2,13,7],atk:"Hooves +6, 9 (2d4+4) bludgeoning (+5, 2d4, and Prone on Huge-or-smaller if it charged 20+ ft)",skills:"",senses:"Passive Perception 11",lang:"None",traits:[]},
  "Brown Bear":{cr:1,ac:11,hp:22,speed:"40 ft, climb 30 ft",fly:false,stats:[17,12,15,2,13,7],atk:"Multiattack (Bite + Claw); Bite +5, 7 (1d8+3) piercing; Claw +5, 5 (1d4+3) slashing, Prone if Huge or smaller",skills:"Perception +3",senses:"Darkvision 60 ft., Passive Perception 13",lang:"None",traits:[]},
  "Dire Wolf":{cr:1,ac:14,hp:22,speed:"50 ft",fly:false,stats:[17,15,15,3,12,7],atk:"Bite +5, 8 (1d10+3) piercing, Prone if Huge or smaller",skills:"Perception +5, Stealth +4",senses:"Darkvision 60 ft., Passive Perception 15",lang:"None",traits:[["Pack Tactics","Advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."]]},
  "Giant Spider":{cr:1,ac:14,hp:26,speed:"30 ft, climb 30 ft",fly:false,stats:[14,16,12,2,11,4],atk:"Bite +5, 7 (1d8+3) piercing + 7 (2d6) poison; Web (recharge 5-6): DEX save DC 13, Restrained by web (AC 10, HP 5, Vulnerable Fire, Immune Poison/Psychic)",skills:"Perception +4, Stealth +7",senses:"Darkvision 60 ft., Passive Perception 14",lang:"None",traits:[["Spider Climb","Can climb difficult surfaces, including along ceilings, without needing to make an ability check."],["Web Walker","Ignores movement restrictions caused by webs, and knows the location of any creature in contact with the same web."]]},
  Lion:{cr:1,ac:12,hp:22,speed:"50 ft",fly:false,stats:[17,15,11,3,12,8],atk:"Multiattack (2 Rend, replace one with Roar); Rend +5, 7 (1d8+3) slashing; Roar: WIS save DC 11 or Frightened 1 min (repeat save each turn)",skills:"Perception +3, Stealth +4",senses:"Darkvision 60 ft., Passive Perception 13",lang:"None",traits:[["Pack Tactics","Advantage on an attack roll against a creature if an ally (not Incapacitated) is within 5 feet of it."],["Running Leap","With a 10-ft running start, the lion can Long Jump up to 25 feet."]]},
  Tiger:{cr:1,ac:13,hp:22,speed:"40 ft",fly:false,stats:[17,16,14,3,12,8],atk:"Multiattack (Pounce then uses Prowl); Pounce +5, 6 (1d6+3) slashing (+3, 1d6, and Prone on Huge-or-smaller with Advantage)",skills:"Perception +3, Stealth +7",senses:"Darkvision 60 ft., Passive Perception 13",lang:"None",traits:[]},
};
// 2024 Druid Wild Shape gating by level: max CR and whether a Fly speed is allowed.
function wildShapeLimit(level){if(level>=8)return{cr:1,fly:true};if(level>=4)return{cr:0.5,fly:false};return{cr:0.25,fly:false};}
// PHB p.80 Beast Shapes table: Wild Shape uses scale 2/3/4 at levels 2/6/17; Known Forms scale 4/6/8 at levels 2/4/8.
function wildShapeUses(level){return level>=17?4:level>=6?3:2;}
function wildShapeKnownForms(level){return level>=8?8:level>=4?6:4;}
// 2024 Barbarian Rage table (PHB p.52): uses and bonus damage scale with level; recharges 1/Short Rest, all/Long Rest.
function barbarianRage(level){const rages=level>=17?6:level>=12?5:level>=6?4:level>=3?3:2;const dmg=level>=16?4:level>=9?3:2;return{rages,dmg};}
// Channel Divinity uses (PHB Cleric p.70: 2/6/18; Paladin p.109: 2/11).
function clericChannelDivinity(level){return level>=18?4:level>=6?3:2;}
function paladinChannelDivinity(level){return level>=11?3:2;}
// Sorcerer Sorcery Points (PHB p.140): equal to character level from level 2 onward.
function sorceryPoints(level){return level>=2?level:0;}
// Monk Focus Points (PHB p.101): equal to Monk level from level 2 onward.
function monkFocusPoints(level){return level>=2?level:0;}
// Fighter Second Wind uses (PHB p.91-92): 2 at level 1, 3 at level 4, 4 at level 9.
function fighterSecondWindUses(level){return level>=9?4:level>=4?3:2;}
// Bardic Inspiration (PHB p.58): uses = CHA mod (min 1), die d6/d8/d10/d12 at levels 1/5/10/15.
function bardicInspirationUses(cham){return Math.max(1,cham);}
function bardicInspirationDie(level){return level>=15?"d12":level>=10?"d10":level>=5?"d8":"d6";}
// Returns the class's primary trackable resource pool, or null if it has none of this kind.
const RESOURCE_DESC={
  Rage:["Bonus Action (no Heavy armor): melee Strength attacks deal bonus damage, you have Resistance to Bludgeoning/Piercing/Slashing damage, and Advantage on Strength checks and saves. Lasts 10 min; ends early if you go a turn without attacking or taking damage.","Bonus-handling (ingen tung rustning): nærkampsangreb med Strength giver bonus-skade, du har Resistance mod Bludgeoning/Piercing/Slashing-skade, og Advantage på Strength-tjek og -saves. Varer 10 min; ophører tidligt hvis du går en tur uden at angribe eller tage skade."],
  "Bardic Inspiration":["Bonus Action: give a creature within 60 ft a die it can add to one D20 Test, attack roll, or saving throw within the next hour.","Bonus-handling: giv et væsen inden for 60 ft en terning, det kan lægge til ét D20-test, angrebstjek eller saving throw inden for den næste time."],
  "Channel Divinity (Cleric)":["Magic action: channel divine energy to fuel a chosen effect — starts with Divine Spark (heal or deal Necrotic/Radiant damage) and Turn Undead (Frighten nearby Undead).","Magisk handling: kanaliser guddommelig energi til en valgt effekt — starter med Divine Spark (hel eller giv Necrotic/Radiant-skade) og Turn Undead (gør nærliggende Undead Frightened)."],
  "Channel Divinity (Paladin)":["Channel divine energy for a chosen effect — starts with Divine Sense (detect Celestials/Fiends/Undead); your Oath grants more options.","Kanaliser guddommelig energi til en valgt effekt — starter med Divine Sense (opdag Celestials/Fiends/Undead); dit Oath giver flere muligheder."],
  "Wild Shape":["Magic action: transform into a beast form you've prepared, gaining its game statistics while keeping your own mind, for up to a few hours.","Magisk handling: forvandl dig til en beast-form du har forberedt, og få dens spil-statistikker mens du beholder dit eget sind, i op til nogle få timer."],
  "Focus Points":["Spend to fuel Flurry of Blows (extra Unarmed Strikes), Patient Defense (Disengage+Dodge), Step of the Wind (Disengage+Dash, double jump), and other Monk features.","Brug til at drive Flurry of Blows (ekstra Unarmed Strikes), Patient Defense (Disengage+Dodge), Step of the Wind (Disengage+Dash, dobbelt spring), og andre Monk-evner."],
  "Sorcery Points":["Spend to fuel Metamagic options, or convert to/from spell slots (2 points = a level 1 slot, more for higher levels).","Brug til at drive Metamagic-muligheder, eller konverter til/fra spell-slots (2 points = en niveau 1-slot, flere for højere niveauer)."],
  "Second Wind":["Bonus Action: regain 1d10 plus your Fighter level in Hit Points.","Bonus-handling: genopret 1d10 plus dit Fighter-niveau i Hit Points."],
};
function classResource(cn,level,cham){
  if(cn==="Barbarian"){const r=barbarianRage(level);return{name:"Rage",uses:r.rages,note:"+"+r.dmg+" dmg",recharge:"1/Short Rest, all/Long Rest",desc:RESOURCE_DESC.Rage};}
  if(cn==="Bard")return{name:"Bardic Inspiration",uses:bardicInspirationUses(cham),note:bardicInspirationDie(level),recharge:"all/Long Rest",desc:RESOURCE_DESC["Bardic Inspiration"]};
  if(cn==="Cleric"&&level>=2)return{name:"Channel Divinity",uses:clericChannelDivinity(level),recharge:"1/Short Rest, all/Long Rest",desc:RESOURCE_DESC["Channel Divinity (Cleric)"]};
  if(cn==="Paladin"&&level>=3)return{name:"Channel Divinity",uses:paladinChannelDivinity(level),recharge:"1/Short Rest, all/Long Rest",desc:RESOURCE_DESC["Channel Divinity (Paladin)"]};
  if(cn==="Druid"&&level>=2)return{name:"Wild Shape",uses:wildShapeUses(level),recharge:"all/Short or Long Rest",desc:RESOURCE_DESC["Wild Shape"]};
  if(cn==="Monk"&&level>=2)return{name:"Focus Points",uses:monkFocusPoints(level),recharge:"all/Short or Long Rest",desc:RESOURCE_DESC["Focus Points"]};
  if(cn==="Sorcerer"&&level>=2)return{name:"Sorcery Points",uses:sorceryPoints(level),recharge:"all/Long Rest",desc:RESOURCE_DESC["Sorcery Points"]};
  if(cn==="Fighter")return{name:"Second Wind",uses:fighterSecondWindUses(level),note:"1d10+"+level+" HP",recharge:"1/Short Rest, all/Long Rest",desc:RESOURCE_DESC["Second Wind"]};
  return null;
}
// 2024 Weapon Mastery slot counts by class and level (PHB feature tables) — confirmed against the book.
function weaponMasterySlots(cn,level){
  if(cn==="Barbarian")return level>=10?4:level>=4?3:2;
  if(cn==="Fighter")return level>=16?6:level>=10?5:level>=4?4:3;
  return MASTERY_SLOTS[cn]||0; // other classes: not yet confirmed against the book, keep the flat value
}
const STANDARD_LANGUAGES=["Common","Common Sign Language","Draconic","Dwarvish","Elvish","Giant","Gnomish","Goblin","Halfling","Orc"];
const RARE_LANGUAGES=["Abyssal","Celestial","Deep Speech","Druidic","Infernal","Primordial","Sylvan","Thieves' Cant","Undercommon"];

const AB=["STR","DEX","CON","INT","WIS","CHA"];
const AB_FULL={STR:"Strength",DEX:"Dexterity",CON:"Constitution",INT:"Intelligence",WIS:"Wisdom",CHA:"Charisma"};
const SKILL_LIST=[{name:"Acrobatics",ab:"DEX"},{name:"Animal Handling",ab:"WIS"},{name:"Arcana",ab:"INT"},{name:"Athletics",ab:"STR"},{name:"Deception",ab:"CHA"},{name:"History",ab:"INT"},{name:"Insight",ab:"WIS"},{name:"Intimidation",ab:"CHA"},{name:"Investigation",ab:"INT"},{name:"Medicine",ab:"WIS"},{name:"Nature",ab:"INT"},{name:"Perception",ab:"WIS"},{name:"Performance",ab:"CHA"},{name:"Persuasion",ab:"CHA"},{name:"Religion",ab:"INT"},{name:"Sleight of Hand",ab:"DEX"},{name:"Stealth",ab:"DEX"},{name:"Survival",ab:"WIS"}];

const SPECIES={
  Human:{speed:30,languages:["Common","One extra"],traits:["Resourceful","Skillful","Versatile"],racialFeats:["Skilled","Alert","Lucky","Tough","Magic Initiate"]},
  Elf:{speed:30,languages:["Common","Elvish"],traits:["Darkvision 60 ft","Elven Lineage","Fey Ancestry","Keen Senses","Trance"],racialFeats:["Elven Accuracy","Fey Teleportation","Wood Elf Magic","High Elf Cantrip"]},
  Dwarf:{speed:30,languages:["Common","Dwarvish"],traits:["Darkvision 120 ft","Dwarven Resilience","Dwarven Toughness","Stonecunning","Tool Proficiency"],racialFeats:["Dwarven Fortitude","Squat Nimbleness","Durable"]},
  Halfling:{speed:30,languages:["Common","Halfling"],traits:["Brave","Halfling Nimbleness","Lucky","Naturally Stealthy"],racialFeats:["Bountiful Luck","Second Chance","Squat Nimbleness"]},
  Orc:{speed:30,languages:["Common","Orc"],traits:["Adrenaline Rush","Darkvision 120 ft","Powerful Build","Relentless Endurance"],racialFeats:["Orcish Fury","Squat Nimbleness","Durable"]},
  Goliath:{speed:35,languages:["Common","Giant"],traits:["Giant Ancestry","Large Form","Powerful Build"],racialFeats:["Squat Nimbleness","Tough","Alert"]},
  Gnome:{speed:30,languages:["Common","Gnomish"],traits:["Darkvision 60 ft","Gnomish Cunning","Gnomish Lineage"],racialFeats:["Fade Away","Squat Nimbleness","Skilled"]},
  Tiefling:{speed:30,languages:["Common","Infernal"],traits:["Darkvision 60 ft","Fiendish Legacy","Otherworldly Presence"],racialFeats:["Flames of Phlegethos","Infernal Constitution","Magic Initiate"]},
  Dragonborn:{speed:30,languages:["Common","Draconic"],traits:["Draconic Ancestry","Breath Weapon","Damage Resistance"],racialFeats:["Dragon Fear","Dragon Hide","Skilled"]},
  Aasimar:{speed:30,languages:["Common","Celestial"],traits:["Celestial Revelation","Darkvision 60 ft","Healing Hands","Light Bearer"],racialFeats:["Magic Initiate","Skilled","Tough"]}
};

const MASTERY_SLOTS={Barbarian:2,Bard:0,Cleric:0,Druid:0,Fighter:3,Monk:2,Paladin:2,Ranger:2,Rogue:2,Sorcerer:0,Warlock:0,Wizard:0};
const MASTERY_DESC={
  Cleave:"Once per turn, if you hit a creature, you can make an extra attack roll against another creature within 5 feet of the first and within your reach.",
  Graze:"If your attack roll misses, you can deal damage equal to the ability modifier used for the attack.",
  Nick:"When you make the extra attack from the Light property, you can make it as part of the Attack action instead of as a Bonus Action.",
  Push:"If you hit a Large or smaller creature, you can push it up to 10 feet straight away from you.",
  Sap:"If you hit a creature, that creature has Disadvantage on its next attack roll before the start of your next turn.",
  Slow:"If you hit a creature and deal damage, you can reduce its Speed by 10 feet until the start of your next turn.",
  Topple:"If you hit a creature, you can force it to make a Constitution saving throw or have the Prone condition.",
  Vex:"If you hit a creature, you have Advantage on your next attack roll against that creature before the end of your next turn.",
  Entangle:"Special: target is restrained. See Net weapon rules."
};
const MASTERY_DESC_DA={
  Cleave:"Én gang pr. tur, hvis du rammer et væsen, kan du udføre et ekstra angrebstjek mod et andet væsen inden for 5 ft af det første og inden for din rækkevidde.",
  Graze:"Hvis dit angrebstjek er forbi, kan du give skade svarende til det evne-modifier der blev brugt til angrebet.",
  Nick:"Når du udfører det ekstra angreb fra Light-egenskaben, kan du gøre det som del af Attack-handlingen i stedet for som en bonus-handling.",
  Push:"Hvis du rammer et Large-eller-mindre væsen, kan du skubbe det op til 10 ft direkte væk fra dig.",
  Sap:"Hvis du rammer et væsen, får det væsen Disadvantage på sit næste angrebstjek indtil starten af din næste tur.",
  Slow:"Hvis du rammer et væsen og giver skade, kan du reducere dets Speed med 10 ft indtil starten af din næste tur.",
  Topple:"Hvis du rammer et væsen, kan du tvinge det til at lave et Constitution saving throw eller få Prone.",
  Vex:"Hvis du rammer et væsen, har du Advantage på dit næste angrebstjek mod det væsen inden slutningen af din næste tur.",
  Entangle:"Særlig: målet bliver Restrained. Se Net-våbnets regler."
};

const CLASS_DEFAULTS={Barbarian:{armor:null,shield:false,weapon:"Greataxe"},Bard:{armor:"Leather armor",shield:false,weapon:"Rapier"},Cleric:{armor:"Chain shirt",shield:true,weapon:"Mace"},Druid:{armor:"Leather armor",shield:true,weapon:"Scimitar"},Fighter:{armor:"Chain mail",shield:true,weapon:"Longsword"},Monk:{armor:null,shield:false,weapon:"Shortsword"},Paladin:{armor:"Chain mail",shield:true,weapon:"Longsword"},Ranger:{armor:"Scale mail",shield:false,weapon:"Shortsword"},Rogue:{armor:"Leather armor",shield:false,weapon:"Rapier"},Sorcerer:{armor:null,shield:false,weapon:"Dagger"},Warlock:{armor:"Leather armor",shield:false,weapon:"Dagger"},Wizard:{armor:null,shield:false,weapon:"Quarterstaff"}};

const CLASSES={
  Barbarian:{hd:12,pri:["STR","CON","DEX"],saves:["STR","CON"],armor:"Light, medium, shields",weapons:"Simple and martial",sc:["Animal Handling","Athletics","Intimidation","Nature","Perception","Survival"],ns:2,role:"Frontline bruiser",features:["Unarmored Defense AC=10+DEX+CON","Weapon Mastery","Reckless Attack Lvl2","Danger Sense Lvl2","Primal Knowledge Lvl3","Subclass Lvl3"],classFeatChoices:["Great Weapon Master","Tough","Sentinel","Tavern Brawler","Alert"]},
  Bard:{hd:8,pri:["CHA","DEX","CON"],saves:["DEX","CHA"],armor:"Light",weapons:"Simple",sc:SKILL_LIST.map(s=>s.name),ns:3,role:"Social caster and support",features:["Bardic Inspiration CHA mod/long rest","Expertise Lvl3","Jack of All Trades Lvl2","Subclass Lvl3"],classFeatChoices:["War Caster","Resilient","Lucky","Inspiring Leader","Skilled"]},
  Cleric:{hd:8,pri:["WIS","CON","STR"],saves:["WIS","CHA"],armor:"Light, medium, shields",weapons:"Simple",sc:["History","Insight","Medicine","Persuasion","Religion"],ns:2,role:"Divine caster and healer",features:["Divine Order Lvl1","Subclass Lvl3","Channel Divinity","Blessed Strikes Lvl7"],classFeatChoices:["War Caster","Resilient","Lucky","Inspiring Leader","Sentinel"]},
  Druid:{hd:8,pri:["WIS","CON","INT"],saves:["INT","WIS"],armor:"Light, medium, shields (no metal)",weapons:"Simple",sc:["Animal Handling","Arcana","Insight","Medicine","Nature","Perception","Religion","Survival"],ns:2,role:"Nature caster and controller",features:["Druidic language","Primal Order Lvl1","Wild Shape Lvl2","Subclass Lvl3"],classFeatChoices:["War Caster","Resilient","Tough","Lucky","Mobile"]},
  Fighter:{hd:10,pri:["STR","CON","DEX"],saves:["STR","CON"],armor:"All armor, shields",weapons:"Simple and martial",sc:["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Perception","Survival"],ns:2,role:"Weapon specialist",features:["Fighting Style Lvl1","Second Wind Lvl1","Weapon Mastery","Action Surge Lvl2","Subclass Lvl3","Extra Attack Lvl5"],classFeatChoices:["Great Weapon Master","Sharpshooter","Sentinel","War Caster","Alert","Tough","Mobile"]},
  Monk:{hd:8,pri:["DEX","WIS","CON"],saves:["STR","DEX"],armor:"None",weapons:"Simple and monk weapons",sc:["Acrobatics","Athletics","History","Insight","Religion","Stealth"],ns:2,role:"Mobile martial artist",features:["Martial Arts Lvl1","Unarmored Defense AC=10+DEX+WIS","Weapon Mastery x2","Monks Focus Lvl2","Subclass Lvl3","Stunning Strike Lvl5"],classFeatChoices:["Mobile","Alert","War Caster","Tough","Resilient"]},
  Paladin:{hd:10,pri:["STR","CHA","CON"],saves:["WIS","CHA"],armor:"All armor, shields",weapons:"Simple and martial",sc:["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"],ns:2,role:"Holy warrior",features:["Lay on Hands 5x level HP","Spellcasting CHA Lvl1","Weapon Mastery x2","Divine Smite Lvl2","Subclass Lvl3","Aura of Protection Lvl6"],classFeatChoices:["Sentinel","War Caster","Great Weapon Master","Inspiring Leader","Tough"]},
  Ranger:{hd:10,pri:["DEX","WIS","CON"],saves:["STR","DEX"],armor:"Light, medium, shields",weapons:"Simple and martial",sc:["Animal Handling","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"],ns:3,role:"Scout and striker",features:["Spellcasting WIS Lvl1","Weapon Mastery x2","Deft Explorer Lvl1","Favored Enemy Lvl1","Subclass Lvl3","Extra Attack Lvl5"],classFeatChoices:["Sharpshooter","Alert","Mobile","Resilient","Tough"]},
  Rogue:{hd:8,pri:["DEX","INT","CHA"],saves:["DEX","INT"],armor:"Light",weapons:"Simple and finesse",sc:["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Performance","Persuasion","Sleight of Hand","Stealth"],ns:4,role:"Skill expert and precision striker",features:["Expertise Lvl1","Sneak Attack 1d6 per 2 levels","Thieves Cant","Weapon Mastery x2","Cunning Action Lvl2","Subclass Lvl3","Uncanny Dodge Lvl5"],classFeatChoices:["Alert","Mobile","Lucky","Skulker","Sharpshooter","Tough"]},
  Sorcerer:{hd:6,pri:["CHA","CON","DEX"],saves:["CON","CHA"],armor:"None",weapons:"Simple",sc:["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"],ns:2,role:"Innate arcane caster",features:["Spellcasting CHA","Innate Sorcery Lvl1","Subclass Lvl3","Font of Magic Lvl2","Metamagic Lvl3"],classFeatChoices:["War Caster","Resilient","Tough","Lucky","Spell Sniper"]},
  Warlock:{hd:8,pri:["CHA","CON","DEX"],saves:["WIS","CHA"],armor:"Light",weapons:"Simple",sc:["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"],ns:2,role:"Pact-based caster",features:["Eldritch Invocations Lvl1","Pact Magic short rest recharge","Magical Cunning Lvl2","Subclass Lvl3","Pact Boon Lvl3"],classFeatChoices:["War Caster","Resilient","Tough","Lucky","Alert"]},
  Wizard:{hd:6,pri:["INT","CON","DEX"],saves:["INT","WIS"],armor:"None",weapons:"Simple",sc:["Arcana","History","Insight","Investigation","Medicine","Religion"],ns:2,role:"Prepared arcane caster",features:["Spellcasting INT prepare INT+level","Arcane Recovery 1/long rest","Subclass Lvl3","Spell Mastery Lvl18"],classFeatChoices:["War Caster","Resilient","Spell Sniper","Lucky","Alert","Tough"]},
};

// 2024 PHB backgrounds. Each gives: 2 skills, 1 tool prof, 1 Origin Feat (RAW fixed).
// ab[] = the three abilities the player distributes +2/+1 or +1/+1/+1 among (RAW 2024).
// feat = the ONE Origin Feat granted by this background (RAW).
// originFeats removed — the single feat[] value IS the RAW origin feat.
const BGS={
  Acolyte:{ab:["INT","WIS","CHA"],feat:"Magic Initiate (Cleric)",sk:["Insight","Religion"],tools:"Calligrapher's Supplies",flavor:"Temple, faith, doctrine, forbidden relics."},
  Artisan:{ab:["STR","DEX","INT"],feat:"Crafter",sk:["Investigation","Persuasion"],tools:"Artisan's Tools (one type)",flavor:"Workshop, trade, debt, masterpiece."},
  Charlatan:{ab:["DEX","CON","CHA"],feat:"Skilled",sk:["Deception","Sleight of Hand"],tools:"Forgery Kit",flavor:"Cons, disguises, false identities."},
  Criminal:{ab:["DEX","CON","INT"],feat:"Alert",sk:["Sleight of Hand","Stealth"],tools:"Thieves' Tools",flavor:"Contacts, old crimes, blackmail, coded signals."},
  Entertainer:{ab:["STR","DEX","CHA"],feat:"Musician",sk:["Acrobatics","Performance"],tools:"Musical Instrument (one type)",flavor:"Stage, crowd, fame, rivalry."},
  Farmer:{ab:["STR","CON","WIS"],feat:"Tough",sk:["Animal Handling","Nature"],tools:"Carpenter's Tools",flavor:"Land, harvest, community, hard seasons."},
  Guard:{ab:["STR","INT","WIS"],feat:"Alert",sk:["Athletics","Perception"],tools:"Gaming Set (one type)",flavor:"Watch duty, city gates, old case, corrupt captain."},
  Guide:{ab:["DEX","CON","WIS"],feat:"Magic Initiate (Druid)",sk:["Stealth","Survival"],tools:"Cartographer's Tools",flavor:"Roads, maps, weather, lost paths."},
  Hermit:{ab:["CON","WIS","CHA"],feat:"Healer",sk:["Medicine","Religion"],tools:"Herbalism Kit",flavor:"Revelation, isolation, strange omen."},
  Merchant:{ab:["CON","INT","CHA"],feat:"Lucky",sk:["Animal Handling","Persuasion"],tools:"Navigator's Tools",flavor:"Caravans, trade routes, profit and loss."},
  Noble:{ab:["STR","INT","CHA"],feat:"Skilled",sk:["History","Persuasion"],tools:"Gaming Set (one type)",flavor:"Inheritance, scandal, family obligation."},
  Sage:{ab:["CON","INT","WIS"],feat:"Magic Initiate (Wizard)",sk:["Arcana","History"],tools:"Calligrapher's Supplies",flavor:"Libraries, lost facts, dangerous theories."},
  Sailor:{ab:["STR","DEX","WIS"],feat:"Tavern Brawler",sk:["Acrobatics","Perception"],tools:"Navigator's Tools",flavor:"Storms, ports, mutiny, sea debts."},
  Scribe:{ab:["DEX","INT","WIS"],feat:"Skilled",sk:["Investigation","Perception"],tools:"Calligrapher's Supplies",flavor:"Records, messages, hidden knowledge."},
  Soldier:{ab:["STR","DEX","CON"],feat:"Savage Attacker",sk:["Athletics","Intimidation"],tools:"Gaming Set (one type)",flavor:"Campaign scars, command structure, old enemy."},
  Wayfarer:{ab:["DEX","WIS","CHA"],feat:"Lucky",sk:["Insight","Stealth"],tools:"Thieves' Tools",flavor:"Roads, odd jobs, living day to day."},
};

const STD=[15,14,13,12,10,8];
const NAMES={
  Human:   {f:["Mara","Elias","Sigrid","Tomas","Brynn","Aldric","Isolde","Cedric","Rowena","Gareth","Lysa","Owen","Freya","Edric","Nora","Brennan","Sable","Hugo","Wren","Aldous"],l:["Thorn","Vane","Vale","Redwick","Ashford","Hollow","Crane","Dusk","Merrow","Fenn","Blackwell","Storme","Holt","Greystone","Aldgate","Fenwick","Dunmore","Rook","Wrath","Coldwell"]},
  Elf:     {f:["Aelion","Vaeris","Liarel","Thalanil","Sylara","Eryn","Caladwen","Ithrien","Mirel","Faeron","Thessaly","Aerindel","Corin","Lirael","Vayne","Ilyana","Sorel","Thandor","Nymara","Elaris"],l:["Duskleaf","Moonbrook","Starling","Greywind","Silverbow","Dawnmere","Ashwhisper","Crystalveil","Twilightfall","Emberveil","Gladewatch","Moonshadow","Starbough","Willowsong","Misthollow","Faebranch","Silversong","Sunspire","Leafwhisper","Nightbloom"]},
  Dwarf:   {f:["Bruni","Hilda","Dorin","Kara","Thordak","Mira","Baldur","Sigrun","Borgin","Helga","Dvalin","Inga","Thorvi","Omund","Ragna","Gimrak","Ulfhild","Balin","Skadi","Nori"],l:["Ironkeg","Stonehand","Emberbeard","Deepdelve","Forgehammer","Coppermantle","Stonebrew","Ironvault","Boulderback","Gravelfist","Deeprock","Anvilborn","Cragmantle","Stormforge","Goldseam","Ashpick","Ironhelm","Flintwall","Deepstone","Runebreak"]},
  Halfling:{f:["Pip","Mira","Tobbin","Nessa","Calla","Merric","Lidda","Tam","Rosie","Beau","Daisy","Finnan","Willa","Corwin","Nell","Jasper","Portia","Rondo","Tansy","Bilbin"],l:["Underbough","Tealeaf","Goodbarrel","Quickstep","Thistledown","Hearthwick","Bramblefoot","Cloverhatch","Muddyboots","Sunpetal","Fernweave","Copperkettle","Woolhaven","Greenhill","Snugmeadow","Barleymalt","Dustyboot","Willowwick","Haystone","Pipworth"]},
  Orc:     {f:["Rogh","Mauga","Urzha","Gorren","Kragg","Yelka","Thurak","Vorgha","Skrag","Bolga","Draka","Murzok","Sharva","Nuruk","Brega","Kolgha","Wroth","Targh","Mezra","Gruul"],l:["Stonejaw","Ashhand","Bloodrain","Blacktusk","Bonebreak","Ironhide","Skullscar","Grimfang","Ashfist","Thundertusk","Ravenclaw","Bloodmaw","Crushbone","Ironskull","Darkpelt","Stonefist","Blackbrand","Grimtooth","Warborn","Deathmarch"]},
  Goliath: {f:["Kava","Thuun","Maku","Agan","Voro","Iliana","Nora","Tavrak","Brynn","Keothi","Pava","Torinn","Nala","Denara","Vamik","Ostin","Uthal","Hadak","Tora","Golen"],l:["Stonewake","Skybreaker","Flintstride","Cloudscar","Mountainborn","Glacierfist","Stormcrown","Peakwalker","Boulderborn","Ironridge","Cliffmantle","Coldpeak","Frostback","Stoneshout","Snowmantle","Avalanche","Granite","Iceborn","Rimestone","Highcrest"]},
  Gnome:   {f:["Fizban","Zook","Nyx","Bim","Ellywick","Namfoodle","Waywocket","Dabbledob","Roondar","Vik","Carlin","Pock","Meren","Sindri","Alston","Dimble","Orla","Fonkin","Caramip","Seebo"],l:["Glimmer","Sparkwhistle","Tinkbell","Cogsworth","Brasswheel","Clocksprig","Sprocketwist","Gearglint","Tumblebolt","Whistlewick","Fizzlepop","Gadgetgrin","Coppercoil","Mirrorwink","Ratchetwhirl","Springsnap","Shimmerbell","Coppernib","Dazzlewick","Glintspring"]},
  Tiefling:{f:["Zariel","Mephi","Lilit","Xan","Mordai","Raven","Caeus","Selene","Nox","Damaia","Kryx","Immarel","Akmenos","Nemeia","Skamos","Bryseis","Leucis","Kairon","Melech","Tanith"],l:["Ash","Vorne","Darkrose","Hellbrand","Emberveil","Shadowmantle","Cinderborn","Ashveil","Duskfire","Voidborn","Flamemark","Scornhide","Nightfall","Soulbrand","Grimhalo","Emberscar","Shadowveil","Dreadborn","Hellscar","Cursemark"]},
  Dragonborn:{f:["Balasar","Sora","Kriv","Thava","Arjhan","Donaar","Ghesh","Mishann","Nadarr","Patrin","Rhogar","Shamash","Torinn","Uadjit","Vrynn","Heskan","Irkwood","Nala","Bharash","Akra"],l:["Flamescale","Frostbreath","Ironscale","Goldmaw","Emberclaw","Thunderwing","Ashmantle","Stormscale","Crimsonfang","Iceborn","Obsidianback","Copperflame","Bronzewing","Silverfang","Rubyspine","Shadowscale","Frostmantle","Emberfang","Ironclaw","Cinderborn"]},
  Aasimar: {f:["Solara","Aether","Lumis","Celeste","Oryn","Seraphel","Aurel","Mirel","Dawniel","Elios","Caelum","Viriel","Althar","Soryn","Radiel","Vaelos","Lynara","Thyrin","Eorel","Zephira"],l:["Brightmantle","Dawnveil","Grace","Halo","Lightborn","Goldenheart","Dawnfire","Celestborn","Auraveil","Holymark","Starborn","Divinewing","Radianceborn","Purelight","Sacredsong","Haloborn","Gleamborn","Brightspire","Soulfire","Dawncrown"]},
};
function pickName(race){const n=NAMES[race];if(!n)return"Adventurer";const pick=a=>a[Math.floor(Math.random()*a.length)];return pick(n.f)+" "+pick(n.l);}
// total combinations per race: 20 × 20 = 400 — across 10 races: 4 000 unique names

const CASTER_TYPE={Bard:"full",Cleric:"full",Druid:"full",Sorcerer:"full",Wizard:"full",Paladin:"half",Ranger:"half",Warlock:"warlock"};
const CTYPE=CASTER_TYPE;
const SAB={Bard:"CHA",Cleric:"WIS",Druid:"WIS",Sorcerer:"CHA",Wizard:"INT",Warlock:"CHA",Paladin:"CHA",Ranger:"WIS"};
const MC_SLOTS=[null,[2,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],[4,2,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],[4,3,2,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],[4,3,3,3,1,0,0,0,0],[4,3,3,3,2,0,0,0,0],[4,3,3,3,2,1,0,0,0],[4,3,3,3,2,1,0,0,0],[4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,1,0],[4,3,3,3,2,1,1,1,0],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]];
// 2024: full casters contribute full levels; half-casters (Paladin/Ranger) contribute ceil(levels/2).
// Warlock Pact Magic slots are separate and don't combine with other slots.
function calcCasterLevel(cn,lvl){const t=CASTER_TYPE[cn];if(t==="full")return lvl;if(t==="half")return Math.ceil(lvl/2);return 0;}
function calcMulticlassSlots(cn1,lv1,cn2,lv2){const total=Math.min(20,calcCasterLevel(cn1,lv1)+calcCasterLevel(cn2,lv2));return MC_SLOTS[total]||Array(9).fill(0);}

const SS={full:[null,[2,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],[4,2,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],[4,3,2,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],[4,3,3,3,1,0,0,0,0],[4,3,3,3,2,0,0,0,0],[4,3,3,3,2,1,0,0,0],[4,3,3,3,2,1,0,0,0],[4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,1,0],[4,3,3,3,2,1,1,1,0],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]],half:[null,[0,0,0,0,0,0,0,0,0],[2,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],[4,2,0,0,0,0,0,0,0],[4,2,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],[4,3,2,0,0,0,0,0,0],[4,3,2,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],[4,3,3,3,1,0,0,0,0],[4,3,3,3,1,0,0,0,0],[4,3,3,3,2,0,0,0,0],[4,3,3,3,2,0,0,0,0]],warlock:[null,[1,0,0,0,0],[1,0,0,0,0],[2,0,0,0,0],[2,0,0,0,0],[2,0,0,0,0],[2,0,0,0,0],[2,0,0,0,0],[2,0,0,0,0],[2,0,0,0,0],[2,0,0,0,0],[3,0,0,0,0],[3,0,0,0,0],[3,0,0,0,0],[3,0,0,0,0],[3,0,0,0,0],[3,0,0,0,0],[4,0,0,0,0],[4,0,0,0,0],[4,0,0,0,0],[4,0,0,0,0]]};

const WD={
  Club:{dmg:"1d4",ab:"STR",pr:"Light",type:"simple",mastery:"Slow"},Dagger:{dmg:"1d4",ab:"fin",pr:"Finesse, light, thrown (20/60)",type:"simple",mastery:"Nick"},Greatclub:{dmg:"1d8",ab:"STR",pr:"Two-handed",type:"simple",mastery:"Push"},Handaxe:{dmg:"1d6",ab:"STR",pr:"Light, thrown (20/60)",type:"simple",mastery:"Vex"},Javelin:{dmg:"1d6",ab:"STR",pr:"Thrown (30/120)",type:"simple",mastery:"Slow"},"Light hammer":{dmg:"1d4",ab:"STR",pr:"Light, thrown (20/60)",type:"simple",mastery:"Nick"},Mace:{dmg:"1d6",ab:"STR",pr:"—",type:"simple",mastery:"Sap"},Quarterstaff:{dmg:"1d6",ab:"STR",pr:"Versatile (1d8)",type:"simple",mastery:"Topple"},Sickle:{dmg:"1d4",ab:"fin",pr:"Finesse, light",type:"simple",mastery:"Nick"},Spear:{dmg:"1d6",ab:"STR",pr:"Thrown (20/60), versatile (1d8)",type:"simple",mastery:"Sap"},"Unarmed strike":{dmg:"1",ab:"STR",pr:"—",type:"simple",mastery:"—"},"Light crossbow":{dmg:"1d8",ab:"DEX",pr:"Ammunition, loading, two-handed (80/320)",type:"simple",mastery:"Slow"},Dart:{dmg:"1d4",ab:"fin",pr:"Finesse, thrown (20/60)",type:"simple",mastery:"Vex"},Shortbow:{dmg:"1d6",ab:"DEX",pr:"Ammunition, two-handed (80/320)",type:"simple",mastery:"Vex"},Sling:{dmg:"1d4",ab:"DEX",pr:"Ammunition (30/120)",type:"simple",mastery:"Slow"},Battleaxe:{dmg:"1d8",ab:"STR",pr:"Versatile (1d10)",type:"martial",mastery:"Topple"},Flail:{dmg:"1d8",ab:"STR",pr:"—",type:"martial",mastery:"Sap"},Glaive:{dmg:"1d10",ab:"STR",pr:"Heavy, reach, two-handed",type:"martial",mastery:"Graze"},Greataxe:{dmg:"1d12",ab:"STR",pr:"Heavy, two-handed",type:"martial",mastery:"Cleave"},Greatsword:{dmg:"2d6",ab:"STR",pr:"Heavy, two-handed",type:"martial",mastery:"Graze"},Halberd:{dmg:"1d10",ab:"STR",pr:"Heavy, reach, two-handed",type:"martial",mastery:"Cleave"},Lance:{dmg:"1d10",ab:"STR",pr:"Heavy, reach, two-handed (unless mounted)",type:"martial",mastery:"Topple"},Longsword:{dmg:"1d8",ab:"STR",pr:"Versatile (1d10)",type:"martial",mastery:"Sap"},Maul:{dmg:"2d6",ab:"STR",pr:"Heavy, two-handed",type:"martial",mastery:"Topple"},Morningstar:{dmg:"1d8",ab:"STR",pr:"—",type:"martial",mastery:"Sap"},Pike:{dmg:"1d10",ab:"STR",pr:"Heavy, reach, two-handed",type:"martial",mastery:"Push"},Rapier:{dmg:"1d8",ab:"fin",pr:"Finesse",type:"martial",mastery:"Vex"},Scimitar:{dmg:"1d6",ab:"fin",pr:"Finesse, light",type:"martial",mastery:"Nick"},Shortsword:{dmg:"1d6",ab:"fin",pr:"Finesse, light",type:"martial",mastery:"Vex"},Trident:{dmg:"1d8",ab:"STR",pr:"Thrown (20/60), versatile (1d10)",type:"martial",mastery:"Topple"},"War pick":{dmg:"1d8",ab:"STR",pr:"—",type:"martial",mastery:"Sap"},Warhammer:{dmg:"1d8",ab:"STR",pr:"Versatile (1d10)",type:"martial",mastery:"Push"},Whip:{dmg:"1d4",ab:"fin",pr:"Finesse, reach",type:"martial",mastery:"Slow"},Blowgun:{dmg:"1",ab:"DEX",pr:"Ammunition, loading (25/100)",type:"martial",mastery:"Vex"},"Hand crossbow":{dmg:"1d6",ab:"DEX",pr:"Ammunition, light, loading (30/120)",type:"martial",mastery:"Vex"},"Heavy crossbow":{dmg:"1d10",ab:"DEX",pr:"Ammunition, heavy, loading, two-handed (100/400)",type:"martial",mastery:"Push"},Longbow:{dmg:"1d8",ab:"DEX",pr:"Ammunition, heavy, two-handed (150/600)",type:"martial",mastery:"Slow"},Net:{dmg:"—",ab:"DEX",pr:"Special, thrown (5/15)",type:"martial",mastery:"Entangle"},
};

const ARMOR_ITEMS={"Padded armor":{acFn:d=>11+d,light:true,stealth:"Disadvantage"},"Leather armor":{acFn:d=>11+d,light:true},"Studded leather":{acFn:d=>12+d,light:true},"Hide armor":{acFn:d=>12+Math.min(d,2),medium:true},"Chain shirt":{acFn:d=>13+Math.min(d,2),medium:true},"Scale mail":{acFn:d=>14+Math.min(d,2),medium:true,stealth:"Disadvantage"},"Breastplate":{acFn:d=>14+Math.min(d,2),medium:true},"Half plate":{acFn:d=>15+Math.min(d,2),medium:true,stealth:"Disadvantage"},"Ring mail":{ac:14,heavy:true,stealth:"Disadvantage"},"Chain mail":{ac:16,heavy:true,stealth:"Disadvantage",str:13},"Splint armor":{ac:17,heavy:true,stealth:"Disadvantage",str:15},"Plate armor":{ac:18,heavy:true,stealth:"Disadvantage",str:15}};
const ARMOR_PROF={Barbarian:["light","medium","shield"],Bard:["light"],Cleric:["light","medium","shield"],Druid:["light","medium","shield"],Fighter:["light","medium","heavy","shield"],Monk:[],Paladin:["light","medium","heavy","shield"],Ranger:["light","medium","shield"],Rogue:["light"],Sorcerer:[],Warlock:["light"],Wizard:[]};
const WEAPON_PROF={Barbarian:["simple","martial"],Bard:["simple","bard-martial"],Cleric:["simple"],Druid:["simple"],Fighter:["simple","martial"],Monk:["simple","martial"],Paladin:["simple","martial"],Ranger:["simple","martial"],Rogue:["simple","rogue-martial"],Sorcerer:["simple"],Warlock:["simple"],Wizard:["simple"]};
const CW={Barbarian:["Greataxe","Handaxe","Unarmed strike"],Bard:["Rapier","Dagger","Unarmed strike"],Cleric:["Mace","Unarmed strike"],Druid:["Scimitar","Unarmed strike"],Fighter:["Longsword","Light crossbow","Unarmed strike"],Monk:["Shortsword","Dart","Unarmed strike"],Paladin:["Longsword","Javelin","Unarmed strike"],Ranger:["Shortsword","Longbow","Unarmed strike"],Rogue:["Rapier","Shortbow","Dagger","Unarmed strike"],Sorcerer:["Spear","Dagger","Unarmed strike"],Warlock:["Dagger","Unarmed strike"],Wizard:["Quarterstaff","Dagger","Unarmed strike"]};
const EQUIP={Barbarian:["Greataxe","4x Handaxe","Explorers Pack","15 GP"],Bard:["Leather armor","Rapier","Diplomats Pack","Lute","Dagger","15 GP"],Cleric:["Chain shirt","Shield","Mace","Holy symbol","Priests Pack","10 GP"],Druid:["Leather armor","Shield","Scimitar","Druidic focus","Explorers Pack","9 GP"],Fighter:["Chain mail","Longsword","Shield","Light crossbow","20 bolts","Dungeoneers Pack","4 GP"],Monk:["Shortsword","10x Darts","Explorers Pack","5 GP"],Paladin:["Chain mail","Shield","Longsword","6x Javelins","Priests Pack","Holy symbol","9 GP"],Ranger:["Scale mail","Longbow","20 arrows","Shortsword x2","Dungeoneers Pack","Quiver","10 GP"],Rogue:["Leather armor","Rapier","Shortbow","20 arrows","Thieves tools","Burglars Pack","Dagger x2","8 GP"],Sorcerer:["Spear","2x Daggers","Arcane focus","Dungeoneers Pack","50 GP"],Warlock:["Leather armor","Dagger x2","Arcane focus","Scholars Pack","15 GP"],Wizard:["Quarterstaff","Spellbook","2x Daggers","Arcane focus","Scholars Pack","5 GP"]};

const ALL_FEATS={Alert:{desc:"Add Prof. Bonus to Initiative. Cannot be surprised while conscious.",cat:"General"},Crafter:{desc:"Proficiency in 3 artisan tools. Craft at 20% discount.",cat:"General"},Healer:{desc:"Healer kit: restore 1d6+4+HD HP once per creature per rest.",cat:"General"},Lucky:{desc:"3 luck points per long rest. Reroll any d20 and choose either result.",cat:"General"},"Magic Initiate":{desc:"Learn 2 cantrips and 1 1st-level spell from any class.",cat:"General"},"Savage Attacker":{desc:"Once per turn, reroll melee weapon damage and use either result.",cat:"General"},Skilled:{desc:"Gain proficiency in any 3 skills or tools.",cat:"General",skilled:true},"Tavern Brawler":{desc:"Unarmed strikes use d4+STR. Bonus action grapple on hit.",cat:"General"},Tough:{desc:"HP maximum +2 per level (retroactive).",cat:"General",tough:true},"War Caster":{desc:"Advantage on CON concentration saves. Cast spells as OA.",cat:"General"},"Great Weapon Master":{desc:"+1 STR. Heavy weapon hits deal +Prof.Bonus damage. Hew: bonus attack on crit/kill.",cat:"General"},Mobile:{desc:"Speed +10 ft. Dash through difficult terrain. No OA from attacked creatures.",cat:"General",speed:10},Resilient:{desc:"Proficiency in one saving throw. +1 to that ability.",cat:"General"},Sentinel:{desc:"OA reduces speed to 0. OA on Disengage. React when ally targeted.",cat:"General"},Sharpshooter:{desc:"+1 DEX. Ranged attacks ignore half and three-quarters cover.",cat:"General"},"Inspiring Leader":{desc:"10-min speech: up to 6 allies gain temp HP = level+CHA.",cat:"General"},Skulker:{desc:"Hide when lightly obscured. Missed ranged attack does not reveal you.",cat:"General"},Durable:{desc:"+1 CON. Min HP from Hit Dice = 2x CON mod.",cat:"General"},"Spell Sniper":{desc:"Double range of attack spells. Ignore half and 3/4 cover.",cat:"General"},"Polearm Master":{desc:"Bonus butt-end attack (1d4). OA when enemy enters reach.",cat:"General"},Actor:{desc:"+1 CHA. Advantage on Deception/Performance checks to impersonate. Mimic sounds and speech.",cat:"General"},
  Athlete:{desc:"+1 STR or DEX. Climb Speed = your Speed. Stand from prone for only 5 ft of movement.",cat:"General"},
  Charger:{desc:"+1 STR or DEX. Dash gains +10 ft. Charge attack: +1d8 damage or push 10 ft.",cat:"General"},
  Chef:{desc:"+1 CON or WIS. Proficiency with Cook's Utensils. Cook healing treats/meals after rests.",cat:"General"},
  "Crossbow Expert":{desc:"+1 DEX. Ignore Loading on crossbows. No disadvantage on ranged attacks in melee.",cat:"General"},
  Crusher:{desc:"+1 STR or CON. Bludgeoning hit can push 5 ft. Crit gives allies advantage vs target.",cat:"General"},
  "Defensive Duelist":{desc:"+1 DEX. Reaction with a Finesse weapon: add Prof. Bonus to AC against one melee attack.",cat:"General"},
  "Dual Wielder":{desc:"+1 STR or DEX. Extra Light-weapon attack can use any melee weapon. Draw/stow two weapons at once.",cat:"General"},
  "Elemental Adept":{desc:"+1 INT/WIS/CHA. Spells ignore Resistance to a chosen damage type; treat 1s as 2s.",cat:"General"},
  "Fey-Touched":{desc:"+1 INT/WIS/CHA. Always-prepared Misty Step + a Divination/Enchantment spell, castable free 1/long rest.",cat:"General"},
  Grappler:{desc:"+1 STR or DEX. Unarmed hit can also Grapple. Advantage attacking a creature you've grappled.",cat:"General"},
  "Heavily Armored":{desc:"+1 STR or CON. Gain training with Heavy armor.",cat:"General"},
  "Heavy Armor Master":{desc:"+1 STR or CON. Reduce Bludgeoning/Piercing/Slashing damage taken by Prof. Bonus while in Heavy armor.",cat:"General"},
  "Keen Mind":{desc:"+1 INT. Always know which way is north, hours until sunrise/sunset, and recall anything seen/heard in the past month.",cat:"General"},
  "Lightly Armored":{desc:"+1 STR or DEX. Gain training with Light armor.",cat:"General"},
  "Mage Slayer":{desc:"+1 STR/DEX/INT/WIS/CHA. OA against a caster whose spell you can see. Advantage on saves vs spells cast within 5 ft.",cat:"General"},
  "Martial Weapon Training":{desc:"+1 STR or DEX. Gain proficiency with all Martial weapons.",cat:"General"},
  "Medium Armor Master":{desc:"+1 STR or DEX. Gain training with Medium armor and Shields.",cat:"General"},
  "Moderately Armored":{desc:"+1 STR or DEX. Gain training with Medium armor and Shields.",cat:"General"},
  "Mounted Combatant":{desc:"+1 STR/DEX/WIS. Advantage on melee attacks vs smaller unmounted creatures; redirect attacks against your mount to yourself.",cat:"General"},
  Observant:{desc:"+1 INT or WIS. +5 Passive Perception/Investigation. Read lips.",cat:"General"},
  Piercer:{desc:"+1 STR or DEX. Reroll one Piercing damage die per hit. Crit adds an extra Piercing die.",cat:"General"},
  Poisoner:{desc:"+1 DEX or INT. Poison damage ignores Resistance. Proficiency with Poisoner's Kit to brew doses.",cat:"General"},
  "Ritual Caster":{desc:"+1 INT/WIS/CHA. Always-prepared Ritual spells (count = Prof. Bonus) castable as Rituals.",cat:"General"},
  "Shadow-Touched":{desc:"+1 INT/WIS/CHA. Always-prepared Invisibility + an Illusion/Necromancy spell, castable free 1/long rest.",cat:"General"},
  "Shield Master":{desc:"+1 STR. Shield Bash: attack forces a STR save or pushes/knocks prone. Reaction: no damage on a successful DEX save.",cat:"General"},
  "Skill Expert":{desc:"+1 any ability. Gain one skill proficiency, and Expertise in a skill you're already proficient in.",cat:"General"},
  Slasher:{desc:"+1 STR or DEX. Slashing hit reduces target's Speed by 10 ft. Crit gives disadvantage on attacks.",cat:"General"},
  Speedy:{desc:"+1 DEX or CON. Speed +10 ft. Dash ignores difficult terrain. Advantage against Opportunity Attacks.",cat:"General"},
  Telekinetic:{desc:"+1 INT/WIS/CHA. Learn Mage Hand (invisible, no components). Bonus Action shove a creature telekinetically.",cat:"General"},
  Telepathic:{desc:"+1 INT/WIS/CHA. Speak telepathically to any creature you can see within 60 ft. Always-prepared Detect Thoughts, castable free 1/long rest.",cat:"General"},
  "Weapon Master":{desc:"+1 STR or DEX. Use the mastery property of one weapon kind you're proficient with; swap it on a Long Rest.",cat:"General"},
  Defense:{desc:"Fighting Style: +1 AC while wearing armor.",cat:"Fighting Style",acBonus:1},Dueling:{desc:"Fighting Style: +2 damage with one melee weapon.",cat:"Fighting Style"},"Two-Weapon Fighting":{desc:"Fighting Style: Add ability mod to off-hand attack damage.",cat:"Fighting Style"},Archery:{desc:"Fighting Style: +2 to ranged weapon attack rolls.",cat:"Fighting Style"},Protection:{desc:"Fighting Style: Reaction to impose disadv on attack vs ally (shield).",cat:"Fighting Style"},"Blind Fighting":{desc:"Fighting Style: Blindsight 10 ft.",cat:"Fighting Style"},
  "Great Weapon Fighting":{desc:"Fighting Style: Reroll 1s and 2s on damage dice for two-handed/Versatile melee weapons.",cat:"Fighting Style"},
  Interception:{desc:"Fighting Style: Reaction reduces damage to a nearby ally by 1d10+Prof.Bonus. Requires Shield or weapon.",cat:"Fighting Style"},
  "Thrown Weapon Fighting":{desc:"Fighting Style: +2 damage on hits with thrown weapons.",cat:"Fighting Style"},
  "Unarmed Fighting":{desc:"Fighting Style: Unarmed Strike damage becomes 1d6 (1d8 if empty-handed); bonus 1d4 to a grappled creature each turn.",cat:"Fighting Style"},"Elven Accuracy":{desc:"(Elf) +1 DEX/INT/WIS/CHA. Triple advantage reroll.",cat:"Racial"},"Fey Teleportation":{desc:"(Elf) +1 INT/CHA. Speak Sylvan. 1/short rest: Misty Step.",cat:"Racial"},"Wood Elf Magic":{desc:"(Wood Elf) Longstrider, Pass without Trace, one druid cantrip.",cat:"Racial"},"High Elf Cantrip":{desc:"(High Elf) One wizard cantrip (INT).",cat:"Racial"},"Dwarven Fortitude":{desc:"(Dwarf) +1 CON. Dodge action: spend 1 HD to heal.",cat:"Racial"},"Orcish Fury":{desc:"(Orc) +1 STR/CON. Extra damage die on weapon attacks.",cat:"Racial"},"Bountiful Luck":{desc:"(Halfling) Reaction to grant ally Lucky reroll on a 1.",cat:"Racial"},"Second Chance":{desc:"(Halfling) +1 DEX/CON/CHA. Reaction to force reroll when attacked.",cat:"Racial"},"Squat Nimbleness":{desc:"(Small) +1 STR/DEX. Speed +5. Move through larger creatures.",cat:"Racial"},Hunter:{desc:"(Ranger) Colossus Slayer, Giant Killer, or Horde Breaker.",cat:"Class"},"Dragon Fear":{desc:"(Dragonborn) +1 STR/CON/CHA. Breathe fear instead of energy.",cat:"Racial"},"Dragon Hide":{desc:"(Dragonborn) +1 STR/CON/CHA. Natural AC 13+DEX, claw attacks.",cat:"Racial"},"Fade Away":{desc:"(Gnome) +1 INT/DEX. Reaction to become invisible when damaged.",cat:"Racial"},"Flames of Phlegethos":{desc:"(Tiefling) +1 INT/CHA. Reroll fire damage, fire shield aura.",cat:"Racial"},"Infernal Constitution":{desc:"(Tiefling) +1 CON. Resistance to cold/poison, advantage on poison saves.",cat:"Racial"},Musician:{desc:"Proficiency with 3 instruments. Play after a rest: allies gain Heroic Inspiration.",cat:"General"},
"Boon of Combat Prowess":{desc:"+1 any ability (max 30). Peerless Aim: turn a missed attack into a hit, 1/turn.",cat:"Epic Boon"},
"Boon of Dimensional Travel":{desc:"+1 any ability (max 30). Blink Steps: teleport 30 ft after Attack or Magic action.",cat:"Epic Boon"},
"Boon of Energy Resistance":{desc:"+1 any ability (max 30). Resistance to 2 chosen damage types; redirect that damage to another creature.",cat:"Epic Boon"},
"Boon of Fate":{desc:"+1 any ability (max 30). Improve Fate: roll 2d4 as a bonus/penalty to a D20 Test near you.",cat:"Epic Boon"},
"Boon of Fortitude":{desc:"+1 any ability (max 30). Max HP +40; regain bonus HP (=CON mod) whenever you heal.",cat:"Epic Boon"},
"Boon of Irresistible Offense":{desc:"+1 STR or DEX (max 30). Physical damage ignores Resistance. Nat 20 attacks deal extra damage.",cat:"Epic Boon"},
"Boon of Recovery":{desc:"+1 any ability (max 30). Last Stand: drop to 1 HP instead of 0, once per long rest. Pool of ten d10s to heal.",cat:"Epic Boon"},
"Boon of Skill":{desc:"+1 any ability (max 30). Proficiency in all skills, plus Expertise in one.",cat:"Epic Boon"},
"Boon of Speed":{desc:"+1 any ability (max 30). Escape Artist: Disengage as a Bonus Action, ending Grappled. Speed +30 ft.",cat:"Epic Boon"},
"Boon of Spell Recall":{desc:"+1 INT/WIS/CHA (max 30). Casting a level 1-4 spell has a chance to not expend the slot.",cat:"Epic Boon"},
"Boon of the Night Spirit":{desc:"+1 any ability (max 30). In Dim Light/Darkness: Bonus Action Invisibility, Resistance to all but Psychic/Radiant.",cat:"Epic Boon"},
"Boon of Truesight":{desc:"+1 any ability (max 30). Truesight with a range of 60 ft.",cat:"Epic Boon"}};

// 2024 PHB Origin Feats (granted by background; Human's Versatile trait grants one extra)
const ORIGIN_FEATS=["Alert","Crafter","Healer","Lucky","Magic Initiate","Musician","Savage Attacker","Skilled","Tavern Brawler","Tough"];

// 2024 PHB subclasses (unlock at class level 3) with one-line descriptions for the sheet
const SUBCLASSES={
  Barbarian:{"Path of the Berserker":"Frenzy for extra attacks and fear.","Path of the Wild Heart":"Animal spirit powers while raging.","Path of the World Tree":"Life-giving vitality and branch teleports.","Path of the Zealot":"Divine fury; hard to kill."},
  Bard:{"College of Dance":"Agile unarmored defense and mobile inspiration.","College of Glamour":"Fey charm and captivating performance.","College of Lore":"Extra skills and Cutting Words.","College of Valor":"Armor, weapons and combat inspiration."},
  Cleric:{"Life Domain":"The best healing in the game.","Light Domain":"Radiant fire and Warding Flare.","Trickery Domain":"Illusions, stealth and duplicates.","War Domain":"Weapon prowess and war blessings."},
  Druid:{"Circle of the Land":"Bonus spells from chosen terrain.","Circle of the Moon":"Powerful Wild Shape combat forms.","Circle of the Sea":"Storm, waves and ocean fury.","Circle of the Stars":"Starry constellation forms."},
  Fighter:{"Battle Master":"Tactical maneuvers with superiority dice.","Champion":"Critical hits on 19-20.","Eldritch Knight":"Wizard spells plus weapons.","Psi Warrior":"Telekinetic psionic strikes and shields."},
  Monk:{"Warrior of Mercy":"Healing hands or harming touch.","Warrior of Shadow":"Darkness, stealth and shadow teleports.","Warrior of the Elements":"Elemental-infused strikes.","Warrior of the Open Hand":"Classic martial arts master."},
  Paladin:{"Oath of Devotion":"Protection, honesty and holy weapon.","Oath of Glory":"Athletic excellence and heroism.","Oath of the Ancients":"Nature magic and fey light.","Oath of Vengeance":"Relentless hunter of wrongdoers."},
  Ranger:{"Beast Master":"A loyal animal companion fights with you.","Fey Wanderer":"Fey charm and mind protection.","Gloom Stalker":"Deadly ambusher in darkness.","Hunter":"Colossus Slayer and monster-slaying tactics."},
  Rogue:{"Arcane Trickster":"Sneaky wizard spells and Mage Hand tricks.","Assassin":"Deadly surprise-round strikes.","Soulknife":"Psychic blades and telepathy.","Thief":"Fast Hands and supreme climbing."},
  Sorcerer:{"Aberrant Sorcery":"Psionic mind powers.","Clockwork Sorcery":"Order, balance and restoring rolls.","Draconic Sorcery":"Dragon resilience and elemental power.","Wild Magic Sorcery":"Chaotic magical surges."},
  Warlock:{"Archfey Patron":"Fey teleports and beguiling magic.","Celestial Patron":"Healing light from above.","Fiend Patron":"Fire, temp HP and dark bargains.","Great Old One Patron":"Psychic whispers and telepathy."},
  Wizard:{Abjurer:"Protective Arcane Ward absorbs damage.",Diviner:"Portent: foresee and replace rolls.",Evoker:"Sculpt blasts around allies.",Illusionist:"Master of improved illusions."},
};
// Bonus spells granted by subclass (Domain/Oath/Patron spells) — always prepared, don't count against known/prepared limits.
const SUBCLASS_SPELLS={
  Cleric:{
    "Life Domain":{3:["Aid","Bless","Cure Wounds","Lesser Restoration"],5:["Mass Healing Word","Revivify"],7:["Aura of Life","Death Ward"],9:["Greater Restoration","Mass Cure Wounds"]},
    "Light Domain":{3:["Burning Hands","Faerie Fire","Scorching Ray","See Invisibility"],5:["Daylight","Fireball"],7:["Arcane Eye","Wall of Fire"],9:["Flame Strike","Scrying"]},
    "Trickery Domain":{3:["Charm Person","Disguise Self","Invisibility","Pass without Trace"],5:["Hypnotic Pattern","Nondetection"],7:["Confusion","Dimension Door"],9:["Dominate Person","Modify Memory"]},
    "War Domain":{3:["Guiding Bolt","Magic Weapon","Shield of Faith","Spiritual Weapon"],5:["Crusader's Mantle","Spirit Guardians"],7:["Fire Shield","Freedom of Movement"],9:["Hold Monster","Steel Wind Strike"]},
  },
  Paladin:{
    "Oath of Devotion":{3:["Protection from Evil and Good","Sanctuary"],5:["Lesser Restoration","Zone of Truth"],9:["Beacon of Hope","Dispel Magic"],13:["Freedom of Movement","Guardian of Faith"],17:["Commune","Flame Strike"]},
    "Oath of the Ancients":{3:["Ensnaring Strike","Speak with Animals"],5:["Moonbeam","Misty Step"],9:["Plant Growth","Protection from Energy"],13:["Ice Storm","Stoneskin"],17:["Commune with Nature","Tree Stride"]},
    "Oath of Vengeance":{3:["Bane","Hunter's Mark"],5:["Hold Person","Misty Step"],9:["Haste","Protection from Energy"],13:["Banishment","Dimension Door"],17:["Hold Monster","Scrying"]},
    "Oath of Glory":{3:["Guiding Bolt","Heroism"],5:["Enhance Ability","Magic Weapon"],9:["Haste","Protection from Energy"],13:["Compulsion","Freedom of Movement"],17:["Legend Lore","Yolande's Regal Presence"]},
  },
  Druid:{
    "Circle of the Moon":{3:["Cure Wounds","Moonbeam","Starry Wisp"],5:["Conjure Animals"],7:["Fount of Moonlight"],9:["Mass Cure Wounds"]},
    "Circle of the Sea":{3:["Fog Cloud","Gust of Wind","Ray of Frost","Shatter","Thunderwave"],5:["Lightning Bolt","Water Breathing"],7:["Control Water","Ice Storm"],9:["Conjure Elemental","Hold Monster"]},
  },
  Warlock:{
    "Fiend Patron":{3:["Burning Hands","Command","Scorching Ray","Suggestion"],5:["Fireball","Stinking Cloud"],7:["Fire Shield","Wall of Fire"],9:["Geas","Insect Plague"]},
    "Archfey Patron":{3:["Calm Emotions","Faerie Fire","Misty Step","Phantasmal Force","Sleep"],5:["Blink","Plant Growth"],7:["Dominate Beast","Greater Invisibility"],9:["Dominate Person","Seeming"]},
    "Great Old One Patron":{3:["Detect Thoughts","Dissonant Whispers","Phantasmal Force","Tasha's Hideous Laughter"],5:["Clairvoyance","Hunger of Hadar"],7:["Confusion","Summon Aberration"],9:["Modify Memory","Telekinesis"]},
    "Celestial Patron":{3:["Aid","Cure Wounds","Guiding Bolt","Lesser Restoration","Light","Sacred Flame"],5:["Daylight","Revivify"],7:["Guardian of Faith","Wall of Fire"],9:["Greater Restoration","Summon Celestial"]},
  },
};
function subclassSpellsAtLevel(cn,sub,level){const table=SUBCLASS_SPELLS[cn]?.[sub];if(!table)return[];return Object.keys(table).filter(l=>level>=Number(l)).sort((a,b)=>a-b).flatMap(l=>table[l]);}
// Actual mechanical subclass features (not bonus spells), verified against the PHB. Each entry: [name,[en,da]].
// Currently populated for Cleric's 4 domains only — other classes' subclasses still need the same pass.
const SUBCLASS_FEATURES={
  Barbarian:{
    "Path of the Berserker":{
      3:[["Frenzy",["While Raging, using Reckless Attack deals extra damage on your first hit each turn: roll d6s equal to your Rage Damage bonus.","Mens du raser, giver Reckless Attack ekstra skade på dit første ramte angreb hver tur: slå d6'ere svarende til din Rage-skadebonus."]]],
      6:[["Mindless Rage",["Immunity to Charmed and Frightened while your Rage is active; an existing Charm/Fright ends when you enter Rage.","Immunitet mod Charmed og Frightened mens du raser; en eksisterende Charm/Fright ophæves når du starter din Rage."]]],
      10:[["Retaliation",["Reaction when you take damage from a creature within 5 ft: make one melee attack against it.","Reaktion når du tager skade fra et væsen inden for 5 ft: udfør ét nærkampsangreb mod det."]]],
      14:[["Intimidating Presence",["Bonus Action: each creature you choose in a 30-ft Emanation makes a WIS save (DC 8+STR mod+Prof.Bonus) or is Frightened 1 min.","Bonus-handling: hvert væsen du vælger i en 30-ft udstråling laver et WIS save (DC 8+STR-mod+Prof.Bonus) eller bliver Frightened i 1 min."]]],
    },
    "Path of the Wild Heart":{
      3:[["Animal Speaker",["Cast Beast Sense and Speak with Animals, but only as Rituals (WIS).","Cast Beast Sense og Speak with Animals, men kun som Ritualer (WIS)."]],
         ["Rage of the Wilds",["When you Rage, choose Bear (Resistance to all but Force/Necrotic/Psychic/Radiant), Eagle (Disengage+Dash as part of your Bonus Action), or Wolf (allies have Advantage vs enemies within 5 ft of you).","Når du raser, vælg Bear (Resistance mod alt undtagen Force/Necrotic/Psychic/Radiant), Eagle (Disengage+Dash som del af din bonus-handling), eller Wolf (allierede har Advantage mod fjender inden for 5 ft af dig)."]]],
      6:[["Aspect of the Wilds",["Choose Owl (Darkvision 60 ft, or +60 ft), Panther (Climb Speed = Speed), or Salmon (Swim Speed = Speed); can change on a Long Rest.","Vælg Owl (Darkvision 60 ft, eller +60 ft), Panther (Climb Speed = Speed), eller Salmon (Swim Speed = Speed); kan ændres ved lang hvile."]]],
      10:[["Nature Speaker",["Cast Commune with Nature, but only as a Ritual (WIS).","Cast Commune with Nature, men kun som et Ritual (WIS)."]]],
      14:[["Power of the Wilds",["When you Rage, choose Falcon (Fly Speed = Speed if unarmored), Lion (enemies within 5 ft have Disadvantage attacking others), or Ram (melee hits can knock Large-or-smaller Prone).","Når du raser, vælg Falcon (Fly Speed = Speed hvis urustet), Lion (fjender inden for 5 ft har Disadvantage mod andre), eller Ram (nærkampsramt kan give Large-eller-mindre Prone)."]]],
    },
    "Path of the World Tree":{
      3:[["Vitality of the Tree",["Vitality Surge: gain temp HP = Barbarian level on Rage. Life-Giving Force: another creature within 10 ft gains temp HP (roll d6s = Rage Damage bonus) at the start of your turns while Raging.","Vitality Surge: få midlertidige HP = Barbarian-niveau ved Rage. Life-Giving Force: et andet væsen inden for 10 ft får midlertidige HP (slå d6'ere = Rage-skadebonus) i starten af dine ture mens du raser."]]],
      6:[["Branches of the Tree",["Reaction when a creature starts its turn within 30 ft while Raging: it makes a STR save or is teleported within 5 ft of you (or nearest space) and its Speed can be reduced to 0.","Reaktion når et væsen starter sin tur inden for 30 ft mens du raser: det laver et STR save eller bliver teleporteret inden for 5 ft af dig, og dets Speed kan sættes til 0."]]],
      10:[["Battering Roots",["Heavy/Versatile melee weapons gain +10 ft reach; hits can activate Push or Topple mastery in addition to the weapon's own.","Heavy/Versatile nærkampsvåben får +10 ft rækkevidde; ramte angreb kan aktivere Push eller Topple mastery ud over våbnets egen."]]],
      14:[["Travel along the Tree",["Bonus Action while Raging: teleport up to 60 ft (once per Rage, up to 150 ft and bring up to 6 willing creatures).","Bonus-handling mens du raser: teleporter op til 60 ft (én gang pr. Rage, op til 150 ft og bring op til 6 villige væsener)."]]],
    },
    "Path of the Zealot":{
      3:[["Divine Fury",["First creature you hit each turn while Raging takes extra 1d6+half Barbarian level Necrotic or Radiant damage (your choice).","Det første væsen du rammer hver tur mens du raser tager ekstra 1d6+halvt Barbarian-niveau Necrotic eller Radiant skade (dit valg)."]],
         ["Warrior of the Gods",["Pool of four d12s (more at higher levels) to spend as a Bonus Action to heal yourself; regain all on Long Rest.","Pulje af fire d12'ere (flere ved højere niveau) du kan bruge som bonus-handling til at hele dig selv; alle genoprettes ved lang hvile."]]],
      6:[["Fanatical Focus",["Once per Rage, reroll a failed save with a bonus equal to your Rage Damage bonus.","Én gang pr. Rage, kast et fejlet save om med en bonus svarende til din Rage-skadebonus."]]],
      10:[["Zealous Presence",["Bonus Action: up to 10 creatures within 60 ft gain Advantage on attack rolls and saves until the start of your next turn.","Bonus-handling: op til 10 væsener inden for 60 ft får Advantage på angrebstjek og saves indtil starten af din næste tur."]]],
      14:[["Rage of the Gods",["When you Rage, become a divine warrior for 1 min: Fly Speed = Speed, Resistance to Necrotic/Psychic/Radiant, and Revivification (Reaction to save a dying creature within 30 ft).","Når du raser, bliv en guddommelig kriger i 1 min: Fly Speed = Speed, Resistance mod Necrotic/Psychic/Radiant, og Revivification (Reaktion for at redde et døende væsen inden for 30 ft)."]]],
    },
  },
  Bard:{
    "College of Dance":{
      3:[["Dazzling Footwork",["Unarmored: Advantage on Dance Performance checks, AC=10+DEX+CHA, Unarmed Strikes as part of Bardic Inspiration actions, using DEX for those attacks and Bardic Inspiration die + DEX for damage.","Urustet: Advantage på Dance Performance-tjek, AC=10+DEX+CHA, Unarmed Strikes som del af Bardic Inspiration-handlinger, ved brug af DEX til de angreb og Bardic Inspiration-terning + DEX til skade."]]],
      6:[["Inspiring Movement",["Reaction, expend Bardic Inspiration, when an enemy ends its turn within 5 ft: move up to half Speed, then one ally can also move up to half Speed. No Opportunity Attacks.","Reaktion, brug Bardic Inspiration, når en fjende slutter sin tur inden for 5 ft: flyt op til halv Speed, og en allieret kan også flytte op til halv Speed. Ingen Opportunity Attacks."]],
         ["Tandem Footwork",["When rolling Initiative, expend Bardic Inspiration: you and allies within 30 ft who can see/hear you gain a bonus to Initiative equal to the die roll.","Når du slår Initiative, brug Bardic Inspiration: du og allierede inden for 30 ft der kan se/høre dig får en bonus til Initiative svarende til terningslaget."]]],
      14:[["Leading Evasion",["When subjected to a DEX save for half damage, take no damage on success and only half on failure; can share this with creatures within 5 ft making the same save.","Når du udsættes for et DEX save til halv skade, tager du ingen skade ved succes og kun halv ved fejl; kan deles med væsener inden for 5 ft der laver samme save."]]],
    },
    "College of Glamour":{
      3:[["Beguiling Magic",["Always have Charm Person and Mirror Image prepared. After casting an Enchantment/Illusion spell with a slot, a creature within 60 ft makes a WIS save or is Charmed/Frightened (your choice) 1 min; restore use with Bardic Inspiration.","Har altid Charm Person og Mirror Image forberedt. Efter at have castet et Enchantment/Illusion spell med en slot, laver et væsen inden for 60 ft et WIS save eller bliver Charmed/Frightened (dit valg) i 1 min; genopret brug med Bardic Inspiration."]],
         ["Mantle of Inspiration",["Bonus Action, expend Bardic Inspiration: creatures up to CHA mod gain temp HP = 2x the die roll and can use their Reaction to move up to their Speed without Opportunity Attacks.","Bonus-handling, brug Bardic Inspiration: væsener op til CHA-mod får midlertidige HP = 2x terningslaget og kan bruge deres Reaktion til at flytte op til deres Speed uden Opportunity Attacks."]]],
      6:[["Mantle of Majesty",["Always have Command prepared. Bonus Action: cast Command free (Charmed creatures auto-fail) for 1 min; restore with a level 3+ slot.","Har altid Command forberedt. Bonus-handling: cast Command gratis (Charmed væsener fejler automatisk) i 1 min; genopret med en niveau 3+ slot."]]],
      14:[["Unbreakable Majesty",["Bonus Action: assume a majestic presence for 1 min; the first attacker against you each turn must succeed on a CHA save or the attack misses.","Bonus-handling: antag en majestætisk tilstedeværelse i 1 min; den første angriber mod dig hver tur skal bestå et CHA save eller angrebet fejler."]]],
    },
    "College of Lore":{
      3:[["Bonus Proficiencies",["Gain proficiency with three skills of your choice.","Få proficiency i tre valgfrie færdigheder."]],
         ["Cutting Words",["Reaction, expend Bardic Inspiration, when a creature within 60 ft makes a damage roll or succeeds an ability check/attack roll: subtract the die roll from it.","Reaktion, brug Bardic Inspiration, når et væsen inden for 60 ft laver et skadetjek eller består et evnetjek/angrebstjek: træk terningslaget fra det."]]],
      6:[["Magical Discoveries",["Learn two spells from the Cleric, Druid, or Wizard list (cantrip or a level you have slots for); always prepared.","Lær to spells fra Cleric-, Druid- eller Wizard-listen (cantrip eller et niveau du har slots til); altid forberedt."]]],
      14:[["Peerless Skill",["Expend Bardic Inspiration on a failed ability check or attack roll: add the die roll, potentially turning failure into success.","Brug Bardic Inspiration ved et fejlet evnetjek eller angrebstjek: læg terningslaget til, hvilket kan vende fiasko til succes."]]],
    },
    "College of Valor":{
      3:[["Combat Inspiration",["A creature with your Bardic Inspiration die can use it to add to AC against an attack (Reaction) or to damage after hitting.","Et væsen med din Bardic Inspiration-terning kan bruge den til at lægge til AC mod et angreb (Reaktion) eller til skade efter et ramt angreb."]],
         ["Martial Training",["Proficiency with Martial weapons, Medium armor, and Shields; can use a Simple/Martial weapon as a Spellcasting Focus.","Proficiency med Martial-våben, Medium rustning og Shields; kan bruge et Simple/Martial-våben som Spellcasting Focus."]]],
      6:[["Extra Attack",["Attack twice instead of once when you take the Attack action; can replace one attack with a cantrip that has a casting time of an action.","Angrib to gange i stedet for én når du tager Attack-handlingen; kan erstatte ét angreb med en cantrip med en handlings-cast-tid."]]],
      14:[["Battle Magic",["After casting a spell with a casting time of an action, make one weapon attack as a Bonus Action.","Efter at have castet et spell med en handlings-cast-tid, udfør ét våbenangreb som en bonus-handling."]]],
    },
  },
  Cleric:{
    "Life Domain":{
      3:[["Disciple of Life",["When a spell you cast with a spell slot restores Hit Points, the target regains additional HP equal to 2 + the spell slot's level.","Når et spell du caster med en spell slot genopretter HP, får målet yderligere HP svarende til 2 + spell slottets niveau."]],
         ["Preserve Life",["Magic action, expend Channel Divinity: restore HP equal to 5x Cleric level, divided among Bloodied creatures within 30 ft (max half their HP max).","Magisk handling, brug Channel Divinity: genopret HP svarende til 5x Cleric-niveau, fordelt blandt Bloodied væsener inden for 30 ft (maks halvdelen af deres HP-maks)."]]],
      6:[["Blessed Healer",["Healing spells you cast on others also heal you for 2 + the spell slot's level.","Helende spells du caster på andre healer også dig for 2 + spell slottets niveau."]]],
      17:[["Supreme Healing",["Instead of rolling healing dice, use the highest possible number for each die.","I stedet for at slå helbredende terninger, brug det højst mulige tal for hver terning."]]],
    },
    "Light Domain":{
      3:[["Radiance of the Dawn",["Magic action, expend Channel Divinity: flash of light in a 30-ft Emanation dispels magical Darkness; each creature of your choice makes a CON save, taking 2d10+Cleric level radiant on a failed save (half on success).","Magisk handling, brug Channel Divinity: lysglimt i en 30-ft udstråling ophæver magisk mørke; hvert væsen du vælger laver et CON save, og tager 2d10+Cleric-niveau strålende skade ved fejlet save (halv ved succes)."]],
          ["Warding Flare",["Reaction when a creature within 30 ft makes an attack roll: impose Disadvantage on it. Uses = WIS mod (min 1), regain all on Long Rest.","Reaktion når et væsen inden for 30 ft laver et angrebstjek: giv det Disadvantage. Bruges = WIS-mod (min 1), alle genoprettes ved lang hvile."]]],
      6:[["Improved Warding Flare",["Regain uses on a Short or Long Rest. Using Warding Flare also grants the attack's target 2d6+WIS mod temporary HP.","Genopret brug ved kort eller lang hvile. Warding Flare giver også målet for angrebet 2d6+WIS-mod midlertidige HP."]]],
      17:[["Corona of Light",["Magic action: emit sunlight in a 60-ft Bright Light and 30-ft Dim Light for 1 minute. Enemies in the Bright Light have Disadvantage on saves against your Radiance of the Dawn and any Fire/Radiant spell. Uses = WIS mod, regain on Long Rest.","Magisk handling: udstrål sollys i 60 ft Bright Light og 30 ft Dim Light i 1 minut. Fjender i Bright Light har Disadvantage på saves mod din Radiance of the Dawn og alle Fire/Radiant spells. Bruges = WIS-mod, genoprettes ved lang hvile."]]],
    },
    "Trickery Domain":{
      3:[["Blessing of the Trickster",["Magic action: you or a willing creature within 30 ft gains Advantage on DEX (Stealth) checks until you finish a Long Rest or use this again.","Magisk handling: du eller et villigt væsen inden for 30 ft får Advantage på DEX (Stealth) tjek indtil du afslutter en lang hvile eller bruger det igen."]],
          ["Invoke Duplicity",["Bonus Action, expend Channel Divinity: create a perfect illusory duplicate of yourself within 30 ft, lasting 1 minute. You can cast spells as if in the illusion's space, gain Advantage on attacks against a creature within 5 ft of both you and the illusion, and move the illusion 30 ft as a Bonus Action.","Bonus-handling, brug Channel Divinity: skab en perfekt illusorisk kopi af dig selv inden for 30 ft i 1 minut. Du kan caste spells som om du var i illusionens rum, få Advantage på angreb mod et væsen inden for 5 ft af både dig og illusionen, og flytte illusionen 30 ft som en bonus-handling."]]],
      6:[["Trickster's Transposition",["Whenever you use the Bonus Action to create or move your Invoke Duplicity illusion, you can teleport to swap places with it.","Når du bruger bonus-handlingen til at skabe eller flytte din Invoke Duplicity-illusion, kan du teleportere og bytte plads med den."]]],
      17:[["Improved Duplicity",["Shared Distraction: attack rolls against a creature within 5 ft of the illusion have Advantage. Healing Illusion: when the illusion ends, you or a creature within 5 ft of it regains HP equal to your Cleric level.","Shared Distraction: angrebstjek mod et væsen inden for 5 ft af illusionen har Advantage. Healing Illusion: når illusionen ender, genopretter du eller et væsen inden for 5 ft HP svarende til dit Cleric-niveau."]]],
    },
    "War Domain":{
      3:[["Guided Strike",["Reaction when you or a creature within 30 ft misses with an attack roll: expend Channel Divinity to give that roll +10.","Reaktion når du eller et væsen inden for 30 ft rammer forbi med et angrebstjek: brug Channel Divinity til at give det slag +10."]],
         ["War Priest",["Bonus Action: make one weapon or Unarmed Strike attack. Uses = WIS mod (min 1), regain all on a Short or Long Rest.","Bonus-handling: udfør ét våben- eller ubevæbnet angreb. Bruges = WIS-mod (min 1), alle genoprettes ved kort eller lang hvile."]]],
      6:[["War God's Blessing",["Expend Channel Divinity to cast Shield of Faith or Spiritual Weapon without a spell slot; it doesn't require Concentration but lasts only 1 minute and ends early if you cast it again, are Incapacitated, or die.","Brug Channel Divinity til at caste Shield of Faith eller Spiritual Weapon uden en spell slot; det kræver ikke Concentration men varer kun 1 minut og slutter tidligt hvis du caster det igen, bliver Incapacitated, eller dør."]]],
      17:[["Avatar of Battle",["Resistance to Bludgeoning, Piercing, and Slashing damage.","Resistance mod Bludgeoning-, Piercing- og Slashing-skade."]]],
    },
  },
  Druid:{
    "Circle of the Land":{
      3:[["Land's Aid",["Magic action, expend Wild Shape: vitality/thorns in a 10-ft Sphere within 60 ft; a chosen creature takes 2d6 Necrotic (CON save for half) and another regains 2d6 HP (both scale up at levels 10 and 14).","Magisk handling, brug Wild Shape: livskraft/torne i en 10-ft kugle inden for 60 ft; et valgt væsen tager 2d6 Necrotic (CON save for halv) og et andet genopretter 2d6 HP (begge skalerer op ved niveau 10 og 14)."]]],
      6:[["Natural Recovery",["Cast a prepared Circle Spell of level 1+ without a slot (1/Long Rest); also recover spell slots (combined level ≤ half Druid level) on a Short Rest.","Cast et forberedt Circle Spell af niveau 1+ uden en slot (1/lang hvile); genopret også spell slots (kombineret niveau ≤ halvt Druid-niveau) ved kort hvile."]]],
      10:[["Nature's Ward",["Immune to Poisoned; Resistance to the damage type tied to your chosen land (Fire/Cold/Lightning/Poison).","Immun mod Poisoned; Resistance mod skadetypen knyttet til dit valgte land (Fire/Cold/Lightning/Poison)."]]],
      14:[["Nature's Sanctuary",["Magic action, expend Wild Shape: spectral trees in a 15-ft Cube give you and allies Half Cover and your Nature's Ward Resistance for 1 minute.","Magisk handling, brug Wild Shape: spøgelsestræer i en 15-ft terning giver dig og allierede Half Cover og din Nature's Ward-Resistance i 1 minut."]]],
    },
    "Circle of the Moon":{
      3:[["Circle Forms",["Your Wild Shape CR limit becomes Druid level ÷ 3 (round down); while shaped, AC = 13+WIS mod if higher, and you gain temp HP = 3x Druid level.","Din Wild Shape CR-grænse bliver Druid-niveau ÷ 3 (rund ned); mens du er forvandlet, AC = 13+WIS-mod hvis højere, og du får midlertidige HP = 3x Druid-niveau."]]],
      6:[["Improved Circle Forms",["Wild Shape attacks can deal Radiant instead of their normal damage; add WIS mod to CON saves while shaped.","Wild Shape-angreb kan give Radiant skade i stedet for deres normale skadetype; læg WIS-mod til CON saves mens du er forvandlet."]]],
      10:[["Moonlight Step",["Bonus Action: teleport up to 30 ft and gain Advantage on your next attack. Uses = WIS mod, regain on Long Rest (or spend a level 2+ slot).","Bonus-handling: teleporter op til 30 ft og få Advantage på dit næste angreb. Bruges = WIS-mod, genoprettes ved lang hvile (eller brug en niveau 2+ slot)."]]],
      14:[["Lunar Form",["Once per turn, deal an extra 2d10 Radiant with a Wild Shape attack; Moonlight Step can also teleport one willing creature within 10 ft.","Én gang pr. tur, giv ekstra 2d10 Radiant med et Wild Shape-angreb; Moonlight Step kan også teleportere et villigt væsen inden for 10 ft."]]],
    },
    "Circle of the Sea":{
      3:[["Wrath of the Sea",["Bonus Action, expend Wild Shape: 5-ft ocean-spray Emanation for 10 min; as a Bonus Action, a chosen creature in it makes a CON save or takes Cold damage (d6s = WIS mod) and is pushed 15 ft if Large or smaller.","Bonus-handling, brug Wild Shape: 5-ft havsprøjt-udstråling i 10 min; som bonus-handling laver et valgt væsen i den et CON save eller tager Cold-skade (d6'ere = WIS-mod) og skubbes 15 ft hvis Large eller mindre."]]],
      6:[["Aquatic Affinity",["The Emanation grows to 10 ft; you gain a Swim Speed equal to your Speed.","Udstrålingen vokser til 10 ft; du får en Swim Speed svarende til din Speed."]]],
      10:[["Stormborn",["While Wrath of the Sea is active, you have a Fly Speed equal to your Speed and Resistance to Cold, Lightning, and Thunder damage.","Mens Wrath of the Sea er aktiv, har du en Fly Speed svarende til din Speed og Resistance mod Cold-, Lightning- og Thunder-skade."]]],
      14:[["Oceanic Gift",["Manifest Wrath of the Sea's Emanation around a willing creature within 60 ft instead of yourself (using your save DC/WIS mod), or around both of you by expending two uses of Wild Shape.","Manifester Wrath of the Sea's udstråling omkring et villigt væsen inden for 60 ft i stedet for dig selv (med din save DC/WIS-mod), eller omkring jer begge ved at bruge to Wild Shape-brug."]]],
    },
    "Circle of the Stars":{
      3:[["Star Map",["A Tiny Spellcasting Focus; while holding it you always have Guidance and Guiding Bolt prepared, and can cast Guiding Bolt free (WIS mod times, regain on Long Rest).","Et lille Spellcasting Focus; mens du holder det har du altid Guidance og Guiding Bolt forberedt, og kan caste Guiding Bolt gratis (WIS-mod gange, genoprettes ved lang hvile)."]],
         ["Starry Form",["Bonus Action, expend Wild Shape: take a luminous starry form (10 min) instead of shape-shifting, choosing a constellation — Archer (ranged spell attack 1d8+WIS radiant as a Bonus Action), Chalice (regain 1d8+WIS HP when you heal someone with a slot), or Dragon (treat CON/INT/WIS rolls of 9 or lower as a 10).","Bonus-handling, brug Wild Shape: antag en lysende stjerneform (10 min) i stedet for at forvandle dig, og vælg en konstellation — Archer (afstandsangreb 1d8+WIS radiant som bonus-handling), Chalice (genopret 1d8+WIS HP når du healer nogen med en slot), eller Dragon (behandl CON/INT/WIS-slag på 9 eller lavere som et 10-tal)."]]],
      6:[["Cosmic Omen",["After a Long Rest, roll a die for Weal (even, Reaction to add 1d6 to a creature's D20 Test) or Woe (odd, Reaction to subtract 1d6). Uses = WIS mod, regain on Long Rest.","Efter en lang hvile, slå en terning for Weal (lige, Reaktion for at lægge 1d6 til et væsens D20-test) eller Woe (ulige, Reaktion for at trække 1d6 fra). Bruges = WIS-mod, genoprettes ved lang hvile."]]],
      10:[["Twinkling Constellations",["Archer/Chalice dice become 2d8; Dragon grants a 20-ft Fly Speed (hover); you can change constellation at the start of each of your turns in Starry Form.","Archer/Chalice-terninger bliver 2d8; Dragon giver en 20-ft Fly Speed (svæve); du kan skifte konstellation i starten af hver af dine ture i Starry Form."]]],
      14:[["Full of Stars",["While in your Starry Form, you become partially incorporeal, gaining Resistance to Bludgeoning, Piercing, and Slashing damage.","Mens du er i din Starry Form, bliver du delvist ukorporlig og får Resistance mod Bludgeoning-, Piercing- og Slashing-skade."]]],
    },
  },
  Fighter:{
    "Battle Master":{
      3:[["Combat Superiority",["Gain Superiority Dice (d8s) and learn maneuvers that spend a die to add effects to attacks or reactions; regain some dice on a Short Rest, all on a Long Rest.","Få Superiority Dice (d8'ere) og lær manøvrer, der bruger en terning til at tilføje effekter til angreb eller reaktioner; genopret nogle terninger ved kort hvile, alle ved lang hvile."]],
         ["Student of War",["Gain proficiency with one type of Artisan's Tools.","Få færdighed med én type håndværktøj."]]],
      7:[["Know Your Enemy",["Study a creature for 1 min (out of combat) to learn how its Armor Class, current Hit Points, immunities, or saves compare to yours.","Studer et væsen i 1 min (uden for kamp) for at lære, hvordan dets Armor Class, nuværende Hit Points, immuniteter eller saves sammenlignes med dine."]]],
      10:[["Improved Combat Superiority",["Your Superiority Dice become d10s.","Dine Superiority Dice bliver d10'ere."]]],
      15:[["Relentless",["When you roll Initiative and have no Superiority Dice left, you regain one.","Når du slår Initiative og ikke har flere Superiority Dice, genopretter du en."]]],
      18:[["Improved Combat Superiority (d12)",["Your Superiority Dice become d12s.","Dine Superiority Dice bliver d12'ere."]]],
    },
    "Champion":{
      3:[["Improved Critical",["Your weapon attacks and Unarmed Strikes score a Critical Hit on a roll of 19 or 20.","Dine våbenangreb og Unarmed Strikes scorer et Critical Hit ved et slag på 19 eller 20."]],
         ["Remarkable Athlete",["Advantage on Initiative rolls and Strength (Athletics) checks; move up to half Speed without provoking Opportunity Attacks right after a Critical Hit.","Advantage på Initiative-slag og Strength (Athletics)-tjek; flyt op til halv Speed uden at fremkalde Opportunity Attacks lige efter et Critical Hit."]]],
      7:[["Additional Fighting Style",["Gain another Fighting Style feat of your choice.","Få endnu en Fighting Style-feat efter eget valg."]]],
      10:[["Heroic Warrior",["Give yourself Heroic Inspiration whenever you start your turn without it.","Giv dig selv Heroic Inspiration hver gang du starter din tur uden det."]]],
      15:[["Superior Critical",["Your weapon attacks and Unarmed Strikes score a Critical Hit on a roll of 18-20.","Dine våbenangreb og Unarmed Strikes scorer et Critical Hit ved et slag på 18-20."]]],
      18:[["Survivor",["Advantage on Death Saving Throws (18-20 counts as a natural 20); regain 5+CON mod HP at the start of each turn while Bloodied with at least 1 HP.","Advantage på Death Saving Throws (18-20 tæller som et naturligt 20); genopret 5+CON-mod HP i starten af hver tur mens du er Bloodied med mindst 1 HP."]]],
    },
    "Eldritch Knight":{
      3:[["Spellcasting",["Learn two Wizard cantrips and prepare Wizard spells (INT); gain a third level-1 spell known as War Bond, which lets you bond a weapon and summon it as a Bonus Action.","Lær to Wizard-cantrips og forbered Wizard-spells (INT); få War Bond, som lader dig binde et våben og tilkalde det som en bonus-handling."]]],
      7:[["War Magic",["When you take the Attack action, you can replace one attack with a casting of a Wizard cantrip with a casting time of an action.","Når du udfører Attack-handlingen, kan du erstatte ét angreb med at caste en Wizard-cantrip med en handlings-castetid."]]],
      10:[["Eldritch Strike",["A creature hit by your weapon attack has Disadvantage on its next save against a spell you cast before the end of your next turn.","Et væsen ramt af dit våbenangreb har Disadvantage på sit næste save mod et spell, du caster inden slutningen af din næste tur."]]],
      15:[["Arcane Charge",["When you use Action Surge, you can teleport up to 30 ft to an unoccupied space you can see.","Når du bruger Action Surge, kan du teleportere op til 30 ft til en ledig plads, du kan se."]]],
      18:[["Improved War Magic",["When you take the Attack action, you can replace two attacks with a casting of a level 1 or 2 Wizard spell with a casting time of an action.","Når du udfører Attack-handlingen, kan du erstatte to angreb med at caste et niveau 1 eller 2 Wizard-spell med en handlings-castetid."]]],
    },
    "Psi Warrior":{
      3:[["Psionic Power",["Gain Psionic Energy Dice; spend them for Protective Field (Reaction, reduce damage), Psionic Strike (extra Force damage on hit), or Telekinetic Movement (move an object/creature with your mind).","Få Psionic Energy Dice; brug dem til Protective Field (Reaktion, reducer skade), Psionic Strike (ekstra Force-skade ved ramt angreb) eller Telekinetic Movement (flyt en genstand/væsen med dit sind)."]]],
      7:[["Telekinetic Adept",["Psi-Powered Leap (Bonus Action, Fly Speed = 2x Speed for the turn) and Telekinetic Thrust (Psionic Strike target makes a STR save or is knocked Prone/pushed 10 ft).","Psi-Powered Leap (bonus-handling, Fly Speed = 2x Speed for turen) og Telekinetic Thrust (Psionic Strike-mål laver et STR save eller bliver Prone/skubbet 10 ft)."]]],
      10:[["Guarded Mind",["Resistance to Psychic damage; expend a Psionic Energy Die to end Charmed/Frightened on yourself.","Resistance mod Psychic-skade; brug en Psionic Energy Die til at ophæve Charmed/Frightened på dig selv."]]],
      15:[["Bulwark of Force",["Bonus Action: give chosen creatures within 30 ft (up to INT mod, min. one) Half Cover for 1 minute.","Bonus-handling: giv valgte væsener inden for 30 ft (op til INT-mod, min. en) Half Cover i 1 minut."]]],
      18:[["Telekinetic Master",["Always have Telekinesis prepared and can cast it free once per Long Rest, using INT; can make a weapon attack as a Bonus Action while concentrating on it.","Har altid Telekinesis forberedt og kan caste det gratis én gang pr. lang hvile, med INT; kan udføre et våbenangreb som en bonus-handling mens du koncentrerer dig om det."]]],
    },
  },
  Monk:{
    "Warrior of Mercy":{
      3:[["Hand of Harm",["Once per turn on a hit with an Unarmed Strike, expend 1 Focus Point for extra Necrotic damage (Martial Arts die + WIS mod).","Én gang pr. tur ved et ramt Unarmed Strike, brug 1 Focus Point til ekstra Necrotic-skade (Martial Arts-terning + WIS-mod)."]],
         ["Hand of Healing",["Magic action, expend 1 Focus Point: touch a creature to heal (Martial Arts die + WIS mod); can replace a Flurry of Blows strike with this for free.","Magisk handling, brug 1 Focus Point: rør et væsen for at hele (Martial Arts-terning + WIS-mod); kan erstatte et Flurry of Blows-slag med dette gratis."]],
         ["Implements of Mercy",["Proficiency in Insight and Medicine, and with Herbalism Kit.","Færdighed i Insight og Medicine, samt med Herbalism Kit."]]],
      6:[["Physician's Touch",["Hand of Harm can also inflict Poisoned; Hand of Healing can also end Blinded, Deafened, Paralyzed, Poisoned, or Stunned.","Hand of Harm kan også give Poisoned; Hand of Healing kan også ophæve Blinded, Deafened, Paralyzed, Poisoned eller Stunned."]]],
      11:[["Flurry of Healing and Harm",["Flurry of Blows strikes can all become Hand of Healing for free, and one strike each turn can add Hand of Harm for free.","Flurry of Blows-slag kan alle blive Hand of Healing gratis, og ét slag hver tur kan tilføje Hand of Harm gratis."]]],
      17:[["Hand of Ultimate Mercy",["Magic action, expend 5 Focus Points: revive a creature dead within 24 hours with 4d10+WIS mod HP, removing several conditions; once per Long Rest.","Magisk handling, brug 5 Focus Points: genopliv et væsen død inden for 24 timer med 4d10+WIS-mod HP og fjern flere tilstande; én gang pr. lang hvile."]]],
    },
    "Warrior of Shadow":{
      3:[["Shadow Arts",["Expend 1 Focus Point to cast Darkness (no components); gain Darkvision 60 ft (or +60 ft); know Minor Illusion (WIS).","Brug 1 Focus Point til at caste Darkness (uden komponenter); få Darkvision 60 ft (eller +60 ft); kend Minor Illusion (WIS)."]]],
      6:[["Shadow Step",["While in Dim Light or Darkness, Bonus Action to teleport up to 60 ft to a similarly dim/dark space, then Advantage on your next melee attack.","Mens du er i Dim Light eller Darkness, bonus-handling til at teleportere op til 60 ft til en tilsvarende mørk plads, og få Advantage på dit næste nærkampsangreb."]]],
      11:[["Improved Shadow Step",["Expend 1 Focus Point to Shadow Step without needing dim/dark start and end; can make an Unarmed Strike right after teleporting.","Brug 1 Focus Point til at bruge Shadow Step uden krav om mørk start/slut; kan udføre et Unarmed Strike lige efter teleport."]]],
      17:[["Cloak of Shadows",["Magic action, expend 3 Focus Points, while in Dim Light/Darkness: become Invisible, partially incorporeal, and use Flurry of Blows free for 1 minute.","Magisk handling, brug 3 Focus Points, mens du er i Dim Light/Darkness: bliv Invisible, delvist ukorporlig, og brug Flurry of Blows gratis i 1 minut."]]],
    },
    "Warrior of the Elements":{
      3:[["Elemental Attunement",["Expend 1 Focus Point: imbue yourself for 10 min with +10 ft Unarmed Strike reach and Elemental Strikes (choose Acid/Cold/Fire/Lightning/Thunder damage, can push/pull target 10 ft on a failed STR save).","Brug 1 Focus Point: giv dig selv i 10 min +10 ft Unarmed Strike-rækkevidde og Elemental Strikes (vælg Acid/Cold/Fire/Lightning/Thunder-skade, kan skubbe/trække mål 10 ft ved fejlet STR save)."]],
         ["Manipulate Elements",["Know the Elementalism spell (WIS).","Kend Elementalism-spellet (WIS)."]]],
      6:[["Elemental Burst",["Magic action, expend 2 Focus Points: 20-ft Sphere burst of your chosen damage type, DEX save for half (3 Martial Arts dice).","Magisk handling, brug 2 Focus Points: 20-ft sfærisk udbrud af din valgte skadetype, DEX save for halv skade (3 Martial Arts-terninger)."]]],
      11:[["Stride of the Elements",["While Elemental Attunement is active, gain a Fly Speed and Swim Speed equal to your Speed.","Mens Elemental Attunement er aktiv, få en Fly Speed og Swim Speed svarende til din Speed."]]],
      17:[["Elemental Epitome",["While Elemental Attunement is active: Resistance to a chosen damage type (changeable each turn), and Step of the Wind adds +20 ft Speed until the end of the turn.","Mens Elemental Attunement er aktiv: Resistance mod en valgt skadetype (kan ændres hver tur), og Step of the Wind giver +20 ft Speed indtil slutningen af turen."]]],
    },
    "Warrior of the Open Hand":{
      3:[["Open Hand Technique",["On a hit granted by Flurry of Blows, impose Addle (no Opportunity Attacks), Push (STR save or pushed 15 ft), or Topple (DEX save or Prone).","Ved et ramt slag fra Flurry of Blows, påfør Addle (ingen Opportunity Attacks), Push (STR save eller skubbet 15 ft), eller Topple (DEX save eller Prone)."]]],
      6:[["Wholeness of Body",["Bonus Action: roll your Martial Arts die to heal yourself (+WIS mod, min. 1); uses = WIS mod (min. 1), regain on Long Rest.","Bonus-handling: slå din Martial Arts-terning for at hele dig selv (+WIS-mod, min. 1); bruges = WIS-mod (min. 1), genoprettes ved lang hvile."]]],
      11:[["Fleet Step",["When you take a Bonus Action other than Step of the Wind, you can also use Step of the Wind right after.","Når du udfører en anden bonus-handling end Step of the Wind, kan du også bruge Step of the Wind lige efter."]]],
      17:[["Quivering Palm",["On an Unarmed Strike hit, expend 4 Focus Points to set lethal vibrations; later end them as an action to force a CON save (10d12 Force damage, half on success).","Ved et ramt Unarmed Strike, brug 4 Focus Points til at sætte dødbringende vibrationer; afslut dem senere som en handling for at fremtvinge et CON save (10d12 Force-skade, halvt ved succes)."]]],
    },
  },
  Paladin:{
    "Oath of Devotion":{
      3:[["Sacred Weapon",["Channel Divinity: imbue a Melee weapon for 10 min, adding CHA mod to attack rolls (min +1) and dealing its normal type or Radiant damage; weapon sheds Bright Light 20 ft/Dim 20 ft more.","Channel Divinity: giv et nærkampsvåben kraft i 10 min, med CHA-mod til angrebstjek (min +1) og skade af normal type eller Radiant; våbnet udstråler Bright Light 20 ft/Dim Light 20 ft mere."]]],
      7:[["Aura of Devotion",["You and allies in your Aura of Protection have Immunity to Charmed.","Du og allierede i din Aura of Protection har Immunity mod Charmed."]]],
      15:[["Smite of Protection",["When you cast Divine Smite, you and allies in your Aura of Protection have Half Cover until the start of your next turn.","Når du caster Divine Smite, får du og allierede i din Aura of Protection Half Cover indtil starten af din næste tur."]]],
      20:[["Holy Nimbus",["Bonus Action, once per Long Rest: for 10 min gain Advantage on saves vs Fiends/Undead, deal CHA+Prof.Bonus Radiant damage to enemies starting their turn in your aura, and the aura sheds sunlight.","Bonus-handling, én gang pr. lang hvile: i 10 min få Advantage på saves mod Fiends/Undead, giv CHA+Prof.Bonus Radiant-skade til fjender der starter deres tur i din aura, og auraen udstråler sollys."]]],
    },
    "Oath of Glory":{
      3:[["Inspiring Smite",["Immediately after casting Divine Smite, expend a Channel Divinity use to distribute Temporary Hit Points (2d8+Paladin level) among creatures within 30 ft.","Lige efter at have castet Divine Smite, brug en Channel Divinity for at fordele midlertidige HP (2d8+Paladin-niveau) blandt væsener inden for 30 ft."]],
         ["Peerless Athlete",["Bonus Action, Channel Divinity: for 1 hour gain Advantage on Athletics/Acrobatics and +10 ft to Long/High Jumps.","Bonus-handling, Channel Divinity: i 1 time få Advantage på Athletics/Acrobatics og +10 ft til Long/High Jumps."]]],
      7:[["Aura of Alacrity",["Speed +10 ft; allies entering your Aura of Protection for the first time on a turn (or starting there) gain +10 ft Speed until the end of their next turn.","Speed +10 ft; allierede der træder ind i din Aura of Protection for første gang i en tur (eller starter der) får +10 ft Speed indtil slutningen af deres næste tur."]]],
      15:[["Glorious Defense",["Reaction when you or a creature within 10 ft is hit: grant a CHA-mod bonus to its AC against that attack (min +1); if it misses, you can make one weapon attack against the attacker.","Reaktion når du eller et væsen inden for 10 ft bliver ramt: giv en CHA-mod-bonus til dets AC mod det angreb (min +1); hvis det ikke rammer, kan du udføre ét våbenangreb mod angriberen."]]],
      20:[["Living Legend",["Bonus Action, once per Long Rest: for 10 min gain Advantage on Charisma checks, reroll a failed save (Reaction, must keep new roll), and turn a missed weapon attack into a hit once per turn.","Bonus-handling, én gang pr. lang hvile: i 10 min få Advantage på Charisma-tjek, kast et fejlet save om (Reaktion, ny værdi gælder), og omdan et forbi-slag med våben til et ramt slag én gang pr. tur."]]],
    },
    "Oath of the Ancients":{
      3:[["Nature's Wrath",["Magic action, Channel Divinity: conjure spectral vines; chosen creatures within 15 ft make a STR save or are Restrained for 1 minute (repeat save each turn).","Magisk handling, Channel Divinity: fremkald spektrale ranker; valgte væsener inden for 15 ft laver et STR save eller bliver Restrained i 1 minut (gentag save hver tur)."]]],
      7:[["Aura of Warding",["You and allies in your Aura of Protection have Resistance to Necrotic, Psychic, and Radiant damage.","Du og allierede i din Aura of Protection har Resistance mod Necrotic-, Psychic- og Radiant-skade."]]],
      15:[["Undying Sentinel",["When reduced to 0 HP without being killed outright, drop to 1 HP instead and regain 3x Paladin level HP (once per Long Rest); you no longer age.","Når du reduceres til 0 HP uden at blive dræbt direkte, falder du til 1 HP i stedet og genopretter 3x Paladin-niveau HP (én gang pr. lang hvile); du ældes ikke længere."]]],
      20:[["Elder Champion",["Bonus Action, once per Long Rest: for 1 min enemies in your aura have Disadvantage on saves vs your spells/Channel Divinity, you regain 10 HP each turn, and action-cast spells become Bonus Actions.","Bonus-handling, én gang pr. lang hvile: i 1 min har fjender i din aura Disadvantage på saves mod dine spells/Channel Divinity, du genopretter 10 HP hver tur, og handlings-castede spells bliver bonus-handlinger."]]],
    },
    "Oath of Vengeance":{
      3:[["Vow of Enmity",["Attack action, Channel Divinity: Advantage on attack rolls against one creature within 30 ft for 1 min or until you use this again; can transfer the vow if the target drops to 0 HP.","Attack-handling, Channel Divinity: Advantage på angrebstjek mod ét væsen inden for 30 ft i 1 min eller indtil du bruger dette igen; kan overføre løftet hvis målet falder til 0 HP."]]],
      7:[["Relentless Avenger",["When you hit with an Opportunity Attack, reduce the target's Speed to 0 until end of turn and move up to half your Speed without provoking.","Når du rammer med et Opportunity Attack, reducer målets Speed til 0 indtil turens slutning og flyt op til halv din Speed uden at fremkalde."]]],
      15:[["Soul of Vengeance",["Reaction when a creature under your Vow of Enmity hits or misses with an attack: make a melee attack against it if in range.","Reaktion når et væsen under dit Vow of Enmity rammer eller ikke rammer med et angreb: udfør et nærkampsangreb mod det hvis inden for rækkevidde."]]],
      20:[["Avenging Angel",["Bonus Action, once per Long Rest: for 10 min gain spectral wings, 60-ft Fly Speed (hover), and enemies starting their turn in your aura make a WIS save or are Frightened.","Bonus-handling, én gang pr. lang hvile: i 10 min få spektrale vinger, 60-ft Fly Speed (svæve), og fjender der starter deres tur i din aura laver et WIS save eller bliver Frightened."]]],
    },
  },
  Ranger:{
    "Beast Master":{
      3:[["Primal Companion",["Summon a Beast of the Land/Sea/Sky companion that fights alongside you; command it with a Bonus Action or sacrifice one of your attacks; restore it with a spell slot if it dies.","Tilkald en Beast of the Land/Sea/Sky-følgesvend, der kæmper ved din side; kommander den med en bonus-handling eller ofr et af dine angreb; genopret den med en spell-slot hvis den dør."]]],
      7:[["Exceptional Training",["Your Bonus Action can also command the beast to Dash, Disengage, Dodge, or Help; on a hit it can deal Force damage instead of its normal type.","Din bonus-handling kan også kommandere følgesvenden til Dash, Disengage, Dodge eller Help; ved et ramt angreb kan den give Force-skade i stedet for sin normale type."]]],
      11:[["Bestial Fury",["When you command the beast to take the Beast's Strike action, it can use it twice; it also adds Hunter's Mark bonus damage on the first hit against a marked creature each turn.","Når du kommanderer følgesvenden til Beast's Strike, kan den bruge den to gange; den tilføjer også Hunter's Mark-bonusskade ved det første ramte angreb mod et mærket væsen hver tur."]]],
      15:[["Share Spells",["When you cast a spell targeting yourself, you can also affect your Primal Companion if it's within 30 ft.","Når du caster et spell mod dig selv, kan du også påvirke din Primal Companion hvis den er inden for 30 ft."]]],
    },
    "Fey Wanderer":{
      3:[["Dreadful Strikes",["Once per turn on a weapon hit, deal extra 1d4 Psychic damage (1d6 at Ranger level 11).","Én gang pr. tur ved et ramt våbenangreb, giv ekstra 1d4 Psychic-skade (1d6 ved Ranger-niveau 11)."]],
         ["Fey Wanderer Spells",["Always have Charm Person prepared from level 3 (later Misty Step, Summon Fey, Dimension Door, Misdirection at higher levels); also gain a random Feywild Gift.","Har altid Charm Person forberedt fra niveau 3 (senere Misty Step, Summon Fey, Dimension Door, Mislead ved højere niveauer); får også en tilfældig Feywild Gift."]],
         ["Otherworldly Glamour",["Charisma checks gain a bonus equal to your WIS mod (min +1); proficiency in Deception, Performance, or Persuasion.","Charisma-tjek får en bonus svarende til dit WIS-mod (min +1); færdighed i Deception, Performance eller Persuasion."]]],
      7:[["Beguiling Twist",["Advantage on saves to avoid/end Charmed or Frightened; Reaction to redirect such a save's failure onto a different creature within 120 ft.","Advantage på saves for at undgå/ophæve Charmed eller Frightened; Reaktion for at omdirigere et fejlet save til et andet væsen inden for 120 ft."]]],
      11:[["Fey Reinforcements",["Cast Summon Fey without a Material component, and once free per Long Rest (non-Concentration for that casting, 1 min duration).","Cast Summon Fey uden en materiel komponent, og én gang gratis pr. lang hvile (ikke-koncentration for den casting, 1 min varighed)."]]],
      15:[["Misty Wanderer",["Cast Misty Step free a number of times = WIS mod (min. once) per Long Rest, and bring one willing creature along.","Cast Misty Step gratis et antal gange = WIS-mod (min. en) pr. lang hvile, og bring et villigt væsen med."]]],
    },
    "Gloom Stalker":{
      3:[["Dread Ambusher",["Speed +10 ft on your first turn of combat; once per turn deal extra 2d6 Psychic damage on a weapon hit (uses = WIS mod, min. once, regain on Long Rest); add WIS mod to Initiative.","Speed +10 ft i din første tur i kamp; én gang pr. tur giv ekstra 2d6 Psychic-skade ved et ramt våbenangreb (bruges = WIS-mod, min. en, genoprettes ved lang hvile); læg WIS-mod til Initiative."]],
         ["Gloom Stalker Spells",["Always have Disguise Self prepared from level 3 (later Rope Trick, Fear, Greater Invisibility, Seeming).","Har altid Disguise Self forberedt fra niveau 3 (senere Rope Trick, Fear, Greater Invisibility, Seeming)."]],
         ["Umbral Sight",["Darkvision 60 ft (or +60 ft); Invisible to Darkvision-reliant creatures while in Darkness.","Darkvision 60 ft (eller +60 ft); Invisible for Darkvision-afhængige væsener mens du er i mørke."]]],
      7:[["Iron Mind",["Proficiency in Wisdom saves (or Intelligence/Charisma if you already have it).","Færdighed i Wisdom-saves (eller Intelligence/Charisma hvis du allerede har det)."]]],
      11:[["Stalker's Flurry",["Dreadful Strike's Psychic damage becomes 2d8, and using it also triggers Sudden Strike (attack a different creature) or Mass Fear (WIS save or Frightened).","Dreadful Strikes Psychic-skade bliver 2d8, og brug af det udløser også Sudden Strike (angrib et andet væsen) eller Mass Fear (WIS save eller Frightened)."]]],
      15:[["Shadowy Dodge",["Reaction to impose Disadvantage on an attack roll against you, then teleport up to 30 ft regardless of hit or miss.","Reaktion for at give Disadvantage på et angrebstjek mod dig, og derefter teleportere op til 30 ft uanset ramt eller ej."]]],
    },
    "Hunter":{
      3:[["Hunter's Lore",["While a creature is marked by Hunter's Mark, you know its Immunities, Resistances, and Vulnerabilities.","Mens et væsen er mærket af Hunter's Mark, kender du dets Immuniteter, Resistances og Vulnerabilities."]],
         ["Hunter's Prey",["Choose Colossus Slayer (extra 1d8 damage to a creature missing HP, once per turn) or Horde Breaker (extra attack against a different nearby creature); swap on a Short/Long Rest.","Vælg Colossus Slayer (ekstra 1d8-skade til et væsen der mangler HP, én gang pr. tur) eller Horde Breaker (ekstra angreb mod et andet nærliggende væsen); byt ved kort/lang hvile."]]],
      7:[["Defensive Tactics",["Choose Escape the Horde (Opportunity Attacks against you have Disadvantage) or Multiattack Defense (after being hit, other attacks this turn have Disadvantage); swap on a Short/Long Rest.","Vælg Escape the Horde (Opportunity Attacks mod dig har Disadvantage) eller Multiattack Defense (efter at være ramt har andre angreb denne tur Disadvantage); byt ved kort/lang hvile."]]],
      11:[["Superior Hunter's Prey",["Once per turn, deal your Hunter's Mark extra damage to a different creature within 30 ft when you damage the marked creature.","Én gang pr. tur, giv din Hunter's Mark ekstraskade til et andet væsen inden for 30 ft, når du skader det mærkede væsen."]]],
      15:[["Superior Hunter's Defense",["Reaction when you take damage: gain Resistance to that damage and any other damage of the same type until the end of the current turn.","Reaktion når du tager skade: få Resistance mod den skade og enhver anden skade af samme type indtil slutningen af den aktuelle tur."]]],
    },
  },
  Rogue:{
    "Arcane Trickster":{
      3:[["Spellcasting",["Learn three Wizard cantrips (Mage Hand + two others) and prepare Wizard spells (INT), starting with three level 1 spells.","Lær tre Wizard-cantrips (Mage Hand + to andre) og forbered Wizard-spells (INT), med start på tre niveau 1 spells."]],
         ["Mage Hand Legerdemain",["Cast Mage Hand as a Bonus Action, make it Invisible, and control it to make Sleight of Hand checks.","Cast Mage Hand som en bonus-handling, gør den Invisible, og kontroller den til at lave Sleight of Hand-tjek."]]],
      9:[["Magical Ambush",["If you're Invisible when you cast a spell on a creature, it has Disadvantage on its save against that spell.","Hvis du er Invisible når du caster et spell på et væsen, har det Disadvantage på sit save mod det spell."]]],
      13:[["Versatile Trickster",["Use your Mage Hand to distract; apply the Trip Cunning Strike option to a second creature within 5 ft of the hand.","Brug din Mage Hand til at distrahere; anvend Trip Cunning Strike-muligheden på et andet væsen inden for 5 ft af hånden."]]],
      17:[["Spell Thief",["Reaction when targeted by a spell: force an INT save to negate it and steal the spell (if level 1+) to have prepared for 8 hours.","Reaktion når du udsættes for et spell: fremtving et INT save for at ophæve det og stjæl spellet (hvis niveau 1+) til at have forberedt i 8 timer."]]],
    },
    "Assassin":{
      3:[["Assassinate",["Advantage on Initiative; Advantage on attack rolls against any creature that hasn't acted yet in the first round, and Sneak Attack hits deal extra damage equal to your Rogue level.","Advantage på Initiative; Advantage på angrebstjek mod ethvert væsen der endnu ikke har handlet i første runde, og Sneak Attack-ramte angreb giver ekstraskade svarende til dit Rogue-niveau."]],
         ["Assassin's Tools",["Gain a Disguise Kit and a Poisoner's Kit, with proficiency.","Få et Disguise Kit og et Poisoner's Kit, med færdighed."]]],
      9:[["Infiltration Expertise",["Masterful Mimicry (mimic speech/handwriting after 1 hour study) and Roving Aim (Steady Aim no longer sets Speed to 0).","Masterful Mimicry (efterlign tale/håndskrift efter 1 times studie) og Roving Aim (Steady Aim sætter ikke længere Speed til 0)."]]],
      13:[["Envenom Weapons",["Your Cunning Strike Poison option also deals extra 2d6 Poison damage that ignores Poison Resistance.","Din Cunning Strike Poison-mulighed giver også ekstra 2d6 Poison-skade der ignorerer Poison Resistance."]]],
      17:[["Death Strike",["Sneak Attack hit on the first round of combat: target makes a CON save or the attack's damage is doubled.","Sneak Attack-ramt angreb i første runde af kamp: målet laver et CON save eller angrebets skade fordobles."]]],
    },
    "Soulknife":{
      3:[["Psionic Power",["Gain Psionic Energy Dice granting Psi-Bolstered Knack (reroll a failed skill/tool check) and Psychic Whispers (telepathic communication).","Få Psionic Energy Dice der giver Psi-Bolstered Knack (kast et fejlet skill/tool-tjek om) og Psychic Whispers (telepatisk kommunikation)."]],
         ["Psychic Blades",["Manifest a Psychic Blade (1d6+ability mod, Finesse/Thrown) as part of an Attack action; make a bonus off-hand blade attack (1d4) if your other hand is free.","Fremkald en Psychic Blade (1d6+evne-mod, Finesse/Thrown) som del af et Attack-handling; udfør et bonus-blad-angreb (1d4) med den anden hånd hvis den er fri."]]],
      9:[["Soul Blades",["Homing Strikes (reroll a missed Psychic Blade attack using an Energy Die) and Psychic Teleportation (Bonus Action, throw a blade and teleport to its landing spot).","Homing Strikes (kast et forbi-slag med Psychic Blade om med en Energy Die) og Psychic Teleportation (bonus-handling, kast et blad og teleporter til dets landingssted)."]]],
      13:[["Psychic Veil",["Magic action: become Invisible for 1 hour or until you deal damage/force a save; restore use with a Psionic Energy Die.","Magisk handling: bliv Invisible i 1 time eller indtil du giver skade/fremtvinger et save; genopret brug med en Psionic Energy Die."]]],
      17:[["Rend Mind",["When Psychic Blades deal Sneak Attack damage, force a WIS save or the target is Stunned for 1 minute.","Når Psychic Blades giver Sneak Attack-skade, fremtving et WIS save eller målet bliver Stunned i 1 minut."]]],
    },
    "Thief":{
      3:[["Fast Hands",["Bonus Action: use Sleight of Hand to pick a lock/pocket/disarm a trap, or use the Utilize/Magic action on an object/item.","Bonus-handling: brug Sleight of Hand til at åbne en lås/lomme/afmontere en fælde, eller brug Utilize/Magic-handling på en genstand/item."]],
         ["Second-Story Work",["Gain a Climb Speed equal to your Speed; use Dexterity instead of Strength for jump distance.","Få en Climb Speed svarende til din Speed; brug Dexterity i stedet for Strength til sprangdistance."]]],
      9:[["Supreme Sneak",["New Cunning Strike option Stealth Attack (Cost 1d6): an Invisible-from-Hide attack doesn't lose that Invisibility from Three-Quarters/Total Cover at turn's end.","Ny Cunning Strike-mulighed Stealth Attack (Cost 1d6): et Invisible-fra-Hide angreb mister ikke den Invisibility fra Three-Quarters/Total Cover ved turens afslutning."]]],
      13:[["Use Magic Device",["Attune to up to four magic items; on charge-use roll 1d6, a 6 doesn't expend charges; use any Spell Scroll via Intelligence.","Attune til op til fire magiske genstande; ved brug af opladninger, slå 1d6, et 6-tal bruger ikke opladninger; brug enhver Spell Scroll via Intelligence."]]],
      17:[["Thief's Reflexes",["Take two turns in the first round of combat: one at normal Initiative, one at Initiative minus 10.","Tag to ture i første runde af kamp: en ved normal Initiative, en ved Initiative minus 10."]]],
    },
  },
  Sorcerer:{
    "Aberrant Sorcery":{
      3:[["Telepathic Speech",["Bonus Action: form a telepathic connection with a creature within 30 ft, lasting Sorcerer-level minutes within CHA-mod miles.","Bonus-handling: dan en telepatisk forbindelse med et væsen inden for 30 ft, varende Sorcerer-niveau minutter inden for CHA-mod miles."]]],
      6:[["Psionic Sorcery",["Cast your Psionic Spells by spending Sorcery Points equal to the spell's level instead of a slot, with no components required.","Cast dine Psionic Spells ved at bruge Sorcery Points svarende til spellets niveau i stedet for en slot, uden krav om komponenter."]],
         ["Psychic Defenses",["Resistance to Psychic damage; Advantage on saves to avoid/end Charmed or Frightened.","Resistance mod Psychic-skade; Advantage på saves for at undgå/ophæve Charmed eller Frightened."]]],
      14:[["Revelation in Flesh",["Bonus Action, spend 1+ Sorcery Points for 10 min: choose Aquatic Adaptation, Glistening Flight, See the Invisible, or Wormlike Movement.","Bonus-handling, brug 1+ Sorcery Points i 10 min: vælg Aquatic Adaptation, Glistening Flight, See the Invisible eller Wormlike Movement."]]],
      18:[["Warping Implosion",["Magic action: teleport up to 120 ft; creatures within 30 ft of your former space make a STR save or take 3d10 Force damage and are pulled to that space.","Magisk handling: teleporter op til 120 ft; væsener inden for 30 ft af din tidligere plads laver et STR save eller tager 3d10 Force-skade og trækkes til den plads."]]],
    },
    "Clockwork Sorcery":{
      3:[["Restore Balance",["Reaction: prevent a creature's d20 roll within 60 ft from being affected by Advantage or Disadvantage.","Reaktion: forhindr et væsens d20-slag inden for 60 ft i at blive påvirket af Advantage eller Disadvantage."]],
         ["Clockwork Spells",["Always have Aid prepared from level 3 (later Alarm, Lesser Restoration, Dispel Magic, Protection from Energy, Freedom of Movement, Summon Construct, Greater Restoration, Wall of Force).","Har altid Aid forberedt fra niveau 3 (senere Alarm, Lesser Restoration, Dispel Magic, Protection from Energy, Freedom of Movement, Summon Construct, Greater Restoration, Wall of Force)."]]],
      6:[["Bastion of Law",["Magic action, spend 1-5 Sorcery Points: create a d8-per-point ward around yourself or another creature within 30 ft that can be expended to reduce damage.","Magisk handling, brug 1-5 Sorcery Points: skab en ward (d8 pr. point) omkring dig selv eller et andet væsen inden for 30 ft, der kan bruges til at reducere skade."]]],
      14:[["Trance of Order",["Bonus Action, 1 minute: attack rolls against you can't have Advantage, and you treat d20 Test rolls of 9 or lower as a 10.","Bonus-handling, 1 minut: angrebstjek mod dig kan ikke have Advantage, og du behandler d20-tests på 9 eller lavere som et 10-tal."]]],
      18:[["Clockwork Cavalcade",["Magic action: summon spirits in a 30-ft Cube that heal up to 100 HP, repair objects, and end spells of level 6 or lower.","Magisk handling: tilkald ånder i en 30-ft Cube der healer op til 100 HP, reparerer genstande og ophæver spells af niveau 6 eller lavere."]]],
    },
    "Draconic Sorcery":{
      3:[["Draconic Resilience",["Hit Point maximum +3 (and +1 per Sorcerer level); base AC = 10+DEX+CHA while unarmored.","Hit Point-maksimum +3 (og +1 pr. Sorcerer-niveau); base AC = 10+DEX+CHA mens du er urustet."]],
         ["Draconic Spells",["Always have Alter Self prepared from level 3 (later Fear, Fly, Arcane Eye, Charm Monster, Legend Lore, Summon Dragon).","Har altid Alter Self forberedt fra niveau 3 (senere Fear, Fly, Arcane Eye, Charm Monster, Legend Lore, Summon Dragon)."]]],
      6:[["Elemental Affinity",["Choose Acid/Cold/Fire/Lightning/Poison: Resistance to it, and add CHA mod to one damage roll of a spell of that type.","Vælg Acid/Cold/Fire/Lightning/Poison: Resistance mod den, og læg CHA-mod til ét skadeslag fra et spell af den type."]]],
      14:[["Dragon Wings",["Bonus Action: sprout wings for 1 hour, gaining a Fly Speed of 60 ft; restore use with 3 Sorcery Points.","Bonus-handling: få vinger i 1 time og en Fly Speed på 60 ft; genopret brug med 3 Sorcery Points."]]],
      18:[["Dragon Companion",["Cast Summon Dragon without a Material component, once free per Long Rest.","Cast Summon Dragon uden en materiel komponent, én gang gratis pr. lang hvile."]]],
    },
    "Wild Magic Sorcery":{
      3:[["Wild Magic Surge",["Once per turn, after casting a Sorcerer spell with a slot, roll 1d20; on a 20, roll on the Wild Magic Surge table for a random effect.","Én gang pr. tur, efter at have castet et Sorcerer-spell med en slot, slå 1d20; ved 20, slå på Wild Magic Surge-tabellen for en tilfældig effekt."]],
         ["Tides of Chaos",["Gain Advantage on one d20 Test; must then cast a spell with a slot or finish a Long Rest before using it again (doing the former auto-triggers a Surge roll).","Få Advantage på et d20-test; skal derefter caste et spell med en slot eller afslutte en lang hvile før brug igen (det første udløser automatisk et Surge-slag)."]]],
      6:[["Bend Luck",["Reaction, spend 1 Sorcery Point when another creature rolls a d20 Test: roll 1d4 and apply it as a bonus or penalty to that roll.","Reaktion, brug 1 Sorcery Point når et andet væsen laver et d20-test: slå 1d4 og påfør det som en bonus eller straf til det slag."]]],
      14:[["Controlled Chaos",["When rolling on the Wild Magic Surge table, roll twice and use either result.","Når du slår på Wild Magic Surge-tabellen, slå to gange og brug enten resultat."]]],
      18:[["Tamed Surge",["After casting a Sorcerer spell with a slot, choose an effect from the Wild Magic Surge table instead of rolling (except the final row); once per Long Rest.","Efter at have castet et Sorcerer-spell med en slot, vælg en effekt fra Wild Magic Surge-tabellen i stedet for at slå (undtagen den sidste række); én gang pr. lang hvile."]]],
    },
  },
  Warlock:{
    "Archfey Patron":{
      3:[["Steps of the Fey",["Cast Misty Step free (uses = CHA mod, min. once, regain on Long Rest); add Refreshing Step (temp HP) or Taunting Step (Disadvantage on enemy attacks vs others).","Cast Misty Step gratis (bruges = CHA-mod, min. en, genoprettes ved lang hvile); tilføj Refreshing Step (midlertidige HP) eller Taunting Step (Disadvantage på fjendtlige angreb mod andre)."]]],
      6:[["Misty Escape",["Cast Misty Step as a Reaction when you take damage; also gain Disappearing Step (Invisible) or Dreadful Step (Psychic damage) options.","Cast Misty Step som en Reaktion når du tager skade; få også mulighederne Disappearing Step (Invisible) eller Dreadful Step (Psychic-skade)."]]],
      10:[["Beguiling Defenses",["Immunity to Charmed; Reaction when hit to halve the damage and force the attacker to make a WIS save or take equal Psychic damage.","Immunity mod Charmed; Reaktion når du bliver ramt for at halvere skaden og fremtvinge et WIS save fra angriberen eller give lige så meget Psychic-skade."]]],
      14:[["Bewitching Magic",["After casting an Enchantment or Illusion spell with a slot, cast Misty Step as part of the same action for free.","Efter at have castet et Enchantment- eller Illusion-spell med en slot, cast Misty Step som del af samme handling gratis."]]],
    },
    "Celestial Patron":{
      3:[["Healing Light",["Bonus Action: heal yourself or a creature within 60 ft using a pool of d6s (1+Warlock level); expend up to CHA mod dice at once.","Bonus-handling: hel dig selv eller et væsen inden for 60 ft med en pulje af d6'ere (1+Warlock-niveau); brug op til CHA-mod terninger ad gangen."]]],
      6:[["Radiant Soul",["Resistance to Radiant damage; once per turn add CHA mod to a spell's Radiant or Fire damage.","Resistance mod Radiant-skade; én gang pr. tur læg CHA-mod til et spells Radiant- eller Fire-skade."]]],
      10:[["Celestial Resilience",["Gain Temporary HP (Warlock level+CHA mod) when using Healing Light or resting; up to five other creatures gain half that amount.","Få midlertidige HP (Warlock-niveau+CHA-mod) ved brug af Healing Light eller hvile; op til fem andre væsener får halvdelen af den mængde."]]],
      14:[["Searing Vengeance",["When you or an ally within 60 ft is about to make a Death Save, heal them half their HP max and deal 2d8+CHA Radiant damage/Blinded to nearby creatures.","Når du eller en allieret inden for 60 ft skal lave et Death Save, hel dem for halvdelen af deres HP-max og giv 2d8+CHA Radiant-skade/Blinded til nærliggende væsener."]]],
    },
    "Fiend Patron":{
      3:[["Dark One's Blessing",["When you reduce an enemy to 0 HP (or an ally does within 10 ft), gain Temporary HP = Warlock level+CHA mod (min. 1).","Når du reducerer en fjende til 0 HP (eller en allieret gør det inden for 10 ft), få midlertidige HP = Warlock-niveau+CHA-mod (min. 1)."]]],
      6:[["Dark One's Own Luck",["Add 1d10 to an ability check or save after seeing the roll but before effects occur; uses = CHA mod (min. once).","Læg 1d10 til et ability-tjek eller save efter at have set slaget men før effekterne indtræder; bruges = CHA-mod (min. en)."]]],
      10:[["Fiendish Resilience",["Choose a damage type (not Force): Resistance to it until you choose a different one on a Short/Long Rest.","Vælg en skadestype (ikke Force): Resistance mod den indtil du vælger en anden ved kort/lang hvile."]]],
      14:[["Hurl Through Hell",["Once per turn on a hit, force a CHA save or transport the target through the Lower Planes (8d10 Psychic damage, Incapacitated); restore with a Pact Magic slot.","Én gang pr. tur ved et ramt angreb, fremtving et CHA save eller transporter målet gennem de nedre planer (8d10 Psychic-skade, Incapacitated); genopret med en Pact Magic-slot."]]],
    },
    "Great Old One Patron":{
      3:[["Awakened Mind",["Bonus Action: form a telepathic connection with a creature within 30 ft, lasting Warlock-level minutes within CHA-mod miles.","Bonus-handling: dan en telepatisk forbindelse med et væsen inden for 30 ft, varende Warlock-niveau minutter inden for CHA-mod miles."]],
         ["Psychic Spells",["Change a damage-dealing spell's type to Psychic; cast Enchantment/Illusion Warlock spells without Verbal/Somatic components.","Ændr en skadegivende spells type til Psychic; cast Enchantment/Illusion Warlock-spells uden Verbal/Somatic-komponenter."]]],
      6:[["Clairvoyant Combatant",["When bonded via Awakened Mind, force a WIS save: on a fail the creature has Disadvantage attacking you and you have Advantage attacking it for the bond's duration.","Når bundet via Awakened Mind, fremtving et WIS save: ved fejl har væsenet Disadvantage mod dig og du har Advantage mod det for bondens varighed."]]],
      10:[["Eldritch Hex",["Always have Hex prepared; the target also has Disadvantage on saves of the chosen ability while Hex lasts.","Har altid Hex forberedt; målet har også Disadvantage på saves af den valgte evne mens Hex varer."]],
         ["Thought Shield",["Your thoughts can't be read without permission; Resistance to Psychic damage, and attackers dealing Psychic damage to you take the same amount.","Dine tanker kan ikke læses uden tilladelse; Resistance mod Psychic-skade, og angribere der giver dig Psychic-skade tager samme mængde."]]],
      14:[["Create Thrall",["Cast Summon Aberration without Concentration (1 min duration); the Aberration gains Temp HP and deals extra Psychic damage to Hexed creatures.","Cast Summon Aberration uden koncentration (1 min varighed); Aberrationen får midlertidige HP og giver ekstra Psychic-skade til Hexed væsener."]]],
    },
  },
  Wizard:{
    "Abjurer":{
      3:[["Abjuration Savant",["Add two level-1-or-2 Abjuration spells to your spellbook free; also add one free Abjuration spell whenever you gain a new level of spell slots.","Tilføj to niveau 1-2 Abjuration-spells til din spellbook gratis; tilføj også et gratis Abjuration-spell hver gang du får en ny niveau af spell-slots."]],
         ["Arcane Ward",["When you cast an Abjuration spell with a slot, create a ward (HP = 2x Wizard level+INT mod) that absorbs damage you take; recharges when casting more Abjuration spells.","Når du caster et Abjuration-spell med en slot, skab en ward (HP = 2x Wizard-niveau+INT-mod) der absorberer skade du tager; genoplades ved at caste flere Abjuration-spells."]]],
      6:[["Projected Ward",["Reaction: your Arcane Ward can absorb damage taken by a creature within 30 ft instead of you.","Reaktion: din Arcane Ward kan absorbere skade taget af et væsen inden for 30 ft i stedet for dig."]]],
      10:[["Spell Breaker",["Always have Counterspell and Dispel Magic prepared; can cast Dispel Magic as a Bonus Action and add Prof. Bonus to its check; a slot isn't expended if it fails to stop a spell.","Har altid Counterspell og Dispel Magic forberedt; kan caste Dispel Magic som en bonus-handling og lægge Prof.Bonus til dets tjek; en slot bruges ikke hvis den ikke stopper et spell."]]],
      14:[["Spell Resistance",["Advantage on saves against spells; Resistance to spell damage.","Advantage på saves mod spells; Resistance mod spell-skade."]]],
    },
    "Diviner":{
      3:[["Divination Savant",["Add two level-1-or-2 Divination spells to your spellbook free; also add one free Divination spell whenever you gain a new level of spell slots.","Tilføj to niveau 1-2 Divination-spells til din spellbook gratis; tilføj også et gratis Divination-spell hver gang du får en ny niveau af spell-slots."]],
         ["Portent",["After a Long Rest, roll two d20s; you can replace any D20 Test made by you or a creature you can see with one of these foretelling rolls (once per turn each).","Efter en lang hvile, slå to d20'ere; du kan erstatte et hvilket som helst d20-test lavet af dig eller et væsen du kan se med et af disse forudsigelsesslag (én gang pr. tur hver)."]]],
      6:[["Expert Divination",["When you cast a Divination spell with a level 2+ slot, regain one expended slot of a lower level (max level 5).","Når du caster et Divination-spell med en niveau 2+ slot, genopret en brugt slot af lavere niveau (maks niveau 5)."]]],
      10:[["The Third Eye",["Bonus Action: gain Darkvision 120 ft, Greater Comprehension (read any language), or See Invisibility (free) until a Short/Long Rest.","Bonus-handling: få Darkvision 120 ft, Greater Comprehension (læs ethvert sprog), eller See Invisibility (gratis) indtil kort/lang hvile."]]],
      14:[["Greater Portent",["Roll three d20s for your Portent feature rather than two.","Slå tre d20'ere til din Portent-funktion i stedet for to."]]],
    },
    "Evoker":{
      3:[["Evocation Savant",["Add two level-1-or-2 Evocation spells to your spellbook free; also add one free Evocation spell whenever you gain a new level of spell slots.","Tilføj to niveau 1-2 Evocation-spells til din spellbook gratis; tilføj også et gratis Evocation-spell hver gang du får en ny niveau af spell-slots."]],
         ["Potent Cantrip",["A creature that avoids your damaging cantrip (miss or successful save) still takes half damage.","Et væsen der undgår din skadegivende cantrip (forbi-slag eller vellykket save) tager stadig halv skade."]]],
      6:[["Sculpt Spells",["Choose creatures (1+spell level) within an Evocation spell's area to automatically succeed their save and take no damage on a partial-success spell.","Vælg væsener (1+spellets niveau) inden for et Evocation-spells område til automatisk at bestå deres save og tage ingen skade ved et delvist-succes-spell."]]],
      10:[["Empowered Evocation",["Add your INT mod to one damage roll of any Evocation spell you cast.","Læg dit INT-mod til ét skadeslag af et Evocation-spell, du caster."]]],
      14:[["Overchannel",["Deal maximum damage with a level 1-5 damaging spell once free; further uses before a Long Rest deal escalating Necrotic damage to you.","Giv maksimal skade med et niveau 1-5 skadegivende spell én gang gratis; yderligere brug før en lang hvile giver eskalerende Necrotic-skade til dig selv."]]],
    },
    "Illusionist":{
      3:[["Illusion Savant",["Add two level-1-or-2 Illusion spells to your spellbook free; also add one free Illusion spell whenever you gain a new level of spell slots.","Tilføj to niveau 1-2 Illusion-spells til din spellbook gratis; tilføj også et gratis Illusion-spell hver gang du får en ny niveau af spell-slots."]],
         ["Improved Illusions",["Cast Illusion spells without Verbal components, and their range increases by 60 ft if 10+ ft; also know Minor Illusion, castable with both sound and image, as a Bonus Action.","Cast Illusion-spells uden Verbal-komponenter, og deres rækkevidde øges med 60 ft hvis 10+ ft; kend også Minor Illusion, som kan castes med både lyd og billede, som en bonus-handling."]]],
      6:[["Phantasmal Creatures",["Always have Summon Beast and Summon Fey prepared; cast either as an Illusion (spectral, half HP) without a spell slot once per Long Rest.","Har altid Summon Beast og Summon Fey forberedt; cast en af dem som en Illusion (spektral, halv HP) uden en spell-slot én gang pr. lang hvile."]]],
      10:[["Illusory Self",["Reaction when hit: interpose an illusory duplicate that causes the attack to automatically miss; restore use with a level 2+ slot.","Reaktion når du bliver ramt: sæt en illusorisk dublet ind, der får angrebet til automatisk at ramme forbi; genopret brug med en niveau 2+ slot."]]],
      14:[["Illusory Reality",["When casting an Illusion spell with a slot, make one inanimate object in the illusion real for 1 minute.","Når du caster et Illusion-spell med en slot, gør en livløs genstand i illusionen ægte i 1 minut."]]],
    },
  },
};
// PHB 2024 page each subclass appears on, individually verified against the book (only classes confirmed this way are listed).
const SUBCLASS_PG={
  Barbarian:{"Path of the Berserker":54,"Path of the Wild Heart":55,"Path of the World Tree":56,"Path of the Zealot":57},
  Bard:{"College of Dance":64,"College of Glamour":65,"College of Lore":66,"College of Valor":67},
  Cleric:{"Life Domain":73,"Light Domain":74,"Trickery Domain":75,"War Domain":76},
  Druid:{"Circle of the Land":85,"Circle of the Moon":86,"Circle of the Sea":87,"Circle of the Stars":88},
  Fighter:{"Battle Master":93,"Champion":96,"Eldritch Knight":96,"Psi Warrior":98},
  Monk:{"Warrior of Mercy":104,"Warrior of Shadow":105,"Warrior of the Elements":106,"Warrior of the Open Hand":107},
  Paladin:{"Oath of Devotion":113,"Oath of Glory":114,"Oath of the Ancients":115,"Oath of Vengeance":116},
  Ranger:{"Beast Master":122,"Fey Wanderer":124,"Gloom Stalker":125,"Hunter":127},
  Rogue:{"Arcane Trickster":132,"Assassin":134,"Soulknife":135,"Thief":137},
  Sorcerer:{"Aberrant Sorcery":145,"Clockwork Sorcery":146,"Draconic Sorcery":148,"Wild Magic Sorcery":149},
  Warlock:{"Archfey Patron":159,"Celestial Patron":160,"Fiend Patron":161,"Great Old One Patron":162},
  Wizard:{"Abjurer":172,"Diviner":173,"Evoker":174,"Illusionist":175},
};
function subclassFeaturesAtLevel(cn,sub,level){const table=SUBCLASS_FEATURES[cn]?.[sub];if(!table)return[];return Object.keys(table).filter(l=>level>=Number(l)).sort((a,b)=>a-b).flatMap(l=>table[l]);}
// Druid Circle of the Land: choose a land type (chosen anew each Long Rest per RAW); spells "and lower" are all prepared.
const CIRCLE_LAND_SPELLS={
  Arid:{3:["Blur","Burning Hands","Fire Bolt"],5:["Fireball"],7:["Blight"],9:["Wall of Stone"]},
  Polar:{3:["Fog Cloud","Hold Person","Ray of Frost"],5:["Sleet Storm"],7:["Ice Storm"],9:["Cone of Cold"]},
  Temperate:{3:["Misty Step","Shocking Grasp","Sleep"],5:["Lightning Bolt"],7:["Freedom of Movement"],9:["Tree Stride"]},
  Tropical:{3:["Acid Splash","Ray of Sickness","Web"],5:["Stinking Cloud"],7:["Polymorph"],9:["Insect Plague"]},
};
function circleLandSpellsAtLevel(land,level){const table=CIRCLE_LAND_SPELLS[land];if(!table)return[];return Object.keys(table).filter(l=>level>=Number(l)).sort((a,b)=>a-b).flatMap(l=>table[l]);}

const CS={Wizard:{0:["Acid Splash","Blade Ward","Chill Touch","Dancing Lights","Elementalism","Fire Bolt","Friends","Light","Mage Hand","Mending","Message","Mind Sliver","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","Thunderclap","Toll the Dead","True Strike"],1:["Alarm","Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Find Familiar","Fog Cloud","Grease","Hideous Laughter","Identify","Illusory Script","Jump","Longstrider","Mage Armor","Magic Missile","Protection from Evil and Good","Ray of Sickness","Shield","Silent Image","Sleep","Thunderwave","Unseen Servant","Witch Bolt"],2:["Alter Self","Augury","Blindness/Deafness","Blur","Cloud of Daggers","Continual Flame","Crown of Madness","Darkness","Darkvision","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Flaming Sphere","Gentle Repose","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Locate Object","Magic Mouth","Magic Weapon","Melf's Acid Arrow","Mirror Image","Misty Step","Phantasmal Force","Ray of Enfeeblement","Rope Trick","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"],3:["Animate Dead","Bestow Curse","Blink","Clairvoyance","Counterspell","Dispel Magic","Fear","Feign Death","Fireball","Fly","Gaseous Form","Glyph of Warding","Haste","Hypnotic Pattern","Leomund's Tiny Hut","Lightning Bolt","Magic Circle","Major Image","Nondetection","Phantom Steed","Protection from Energy","Remove Curse","Sending","Sleet Storm","Slow","Speak with Dead","Stinking Cloud","Tongues","Vampiric Touch","Water Breathing"],4:["Arcane Eye","Banishment","Blight","Confusion","Conjure Minor Elementals","Control Water","Dimension Door","Divination","Evard's Black Tentacles","Fabricate","Fire Shield","Greater Invisibility","Hallucinatory Terrain","Ice Storm","Leomund's Secret Chest","Locate Creature","Mordenkainen's Faithful Hound","Mordenkainen's Private Sanctum","Otiluke's Resilient Sphere","Phantasmal Killer","Polymorph","Stone Shape","Stoneskin","Wall of Fire"],5:["Animate Objects","Bigby's Hand","Circle of Power","Cloudkill","Cone of Cold","Conjure Elemental","Creation","Dominate Person","Geas","Hold Monster","Legend Lore","Mislead","Modify Memory","Passwall","Planar Binding","Seeming","Steel Wind Strike","Telekinesis","Teleportation Circle","Wall of Force","Wall of Stone"],6:["Arcane Gate","Chain Lightning","Circle of Death","Contingency","Create Undead","Disintegrate","Eyebite","Flesh to Stone","Globe of Invulnerability","Guards and Wards","Mass Suggestion","Move Earth","Otiluke's Freezing Sphere","Otto's Irresistible Dance","Programmed Illusion","Sunbeam","True Seeing","Wall of Ice"],7:["Delayed Blast Fireball","Etherealness","Finger of Death","Forcecage","Mirage Arcane","Mordenkainen's Magnificent Mansion","Mordenkainen's Sword","Plane Shift","Prismatic Spray","Project Image","Reverse Gravity","Symbol","Teleport"],8:["Antimagic Field","Antipathy/Sympathy","Control Weather","Dominate Monster","Feeblemind","Incendiary Cloud","Maze","Mind Blank","Power Word Stun","Sunburst"],9:["Astral Projection","Foresight","Gate","Imprisonment","Meteor Swarm","Power Word Kill","Prismatic Wall","Shapechange","Time Stop","True Polymorph","Weird","Wish"]},Cleric:{0:["Guidance","Light","Mending","Resistance","Sacred Flame","Spare the Dying","Thaumaturgy","Toll the Dead","Word of Radiance"],1:["Bane","Bless","Command","Create or Destroy Water","Cure Wounds","Detect Evil and Good","Detect Magic","Detect Poison and Disease","Guiding Bolt","Healing Word","Inflict Wounds","Protection from Evil and Good","Purify Food and Drink","Sanctuary","Shield of Faith"],2:["Aid","Augury","Blindness/Deafness","Calm Emotions","Continual Flame","Enhance Ability","Find Traps","Gentle Repose","Hold Person","Lesser Restoration","Locate Object","Prayer of Healing","Protection from Poison","Silence","Spiritual Weapon","Warding Bond","Zone of Truth"],3:["Animate Dead","Aura of Vitality","Beacon of Hope","Bestow Curse","Clairvoyance","Create Food and Water","Daylight","Dispel Magic","Feign Death","Glyph of Warding","Magic Circle","Mass Healing Word","Meld into Stone","Protection from Energy","Remove Curse","Revivify","Sending","Speak with Dead","Spirit Guardians","Tongues","Water Walk"],4:["Aura of Life","Aura of Purity","Banishment","Control Water","Death Ward","Divination","Freedom of Movement","Guardian of Faith","Locate Creature","Stone Shape"],5:["Circle of Power","Commune","Contagion","Dispel Evil and Good","Flame Strike","Geas","Greater Restoration","Hallow","Insect Plague","Legend Lore","Mass Cure Wounds","Planar Binding","Raise Dead","Summon Celestial"],6:["Blade Barrier","Create Undead","Find the Path","Forbiddance","Harm","Heal","Heroes' Feast","Planar Ally","Sunbeam","True Seeing","Word of Recall"],7:["Conjure Celestial","Divine Word","Etherealness","Fire Storm","Plane Shift","Regenerate","Resurrection","Symbol"],8:["Antimagic Field","Control Weather","Earthquake","Holy Aura","Sunburst"],9:["Astral Projection","Gate","Mass Heal","Power Word Heal","True Resurrection"]},Druid:{0:["Druidcraft","Elementalism","Guidance","Mending","Message","Poison Spray","Produce Flame","Resistance","Shillelagh","Spare the Dying","Starry Wisp","Thorn Whip","Thunderclap"],1:["Animal Friendship","Charm Person","Create or Destroy Water","Cure Wounds","Detect Magic","Detect Poison and Disease","Entangle","Faerie Fire","Fog Cloud","Goodberry","Healing Word","Jump","Longstrider","Protection from Evil and Good","Purify Food and Drink","Speak with Animals","Thunderwave"],2:["Aid","Animal Messenger","Augury","Barkskin","Beast Sense","Continual Flame","Darkvision","Enhance Ability","Enlarge/Reduce","Find Traps","Flame Blade","Flaming Sphere","Gust of Wind","Heat Metal","Hold Person","Lesser Restoration","Locate Animals or Plants","Locate Object","Moonbeam","Pass without Trace","Protection from Poison","Spike Growth"],3:["Aura of Vitality","Call Lightning","Conjure Animals","Daylight","Dispel Magic","Elemental Weapon","Feign Death","Meld into Stone","Plant Growth","Protection from Energy","Revivify","Sleet Storm","Speak with Plants","Water Breathing","Water Walk","Wind Wall"],4:["Blight","Confusion","Conjure Minor Elementals","Conjure Woodland Beings","Control Water","Divination","Dominate Beast","Fire Shield","Freedom of Movement","Giant Insect","Grasping Vine","Hallucinatory Terrain","Ice Storm","Locate Creature","Polymorph","Stone Shape","Stoneskin","Wall of Fire"],5:["Antilife Shell","Commune with Nature","Cone of Cold","Conjure Elemental","Contagion","Geas","Greater Restoration","Insect Plague","Mass Cure Wounds","Planar Binding","Reincarnate","Tree Stride","Wall of Stone"],6:["Conjure Fey","Find the Path","Flesh to Stone","Heal","Heroes' Feast","Move Earth","Sunbeam","Transport via Plants","Wall of Thorns","Wind Walk"],7:["Fire Storm","Mirage Arcane","Plane Shift","Regenerate","Reverse Gravity","Symbol"],8:["Animal Shapes","Antipathy/Sympathy","Control Weather","Earthquake","Feeblemind","Incendiary Cloud","Sunburst"],9:["Foresight","Shapechange","Storm of Vengeance","True Resurrection"]},Bard:{0:["Blade Ward","Dancing Lights","Friends","Light","Mage Hand","Mending","Message","Minor Illusion","Prestidigitation","Starry Wisp","Thunderclap","True Strike","Vicious Mockery"],1:["Animal Friendship","Bane","Charm Person","Color Spray","Command","Comprehend Languages","Cure Wounds","Detect Magic","Disguise Self","Dissonant Whispers","Earth Tremor","Faerie Fire","Feather Fall","Healing Word","Heroism","Hideous Laughter","Identify","Illusory Script","Longstrider","Silent Image","Sleep","Speak with Animals","Thunderwave","Unseen Servant"],2:["Aid","Animal Messenger","Blindness/Deafness","Calm Emotions","Cloud of Daggers","Crown of Madness","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Enthrall","Heat Metal","Hold Person","Invisibility","Knock","Lesser Restoration","Locate Animals or Plants","Locate Object","Magic Mouth","Mirror Image","Phantasmal Force","See Invisibility","Shatter","Silence","Suggestion","Zone of Truth"],3:["Bestow Curse","Clairvoyance","Dispel Magic","Fear","Feign Death","Glyph of Warding","Hypnotic Pattern","Leomund's Tiny Hut","Major Image","Mass Healing Word","Nondetection","Plant Growth","Sending","Slow","Speak with Dead","Speak with Plants","Stinking Cloud","Tongues"],4:["Compulsion","Confusion","Dimension Door","Freedom of Movement","Greater Invisibility","Hallucinatory Terrain","Locate Creature","Phantasmal Killer","Polymorph"],5:["Animate Objects","Dominate Person","Geas","Greater Restoration","Hold Monster","Legend Lore","Mass Cure Wounds","Mislead","Modify Memory","Planar Binding","Raise Dead","Seeming","Teleportation Circle"],6:["Eyebite","Find the Path","Guards and Wards","Heroes' Feast","Mass Suggestion","Otto's Irresistible Dance","Programmed Illusion","True Seeing"],7:["Etherealness","Forcecage","Mirage Arcane","Mordenkainen's Magnificent Mansion","Mordenkainen's Sword","Prismatic Spray","Project Image","Regenerate","Resurrection","Symbol","Teleport"],8:["Antipathy/Sympathy","Dominate Monster","Feeblemind","Glibness","Mind Blank","Power Word Stun"],9:["Foresight","Power Word Heal","Power Word Kill","Prismatic Wall","True Polymorph"]},Sorcerer:{0:["Acid Splash","Blade Ward","Chill Touch","Dancing Lights","Elementalism","Fire Bolt","Friends","Light","Mage Hand","Mending","Message","Mind Sliver","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","Sorcerous Burst","Thunderclap","True Strike"],1:["Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Fog Cloud","Grease","Jump","Mage Armor","Magic Missile","Ray of Sickness","Shield","Silent Image","Sleep","Thunderwave","Witch Bolt"],2:["Alter Self","Blindness/Deafness","Blur","Cloud of Daggers","Crown of Madness","Darkness","Darkvision","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Flame Blade","Flaming Sphere","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Magic Weapon","Mirror Image","Misty Step","Phantasmal Force","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"],3:["Blink","Clairvoyance","Counterspell","Daylight","Dispel Magic","Fear","Fireball","Fly","Gaseous Form","Haste","Hypnotic Pattern","Lightning Bolt","Major Image","Protection from Energy","Sleet Storm","Slow","Stinking Cloud","Tongues","Vampiric Touch","Water Breathing","Water Walk"],4:["Banishment","Blight","Confusion","Dimension Door","Dominate Beast","Fire Shield","Greater Invisibility","Ice Storm","Polymorph","Stoneskin","Wall of Fire"],5:["Animate Objects","Bigby's Hand","Cloudkill","Cone of Cold","Creation","Dominate Person","Hold Monster","Insect Plague","Seeming","Telekinesis","Teleportation Circle","Wall of Stone"],6:["Arcane Gate","Chain Lightning","Circle of Death","Disintegrate","Eyebite","Flesh to Stone","Globe of Invulnerability","Mass Suggestion","Move Earth","Otiluke's Freezing Sphere","Sunbeam","True Seeing"],7:["Delayed Blast Fireball","Etherealness","Finger of Death","Fire Storm","Plane Shift","Prismatic Spray","Reverse Gravity","Teleport"],8:["Dominate Monster","Earthquake","Incendiary Cloud","Power Word Stun","Sunburst"],9:["Gate","Meteor Swarm","Power Word Kill","Time Stop","Wish"]},Warlock:{0:["Blade Ward","Chill Touch","Eldritch Blast","Friends","Mage Hand","Mind Sliver","Minor Illusion","Poison Spray","Prestidigitation","Thunderclap","Toll the Dead","True Strike"],1:["Armor of Agathys","Arms of Hadar","Bane","Charm Person","Comprehend Languages","Detect Magic","Expeditious Retreat","Hellish Rebuke","Hex","Hideous Laughter","Illusory Script","Protection from Evil and Good","Speak with Animals","Unseen Servant","Witch Bolt"],2:["Cloud of Daggers","Crown of Madness","Darkness","Enthrall","Hold Person","Invisibility","Mirror Image","Misty Step","Ray of Enfeeblement","Spider Climb","Suggestion"],3:["Counterspell","Dispel Magic","Fear","Fly","Gaseous Form","Hunger of Hadar","Hypnotic Pattern","Magic Circle","Major Image","Remove Curse","Tongues","Vampiric Touch"],4:["Banishment","Blight","Dimension Door","Hallucinatory Terrain"],5:["Hold Monster","Mislead","Planar Binding","Teleportation Circle"]},Paladin:{1:["Bless","Command","Compelled Duel","Cure Wounds","Detect Evil and Good","Detect Magic","Detect Poison and Disease","Divine Favor","Heroism","Protection from Evil and Good","Purify Food and Drink","Shield of Faith","Thunderous Smite","Wrathful Smite"],2:["Aid","Branding Smite","Find Steed","Gentle Repose","Lesser Restoration","Locate Object","Magic Weapon","Prayer of Healing","Protection from Poison","Warding Bond","Zone of Truth"],3:["Aura of Vitality","Blinding Smite","Create Food and Water","Crusader's Mantle","Daylight","Dispel Magic","Elemental Weapon","Magic Circle","Remove Curse","Revivify"],4:["Aura of Life","Aura of Purity","Banishment","Death Ward","Locate Creature","Staggering Smite"],5:["Banishing Smite","Circle of Power","Destructive Wave","Dispel Evil and Good","Geas","Greater Restoration","Holy Weapon","Raise Dead","Summon Celestial"]},Ranger:{1:["Alarm","Animal Friendship","Cure Wounds","Detect Magic","Detect Poison and Disease","Ensnaring Strike","Entangle","Fog Cloud","Goodberry","Hail of Thorns","Hunter's Mark","Jump","Longstrider","Speak with Animals"],2:["Aid","Animal Messenger","Barkskin","Beast Sense","Cordon of Arrows","Darkvision","Enhance Ability","Find Traps","Gust of Wind","Lesser Restoration","Locate Animals or Plants","Locate Object","Magic Weapon","Pass without Trace","Protection from Poison","Silence","Spike Growth"],3:["Conjure Animals","Conjure Barrage","Daylight","Dispel Magic","Elemental Weapon","Lightning Arrow","Meld into Stone","Nondetection","Plant Growth","Protection from Energy","Revivify","Speak with Plants","Water Breathing","Water Walk","Wind Wall"],4:["Conjure Woodland Beings","Dominate Beast","Freedom of Movement","Grasping Vine","Locate Creature","Stoneskin"],5:["Commune with Nature","Conjure Volley","Greater Restoration","Steel Wind Strike","Swift Quiver","Tree Stride"]}};
// Reverse lookup: spell name -> level (0-9), scanned once from CS so subclass bonus spells can be grouped correctly.
const SPELL_LEVEL_INDEX=(()=>{const idx={};Object.values(CS).forEach(byLevel=>{Object.entries(byLevel).forEach(([lvl,names])=>{names.forEach(n=>{if(idx[n]===undefined)idx[n]=Number(lvl);});});});return idx;})();
function spellLevelOf(name){return SPELL_LEVEL_INDEX[name];}

const mf=s=>Math.floor((Number(s)-10)/2);
const sgn=n=>n>=0?"+"+n:""+n;
const pbf=lvl=>Math.ceil(lvl/4)+1;
const avgHp=(lvl,hd,cm)=>lvl<=1?hd+cm:hd+cm+(lvl-1)*(Math.floor(hd/2)+1+cm);
const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
const r4d6=()=>Array.from({length:4},()=>Math.ceil(Math.random()*6)).sort((a,b)=>a-b).slice(1).reduce((a,b)=>a+b,0);
const FALLBACK_ORDER=["CON","DEX","WIS","CHA","INT","STR"];
function assignByPriority(cn,values){const pri=CLASSES[cn].pri;const sorted=[...values].sort((a,b)=>b-a);const res={};pri.forEach((ab,i)=>{res[ab]=sorted[i];});const remaining=sorted.slice(pri.length);const leftoverAbs=FALLBACK_ORDER.filter(ab=>!pri.includes(ab));leftoverAbs.forEach((ab,i)=>{res[ab]=remaining[i];});return res;}
function assignArr(cn){return assignByPriority(cn,STD);}
function applyBoosts(stats,bg,mode,pick2,pick1){const b={...stats},opts=BGS[bg].ab;if(mode==="+2/+1"){const p2=opts.includes(pick2)?pick2:opts[0];const p1=(opts.includes(pick1)&&pick1!==p2)?pick1:opts.find(a=>a!==p2);b[p2]=(b[p2]||10)+2;b[p1]=(b[p1]||10)+1;}else opts.forEach(a=>b[a]=(b[a]||10)+1);return b;}

// ─── Print styles ─────────────────────────────
const PA="#f7f0e0",INK="#1a1008",GOLD="#7a5c1e",GOLD_L="#c9a84c",RULE="#c4a96a";
const capL={fontSize:6.5,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif",display:"block"};
const pgStyle={background:PA,padding:"11mm 10mm 9mm",maxWidth:"210mm",margin:"0 auto",fontFamily:"serif",color:INK,fontSize:9,boxSizing:"border-box",lineHeight:1.4};
function Pip({filled,danger,size=6}){return <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,border:"0.75px solid "+(danger?"#8b0000":GOLD),background:filled?(danger?"#8b0000":INK+"cc"):"transparent"}}/>;}
function PRow({prof,name,ab,bonus}){return <div style={{display:"flex",alignItems:"center",gap:4,padding:"1.5px 0",borderBottom:"0.5px solid #ede3cc"}}><Pip filled={prof}/><span style={{flex:1,fontSize:7.5,color:INK,fontFamily:"sans-serif"}}>{name}</span><span style={{fontSize:7,color:GOLD,fontFamily:"sans-serif",marginRight:2}}>{ab}</span><span style={{fontSize:8,fontWeight:700,fontFamily:"sans-serif",minWidth:18,textAlign:"right"}}>{bonus}</span></div>;}
function PSec({title,children,style={}}){return <div style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,padding:"5px 7px",...style}}><div style={{fontSize:7,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700,color:GOLD,fontFamily:"sans-serif",textAlign:"center",borderBottom:"0.5px solid "+RULE,marginBottom:4,paddingBottom:2}}>{title}</div>{children}</div>;}
function PAbl({ab,score}){const mod=mf(score);return <div style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,textAlign:"center",padding:"4px 3px"}}><div style={{...capL,textAlign:"center",marginBottom:1}}>{AB_FULL[ab]}</div><div style={{fontSize:20,fontWeight:700,lineHeight:1,color:INK,fontFamily:"serif"}}>{score}</div><div style={{width:22,height:22,borderRadius:"50%",border:"1.5px solid "+RULE,background:"#fff",margin:"3px auto 0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,fontFamily:"sans-serif",color:INK}}>{sgn(mod)}</div></div>;}
function PShield({label,value}){return <div style={{position:"relative",width:56,margin:"0 auto"}}><svg viewBox="0 0 56 64" width={56} height={64}><path d="M28 2 L54 12 L54 36 C54 52 28 62 28 62 C28 62 2 52 2 36 L2 12 Z" fill="#fff" stroke={RULE} strokeWidth={1.5}/></svg><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:4}}><div style={{fontSize:5,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif",lineHeight:1.2,textAlign:"center",whiteSpace:"nowrap"}}>{label}</div><div style={{fontSize:20,fontWeight:800,lineHeight:1.1,color:INK,fontFamily:"serif"}}>{value}</div></div></div>;}
function ORul(){return <div style={{display:"flex",alignItems:"center",gap:6,margin:"4px 0"}}><div style={{flex:1,height:"0.5px",background:"linear-gradient(to right,transparent,"+RULE+")"}}></div><svg width={40} height={10} viewBox="0 0 40 10"><line x1={0} y1={5} x2={40} y2={5} stroke={RULE} strokeWidth={0.8}/><path d="M16 5 L20 2 L24 5 L20 8 Z" fill={RULE}/><circle cx={7} cy={5} r={1.5} fill={RULE}/><circle cx={33} cy={5} r={1.5} fill={RULE}/></svg><div style={{flex:1,height:"0.5px",background:"linear-gradient(to left,transparent,"+RULE+")"}}></div></div>;}


function buildPortraitPromptFromSheet(sh){
  const race=(sh.species||"human").split(" ")[0];
  const cls=(sh.classLevel||"Fighter").split(" ")[0];
  const gender=sh.gender||"male";
  return `${gender} ${race} ${cls}, fantasy rpg character, full body portrait, detailed character art`;
}
function pollinationsImageUrl(prompt,seed){
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=1024&seed=${seed}&nologo=true&enhance=false&model=flux`;
}
const LEVEL_XP_5E=[0,0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
function levelFromClassLevel(classLevel){
  const nums=String(classLevel||'').match(/\d+/g);
  if(!nums||!nums.length)return 1;
  return Math.max(1,Math.min(20,nums.map(Number).reduce((a,b)=>a+b,0)));
}
function xpForClassLevel(classLevel){
  const lvl=levelFromClassLevel(classLevel);
  return (LEVEL_XP_5E[lvl]??0).toLocaleString('en-US');
}

function FancySheet({sh}){
  const [portraitFailed,setPortraitFailed]=useState(false);
  const [portraitLoading,setPortraitLoading]=useState(true);
  const stats=sh.finalStats||{};
  const stat=(ab)=>stats[ab]??10;
  const statMod=(ab)=>mf(stat(ab));
  const skillBonus=(sk)=>sgn(statMod(sk.ab)+(sh.skills?.includes(sk.name)?sh.profBonus:0)+((sh.expertise||[]).includes(sk.name)?sh.profBonus:0)+((sh.wisSkills||[]).includes(sk.name)?(sh.wisMod||0):0));
  const saveBonus=(ab)=>sgn(statMod(ab)+(sh.saves?.includes(ab)?sh.profBonus:0));
  const portrait=sh.portraitUrl||pollinationsImageUrl(buildPortraitPromptFromSheet(sh),sh.portraitSeed||1);
  const skillRows=SKILL_LIST;
  const weaponRows=(sh.weapons||[]).slice(0,5);
  const lang=((sh.profLangs||"").split(/Languages:\s*/i).pop()||"").trim();

  function StatCard({ab,className}){return <div className={"orn-stat "+className}>
    <div className="orn-mod">{sgn(statMod(ab))}</div>
    <div className="orn-score">{stat(ab)}</div>
    <div className="orn-label">{AB_FULL[ab]||ab}</div>
  </div>;}
  function SavePip({ab}){return <div className="save-gem"><b>{saveBonus(ab)}</b><span>{ab}</span></div>;}

  const sheetTheme=(sh.classLevel||"").split(" ")[0].toLowerCase().replace(/[^a-z]/g,"") || "adventure";

  return <div className={`page pro-sheet ornate-sheet theme-${sheetTheme}`}>
    <style>{`
      .ornate-sheet{width:210mm;height:297mm;margin:0 auto;position:relative;overflow:hidden;box-sizing:border-box;background:#130e08;color:#241305;font-family:Georgia,'Times New Roman',serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      .ornate-sheet *{box-sizing:border-box;}
      .orn-bg{position:absolute;inset:0;overflow:hidden;background:
        linear-gradient(rgba(244,224,170,.34),rgba(244,224,170,.34)),
        url('/fantasy-sheet-bg.jpg');background-size:cover;background-position:center;}
      .orn-bg:before{content:"";position:absolute;inset:0;background:
        radial-gradient(circle at 52% 42%,rgba(255,253,245,.91) 0 18%,rgba(255,250,235,.34) 32%,rgba(16,10,5,0) 50%),
        radial-gradient(circle at 18% 76%,rgba(255,220,190,.16),transparent 18%),
        linear-gradient(90deg,rgba(8,5,3,.68),rgba(8,5,3,.08) 18%,rgba(8,5,3,.06) 79%,rgba(8,5,3,.72)),
        linear-gradient(rgba(255,246,212,.22),rgba(69,39,12,.42));pointer-events:none;}
      .orn-veil{position:absolute;inset:7mm;z-index:1;border-radius:2mm;background:rgba(248,237,195,.12);pointer-events:none;}
      .orn-bg:after{content:"";position:absolute;inset:5mm;border:1.15mm solid #6b4616;border-radius:3.2mm;box-shadow:inset 0 0 0 .55mm #d9b86a,inset 0 0 0 1.4mm rgba(41,24,5,.38),inset 0 0 24mm rgba(73,42,12,.24),0 0 18mm rgba(0,0,0,.28);pointer-events:none;}
      .theme-cleric .orn-bg{filter:hue-rotate(7deg) saturate(1.08) brightness(1.04)}
      .theme-druid .orn-bg{filter:hue-rotate(55deg) saturate(1.05) brightness(.98)}
      .theme-wizard .orn-bg,.theme-sorcerer .orn-bg,.theme-warlock .orn-bg{filter:hue-rotate(190deg) saturate(1.12) brightness(.92)}
      .theme-rogue .orn-bg{filter:hue-rotate(205deg) saturate(.92) brightness(.82)}
      .theme-fighter .orn-bg,.theme-barbarian .orn-bg,.theme-paladin .orn-bg{filter:hue-rotate(-10deg) saturate(1.18) brightness(.96)}
      .rune-ring{position:absolute;left:46mm;top:35mm;width:128mm;height:128mm;border-radius:50%;border:.35mm dashed rgba(255,225,145,.42);box-shadow:0 0 18mm rgba(255,202,76,.18),inset 0 0 17mm rgba(255,240,180,.18);z-index:1}.rune-ring:before{content:"✦ ✧ ✧ ✦ ✧ ✧ ✦ ✧ ✧ ✦";position:absolute;inset:5mm;border-radius:50%;font-size:5mm;letter-spacing:2mm;color:rgba(61,42,16,.23);display:flex;align-items:center;justify-content:center;transform:rotate(-17deg)}
      .rune-ring:after{content:"";position:absolute;inset:16mm;border-radius:50%;border:.25mm solid rgba(255,236,181,.25);background:conic-gradient(from 20deg,transparent 0 12deg,rgba(255,226,122,.14) 12deg 14deg,transparent 14deg 40deg,rgba(52,35,12,.12) 40deg 42deg,transparent 42deg 100deg);mask:radial-gradient(circle,transparent 0 45%,#000 46% 48%,transparent 49% 100%)}
      .brand{position:absolute;left:13mm;top:2.6mm;font-family:system-ui,sans-serif;font-size:2.2mm;font-weight:900;letter-spacing:.19em;color:#412807;text-transform:uppercase;z-index:8}.brand:after{content:"";display:block;width:54mm;height:.45mm;margin-top:1mm;background:linear-gradient(90deg,#a77922,transparent)}
      .name-plaque{position:absolute;left:11mm;top:10mm;width:64mm;height:21mm;z-index:10;background:linear-gradient(#fff8df,#e5c98d);border:.9mm solid #6c4718;border-radius:2.5mm;box-shadow:0 1.2mm 3.4mm rgba(31,17,3,.35),inset 0 0 0 .6mm rgba(255,255,255,.72)}.name-plaque:before{content:"";position:absolute;inset:-2.7mm -4mm;border-top:.9mm solid #b98a2e;border-bottom:.9mm solid #b98a2e;pointer-events:none}.name-plaque b{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:7.4mm;line-height:.88;letter-spacing:-.035em;text-shadow:0 .25mm 0 #fff4d5}
      .top-scroll{position:absolute;left:82mm;top:8mm;width:116mm;height:28mm;z-index:10;padding:4mm 8mm;background:linear-gradient(90deg,#b9843d 0,#efd6a3 4%,#fff0c7 14%,#f3ddb0 86%,#b9843d 96%,#7b5423 100%);border:.65mm solid rgba(76,48,16,.72);border-radius:1.5mm;box-shadow:0 1mm 4mm rgba(30,16,0,.28),inset 0 0 0 .5mm rgba(255,255,255,.45);display:grid;grid-template-columns:1fr 1fr 1fr;gap:3.2mm 7mm}.top-scroll:before,.top-scroll:after{content:"";position:absolute;top:-2mm;width:7mm;height:32mm;border-radius:4mm;background:linear-gradient(90deg,#583412,#c09559,#5d3713);box-shadow:inset 0 0 0 .7mm rgba(27,14,3,.25)}.top-scroll:before{left:-5mm}.top-scroll:after{right:-5mm}.field .value{font-size:4.35mm;font-weight:900;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.field .label{font:800 1.65mm/1 system-ui,sans-serif;color:#5c3c13;text-transform:uppercase;letter-spacing:.06em;margin-top:.8mm}
      .ribbon{position:absolute;height:8mm;z-index:13;background:linear-gradient(#6a241f,#270c0b);border:.55mm solid #a67c25;color:#f7df93;box-shadow:0 .8mm 2.2mm rgba(21,10,0,.38),inset 0 0 0 .35mm rgba(255,229,120,.28);display:flex;align-items:center;justify-content:center;font:900 2.2mm/1 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase}.ribbon:before,.ribbon:after{content:"";position:absolute;top:1.1mm;border-top:2.9mm solid transparent;border-bottom:2.9mm solid transparent}.ribbon:before{left:-5mm;border-right:5mm solid #5a1b18}.ribbon:after{right:-5mm;border-left:5mm solid #5a1b18}.insp-label{left:15mm;top:38mm;width:31mm}.prof-label{left:51mm;top:38mm;width:32mm;background:linear-gradient(#7a2777,#371337)}.init-label{right:43mm;top:39mm;width:32mm}
      .small-token{position:absolute;background:radial-gradient(circle,#fff9e9 0 48%,#dbc08a 88%);border:.72mm solid rgba(87,57,16,.78);border-radius:50%;box-shadow:0 .9mm 2.4mm rgba(43,26,6,.24),inset 0 0 0 .5mm rgba(255,255,255,.64);display:flex;align-items:center;justify-content:center;flex-direction:column;font-weight:900;z-index:14}.small-token b{font-size:5.2mm;line-height:.85}.small-token span{font:900 1.45mm/1 system-ui,sans-serif;color:#5d3a0e;text-transform:uppercase;margin-top:.5mm;letter-spacing:.03em}.inspiration{left:40mm;top:40mm;width:12.5mm;height:12.5mm}.prof{left:65mm;top:47mm;width:13mm;height:13mm}.init{right:33mm;top:40mm;width:13mm;height:13mm}.ac{right:12mm;top:38mm;width:21mm;height:21mm}.speed{right:20mm;top:167mm;width:27mm;height:11mm;border-radius:2mm}.speed b{font-size:4.5mm}.speed span{font-size:1.55mm}
      .saving-title{position:absolute;left:18mm;top:58mm;width:52mm;height:7mm;z-index:12;background:linear-gradient(#b89138,#5b370d);color:#1b0b00;border:.5mm solid #9d7524;border-radius:5mm;text-align:center;font:900 2.4mm/6mm system-ui,sans-serif;text-transform:uppercase;text-shadow:0 .2mm #efd28c}.save-row{position:absolute;left:12mm;top:66mm;width:61mm;height:14mm;display:flex;gap:1.3mm;z-index:12}.save-gem{flex:1;border:.55mm solid rgba(76,48,16,.74);border-radius:5mm;background:linear-gradient(#fff4d1,#cda66a);text-align:center;padding-top:1mm;box-shadow:inset 0 0 0 .35mm rgba(255,255,255,.55),0 .6mm 1.7mm rgba(40,22,3,.22)}.save-gem b{font-size:3mm;display:block;line-height:1}.save-gem span{font:900 1.55mm/1 system-ui,sans-serif;color:#751d16}.save-gem:nth-child(2) span{color:#0f635e}.save-gem:nth-child(3) span{color:#446221}.save-gem:nth-child(4) span{color:#612b72}.save-gem:nth-child(5) span{color:#163976}.save-gem:nth-child(6) span{color:#80620e}
      .orn-stat{position:absolute;width:24mm;height:24mm;border-radius:50%;background:radial-gradient(circle,#fffaf0 0 44%,#d8b878 76%,#8a611f 100%);border:.9mm solid rgba(88,58,18,.78);box-shadow:0 1mm 3mm rgba(40,23,4,.28),inset 0 0 0 .75mm rgba(255,255,255,.58);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:11}.orn-stat:after{content:"";position:absolute;inset:-2.4mm;border-radius:50%;border:.6mm solid rgba(143,103,35,.62);clip-path:polygon(50% 0,62% 22%,86% 14%,78% 38%,100% 50%,78% 62%,86% 86%,62% 78%,50% 100%,38% 78%,14% 86%,22% 62%,0 50%,22% 38%,14% 14%,38% 22%)}.orn-score{font-size:8.3mm;font-weight:900;line-height:.78}.orn-label{font:900 1.75mm/1 system-ui,sans-serif;letter-spacing:.03em;color:#f7e7b3;background:#25160a;border:.35mm solid #a37a28;padding:.75mm 1.6mm;border-radius:1mm;text-transform:uppercase;margin-top:1mm}.orn-mod{position:absolute;left:-2.2mm;top:-2.2mm;width:8mm;height:8mm;border-radius:50%;background:#fff7dc;border:.52mm solid #84621f;display:flex;align-items:center;justify-content:center;font-size:2.8mm;font-weight:900;z-index:2}.str{left:82mm;top:51mm}.dex{left:111mm;top:43mm}.con{left:143mm;top:52mm}.int{left:172mm;top:72mm}.wis{left:177mm;top:108mm}.cha{left:176mm;top:139mm}
      .portrait-frame{position:absolute;left:72mm;top:67mm;width:72mm;height:126mm;z-index:5;border-radius:42mm 42mm 4mm 4mm;background:linear-gradient(90deg,#5a350e,#d0a243,#5a350e);padding:1.2mm;box-shadow:0 1.8mm 7mm rgba(5,3,1,.52),0 0 20mm rgba(255,205,85,.16)}.portrait-wrap{width:100%;height:100%;border-radius:40mm 40mm 3mm 3mm;overflow:hidden;background:radial-gradient(circle at 50% 15%,#fff9e8,#d9bf87);box-shadow:inset 0 0 7mm rgba(255,255,255,.75)}.portrait-wrap img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;filter:saturate(1.08) contrast(1.04)}.portrait-loading{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:8mm;color:#6b4b16;font-weight:700;font-size:3mm;line-height:1.5;flex-direction:column;gap:3mm}.portrait-fail{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:8mm;color:#6b4b16;font-weight:900;font-size:3.2mm;line-height:1.35}.portrait-blank{height:100%;background:#fff;display:flex;align-items:flex-end;justify-content:center;text-align:center;padding:6mm;color:#c9b489;font-weight:700;font-size:3mm;letter-spacing:.02em}.portrait-cap{position:absolute;left:72mm;top:191mm;width:72mm;height:9mm;background:linear-gradient(90deg,#2a1809,#574015,#2a1809);border:.7mm solid #a47a28;z-index:14;box-shadow:0 .8mm 3mm rgba(29,15,2,.35);border-radius:0 0 3mm 3mm}.portrait-cap:after{content:"✦";position:absolute;left:50%;transform:translateX(-50%);top:-4.5mm;width:10mm;height:10mm;border-radius:50%;background:#271607;color:#47d17b;border:.6mm solid #9e7628;display:flex;align-items:center;justify-content:center;font-size:4mm}
      .panel{position:absolute;z-index:13;background:linear-gradient(rgba(255,244,211,.93),rgba(232,204,146,.88));backdrop-filter:blur(1.1mm);border:.75mm solid rgba(78,50,16,.82);box-shadow:0 1.4mm 5mm rgba(22,13,3,.38),inset 0 0 0 .55mm rgba(255,255,255,.52);border-radius:1.7mm;padding:4mm;overflow:hidden}.panel:before{content:"";position:absolute;inset:1.3mm;border:.35mm solid rgba(150,109,39,.32);pointer-events:none}.panel h2{position:relative;margin:0 0 3mm;text-align:center;font-size:6.2mm;line-height:.9;color:#221004}.skills{left:10mm;top:86mm;width:55mm;height:105mm;overflow:hidden}.skills h2{font-size:7.2mm}.panel table{position:relative;width:100%;border-collapse:collapse}.panel td{border-bottom:.23mm solid rgba(107,75,22,.25);font-size:2.58mm;line-height:1.02;padding:.48mm 0}.panel td:last-child{text-align:right;font-weight:900}.attacks{left:12mm;bottom:14mm;width:61mm;height:68mm;padding-top:10mm;overflow:hidden}.hp{left:77mm;bottom:14mm;width:56mm;height:68mm;text-align:center;padding:9mm 3.5mm 3mm;overflow:visible;display:flex;flex-direction:column;}.traits{right:12mm;bottom:14mm;width:60mm;height:68mm;padding-top:11mm;overflow:hidden}.panel-titlebar{position:absolute;left:-.8mm;right:-.8mm;top:-.8mm;height:8mm;background:linear-gradient(#2d1d0e,#0f0905);color:#f2d68b;border:.6mm solid #9f7627;box-shadow:inset 0 0 0 .35mm rgba(255,224,133,.25);z-index:2;display:flex;align-items:center;justify-content:center;font:900 3.35mm/1 Georgia,serif;text-shadow:0 .4mm #000}.panel-titlebar.gold{background:linear-gradient(#5b3b12,#1b1005)}.attack-row{position:relative;display:grid;grid-template-columns:1fr 11mm 20mm;gap:1mm;border-bottom:.25mm solid rgba(107,75,22,.27);padding:1.35mm 0;font-size:2.75mm;line-height:1.0}.attack-row b{font-size:3.05mm}.hp-top{display:grid;grid-template-columns:1fr 1fr;gap:1.5mm 3mm;align-items:center;border-bottom:.4mm solid rgba(107,75,22,.35);padding-bottom:2mm;margin-bottom:2mm;flex-shrink:0}.hp-num{font-size:11mm;font-weight:900;line-height:.85;text-align:right}.hp-lab{font:800 1.7mm/1.2 system-ui,sans-serif;text-transform:uppercase;color:#6e4a17}.hp-current{flex:1;min-height:11mm;border-bottom:.5mm solid rgba(107,75,22,.42);display:flex;align-items:center;justify-content:center;color:rgba(70,43,16,.18);font-size:5.5mm;font-weight:900;margin-bottom:2mm}.death{display:flex;justify-content:center;gap:3.5mm;flex-shrink:0;padding-bottom:1mm}.death span{width:4mm;height:4mm;border-radius:50%;border:.5mm solid #7b5118;background:#fff4d3;display:inline-block;margin:0 .4mm}.traits li{position:relative;font-size:2.72mm;line-height:1.08;margin-bottom:.95mm;break-inside:avoid;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.traits ul{position:relative;margin:0;padding-left:4.2mm}.langs{position:absolute;left:9mm;right:9mm;bottom:2mm;height:6mm;background:linear-gradient(90deg,rgba(30,14,2,.92),rgba(60,34,8,.92),rgba(30,14,2,.92));border-top:.55mm solid #9d7524;display:flex;align-items:center;justify-content:center;font-size:2.85mm;color:#f2d68b;z-index:15;padding:0 8mm;letter-spacing:.03em;text-align:center;box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-radius:0 0 2mm 2mm}.subtle-caption{font:800 1.7mm/1 system-ui,sans-serif;color:#6e4a17;text-transform:uppercase;letter-spacing:.08em}.left-sword{position:absolute;left:2.8mm;bottom:19mm;width:7mm;height:78mm;background:linear-gradient(90deg,#411b07,#d09b32,#3d1905);border-radius:3mm;z-index:12;box-shadow:0 0 5mm rgba(255,55,155,.5)}.left-sword:before{content:"";position:absolute;left:1.9mm;top:-14mm;border-left:1.7mm solid transparent;border-right:1.7mm solid transparent;border-bottom:16mm solid #e7c071}.dragon-mark{position:absolute;left:70mm;top:39mm;font-size:38mm;color:rgba(90,50,7,.32);z-index:2;transform:rotate(-10deg)}
      @media print{
        .ornate-sheet{margin:0!important;box-shadow:none!important}
        .portrait-wrap img{display:block!important}
        /* PDF viewers (Preview/Adobe) render glows, clip-path and masks as black boxes — drop them for print */
        .ornate-sheet *{box-shadow:none!important}
        .orn-stat:after,.rune-ring:after,.rune-ring:before{display:none!important}
      }
    `}</style>
    <div className="orn-bg"/><div className="orn-veil"/><div className="rune-ring"/><div className="dragon-mark">☽</div><div className="left-sword"/>
    <div className="brand">Asaheim Fantasy Sheet</div>
    <div className="name-plaque"><b>{sh.name}</b></div>
    <div className="top-scroll">
      <div className="field"><div className="value">{sh.classLevel}</div><div className="label">{t("Class & Level")}</div></div>
      <div className="field"><div className="value">{sh.background}</div><div className="label">{t("Background")}</div></div>
      <div className="field"><div className="value">{sh.playerName||"\u00a0"}</div><div className="label">{t("Player Name")}</div></div>
      <div className="field"><div className="value">{sh.species}</div><div className="label">{t("Race")}</div></div>
      <div className="field"><div className="value">{sh.alignment}</div><div className="label">{t("Alignment")}</div></div>
      <div className="field"><div className="value">{xpForClassLevel(sh.classLevel)}</div><div className="label">{t("Experience Points")}</div></div>
    </div>
    <div className="ribbon insp-label">{t("Inspiration")}</div><div className="small-token inspiration"><b>0</b></div>
    <div className="ribbon prof-label">{t("Proficiency Bonus")}</div><div className="small-token prof"><b>{sh.profBonus}</b></div>
    <div className="ribbon init-label">{t("Initiative")}</div><div className="small-token init"><b>{sgn(sh.initiative)}</b></div>
    <div className="small-token ac"><b>{sh.ac}</b><span>AC</span></div>
    <div className="saving-title">{t("Saving Throws")}</div>
    <div className="save-row">{AB.map(a=><SavePip key={a} ab={a}/>)}</div>

    <StatCard ab="STR" className="str"/><StatCard ab="DEX" className="dex"/><StatCard ab="CON" className="con"/><StatCard ab="INT" className="int"/><StatCard ab="WIS" className="wis"/><StatCard ab="CHA" className="cha"/>

    <div className="portrait-frame"><div className="portrait-wrap">{sh.portraitMode==="blank"?<div className="portrait-blank">{t("Draw your portrait here")}</div>:<>{portraitFailed?<div className="portrait-fail">{t("Portrait could not load.")}<br/>{t("Try Generate Sheet again.")}</div>:portraitLoading?<div className="portrait-loading"><span style={{fontSize:"6mm"}}>🎨</span><span>{t("Painting portrait…")}</span></div>:null}{!portraitFailed&&<img src={portrait} onLoad={()=>setPortraitLoading(false)} onError={()=>{setPortraitFailed(true);setPortraitLoading(false);}} style={{display:portraitLoading?"none":"block",width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",filter:"saturate(1.08) contrast(1.04)"}}/>}</>}</div></div><div className="portrait-cap"/>

    <div className="panel skills"><h2>{t("Skills")}</h2><table><tbody>{skillRows.map(sk=><tr key={sk.name}><td>{(sh.expertise||[]).includes(sk.name)?"◉":sh.skills?.includes(sk.name)?"●":"○"} {sk.name} ({sk.ab})</td><td>{skillBonus(sk)}</td></tr>)}</tbody></table><div style={{position:"relative",marginTop:"2mm",paddingTop:"1.5mm",borderTop:".3mm solid rgba(107,75,22,.35)",fontSize:"2.55mm"}}>{t("Passive Perception")} <b style={{float:"right"}}>{sh.passivePerc}</b></div></div>

    <div className="panel attacks"><div className="panel-titlebar">{t("Attacks & Spellcasting")}</div>{sh.equippedGear&&<div style={{position:"relative",fontSize:"2.4mm",color:"#6e4a17",marginBottom:"1mm",paddingBottom:"1mm",borderBottom:".25mm solid rgba(107,75,22,.3)"}}>{t("Equipped")}: {sh.equippedGear}</div>}{sh.acBreakdown&&<div style={{position:"relative",fontSize:"2.3mm",color:"#6e4a17",marginBottom:"1.5mm",paddingBottom:"1mm",borderBottom:".25mm solid rgba(107,75,22,.3)"}}>{t("AC")} {sh.ac}: {sh.acBreakdown}</div>}{weaponRows.map((w,i)=>{const showMastery=w.masteredActive&&w.mastery!=="—";const DA=CURRENT_LANG==="da";return <div key={i}>
        <div className="attack-row"><b>{w.name}</b>{showMastery&&<span style={{fontSize:"2mm",fontWeight:700,color:"#7c2d12",border:".25mm solid #7c2d12",borderRadius:".7mm",padding:"0 .8mm",marginLeft:"1mm"}}>{w.mastery}</span>}<span>{w.atk}</span><span>{w.dmg}</span></div>
        {showMastery&&<div style={{position:"relative",fontSize:"2mm",lineHeight:1.25,color:"#6e4a17",fontStyle:"italic",marginTop:"-0.8mm",marginBottom:"0.8mm"}}>{(DA?MASTERY_DESC_DA[w.mastery]:MASTERY_DESC[w.mastery])||""}</div>}
      </div>;})}
    </div>

    <div className="panel hp"><div className="panel-titlebar gold">{t("Hit Points")}</div><div className="hp-top"><div><div className="hp-lab">{t("Hit Dice")}</div><div style={{fontSize:"4.2mm",fontWeight:900,marginTop:"0.5mm"}}>{sh.hitDice}</div></div><div><div className="hp-lab">{t("HP Max")}</div><div className="hp-num">{sh.hpMax}</div></div></div><div className="hp-current">{t("CURRENT HP")}</div><div className="death"><div style={{textAlign:"center"}}><div className="subtle-caption" style={{marginBottom:"1.5mm"}}>{t("Successes")}</div><div><span/><span/><span/></div></div><div style={{textAlign:"center"}}><div className="subtle-caption" style={{marginBottom:"1.5mm"}}>{t("Failures")}</div><div><span/><span/><span/></div></div></div></div>

    <div className="panel traits"><div className="panel-titlebar">{t("Resources")}</div>
      {sh.resource?<div style={{position:"relative",marginTop:"1mm"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}><b style={{fontSize:"3.3mm"}}>{sh.resource.name}</b>{sh.resource.note&&<span style={{fontSize:"2.3mm",color:"#6e4a17"}}>{sh.resource.note}</span>}</div>
        {sh.resource.desc&&<div style={{fontSize:"2.15mm",lineHeight:1.25,color:"#4a3410",marginTop:"0.8mm",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{sh.resource.desc[CURRENT_LANG==="da"?1:0]}</div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:"1mm",marginTop:"1.5mm"}}>{Array.from({length:Math.min(sh.resource.uses,24)}).map((_,i)=><span key={i} style={{width:"3.6mm",height:"3.6mm",borderRadius:"50%",border:".5mm solid #7b5118",background:"#fff4d3",display:"inline-block"}}/>)}</div>
        <div style={{fontSize:"2.2mm",color:"#6e4a17",marginTop:"1.5mm"}}>{sh.resource.recharge}</div>
      </div>:<div style={{position:"relative",fontSize:"2.6mm",fontStyle:"italic",color:"#6e4a17",marginTop:"2mm"}}>{t("No tracked resource pool")}</div>}
      <div style={{position:"relative",marginTop:"1.5mm",paddingTop:"1.2mm",borderTop:".3mm solid rgba(107,75,22,.35)"}}>
        <div className="subtle-caption" style={{marginBottom:"1mm"}}>{t("Other Notes")}</div>
        <ul style={{margin:0,padding:"0 0 0 4.2mm"}}>{(sh.features||"").split("\n").filter(l=>/^(Second Wind|Action Surge|Ki|Superiority Dice|Psionic|Metamagic|Weapon Mastery)/i.test(l.trim())).filter(l=>!sh.resource||!l.trim().toLowerCase().startsWith(sh.resource.name.toLowerCase())).slice(0,2).map((line,i)=><li key={i} style={{fontSize:"2.5mm",lineHeight:1.1,marginBottom:"0.8mm"}}>{line.length>44?line.slice(0,44)+"…":line}</li>)}</ul>
      </div>
      <div style={{position:"absolute",left:0,right:0,bottom:"1.5mm",textAlign:"center",fontSize:"2.4mm",fontStyle:"italic",color:"#8a6a2a"}}>{t("Descriptions on page 2")}</div>
    </div>
    <div className="small-token speed"><b>{sh.speed} ft.</b><span>{t("Speed")}</span></div>
    <div className="langs">{sh.weaponProf?`⚔ ${sh.weaponProf}  ·  `:""}{sh.toolProf?`🛠 ${sh.toolProf}  ·  `:""}{t("Languages")}: {lang||"Common"}</div>
  </div>;
}

function Page1({sh}){
  const{name,classLevel,background,species,alignment,finalStats,ac,initiative,speed,hpMax,hitDice,profBonus,saves,skills,passivePerc,weapons,spellAbility,spellAtk,spellDC,isCaster,profLangs,features,originFeat,traits,ideals,bonds,flaws,gp,equipment,equippedGear,resource}=sh;
  return(<div className="page" style={pgStyle}>
    <div style={{display:"grid",gridTemplateColumns:"64px 1fr",gap:10,marginBottom:6,alignItems:"start"}}>
      <div style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",height:64}}><svg viewBox="0 0 50 50" width={50} height={50}><path d="M25 3 L47 13 L47 31 C47 43 25 48 25 48 C25 48 3 43 3 31 L3 13 Z" fill="none" stroke={RULE} strokeWidth={1.5}/><text x={25} y={22} textAnchor="middle" fontSize={9} fontFamily="serif" fontWeight="bold" fill={GOLD}>D&D</text><text x={25} y={32} textAnchor="middle" fontSize={6} fontFamily="sans-serif" fill={GOLD_L}>2024</text></svg></div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        <div style={{borderBottom:"1.5px solid "+GOLD_L,paddingBottom:2}}><div style={{fontSize:18,fontWeight:700,fontFamily:"serif",lineHeight:1}}>{name}</div><div style={{...capL}}>Character Name</div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>{[["Class and Level",classLevel],["Background",background],["Player",""]].map(([l,v])=><div key={l} style={{borderBottom:"0.5px solid "+RULE,paddingBottom:1}}><div style={{fontSize:9,fontFamily:"sans-serif"}}>{v||"—"}</div><div style={{...capL}}>{l}</div></div>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>{[["Species",species],["Alignment",alignment],["XP",xpForClassLevel(classLevel)]].map(([l,v])=><div key={l} style={{borderBottom:"0.5px solid "+RULE,paddingBottom:1}}><div style={{fontSize:9,fontFamily:"sans-serif"}}>{v||"—"}</div><div style={{...capL}}>{l}</div></div>)}</div>
      </div>
    </div>
    <ORul/>
    <div style={{display:"grid",gridTemplateColumns:"68px 1fr 1fr",gap:6}}>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {AB.map(a=><PAbl key={a} ab={a} score={finalStats[a]}/>)}
        <div style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,padding:"4px 5px",marginTop:2,textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,fontFamily:"serif"}}>{sgn(profBonus)}</div><div style={{fontSize:5.5,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif",textAlign:"center"}}>Prof. Bonus</div></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        <PSec title="Saving Throws">{AB.map(a=><PRow key={a} prof={saves.includes(a)} name={AB_FULL[a]} ab={a} bonus={sgn(mf(finalStats[a])+(saves.includes(a)?profBonus:0))}/>)}</PSec>
        <PSec title="Skills" style={{flex:1}}>{SKILL_LIST.map(sk=>{const bon=mf(finalStats[sk.ab])+(skills.includes(sk.name)?profBonus:0);return <PRow key={sk.name} prof={skills.includes(sk.name)} name={sk.name} ab={sk.ab} bonus={sgn(bon)}/>;})}        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6,paddingTop:4,borderTop:"0.5px solid "+RULE}}><span style={{fontSize:7,color:GOLD,fontFamily:"sans-serif",opacity:0.8}}>Passive Perception</span><span style={{fontSize:8,fontWeight:700,fontFamily:"sans-serif"}}>{passivePerc}</span></div></PSec>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        <div style={{display:"flex",justifyContent:"space-around",alignItems:"flex-end"}}><PShield label="Armor Class" value={ac}/><PShield label="Initiative" value={sgn(initiative)}/><PShield label="Speed" value={speed+"ft"}/></div>
        <PSec title="Hit Points"><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{textAlign:"center",flexShrink:0}}><div style={{fontSize:18,fontWeight:700,fontFamily:"serif",lineHeight:1}}>{hpMax}</div><div style={{...capL,textAlign:"center",fontSize:6}}>Maximum</div></div><div style={{flex:1}}><div style={{...capL,fontSize:6,marginBottom:2}}>Current HP</div><div style={{borderBottom:"1.5px solid "+INK,minHeight:22}}/></div><div style={{flex:0.7}}><div style={{...capL,fontSize:6,marginBottom:2}}>Temporary</div><div style={{borderBottom:"1.5px solid "+INK,minHeight:22}}/></div></div></PSec>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
          <PSec title="Hit Dice"><div style={{textAlign:"center",fontSize:16,fontWeight:700,fontFamily:"serif",paddingTop:2}}>{hitDice}</div></PSec>
          <PSec title="Death Saves"><div style={{display:"flex",flexDirection:"column",gap:4}}><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{...capL,fontSize:6,marginBottom:0,flex:1}}>Successes</span>{[0,1,2].map(i=><Pip key={i} size={8}/>)}</div><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{...capL,fontSize:6,marginBottom:0,flex:1}}>Failures</span>{[0,1,2].map(i=><Pip key={i} size={8} danger/>)}</div></div></PSec>
        </div>
        <PSec title="Attacks and Spellcasting">
          {equippedGear&&<div style={{fontSize:6.5,color:"#6b4f1a",fontFamily:"sans-serif",marginBottom:4,paddingBottom:4,borderBottom:"0.5px solid "+RULE}}><span style={{...capL,fontSize:5.5,marginRight:4}}>{t("Equipped")}:</span>{equippedGear}</div>}
          {isCaster&&spellAbility&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:5,textAlign:"center"}}>{[["Ability",spellAbility],["Atk Bonus",spellAtk],["Save DC",spellDC]].map(([l,v])=><div key={l}><div style={{fontSize:13,fontWeight:700,fontFamily:"serif"}}>{v}</div><div style={{...capL,textAlign:"center",fontSize:5.5}}>{l}</div></div>)}</div>}
          <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"sans-serif"}}><thead><tr style={{borderBottom:"1px solid "+RULE}}>{["Weapon","Atk","Dmg","Mastery"].map(h=><th key={h} style={{textAlign:"left",padding:"1px 3px",fontSize:6.5,color:GOLD,fontWeight:600,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{weapons.map((w,i)=><tr key={i} style={{borderBottom:"0.5px solid #ede3cc"}}><td style={{padding:"3px 3px",fontSize:8,fontWeight:600}}>{w.name}</td><td style={{padding:"3px 3px",fontSize:8}}>{w.atk}</td><td style={{padding:"3px 3px",fontSize:7.5,color:"#444"}}>{w.dmg}</td>          <td style={{padding:"3px 3px",fontSize:7.5,color:"#6b4f1a",fontWeight:600}}>{w.mastery||"—"}</td></tr>)}</tbody></table>
        </PSec>
        <PSec title="Proficiencies and Languages"><div style={{fontSize:7.5,whiteSpace:"pre-wrap",lineHeight:1.6,fontFamily:"sans-serif"}}>{profLangs}</div></PSec>
      </div>
    </div>
    <ORul/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:2}}>
      <PSec title="Resources" style={{display:"flex",flexDirection:"column"}}>
        <div style={{flex:1}}>
          {resource?<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}><span style={{fontSize:9,fontWeight:700,fontFamily:"serif"}}>{resource.name}</span>{resource.note&&<span style={{fontSize:6.5,color:"#6b4f1a",fontFamily:"sans-serif"}}>{resource.note}</span>}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:4}}>{Array.from({length:Math.min(resource.uses,24)}).map((_,i)=><Pip key={i} size={9}/>)}</div>
            <div style={{fontSize:6,color:GOLD,fontFamily:"sans-serif",opacity:0.8,marginTop:4}}>{resource.recharge}</div>
          </div>:<div style={{fontSize:7,fontFamily:"sans-serif",color:"#999",fontStyle:"italic"}}>{t("No tracked resource pool")}</div>}
          <div style={{marginTop:8,paddingTop:5,borderTop:"0.5px solid "+RULE}}>
            <div style={{...capL,fontSize:5.5,marginBottom:3}}>{t("Other Notes")}</div>
            <div style={{fontSize:6.5,lineHeight:1.4,fontFamily:"sans-serif",color:"#777"}}>
              {(features.split("\n").filter(l=>/^(Second Wind|Action Surge|Ki|Superiority Dice|Psionic|Metamagic|Wild Shape|Weapon Mastery)/i.test(l.trim())).slice(0,3)).map((line,i)=><div key={i}>{line.length>60?line.slice(0,60)+"\u2026":line}</div>)}
              <div style={{fontStyle:"italic",marginTop:2}}>{t("Full features on page 2")}</div>
            </div>
          </div>
        </div>
        {originFeat&&<div style={{marginTop:5,paddingTop:3,borderTop:"0.5px solid "+RULE}}><span style={{...capL,display:"inline",fontSize:6}}>Origin Feat: </span><span style={{fontSize:7,fontFamily:"sans-serif"}}>{originFeat}</span></div>}
      </PSec>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>{[["Personality Traits",traits],["Ideals",ideals],["Bonds",bonds],["Flaws",flaws]].map(([l,v])=><div key={l} style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,padding:"4px 6px"}}><div style={{fontSize:7,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700,color:GOLD,fontFamily:"sans-serif",textAlign:"center",borderBottom:"0.5px solid "+RULE,marginBottom:3,paddingBottom:2}}>{l}</div><div style={{fontSize:7.5,lineHeight:1.55,fontFamily:"sans-serif"}}>{v||"—"}</div></div>)}</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <div style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,padding:"5px 7px"}}><div style={{fontSize:7,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700,color:GOLD,fontFamily:"sans-serif",textAlign:"center",borderBottom:"0.5px solid "+RULE,marginBottom:4,paddingBottom:2}}>Currency</div><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:3,textAlign:"center"}}>{[["CP","#b87333"],["SP","#aaa"],["EP","#8fbc8f"],["GP","#d4af37"],["PP","#e5e4e2"]].map(([l,c])=><div key={l} style={{textAlign:"center"}}><div style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid "+RULE,background:c+"22",margin:"0 auto"}}/><div style={{...capL,textAlign:"center",marginTop:4,fontSize:6}}>{l}</div></div>)}</div></div>
        <PSec title="Equipment" style={{flex:1}}><div style={{fontSize:7,whiteSpace:"pre-wrap",lineHeight:1.5,fontFamily:"sans-serif"}}>{equipment}</div></PSec>
      </div>
    </div>
    <div style={{marginTop:7,borderTop:"0.5px solid "+RULE,paddingTop:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>D&D 2024 SRD 5.2</span><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>Page 1{sh.isCaster?" of 2":""}</span></div>
  </div>);
}

function Page2({sh}){
  const{name,classLevel,spellAbility,spellAtk,spellDC,spellSlots,spellsByLevel,isCaster}=sh;
  const LVLL=["Cantrips","1st","2nd","3rd","4th","5th","6th","7th","8th","9th"];
  // Parse the features text into readable entries (bold the label before the colon).
  const featEntries=(sh.features||"").split("\n").map(l=>l.trim()).filter(l=>l&&l!=="--");
  const DAMAGE_RE=/\d+d\d+|\bdamage\b|\bskade\b/i;
  const cardEntries=[],textEntries=[];
  featEntries.forEach(line=>{
    const ci=line.indexOf(":");
    const isHead=/^[A-Z].*:$/.test(line)&&line.length<40;
    if(isHead){textEntries.push(line);return;}
    const rest=ci>0?line.slice(ci+1):"";
    (DAMAGE_RE.test(rest)?cardEntries:textEntries).push(line);
  });
  return(<div className="page" style={{...pgStyle,width:"210mm",height:"297mm",display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{flex:"0 0 auto",display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:"1.5px solid "+GOLD_L,paddingBottom:5,marginBottom:6}}>
      <div><div style={{fontSize:16,fontWeight:700,fontFamily:"serif"}}>{name}</div><div style={{...capL,fontSize:6}}>{classLevel} - {isCaster?t("Features & Spells"):t("Features & Traits")}</div></div>
      {isCaster&&<div style={{display:"flex",gap:12}}>{[["Ability",spellAbility],["Spell Attack",spellAtk],["Save DC",spellDC]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,fontFamily:"serif"}}>{v}</div><div style={{...capL,fontSize:5.5,textAlign:"center"}}>{l}</div></div>)}</div>}
    </div>
    <div style={{flex:"0 1 auto",overflow:"hidden",marginBottom:6}}>
      <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif",marginBottom:4}}>{t("Features & Traits")}</div>
      {cardEntries.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:5,marginBottom:6}}>{cardEntries.map((line,i)=>{
        const ci=line.indexOf(":");
        const label=ci>0?line.slice(0,ci).replace(/^•\s*/,""):null;
        const rest=ci>0?line.slice(ci+1).trim():"";
        return <div key={i} style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,padding:"5px 6px"}}>
          <div style={{fontSize:8.5,fontWeight:700,fontFamily:"serif",lineHeight:1.2,marginBottom:rest?2:0}}>{label||line}</div>
          {rest&&<div style={{fontSize:7,lineHeight:1.5,color:"#333",fontFamily:"sans-serif"}}>{rest}</div>}
        </div>;
      })}</div>}
      <div style={{columnCount:2,columnGap:14}}>{textEntries.map((line,i)=>{const ci=line.indexOf(":");const isHead=/^[A-Z].*:$/.test(line)&&line.length<40;const label=ci>0?line.slice(0,ci):null;const rest=ci>0?line.slice(ci+1):line;return <div key={i} style={{breakInside:"avoid",fontSize:7.5,lineHeight:1.4,fontFamily:"sans-serif",marginBottom:3,color:"#222"}}>{isHead?<span style={{fontWeight:800,color:GOLD}}>{line}</span>:label?<span><b>{label.replace(/^•\s*/,"")}:</b>{rest}</span>:line}</div>;})}</div>
    </div>
    {isCaster&&<div style={{flex:"0 1 auto",overflow:"hidden"}}>
    <div style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,padding:"6px 8px",marginBottom:6}}>
      <div style={{fontSize:7,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700,color:GOLD,fontFamily:"sans-serif",textAlign:"center",borderBottom:"0.5px solid "+RULE,marginBottom:4,paddingBottom:2}}>Spell Slots</div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${spellSlots.filter(s=>s>0).length||1},1fr)`,gap:4,textAlign:"center"}}>
        {spellSlots.map((cnt,i)=>cnt>0?(<div key={i}><div style={{...capL,textAlign:"center",fontSize:5.5,marginBottom:3}}>{LVLL[i+1]}</div><div style={{display:"flex",flexWrap:"wrap",gap:2,justifyContent:"center"}}>{Array.from({length:cnt}).map((_,j)=><div key={j} style={{width:10,height:10,borderRadius:"50%",border:"1px solid "+RULE,background:GOLD_L}}/>)}</div></div>):null)}
      </div>
    </div>
    {LVLL.map((lvl,li)=>{const spells=spellsByLevel[li]||[];if(!spells.length)return null;return <div key={lvl} style={{marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif",whiteSpace:"nowrap"}}>{lvl}</div>{li>0&&<div style={{...capL,fontSize:6,marginBottom:0}}>{spellSlots[li-1]||0} slots</div>}<div style={{flex:1,height:"0.5px",background:RULE}}/></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:5}}>{spells.map((sp,i)=><div key={i} style={{background:sp.source?"#fff8e6":"#fff",border:"1px solid "+(sp.source?"#d4a017":RULE),borderRadius:4,padding:"5px 6px"}}><div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:2,flexWrap:"wrap"}}><span style={{fontSize:8.5,fontWeight:700,fontFamily:"serif",lineHeight:1.2}}>{sp.name}</span>{sp.conc&&<span style={{fontSize:5.5,fontWeight:700,color:"#7c2d12",border:"0.5px solid #7c2d12",borderRadius:2,padding:"0 2px",whiteSpace:"nowrap"}}>C</span>}{sp.source&&<span style={{fontSize:5,fontWeight:700,color:"#8a5a00",border:"0.5px solid #d4a017",borderRadius:2,padding:"0 3px",whiteSpace:"nowrap",textTransform:"uppercase",letterSpacing:"0.03em"}}>{sp.source}</span>}</div><div style={{fontSize:6,color:"#666",fontFamily:"sans-serif",lineHeight:1.4,marginBottom:2}}>{[sp.cast,sp.range,sp.dur,sp.comp].filter(Boolean).join(" · ")}</div><div style={{fontSize:7,lineHeight:1.55,color:"#333",fontFamily:"sans-serif"}}>{sp.desc}</div>{sp.pg&&<div style={{fontSize:5.5,color:"#999",fontFamily:"sans-serif",marginTop:2}}>PHB p.{sp.pg}</div>}</div>)}</div></div>;})}
    </div>}
    <div style={{flex:"1 1 0",minHeight:0,display:"flex",flexDirection:"column",marginTop:2}}>
      <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif",marginBottom:4,flex:"0 0 auto"}}>{t("Backstory")}</div>
      <div style={{flex:1,minHeight:0,overflow:"hidden",border:"1px solid "+RULE,borderRadius:4,padding:"6px 8px",background:"#fff"}}>
        <div style={{fontSize:7.6,lineHeight:1.6,fontFamily:"sans-serif",color:"#222",whiteSpace:"pre-wrap"}}>{sh.backstory||""}</div>
        {!sh.backstory&&<div>{Array.from({length:8}).map((_,i)=><div key={i} style={{borderBottom:"0.5px dashed #ddd",height:"5.5mm"}}/>)}</div>}
      </div>
    </div>
    <div style={{flex:"0 0 auto",marginTop:5,borderTop:"0.5px solid "+RULE,paddingTop:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>D&D 2024 SRD 5.2</span><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>Page 2 of {sh.subclass==="Wild Magic Sorcery"?4:3}</span></div>
  </div>);
}

function Page3({sh}){
  const forms=sh.wildShapeForms||[];
  const ABBR=["STR","DEX","CON","INT","WIS","CHA"];
  return(<div className="page" style={{...pgStyle,width:"210mm",height:"297mm",display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{flex:"0 0 auto",display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:"1.5px solid "+GOLD_L,paddingBottom:5,marginBottom:8}}>
      <div><div style={{fontSize:16,fontWeight:700,fontFamily:"serif"}}>{sh.name}</div><div style={{...capL,fontSize:6}}>{sh.classLevel} - {forms.length?t("Wild Shape Forms")+" & "+t("Inventory"):t("Inventory")}</div></div>
    </div>
    <div style={{flex:"0 0 auto",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}><span style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif"}}>{t("Inventory")}</span><span style={{fontSize:8,fontWeight:700,fontFamily:"serif"}}>{sh.gp||0} GP</span></div>
      <div style={{border:"1px solid "+RULE,borderRadius:4,padding:"6px 8px",background:"#fff",height:forms.length?"55mm":"110mm",overflow:"hidden"}}>
        <div style={{fontSize:8,lineHeight:1.7,fontFamily:"sans-serif",color:"#222",columnCount:forms.length?1:2,columnGap:14}}>
          {(sh.inventory||"").split("\n").filter(Boolean).map((it,i)=><div key={i} style={{breakInside:"avoid"}}>• {it}</div>)}
          {Array.from({length:forms.length?7:16}).map((_,i)=><div key={"blank"+i} style={{breakInside:"avoid",borderBottom:"0.5px dashed #ccc",height:"5.5mm"}}/>)}
        </div>
      </div>
    </div>
    {forms.length>0&&<div style={{flex:"1 1 0",minHeight:0,overflow:"hidden",display:"grid",gridTemplateColumns:forms.length>2?"1fr 1fr":"1fr",gridAutoRows:"min-content",gap:7,alignContent:"start"}}>
      {forms.map(name=>{const b=WILDSHAPE_BEASTS[name];if(!b)return null;return(
        <div key={name} style={{background:"#fff",border:"1px solid "+RULE,borderRadius:5,padding:"6px 8px",breakInside:"avoid"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderBottom:"0.5px solid "+RULE,paddingBottom:2,marginBottom:3}}>
            <span style={{fontSize:10,fontWeight:700,fontFamily:"serif"}}>{name}</span>
            <span style={{fontSize:6.5,color:"#666",fontFamily:"sans-serif"}}>CR {b.cr}</span>
          </div>
          <div style={{fontSize:7,fontFamily:"sans-serif",color:"#333",marginBottom:2}}>
            <b>AC</b> {b.ac} · <b>HP</b> {b.hp} · <b>{t("Speed")}</b> {b.speed}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:2,textAlign:"center",marginBottom:3,background:"#f7f3e8",borderRadius:3,padding:"2px 0"}}>
            {ABBR.map((ab,i)=><div key={ab}><div style={{fontSize:5.5,color:GOLD,fontWeight:700}}>{ab}</div><div style={{fontSize:7,fontWeight:700}}>{b.stats[i]}</div><div style={{fontSize:5.5,color:"#666"}}>{sgn(mf(b.stats[i]))}</div></div>)}
          </div>
          <div style={{fontSize:6.6,fontFamily:"sans-serif",color:"#333",lineHeight:1.5}}>
            {b.skills&&<div><b>{t("Skills")}:</b> {b.skills}</div>}
            {b.resist&&<div><b>Resistances:</b> {b.resist}</div>}
            <div><b>{t("Senses")}:</b> {b.senses}</div>
            <div><b>{t("Languages")}:</b> {b.lang}</div>
          </div>
          {b.traits.length>0&&<div style={{marginTop:3}}>{b.traits.map(([tn,td])=><div key={tn} style={{fontSize:6.8,fontFamily:"sans-serif",color:"#222",lineHeight:1.4,marginBottom:2}}><b style={{fontStyle:"italic"}}>{tn}.</b> {td}</div>)}</div>}
          <div style={{fontSize:6.8,fontFamily:"sans-serif",color:"#222",lineHeight:1.4,marginTop:3,paddingTop:2,borderTop:"0.5px solid "+RULE}}><b>{t("Attack")}:</b> {b.atk}</div>
        </div>
      );})}
    </div>}
    <div style={{flex:"0 0 auto",marginTop:5,borderTop:"0.5px solid "+RULE,paddingTop:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>D&D 2024 SRD 5.2</span><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>Page 3 of {sh.subclass==="Wild Magic Sorcery"?4:3}</span></div>
  </div>);
}

function Page4({sh}){
  return(<div className="page" style={{...pgStyle,width:"210mm",height:"297mm",display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{flex:"0 0 auto",display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:"1.5px solid "+GOLD_L,paddingBottom:5,marginBottom:8}}>
      <div><div style={{fontSize:16,fontWeight:700,fontFamily:"serif"}}>{sh.name}</div><div style={{...capL,fontSize:6}}>{sh.classLevel} - {t("Wild Magic Surge")}</div></div>
    </div>
    <div style={{fontSize:7.5,fontFamily:"sans-serif",color:"#555",marginBottom:8,fontStyle:"italic"}}>{t("Roll 1d100 immediately after casting a Sorcerer spell with a spell slot, once per turn, on a 20 rolled for Wild Magic Surge.")}</div>
    <div style={{flex:"1 1 0",minHeight:0,overflow:"hidden",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,alignContent:"start"}}>
      {WILD_MAGIC_SURGE.map(([range,txt])=><div key={range} style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,padding:"5px 7px",breakInside:"avoid"}}>
        <div style={{fontSize:8.5,fontWeight:700,fontFamily:"serif",color:GOLD,marginBottom:2}}>{range}</div>
        <div style={{fontSize:7,lineHeight:1.5,color:"#222",fontFamily:"sans-serif"}}>{txt[CURRENT_LANG==="da"?1:0]}</div>
      </div>)}
    </div>
    <div style={{flex:"0 0 auto",marginTop:5,borderTop:"0.5px solid "+RULE,paddingTop:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>D&D 2024 SRD 5.2, p.150</span><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>Page 4 of 4</span></div>
  </div>);
}

// ─── UI ───────────────────────────────────────
const G={gold:"#fcd34d",bg:"#020817",card:"#0f172a",border:"#1e293b",muted:"#94a3b8",dim:"#64748b",dimmer:"#475569"};
const inp={width:"100%",background:"transparent",border:"1px solid #334155",color:"#f1f5f9",borderRadius:"0.75rem",padding:"0.5rem 0.75rem",outline:"none",boxSizing:"border-box",fontFamily:"inherit",fontSize:"0.875rem"};
  const CAT_LABEL_COLOR={Origin:"#fbbf24",General:G.muted,"Fighting Style":"#f97316","Epic Boon":"#ef4444",Species:"#a78bfa",Class:"#60a5fa"};
const tabSt=(active,ac="#fcd34d",at="#020817")=>({padding:"0.25rem 0.65rem",borderRadius:"0.6rem",fontSize:"0.75rem",border:"1px solid "+(active?ac:"#334155"),cursor:"pointer",fontWeight:active?700:400,background:active?ac:"transparent",color:active?at:"#f1f5f9"});
function GFld({label,children}){return <div style={{marginBottom:"0.85rem"}}><div style={{fontSize:"0.75rem",color:G.muted,marginBottom:"0.3rem"}}>{label}</div>{children}</div>;}
function GBtn({onClick,children,gold,amber,small}){return <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:small?"0.3rem 0.65rem":"0.5rem 1rem",borderRadius:"0.75rem",border:"1px solid #334155",cursor:"pointer",fontWeight:600,fontSize:small?"0.75rem":"0.85rem",background:gold?G.gold:amber?"#7a5c1e":"transparent",color:gold?G.bg:amber?"#f7f0e0":"#f1f5f9"}}>{children}</button>;}

function PanelGroup({title,icon,collapsed,onToggle,children}){
  return(<div style={{border:"1px solid #334155",borderRadius:"1.25rem",overflow:"hidden",background:"rgba(15,23,42,0.5)"}}>
    <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:"0.6rem",padding:"0.9rem 1.25rem",cursor:"pointer",userSelect:"none",background:"rgba(252,211,77,0.07)",borderBottom:collapsed?"none":"1px solid #334155"}}>
      <span style={{color:G.gold,flexShrink:0}}>{icon}</span>
      <span style={{fontWeight:800,fontSize:"1rem",color:G.gold,flex:1,letterSpacing:"0.03em"}}>{title}</span>
      {collapsed?<ChevronDown size={16} style={{color:G.gold}}/>:<ChevronUp size={16} style={{color:G.gold}}/>}
    </div>
    {!collapsed&&<div style={{display:"flex",flexDirection:"column",gap:"0.6rem",padding:"0.75rem"}}>{children}</div>}
  </div>);
}

function CPanel({title,icon,children,collapsed,onToggle,dragging,onDragStart,onDrop}){
  return(<div onDragOver={e=>e.preventDefault()} onDrop={onDrop} style={{background:"rgba(15,23,42,0.8)",border:"1px solid "+(dragging?"#fcd34d":G.border),borderRadius:"1.25rem",overflow:"hidden"}}>
    <div style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.85rem 1.25rem",userSelect:"none"}}>
      <div draggable onDragStart={onDragStart} style={{cursor:"grab",flexShrink:0,padding:"0 2px"}}><GripVertical size={14} style={{color:G.dim,display:"block"}}/></div>
      <span style={{color:G.gold,flexShrink:0}}>{icon}</span>
      <span onClick={onToggle} style={{fontWeight:700,fontSize:"0.95rem",color:"#f1f5f9",flex:1,cursor:"pointer"}}>{title}</span>
      <div onClick={onToggle} style={{cursor:"pointer"}}>{collapsed?<ChevronDown size={16} style={{color:G.dim}}/>:<ChevronUp size={16} style={{color:G.dim}}/>}</div>
    </div>
    {!collapsed&&<div style={{padding:"0 1.25rem 1.25rem"}}>{children}</div>}
  </div>);
}

// ─── FIX: MPopup and SPopup are both properly defined as standalone components ───
function MPopup({name,desc,onClose}){
  return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#0f172a",border:"1px solid #a78bfa",borderRadius:"1.25rem",padding:"1.5rem",maxWidth:"420px",width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.75rem"}}>
        <div><div style={{fontWeight:800,fontSize:"1.05rem",color:"#f1f5f9"}}>{name}</div><div style={{fontSize:"0.7rem",color:"#a78bfa",marginTop:"0.15rem",textTransform:"uppercase"}}>Weapon Mastery</div></div>
        <button onClick={onClose} style={{background:"none",border:"none",color:G.dim,cursor:"pointer",fontSize:"1.2rem",lineHeight:1,padding:"0 4px"}}>x</button>
      </div>
      <div style={{fontSize:"0.85rem",color:"#94a3b8",lineHeight:1.65}}>{desc}</div>
    </div>
  </div>);
}

function SPopup({name,d,onClose}){
  return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#0f172a",border:"1px solid #fcd34d",borderRadius:"1.25rem",padding:"1.5rem",maxWidth:"420px",width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.75rem"}}>
        <div><div style={{fontWeight:800,fontSize:"1.05rem",color:"#f1f5f9"}}>{name}</div>{d.sc&&<div style={{fontSize:"0.7rem",color:"#fcd34d",marginTop:"0.15rem",textTransform:"uppercase"}}>{d.sc}</div>}</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:G.dim,cursor:"pointer",fontSize:"1.2rem",lineHeight:1,padding:"0 4px"}}>x</button>
      </div>
      <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap",marginBottom:"0.7rem"}}>{[[t("Cast"),d.cast],[t("Range"),d.range],[t("Duration"),d.dur],[t("Components"),d.comp]].filter(([,v])=>v).map(([l,v])=><div key={l} style={{background:"#1e293b",borderRadius:"0.4rem",padding:"0.2rem 0.5rem",fontSize:"0.68rem"}}><span style={{color:G.dim}}>{l}: </span><span style={{color:"#e2e8f0",fontWeight:600}}>{v}</span></div>)}</div>
      <div style={{fontSize:"0.85rem",color:"#94a3b8",lineHeight:1.65}}>{d.desc}</div>
      {d.pg&&<div style={{fontSize:"0.62rem",color:G.dim,marginTop:"0.6rem"}}>PHB 2024, p. {d.pg}</div>}
    </div>
  </div>);
}

function MasteryBtn({name}){
  const [open,setOpen]=useState(false);
  const desc=MASTERY_DESC[name];
  if(!name||name==="—"||!desc)return <span style={{fontSize:"0.68rem",color:G.dimmer}}>—</span>;
  return(<>
    <span style={{display:"inline-flex",alignItems:"center",gap:"0.35rem",justifyContent:"flex-start"}}>
      <span style={{fontSize:"0.72rem",color:G.muted,fontWeight:600}}>{name}</span>
      <button title={"Show "+name+" mastery"} onClick={e=>{e.stopPropagation();setOpen(true);}} style={{background:"transparent",border:"none",padding:"0 0.15rem",margin:0,color:G.gold,fontSize:"0.95rem",fontWeight:900,cursor:"pointer",lineHeight:1}}>?</button>
    </span>
    {open&&<MPopup name={name} desc={desc} onClose={()=>setOpen(false)}/>}
  </>);
}

function SBtn({name,sel,prep,onToggle,onPrep}){
  const [open,setOpen]=useState(false);
  const d=spellD(name);
  return(<>
    <div style={{display:"flex",alignItems:"stretch",borderRadius:"0.65rem",overflow:"hidden",border:"1px solid "+(sel?G.gold:"#334155"),minHeight:"3rem",flexShrink:0}}>
      <button onClick={e=>{e.stopPropagation();onToggle();}} style={{flex:1,padding:"0.6rem 1rem",fontSize:"0.9rem",border:"none",cursor:"pointer",background:sel?G.gold:"transparent",color:sel?G.bg:"#f1f5f9",fontWeight:sel?700:400,textAlign:"left",whiteSpace:"normal",wordBreak:"break-word",lineHeight:1.4}}>{name}</button>
      {d&&<button onClick={e=>{e.stopPropagation();setOpen(true);}} style={{padding:"0 0.9rem",fontSize:"0.9rem",border:"none",borderLeft:"1px solid #334155",cursor:"pointer",background:"transparent",color:"#fcd34d",fontWeight:700,flexShrink:0,alignSelf:"stretch",display:"flex",alignItems:"center"}}>?</button>}
      {sel&&<button onClick={e=>{e.stopPropagation();onPrep();}} style={{padding:"0 0.9rem",fontSize:"0.9rem",border:"none",borderLeft:"1px solid #334155",cursor:"pointer",background:"transparent",color:prep?"#4ade80":"#94a3b8",flexShrink:0,alignSelf:"stretch",display:"flex",alignItems:"center"}}>{prep?"P":"o"}</button>}
    </div>
    {open&&d&&<SPopup name={name} d={d} onClose={()=>setOpen(false)}/>}
  </>);
}

function EquipRow({item,equipped,onEquip}){
  const isA=!!ARMOR_ITEMS[item],isS=item==="Shield",isW=!!WD[item];
  const canEquip=isA||isS||isW;
  const isEq=(isA&&equipped.armor===item)||(isS&&equipped.shield)||(isW&&equipped.weapon===item);
  return <div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 6px",borderRadius:6,background:isEq?"#14532d22":"transparent",border:"1px solid "+(isEq?"#4ade8044":G.border),marginBottom:3}}><span style={{flex:1,fontSize:"0.82rem",color:"#e2e8f0"}}>{item}</span>{canEquip&&<button onClick={onEquip} style={{padding:"0.15rem 0.5rem",borderRadius:"0.4rem",fontSize:"0.7rem",border:"1px solid",cursor:"pointer",fontWeight:600,background:isEq?"#14532d":"transparent",color:isEq?"#4ade80":G.dim,borderColor:isEq?"#4ade80":"#334155",whiteSpace:"nowrap"}}>{isEq?"Unequip":"Equip"}</button>}</div>;
}

function FeatCard({name,feat,sel,onToggle,children}){
  const catColor=CAT_LABEL_COLOR[feat.cat]||G.muted;
  return(<div style={{background:sel?"#14532d22":"transparent",border:"1px solid "+(sel?"#4ade8066":G.border),borderRadius:"0.6rem",padding:"0.4rem 0.6rem"}}>
    <div style={{display:"flex",alignItems:"flex-start",gap:"0.5rem"}}>
      <button onClick={onToggle} style={{flexShrink:0,padding:"0.15rem 0.45rem",borderRadius:"0.4rem",fontSize:"0.68rem",border:"1px solid",cursor:"pointer",fontWeight:600,background:sel?"#14532d":"transparent",color:sel?"#4ade80":"#f1f5f9",borderColor:sel?"#4ade80":"#334155",whiteSpace:"nowrap",marginTop:2}}>{sel?"Taken":"Take"}</button>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.4rem",flexWrap:"wrap"}}>
          <span style={{fontSize:"0.8rem",fontWeight:600,color:sel?"#4ade80":"#e2e8f0"}}>{name}</span>
          <span style={{fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.08em",color:catColor,fontWeight:700,border:"1px solid",borderColor:catColor,borderRadius:"0.3rem",padding:"0 0.3rem"}}>{t(feat.cat)}</span>
        </div>
        <div style={{fontSize:"0.72rem",color:G.muted,marginTop:"1px",lineHeight:1.4}}>{featDescL(name,feat.desc)}</div>
      </div>
    </div>
    {children}
  </div>);
}

function EquipmentPanel({cn,level,dm,sm,pb,equipped,equipItem,gp,setGp,ac,masteredWeapons,setMasteredWeapons}){
  const [eqTab,setEqTab]=useState("weapons");
  const [eqSearch,setEqSearch]=useState("");
  const [showNonProf,setShowNonProf]=useState(false);
  const armorProfs=ARMOR_PROF[cn]||[];
  const weapProfs=WEAPON_PROF[cn]||[];
  const canUseArmor=name=>{const a=ARMOR_ITEMS[name];if(!a)return false;if(a.light)return armorProfs.includes("light");if(a.medium)return armorProfs.includes("medium");if(a.heavy)return armorProfs.includes("heavy");return false;};
  const BARD_MARTIAL=["Hand crossbow","Longsword","Rapier","Shortsword"];
  const ROGUE_MARTIAL=["Hand crossbow","Longsword","Rapier","Shortsword"];
  const canUseWeapon=name=>{const w=WD[name];if(!w)return false;if(w.type==="simple")return weapProfs.includes("simple");if(w.type==="martial"){if(weapProfs.includes("martial"))return true;if(weapProfs.includes("bard-martial"))return BARD_MARTIAL.includes(name);if(weapProfs.includes("rogue-martial"))return ROGUE_MARTIAL.includes(name);return false;}return false;};
  const q=eqSearch.toLowerCase();
  const weaponRows=Object.entries(WD).filter(([n])=>n!=="Unarmed strike").filter(([n])=>{if(q&&!n.toLowerCase().includes(q))return false;if(!showNonProf&&!canUseWeapon(n))return false;return true;}).map(([wn,w])=>{
    const isProf=canUseWeapon(wn);const am=w.ab==="fin"?(dm>=sm?dm:sm):w.ab==="DEX"?dm:sm;const bonus=isProf?am+pb:am;const isEq=equipped.weapon===wn;
    return(<div key={wn} style={{display:"grid",gridTemplateColumns:"1fr 52px 64px 60px 70px 64px",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:7,background:isEq?"#14532d22":"transparent",border:"1px solid "+(isEq?"#4ade8044":G.border),marginBottom:4}}>
      <div><span style={{fontSize:"0.82rem",color:isEq?"#4ade80":"#e2e8f0",fontWeight:isEq?700:400}}>{wn}</span>{isProf?<span style={{fontSize:"0.6rem",color:"#4ade80",marginLeft:5,border:"1px solid #4ade80",borderRadius:3,padding:"0 3px",fontWeight:700}}>prof</span>:<span style={{fontSize:"0.6rem",color:"#f87171",marginLeft:5,border:"1px solid #f87171",borderRadius:3,padding:"0 3px"}}>non-prof</span>}<div style={{fontSize:"0.65rem",color:G.dimmer,marginTop:1}}>{w.pr}</div></div>
      <span style={{fontSize:"0.9rem",fontWeight:800,color:G.gold,textAlign:"center"}}>{sgn(bonus)}</span>
      <span style={{fontSize:"0.78rem",color:G.muted,textAlign:"center"}}>{w.dmg}</span>
      <span style={{fontSize:"0.65rem",color:G.dimmer,textAlign:"center",textTransform:"uppercase",letterSpacing:"0.05em"}}>{w.type}</span>
      <div style={{textAlign:"center"}}>              {masteredWeapons.includes(wn)&&w.mastery!=="—"
                ?<span style={{display:"inline-flex",alignItems:"center",gap:"0.35rem"}}><span style={{fontSize:"0.55rem",fontWeight:900,padding:"0.1rem 0.28rem",borderRadius:"0.35rem",background:"#14532d",color:"#4ade80",border:"1px solid #4ade80",letterSpacing:"0.05em"}}>VM</span><span style={{color:"#4ade80"}}><MasteryBtn name={w.mastery}/></span></span>
                :<span style={{fontSize:"0.75rem",color:G.dimmer}}>—</span>
              }</div>
      <button onClick={()=>equipItem(wn)} style={{padding:"0.2rem 0.4rem",borderRadius:"0.4rem",fontSize:"0.7rem",border:"1px solid",cursor:"pointer",fontWeight:600,background:isEq?"#14532d":"transparent",color:isEq?"#4ade80":G.dim,borderColor:isEq?"#4ade80":"#334155"}}>{isEq?"Unequip":"Equip"}</button>
    </div>);
  });
  const armorRows=Object.entries(ARMOR_ITEMS).filter(([n])=>{if(q&&!n.toLowerCase().includes(q))return false;if(!showNonProf&&!canUseArmor(n))return false;return true;}).map(([an,a])=>{
    const isProf=canUseArmor(an);const calcAC=a.ac?a.ac:(a.acFn?a.acFn(dm):10);const isEq=equipped.armor===an;const cat=a.light?"Light":a.medium?"Medium":"Heavy";
    return(<div key={an} style={{display:"grid",gridTemplateColumns:"1fr 52px 60px 60px 64px",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:7,background:isEq?"#1e3a5f44":"transparent",border:"1px solid "+(isEq?"#60a5fa66":G.border),marginBottom:4}}>
      <div><span style={{fontSize:"0.82rem",color:isEq?"#60a5fa":"#e2e8f0",fontWeight:isEq?700:400}}>{an}</span>{!isProf&&<span style={{fontSize:"0.6rem",color:"#f87171",marginLeft:5,border:"1px solid #f87171",borderRadius:3,padding:"0 3px"}}>non-prof</span>}{a.stealth&&<span style={{fontSize:"0.6rem",color:"#fb923c",marginLeft:5,border:"1px solid #fb923c",borderRadius:3,padding:"0 3px"}}>stealth disadv.</span>}</div>
      <span style={{fontSize:"0.9rem",fontWeight:800,color:"#60a5fa",textAlign:"center"}}>AC {calcAC}</span>
      <span style={{fontSize:"0.65rem",color:G.dimmer,textAlign:"center",textTransform:"uppercase",letterSpacing:"0.05em"}}>{cat}</span>
      <span style={{fontSize:"0.65rem",color:G.dimmer,textAlign:"center"}}>{a.medium?"DEX+2":a.light?"DEX":"—"}</span>
      <button onClick={()=>equipItem(an)} style={{padding:"0.2rem 0.4rem",borderRadius:"0.4rem",fontSize:"0.7rem",border:"1px solid",cursor:"pointer",fontWeight:600,background:isEq?"#1e3a5f":"transparent",color:isEq?"#60a5fa":G.dim,borderColor:isEq?"#60a5fa":"#334155"}}>{isEq?"Unequip":"Equip"}</button>
    </div>);
  });
  const shieldVisible=(!q||"shield".includes(q))&&(showNonProf||armorProfs.includes("shield"));
  return(<div>
    <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem",marginBottom:"0.75rem",alignItems:"center"}}>
      {equipped.weapon&&<span style={{background:"#14532d",color:"#4ade80",borderRadius:"0.5rem",padding:"0.2rem 0.6rem",fontSize:"0.75rem",fontWeight:600}}>Weapon: {equipped.weapon}</span>}
      {equipped.armor&&<span style={{background:"#1e3a5f",color:"#60a5fa",borderRadius:"0.5rem",padding:"0.2rem 0.6rem",fontSize:"0.75rem",fontWeight:600}}>Armor: {equipped.armor}</span>}
      {equipped.shield&&<span style={{background:"#1e3a5f",color:"#60a5fa",borderRadius:"0.5rem",padding:"0.2rem 0.6rem",fontSize:"0.75rem",fontWeight:600}}>Shield +2</span>}
      {!equipped.weapon&&!equipped.armor&&!equipped.shield&&<span style={{fontSize:"0.8rem",color:G.dim,fontStyle:"italic"}}>Nothing equipped</span>}
      <span style={{marginLeft:"auto",background:G.gold,color:G.bg,borderRadius:"0.5rem",padding:"0.2rem 0.6rem",fontSize:"0.8rem",fontWeight:800}}>AC {ac}</span>
    </div>
    <div style={{display:"flex",gap:"0.35rem",marginBottom:"0.65rem",flexWrap:"wrap",alignItems:"center"}}>
      {[["weapons","Weapons"],["armor","Armor & Shields"],["starting","Starting Gear"]].map(([id,label])=>(<button key={id} onClick={()=>{setEqTab(id);setEqSearch("");}} style={tabSt(eqTab===id)}>{label}</button>))}
      {eqTab!=="starting"&&<><input value={eqSearch} onChange={e=>setEqSearch(e.target.value)} placeholder="Search..." style={{...inp,width:"110px",padding:"0.25rem 0.6rem",fontSize:"0.78rem",marginLeft:"auto"}}/><label style={{display:"flex",alignItems:"center",gap:"0.3rem",fontSize:"0.72rem",color:G.muted,cursor:"pointer",whiteSpace:"nowrap"}}><input type="checkbox" checked={showNonProf} onChange={e=>setShowNonProf(e.target.checked)} style={{accentColor:G.gold}}/>Non-prof</label></>}
    </div>
    {eqTab==="weapons"&&(<div style={{maxHeight:"55vh",overflowY:"auto",paddingRight:4}}>
      <div style={{fontSize:"0.75rem",marginBottom:"0.5rem",padding:"0.35rem 0.65rem",borderRadius:"0.5rem",background:"#14532d22",border:"1px solid #4ade8055",color:"#e2e8f0"}}><span style={{color:"#4ade80",fontWeight:800}}>✓ Proficient:</span> {CLASSES[cn].weapons} <span style={{color:G.dim}}>— {t("green = proficient, red = not proficient")}</span></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 52px 64px 60px 70px 64px",gap:6,padding:"0 8px",marginBottom:4}}>{["Name","Atk","Dmg","Type","Mastery",""].map(h=><div key={h} style={{fontSize:"0.6rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</div>)}</div>
      {weaponRows.length?weaponRows:<div style={{fontSize:"0.82rem",color:G.dim,fontStyle:"italic",padding:"0.5rem"}}>No weapons match.</div>}
      {weaponMasterySlots(cn,level)>0&&(()=>{const slots=weaponMasterySlots(cn,level);const eligible=Object.entries(WD).filter(([,w])=>w.mastery&&w.mastery!=="—"&&(WEAPON_PROF[cn]||[]).includes(w.type));return(<div style={{marginTop:"0.75rem",padding:"0.65rem",background:"#1e293b",borderRadius:"0.75rem",border:"1px solid #334155"}}><div style={{fontSize:"0.72rem",color:"#a78bfa",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.4rem"}}>Weapon Mastery - choose {slots} ({masteredWeapons.length}/{slots})</div><div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>{eligible.map(([wn,w])=>{const sel=masteredWeapons.includes(wn);const atMax=masteredWeapons.length>=slots;return(<button key={wn} onClick={()=>setMasteredWeapons(prev=>prev.includes(wn)?prev.filter(x=>x!==wn):prev.length>=slots?prev:[...prev,wn])} style={{padding:"0.2rem 0.5rem",borderRadius:"0.45rem",fontSize:"0.72rem",border:"1px solid",cursor:(atMax&&!sel)?"not-allowed":"pointer",opacity:(atMax&&!sel)?0.35:1,background:sel?"#581c87":"transparent",color:sel?"#e9d5ff":"#f1f5f9",borderColor:sel?"#a78bfa":"#334155",fontWeight:sel?700:400}}>{wn} <span style={{color:"#a78bfa",fontSize:"0.65rem"}}>{w.mastery}</span></button>);})}</div></div>);})()} 
    </div>)}
    {eqTab==="armor"&&(<div style={{maxHeight:"55vh",overflowY:"auto",paddingRight:4}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 52px 60px 60px 64px",gap:6,padding:"0 8px",marginBottom:4}}>{["Name","AC","Cat","DEX",""].map(h=><div key={h} style={{fontSize:"0.6rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</div>)}</div>
      {armorRows}
      {shieldVisible&&(<div style={{display:"grid",gridTemplateColumns:"1fr 52px 60px 60px 64px",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:7,background:equipped.shield?"#1e3a5f44":"transparent",border:"1px solid "+(equipped.shield?"#60a5fa66":G.border),marginBottom:4}}>
        <div><span style={{fontSize:"0.82rem",color:equipped.shield?"#60a5fa":"#e2e8f0",fontWeight:equipped.shield?700:400}}>Shield</span>{!armorProfs.includes("shield")&&<span style={{fontSize:"0.6rem",color:"#f87171",marginLeft:5,border:"1px solid #f87171",borderRadius:3,padding:"0 3px"}}>non-prof</span>}</div>
        <span style={{fontSize:"0.9rem",fontWeight:800,color:"#60a5fa",textAlign:"center"}}>+2</span>
        <span style={{fontSize:"0.65rem",color:G.dimmer,textAlign:"center",textTransform:"uppercase",letterSpacing:"0.05em"}}>Shield</span>
        <span style={{fontSize:"0.65rem",color:G.dimmer,textAlign:"center"}}>—</span>
        <button onClick={()=>equipItem("Shield")} style={{padding:"0.2rem 0.4rem",borderRadius:"0.4rem",fontSize:"0.7rem",border:"1px solid",cursor:"pointer",fontWeight:600,background:equipped.shield?"#1e3a5f":"transparent",color:equipped.shield?"#60a5fa":G.dim,borderColor:equipped.shield?"#60a5fa":"#334155"}}>{equipped.shield?"Unequip":"Equip"}</button>
      </div>)}
    </div>)}
    {eqTab==="starting"&&(<div>
      <div style={{fontSize:"0.75rem",color:G.muted,marginBottom:"0.5rem"}}>Starting equipment for {cn}:</div>
      {EQUIP[cn].map((item,i)=><EquipRow key={i} item={item} equipped={equipped} onEquip={()=>equipItem(item)}/>)}
      <div style={{marginTop:"0.75rem"}}><GFld label="Starting Gold (GP)"><input type="number" min={0} value={gp} onChange={e=>setGp(Number(e.target.value))} style={inp}/></GFld></div>
    </div>)}
  </div>);
}

export default function App(){
  // Random starting character on first load (not always Human Fighter).
  const initRef=useRef(null);
  if(!initRef.current){const rc=pick(Object.keys(CLASSES));initRef.current={cn:rc,sp:pick(Object.keys(SPECIES)),bg:pick(Object.keys(BGS)),level:1+Math.floor(Math.random()*6),gender:Math.random()<0.5?"male":"female"};}
  const initChar=initRef.current;
  const [view,setView]=useState("gen");
  const [level,setLevel]=useState(initChar.level);
  const [sp,setSp]=useState(initChar.sp);
  const [cn,setCn]=useState(initChar.cn);
  const [bg,setBg]=useState(initChar.bg);
  const [boost,setBoost]=useState("+2/+1");
  const [boost2,setBoost2]=useState(null);
  const [boost1,setBoost1]=useState(null);
  const [smode,setSmode]=useState("Standard Array");
  const [mstats,setMstats]=useState(()=>assignArr(initChar.cn));
  const [rstats,setRstats]=useState({STR:15,DEX:14,CON:13,INT:12,WIS:10,CHA:8});
  const [selSk,setSelSk]=useState(()=>CLASSES[initChar.cn].sc.slice(0,CLASSES[initChar.cn].ns));
  const [selLangs,setSelLangs]=useState([]);
  const [selExpertise,setSelExpertise]=useState([]);
  const [miClass,setMiClass]=useState("");
  const [miCantrips,setMiCantrips]=useState([]);
  const [miSpell,setMiSpell]=useState("");
  const [dragonColor,setDragonColor]=useState("Red");
  const [selWildShapes,setSelWildShapes]=useState([]);
  const [landType,setLandType]=useState("Temperate");
  const [cname,setCname]=useState("");
  const [playerName,setPlayerName]=useState("");
  const [sub,setSub]=useState("");
  const [anotes,setAnotes]=useState("");
  const [inventory,setInventory]=useState(()=>(EQUIP[initChar.cn]||[]).join("\n"));
  const [equipped,setEquipped]=useState(()=>({...CLASS_DEFAULTS[initChar.cn]}));
  const [masteredWeapons,setMasteredWeapons]=useState(()=>defaultMasteredWeaponsForClass(initChar.cn));
  const [featMap,setFeatMap]=useState({});
  const [skilledSkills,setSkilledSkills]=useState([]);
  const [skilledTools,setSkilledTools]=useState([]);
  const [mc,setMc]=useState(false);
  const [cn2,setCn2]=useState("Rogue");
  const [lv2,setLv2]=useState(1);
  const [align,setAlign]=useState("Neutral Good");
  const [traits,setTraits]=useState("");
  const [ideals,setIdeals]=useState("");
  const [bonds,setBonds]=useState("");
  const [flaws,setFlaws]=useState("");
  const [backstory,setBackstory]=useState("");
  const [gp,setGp]=useState(0);
  const [selSp,setSelSp]=useState({});
  const [selInv,setSelInv]=useState([]);
  const [classOrder,setClassOrder]=useState(()=>defaultOrder(initChar.cn));
  const [selRituals,setSelRituals]=useState([]);
  const [selTomeCantrips,setSelTomeCantrips]=useState([]);
  const [spPrep,setSpPrep]=useState({});
  const [spTab,setSpTab]=useState(0);
  const [usedSlots,setUsedSlots]=useState({});
  const [sheet,setSheet]=useState(null);
  const [portraitSeed,setPortraitSeed]=useState(()=>Math.floor(Math.random()*1000000));
  const [gender,setGender]=useState(initChar.gender);
  const [portraitMode,setPortraitMode]=useState("blank");
  const [lang,setLangState]=useState(CURRENT_LANG);
  CURRENT_LANG=lang;
  const switchLang=l=>{setLang(l);setLangState(l);};
  const [featTab,setFeatTab]=useState("General");
  const [panelOrder,setPanelOrder]=useState(["overview","equipment","notes"]);
  const [collapsed,setCollapsed]=useState({spells:true});
  const [groupCollapsed,setGroupCollapsed]=useState({creator:true});
  const [draggingPanel,setDraggingPanel]=useState(null);
  const [classLocked,setClassLocked]=useState(false);
  const [speciesLocked,setSpeciesLocked]=useState(false);
  const [levelLocked,setLevelLocked]=useState(false);
  const classLockedRef=useRef(false);
  const speciesLockedRef=useRef(false);
  const levelLockedRef=useRef(false);
  const fileInputRef=useRef(null);

  const toggleClassLock=()=>{const n=!classLockedRef.current;classLockedRef.current=n;setClassLocked(n);};
  const toggleSpeciesLock=()=>{const n=!speciesLockedRef.current;speciesLockedRef.current=n;setSpeciesLocked(n);};
  const toggleLevelLock=()=>{const n=!levelLockedRef.current;levelLockedRef.current=n;setLevelLocked(n);};

  const activeFeats=useMemo(()=>Object.keys(featMap).filter(f=>featMap[f]),[featMap]);
  const cls=CLASSES[cn],speciesData=SPECIES[sp],bgo=BGS[bg];
  // Mechanical checks must also count the Origin Feat granted for free by the background,
  // even though it isn't toggled in featMap (and must not count against the ASI feat budget).
  const mechFeats=useMemo(()=>{const s=new Set(activeFeats);const originBase=featBaseName(bgo.feat);if(ALL_FEATS[originBase])s.add(originBase);return s;},[activeFeats,bgo.feat]);
  const cls2=mc?CLASSES[cn2]:null;
  const lv2c=mc?Math.min(lv2,level-1):0;
  const lv1e=mc?level-lv2c:level;
  const pb=pbf(level);
  const base=useMemo(()=>{if(smode==="Standard Array")return assignArr(cn);if(smode==="Rolled")return rstats;return mstats;},[smode,cn,mstats,rstats]);
  const effB2=bgo.ab.includes(boost2)?boost2:bgo.ab[0];
  const effB1=(bgo.ab.includes(boost1)&&boost1!==effB2)?boost1:bgo.ab.find(a=>a!==effB2);
  const fin=useMemo(()=>applyBoosts(base,bg,boost,effB2,effB1),[base,bg,boost,effB2,effB1]);
  const dm=mf(fin.DEX),sm=mf(fin.STR),cm=mf(fin.CON),wm=mf(fin.WIS);
  const hasTough=mechFeats.has("Tough");
  const hasMobile=mechFeats.has("Mobile");
  const hasDefense=mechFeats.has("Defense");
  const hasAlert=mechFeats.has("Alert");
  const hasTavernBrawler=mechFeats.has("Tavern Brawler");
  const hp=Math.max(level,avgHp(level,cls.hd,cm)+(hasTough?level*2:0));
  const getAC=useCallback(()=>{let b=equipped.armor?(ARMOR_ITEMS[equipped.armor].ac||ARMOR_ITEMS[equipped.armor].acFn(dm)):(cn==="Barbarian"?10+dm+cm:cn==="Monk"?10+dm+wm:10+dm);if(equipped.shield)b+=2;if(hasDefense&&equipped.armor)b+=1;return b;},[equipped,dm,cm,wm,cn,hasDefense]);
  const ac=getAC();
  const getACBreakdown=useCallback(()=>{
    const parts=[];
    if(equipped.armor){
      const item=ARMOR_ITEMS[equipped.armor];
      const base=item.ac||item.acFn(dm);
      const capNote=item.heavy?" (no DEX)":item.medium?" (+DEX, max 2)":" (+DEX)";
      parts.push(equipped.armor+capNote+": "+base);
    }else if(cn==="Barbarian"){parts.push("Unarmored Defense (10+DEX+CON): "+(10+dm+cm));}
    else if(cn==="Monk"){parts.push("Unarmored Defense (10+DEX+WIS): "+(10+dm+wm));}
    else{parts.push("Unarmored (10+DEX): "+(10+dm));}
    if(equipped.shield)parts.push("Shield: +2");
    if(hasDefense&&equipped.armor)parts.push("Defense feat: +1");
    return parts.join(" · ");
  },[equipped,dm,cm,wm,cn,hasDefense]);
  const acBreakdown=getACBreakdown();
  const saves=mc&&cls2?Array.from(new Set([...cls.saves,...cls2.saves])):cls.saves;
  const allSc=mc&&cls2?Array.from(new Set([...cls.sc,...cls2.sc])):cls.sc;
  const maxSk=mc?cls.ns+1:cls.ns;
  const skProfs=useMemo(()=>Array.from(new Set([...bgo.sk,...selSk,...skilledSkills])),[bgo.sk,selSk,skilledSkills]);
  const miForcedMatch=featBaseName(bgo.feat)==="Magic Initiate"?bgo.feat.match(/\(([^)]+)\)/):null;
  const miForcedClass=miForcedMatch?miForcedMatch[1]:"";
  const hasMagicInitiate=featBaseName(bgo.feat)==="Magic Initiate"||!!featMap["Magic Initiate"];
  const miClassEff=miClass||miForcedClass||MAGIC_INITIATE_CLASSES[0];
  const passPerc=10+wm+(skProfs.includes("Perception")?pb:0);
  const init=dm+(hasAlert?pb:0);
  const armorStrReq=equipped.armor&&ARMOR_ITEMS[equipped.armor]?.str;
  const armorSpeedPenalty=(armorStrReq&&fin.STR<armorStrReq)?10:0;
  const speed=Math.max(0,(speciesData?.speed||30)+(hasMobile?10:0)-armorSpeedPenalty);
  const isCaster=!!CTYPE[cn]||(mc&&!!CTYPE[cn2]);
  const isMcCaster=mc&&!!CTYPE[cn2]&&CTYPE[cn2]!=="warlock"&&!!CTYPE[cn]&&CTYPE[cn]!=="warlock";
  const sab=SAB[cn]||(mc?SAB[cn2]:"");
  const smod=sab?mf(fin[sab]):0;
  const ct=CTYPE[cn];
  const isWarlock=cn==="Warlock"||(mc&&cn2==="Warlock");
  const warlockLvl=cn==="Warlock"?lv1e:(mc&&cn2==="Warlock"?lv2c:0);
  const invLimit=isWarlock?invocationsKnown(warlockLvl):0;
  function togInv(name){setSelInv(prev=>{if(prev.includes(name))return prev.filter(n=>n!==name);if(prev.length>=invLimit)return prev;return[...prev,name];});}
  function togRitual(name){setSelRituals(prev=>{if(prev.includes(name))return prev.filter(n=>n!==name);if(prev.length>=2)return prev;return[...prev,name];});}
  function togTomeCantrip(name){setSelTomeCantrips(prev=>{if(prev.includes(name))return prev.filter(n=>n!==name);if(prev.length>=3)return prev;return[...prev,name];});}
  const ct2=mc?CTYPE[cn2]:null;
  const warlockPactLevel=ct==="warlock"?Math.min(5,Math.ceil(lv1e/2)):0;
  const warlockPactSlots=ct==="warlock"?(SS.warlock[lv1e]?SS.warlock[lv1e][0]||0:0):0;
  const slots=isMcCaster?calcMulticlassSlots(cn,lv1e,cn2,lv2c):ct==="full"?(SS.full[lv1e]||[]):ct==="half"?(SS.half[lv1e]||[]):ct==="warlock"?Array.from({length:9},(_,i)=>i+1===warlockPactLevel?warlockPactSlots:0):Array(9).fill(0);
  const autoName=useMemo(()=>pickName(sp),[sp]);
  const dispName=cname||autoName;
  const clsLvl=mc?`${cn} ${lv1e} / ${cn2} ${lv2c}`:`${cn} ${level}`;
  const maxSL=Math.max(ct?maxSpellLevel(ct,lv1e):0,mc&&ct2?maxSpellLevel(ct2,lv2c):0);
  const hasTome=selInv.includes("Pact of the Tome");
  // The character's own spell lists (class-restricted). Tome cantrips are handled separately.
  const avSp=useMemo(()=>{
    const res={};
    [cn,...(mc&&CTYPE[cn2]?[cn2]:[])].forEach(c=>{
      const sd=CS[c]||{};const cct=CTYPE[c];const cMaxSL=cct?maxSpellLevel(cct,c===cn?lv1e:lv2c):0;
      Object.entries(sd).forEach(([l,ns])=>{const li=Number(l);if(li>cMaxSL)return;if(!res[li])res[li]=new Set();ns.forEach(n=>res[li].add(n));});
    });
    return res;
  },[cn,cn2,mc,lv1e,lv2c]);
  // All cantrips from any class — only used for the Pact of the Tome extra-cantrip picker.
  const allCantrips=useMemo(()=>[...new Set(Object.values(CS).flatMap(sd=>sd[0]||[]))].sort(),[]);
  const knownStr=ct?spellsKnown(cn,lv1e,smod):(mc&&ct2?spellsKnown(cn2,lv2c,smod):null);
  const cantripLimit=cantripsKnown(cn,lv1e)+(mc&&ct2?cantripsKnown(cn2,lv2c):0)+orderCantripBonus(cn,classOrder);
  const primaryAb=cls?.pri?.[0]||"STR";
  const racialFeatSuggestions=speciesData?.racialFeats||[];
  const classFeatSuggestions=cls?.classFeatChoices||[];
  const originFeatSuggestions=bgo?.feat?[bgo.feat]:[];
  const featsByTab=useMemo(()=>{const tabs={Origin:[],General:[],"Fighting Style":[],Species:[],Class:[],"Epic Boon":[]};Object.entries(ALL_FEATS).forEach(([name,feat])=>{const cat=feat.cat||"General";if(tabs[cat])tabs[cat].push(name);});return tabs;},[]);

  React.useEffect(()=>{if(mc&&lv2>level-1)setLv2(Math.max(1,level-1));},[mc,lv2,level]);

  function changeClass(newCn){setCn(newCn);setSub("");setClassOrder(defaultOrder(newCn));setInventory((EQUIP[newCn]||[]).join("\n"));setSelInv([]);setSelRituals([]);setSelTomeCantrips([]);setSelSp({});setSpPrep({});setUsedSlots({});setMstats(assignArr(newCn));setSelSk(CLASSES[newCn].sc.slice(0,CLASSES[newCn].ns));setEquipped({...CLASS_DEFAULTS[newCn]});setMasteredWeapons(defaultMasteredWeaponsForClass(newCn));setSelExpertise([]);setSelWildShapes([]);}

  function buildW(){
    const weapons=[];const wname=equipped.weapon;const weapProfs=WEAPON_PROF[cn]||[];
    const wd=n=>n==="Unarmed strike"&&hasTavernBrawler?{...WD[n],dmg:"1d4"}:WD[n];
    if(wname&&wd(wname)){const w=wd(wname);const isProf=weapProfs.includes(w.type);const am=w.ab==="fin"?(dm>=sm?dm:sm):w.ab==="DEX"?dm:sm;weapons.push({name:wname,atk:sgn(isProf?am+pb:am),dmg:w.dmg+" "+sgn(am),props:w.pr,mastery:w.mastery||"—",masteredActive:masteredWeapons.includes(wname)});}
    CW[cn].filter(n=>n!==wname).slice(0,3).forEach(wn=>{const w=wd(wn);if(!w)return;const am=w.ab==="fin"?(dm>=sm?dm:sm):w.ab==="DEX"?dm:sm;weapons.push({name:wn,atk:sgn(am+pb),dmg:w.dmg+" "+sgn(am),props:w.pr,mastery:w.mastery||"—",masteredActive:masteredWeapons.includes(wn)});});
    return weapons.slice(0,4);
  }

  function exportCharacter(){
    const data={version:1,cname,playerName,level,sp,cn,bg,align,sub,anotes,boost,boost2,boost1,gender,portraitMode,smode,mstats,rstats,selSk,selLangs,selExpertise,miClass,miCantrips,miSpell,dragonColor,selWildShapes,landType,skilledSkills,skilledTools,equipped,masteredWeapons,featMap,mc,cn2,lv2,traits,ideals,bonds,flaws,backstory,gp,selSp,selInv,selRituals,selTomeCantrips,classOrder,inventory,spPrep,usedSlots};
    const safeName=(cname||"unnamed").replace(/[^a-z0-9_\-]/gi,"_");
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`character-${safeName}.json`;a.style.display="none";document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function importCharacter(e){
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=evt=>{try{const d=JSON.parse(evt.target.result);if(d.cname!==undefined)setCname(d.cname);if(d.playerName!==undefined)setPlayerName(d.playerName);if(d.level!==undefined)setLevel(d.level);if(d.sp!==undefined)setSp(d.sp);if(d.cn!==undefined)changeClass(d.cn);if(d.bg!==undefined)setBg(d.bg);if(d.align!==undefined)setAlign(d.align);if(d.sub!==undefined)setSub(d.sub);if(d.anotes!==undefined)setAnotes(d.anotes);if(d.boost!==undefined)setBoost(d.boost);if(d.boost2!==undefined)setBoost2(d.boost2);if(d.boost1!==undefined)setBoost1(d.boost1);if(d.gender!==undefined)setGender(d.gender);if(d.portraitMode!==undefined)setPortraitMode(d.portraitMode);if(d.smode!==undefined)setSmode(d.smode);if(d.mstats!==undefined)setMstats(d.mstats);if(d.rstats!==undefined)setRstats(d.rstats);if(d.selSk!==undefined)setSelSk(d.selSk);if(d.selLangs!==undefined)setSelLangs(d.selLangs);if(d.selExpertise!==undefined)setSelExpertise(d.selExpertise);if(d.miClass!==undefined)setMiClass(d.miClass);if(d.miCantrips!==undefined)setMiCantrips(d.miCantrips);if(d.miSpell!==undefined)setMiSpell(d.miSpell);if(d.dragonColor!==undefined)setDragonColor(d.dragonColor);if(d.selWildShapes!==undefined)setSelWildShapes(d.selWildShapes);if(d.landType!==undefined)setLandType(d.landType);if(d.skilledSkills!==undefined)setSkilledSkills(d.skilledSkills);if(d.skilledTools!==undefined)setSkilledTools(d.skilledTools);if(d.equipped!==undefined)setEquipped(d.equipped);if(d.masteredWeapons!==undefined)setMasteredWeapons(d.masteredWeapons);if(d.featMap!==undefined)setFeatMap(d.featMap);if(d.mc!==undefined)setMc(d.mc);if(d.cn2!==undefined)setCn2(d.cn2);if(d.lv2!==undefined)setLv2(d.lv2);if(d.traits!==undefined)setTraits(d.traits);if(d.ideals!==undefined)setIdeals(d.ideals);if(d.bonds!==undefined)setBonds(d.bonds);if(d.flaws!==undefined)setFlaws(d.flaws);if(d.backstory!==undefined)setBackstory(d.backstory);if(d.gp!==undefined)setGp(d.gp);if(d.selSp!==undefined)setSelSp(d.selSp);if(d.selInv!==undefined)setSelInv(d.selInv);if(d.classOrder!==undefined)setClassOrder(d.classOrder);if(d.inventory!==undefined)setInventory(d.inventory);if(d.selRituals!==undefined)setSelRituals(d.selRituals);if(d.selTomeCantrips!==undefined)setSelTomeCantrips(d.selTomeCantrips);if(d.spPrep!==undefined)setSpPrep(d.spPrep);if(d.usedSlots!==undefined)setUsedSlots(d.usedSlots);}catch(err){alert("Failed to load character file.");}e.target.value="";};
    reader.readAsText(file);
  }
  function levelUpCharacter(){setLevel(prev=>{if(prev>=20){alert("Already level 20.");return prev;}return prev+1;});}

  // START PATCH RAND-SPELLS — helper: pick random spells for a caster on randomize
  function randomizeSpellsForCharacter(className,charLevel,spellAbilityMod){
    const ct=CTYPE[className];if(!ct)return{selSp:{},spPrep:{}};
    const lv1e=charLevel;
    const maxSL=maxSpellLevel(ct,lv1e);
    const classSpells=CS[className];if(!classSpells)return{selSp:{},spPrep:{}};
    const knownStr=spellsKnown(className,lv1e,spellAbilityMod)||"";
    const spellLimit=Number.parseInt(knownStr,10)||0;

    // Weighted favorites per class (cantrips + leveled mixed — we split by checking CS[0])
    const FAVS={
      Wizard:["Mage Armor","Shield","Magic Missile","Detect Magic","Find Familiar","Burning Hands","Misty Step","Mirror Image","Scorching Ray","Web","Fireball","Counterspell","Fly","Haste"],
      Cleric:["Bless","Cure Wounds","Healing Word","Guiding Bolt","Shield of Faith","Command","Aid","Lesser Restoration","Spiritual Weapon","Prayer of Healing","Revivify","Spirit Guardians","Dispel Magic"],
      Druid:["Entangle","Faerie Fire","Goodberry","Healing Word","Cure Wounds","Thunderwave","Moonbeam","Pass without Trace","Spike Growth","Lesser Restoration","Call Lightning","Plant Growth"],
      Bard:["Vicious Mockery","Dissonant Whispers","Healing Word","Faerie Fire","Heroism","Sleep","Enhance Ability","Invisibility","Suggestion","Shatter","Hypnotic Pattern","Dispel Magic"],
      Sorcerer:["Fire Bolt","Ray of Frost","Mage Hand","Minor Illusion","Shield","Magic Missile","Burning Hands","Chromatic Orb","Misty Step","Scorching Ray","Fireball","Counterspell","Haste"],
      Warlock:["Eldritch Blast","Mage Hand","Minor Illusion","Armor of Agathys","Hex","Hellish Rebuke","Charm Person","Misty Step","Invisibility","Hunger of Hadar","Counterspell","Fly"],
      Paladin:["Bless","Cure Wounds","Divine Favor","Shield of Faith","Command","Thunderous Smite","Wrathful Smite","Find Steed","Aid","Lesser Restoration","Revivify"],
      Ranger:["Hunter's Mark","Cure Wounds","Goodberry","Fog Cloud","Ensnaring Strike","Hail of Thorns","Longstrider","Pass without Trace","Spike Growth","Silence","Lesser Restoration"],
    };
    const favs=FAVS[className]||[];

    // Helper: shuffle array
    const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

    // --- Cantrips ---
    const cantripPool=[...(classSpells[0]||[])];
    const cantripFavs=favs.filter(n=>cantripPool.includes(n));
    const cantripCount=ct==="warlock"?2:lv1e>=10?5:lv1e>=4?4:3;
    const pickedCantrips=[];
    // pick from favs first, then fill randomly
    for(const n of shuffle(cantripFavs)){if(pickedCantrips.length>=cantripCount)break;pickedCantrips.push(n);}
    const cantripRest=shuffle(cantripPool.filter(n=>!pickedCantrips.includes(n)));
    for(const n of cantripRest){if(pickedCantrips.length>=cantripCount)break;pickedCantrips.push(n);}

    // --- Leveled spells ---
    // Collect all available leveled spells up to maxSL, grouped by level
    const leveledByLv={};
    for(let l=1;l<=maxSL;l++){
      const pool=[...(classSpells[l]||[])];
      if(pool.length)leveledByLv[l]=pool;
    }
    const leveledFavs=favs.filter(n=>{
      for(let l=1;l<=maxSL;l++){if((classSpells[l]||[]).includes(n))return true;}return false;
    });

    // Build ordered candidate list: favs first (shuffled), then rest shuffled
    const allLeveledPool=[];
    for(let l=1;l<=maxSL;l++){allLeveledPool.push(...(classSpells[l]||[]));}
    const orderedCandidates=[...shuffle(leveledFavs),...shuffle(allLeveledPool.filter(n=>!leveledFavs.includes(n)))];

    // Pick up to spellLimit unique leveled spells
    const pickedLeveled=[];
    const seen=new Set();
    for(const n of orderedCandidates){
      if(pickedLeveled.length>=spellLimit)break;
      if(seen.has(n))continue;seen.add(n);
      pickedLeveled.push(n);
    }

    // Group picked leveled spells back by their level
    const selSpOut={0:pickedCantrips};
    for(let l=1;l<=maxSL;l++){
      const atThisLevel=pickedLeveled.filter(n=>(classSpells[l]||[]).includes(n));
      if(atThisLevel.length)selSpOut[l]=atThisLevel;
    }

    // spPrep: all picked leveled spells marked prepared/active
    const spPrepOut={};
    pickedLeveled.forEach(n=>{spPrepOut[n]=true;});

    return{selSp:selSpOut,spPrep:spPrepOut};
  }
  // END PATCH RAND-SPELLS

  function rand(){
    const clsLocked=classLockedRef.current,spLocked=speciesLockedRef.current,lvLocked=levelLockedRef.current;
    const rs=pick(Object.keys(SPECIES)),rc=pick(Object.keys(CLASSES)),rb=pick(Object.keys(BGS));
    const rl=Math.ceil(Math.random()*20);
    if(!clsLocked&&!spLocked){setSp(rs);setCn(rc);setBg(rb);setCname(pickName(rs));setSelSk(CLASSES[rc].sc.slice(0,CLASSES[rc].ns));setEquipped({...CLASS_DEFAULTS[rc]});setMasteredWeapons(defaultMasteredWeaponsForClass(rc));}
    else{if(!clsLocked){setCn(rc);setSelSk(CLASSES[rc].sc.slice(0,CLASSES[rc].ns));setEquipped({...CLASS_DEFAULTS[rc]});setMasteredWeapons(defaultMasteredWeaponsForClass(rc));}if(!spLocked)setSp(rs);setBg(rb);setCname(pickName(spLocked?sp:rs));}
    if(!lvLocked)setLevel(rl);
    const useBg=rb,useSp=spLocked?sp:rs,useCn=clsLocked?cn:rc;
    const rolls=Array.from({length:6},r4d6);const ns=assignByPriority(useCn,rolls);
    setRstats(ns);setMstats(ns);setSmode("Rolled");
    // Respect 2024 feat budget: ASI levels 4/8/12/16/19 (+Fighter 6/14, +Rogue 10, +1 Origin for Human)
    const rlvl=lvLocked?level:rl;
    const asiCount=[4,8,12,16,19].filter(x=>x<=rlvl).length+(useCn==="Fighter"?[6,14].filter(x=>x<=rlvl).length:useCn==="Rogue"&&rlvl>=10?1:0)+(useSp==="Human"?1:0);
    const pool=[...new Set([...(SPECIES[useSp]?.racialFeats||[]),...(CLASSES[useCn].classFeatChoices||[])])].filter(f=>ALL_FEATS[f]&&ALL_FEATS[f].cat!=="Fighting Style");
    const chosen={};let left=asiCount;while(left>0&&pool.length){const f=pool.splice(Math.floor(Math.random()*pool.length),1)[0];if(!chosen[f]){chosen[f]=true;left--;}}
    const FS_UNLOCK_R={Fighter:1,Paladin:2,Ranger:2};
    if(FS_UNLOCK_R[useCn]&&rlvl>=FS_UNLOCK_R[useCn]){const fsPool=Object.keys(ALL_FEATS).filter(f=>ALL_FEATS[f].cat==="Fighting Style");chosen[pick(fsPool)]=true;}
    setFeatMap(chosen);setSkilledSkills([]);setUsedSlots({});setSelInv([]);setSelRituals([]);setSelTomeCantrips([]);
    setSub(rlvl>=3?pick(Object.keys(SUBCLASSES[useCn]||{}))||"":"");
    const p=getPersonality(useBg);setTraits(p.trait);setIdeals(p.ideal);setBonds(p.bond);setFlaws(p.flaw);
    // START PATCH RAND-SPELLS-CALL — auto-pick spells for casters on randomize
    const useLevel=lvLocked?level:rl;
    const useSpellCt=CTYPE[useCn];
    if(useSpellCt){
      const useSab=SAB[useCn]||"";
      const useStatsBoosted=applyBoosts(assignByPriority(useCn,Array.from({length:6},r4d6)),useBg,"+2/+1");
      const useSpellMod=useSab?mf(useStatsBoosted[useSab]):0;
      const spellData=randomizeSpellsForCharacter(useCn,useLevel,useSpellMod);
      setSelSp(spellData.selSp);setSpPrep(spellData.spPrep);
    }else{setSelSp({});setSpPrep({});}
    // END PATCH RAND-SPELLS-CALL
  }

  // Skills/spells may be selected beyond the RAW limit (marked in the builder only).
  function togSk(s){setSelSk(cur=>cur.includes(s)?cur.filter(x=>x!==s):[...cur,s]);}
  function togLang(l){setSelLangs(cur=>cur.includes(l)?cur.filter(x=>x!==l):[...cur,l]);}
  function togExpertise(s,max){setSelExpertise(cur=>cur.includes(s)?cur.filter(x=>x!==s):cur.length>=max?cur:[...cur,s]);}
  function togMiCantrip(name){setMiCantrips(cur=>cur.includes(name)?cur.filter(x=>x!==name):cur.length>=2?cur:[...cur,name]);}
  function chooseMiClass(c){setMiClass(c);setMiCantrips([]);setMiSpell("");}
  function togWildShape(name,max){setSelWildShapes(cur=>cur.includes(name)?cur.filter(x=>x!==name):cur.length>=max?cur:[...cur,name]);}
  // START PATCH A — togSp: enforce leveled spell budget (cantrips lv=0 always free)
  function togSp(name,lv){
    setSelSp(prev=>{
      const cur=prev[lv]||[];
      const alreadySel=cur.includes(name);
      return{...prev,[lv]:alreadySel?cur.filter(n=>n!==name):[...cur,name]};
    });
  }
  // END PATCH A
  function togPrep(name){setSpPrep(prev=>({...prev,[name]:!prev[name]}));}
  function togFeat(name){
    if(level===1&&name!==bgo?.feat)return;
    setFeatMap(prev=>({...prev,[name]:!prev[name]}));
  }
  function defaultMasteredWeaponsForClass(cn){
    const slots=weaponMasterySlots(cn,level);
    if(!slots)return[];
    const defaults=[CLASS_DEFAULTS[cn]?.weapon,...(CW[cn]||[])].filter(Boolean);
    return[...new Set(defaults)].filter(w=>WD[w]?.mastery&&WD[w].mastery!=="—").slice(0,slots);
  }

  function weaponRequiresTwoHands(item){
    const props=WD[item]?.pr||"";
    return props.toLowerCase().includes("two-handed");
  }

  function equipItem(item){
    if(ARMOR_ITEMS[item])setEquipped(e=>({...e,armor:e.armor===item?null:item}));
    else if(item==="Shield")setEquipped(e=>({...e,shield:!e.shield}));
    else if(WD[item])setEquipped(e=>{
      const newWeapon=e.weapon===item?null:item;
      let newShield=e.shield;
      if(newWeapon){
        if(weaponRequiresTwoHands(newWeapon)){
          newShield=false;
        } else if(!e.shield&&(ARMOR_PROF[cn]||[]).includes("shield")&&CLASS_DEFAULTS[cn]?.shield){
          newShield=true;
        }
      }
      return{...e,weapon:newWeapon,shield:newShield};
    });
  }
  function togCollapsed(id){setCollapsed(c=>({...c,[id]:!c[id]}));}
  function onDragStart(id){setDraggingPanel(id);}
  function onDrop(targetId){if(!draggingPanel||draggingPanel===targetId)return;setPanelOrder(prev=>{const o=[...prev];const fi=o.indexOf(draggingPanel),ti=o.indexOf(targetId);o.splice(fi,1);o.splice(ti,0,draggingPanel);return o;});setDraggingPanel(null);}
  function buildSBL(){
    const res={};
    const mk=(name,source)=>{const d=spellD(name)||{};return{name,desc:d.desc||"",cast:d.cast||"",range:d.range||"",dur:d.dur||"",comp:d.comp||"",pg:d.pg||"",conc:/^Conc\.?\b/i.test(d.dur||""),source};};
    Object.entries(selSp).forEach(([lv,names])=>{const li=Number(lv);res[li]=(names||[]).map(name=>mk(name,null));});
    // Merge subclass bonus spells (Domain/Oath/Patron/Circle) into the same level buckets, tagged with their source.
    if(sub&&level>=3){
      const isCircleLand=cn==="Druid"&&sub==="Circle of the Land";
      const bonusNames=isCircleLand?circleLandSpellsAtLevel(landType,level):subclassSpellsAtLevel(cn,sub,level);
      const bonusLabel=isCircleLand?sub+" ("+landType+")":sub;
      bonusNames.forEach(name=>{
        const lvl=spellLevelOf(name);if(lvl===undefined)return;
        if(!res[lvl])res[lvl]=[];
        if(res[lvl].some(s=>s.name===name))return; // already known/prepared by the player
        res[lvl].push(mk(name,bonusLabel));
      });
    }
    return res;
  }

  function genSheet(){
    const nextPortraitSeed=Math.floor(Math.random()*1000000);
    setPortraitSeed(nextPortraitSeed);
    const nextGenderRoll=Math.random()<0.5?"male":"female";
    setGender(nextGenderRoll);
    const da=CURRENT_LANG==="da";
    const featDesc=n=>da?(FEATDESC_DA[n]||ALL_FEATS[n]?.desc||""):(ALL_FEATS[n]?.desc||"");
    const orderInfo=CLASS_ORDER[cn]?CLASS_ORDER[cn].options.find(o=>o[0]===classOrder):null;
    const orderLine=orderInfo?CLASS_ORDER[cn].label+": "+orderInfo[0]+" — "+orderInfo[1][da?1:0]:"";
    const originWord=da?"Oprindelse":"Origin";
    const originFeatLine=bgo.feat+" ("+originWord+"): "+featDesc(bgo.feat);
    const featsList=[originFeatLine,...activeFeats.map(f=>{const d=featDesc(f);return d?f+": "+d:f;})].join("\n");
    // Only show class features already unlocked at the character's current level.
    const featureLevel=f=>{const m=f.match(/Lvl(\d+)/);return m?parseInt(m[1],10):1;};
    const subPg=(sub&&SUBCLASS_PG[cn]?.[sub])||null;
    const subFeatureLines=(sub&&level>=3)?subclassFeaturesAtLevel(cn,sub,level).map(([name,txt])=>name+" ("+sub+"): "+txt[da?1:0]+(subPg?" (PHB p."+subPg+")":"")):[];
    const classFeaturesTxt=[...(cls.features||[]).filter(f=>!(sub&&/^Subclass\b/i.test(f))).filter(f=>featureLevel(f)<=level).map(f=>{const label=da?(FEATURE_DA[f]||f):f;const d=FEATURE_DESC[f]?.[da?1:0];return d?label+": "+d:label;}),...subFeatureLines].filter(Boolean).join("\n");
    const breathDC=8+cm+pb;
    const dragonTraitDetail={
      "Draconic Ancestry":dragonColor+" — "+DRACONIC_ANCESTRY[dragonColor],
      "Breath Weapon":breathWeaponDice(level)+" "+DRACONIC_ANCESTRY[dragonColor]+", DC "+breathDC+" DEX save (half on success), 15-ft Cone or 30x5-ft Line, "+pb+"/long rest",
      "Damage Resistance":"Resistance to "+DRACONIC_ANCESTRY[dragonColor]+" damage",
    };
    const racialTraitsTxt=(speciesData.traits||[]).map(tr=>{const label=da?(TRAIT_DA[tr]||tr):tr;const d=sp==="Dragonborn"?dragonTraitDetail[tr]:null;return d?label+": "+d:label;}).join("\n");
    const invLine=(isWarlock&&selInv.length)?selInv.map(n=>{const d=ELDRITCH_INVOCATIONS[n]?.[da?1:0];return "• "+n+(d?": "+d:"");}).join("\n"):"";
    const tomeCantripLine=(isWarlock&&selInv.includes("Pact of the Tome")&&selTomeCantrips.length)?selTomeCantrips.map(n=>{const dd=spellD(n)||{};return "• "+n+(dd.desc?": "+dd.desc:"");}).join("\n"):"";
    const ritualLine=(isWarlock&&selInv.includes("Pact of the Tome")&&selRituals.length)?selRituals.map(n=>{const dd=spellD(n)||{};return "• "+n+(dd.desc?": "+dd.desc:"");}).join("\n"):"";
    const invBlock=[invLine?"Eldritch Invocations:\n"+invLine:"",tomeCantripLine?"Tome cantrips:\n"+tomeCantripLine:"",ritualLine?"Ritual spells (Tome):\n"+ritualLine:""].filter(Boolean).join("\n");
    const miLine=hasMagicInitiate&&(miCantrips.length||miSpell)?"Magic Initiate ("+miClassEff+"):\n"+[...miCantrips,miSpell].filter(Boolean).map(n=>{const dd=spellD(n)||{};return "• "+n+(dd.desc?": "+dd.desc:"");}).join("\n"):"";
    const wildShapeLine=(cn==="Druid"&&selWildShapes.length)?"Wild Shape ("+wildShapeUses(level)+"/short or long rest):\n"+selWildShapes.map(n=>"• "+n+" — see page 3 for full stat block").join("\n"):"";
    const rageLine=cn==="Barbarian"?(()=>{const r=barbarianRage(level);return "Rage: "+r.rages+" uses (regain 1 per Short Rest, all per Long Rest), +"+r.dmg+" damage on Strength-based hits";})():"";
    const channelDivinityLine=(cn==="Cleric"&&level>=2)?"Channel Divinity: "+clericChannelDivinity(level)+" uses (regain 1 per Short Rest, all per Long Rest)":(cn==="Paladin"&&level>=3)?"Channel Divinity: "+paladinChannelDivinity(level)+" uses (regain 1 per Short Rest, all per Long Rest)":"";
    const sorceryPointsLine=(cn==="Sorcerer"&&level>=2)?"Sorcery Points: "+sorceryPoints(level)+" (regain all per Long Rest)":"";
    const combinedFeatures=[orderLine,featsList,invBlock,miLine,wildShapeLine,rageLine,channelDivinityLine,sorceryPointsLine,classFeaturesTxt,racialTraitsTxt].filter(Boolean).join("\n\n--\n\n");
    const allLangs=[...new Set([...(speciesData?.languages||["Common"]),...selLangs])];
    const allTools=[bgo.tools,...skilledTools].filter(Boolean).join(", ");
    const prof=cls.armor+" - "+cls.weapons+"\nTools: "+allTools+"\nLanguages: "+allLangs.join(", ");
    const featuresTxt=[combinedFeatures,anotes?"\n"+anotes:""].join("").trim();
    const charTraits=traits||dispName+" is a "+bg.toLowerCase()+" turned "+cn.toLowerCase()+".";
    const nextGender=nextGenderRoll||gender;
    const breathRow=sp==="Dragonborn"?[{name:"Breath Weapon ("+dragonColor+")",atk:"DC "+breathDC,dmg:breathWeaponDice(level)+" "+DRACONIC_ANCESTRY[dragonColor],props:"15-ft Cone or 30x5-ft Line",mastery:"—"}]:[];
    const nextSpellsByLevel=buildSBL();
    const equippedGear=[equipped.armor,equipped.shield?"Shield":"",equipped.weapon].filter(Boolean).join(" · ")||(da?"Intet udstyret":"Nothing equipped");
    const nextResource=classResource(cn,level,mf(fin.CHA));
    const nextSheet={name:dispName,playerName,classLevel:clsLvl,background:bg,species:sp,alignment:align,finalStats:fin,ac,initiative:init,speed,hpMax:hp,hitDice:level+"d"+cls.hd,profBonus:pb,saves,skills:skProfs,passivePerc:passPerc,weapons:[...buildW(),...breathRow],spellAbility:sab,spellAtk:sab?sgn(smod+pb):"",spellDC:sab?String(8+smod+pb):"",isCaster:isCaster&&!!sab&&(Object.values(selSp).flat().length>0||Object.values(nextSpellsByLevel).flat().length>0),spellSlots:slots,spellsByLevel:nextSpellsByLevel,profLangs:prof,features:featuresTxt,originFeat:bgo.feat,traits:charTraits,ideals:ideals||"—",bonds:bonds||"—",flaws:flaws||"—",backstory,gp,equipment:EQUIP[cn].join("\n"),equippedGear,acBreakdown,resource:nextResource,inventory,portraitSeed:nextPortraitSeed,gender:nextGender,portraitMode,weaponProf:cls.weapons,armorProf:cls.armor,wisSkills:orderWisSkills(cn,classOrder),wisMod:mf(fin.WIS),expertise:selExpertise,toolProf:allTools,wildShapeForms:cn==="Druid"?selWildShapes:[],subclass:sub};
    nextSheet.portraitUrl=pollinationsImageUrl(buildPortraitPromptFromSheet(nextSheet),nextPortraitSeed);
    setSheet(nextSheet);
    setView("sheet");
  }

  if(view==="sheet"&&sheet){
    return <div><div className="no-print" style={{display:"flex",gap:8,padding:"8px 14px",background:"#1a0e00",alignItems:"center"}}><button onClick={()=>setView("gen")} style={{padding:"5px 14px",borderRadius:4,border:"1px solid #c9a84c",background:"#2d1a00",color:"#fcd34d",cursor:"pointer",fontSize:12,fontWeight:600}}>{t("Back")}</button><button onClick={()=>window.print()} style={{padding:"5px 14px",borderRadius:4,border:"1px solid #4ade80",background:"#14532d",color:"#4ade80",cursor:"pointer",fontSize:12,fontWeight:600}}>{t("Print / PDF")}</button><span style={{fontSize:11,color:"#8a6a2a"}}>{t("Set page margins to None.")} {(sheet.subclass==="Wild Magic Sorcery"?"4 ":"3 ")+t("pages")}</span></div><div className="print-area"><FancySheet sh={sheet}/><Page2 sh={sheet}/><Page3 sh={sheet}/>{sheet.subclass==="Wild Magic Sorcery"&&<Page4 sh={sheet}/>}</div><style>{`@media print{@page{margin:0;size:A4 portrait}html,body,#root{margin:0!important;padding:0!important;background:white!important;width:210mm!important;min-height:297mm!important}.no-print{display:none!important}.print-area{display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important}.page{width:210mm!important;height:297mm!important;margin:0!important;box-shadow:none!important;break-after:page;page-break-after:always;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;overflow:hidden!important}.page img{display:block!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.page *{box-shadow:none!important}}`}</style></div>;
  }

  const buildOverview=()=>{
    const abilRows=AB.map(a=>{const score=fin[a],mod=mf(score),saveProf=saves.includes(a),saveBonus=mod+(saveProf?pb:0);return{ab:a,score,mod,saveProf,saveBonus};});
    const orderWis=orderWisSkills(cn,classOrder);const wm2=mf(fin.WIS);
    const skillRows=SKILL_LIST.map(sk=>{const prof=skProfs.includes(sk.name),expert=selExpertise.includes(sk.name),fromBg=bgo.sk.includes(sk.name),bonus=mf(fin[sk.ab])+(prof?pb:0)+(expert?pb:0)+(orderWis.includes(sk.name)?wm2:0);return{...sk,prof,expert,fromBg,bonus};});
    const weaponDisplay=[...buildW(),...(sp==="Dragonborn"?[{name:"Breath Weapon ("+dragonColor+")",atk:"DC "+(8+cm+pb),dmg:breathWeaponDice(level)+" "+DRACONIC_ANCESTRY[dragonColor],props:"15-ft Cone or 30x5-ft Line",mastery:"—"}]:[])];
    return(<div>
      <div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:"0.72rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.4rem"}}>Ability Scores & Saving Throws</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"0.4rem"}}>
          {abilRows.map(r=>(<div key={r.ab} style={{background:G.card,borderRadius:"0.75rem",padding:"0.5rem",border:"1px solid "+G.border,textAlign:"center"}}><div style={{fontSize:"0.6rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>{r.ab}</div><div style={{fontSize:"1.5rem",fontWeight:800,lineHeight:1.1,color:"#f1f5f9"}}>{r.score}</div><div style={{fontSize:"0.85rem",fontWeight:700,color:G.gold}}>{sgn(r.mod)}</div><div style={{fontSize:"0.62rem",color:r.saveProf?"#4ade80":G.dimmer,marginTop:"2px",fontWeight:r.saveProf?700:400}}>save {sgn(r.saveBonus)}{r.saveProf?" *":""}</div></div>))}
        </div>
      </div>
      <div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:"0.72rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.4rem"}}>Weapon Attack Bonuses</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.3rem"}}>
          {weaponDisplay.map((w,i)=>{const isEq=w.name===equipped.weapon;return(<div key={i} style={{display:"grid",gridTemplateColumns:"1.6fr 0.55fr 0.85fr 1.4fr 0.8fr auto",alignItems:"center",gap:"0.5rem",background:isEq?"#14532d22":G.card,borderRadius:"0.65rem",padding:"0.45rem 0.75rem",border:"1px solid "+(isEq?"#4ade8066":G.border)}}><span style={{fontSize:"0.82rem",fontWeight:isEq?700:400,color:isEq?"#4ade80":"#e2e8f0"}}>{isEq?"* ":""}{w.name}</span><span style={{fontSize:"1rem",fontWeight:800,color:G.gold}}>{w.atk}</span><span style={{fontSize:"0.8rem",color:G.muted}}>{w.dmg}</span><span style={{fontSize:"0.68rem",color:G.dimmer}}>{w.props}</span><MasteryBtn name={w.mastery}/><button onClick={()=>equipItem(w.name)} style={{padding:"0.15rem 0.45rem",borderRadius:"0.4rem",fontSize:"0.68rem",border:"1px solid",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap",background:isEq?"#14532d":"transparent",color:isEq?"#4ade80":G.dim,borderColor:isEq?"#4ade80":"#334155"}}>{isEq?"Unequip":"Equip"}</button></div>);})}
        </div>
      </div>
      <div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:"0.72rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.4rem"}}>Skill Bonuses</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"0.3rem"}}>
          {skillRows.map(sk=>(<div key={sk.name} style={{display:"flex",alignItems:"center",gap:"0.4rem",background:sk.expert?"#78350f22":sk.fromBg?"#1e3a8a22":sk.prof?"#14532d22":G.card,borderRadius:"0.55rem",padding:"0.35rem 0.6rem",border:"1px solid "+(sk.expert?"#fcd34d88":sk.fromBg?"#3b82f688":sk.prof?"#4ade8055":G.border)}}><span style={{flex:1,fontSize:"0.78rem",color:sk.prof?"#f1f5f9":G.muted,fontWeight:sk.prof?600:400}}>{sk.name}</span><span style={{fontSize:"0.65rem",color:G.dimmer,flexShrink:0}}>{sk.ab}</span><span style={{fontSize:"0.88rem",fontWeight:700,color:sk.expert?"#fcd34d":sk.fromBg?"#3b82f6":sk.prof?"#4ade80":G.muted,minWidth:"24px",textAlign:"right"}}>{sgn(sk.bonus)}</span>{sk.expert?<span style={{fontSize:"0.6rem",color:"#fcd34d"}}>★</span>:sk.fromBg?<span style={{fontSize:"0.6rem",color:"#3b82f6"}}>◆</span>:sk.prof&&<span style={{fontSize:"0.6rem",color:"#4ade80"}}>*</span>}</div>))}
        </div>
        <div style={{marginTop:"0.4rem",fontSize:"0.65rem",color:G.dim}}>Passive Perception: <strong style={{color:"#f1f5f9"}}>{passPerc}</strong> - Prof. Bonus: <strong style={{color:G.gold}}>{sgn(pb)}</strong></div>
      </div>
      {activeFeats.length>0&&(<div><div style={{fontSize:"0.72rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.4rem"}}>{t("Active Feats")}</div><div style={{display:"flex",flexDirection:"column",gap:"0.3rem"}}>{activeFeats.map(f=>{const fd=ALL_FEATS[f];const catColor=CAT_LABEL_COLOR[fd?.cat]||G.muted;return(<div key={f} style={{background:G.card,borderRadius:"0.65rem",padding:"0.45rem 0.75rem",border:"1px solid "+G.border}}><div style={{display:"flex",alignItems:"center",gap:"0.4rem",flexWrap:"wrap",marginBottom:"0.2rem"}}><span style={{fontSize:"0.82rem",fontWeight:700,color:"#4ade80"}}>{f}</span>{fd?.cat&&<span style={{fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.08em",color:catColor,fontWeight:700,border:"1px solid",borderColor:catColor,borderRadius:"0.3rem",padding:"0 0.3rem"}}>{t(fd.cat)}</span>}</div>{fd&&<div style={{fontSize:"0.72rem",color:G.muted,lineHeight:1.4}}>{featDescL(f,fd.desc)}</div>}</div>);})}</div></div>)}
    </div>);
  };

  const buildFeatsPanel=()=>{
    const tabs=["Origin","General","Fighting Style","Epic Boon","Species","Class"];
    // 2024 RAW eligibility: General/Species/Class feats come from ASI levels (4/8/12/16/19; Fighter +6/+14; Rogue +10)
    const asiSlots=(c,l)=>[4,8,12,16,19].filter(x=>x<=l).length+(c==="Fighter"?[6,14].filter(x=>x<=l).length:c==="Rogue"&&l>=10?1:0);
    const featBudget=asiSlots(cn,lv1e)+(mc&&cls2?asiSlots(cn2,lv2c):0)+(sp==="Human"?1:0);
    const FS_UNLOCK={Fighter:1,Paladin:2,Ranger:2};
    const canFS=(FS_UNLOCK[cn]&&lv1e>=FS_UNLOCK[cn])||(mc&&FS_UNLOCK[cn2]&&lv2c>=FS_UNLOCK[cn2]);
    const canEpicBoon=lv1e>=19||(mc&&lv2c>=19);
    const selFSCount=activeFeats.filter(f=>ALL_FEATS[f]?.cat==="Fighting Style").length;
    const selEBCount=activeFeats.filter(f=>ALL_FEATS[f]?.cat==="Epic Boon").length;
    const selBudgetCount=activeFeats.filter(f=>ALL_FEATS[f]?.cat!=="Fighting Style"&&ALL_FEATS[f]?.cat!=="Epic Boon").length;
    const atBudget=selBudgetCount>=featBudget;
    const hints={Species:`Feats available to ${sp}`,Class:`Suggested for ${cn}`,Origin:`Your background grants: ${bgo.feat}${sp==="Human"?" — Human (Versatile) may pick 1 extra Origin Feat":""}`,["Fighting Style"]:canFS?"Choose 1 Fighting Style (class feature)":"Only Fighters (lvl 1), Paladins and Rangers (lvl 2) get a Fighting Style",["Epic Boon"]:canEpicBoon?"Choose 1 Epic Boon (unlocked at level 19)":"Unlocked at level 19"};
    // Each tab lists only the feats the character is entitled to consider
    const currentList=featTab==="Species"?racialFeatSuggestions:featTab==="Class"?classFeatSuggestions.filter(n=>ALL_FEATS[n]):featTab==="Origin"?ORIGIN_FEATS:featsByTab[featTab]||[];
    const suggested=featTab==="Species"?racialFeatSuggestions:featTab==="Class"?classFeatSuggestions:featTab==="Origin"?[bgo.feat]:[];
    const sorted=[...currentList].sort((a,b)=>(suggested.includes(a)?0:1)-(suggested.includes(b)?0:1));
    const featAllowed=name=>{
      if(featMap[name])return true; // always allow deselect
      const cat=ALL_FEATS[name]?.cat;
      if(cat==="Fighting Style")return canFS&&selFSCount<1;
      if(cat==="Epic Boon")return canEpicBoon&&selEBCount<1;
      return !atBudget;
    };
    const miPicker=()=>{
      const cantripList=CS[miClassEff]?.[0]||[];
      const spellList=CS[miClassEff]?.[1]||[];
      return(<div style={{marginTop:"0.5rem",paddingTop:"0.5rem",borderTop:"1px solid "+G.border}}>
        <div style={{fontSize:"0.72rem",color:G.gold,marginBottom:"0.35rem"}}>{t("Choose a class")} (Cleric, Druid, {t("or")} Wizard):</div>
        <div style={{display:"flex",gap:"0.3rem",marginBottom:"0.5rem"}}>{MAGIC_INITIATE_CLASSES.map(c=>(<button key={c} onClick={()=>chooseMiClass(c)} style={{padding:"0.2rem 0.55rem",borderRadius:"0.45rem",fontSize:"0.72rem",border:"1px solid "+(miClassEff===c?G.gold:"#334155"),cursor:"pointer",background:miClassEff===c?G.gold:"transparent",color:miClassEff===c?"#020817":"#f1f5f9",fontWeight:miClassEff===c?700:400}}>{c}</button>))}</div>
        <div style={{fontSize:"0.72rem",color:G.gold,marginBottom:"0.35rem"}}>{t("Cantrips")} ({miCantrips.length}/2):</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem",marginBottom:"0.5rem"}}>{cantripList.map(name=>{const sel=miCantrips.includes(name);const atMax=miCantrips.length>=2;return <button key={name} disabled={atMax&&!sel} onClick={()=>togMiCantrip(name)} title={spellD(name)?.desc||""} style={{padding:"0.2rem 0.5rem",borderRadius:"0.45rem",fontSize:"0.7rem",border:"1px solid "+(sel?G.gold:"#334155"),cursor:(atMax&&!sel)?"not-allowed":"pointer",opacity:(atMax&&!sel)?0.35:1,background:sel?G.gold:"transparent",color:sel?"#020817":"#f1f5f9",fontWeight:sel?700:400}}>{name}</button>;})}</div>
        <div style={{fontSize:"0.72rem",color:G.gold,marginBottom:"0.35rem"}}>{t("1st-level spell")}:</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>{spellList.map(name=>{const sel=miSpell===name;return <button key={name} onClick={()=>setMiSpell(sel?"":name)} title={spellD(name)?.desc||""} style={{padding:"0.2rem 0.5rem",borderRadius:"0.45rem",fontSize:"0.7rem",border:"1px solid "+(sel?G.gold:"#334155"),cursor:"pointer",background:sel?G.gold:"transparent",color:sel?"#020817":"#f1f5f9",fontWeight:sel?700:400}}>{name}</button>;})}</div>
      </div>);
    };
    const skilledPicker=()=>(<div style={{marginTop:"0.5rem",paddingTop:"0.5rem",borderTop:"1px solid "+G.border}}>
      <div style={{fontSize:"0.72rem",color:G.gold,marginBottom:"0.35rem"}}>{t("Choose 3 additional skills or tools")} ({skilledSkills.length+skilledTools.length}/3):</div>
      <div style={{fontSize:"0.65rem",color:G.dim,marginBottom:"0.25rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>{t("Skills")}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem",marginBottom:"0.5rem"}}>{SKILL_LIST.map(sk=>{const picked=skilledSkills.includes(sk.name);const alreadyProf=bgo.sk.includes(sk.name)||selSk.includes(sk.name);const atMax=(skilledSkills.length+skilledTools.length)>=3;return <button key={sk.name} onClick={()=>setSkilledSkills(prev=>prev.includes(sk.name)?prev.filter(s=>s!==sk.name):atMax?prev:[...prev,sk.name])} style={{padding:"0.2rem 0.45rem",borderRadius:"0.45rem",fontSize:"0.7rem",border:"1px solid",cursor:(atMax&&!picked)?"not-allowed":"pointer",opacity:(atMax&&!picked)?0.35:1,background:picked?"#fcd34d":"transparent",color:picked?G.bg:alreadyProf?"#94a3b8":"#f1f5f9",borderColor:picked?"#fcd34d":"#334155",fontWeight:picked?700:400}}>{sk.name}{alreadyProf?" *":""}</button>;})}</div>
      <div style={{fontSize:"0.65rem",color:G.dim,marginBottom:"0.25rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>{t("Tools")}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>{TOOL_LIST.map(tool=>{const picked=skilledTools.includes(tool);const atMax=(skilledSkills.length+skilledTools.length)>=3;return <button key={tool} onClick={()=>setSkilledTools(prev=>prev.includes(tool)?prev.filter(s=>s!==tool):atMax?prev:[...prev,tool])} style={{padding:"0.2rem 0.45rem",borderRadius:"0.45rem",fontSize:"0.7rem",border:"1px solid",cursor:(atMax&&!picked)?"not-allowed":"pointer",opacity:(atMax&&!picked)?0.35:1,background:picked?"#fcd34d":"transparent",color:picked?G.bg:"#f1f5f9",borderColor:picked?"#fcd34d":"#334155",fontWeight:picked?700:400}}>{tool}</button>;})}</div>
    </div>);
    return(<div>
      {activeFeats.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem",marginBottom:"0.75rem"}}>{activeFeats.map(f=>{const fd=ALL_FEATS[f];const c=CAT_LABEL_COLOR[fd?.cat]||G.muted;return <span key={f} style={{background:"#14532d",color:"#4ade80",borderRadius:"0.5rem",padding:"0.2rem 0.6rem",fontSize:"0.72rem",fontWeight:600}}>{f} <span style={{color:c,fontSize:"0.62rem"}}>({fd?.cat||""})</span></span>;})}</div>}
      <div style={{fontSize:"0.72rem",marginBottom:"0.5rem",padding:"0.35rem 0.65rem",background:"#1e293b",borderRadius:"0.5rem",border:"1px solid "+(atBudget?"#f87171":"#334155"),color:"#f1f5f9"}}>
        {t("Feats")}: <strong style={{color:atBudget?"#f87171":G.gold}}>{selBudgetCount} / {featBudget}</strong>
        <span style={{color:G.dim}}> ({t("from ASI levels 4/8/12/16/19")}{sp==="Human"?" + "+t("Human bonus Origin Feat"):""})</span>
        {canFS&&<span style={{marginLeft:"0.5rem",color:"#f97316"}}>{t("Fighting Style")}: {selFSCount}/1 ({t("free")})</span>}
      </div>
      <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap",marginBottom:"0.75rem"}}>{tabs.map(tb=>{const catCol=CAT_LABEL_COLOR[tb]||G.muted;const cnt=(tb==="Species"?racialFeatSuggestions:tb==="Class"?classFeatSuggestions:tb==="Origin"?ORIGIN_FEATS:featsByTab[tb]||[]).filter(n=>featMap[n]).length;const active=featTab===tb;return <button key={tb} onClick={()=>setFeatTab(tb)} style={tabSt(active,catCol,"#020817")}>{t(tb)}{cnt>0?` (${cnt})`:""}</button>;})}</div>
      {hints[featTab]&&<div style={{fontSize:"0.72rem",color:G.gold,marginBottom:"0.5rem",padding:"0.35rem 0.65rem",background:"#2d1a00",borderRadius:"0.5rem",border:"1px solid #92400e"}}>{hints[featTab]}</div>}
      {featTab==="Origin"&&<div style={{fontSize:"0.72rem",color:"#4ade80",marginBottom:"0.5rem",padding:"0.35rem 0.65rem",background:"#052e16",borderRadius:"0.5rem",border:"1px solid #14532d"}}>✓ <strong>{bgo.feat}</strong> is granted automatically by your {bg} background — it is already on your sheet.</div>}
      <div style={{display:"flex",flexDirection:"column",gap:"0.35rem",maxHeight:"380px",overflowY:"auto"}}>
        {sorted.map(name=>{
          const feat=ALL_FEATS[name];if(!feat)return null;
          if(featTab==="Origin"&&featBaseName(name)===featBaseName(bgo.feat))return(<div key={name} style={{borderRadius:"0.65rem",border:"1px solid #14532d",background:"#052e1644",padding:"0.4rem 0.6rem"}}><div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}><span style={{fontSize:"0.68rem",fontWeight:700,color:"#4ade80",border:"1px solid #4ade80",borderRadius:"0.4rem",padding:"0.1rem 0.4rem"}}>{t("Granted")}</span><span style={{fontSize:"0.8rem",fontWeight:600,color:"#4ade80"}}>{bgo.feat}</span></div><div style={{fontSize:"0.72rem",color:G.muted,marginTop:"0.2rem"}}>{featDescL(name,feat.desc)}</div>{name==="Magic Initiate"&&miPicker()}{name==="Skilled"&&skilledPicker()}</div>);
          const sel=!!featMap[name];const sugg=suggested.includes(name);const allowed=featAllowed(name);
          return(<div key={name} style={{outline:sugg?"1px solid #fbbf2444":"none",outlineOffset:"-1px",borderRadius:"0.65rem",opacity:allowed?1:0.35,pointerEvents:allowed?"auto":"none"}}>
            <FeatCard name={name} feat={feat} sel={sel} onToggle={()=>allowed&&togFeat(name)}>
              {name==="Skilled"&&sel&&skilledPicker()}
              {name==="Magic Initiate"&&sel&&miPicker()}
            </FeatCard>
          </div>);
        })}
      </div>
    </div>);
  };

  const identityPanel=(
    <div>
      <GFld label={t("Character Name")}><input value={cname} onChange={e=>setCname(e.target.value)} placeholder={t("Auto-generated if empty")} style={inp}/></GFld>
      <GFld label={t("Player Name")}><input value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder={t("Who is playing this character?")} style={inp}/></GFld>
      <GFld label={t("Portrait")}><div style={{display:"flex",gap:"0.5rem"}}>{[["ai",t("AI image")],["blank",t("Draw your own")]].map(([m,lbl])=><button key={m} onClick={()=>setPortraitMode(m)} style={{...tabSt(portraitMode===m),flex:1}}>{lbl}</button>)}</div></GFld>
      {portraitMode==="ai"&&<GFld label={t("Portrait Gender")}><div style={{display:"flex",gap:"0.5rem"}}>{["male","female"].map(g=><button key={g} onClick={()=>setGender(g)} style={{...tabSt(gender===g),flex:1,textTransform:"capitalize"}}>{t(g)}</button>)}</div></GFld>}
      <GFld label={t("Alignment")}><select value={align} onChange={e=>setAlign(e.target.value)} style={inp}>{["Lawful Good","Neutral Good","Chaotic Good","Lawful Neutral","True Neutral","Chaotic Neutral","Lawful Evil","Neutral Evil","Chaotic Evil","Unaligned"].map(a=><option key={a}>{a}</option>)}</select></GFld>
      <GFld label={"Level: "+level}><input type="range" min="1" max="20" value={level} onChange={e=>{setLevel(Number(e.target.value));levelLockedRef.current=true;setLevelLocked(true);}} style={{width:"100%",accentColor:G.gold}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:"0.7rem",color:G.dim}}><span>1</span><span>10</span><span>20</span></div></GFld>
      <GFld label={t("Species")}><select value={sp} onChange={e=>{setSp(e.target.value);speciesLockedRef.current=true;setSpeciesLocked(true);}} style={inp}>{Object.keys(SPECIES).map(s=><option key={s}>{s}</option>)}</select>{speciesData&&<div style={{marginTop:"0.4rem",background:G.card,borderRadius:"0.65rem",padding:"0.5rem 0.65rem"}}><div style={{fontSize:"0.65rem",color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.3rem",fontWeight:700}}>{t("Species Traits")}</div>{speciesData.traits.map((tr,i)=><div key={i} style={{fontSize:"0.73rem",color:G.muted,marginBottom:"0.2rem"}}>- {CURRENT_LANG==="da"?(TRAIT_DA[tr]||tr):tr}</div>)}</div>}
        {sp==="Dragonborn"&&<div style={{marginTop:"0.4rem",background:G.card,borderRadius:"0.65rem",padding:"0.5rem 0.65rem"}}>
          <div style={{fontSize:"0.65rem",color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.3rem",fontWeight:700}}>{t("Draconic Ancestry")}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>{Object.keys(DRACONIC_ANCESTRY).map(c=>{const sel=dragonColor===c;return <button key={c} onClick={()=>setDragonColor(c)} style={{padding:"0.2rem 0.5rem",borderRadius:"0.45rem",fontSize:"0.72rem",border:"1px solid "+(sel?G.gold:"#334155"),cursor:"pointer",background:sel?G.gold:"transparent",color:sel?"#020817":"#f1f5f9",fontWeight:sel?700:400}}>{c} ({DRACONIC_ANCESTRY[c]})</button>;})}</div>
          <div style={{fontSize:"0.68rem",color:G.muted,marginTop:"0.35rem"}}>{t("Breath Weapon")}: {breathWeaponDice(level)} {DRACONIC_ANCESTRY[dragonColor]}</div>
        </div>}
      </GFld>
      <GFld label={t("Class")}><select value={cn} onChange={e=>{changeClass(e.target.value);classLockedRef.current=true;setClassLocked(true);}} style={inp}>{Object.keys(CLASSES).map(c=><option key={c}>{c}</option>)}</select>{cls&&<div style={{marginTop:"0.4rem",background:G.card,borderRadius:"0.65rem",padding:"0.5rem 0.65rem"}}><div style={{fontSize:"0.65rem",color:"#60a5fa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.3rem",fontWeight:700}}>{t("Class Features")}</div>{cls.features.filter(f=>{const m=f.match(/Lvl(\d+)/);return(m?parseInt(m[1],10):1)<=level;}).map((f,i)=>{const da=CURRENT_LANG==="da";const label=da?(FEATURE_DA[f]||f):f;const d=FEATURE_DESC[f]?.[da?1:0];return <div key={i} style={{fontSize:"0.73rem",color:G.muted,marginBottom:"0.25rem"}}>- <b style={{color:"#cbd5e1"}}>{label}</b>{d?<span style={{color:G.dim}}> — {d}</span>:""}</div>;})}</div>}
        {CLASS_ORDER[cn]&&<div style={{marginTop:"0.6rem",background:"#2d1a00",border:"1px solid "+G.gold,borderRadius:"0.75rem",padding:"0.6rem 0.7rem"}}><div style={{fontSize:"0.78rem",color:G.gold,marginBottom:"0.4rem",fontWeight:800,display:"flex",alignItems:"center",gap:"0.4rem"}}>⚡ {t("Choose")}: {CLASS_ORDER[cn].label}</div><div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>{CLASS_ORDER[cn].options.map(([nm,desc,cantrip])=>{const sel=classOrder===nm;return <button key={nm} onClick={()=>setClassOrder(nm)} style={{textAlign:"left",padding:"0.45rem 0.6rem",borderRadius:"0.6rem",border:"1px solid "+(sel?G.gold:"#334155"),background:sel?"#4a3800":"#0f172a",cursor:"pointer"}}><div style={{fontSize:"0.8rem",fontWeight:700,color:sel?G.gold:"#e2e8f0"}}>{sel?"✓ ":""}{nm}{cantrip?<span style={{fontSize:"0.6rem",marginLeft:"0.4rem",color:"#4ade80",border:"1px solid #4ade80",borderRadius:"0.3rem",padding:"0 0.3rem"}}>+{cantrip} cantrip</span>:""}</div><div style={{fontSize:"0.7rem",color:G.muted,marginTop:"1px"}}>{desc[CURRENT_LANG==="da"?1:0]}</div></button>;})}</div></div>}</GFld>
      <div style={{marginBottom:"0.85rem",background:G.card,borderRadius:"0.75rem",padding:"0.65rem 0.75rem",border:"1px solid "+(mc?G.gold:G.border)}}>
        <label style={{display:"flex",alignItems:"center",gap:"0.5rem",cursor:"pointer",marginBottom:mc?"0.65rem":"0"}}><input type="checkbox" checked={mc} onChange={e=>setMc(e.target.checked)} style={{accentColor:G.gold,width:15,height:15}}/><span style={{fontSize:"0.8rem",fontWeight:600,color:mc?G.gold:"#e2e8f0"}}>{t("Multiclass")}</span></label>
        {mc&&level>1&&<div style={{display:"grid",gridTemplateColumns:"1fr 70px",gap:"0.5rem",alignItems:"end"}}><GFld label={t("Second class")}><select value={cn2} onChange={e=>setCn2(e.target.value)} style={inp}>{Object.keys(CLASSES).filter(c=>c!==cn).map(c=><option key={c}>{c}</option>)}</select></GFld><GFld label={t("Levels")}><select value={lv2c} onChange={e=>setLv2(Number(e.target.value))} style={inp}>{Array.from({length:Math.max(1,level-1)},(_,i)=>i+1).map(l=><option key={l}>{l}</option>)}</select></GFld></div>}
      </div>
      <GFld label={level<3?t("Subclass (available at level 3)"):t("Subclass")}>
        <select value={sub} onChange={e=>setSub(e.target.value)} disabled={level<3} style={{...inp,opacity:level<3?0.45:1}}>
          <option value="">{level<3?t("Unlocks at level 3..."):t("Choose subclass...")}</option>
          {Object.keys(SUBCLASSES[cn]||{}).map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        {sub&&SUBCLASSES[cn]?.[sub]&&<div style={{marginTop:"0.35rem",fontSize:"0.73rem",color:G.muted,fontStyle:"italic",padding:"0.35rem 0.5rem",background:G.card,borderRadius:"0.5rem"}}>{SUBCLASSES[cn][sub]}</div>}
      </GFld>
      <GFld label={t("Background")}><select value={bg} onChange={e=>setBg(e.target.value)} style={inp}>{Object.keys(BGS).map(b=><option key={b}>{b}</option>)}</select><div style={{marginTop:"0.4rem",background:G.card,borderRadius:"0.65rem",padding:"0.5rem 0.65rem"}}><div style={{fontSize:"0.65rem",color:"#fbbf24",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.25rem",fontWeight:700}}>{t("Origin Feat")}: {bgo.feat}</div><div style={{fontSize:"0.73rem",color:G.muted,fontStyle:"italic"}}>{bgo.flavor}</div></div></GFld>
    </div>
  );

  const statsPanel=(
    <div>
      <div style={{display:"flex",gap:"0.5rem",alignItems:"flex-end",marginBottom:"0.85rem"}}>
        <div style={{flex:1}}><div style={{fontSize:"0.75rem",color:G.muted,marginBottom:"0.3rem"}}>{t("Stat Method")}</div><select value={smode} onChange={e=>{const m=e.target.value;if(m==="Manual"){setMstats(prev=>{const legal=Object.values(prev).every(v=>v>=8&&v<=15)&&pointBuySpent(prev)<=PB_BUDGET;return legal?prev:{STR:8,DEX:8,CON:8,INT:8,WIS:8,CHA:8};});}setSmode(m);}} style={inp}><option value="Standard Array">{t("Standard Array")}</option><option value="Rolled">{t("Rolled")}</option><option value="Manual">{t("Point Buy")}</option></select></div>
        <GBtn onClick={()=>{const rolls=Array.from({length:6},r4d6);const ns=assignByPriority(cn,rolls);setRstats(ns);setMstats(ns);setSmode("Rolled");}} gold={smode==="Rolled"} small><RefreshCw size={12}/> {t("Roll 4d6")}</GBtn>
      </div>
      <GFld label={t("Background Ability Boost")}>
        <select value={boost} onChange={e=>setBoost(e.target.value)} style={inp}><option value="+2/+1">+2/+1</option><option value="+1/+1/+1">+1/+1/+1</option></select>
        {boost==="+2/+1"?(
          <div style={{marginTop:"0.35rem",display:"flex",flexDirection:"column",gap:"0.3rem"}}>
            <div style={{fontSize:"0.68rem",color:G.dim}}>{t("Click to choose (2024 rules — pick from")} {bgo.ab.join(", ")}):</div>
            <div style={{display:"flex",gap:"0.35rem",alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:"0.72rem",color:"#4ade80",fontWeight:800,minWidth:"1.8rem"}}>+2</span>
              {bgo.ab.map(a=><button key={a} onClick={()=>{if(a===effB1)setBoost1(effB2);setBoost2(a);}} style={{padding:"0.15rem 0.55rem",borderRadius:"0.4rem",fontSize:"0.72rem",fontWeight:700,cursor:"pointer",border:"1px solid",background:a===effB2?G.gold:"#1e293b",color:a===effB2?G.bg:"#fcd34d",borderColor:a===effB2?G.gold:"#334155"}}>{a}</button>)}
            </div>
            <div style={{display:"flex",gap:"0.35rem",alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:"0.72rem",color:"#4ade80",fontWeight:800,minWidth:"1.8rem"}}>+1</span>
              {bgo.ab.map(a=><button key={a} disabled={a===effB2} onClick={()=>setBoost1(a)} style={{padding:"0.15rem 0.55rem",borderRadius:"0.4rem",fontSize:"0.72rem",fontWeight:700,cursor:a===effB2?"not-allowed":"pointer",opacity:a===effB2?0.3:1,border:"1px solid",background:a===effB1?G.gold:"#1e293b",color:a===effB1?G.bg:"#fcd34d",borderColor:a===effB1?G.gold:"#334155"}}>{a}</button>)}
            </div>
          </div>
        ):(
          <div style={{marginTop:"0.35rem",display:"flex",gap:"0.35rem",flexWrap:"wrap"}}>
            {bgo.ab.map(a=><span key={a} style={{background:"#1e293b",border:"1px solid #fcd34d",borderRadius:"0.4rem",padding:"0.15rem 0.5rem",fontSize:"0.72rem",color:"#fcd34d",fontWeight:700}}>{a} <span style={{color:"#4ade80"}}>+1</span></span>)}
          </div>
        )}
      </GFld>
      {smode==="Rolled"&&<div style={{fontSize:"0.7rem",color:G.dim,marginBottom:"0.5rem"}}>{t("Total")}: <strong style={{color:G.gold}}>{Object.values(rstats).reduce((s,v)=>s+v,0)}</strong> — <span style={{color:"#4ade80"}}>{t("type your own dice rolls into the fields below, or use the digital roll button")}</span></div>}
      {smode==="Manual"&&(()=>{const spent=pointBuySpent(mstats);const left=PB_BUDGET-spent;return <div style={{fontSize:"0.72rem",marginBottom:"0.5rem",padding:"0.3rem 0.6rem",borderRadius:"0.5rem",background:"#1e293b",border:"1px solid "+(left<0?"#f87171":"#334155"),color:"#f1f5f9"}}>{t("Point Buy")}: <strong style={{color:G.gold}}>{spent}/{PB_BUDGET}</strong> — <span style={{color:left===0?"#4ade80":G.dim}}>{t("Points left")}: {left}</span> <span style={{color:G.dim}}>({t("scores 8–15")})</span></div>;})()}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.5rem"}}>
        {AB.map(a=>(<div key={a} style={{background:a===primaryAb?"#2d2400":G.card,borderRadius:"0.75rem",padding:"0.6rem",border:"1px solid "+(a===primaryAb?G.gold:G.border),textAlign:"center",position:"relative"}}>{a===primaryAb&&<div style={{position:"absolute",top:"-0.55rem",left:"50%",transform:"translateX(-50%)",background:G.gold,color:G.bg,fontSize:"0.5rem",fontWeight:800,padding:"0.05rem 0.35rem",borderRadius:"0.3rem",textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{t("Key ability")}</div>}<div style={{fontSize:"0.65rem",color:a===primaryAb?G.gold:G.dim,letterSpacing:"0.1em",fontWeight:a===primaryAb?800:400}}>{a}</div><input type="number" min={smode==="Manual"?8:3} max={smode==="Manual"?15:smode==="Rolled"?18:20} value={base[a]||8} disabled={smode==="Standard Array"} onFocus={e=>e.target.select()} onChange={e=>{let v=Number(e.target.value)||0;if(smode==="Rolled"){v=Math.max(3,Math.min(18,v));setRstats(prev=>({...prev,[a]:v}));}else{v=Math.max(8,Math.min(15,v));setMstats(prev=>{const next={...prev,[a]:v};if(pointBuySpent(next)>PB_BUDGET)return prev;return next;});}}} style={{...inp,textAlign:"center",padding:"0.3rem",marginTop:"0.25rem",fontSize:"1.1rem",fontWeight:700}}/><div style={{fontSize:"0.7rem",color:G.gold,marginTop:"0.2rem"}}>{fin[a]} ({sgn(mf(fin[a]))})</div><div title={abilDesc(a)} style={{fontSize:"0.55rem",color:G.dim,marginTop:"0.15rem",lineHeight:1.15}}>{abilTag(a)}</div></div>))}
      </div>
      <div style={{marginTop:"1rem",background:G.card,borderRadius:"0.75rem",padding:"0.75rem"}}>
        {(()=>{const overCount=selSk.filter(s=>!allSc.includes(s)).length+Math.max(0,selSk.filter(s=>allSc.includes(s)).length-maxSk);return <div style={{fontSize:"0.75rem",color:overCount>0?"#f97316":G.muted,marginBottom:"0.5rem"}}>{t("Skills")} ({t("choose")} {maxSk} {t("for")} {cn}){overCount>0?<span style={{fontWeight:700}}> · {overCount} {t("over the rules")} ⚠</span>:""}</div>;})()}
        {(()=>{const legalSet=new Set(selSk.filter(s=>allSc.includes(s)).slice(0,maxSk));return <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>{SKILL_LIST.map(({name:s})=>{const fromBg=bgo.sk.includes(s);if(fromBg)return <button key={s} disabled title={skillDesc(s)+" — "+t("from Background")+": "+bg} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px solid #3b82f6",cursor:"default",background:"#3b82f6",color:"#020817",fontWeight:700,opacity:0.9}}>◆ {s}</button>;const sel=selSk.includes(s);const inClass=allSc.includes(s);const extra=sel&&!legalSet.has(s);return <button key={s} title={extra?skillDesc(s)+" — "+t("over the rules"):(inClass?skillDesc(s):skillDesc(s)+" — "+t("not a class skill"))} onClick={()=>togSk(s)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px "+(sel||inClass?"solid":"dashed")+" "+(sel?(extra?"#f97316":G.gold):inClass?"#334155":"#475569"),cursor:"pointer",background:sel?(extra?"#f97316":G.gold):"transparent",color:sel?"#020817":inClass?"#f1f5f9":G.dim,fontWeight:sel?700:400}}>{extra?"⚠ ":""}{s}</button>;})}</div>;})()}
        <div style={{marginTop:"0.4rem",fontSize:"0.62rem",color:"#3b82f6"}}>◆ {t("from Background")}</div>
        <div style={{marginTop:"0.5rem",fontSize:"0.62rem",color:G.dim,lineHeight:1.4,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.15rem 0.75rem"}}>{SKILL_LIST.map(({name:s})=><div key={s}><b style={{color:G.muted}}>{s}:</b> {skillDesc(s)}</div>)}</div>
      </div>
      <div style={{marginTop:"1rem",background:G.card,borderRadius:"0.75rem",padding:"0.75rem"}}>
        <div style={{fontSize:"0.75rem",color:G.muted,marginBottom:"0.5rem"}}>{t("Languages")} — {t("From species")}: {(speciesData?.languages||["Common"]).join(", ")}</div>
        <div style={{fontSize:"0.65rem",color:G.dim,marginBottom:"0.3rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>{t("Standard Languages")}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem",marginBottom:"0.6rem"}}>{STANDARD_LANGUAGES.map(l=>{const fromSpecies=(speciesData?.languages||["Common"]).includes(l);const sel=fromSpecies||selLangs.includes(l);return <button key={l} disabled={fromSpecies} onClick={()=>togLang(l)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px solid "+(sel?G.gold:"#475569"),cursor:fromSpecies?"default":"pointer",background:sel?G.gold:"transparent",color:sel?"#020817":G.dim,fontWeight:sel?700:400,opacity:fromSpecies?0.85:1}}>{l}</button>;})}</div>
        <div style={{fontSize:"0.65rem",color:G.dim,marginBottom:"0.3rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>{t("Rare Languages")}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>{RARE_LANGUAGES.map(l=>{const sel=selLangs.includes(l);return <button key={l} onClick={()=>togLang(l)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px solid "+(sel?G.gold:"#475569"),cursor:"pointer",background:sel?G.gold:"transparent",color:sel?"#020817":G.dim,fontWeight:sel?700:400}}>{l}</button>;})}</div>
      </div>
      {(()=>{const maxExp=expertiseSlots(cn,level);if(maxExp<=0)return null;const over=selExpertise.length>maxExp;return (
        <div style={{marginTop:"1rem",background:G.card,borderRadius:"0.75rem",padding:"0.75rem"}}>
          <div style={{fontSize:"0.75rem",color:over?"#f97316":G.muted,marginBottom:"0.5rem"}}>{t("Expertise")} ({selExpertise.length} / {maxExp}) — {t("choose from proficient skills")}{over?<span style={{fontWeight:700}}> · {selExpertise.length-maxExp} {t("over the rules")} ⚠</span>:""}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>{SKILL_LIST.map(({name:s})=>{const sel=selExpertise.includes(s);const eligible=skProfs.includes(s);return <button key={s} disabled={!eligible} title={eligible?skillDesc(s):skillDesc(s)+" — "+t("not a class skill")} onClick={()=>togExpertise(s,maxExp)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px solid "+(sel?"#fcd34d":eligible?"#334155":"#1e293b"),cursor:eligible?"pointer":"not-allowed",background:sel?"#fcd34d":"transparent",color:sel?"#020817":eligible?"#f1f5f9":G.dimmer,fontWeight:sel?700:400,opacity:eligible?1:0.4}}>{sel?"★ ":""}{s}</button>;})}</div>
        </div>
      );})()}
      {cn==="Druid"&&level>=2&&(()=>{const lim=wildShapeLimit(level);const maxForms=wildShapeKnownForms(level);const over=selWildShapes.length>maxForms;return (
        <div style={{marginTop:"1rem",background:G.card,borderRadius:"0.75rem",padding:"0.75rem"}}>
          <div style={{fontSize:"0.75rem",color:over?"#f97316":G.muted,marginBottom:"0.35rem"}}>{t("Wild Shape Forms")} ({selWildShapes.length} / {maxForms}) — {t("choose up to")} {maxForms}</div>
          <div style={{fontSize:"0.68rem",color:G.dim,marginBottom:"0.5rem"}}>{t("Max CR")}: {lim.cr} · {lim.fly?t("Fly allowed"):t("No fly")} · {wildShapeUses(level)} {t("uses per short or long rest")}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>{Object.entries(WILDSHAPE_BEASTS).map(([name,b])=>{const sel=selWildShapes.includes(name);const legal=b.cr<=lim.cr&&(!b.fly||lim.fly);return <button key={name} disabled={!legal&&!sel} title={legal?`CR ${b.cr} · AC ${b.ac} · HP ${b.hp} · ${b.speed}`+(b.traits.length?" · "+b.traits.map(x=>x[0]).join(", "):""):t("No fly")+"/"+t("Max CR")+" "+lim.cr} onClick={()=>togWildShape(name,maxForms)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px solid "+(sel?G.gold:legal?"#334155":"#1e293b"),cursor:legal?"pointer":"not-allowed",background:sel?G.gold:"transparent",color:sel?"#020817":legal?"#f1f5f9":G.dimmer,fontWeight:sel?700:400,opacity:legal?1:0.4}}>{name} <span style={{fontSize:"0.62rem",opacity:0.75}}>(CR {b.cr})</span></button>;})}</div>
        </div>
      );})()}
      {cn==="Druid"&&sub==="Circle of the Land"&&level>=3&&(
        <div style={{marginTop:"1rem",background:G.card,borderRadius:"0.75rem",padding:"0.75rem"}}>
          <div style={{fontSize:"0.75rem",color:G.muted,marginBottom:"0.35rem"}}>{t("Circle of the Land — Land Type")} ({t("chosen anew each Long Rest")})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>{Object.keys(CIRCLE_LAND_SPELLS).map(land=>{const sel=landType===land;return <button key={land} onClick={()=>setLandType(land)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px solid "+(sel?G.gold:"#334155"),cursor:"pointer",background:sel?G.gold:"transparent",color:sel?"#020817":"#f1f5f9",fontWeight:sel?700:400}}>{land}</button>;})}</div>
          <div style={{fontSize:"0.68rem",color:G.dim,marginTop:"0.4rem"}}>{circleLandSpellsAtLevel(landType,level).join(", ")}</div>
        </div>
      )}
    </div>
  );

  const invLang=CURRENT_LANG==="da"?1:0;
  const invocationsBlock=isWarlock?(<div style={{marginBottom:"1rem",background:"#1a1035",border:"1px solid #4c1d95",borderRadius:"1rem",padding:"0.85rem 1rem"}}>
    <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.6rem"}}>
      <span style={{fontSize:"0.85rem",fontWeight:800,color:"#c4b5fd"}}>{t("Eldritch Invocations")}</span>
      <span style={{fontSize:"0.75rem",fontWeight:700,color:selInv.length>=invLimit?"#4ade80":"#c4b5fd",background:"#2e1065",border:"1px solid #6d28d9",borderRadius:"0.5rem",padding:"0.15rem 0.5rem"}}>{selInv.length} / {invLimit}</span>
      <span style={{fontSize:"0.68rem",color:G.dim}}>{t("Warlocks choose special magical abilities")}</span>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:"0.3rem",maxHeight:"46vh",overflowY:"auto",paddingRight:"0.25rem"}}>
      {Object.entries(ELDRITCH_INVOCATIONS).map(([name,info])=>{const sel=selInv.includes(name);const atMax=selInv.length>=invLimit;const blocked=!sel&&atMax;return(
        <div key={name} onClick={()=>!blocked&&togInv(name)} style={{display:"flex",alignItems:"flex-start",gap:"0.5rem",padding:"0.4rem 0.6rem",borderRadius:"0.6rem",cursor:blocked?"not-allowed":"pointer",opacity:blocked?0.4:1,background:sel?"#4c1d9544":"transparent",border:"1px solid "+(sel?"#a78bfa":"#332255")}}>
          <span style={{flexShrink:0,width:"1.1rem",height:"1.1rem",borderRadius:"0.3rem",border:"1px solid "+(sel?"#a78bfa":"#555"),background:sel?"#7c3aed":"transparent",color:"#fff",fontSize:"0.8rem",fontWeight:900,textAlign:"center",lineHeight:"1.05rem",marginTop:"1px"}}>{sel?"✓":""}</span>
          <div><div style={{fontSize:"0.8rem",fontWeight:700,color:sel?"#e9d5ff":"#e2e8f0"}}>{name}{info[2]?<span style={{fontSize:"0.6rem",color:"#a78bfa",marginLeft:"0.4rem",border:"1px solid #6d28d9",borderRadius:"0.3rem",padding:"0 0.3rem"}}>{info[2]}</span>:""}</div><div style={{fontSize:"0.72rem",color:G.muted,lineHeight:1.35}}>{info[invLang]}</div></div>
        </div>);})}
    </div>
    {hasTome&&<div style={{marginTop:"0.75rem",paddingTop:"0.75rem",borderTop:"1px solid #4c1d95"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.5rem"}}>
        <span style={{fontSize:"0.82rem",fontWeight:800,color:"#c4b5fd"}}>{t("Extra cantrips (Pact of the Tome)")}</span>
        <span style={{fontSize:"0.75rem",fontWeight:700,color:selTomeCantrips.length>=3?"#4ade80":"#c4b5fd",background:"#2e1065",border:"1px solid #6d28d9",borderRadius:"0.5rem",padding:"0.15rem 0.5rem"}}>{selTomeCantrips.length} / 3</span>
        <span style={{fontSize:"0.68rem",color:G.dim}}>{t("from any class")}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.3rem",maxHeight:"40vh",overflowY:"auto",paddingRight:"0.25rem"}}>{allCantrips.map(name=>{const sel=selTomeCantrips.includes(name);const blocked=!sel&&selTomeCantrips.length>=3;const d=spellD(name)||{};return(
        <div key={name} onClick={()=>!blocked&&togTomeCantrip(name)} style={{display:"flex",alignItems:"flex-start",gap:"0.5rem",padding:"0.35rem 0.6rem",borderRadius:"0.6rem",cursor:blocked?"not-allowed":"pointer",opacity:blocked?0.4:1,background:sel?"#4c1d9544":"transparent",border:"1px solid "+(sel?"#a78bfa":"#332255")}}>
          <span style={{flexShrink:0,width:"1.1rem",height:"1.1rem",borderRadius:"0.3rem",border:"1px solid "+(sel?"#a78bfa":"#555"),background:sel?"#7c3aed":"transparent",color:"#fff",fontSize:"0.8rem",fontWeight:900,textAlign:"center",lineHeight:"1.05rem",marginTop:"1px"}}>{sel?"✓":""}</span>
          <div><div style={{fontSize:"0.8rem",fontWeight:700,color:sel?"#e9d5ff":"#e2e8f0"}}>{name}</div><div style={{fontSize:"0.72rem",color:G.muted,lineHeight:1.35}}>{d.desc}</div></div>
        </div>);})}</div>
    </div>}
    {hasTome&&<div style={{marginTop:"0.75rem",paddingTop:"0.75rem",borderTop:"1px solid #4c1d95"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.5rem"}}>
        <span style={{fontSize:"0.82rem",fontWeight:800,color:"#c4b5fd"}}>{t("Ritual spells (Pact of the Tome)")}</span>
        <span style={{fontSize:"0.75rem",fontWeight:700,color:selRituals.length>=2?"#4ade80":"#c4b5fd",background:"#2e1065",border:"1px solid #6d28d9",borderRadius:"0.5rem",padding:"0.15rem 0.5rem"}}>{selRituals.length} / 2</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.3rem"}}>{RITUAL_L1.map(name=>{const sel=selRituals.includes(name);const blocked=!sel&&selRituals.length>=2;const d=spellD(name)||{};return(
        <div key={name} onClick={()=>!blocked&&togRitual(name)} style={{display:"flex",alignItems:"flex-start",gap:"0.5rem",padding:"0.35rem 0.6rem",borderRadius:"0.6rem",cursor:blocked?"not-allowed":"pointer",opacity:blocked?0.4:1,background:sel?"#4c1d9544":"transparent",border:"1px solid "+(sel?"#a78bfa":"#332255")}}>
          <span style={{flexShrink:0,width:"1.1rem",height:"1.1rem",borderRadius:"0.3rem",border:"1px solid "+(sel?"#a78bfa":"#555"),background:sel?"#7c3aed":"transparent",color:"#fff",fontSize:"0.8rem",fontWeight:900,textAlign:"center",lineHeight:"1.05rem",marginTop:"1px"}}>{sel?"✓":""}</span>
          <div><div style={{fontSize:"0.8rem",fontWeight:700,color:sel?"#e9d5ff":"#e2e8f0"}}>{name}</div><div style={{fontSize:"0.72rem",color:G.muted,lineHeight:1.35}}>{d.desc}</div></div>
        </div>);})}</div>
    </div>}
  </div>):null;
  const spellsPanel=isCaster?(<div>
    {invocationsBlock}
    <div style={{display:"flex",gap:"0.5rem",alignItems:"center",marginBottom:"0.75rem",flexWrap:"wrap"}}>
      <div style={{display:"flex",gap:"0.5rem"}}>{[[sab||"—","Ability"],[sgn(smod+pb),"Spell Atk"],[String(8+smod+pb),"Save DC"]].map(([v,l])=>(<div key={l} style={{background:G.gold,color:G.bg,borderRadius:"0.75rem",padding:"0.4rem 0.7rem",textAlign:"center",minWidth:"70px"}}><div style={{fontSize:"0.6rem",textTransform:"uppercase",opacity:0.6}}>{l}</div><div style={{fontSize:"1.2rem",fontWeight:900,lineHeight:1}}>{v}</div></div>))}</div>
      <span style={{marginLeft:"auto",fontSize:"0.65rem",color:"#4ade80",fontWeight:700,border:"1px solid #4ade80",borderRadius:"0.4rem",padding:"0.15rem 0.5rem"}}>{RULES_VERSION} Rules</span>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.4rem"}}>
      <div style={{fontSize:"0.72rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>{ct==="warlock"?"Pact Magic Slots":"Spell Slots"}</div>
      <button onClick={()=>setUsedSlots({})} style={{fontSize:"0.62rem",color:G.dim,background:"none",border:"1px solid #334155",borderRadius:"0.4rem",padding:"0.1rem 0.4rem",cursor:"pointer"}}>Reset</button>
      {ct==="warlock"&&<span style={{fontSize:"0.62rem",color:"#a78bfa",border:"1px solid #a78bfa",borderRadius:"0.4rem",padding:"0.1rem 0.4rem"}}>Pact Magic — recharge on Short or Long Rest</span>}
      {mc&&(ct==="warlock"||ct2==="warlock")&&(ct2!==ct)&&<div style={{fontSize:"0.68rem",color:"#f87171",padding:"0.3rem 0.6rem",background:"#2d0000",borderRadius:"0.5rem",border:"1px solid #f87171",marginTop:"0.25rem",width:"100%"}}>⚠ Warlock Pact Magic slots are tracked separately from Spellcasting slots. This builder shows them together as an approximation.</div>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.max(1,slots.filter(s=>s>0).length)},1fr)`,gap:"0.3rem",marginBottom:"0.75rem"}}>
      {slots.map((s,idx)=>({s,i:idx+1})).filter(({s})=>s>0).map(({i})=>{
        const total=slots[i-1]||0;const used=usedSlots[i]||0;
        return(<div key={i} style={{textAlign:"center"}}><div style={{fontSize:"0.58rem",color:G.dim,marginBottom:"0.25rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>{["1st","2nd","3rd","4th","5th","6th","7th","8th","9th"][i-1]}</div><div style={{display:"flex",flexDirection:"column",gap:"0.2rem",alignItems:"center"}}>{Array.from({length:total}).map((_,j)=>{const isAvailable=j<(total-used);return <button key={j} onClick={()=>{setUsedSlots(prev=>{const cur=prev[i]||0;return{...prev,[i]:isAvailable?Math.min(total,cur+1):Math.max(0,cur-1)};});}} style={{width:14,height:14,borderRadius:"50%",border:"1.5px solid "+(isAvailable?G.gold:"#475569"),background:isAvailable?G.gold+"66":"transparent",cursor:"pointer",padding:0}}/>;})}</div><div style={{fontSize:"0.65rem",fontWeight:700,color:used>0?"#f87171":G.gold,marginTop:"0.25rem"}}>{total-used}/{total}</div></div>);
      })}
    </div>
    <div style={{display:"flex",gap:"0.5rem",alignItems:"center",marginBottom:"0.5rem",flexWrap:"wrap"}}>
      {/* START PATCH B — spell budget counter */}
      {knownStr&&(()=>{
        const spellLimit=Number.parseInt(knownStr,10)||0;
        const spellMode=knownStr.includes("prepared")?"Prepared":"Known";
        const selectedLeveledSpellCount=Object.entries(selSp).filter(([lv])=>Number(lv)>0).flatMap(([,names])=>names||[]).length;
        const remainingSpells=Math.max(0,spellLimit-selectedLeveledSpellCount);
        const atLimit=spellLimit>0&&selectedLeveledSpellCount>=spellLimit;
        return(<>
          <div style={{fontSize:"0.75rem",color:"#f1f5f9",background:"#1e293b",borderRadius:"0.6rem",padding:"0.25rem 0.65rem",border:"1px solid "+(atLimit?"#f87171":"#334155")}}>
            <span style={{color:G.dim}}>{spellMode}: </span>
            <strong style={{color:atLimit?"#f87171":G.gold}}>{selectedLeveledSpellCount} / {spellLimit}</strong>
          </div>
          <div style={{fontSize:"0.75rem",color:"#f1f5f9",background:"#1e293b",borderRadius:"0.6rem",padding:"0.25rem 0.65rem",border:"1px solid "+(atLimit?"#f87171":"#334155")}}>
            <span style={{color:G.dim}}>Remaining: </span>
            <strong style={{color:atLimit?"#f87171":"#4ade80"}}>{remainingSpells}</strong>
          </div>
        </>);
      })()}
      {/* END PATCH B */}
      {cantripLimit>0&&(()=>{const c=(selSp[0]||[]).length;const atMax=c>=cantripLimit;return <div style={{fontSize:"0.75rem",color:"#f1f5f9",background:"#1e293b",borderRadius:"0.6rem",padding:"0.25rem 0.65rem",border:"1px solid "+(atMax?"#4ade80":"#334155")}}><span style={{color:G.dim}}>{t("Cantrips")}: </span><strong style={{color:atMax?"#4ade80":G.gold}}>{c} / {cantripLimit}</strong></div>;})()}
      <div style={{fontSize:"0.75rem",color:"#f1f5f9",background:"#1e293b",borderRadius:"0.6rem",padding:"0.25rem 0.65rem",border:"1px solid #334155"}}><span style={{color:G.dim}}>{t("Max level")}: </span><strong style={{color:G.gold}}>{maxSL||"—"}</strong></div>
      {isMcCaster&&<div style={{fontSize:"0.72rem",color:"#60a5fa",background:"#1e293b",borderRadius:"0.6rem",padding:"0.25rem 0.65rem",border:"1px solid #60a5fa"}}>Multiclass slots</div>}
      <div style={{fontSize:"0.72rem",color:G.dim,background:"#1e293b",borderRadius:"0.6rem",padding:"0.25rem 0.65rem",border:"1px solid #334155"}}>Cantrips scale at <span style={{color:level>=5?G.gold:G.dimmer,fontWeight:level>=5?700:400}}>Lvl 5</span>, <span style={{color:level>=11?G.gold:G.dimmer,fontWeight:level>=11?700:400}}>11</span>, <span style={{color:level>=17?G.gold:G.dimmer,fontWeight:level>=17?700:400}}>17</span></div>
    </div>
    <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap",marginBottom:"0.6rem"}}>{[0,1,2,3,4,5,6,7,8,9].filter(lv=>lv===0||lv<=maxSL).map(lv=>{const has=avSp[lv]&&avSp[lv].size>0;const cnt=(selSp[lv]||[]).length;if(!has&&lv>0)return null;const active=spTab===lv;return <button key={lv} onClick={()=>setSpTab(lv)} style={tabSt(active)}>{lv===0?"Cantrips":"Lvl "+lv}{cnt>0?" ("+cnt+")":""}</button>;})}</div>
    {/* START PATCH C — dim unavailable leveled spells at budget limit */}
    {(()=>{const spellLimit=Number.parseInt(knownStr,10)||0;const flatLeveled=[1,2,3,4,5,6,7,8,9].flatMap(l=>(selSp[l]||[]));const extraLeveled=new Set(spellLimit>0?flatLeveled.slice(spellLimit):[]);const extraCantrips=new Set(cantripLimit>0?(selSp[0]||[]).slice(cantripLimit):[]);
    return <div style={{display:"flex",flexDirection:"column",gap:"0.4rem",maxHeight:"60vh",overflowY:"auto",paddingRight:"0.5rem",marginTop:"0.5rem"}}>{[...(avSp[spTab]||[])].map(name=>{
      const sel=(selSp[spTab]||[]).includes(name);
      const prep=spPrep[name]!==false;
      const isExtra=sel&&(spTab===0?extraCantrips.has(name):extraLeveled.has(name));
      return <div key={name} style={{borderRadius:"0.7rem",...(isExtra?{outline:"2px solid #f97316",outlineOffset:"-1px"}:{})}}><SBtn name={name} sel={sel} prep={prep} onToggle={()=>togSp(name,spTab)} onPrep={()=>togPrep(name)}/>{isExtra&&<div style={{fontSize:"0.6rem",color:"#f97316",fontWeight:700,padding:"0.05rem 0.4rem"}}>⚠ {t("over the rules")}</div>}</div>;
    })}</div>;})()}
    {/* END PATCH C */}
    {Object.values(selSp).flat().length>0&&<div style={{marginTop:"0.5rem",fontSize:"0.72rem",color:G.muted}}>Selected: {Object.values(selSp).flat().join(", ")}</div>}
  </div>):<div style={{fontSize:"0.85rem",color:G.muted,fontStyle:"italic"}}>This class is not a spellcaster.</div>;

  const notesPanel=(<div>
    <GFld label="Personality Traits"><textarea rows={2} value={traits} onChange={e=>setTraits(e.target.value)} placeholder="How does your character act?" style={{...inp,resize:"vertical"}}/></GFld>
    <GFld label="Ideals"><input value={ideals} onChange={e=>setIdeals(e.target.value)} placeholder="What does your character believe?" style={inp}/></GFld>
    <GFld label="Bonds"><input value={bonds} onChange={e=>setBonds(e.target.value)} placeholder="What ties your character to the world?" style={inp}/></GFld>
    <GFld label="Flaws"><input value={flaws} onChange={e=>setFlaws(e.target.value)} placeholder="What are your character weaknesses?" style={inp}/></GFld>
    <GFld label={t("Subclass features, magic items, other notes...")}><textarea value={anotes} onChange={e=>setAnotes(e.target.value)} style={{...inp,minHeight:"80px",resize:"vertical"}}/></GFld>
    <GFld label={t("Inventory (one item per line)")}><textarea value={inventory} onChange={e=>setInventory(e.target.value)} placeholder={t("Backpack, rope, torches...")} style={{...inp,minHeight:"120px",resize:"vertical",fontFamily:"inherit"}}/></GFld>
    <GFld label={t("Backstory")}><textarea value={backstory} onChange={e=>setBackstory(e.target.value)} placeholder={t("Where did your character come from? What happened before the adventure began?")} style={{...inp,minHeight:"100px",resize:"vertical"}}/></GFld>
  </div>);

  const panelContent={overview:buildOverview(),spells:spellsPanel,equipment:<EquipmentPanel cn={cn} level={level} dm={dm} sm={sm} pb={pb} equipped={equipped} equipItem={equipItem} gp={gp} setGp={setGp} ac={ac} masteredWeapons={masteredWeapons} setMasteredWeapons={setMasteredWeapons}/>,notes:notesPanel};
  const panelMeta={overview:{title:t("Combat Overview"),icon:<Shield size={15}/>},spells:{title:t("Spells"),icon:<Zap size={15}/>},equipment:{title:t("Equipment & Weapons"),icon:<Package size={15}/>},notes:{title:t("Personality & Notes"),icon:<BookOpen size={15}/>}};

  return(<div style={{minHeight:"100vh",background:G.bg,color:"#f1f5f9",padding:"1.5rem",fontFamily:"system-ui,sans-serif",userSelect:"none"}}>
    <style>{`button:active{opacity:1!important}button:focus{outline:none}*{-webkit-tap-highlight-color:transparent}input,textarea,select{user-select:text!important;-webkit-user-select:text!important}`}</style>
    <div style={{maxWidth:"900px",margin:"0 auto"}}>
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"flex-end",justifyContent:"space-between",gap:"1rem",marginBottom:"1.5rem"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",color:G.gold,marginBottom:"0.5rem"}}><Dice5 size={22}/><span style={{fontSize:"0.7rem",letterSpacing:"0.15em",textTransform:"uppercase"}}>{t("D&D 2024-inspired quick builder")}</span></div>
          <h1 style={{fontSize:"clamp(1.6rem,4vw,2.5rem)",fontWeight:900,margin:0,lineHeight:1.1}}>CharacterGeneratorRPG</h1>
          <div style={{fontSize:"0.8rem",color:G.dim,marginTop:"0.3rem"}}>{t("Generate and customize your RPG character with stats, spells and gear — in seconds.")} {t("Made by")} <a href="https://asaheim.dk" target="_blank" rel="noopener noreferrer" style={{color:G.gold,textDecoration:"underline"}}>asaheim.dk</a></div>
        </div>
        <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",alignItems:"flex-start"}}>
          <div style={{display:"flex",border:"1px solid "+G.border,borderRadius:"0.6rem",overflow:"hidden"}}>
            {[["da","DA"],["en","EN"]].map(([code,label])=><button key={code} onClick={()=>switchLang(code)} style={{padding:"0.4rem 0.6rem",fontSize:"0.75rem",fontWeight:800,border:"none",cursor:"pointer",background:lang===code?G.gold:"transparent",color:lang===code?G.bg:G.muted}}>{label}</button>)}
          </div>
          <GBtn onClick={rand} gold><RotateCcw size={15}/> {t("Randomize")}</GBtn>
          <GBtn onClick={genSheet} amber><Printer size={15}/> {t("Generate Sheet")}</GBtn>
          <GBtn onClick={exportCharacter}><span>💾</span> {t("Save")}</GBtn>
          <GBtn onClick={()=>fileInputRef.current.click()}><span>📂</span> {t("Load")}</GBtn>
          <input ref={fileInputRef} type="file" accept=".json" style={{display:"none"}} onChange={importCharacter}/>
          <GBtn onClick={levelUpCharacter} gold><ChevronUp size={15}/> {t("Level Up")}</GBtn>
        </div>
      </div>

      <div style={{background:"rgba(15,23,42,0.9)",border:"1px solid "+G.border,borderRadius:"1rem",padding:"0.75rem 1.25rem",marginBottom:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem",alignItems:"center"}}>
          <span style={{fontSize:"0.85rem",fontWeight:700,color:"#f1f5f9"}}>{dispName}</span>
          <span style={{fontSize:"0.8rem",color:G.muted}}>{clsLvl} - {bg} - {sp}</span>
          <div style={{marginLeft:"auto",display:"flex",gap:"0.4rem",flexWrap:"wrap",flexShrink:0}}>
            {[["AC",ac],["HP",hp],["Init",sgn(init)],["Speed",speed+"ft"],["PP",passPerc]].map(([l,v])=>(<div key={l} style={{background:G.gold,color:G.bg,borderRadius:"0.6rem",padding:"0.3rem 0.6rem",textAlign:"center",minWidth:"46px"}}><div style={{fontSize:"0.55rem",textTransform:"uppercase",opacity:0.6}}>{l}</div><div style={{fontSize:"1rem",fontWeight:900,lineHeight:1}}>{v}</div></div>))}
          </div>
        </div>
        <div style={{display:"flex",gap:"0.75rem",alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
            {/* START PATCH SPLIT-LOCK — separate class lock and species lock in topbar */}
            <button onClick={toggleClassLock} title={classLocked?t("Class locked"):t("Lock class")} style={{background:"none",border:"none",cursor:"pointer",color:classLocked?G.gold:G.dim,padding:"0 2px",display:"flex",alignItems:"center"}}>{classLocked?<Lock size={14}/>:<Unlock size={14}/>}</button>
            <select value={cn} onChange={e=>{changeClass(e.target.value);classLockedRef.current=true;setClassLocked(true);}} style={{...inp,width:"auto",padding:"0.35rem 0.65rem",fontSize:"0.85rem",fontWeight:700,opacity:classLocked?0.45:1,borderRadius:"0.65rem"}}>{Object.keys(CLASSES).map(c=><option key={c}>{c}</option>)}</select>
            <button onClick={toggleSpeciesLock} title={speciesLocked?t("Species locked"):t("Lock species")} style={{background:"none",border:"none",cursor:"pointer",color:speciesLocked?G.gold:G.dim,padding:"0 2px",display:"flex",alignItems:"center",marginLeft:"0.2rem"}}>{speciesLocked?<Lock size={14}/>:<Unlock size={14}/>}</button>
            <select value={sp} onChange={e=>{setSp(e.target.value);speciesLockedRef.current=true;setSpeciesLocked(true);}} style={{...inp,width:"auto",padding:"0.35rem 0.65rem",fontSize:"0.85rem",fontWeight:700,opacity:speciesLocked?0.45:1,borderRadius:"0.65rem"}}>{Object.keys(SPECIES).map(s=><option key={s}>{s}</option>)}</select>
            {/* END PATCH SPLIT-LOCK */}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flex:1,minWidth:"180px"}}>
            <button onClick={toggleLevelLock} style={{background:"none",border:"none",cursor:"pointer",color:levelLocked?G.gold:G.dim,padding:"0 2px",flexShrink:0,display:"flex",alignItems:"center"}}>{levelLocked?<Lock size={14}/>:<Unlock size={14}/>}</button>
            <span style={{fontSize:"0.75rem",color:G.muted,flexShrink:0}}>{t("Lvl")}</span>
            <input type="range" min="1" max="20" value={level} onChange={e=>{setLevel(Number(e.target.value));levelLockedRef.current=true;setLevelLocked(true);}} style={{flex:1,accentColor:G.gold}}/>
            <div style={{background:G.gold,color:G.bg,borderRadius:"0.5rem",padding:"0.2rem 0.5rem",textAlign:"center",flexShrink:0}}><div style={{fontSize:"0.5rem",textTransform:"uppercase",opacity:0.6,letterSpacing:"0.08em"}}>{t("LVL")}</div><div style={{fontSize:"1rem",fontWeight:900,lineHeight:1}}>{level}</div></div>
          </div>
        </div>
      </div>

      <div style={{marginBottom:"1rem"}}>
        <PanelGroup title={t("Character Creator")} icon={<Shield size={16}/>} collapsed={groupCollapsed.creator} onToggle={()=>setGroupCollapsed(g=>({...g,creator:!g.creator}))}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
            <div style={{background:"rgba(15,23,42,0.8)",border:"1px solid "+G.border,borderRadius:"1rem",padding:"1rem"}}><div style={{fontSize:"0.75rem",fontWeight:700,color:G.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.75rem"}}>{t("Identity")}</div>{identityPanel}</div>
            <div style={{background:"rgba(15,23,42,0.8)",border:"1px solid "+G.border,borderRadius:"1rem",padding:"1rem"}}>
              <div style={{fontSize:"0.75rem",fontWeight:700,color:G.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.75rem"}}>{t("Ability Scores & Skills")}</div>
              {statsPanel}
              <div style={{marginTop:"1rem",borderTop:"1px solid "+G.border,paddingTop:"1rem"}}>
                <div style={{fontSize:"0.75rem",fontWeight:700,color:G.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.75rem"}}>{t("Feats")}</div>
                {buildFeatsPanel()}
              </div>
            </div>
          </div>
          <div style={{marginTop:"0.75rem"}}>
            <CPanel title={panelMeta.spells.title} icon={panelMeta.spells.icon} collapsed={!!collapsed.spells} onToggle={()=>togCollapsed("spells")}>{panelContent.spells}</CPanel>
          </div>
        </PanelGroup>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        {panelOrder.map(pid=>(<CPanel key={pid} title={panelMeta[pid].title} icon={panelMeta[pid].icon} collapsed={!!collapsed[pid]} onToggle={()=>togCollapsed(pid)} dragging={draggingPanel===pid} onDragStart={()=>onDragStart(pid)} onDrop={()=>onDrop(pid)}>{panelContent[pid]}</CPanel>))}
      </div>
    </div>
  </div>);
}
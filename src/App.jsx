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
  "green = proficient, red = not proficient":"grøn = proficient, rød = ikke proficient","Languages":"Sprog","Choose":"Vælg","over the rules":"ud over reglerne","for":"for","not a class skill":"ikke en klasse-skill","Inventory":"Inventar","Inventory (one item per line)":"Inventar (én genstand pr. linje)","Backpack, rope, torches...":"Rygsæk, reb, fakler...","Add language":"Tilføj sprog","Standard Languages":"Standardsprog","Rare Languages":"Sjældne sprog","From species":"Fra art","Expertise":"Ekspertise","choose from proficient skills":"vælg blandt dine proficient færdigheder","from Background":"fra baggrund","Choose a class":"Vælg en klasse","or":"eller","1st-level spell":"1.-niveau spell",
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
  "2 pages":"2 sider","1 page":"1 side","Features & Spells":"Evner, træk & magi","Descriptions on page 2":"Beskrivelser på side 2",
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
function spellD(name){const d=SD[name];if(!d)return d;if(CURRENT_LANG!=="da")return d;return{...d,sc:trSchool(d.sc),cast:trCast(d.cast),range:trRange(d.range),dur:trDur(d.dur),desc:SDD[name]||d.desc};}

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

const SD={
  "Mind Sliver":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"1 round",desc:"INT save or 1d6 psychic and -1d4 on its next save."},
  "Sorcerous Burst":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Instant",desc:"1d8 of a chosen damage type; can leap on a max roll."},
  "Starry Wisp":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",desc:"DEX save or 1d8 radiant; target glows, can't be invisible."},
  "Elementalism":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Instant",desc:"Minor fire, water, earth or air effect."},
  "Resistance":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"1 minute",desc:"Once, add 1d4 to one saving throw."},
  "Spare the Dying":{sc:"Necromancy",cast:"1 action",range:"15 ft",dur:"Instant",desc:"Stabilize a creature at 0 HP."},
  "Word of Radiance":{sc:"Evocation",cast:"1 action",range:"5 ft",dur:"Instant",desc:"CON save or 1d6 radiant to nearby enemies."},
  "Fire Bolt":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Instant",desc:"Ranged spell attack: 1d10 fire."},
  "Ray of Frost":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",desc:"Hit: 1d8 cold, target speed -10 ft."},
  "Shocking Grasp":{sc:"Evocation",cast:"1 action",range:"Touch",dur:"Instant",desc:"Advantage vs metal armor. Hit: 1d8 lightning, no reactions."},
  "Mage Hand":{sc:"Conjuration",cast:"1 action",range:"30 ft",dur:"1 minute",desc:"Spectral hand, up to 10 lb."},
  "Minor Illusion":{sc:"Illusion",cast:"1 action",range:"30 ft",dur:"1 minute",desc:"Sound or image. INT check to disbelieve."},
  "Prestidigitation":{sc:"Transmutation",cast:"1 action",range:"10 ft",dur:"Up to 1 hr",desc:"Minor magical tricks."},
  "Magic Missile":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Instant",desc:"3 darts, 1d4+1 force each, auto-hit."},
  "Shield":{sc:"Abjuration",cast:"1 reaction",range:"Self",dur:"1 round",desc:"+5 AC. Immune to Magic Missile."},
  "Mage Armor":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"8 hours",desc:"AC = 13+DEX for unarmored creature."},
  "Burning Hands":{sc:"Evocation",cast:"1 action",range:"15-ft cone",dur:"Instant",desc:"DEX save or 3d6 fire."},
  "Charm Person":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"1 hour",desc:"WIS save or charmed."},
  "Sleep":{sc:"Enchantment",cast:"1 action",range:"90 ft",dur:"1 minute",desc:"5d8 HP worth of creatures fall asleep."},
  "Thunderwave":{sc:"Evocation",cast:"1 action",range:"Self (15-ft cube)",dur:"Instant",desc:"CON save or 2d8 thunder + pushed 10 ft."},
  "Misty Step":{sc:"Conjuration",cast:"1 bonus action",range:"Self",dur:"Instant",desc:"Teleport up to 30 ft."},
  "Hold Person":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"WIS save or humanoid paralyzed."},
  "Invisibility":{sc:"Illusion",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",desc:"Target invisible until it attacks or casts."},
  "Mirror Image":{sc:"Illusion",cast:"1 action",range:"Self",dur:"1 minute",desc:"3 duplicates absorb attacks."},
  "Scorching Ray":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Instant",desc:"3 rays, 2d6 fire each."},
  "Shatter":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",desc:"CON save or 3d8 thunder."},
  "Suggestion":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 8 hr",desc:"WIS save or follow a suggestion."},
  "Counterspell":{sc:"Abjuration",cast:"1 reaction",range:"60 ft",dur:"Instant",desc:"Interrupt a spell being cast."},
  "Fireball":{sc:"Evocation",cast:"1 action",range:"150 ft",dur:"Instant",desc:"20-ft radius. DEX save or 8d6 fire."},
  "Fly":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Conc. 10 min",desc:"Flying speed 60 ft."},
  "Haste":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",desc:"Double speed, +2 AC, extra action."},
  "Lightning Bolt":{sc:"Evocation",cast:"1 action",range:"Self (100-ft line)",dur:"Instant",desc:"DEX save or 8d6 lightning."},
  "Slow":{sc:"Transmutation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",desc:"WIS save or halved speed, -2 AC/DEX."},
  "Fear":{sc:"Illusion",cast:"1 action",range:"Self (30-ft cone)",dur:"Conc. 1 min",desc:"WIS save or frightened and flee."},
  "Banishment":{sc:"Abjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"CHA save or banished."},
  "Greater Invisibility":{sc:"Illusion",cast:"1 action",range:"Touch",dur:"Conc. 1 min",desc:"Invisible even while attacking."},
  "Ice Storm":{sc:"Evocation",cast:"1 action",range:"300 ft",dur:"Instant",desc:"20-ft radius, 2d8 bludgeoning+4d6 cold."},
  "Polymorph":{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Conc. 1 hr",desc:"WIS save or transform into beast."},
  "Confusion":{sc:"Enchantment",cast:"1 action",range:"90 ft",dur:"Conc. 1 min",desc:"WIS save or act randomly."},
  "Cone of Cold":{sc:"Evocation",cast:"1 action",range:"Self (60-ft cone)",dur:"Instant",desc:"CON save or 8d8 cold."},
  "Hold Monster":{sc:"Enchantment",cast:"1 action",range:"90 ft",dur:"Conc. 1 min",desc:"WIS save or any creature paralyzed."},
  "Cloudkill":{sc:"Conjuration",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",desc:"20-ft sphere toxic fog, 5d8 poison per turn."},
  "Dominate Person":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"WIS save or control a humanoid."},
  "Sacred Flame":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",desc:"DEX save or 1d8 radiant. Scales at 5/11/17."},
  "Guidance":{sc:"Divination",cast:"1 action",range:"Touch",dur:"1 minute",desc:"No concentration. +1d4 to one ability check."},
  "Light":{sc:"Evocation",cast:"1 action",range:"Touch",dur:"1 hour",desc:"Object sheds bright light 20 ft."},
  "Thaumaturgy":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Up to 1 min",desc:"Minor wonder effect."},
  "Toll the Dead":{sc:"Necromancy",cast:"1 action",range:"60 ft",dur:"Instant",desc:"WIS save or 1d8 (1d12 if wounded) necrotic."},
  "Bless":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",desc:"3 creatures add 1d4 to attacks/saves."},
  "Command":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"1 round",desc:"WIS save or one-word command."},
  "Cure Wounds":{sc:"Evocation",cast:"1 action",range:"Touch",dur:"Instant",desc:"Restore 2d8+mod HP."},
  "Guiding Bolt":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"1 round",desc:"4d6 radiant, next attack has advantage."},
  "Healing Word":{sc:"Evocation",cast:"1 bonus action",range:"60 ft",dur:"Instant",desc:"Restore 2d4+mod HP."},
  "Inflict Wounds":{sc:"Necromancy",cast:"1 action",range:"Touch",dur:"Instant",desc:"Melee spell attack: 3d10 necrotic."},
  "Shield of Faith":{sc:"Abjuration",cast:"1 bonus action",range:"60 ft",dur:"Conc. 10 min",desc:"+2 AC."},
  "Aid":{sc:"Abjuration",cast:"1 action",range:"30 ft",dur:"8 hours",desc:"3 creatures gain +5 max HP."},
  "Lesser Restoration":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Instant",desc:"End one condition or disease."},
  "Prayer of Healing":{sc:"Evocation",cast:"10 minutes",range:"30 ft",dur:"Instant",desc:"6 creatures regain 2d8+mod HP."},
  "Spiritual Weapon":{sc:"Evocation",cast:"1 bonus action",range:"60 ft",dur:"1 minute",desc:"Spectral weapon: 1d8+mod force per turn."},
  "Animate Dead":{sc:"Necromancy",cast:"1 minute",range:"10 ft",dur:"24 hours",desc:"Create undead servant."},
  "Daylight":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"1 hour",desc:"60-ft radius bright light."},
  "Dispel Magic":{sc:"Abjuration",cast:"1 action",range:"120 ft",dur:"Instant",desc:"End one spell 3rd level or lower."},
  "Spirit Guardians":{sc:"Conjuration",cast:"1 action",range:"Self (15-ft radius)",dur:"Conc. 10 min",desc:"WIS save or 3d8 radiant/necrotic."},
  "Remove Curse":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Instant",desc:"End all curses on target."},
  "Death Ward":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"8 hours",desc:"Drop to 1 HP instead of 0 once."},
  "Freedom of Movement":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"1 hour",desc:"Ignore difficult terrain and restraints."},
  "Guardian of Faith":{sc:"Conjuration",cast:"1 action",range:"30 ft",dur:"8 hours",desc:"20 radiant to hostiles within 10 ft."},
  "Flame Strike":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",desc:"DEX save or 4d6 fire+4d6 radiant."},
  "Greater Restoration":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Instant",desc:"End major condition or curse."},
  "Mass Cure Wounds":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",desc:"6 creatures regain 3d8+mod HP."},
  "Raise Dead":{sc:"Necromancy",cast:"1 hour",range:"Touch",dur:"Instant",desc:"Return dead creature to life (500gp diamond)."},
  "Druidcraft":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Instant",desc:"Minor nature effect."},
  "Produce Flame":{sc:"Conjuration",cast:"1 action",range:"Self",dur:"10 minutes",desc:"Flame: light or hurl for 1d8 fire."},
  "Shillelagh":{sc:"Transmutation",cast:"1 bonus action",range:"Touch",dur:"1 minute",desc:"No concentration. Weapon uses WIS, damage 1d8+WIS."},
  "Thorn Whip":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Instant",desc:"1d6 piercing, pull 10 ft."},
  "Animal Friendship":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"24 hours",desc:"WIS save or beast charmed."},
  "Entangle":{sc:"Conjuration",cast:"1 action",range:"90 ft",dur:"Conc. 1 min",desc:"STR save or restrained by weeds."},
  "Faerie Fire":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"DEX save or outlined; attacks have advantage."},
  "Goodberry":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"24 hours",desc:"10 berries, each restores 1 HP."},
  "Barkskin":{sc:"Transmutation",cast:"1 bonus action",range:"Touch",dur:"1 hour",desc:"No concentration. AC 17."},
  "Flaming Sphere":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"2d6 fire sphere, bonus action move."},
  "Moonbeam":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",desc:"CON save or 2d10 radiant per turn."},
  "Pass without Trace":{sc:"Abjuration",cast:"1 action",range:"Self",dur:"Conc. 1 hr",desc:"+10 Stealth to you and 10 companions."},
  "Spike Growth":{sc:"Transmutation",cast:"1 action",range:"150 ft",dur:"Conc. 10 min",desc:"2d4 piercing per 5 ft moved."},
  "Call Lightning":{sc:"Conjuration",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",desc:"DEX save or 3d10 lightning per turn."},
  "Conjure Animals":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 hr",desc:"Summon beasts totaling CR 2."},
  "Plant Growth":{sc:"Transmutation",cast:"1 action",range:"150 ft",dur:"Instant",desc:"100-ft radius difficult terrain."},
  "Blight":{sc:"Necromancy",cast:"1 action",range:"30 ft",dur:"Instant",desc:"CON save or 8d8 necrotic."},
  "Insect Plague":{sc:"Conjuration",cast:"1 action",range:"300 ft",dur:"Conc. 10 min",desc:"CON save or 4d10 piercing per turn."},
  "Vicious Mockery":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Instant",desc:"WIS save or 1d6 psychic (scales 2d6/3d6/4d6), disadv on next attack."},
  "Dancing Lights":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",desc:"4 floating lights."},
  "Eldritch Blast":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Instant",desc:"1d10 force beam. Hit creature can be pushed 10 ft. More beams at higher levels."},
  "Chill Touch":{sc:"Necromancy",cast:"1 action",range:"120 ft",dur:"1 round",desc:"1d8 necrotic, target cannot regain HP."},
  "Armor of Agathys":{sc:"Abjuration",cast:"1 action",range:"Self",dur:"1 hour",desc:"5 temp HP; attacker takes 5 cold."},
  "Arms of Hadar":{sc:"Conjuration",cast:"1 action",range:"Self (10-ft radius)",dur:"Instant",desc:"STR save or 2d6 necrotic, no reactions."},
  "Hex":{sc:"Enchantment",cast:"1 bonus action",range:"90 ft",dur:"Conc. 1 hr",desc:"+1d6 necrotic on weapon and spell attacks."},
  "Hellish Rebuke":{sc:"Evocation",cast:"1 reaction",range:"60 ft",dur:"Instant",desc:"DEX save or 2d10 fire."},
  "Witch Bolt":{sc:"Evocation",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",desc:"1d12 lightning, sustain for 1d12 per turn."},
  "Darkness":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Conc. 10 min",desc:"15-ft magical darkness."},
  "Vampiric Touch":{sc:"Necromancy",cast:"1 action",range:"Self",dur:"Conc. 1 min",desc:"3d6 necrotic; regain half as HP."},
  "Hunger of Hadar":{sc:"Conjuration",cast:"1 action",range:"150 ft",dur:"Conc. 1 min",desc:"20-ft darkness void: 2d6 cold+2d6 acid."},
  "Divine Favor":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",desc:"+1d4 radiant on weapon hits."},
  "Find Steed":{sc:"Conjuration",cast:"10 minutes",range:"30 ft",dur:"Instant",desc:"Summon a spirit steed."},
  "Aura of Vitality":{sc:"Evocation",cast:"1 action",range:"Self (30-ft radius)",dur:"Conc. 1 min",desc:"Bonus action: restore 2d6 HP to one creature."},
  "Revivify":{sc:"Necromancy",cast:"1 action",range:"Touch",dur:"Instant",desc:"Return dead (1 min) to life (300gp diamond)."},
  "Hunter's Mark":{sc:"Divination",cast:"1 bonus action",range:"90 ft",dur:"Conc. 1 hr",desc:"+1d6 on weapon hits vs target."},
  "Fog Cloud":{sc:"Conjuration",cast:"1 action",range:"120 ft",dur:"Conc. 1 hr",desc:"20-ft sphere heavily obscured."},
  "Ensnaring Strike":{sc:"Conjuration",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",desc:"STR save or restrained; 1d6 piercing per turn."},
  "Conjure Barrage":{sc:"Conjuration",cast:"1 action",range:"Self (60-ft cone)",dur:"Instant",desc:"DEX save or 3d8 weapon-type damage."},
  "Swift Quiver":{sc:"Transmutation",cast:"1 bonus action",range:"Touch",dur:"Conc. 1 min",desc:"Quiver generates ammo; 2 ranged attacks per bonus action."},
  "Wind Wall":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",desc:"Wall of wind; 3d8 bludgeoning."},
  "Silence":{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",desc:"20-ft sphere of magical silence."},
  "Hypnotic Pattern":{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",desc:"WIS save or incapacitated."},
  "Major Image":{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",desc:"20-ft cube illusion with sound and smell."},
  "Sending":{sc:"Evocation",cast:"1 action",range:"Unlimited",dur:"1 round",desc:"25-word message to known creature."},
  "Dissonant Whispers":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Instant",desc:"WIS save or 3d6 psychic, must flee."},
  "Heroism":{sc:"Enchantment",cast:"1 action",range:"Touch",dur:"Conc. 1 min",desc:"Immune to frightened; temp HP each turn."},
  "Enthrall":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"1 minute",desc:"WIS save or distracted by you."},
  "Compulsion":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",desc:"WIS save or must move chosen direction."},
  "Dimension Door":{sc:"Conjuration",cast:"1 action",range:"500 ft",dur:"Instant",desc:"Teleport self + one creature up to 500 ft."},
  "Hallucinatory Terrain":{sc:"Illusion",cast:"10 minutes",range:"300 ft",dur:"24 hours",desc:"Terrain looks like another terrain type."},
  "Compelled Duel":{sc:"Enchantment",cast:"1 bonus action",range:"30 ft",dur:"Conc. 1 min",desc:"WIS save or must fight only you."},
  "Thunderous Smite":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",desc:"+2d6 thunder, STR save or prone."},
  "Wrathful Smite":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",desc:"+1d6 psychic, WIS save or frightened."},
  "Branding Smite":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",desc:"+2d6 radiant, target cannot be invisible."},
  "Crusader's Mantle":{sc:"Evocation",cast:"1 action",range:"Self",dur:"Conc. 1 min",desc:"Allies within 30 ft deal +1d4 radiant."},
  "Elemental Weapon":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",desc:"+1 weapon, +1d4 energy damage."},
  "Blinding Smite":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",desc:"+3d8 radiant, CON save or blinded."},
  "Staggering Smite":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",desc:"+4d6 psychic, WIS save or disadv."},
  "Holy Weapon":{sc:"Evocation",cast:"1 bonus action",range:"Touch",dur:"Conc. 1 hr",desc:"+2d8 radiant on hit."},
  "Hail of Thorns":{sc:"Conjuration",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",desc:"DEX save or 1d10 piercing in 5-ft burst."},
  "Speak with Animals":{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"10 minutes",desc:"Communicate with beasts."},
  "Lightning Arrow":{sc:"Transmutation",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",desc:"Next ranged hit: 4d8 lightning."},
  "Steel Wind Strike":{sc:"Conjuration",cast:"1 action",range:"30 ft",dur:"Instant",desc:"5 targets: 6d10 force each."},
  "Cordon of Arrows":{sc:"Transmutation",cast:"1 action",range:"5 ft",dur:"8 hours",desc:"4 arrows; DEX save or 1d6 piercing each."},
  "Conjure Volley":{sc:"Conjuration",cast:"1 action",range:"150 ft",dur:"Instant",desc:"40-ft cylinder: DEX save or 8d8 damage."},
  "Conjure Woodland Beings":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 hr",desc:"Summon fey creatures."},
  "Grasping Vine":{sc:"Conjuration",cast:"1 bonus action",range:"30 ft",dur:"Conc. 1 min",desc:"2d6 bludgeoning, pull 20 ft."},
  "Tree Stride":{sc:"Conjuration",cast:"1 action",range:"Self",dur:"Conc. 1 min",desc:"Teleport between trees of same species."},
  "Commune with Nature":{sc:"Divination",cast:"1 min (ritual)",range:"Self",dur:"Instant",desc:"Learn 3 facts about nearby terrain."},
  "Speak with Plants":{sc:"Transmutation",cast:"1 action",range:"Self (30-ft radius)",dur:"10 minutes",desc:"Communicate with plants."},
  "Dominate Beast":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"WIS save or control a beast."},
  "Giant Insect":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Conc. 10 min",desc:"Insects become giant versions."},
  "Antilife Shell":{sc:"Abjuration",cast:"1 action",range:"Self (10-ft radius)",dur:"Conc. 1 hr",desc:"Barrier prevents living creatures entering."},
  "Reincarnate":{sc:"Transmutation",cast:"1 hour",range:"Touch",dur:"Instant",desc:"Restore dead creature in new body."},
  "Animal Shapes":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Conc. 1 day",desc:"Willing creatures become beasts CR 4 or lower."},
  "Earth Tremor":{sc:"Evocation",cast:"1 action",range:"10 ft",dur:"Instant",desc:"DEX save or 1d6 bludgeoning and prone."},
  "Bane":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",desc:"CHA save or -1d4 to attacks/saves."},
  "Create or Destroy Water":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Instant",desc:"Create or destroy 10 gallons of water."},
  "Detect Evil and Good":{sc:"Divination",cast:"1 action",range:"Self",dur:"Conc. 10 min",desc:"Sense fiends, undead, celestials within 30 ft."},
  "Detect Magic":{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"Conc. 10 min",desc:"Sense magic within 30 ft."},
  "Detect Poison and Disease":{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"Conc. 10 min",desc:"Sense poison and disease within 30 ft."},
  "Purify Food and Drink":{sc:"Transmutation",cast:"1 action (ritual)",range:"10 ft",dur:"Instant",desc:"Purify food and drink in 5-ft sphere."},
  "Sanctuary":{sc:"Abjuration",cast:"1 bonus action",range:"30 ft",dur:"1 minute",desc:"WIS save or attackers must choose new target."},
  "Augury":{sc:"Divination",cast:"1 minute (ritual)",range:"Self",dur:"Instant",desc:"Weal/woe for action in next 30 min."},
  "Calm Emotions":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"Suppress charm/fright or emotions."},
  "Enhance Ability":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",desc:"Advantage on one ability checks."},
  "Find Traps":{sc:"Divination",cast:"1 action",range:"120 ft",dur:"Instant",desc:"Sense traps in line of sight."},
  "Locate Animals or Plants":{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"Instant",desc:"Sense nearest named beast or plant within 5 miles."},
  "Protection from Poison":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"1 hour",desc:"Advantage vs poison, resistance to poison damage."},
  "Warding Bond":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"1 hour",desc:"+1 AC/saves, resistance; you share damage taken."},
  "Zone of Truth":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"10 minutes",desc:"CHA save or cannot lie in 15-ft sphere."},
  "Beacon of Hope":{sc:"Abjuration",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",desc:"Advantage on WIS saves and death saves."},
  "Create Food and Water":{sc:"Conjuration",cast:"1 action",range:"30 ft",dur:"Instant",desc:"Create 45 lb food and 30 gallons water."},
  "Mass Healing Word":{sc:"Evocation",cast:"1 bonus action",range:"60 ft",dur:"Instant",desc:"6 creatures regain 1d4+mod HP."},
  "Meld into Stone":{sc:"Transmutation",cast:"1 action (ritual)",range:"Touch",dur:"8 hours",desc:"Step into a stone object."},
  "Speak with Dead":{sc:"Necromancy",cast:"1 action",range:"10 ft",dur:"10 minutes",desc:"Ask a corpse 5 questions."},
  "Water Walk":{sc:"Transmutation",cast:"1 action (ritual)",range:"30 ft",dur:"1 hour",desc:"Walk across liquid as if solid."},
  "Divination":{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"Instant",desc:"Truthful reply about event within 7 days."},
  "Commune":{sc:"Divination",cast:"1 minute (ritual)",range:"Self",dur:"1 minute",desc:"Ask deity 3 yes/no questions."},
  "Contagion":{sc:"Necromancy",cast:"1 action",range:"Touch",dur:"7 days",desc:"3 failed CON saves = diseased."},
  "Dispel Evil and Good":{sc:"Abjuration",cast:"1 action",range:"Self",dur:"Conc. 1 min",desc:"Fiends/undead/fey disadv attacking you."},
  "Hallow":{sc:"Evocation",cast:"24 hours",range:"Touch",dur:"Until dispelled",desc:"60-ft radius hallowed ground."},
  "Summon Celestial":{sc:"Conjuration",cast:"1 action",range:"90 ft",dur:"Conc. 1 hr",desc:"Summon obedient celestial spirit."},
  "Animal Messenger":{sc:"Enchantment",cast:"1 action (ritual)",range:"30 ft",dur:"24 hours",desc:"Tiny beast delivers 25-word message."},
  "Beast Sense":{sc:"Divination",cast:"1 action (ritual)",range:"Touch",dur:"Conc. 1 hr",desc:"See and hear through a beast."},
  "Flame Blade":{sc:"Evocation",cast:"1 bonus action",range:"Self",dur:"Conc. 10 min",desc:"Fire scimitar: 3d6 fire."},
  "Gust of Wind":{sc:"Evocation",cast:"1 action",range:"Self",dur:"Conc. 1 min",desc:"60-ft wind line pushes 15 ft."},
  "Heat Metal":{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"Metal glows: 2d8 fire, CON save or drop it."},
  "Locate Object":{sc:"Divination",cast:"1 action",range:"Self",dur:"Conc. 10 min",desc:"Sense direction to known object within 1000 ft."},
  "Locate Creature":{sc:"Divination",cast:"1 action",range:"Self",dur:"Conc. 1 hr",desc:"Sense direction to known creature within 1000 ft."},
  "Conjure Minor Elementals":{sc:"Conjuration",cast:"1 minute",range:"90 ft",dur:"Conc. 1 hr",desc:"Summon elementals CR 2 or lower."},
  "Banishing Smite":{sc:"Abjuration",cast:"1 bonus action",range:"Self",dur:"Conc. 1 min",desc:"+5d10 force; below 50 HP = banished."},
  "Circle of Power":{sc:"Abjuration",cast:"1 action",range:"Self (30-ft radius)",dur:"Conc. 10 min",desc:"Allies advantage on magic saves."},
  "Destructive Wave":{sc:"Evocation",cast:"1 action",range:"Self (30-ft radius)",dur:"Instant",desc:"CON save or 5d6 thunder+5d6 radiant, prone."},
  "Aura of Life":{sc:"Abjuration",cast:"1 action",range:"Self (30-ft radius)",dur:"Conc. 10 min",desc:"Necrotic resistance; 0 HP creatures regain 1 HP per turn."},
  "Aura of Purity":{sc:"Abjuration",cast:"1 action",range:"Self (30-ft radius)",dur:"Conc. 10 min",desc:"Allies immune to disease, resist poison."},
  "Geas":{sc:"Enchantment",cast:"1 minute",range:"60 ft",dur:"30 days",desc:"WIS save or follow command; 5d10 psychic per day if violated."},
  "Control Water":{sc:"Transmutation",cast:"1 action",range:"300 ft",dur:"Conc. 10 min",desc:"Flood, part, redirect, or whirlpool water in a 100-ft cube."},
  "Animate Objects":{sc:"Transmutation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",desc:"Animate up to 10 Small or smaller objects."},
  "Conjure Elemental":{sc:"Conjuration",cast:"1 minute",range:"90 ft",dur:"Conc. 1 hr",desc:"Summon elemental CR 5 or lower."},
  "Bigby's Hand":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",desc:"Force hand: punch 4d8, push, or grapple."},
  "Teleportation Circle":{sc:"Conjuration",cast:"1 minute",range:"10 ft",dur:"1 round",desc:"Portal to permanent teleportation circle."},
  "Wall of Force":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",desc:"Invisible indestructible wall of force."},
  "Wall of Stone":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",desc:"Nonmagical stone wall; can become permanent."},
  "Chain Lightning":{sc:"Evocation",cast:"1 action",range:"150 ft",dur:"Instant",desc:"4d8 lightning jumps to 4 targets."},
  "Circle of Death":{sc:"Necromancy",cast:"1 action",range:"150 ft",dur:"Instant",desc:"CON save or 8d6 necrotic in 60-ft sphere."},
  "Disintegrate":{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Instant",desc:"DEX save or 10d6+40 force; 0 HP = dust."},
  "Eyebite":{sc:"Necromancy",cast:"1 action",range:"Self",dur:"Conc. 1 min",desc:"WIS save or asleep/panicked/sickened."},
  "Globe of Invulnerability":{sc:"Abjuration",cast:"1 action",range:"Self (10-ft radius)",dur:"Conc. 1 min",desc:"5th-level and lower spells cannot enter."},
  "Mass Suggestion":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"24 hours",desc:"WIS save or 12 creatures follow suggestion."},
  "Sunbeam":{sc:"Evocation",cast:"1 action",range:"Self (60-ft line)",dur:"Conc. 1 min",desc:"CON save or 6d8 radiant and blinded."},
  "True Seeing":{sc:"Divination",cast:"1 action",range:"Touch",dur:"1 hour",desc:"See through illusions and invisibility."},
  "Delayed Blast Fireball":{sc:"Evocation",cast:"1 action",range:"150 ft",dur:"Conc. 1 min",desc:"Grows each round; DEX save or 12d6 fire."},
  "Etherealness":{sc:"Transmutation",cast:"1 action",range:"Self",dur:"Up to 8 hours",desc:"Enter Ethereal Plane."},
  "Finger of Death":{sc:"Necromancy",cast:"1 action",range:"60 ft",dur:"Instant",desc:"CON save or 7d8+30 necrotic; rises as zombie."},
  "Forcecage":{sc:"Evocation",cast:"1 action",range:"100 ft",dur:"1 hour",desc:"Inescapable 20-ft force cage."},
  "Teleport":{sc:"Conjuration",cast:"1 action",range:"10 ft",dur:"Instant",desc:"Transport up to 9 creatures to known destination."},
  "Dominate Monster":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Conc. 1 hr",desc:"WIS save or control any creature."},
  "Feeblemind":{sc:"Enchantment",cast:"1 action",range:"150 ft",dur:"30 days",desc:"INT save or INT and CHA drop to 1."},
  "Incendiary Cloud":{sc:"Conjuration",cast:"1 action",range:"150 ft",dur:"Conc. 1 min",desc:"DEX save or 10d8 fire per turn."},
  "Maze":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 10 min",desc:"Banish to labyrinth; DC 20 INT to escape."},
  "Mind Blank":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"24 hours",desc:"Immune to psychic damage and divination."},
  "Power Word Stun":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Until cured",desc:"150 HP or fewer: stunned until CON save."},
  "Sunburst":{sc:"Evocation",cast:"1 action",range:"150 ft",dur:"Instant",desc:"CON save or 12d6 radiant and blinded."},
  "Foresight":{sc:"Divination",cast:"1 minute",range:"Touch",dur:"8 hours",desc:"Cannot be surprised. Advantage on everything."},
  "Gate":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"Portal to another plane; summon specific creature."},
  "Meteor Swarm":{sc:"Evocation",cast:"1 action",range:"1 mile",dur:"Instant",desc:"4 meteors: DEX save or 20d6 fire+20d6 bludgeoning."},
  "Power Word Kill":{sc:"Enchantment",cast:"1 action",range:"60 ft",dur:"Instant",desc:"100 HP or fewer: instant death, no save."},
  "Wish":{sc:"Conjuration",cast:"1 action",range:"Self",dur:"Instant",desc:"The mightiest spell. Duplicate any spell 8th level or lower or wish."},
  "Weird":{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",desc:"WIS save or frightened; 4d10 psychic per turn."},
  "Time Stop":{sc:"Transmutation",cast:"1 action",range:"Self",dur:"Instant",desc:"Take 1d4+1 turns while time is frozen."},
  "True Polymorph":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Conc. 1 hr",desc:"WIS save or transform creature or object."},
  "Shapechange":{sc:"Transmutation",cast:"1 action",range:"Self",dur:"Conc. 1 hr",desc:"Transform into any seen creature of CR equal to level or lower."},
  "Astral Projection":{sc:"Necromancy",cast:"1 hour",range:"10 ft",dur:"Special",desc:"Project up to 9 willing creatures into the Astral Plane."},
  "Imprisonment":{sc:"Abjuration",cast:"1 minute",range:"30 ft",dur:"Until dispelled",desc:"WIS save or creature imprisoned."},
  "Prismatic Wall":{sc:"Abjuration",cast:"1 action",range:"60 ft",dur:"10 minutes",desc:"7-layer multicolored wall with different effects."},
  "Acid Splash":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Instant",desc:"1d6 acid vs one or two creatures."},
  "Blade Ward":{sc:"Abjuration",cast:"1 action",range:"Self",dur:"1 round",desc:"Resistance to weapon damage."},
  "Friends":{sc:"Enchantment",cast:"1 action",range:"Self",dur:"Conc. 1 min",desc:"Advantage on CHA checks vs one creature."},
  "Mending":{sc:"Transmutation",cast:"1 minute",range:"Touch",dur:"Instant",desc:"Repair a break or tear in an object."},
  "Message":{sc:"Transmutation",cast:"1 action",range:"120 ft",dur:"1 round",desc:"Whisper to a creature; it can reply."},
  "Poison Spray":{sc:"Conjuration",cast:"1 action",range:"10 ft",dur:"Instant",desc:"CON save or 1d12 poison."},
  "True Strike":{sc:"Divination",cast:"1 action",range:"Self",dur:"Instant",desc:"Make one attack with advantage using spell ability."},
  "Thunderclap":{sc:"Evocation",cast:"1 action",range:"5 ft",dur:"Instant",desc:"CON save or 1d6 thunder."},
  "Alarm":{sc:"Abjuration",cast:"1 minute (ritual)",range:"30 ft",dur:"8 hours",desc:"Alarm against intrusion in 20-ft cube."},
  "Chromatic Orb":{sc:"Evocation",cast:"1 action",range:"90 ft",dur:"Instant",desc:"3d8 of chosen energy type."},
  "Color Spray":{sc:"Illusion",cast:"1 action",range:"Self (15-ft cone)",dur:"1 round",desc:"6d10 HP worth of creatures blinded."},
  "Comprehend Languages":{sc:"Divination",cast:"1 action (ritual)",range:"Self",dur:"1 hour",desc:"Understand any spoken or written language."},
  "Disguise Self":{sc:"Illusion",cast:"1 action",range:"Self",dur:"1 hour",desc:"Change your appearance."},
  "Expeditious Retreat":{sc:"Transmutation",cast:"1 bonus action",range:"Self",dur:"Conc. 10 min",desc:"Bonus action Dash each turn."},
  "False Life":{sc:"Necromancy",cast:"1 action",range:"Self",dur:"1 hour",desc:"1d4+4 temporary HP."},
  "Feather Fall":{sc:"Transmutation",cast:"1 reaction",range:"60 ft",dur:"1 minute",desc:"5 creatures take no fall damage."},
  "Find Familiar":{sc:"Conjuration",cast:"1 hour (ritual)",range:"10 ft",dur:"Instant",desc:"Gain a familiar in animal form."},
  "Grease":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"1 minute",desc:"DEX save or fall prone; difficult terrain."},
  "Hideous Laughter":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",desc:"WIS save or incapacitated laughing."},
  "Identify":{sc:"Divination",cast:"1 minute (ritual)",range:"Touch",dur:"Instant",desc:"Learn magic item properties."},
  "Illusory Script":{sc:"Illusion",cast:"1 minute",range:"Touch",dur:"10 days",desc:"Hidden message only intended readers can see."},
  "Jump":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"1 minute",desc:"Triple jump distance."},
  "Longstrider":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"1 hour",desc:"+10 ft speed."},
  "Protection from Evil and Good":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Conc. 10 min",desc:"Protected from aberrations, fiends, undead."},
  "Ray of Sickness":{sc:"Necromancy",cast:"1 action",range:"60 ft",dur:"Instant",desc:"2d8 poison; CON save or poisoned."},
  "Silent Image":{sc:"Illusion",cast:"1 action",range:"60 ft",dur:"Conc. 10 min",desc:"Visual illusion up to 15-ft cube."},
  "Unseen Servant":{sc:"Conjuration",cast:"1 action (ritual)",range:"60 ft",dur:"1 hour",desc:"Invisible force performs simple tasks."},
  "Alter Self":{sc:"Transmutation",cast:"1 action",range:"Self",dur:"Conc. 1 hr",desc:"Change appearance, breathe water, or grow weapons."},
  "Blindness/Deafness":{sc:"Necromancy",cast:"1 action",range:"30 ft",dur:"1 minute",desc:"CON save or blinded/deafened."},
  "Blur":{sc:"Illusion",cast:"1 action",range:"Self",dur:"Conc. 1 min",desc:"Attacks against you have disadvantage."},
  "Cloud of Daggers":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"4d4 slashing in 5-ft cube each turn."},
  "Continual Flame":{sc:"Evocation",cast:"1 action",range:"Touch",dur:"Until dispelled",desc:"Permanent flame-like radiance."},
  "Crown of Madness":{sc:"Enchantment",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",desc:"WIS save or attacks random creature."},
  "Darkvision":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"8 hours",desc:"Darkvision 60 ft."},
  "Detect Thoughts":{sc:"Divination",cast:"1 action",range:"Self",dur:"Conc. 1 min",desc:"Read surface thoughts of creatures in 30 ft."},
  "Enlarge/Reduce":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",desc:"Double or halve size; +/-1d4 damage."},
  "Gentle Repose":{sc:"Necromancy",cast:"1 action (ritual)",range:"Touch",dur:"10 days",desc:"Preserve corpse; extend raise dead limit."},
  "Knock":{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Instant",desc:"Open locked/stuck/barred object."},
  "Levitate":{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Conc. 10 min",desc:"Target rises up to 20 ft."},
  "Magic Mouth":{sc:"Illusion",cast:"1 minute (ritual)",range:"30 ft",dur:"Until dispelled",desc:"25-word message triggers on condition."},
  "Magic Weapon":{sc:"Transmutation",cast:"1 bonus action",range:"Touch",dur:"Conc. 1 hr",desc:"Weapon becomes +1 magical."},
  "Melf's Acid Arrow":{sc:"Evocation",cast:"1 action",range:"90 ft",dur:"Instant",desc:"4d4 acid now + 2d4 next turn."},
  "Phantasmal Force":{sc:"Illusion",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"INT save or perceive illusion as real: 1d6 psychic per turn."},
  "Ray of Enfeeblement":{sc:"Necromancy",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"CON save or half damage with STR attacks."},
  "Rope Trick":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"1 hour",desc:"Extradimensional space at top of rope."},
  "See Invisibility":{sc:"Divination",cast:"1 action",range:"Self",dur:"1 hour",desc:"See invisible creatures and objects."},
  "Spider Climb":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",desc:"Climb any surface including ceilings."},
  "Web":{sc:"Conjuration",cast:"1 action",range:"60 ft",dur:"Conc. 1 hr",desc:"DEX save or restrained in webs."},
  "Bestow Curse":{sc:"Necromancy",cast:"1 action",range:"Touch",dur:"Conc. 1 min",desc:"WIS save or cursed with various penalties."},
  "Blink":{sc:"Transmutation",cast:"1 action",range:"Self",dur:"1 minute",desc:"d20 11+: shift to Ethereal until next turn."},
  "Clairvoyance":{sc:"Divination",cast:"10 minutes",range:"1 mile",dur:"Conc. 10 min",desc:"Invisible sensor; see or hear through it."},
  "Feign Death":{sc:"Necromancy",cast:"1 action",range:"Touch",dur:"1 hour",desc:"Appear dead; resistance all damage except psychic."},
  "Gaseous Form":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",desc:"Misty cloud, fly 10 ft, resist nonmagical damage."},
  "Glyph of Warding":{sc:"Abjuration",cast:"1 hour",range:"Touch",dur:"Until triggered",desc:"Rune triggers spell or 5d8 explosion."},
  "Nondetection":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"8 hours",desc:"Cannot be targeted by divination or scrying."},
  "Protection from Energy":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",desc:"Resistance to one energy type."},
  "Sleet Storm":{sc:"Conjuration",cast:"1 action",range:"150 ft",dur:"Conc. 1 min",desc:"DEX save or prone; difficult terrain."},
  "Stinking Cloud":{sc:"Conjuration",cast:"1 action",range:"90 ft",dur:"Conc. 1 min",desc:"CON save or waste action retching."},
  "Tongues":{sc:"Divination",cast:"1 action",range:"Touch",dur:"1 hour",desc:"Understand and speak any language."},
  "Water Breathing":{sc:"Transmutation",cast:"1 action (ritual)",range:"30 ft",dur:"24 hours",desc:"10 creatures breathe underwater."},
  "Arcane Eye":{sc:"Divination",cast:"1 action",range:"30 ft",dur:"Conc. 1 hr",desc:"Invisible magic eye; darkvision 30 ft."},
  "Evard's Black Tentacles":{sc:"Conjuration",cast:"1 action",range:"90 ft",dur:"Conc. 1 min",desc:"DEX save or restrained + 3d6 bludgeoning per turn."},
  "Fabricate":{sc:"Transmutation",cast:"10 minutes",range:"120 ft",dur:"Instant",desc:"Transform raw materials into product."},
  "Fire Shield":{sc:"Evocation",cast:"1 action",range:"Self",dur:"10 minutes",desc:"Resist fire or cold; attackers take 2d8."},
  "Leomund's Secret Chest":{sc:"Conjuration",cast:"1 action",range:"Touch",dur:"Instant",desc:"Hide chest on Ethereal Plane."},
  "Mordenkainen's Faithful Hound":{sc:"Conjuration",cast:"1 action",range:"30 ft",dur:"8 hours",desc:"Invisible watchdog; 4d8 piercing attack."},
  "Mordenkainen's Private Sanctum":{sc:"Abjuration",cast:"10 minutes",range:"120 ft",dur:"24 hours",desc:"Block teleportation, scrying, and sound."},
  "Otiluke's Resilient Sphere":{sc:"Evocation",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",desc:"DEX save or enclosed in force sphere."},
  "Phantasmal Killer":{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",desc:"WIS save or frightened; 4d10 psychic per turn."},
  "Stone Shape":{sc:"Transmutation",cast:"1 action",range:"Touch",dur:"Instant",desc:"Shape Medium stone into any form."},
  "Stoneskin":{sc:"Abjuration",cast:"1 action",range:"Touch",dur:"Conc. 1 hr",desc:"Resistance to nonmagical weapon damage."},
  "Wall of Fire":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 1 min",desc:"5d8 fire to creatures within 10 ft."},
  "Creation":{sc:"Illusion",cast:"1 minute",range:"30 ft",dur:"Special",desc:"Create nonliving object from shadow matter."},
  "Legend Lore":{sc:"Divination",cast:"10 minutes",range:"Self",dur:"Instant",desc:"Learn lore about legendary person/place/object."},
  "Mislead":{sc:"Illusion",cast:"1 action",range:"Self",dur:"Conc. 1 hr",desc:"Become invisible; create controllable double."},
  "Modify Memory":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",desc:"WIS save or alter 10 min of memories."},
  "Passwall":{sc:"Transmutation",cast:"1 action",range:"30 ft",dur:"1 hour",desc:"Passage through wall up to 20 ft deep."},
  "Planar Binding":{sc:"Abjuration",cast:"1 hour",range:"60 ft",dur:"24 hours",desc:"CHA save or celestial/fiend/fey serves you."},
  "Seeming":{sc:"Illusion",cast:"1 action",range:"30 ft",dur:"8 hours",desc:"Change appearance of any number of creatures."},
  "Telekinesis":{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Conc. 10 min",desc:"Move creatures or objects up to 1000 lb."},
  "Arcane Gate":{sc:"Conjuration",cast:"1 action",range:"500 ft",dur:"Conc. 10 min",desc:"Link two portals up to 500 ft apart."},
  "Contingency":{sc:"Evocation",cast:"10 minutes",range:"Self",dur:"10 days",desc:"Prepare spell to trigger automatically."},
  "Create Undead":{sc:"Necromancy",cast:"1 minute",range:"10 ft",dur:"Instant",desc:"Create 3 ghouls from corpses."},
  "Flesh to Stone":{sc:"Transmutation",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"CON save or petrified after 3 failures."},
  "Guards and Wards":{sc:"Abjuration",cast:"10 minutes",range:"Touch",dur:"24 hours",desc:"Magical building defenses."},
  "Move Earth":{sc:"Transmutation",cast:"1 action",range:"120 ft",dur:"Conc. 2 hr",desc:"Reshape 40-ft cube of dirt/sand/clay."},
  "Otiluke's Freezing Sphere":{sc:"Evocation",cast:"1 action",range:"300 ft",dur:"Instant",desc:"CON save or 10d6 cold in 60-ft radius."},
  "Otto's Irresistible Dance":{sc:"Enchantment",cast:"1 action",range:"30 ft",dur:"Conc. 1 min",desc:"WIS save or must dance: -2 AC, no movement."},
  "Programmed Illusion":{sc:"Illusion",cast:"1 action",range:"120 ft",dur:"Until dispelled",desc:"Illusion activates on trigger."},
  "Wall of Ice":{sc:"Evocation",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",desc:"CON save or 10d6 cold on creation."},
  "Mirage Arcane":{sc:"Illusion",cast:"10 minutes",range:"Sight",dur:"10 days",desc:"1-mile square terrain illusion."},
  "Mordenkainen's Magnificent Mansion":{sc:"Conjuration",cast:"1 minute",range:"300 ft",dur:"24 hours",desc:"Extradimensional dwelling."},
  "Mordenkainen's Sword":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Conc. 1 min",desc:"Floating sword: 3d10 force on command."},
  "Plane Shift":{sc:"Conjuration",cast:"1 action",range:"Touch",dur:"Instant",desc:"Transport up to 9 creatures to another plane."},
  "Prismatic Spray":{sc:"Evocation",cast:"1 action",range:"Self (60-ft cone)",dur:"Instant",desc:"8 colored rays with different effects."},
  "Project Image":{sc:"Illusion",cast:"1 action",range:"500 miles",dur:"Conc. 1 day",desc:"Illusory duplicate you can sense through."},
  "Reverse Gravity":{sc:"Transmutation",cast:"1 action",range:"100 ft",dur:"Conc. 1 min",desc:"Objects fall upward in 50-ft radius."},
  "Symbol":{sc:"Abjuration",cast:"1 minute",range:"Touch",dur:"Until triggered",desc:"Harmful rune triggers on condition."},
  "Heal":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",desc:"Restore 70 HP and end blindness/deafness/disease."},
  "Harm":{sc:"Necromancy",cast:"1 action",range:"60 ft",dur:"Instant",desc:"CON save or 14d6 necrotic; reduces max HP."},
  "Heroes' Feast":{sc:"Conjuration",cast:"10 minutes",range:"30 ft",dur:"Instant",desc:"12 creatures: immunity poison/fright, +2d10 HP max."},
  "Planar Ally":{sc:"Conjuration",cast:"10 minutes",range:"60 ft",dur:"Instant",desc:"Deity sends celestial/elemental/fiend."},
  "Word of Recall":{sc:"Conjuration",cast:"1 action",range:"5 ft",dur:"Instant",desc:"5 creatures teleport to sanctuary."},
  "Conjure Celestial":{sc:"Conjuration",cast:"1 minute",range:"90 ft",dur:"Conc. 1 hr",desc:"Summon celestial CR 4 or lower."},
  "Divine Word":{sc:"Evocation",cast:"1 bonus action",range:"30 ft",dur:"Instant",desc:"Effects based on creature HP."},
  "Fire Storm":{sc:"Evocation",cast:"1 action",range:"150 ft",dur:"Instant",desc:"DEX save or 7d10 fire in 10 cubes."},
  "Regenerate":{sc:"Transmutation",cast:"1 minute",range:"Touch",dur:"1 hour",desc:"4d8+15 HP now; regrow limbs; 1 HP per round."},
  "Resurrection":{sc:"Necromancy",cast:"1 hour",range:"Touch",dur:"Instant",desc:"Return dead (100 years) to life (1000gp diamond)."},
  "Antimagic Field":{sc:"Abjuration",cast:"1 action",range:"Self (10-ft radius)",dur:"Conc. 1 hr",desc:"10-ft sphere where magic fails."},
  "Control Weather":{sc:"Transmutation",cast:"10 minutes",range:"Self (5-mile radius)",dur:"Conc. 8 hr",desc:"Control weather in 5-mile area."},
  "Earthquake":{sc:"Evocation",cast:"1 action",range:"500 ft",dur:"Conc. 1 min",desc:"100-ft radius intense shaking."},
  "Holy Aura":{sc:"Abjuration",cast:"1 action",range:"Self",dur:"Conc. 1 min",desc:"Allies adv all saves; enemies disadv attacking them."},
  "Mass Heal":{sc:"Evocation",cast:"1 action",range:"60 ft",dur:"Instant",desc:"Distribute 700 HP among creatures."},
  "True Resurrection":{sc:"Necromancy",cast:"1 hour",range:"Touch",dur:"Instant",desc:"Return dead (200 years) even without body."},
  "Antipathy/Sympathy":{sc:"Enchantment",cast:"1 hour",range:"60 ft",dur:"10 days",desc:"Object repels or attracts a creature type."},
  "Storm of Vengeance":{sc:"Conjuration",cast:"1 action",range:"Sight",dur:"Conc. 1 min",desc:"Massive storm: lightning, acid, hail each round."},
  "Conjure Fey":{sc:"Conjuration",cast:"1 minute",range:"90 ft",dur:"Conc. 1 hr",desc:"Summon fey creature CR 6 or lower."},
  "Transport via Plants":{sc:"Conjuration",cast:"1 action",range:"10 ft",dur:"1 round",desc:"Link two Large+ plants on same plane."},
  "Wall of Thorns":{sc:"Conjuration",cast:"1 action",range:"120 ft",dur:"Conc. 10 min",desc:"7d8 piercing to pass through."},
  "Wind Walk":{sc:"Transmutation",cast:"1 minute",range:"30 ft",dur:"8 hours",desc:"10 creatures become gaseous, fly 300 ft."},
  "Glibness":{sc:"Transmutation",cast:"1 action",range:"Self",dur:"1 hour",desc:"CHA checks treat rolls of 9 or lower as 10."},
  "Power Word Heal":{sc:"Evocation",cast:"1 action",range:"Touch",dur:"Instant",desc:"Restore all HP; end conditions."},
  "Find the Path":{sc:"Divination",cast:"1 minute",range:"Self",dur:"Conc. 1 day",desc:"Know shortest path to location."},
  "Forbiddance":{sc:"Abjuration",cast:"10 minutes",range:"Touch",dur:"1 day",desc:"Guard area against planar travel."},
  "Blade Barrier":{sc:"Evocation",cast:"1 action",range:"90 ft",dur:"Conc. 10 min",desc:"DEX save or 6d10 slashing to pass through."},
  "Leomund's Tiny Hut":{sc:"Evocation",cast:"1 minute (ritual)",range:"Self",dur:"8 hours",desc:"10-ft dome shelter for 9 creatures."},
  "Magic Circle":{sc:"Abjuration",cast:"1 minute",range:"10 ft",dur:"1 hour",desc:"Barrier keeping creature type out or in."},
  "Phantom Steed":{sc:"Illusion",cast:"1 minute (ritual)",range:"30 ft",dur:"1 hour",desc:"Quasi-real steed, speed 100 ft."},
};

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
const EXPERTISE_LEVELS={Rogue:{1:2,6:2},Bard:{3:2,10:2}};
function expertiseSlots(cn,lvl){const t=EXPERTISE_LEVELS[cn];if(!t)return 0;return Object.keys(t).reduce((sum,l)=>lvl>=Number(l)?sum+t[l]:sum,0);}
// Strips a parenthetical suffix, e.g. "Magic Initiate (Druid)" -> "Magic Initiate".
function featBaseName(f){return (f||"").replace(/\s*\([^)]*\)\s*$/,"").trim();}
// 2024 rules: Magic Initiate can only pick from Cleric, Druid, or Wizard.
const MAGIC_INITIATE_CLASSES=["Cleric","Druid","Wizard"];
// Level-1 Ritual spells (any class) — the 2 you learn with Pact of the Tome.
const RITUAL_L1=["Alarm","Comprehend Languages","Detect Magic","Detect Poison and Disease","Find Familiar","Identify","Purify Food and Drink","Speak with Animals","Unseen Servant"];
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

const CLASS_DEFAULTS={Barbarian:{armor:null,shield:false,weapon:"Greataxe"},Bard:{armor:"Leather armor",shield:false,weapon:"Rapier"},Cleric:{armor:"Chain shirt",shield:true,weapon:"Mace"},Druid:{armor:"Leather armor",shield:true,weapon:"Scimitar"},Fighter:{armor:"Chain mail",shield:true,weapon:"Longsword"},Monk:{armor:null,shield:false,weapon:"Shortsword"},Paladin:{armor:"Chain mail",shield:true,weapon:"Longsword"},Ranger:{armor:"Scale mail",shield:false,weapon:"Shortsword"},Rogue:{armor:"Leather armor",shield:false,weapon:"Rapier"},Sorcerer:{armor:null,shield:false,weapon:"Dagger"},Warlock:{armor:"Leather armor",shield:false,weapon:"Dagger"},Wizard:{armor:null,shield:false,weapon:"Quarterstaff"}};

const CLASSES={
  Barbarian:{hd:12,pri:["STR","CON","DEX"],saves:["STR","CON"],armor:"Light, medium, shields",weapons:"Simple and martial",sc:["Animal Handling","Athletics","Intimidation","Nature","Perception","Survival"],ns:2,role:"Frontline bruiser",features:["Rage (2/long rest)","Unarmored Defense AC=10+DEX+CON","Weapon Mastery x2","Reckless Attack Lvl2","Danger Sense Lvl2","Subclass Lvl3"],classFeatChoices:["Great Weapon Master","Tough","Sentinel","Tavern Brawler","Alert"]},
  Bard:{hd:8,pri:["CHA","DEX","CON"],saves:["DEX","CHA"],armor:"Light",weapons:"Simple",sc:SKILL_LIST.map(s=>s.name),ns:3,role:"Social caster and support",features:["Bardic Inspiration CHA mod/long rest","Expertise Lvl1","Jack of All Trades Lvl2","Subclass Lvl3"],classFeatChoices:["War Caster","Resilient","Lucky","Inspiring Leader","Skilled"]},
  Cleric:{hd:8,pri:["WIS","CON","STR"],saves:["WIS","CHA"],armor:"Light, medium, shields",weapons:"Simple",sc:["History","Insight","Medicine","Persuasion","Religion"],ns:2,role:"Divine caster and healer",features:["Divine Order Lvl1","Subclass Lvl3","Channel Divinity","Blessed Strikes Lvl7"],classFeatChoices:["War Caster","Resilient","Lucky","Inspiring Leader","Sentinel"]},
  Druid:{hd:8,pri:["WIS","CON","INT"],saves:["INT","WIS"],armor:"Light, medium, shields (no metal)",weapons:"Simple",sc:["Animal Handling","Arcana","Insight","Medicine","Nature","Perception","Religion","Survival"],ns:2,role:"Nature caster and controller",features:["Druidic language","Primal Order Lvl1","Wild Shape Lvl2","Subclass Lvl3"],classFeatChoices:["War Caster","Resilient","Tough","Lucky","Mobile"]},
  Fighter:{hd:10,pri:["STR","CON","DEX"],saves:["STR","CON"],armor:"All armor, shields",weapons:"Simple and martial",sc:["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Perception","Survival"],ns:2,role:"Weapon specialist",features:["Fighting Style Lvl1","Second Wind 1/short rest","Weapon Mastery x3","Action Surge Lvl2","Subclass Lvl3","Extra Attack Lvl5"],classFeatChoices:["Great Weapon Master","Sharpshooter","Sentinel","War Caster","Alert","Tough","Mobile"]},
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
  Club:{dmg:"1d4",ab:"STR",pr:"Light",type:"simple",mastery:"Slow"},Dagger:{dmg:"1d4",ab:"fin",pr:"Finesse, light, thrown (20/60)",type:"simple",mastery:"Nick"},Greatclub:{dmg:"1d8",ab:"STR",pr:"Two-handed",type:"simple",mastery:"Push"},Handaxe:{dmg:"1d6",ab:"STR",pr:"Light, thrown (20/60)",type:"simple",mastery:"Vex"},Javelin:{dmg:"1d6",ab:"STR",pr:"Thrown (30/120)",type:"simple",mastery:"Slow"},"Light hammer":{dmg:"1d4",ab:"STR",pr:"Light, thrown (20/60)",type:"simple",mastery:"Nick"},Mace:{dmg:"1d6",ab:"STR",pr:"—",type:"simple",mastery:"Sap"},Quarterstaff:{dmg:"1d6",ab:"STR",pr:"Versatile (1d8)",type:"simple",mastery:"Topple"},Sickle:{dmg:"1d4",ab:"fin",pr:"Finesse, light",type:"simple",mastery:"Nick"},Spear:{dmg:"1d6",ab:"STR",pr:"Thrown (20/60), versatile (1d8)",type:"simple",mastery:"Sap"},"Unarmed strike":{dmg:"1",ab:"STR",pr:"—",type:"simple",mastery:"—"},"Light crossbow":{dmg:"1d8",ab:"DEX",pr:"Ammunition, loading, two-handed (80/320)",type:"simple",mastery:"Slow"},Dart:{dmg:"1d4",ab:"fin",pr:"Finesse, thrown (20/60)",type:"simple",mastery:"Vex"},Shortbow:{dmg:"1d6",ab:"DEX",pr:"Ammunition, two-handed (80/320)",type:"simple",mastery:"Vex"},Sling:{dmg:"1d4",ab:"DEX",pr:"Ammunition (30/120)",type:"simple",mastery:"Slow"},Battleaxe:{dmg:"1d8",ab:"STR",pr:"Versatile (1d10)",type:"martial",mastery:"Topple"},Flail:{dmg:"1d8",ab:"STR",pr:"—",type:"martial",mastery:"Sap"},Glaive:{dmg:"1d10",ab:"STR",pr:"Heavy, reach, two-handed",type:"martial",mastery:"Graze"},Greataxe:{dmg:"1d12",ab:"STR",pr:"Heavy, two-handed",type:"martial",mastery:"Cleave"},Greatsword:{dmg:"2d6",ab:"STR",pr:"Heavy, two-handed",type:"martial",mastery:"Graze"},Halberd:{dmg:"1d10",ab:"STR",pr:"Heavy, reach, two-handed",type:"martial",mastery:"Cleave"},Lance:{dmg:"1d12",ab:"STR",pr:"Reach, special",type:"martial",mastery:"Topple"},Longsword:{dmg:"1d8",ab:"STR",pr:"Versatile (1d10)",type:"martial",mastery:"Sap"},Maul:{dmg:"2d6",ab:"STR",pr:"Heavy, two-handed",type:"martial",mastery:"Topple"},Morningstar:{dmg:"1d8",ab:"STR",pr:"—",type:"martial",mastery:"Sap"},Pike:{dmg:"1d10",ab:"STR",pr:"Heavy, reach, two-handed",type:"martial",mastery:"Push"},Rapier:{dmg:"1d8",ab:"fin",pr:"Finesse",type:"martial",mastery:"Vex"},Scimitar:{dmg:"1d6",ab:"fin",pr:"Finesse, light",type:"martial",mastery:"Nick"},Shortsword:{dmg:"1d6",ab:"fin",pr:"Finesse, light",type:"martial",mastery:"Vex"},Trident:{dmg:"1d6",ab:"STR",pr:"Thrown (20/60), versatile (1d8)",type:"martial",mastery:"Topple"},"War pick":{dmg:"1d8",ab:"STR",pr:"—",type:"martial",mastery:"Sap"},Warhammer:{dmg:"1d8",ab:"STR",pr:"Versatile (1d10)",type:"martial",mastery:"Push"},Whip:{dmg:"1d4",ab:"fin",pr:"Finesse, reach",type:"martial",mastery:"Slow"},Blowgun:{dmg:"1",ab:"DEX",pr:"Ammunition, loading (25/100)",type:"martial",mastery:"Vex"},"Hand crossbow":{dmg:"1d6",ab:"DEX",pr:"Ammunition, light, loading (30/120)",type:"martial",mastery:"Vex"},"Heavy crossbow":{dmg:"1d10",ab:"DEX",pr:"Ammunition, heavy, loading, two-handed (100/400)",type:"martial",mastery:"Push"},Longbow:{dmg:"1d8",ab:"DEX",pr:"Ammunition, heavy, two-handed (150/600)",type:"martial",mastery:"Slow"},Net:{dmg:"—",ab:"DEX",pr:"Special, thrown (5/15)",type:"martial",mastery:"Entangle"},
};

const ARMOR_ITEMS={"Padded armor":{acFn:d=>11+d,light:true,stealth:"Disadvantage"},"Leather armor":{acFn:d=>11+d,light:true},"Studded leather":{acFn:d=>12+d,light:true},"Hide armor":{acFn:d=>12+Math.min(d,2),medium:true},"Chain shirt":{acFn:d=>13+Math.min(d,2),medium:true},"Scale mail":{acFn:d=>14+Math.min(d,2),medium:true,stealth:"Disadvantage"},"Breastplate":{acFn:d=>14+Math.min(d,2),medium:true},"Half plate":{acFn:d=>15+Math.min(d,2),medium:true,stealth:"Disadvantage"},"Ring mail":{ac:14,heavy:true,stealth:"Disadvantage"},"Chain mail":{ac:16,heavy:true,stealth:"Disadvantage"},"Splint armor":{ac:17,heavy:true,stealth:"Disadvantage"},"Plate armor":{ac:18,heavy:true,stealth:"Disadvantage"}};
const ARMOR_PROF={Barbarian:["light","medium","shield"],Bard:["light"],Cleric:["light","medium","shield"],Druid:["light","medium","shield"],Fighter:["light","medium","heavy","shield"],Monk:[],Paladin:["light","medium","heavy","shield"],Ranger:["light","medium","shield"],Rogue:["light"],Sorcerer:[],Warlock:["light"],Wizard:[]};
const WEAPON_PROF={Barbarian:["simple","martial"],Bard:["simple","bard-martial"],Cleric:["simple"],Druid:["simple"],Fighter:["simple","martial"],Monk:["simple","martial"],Paladin:["simple","martial"],Ranger:["simple","martial"],Rogue:["simple","rogue-martial"],Sorcerer:["simple"],Warlock:["simple"],Wizard:["simple"]};
const CW={Barbarian:["Greataxe","Handaxe","Unarmed strike"],Bard:["Rapier","Dagger","Unarmed strike"],Cleric:["Mace","Unarmed strike"],Druid:["Scimitar","Unarmed strike"],Fighter:["Longsword","Light crossbow","Unarmed strike"],Monk:["Shortsword","Dart","Unarmed strike"],Paladin:["Longsword","Javelin","Unarmed strike"],Ranger:["Shortsword","Longbow","Unarmed strike"],Rogue:["Rapier","Shortbow","Dagger","Unarmed strike"],Sorcerer:["Spear","Dagger","Unarmed strike"],Warlock:["Dagger","Unarmed strike"],Wizard:["Quarterstaff","Dagger","Unarmed strike"]};
const EQUIP={Barbarian:["Greataxe","4x Handaxe","Explorers Pack","15 GP"],Bard:["Leather armor","Rapier","Diplomats Pack","Lute","Dagger","15 GP"],Cleric:["Chain shirt","Shield","Mace","Holy symbol","Priests Pack","10 GP"],Druid:["Leather armor","Shield","Scimitar","Druidic focus","Explorers Pack","9 GP"],Fighter:["Chain mail","Longsword","Shield","Light crossbow","20 bolts","Dungeoneers Pack","4 GP"],Monk:["Shortsword","10x Darts","Explorers Pack","5 GP"],Paladin:["Chain mail","Shield","Longsword","6x Javelins","Priests Pack","Holy symbol","9 GP"],Ranger:["Scale mail","Longbow","20 arrows","Shortsword x2","Dungeoneers Pack","Quiver","10 GP"],Rogue:["Leather armor","Rapier","Shortbow","20 arrows","Thieves tools","Burglars Pack","Dagger x2","8 GP"],Sorcerer:["Spear","2x Daggers","Arcane focus","Dungeoneers Pack","50 GP"],Warlock:["Leather armor","Dagger x2","Arcane focus","Scholars Pack","15 GP"],Wizard:["Quarterstaff","Spellbook","2x Daggers","Arcane focus","Scholars Pack","5 GP"]};

const ALL_FEATS={Alert:{desc:"Add Prof. Bonus to Initiative. Cannot be surprised while conscious.",cat:"General"},Crafter:{desc:"Proficiency in 3 artisan tools. Craft at 20% discount.",cat:"General"},Healer:{desc:"Healer kit: restore 1d6+4+HD HP once per creature per rest.",cat:"General"},Lucky:{desc:"3 luck points per long rest. Reroll any d20 and choose either result.",cat:"General"},"Magic Initiate":{desc:"Learn 2 cantrips and 1 1st-level spell from any class.",cat:"General"},"Savage Attacker":{desc:"Once per turn, reroll melee weapon damage and use either result.",cat:"General"},Skilled:{desc:"Gain proficiency in any 3 skills or tools.",cat:"General",skilled:true},"Tavern Brawler":{desc:"Unarmed strikes use d4+STR. Bonus action grapple on hit.",cat:"General"},Tough:{desc:"HP maximum +2 per level (retroactive).",cat:"General",tough:true},"War Caster":{desc:"Advantage on CON concentration saves. Cast spells as OA.",cat:"General"},"Great Weapon Master":{desc:"On crit or kill with heavy weapon, bonus attack. Option: -5/+10.",cat:"General"},Mobile:{desc:"Speed +10 ft. Dash through difficult terrain. No OA from attacked creatures.",cat:"General",speed:10},Resilient:{desc:"Proficiency in one saving throw. +1 to that ability.",cat:"General"},Sentinel:{desc:"OA reduces speed to 0. OA on Disengage. React when ally targeted.",cat:"General"},Sharpshooter:{desc:"No long-range penalty. Ignore half/3/4 cover. Option: -5/+10.",cat:"General"},"Inspiring Leader":{desc:"10-min speech: up to 6 allies gain temp HP = level+CHA.",cat:"General"},Skulker:{desc:"Hide when lightly obscured. Missed ranged attack does not reveal you.",cat:"General"},Durable:{desc:"+1 CON. Min HP from Hit Dice = 2x CON mod.",cat:"General"},"Spell Sniper":{desc:"Double range of attack spells. Ignore half and 3/4 cover.",cat:"General"},"Polearm Master":{desc:"Bonus butt-end attack (1d4). OA when enemy enters reach.",cat:"General"},Defense:{desc:"Fighting Style: +1 AC while wearing armor.",cat:"Fighting Style",acBonus:1},Dueling:{desc:"Fighting Style: +2 damage with one melee weapon.",cat:"Fighting Style"},"Two-Weapon Fighting":{desc:"Fighting Style: Add ability mod to off-hand attack damage.",cat:"Fighting Style"},Archery:{desc:"Fighting Style: +2 to ranged weapon attack rolls.",cat:"Fighting Style"},Protection:{desc:"Fighting Style: Reaction to impose disadv on attack vs ally (shield).",cat:"Fighting Style"},"Blind Fighting":{desc:"Fighting Style: Blindsight 10 ft.",cat:"Fighting Style"},"Elven Accuracy":{desc:"(Elf) +1 DEX/INT/WIS/CHA. Triple advantage reroll.",cat:"Racial"},"Fey Teleportation":{desc:"(Elf) +1 INT/CHA. Speak Sylvan. 1/short rest: Misty Step.",cat:"Racial"},"Wood Elf Magic":{desc:"(Wood Elf) Longstrider, Pass without Trace, one druid cantrip.",cat:"Racial"},"High Elf Cantrip":{desc:"(High Elf) One wizard cantrip (INT).",cat:"Racial"},"Dwarven Fortitude":{desc:"(Dwarf) +1 CON. Dodge action: spend 1 HD to heal.",cat:"Racial"},"Orcish Fury":{desc:"(Orc) +1 STR/CON. Extra damage die on weapon attacks.",cat:"Racial"},"Bountiful Luck":{desc:"(Halfling) Reaction to grant ally Lucky reroll on a 1.",cat:"Racial"},"Second Chance":{desc:"(Halfling) +1 DEX/CON/CHA. Reaction to force reroll when attacked.",cat:"Racial"},"Squat Nimbleness":{desc:"(Small) +1 STR/DEX. Speed +5. Move through larger creatures.",cat:"Racial"},Hunter:{desc:"(Ranger) Colossus Slayer, Giant Killer, or Horde Breaker.",cat:"Class"},"Dragon Fear":{desc:"(Dragonborn) +1 STR/CON/CHA. Breathe fear instead of energy.",cat:"Racial"},"Dragon Hide":{desc:"(Dragonborn) +1 STR/CON/CHA. Natural AC 13+DEX, claw attacks.",cat:"Racial"},"Fade Away":{desc:"(Gnome) +1 INT/DEX. Reaction to become invisible when damaged.",cat:"Racial"},"Flames of Phlegethos":{desc:"(Tiefling) +1 INT/CHA. Reroll fire damage, fire shield aura.",cat:"Racial"},"Infernal Constitution":{desc:"(Tiefling) +1 CON. Resistance to cold/poison, advantage on poison saves.",cat:"Racial"},Musician:{desc:"Proficiency with 3 instruments. Play after a rest: allies gain Heroic Inspiration.",cat:"General"}};

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

const CS={Wizard:{0:["Acid Splash","Blade Ward","Chill Touch","Dancing Lights","Elementalism","Fire Bolt","Friends","Light","Mage Hand","Mending","Message","Mind Sliver","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","Thunderclap","Toll the Dead","True Strike"],1:["Alarm","Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Find Familiar","Fog Cloud","Grease","Hideous Laughter","Identify","Illusory Script","Jump","Longstrider","Mage Armor","Magic Missile","Protection from Evil and Good","Ray of Sickness","Shield","Silent Image","Sleep","Thunderwave","Unseen Servant","Witch Bolt"],2:["Alter Self","Augury","Blindness/Deafness","Blur","Cloud of Daggers","Continual Flame","Crown of Madness","Darkness","Darkvision","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Flaming Sphere","Gentle Repose","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Locate Object","Magic Mouth","Magic Weapon","Melf's Acid Arrow","Mirror Image","Misty Step","Phantasmal Force","Ray of Enfeeblement","Rope Trick","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"],3:["Animate Dead","Bestow Curse","Blink","Clairvoyance","Counterspell","Dispel Magic","Fear","Feign Death","Fireball","Fly","Gaseous Form","Glyph of Warding","Haste","Hypnotic Pattern","Leomund's Tiny Hut","Lightning Bolt","Magic Circle","Major Image","Nondetection","Phantom Steed","Protection from Energy","Remove Curse","Sending","Sleet Storm","Slow","Speak with Dead","Stinking Cloud","Tongues","Vampiric Touch","Water Breathing"],4:["Arcane Eye","Banishment","Blight","Confusion","Conjure Minor Elementals","Control Water","Dimension Door","Divination","Evard's Black Tentacles","Fabricate","Fire Shield","Greater Invisibility","Hallucinatory Terrain","Ice Storm","Leomund's Secret Chest","Locate Creature","Mordenkainen's Faithful Hound","Mordenkainen's Private Sanctum","Otiluke's Resilient Sphere","Phantasmal Killer","Polymorph","Stone Shape","Stoneskin","Wall of Fire"],5:["Animate Objects","Bigby's Hand","Circle of Power","Cloudkill","Cone of Cold","Conjure Elemental","Creation","Dominate Person","Geas","Hold Monster","Legend Lore","Mislead","Modify Memory","Passwall","Planar Binding","Seeming","Steel Wind Strike","Telekinesis","Teleportation Circle","Wall of Force","Wall of Stone"],6:["Arcane Gate","Chain Lightning","Circle of Death","Contingency","Create Undead","Disintegrate","Eyebite","Flesh to Stone","Globe of Invulnerability","Guards and Wards","Mass Suggestion","Move Earth","Otiluke's Freezing Sphere","Otto's Irresistible Dance","Programmed Illusion","Sunbeam","True Seeing","Wall of Ice"],7:["Delayed Blast Fireball","Etherealness","Finger of Death","Forcecage","Mirage Arcane","Mordenkainen's Magnificent Mansion","Mordenkainen's Sword","Plane Shift","Prismatic Spray","Project Image","Reverse Gravity","Symbol","Teleport"],8:["Antimagic Field","Antipathy/Sympathy","Control Weather","Dominate Monster","Feeblemind","Incendiary Cloud","Maze","Mind Blank","Power Word Stun","Sunburst"],9:["Astral Projection","Foresight","Gate","Imprisonment","Meteor Swarm","Power Word Kill","Prismatic Wall","Shapechange","Time Stop","True Polymorph","Weird","Wish"]},Cleric:{0:["Guidance","Light","Mending","Resistance","Sacred Flame","Spare the Dying","Thaumaturgy","Toll the Dead","Word of Radiance"],1:["Bane","Bless","Command","Create or Destroy Water","Cure Wounds","Detect Evil and Good","Detect Magic","Detect Poison and Disease","Guiding Bolt","Healing Word","Inflict Wounds","Protection from Evil and Good","Purify Food and Drink","Sanctuary","Shield of Faith"],2:["Aid","Augury","Blindness/Deafness","Calm Emotions","Continual Flame","Enhance Ability","Find Traps","Gentle Repose","Hold Person","Lesser Restoration","Locate Object","Prayer of Healing","Protection from Poison","Silence","Spiritual Weapon","Warding Bond","Zone of Truth"],3:["Animate Dead","Aura of Vitality","Beacon of Hope","Bestow Curse","Clairvoyance","Create Food and Water","Daylight","Dispel Magic","Feign Death","Glyph of Warding","Magic Circle","Mass Healing Word","Meld into Stone","Protection from Energy","Remove Curse","Revivify","Sending","Speak with Dead","Spirit Guardians","Tongues","Water Walk"],4:["Aura of Life","Aura of Purity","Banishment","Control Water","Death Ward","Divination","Freedom of Movement","Guardian of Faith","Locate Creature","Stone Shape"],5:["Circle of Power","Commune","Contagion","Dispel Evil and Good","Flame Strike","Geas","Greater Restoration","Hallow","Insect Plague","Legend Lore","Mass Cure Wounds","Planar Binding","Raise Dead","Summon Celestial"],6:["Blade Barrier","Create Undead","Find the Path","Forbiddance","Harm","Heal","Heroes' Feast","Planar Ally","Sunbeam","True Seeing","Word of Recall"],7:["Conjure Celestial","Divine Word","Etherealness","Fire Storm","Plane Shift","Regenerate","Resurrection","Symbol"],8:["Antimagic Field","Control Weather","Earthquake","Holy Aura","Sunburst"],9:["Astral Projection","Gate","Mass Heal","Power Word Heal","True Resurrection"]},Druid:{0:["Druidcraft","Elementalism","Guidance","Mending","Message","Poison Spray","Produce Flame","Resistance","Shillelagh","Spare the Dying","Starry Wisp","Thorn Whip","Thunderclap"],1:["Animal Friendship","Charm Person","Create or Destroy Water","Cure Wounds","Detect Magic","Detect Poison and Disease","Entangle","Faerie Fire","Fog Cloud","Goodberry","Healing Word","Jump","Longstrider","Protection from Evil and Good","Purify Food and Drink","Speak with Animals","Thunderwave"],2:["Aid","Animal Messenger","Augury","Barkskin","Beast Sense","Continual Flame","Darkvision","Enhance Ability","Enlarge/Reduce","Find Traps","Flame Blade","Flaming Sphere","Gust of Wind","Heat Metal","Hold Person","Lesser Restoration","Locate Animals or Plants","Locate Object","Moonbeam","Pass without Trace","Protection from Poison","Spike Growth"],3:["Aura of Vitality","Call Lightning","Conjure Animals","Daylight","Dispel Magic","Elemental Weapon","Feign Death","Meld into Stone","Plant Growth","Protection from Energy","Revivify","Sleet Storm","Speak with Plants","Water Breathing","Water Walk","Wind Wall"],4:["Blight","Confusion","Conjure Minor Elementals","Conjure Woodland Beings","Control Water","Divination","Dominate Beast","Fire Shield","Freedom of Movement","Giant Insect","Grasping Vine","Hallucinatory Terrain","Ice Storm","Locate Creature","Polymorph","Stone Shape","Stoneskin","Wall of Fire"],5:["Antilife Shell","Commune with Nature","Cone of Cold","Conjure Elemental","Contagion","Geas","Greater Restoration","Insect Plague","Mass Cure Wounds","Planar Binding","Reincarnate","Tree Stride","Wall of Stone"],6:["Conjure Fey","Find the Path","Flesh to Stone","Heal","Heroes' Feast","Move Earth","Sunbeam","Transport via Plants","Wall of Thorns","Wind Walk"],7:["Fire Storm","Mirage Arcane","Plane Shift","Regenerate","Reverse Gravity","Symbol"],8:["Animal Shapes","Antipathy/Sympathy","Control Weather","Earthquake","Feeblemind","Incendiary Cloud","Sunburst"],9:["Foresight","Shapechange","Storm of Vengeance","True Resurrection"]},Bard:{0:["Blade Ward","Dancing Lights","Friends","Light","Mage Hand","Mending","Message","Minor Illusion","Prestidigitation","Starry Wisp","Thunderclap","True Strike","Vicious Mockery"],1:["Animal Friendship","Bane","Charm Person","Color Spray","Command","Comprehend Languages","Cure Wounds","Detect Magic","Disguise Self","Dissonant Whispers","Earth Tremor","Faerie Fire","Feather Fall","Healing Word","Heroism","Hideous Laughter","Identify","Illusory Script","Longstrider","Silent Image","Sleep","Speak with Animals","Thunderwave","Unseen Servant"],2:["Aid","Animal Messenger","Blindness/Deafness","Calm Emotions","Cloud of Daggers","Crown of Madness","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Enthrall","Heat Metal","Hold Person","Invisibility","Knock","Lesser Restoration","Locate Animals or Plants","Locate Object","Magic Mouth","Mirror Image","Phantasmal Force","See Invisibility","Shatter","Silence","Suggestion","Zone of Truth"],3:["Bestow Curse","Clairvoyance","Dispel Magic","Fear","Feign Death","Glyph of Warding","Hypnotic Pattern","Leomund's Tiny Hut","Major Image","Mass Healing Word","Nondetection","Plant Growth","Sending","Slow","Speak with Dead","Speak with Plants","Stinking Cloud","Tongues"],4:["Compulsion","Confusion","Dimension Door","Freedom of Movement","Greater Invisibility","Hallucinatory Terrain","Locate Creature","Phantasmal Killer","Polymorph"],5:["Animate Objects","Dominate Person","Geas","Greater Restoration","Hold Monster","Legend Lore","Mass Cure Wounds","Mislead","Modify Memory","Planar Binding","Raise Dead","Seeming","Teleportation Circle"],6:["Eyebite","Find the Path","Guards and Wards","Heroes' Feast","Mass Suggestion","Otto's Irresistible Dance","Programmed Illusion","True Seeing"],7:["Etherealness","Forcecage","Mirage Arcane","Mordenkainen's Magnificent Mansion","Mordenkainen's Sword","Prismatic Spray","Project Image","Regenerate","Resurrection","Symbol","Teleport"],8:["Antipathy/Sympathy","Dominate Monster","Feeblemind","Glibness","Mind Blank","Power Word Stun"],9:["Foresight","Power Word Heal","Power Word Kill","Prismatic Wall","True Polymorph"]},Sorcerer:{0:["Acid Splash","Blade Ward","Chill Touch","Dancing Lights","Elementalism","Fire Bolt","Friends","Light","Mage Hand","Mending","Message","Mind Sliver","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","Sorcerous Burst","Thunderclap","True Strike"],1:["Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Fog Cloud","Grease","Jump","Mage Armor","Magic Missile","Ray of Sickness","Shield","Silent Image","Sleep","Thunderwave","Witch Bolt"],2:["Alter Self","Blindness/Deafness","Blur","Cloud of Daggers","Crown of Madness","Darkness","Darkvision","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Flame Blade","Flaming Sphere","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Magic Weapon","Mirror Image","Misty Step","Phantasmal Force","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"],3:["Blink","Clairvoyance","Counterspell","Daylight","Dispel Magic","Fear","Fireball","Fly","Gaseous Form","Haste","Hypnotic Pattern","Lightning Bolt","Major Image","Protection from Energy","Sleet Storm","Slow","Stinking Cloud","Tongues","Vampiric Touch","Water Breathing","Water Walk"],4:["Banishment","Blight","Confusion","Dimension Door","Dominate Beast","Fire Shield","Greater Invisibility","Ice Storm","Polymorph","Stoneskin","Wall of Fire"],5:["Animate Objects","Bigby's Hand","Cloudkill","Cone of Cold","Creation","Dominate Person","Hold Monster","Insect Plague","Seeming","Telekinesis","Teleportation Circle","Wall of Stone"],6:["Arcane Gate","Chain Lightning","Circle of Death","Disintegrate","Eyebite","Flesh to Stone","Globe of Invulnerability","Mass Suggestion","Move Earth","Otiluke's Freezing Sphere","Sunbeam","True Seeing"],7:["Delayed Blast Fireball","Etherealness","Finger of Death","Fire Storm","Plane Shift","Prismatic Spray","Reverse Gravity","Teleport"],8:["Dominate Monster","Earthquake","Incendiary Cloud","Power Word Stun","Sunburst"],9:["Gate","Meteor Swarm","Power Word Kill","Time Stop","Wish"]},Warlock:{0:["Blade Ward","Chill Touch","Eldritch Blast","Friends","Mage Hand","Mind Sliver","Minor Illusion","Poison Spray","Prestidigitation","Thunderclap","Toll the Dead","True Strike"],1:["Armor of Agathys","Arms of Hadar","Bane","Charm Person","Comprehend Languages","Detect Magic","Expeditious Retreat","Hellish Rebuke","Hex","Hideous Laughter","Illusory Script","Protection from Evil and Good","Speak with Animals","Unseen Servant","Witch Bolt"],2:["Cloud of Daggers","Crown of Madness","Darkness","Enthrall","Hold Person","Invisibility","Mirror Image","Misty Step","Ray of Enfeeblement","Spider Climb","Suggestion"],3:["Counterspell","Dispel Magic","Fear","Fly","Gaseous Form","Hunger of Hadar","Hypnotic Pattern","Magic Circle","Major Image","Remove Curse","Tongues","Vampiric Touch"],4:["Banishment","Blight","Dimension Door","Hallucinatory Terrain"],5:["Hold Monster","Mislead","Planar Binding","Teleportation Circle"]},Paladin:{1:["Bless","Command","Compelled Duel","Cure Wounds","Detect Evil and Good","Detect Magic","Detect Poison and Disease","Divine Favor","Heroism","Protection from Evil and Good","Purify Food and Drink","Shield of Faith","Thunderous Smite","Wrathful Smite"],2:["Aid","Branding Smite","Find Steed","Gentle Repose","Lesser Restoration","Locate Object","Magic Weapon","Prayer of Healing","Protection from Poison","Warding Bond","Zone of Truth"],3:["Aura of Vitality","Blinding Smite","Create Food and Water","Crusader's Mantle","Daylight","Dispel Magic","Elemental Weapon","Magic Circle","Remove Curse","Revivify"],4:["Aura of Life","Aura of Purity","Banishment","Death Ward","Locate Creature","Staggering Smite"],5:["Banishing Smite","Circle of Power","Destructive Wave","Dispel Evil and Good","Geas","Greater Restoration","Holy Weapon","Raise Dead","Summon Celestial"]},Ranger:{1:["Alarm","Animal Friendship","Cure Wounds","Detect Magic","Detect Poison and Disease","Ensnaring Strike","Entangle","Fog Cloud","Goodberry","Hail of Thorns","Hunter's Mark","Jump","Longstrider","Speak with Animals"],2:["Aid","Animal Messenger","Barkskin","Beast Sense","Cordon of Arrows","Darkvision","Enhance Ability","Find Traps","Gust of Wind","Lesser Restoration","Locate Animals or Plants","Locate Object","Magic Weapon","Pass without Trace","Protection from Poison","Silence","Spike Growth"],3:["Conjure Animals","Conjure Barrage","Daylight","Dispel Magic","Elemental Weapon","Lightning Arrow","Meld into Stone","Nondetection","Plant Growth","Protection from Energy","Revivify","Speak with Plants","Water Breathing","Water Walk","Wind Wall"],4:["Conjure Woodland Beings","Dominate Beast","Freedom of Movement","Grasping Vine","Locate Creature","Stoneskin"],5:["Commune with Nature","Conjure Volley","Greater Restoration","Steel Wind Strike","Swift Quiver","Tree Stride"]}};

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
  // Page 1 shows just the feature NAMES (compact). Full descriptions live on page 2.
  const featureLines=(sh.features||"").split("\n").filter(l=>l.trim()&&l.trim()!=="--").map(x=>{const c=x.indexOf(":");return (c>0?x.slice(0,c):x).replace(/^•\s*/,"").trim();}).slice(0,16);
  const skillRows=SKILL_LIST;
  const weaponRows=(sh.weapons||[]).slice(0,4);
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
        radial-gradient(circle at 52% 42%,rgba(255,248,210,.91) 0 18%,rgba(255,233,158,.38) 32%,rgba(16,10,5,0) 50%),
        radial-gradient(circle at 18% 76%,rgba(255,166,73,.22),transparent 18%),
        radial-gradient(circle at 86% 80%,rgba(105,191,255,.13),transparent 19%),
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

    <div className="panel attacks"><div className="panel-titlebar">{t("Attacks & Spellcasting")}</div>{weaponRows.map((w,i)=><div className="attack-row" key={i}><b>{w.name}</b><span>{w.atk}</span><span>{w.dmg}</span></div>)}</div>

    <div className="panel hp"><div className="panel-titlebar gold">{t("Hit Points")}</div><div className="hp-top"><div><div className="hp-lab">{t("Hit Dice")}</div><div style={{fontSize:"4.2mm",fontWeight:900,marginTop:"0.5mm"}}>{sh.hitDice}</div></div><div><div className="hp-lab">{t("HP Max")}</div><div className="hp-num">{sh.hpMax}</div></div></div><div className="hp-current">{t("CURRENT HP")}</div><div className="death"><div style={{textAlign:"center"}}><div className="subtle-caption" style={{marginBottom:"1.5mm"}}>{t("Successes")}</div><div><span/><span/><span/></div></div><div style={{textAlign:"center"}}><div className="subtle-caption" style={{marginBottom:"1.5mm"}}>{t("Failures")}</div><div><span/><span/><span/></div></div></div></div>

    <div className="panel traits"><div className="panel-titlebar">{t("Features & Traits")}</div><ul>{featureLines.map((line,i)=><li key={i}>{line.length>44?line.slice(0,44)+"…":line}</li>)}</ul><div style={{position:"absolute",left:0,right:0,bottom:"1.5mm",textAlign:"center",fontSize:"2.4mm",fontStyle:"italic",color:"#8a6a2a"}}>{t("Descriptions on page 2")}</div></div>
    <div className="small-token speed"><b>{sh.speed} ft.</b><span>{t("Speed")}</span></div>
    <div className="langs">{sh.weaponProf?`⚔ ${sh.weaponProf}  ·  `:""}{t("Languages")}: {lang||"Common"}</div>
  </div>;
}

function Page1({sh}){
  const{name,classLevel,background,species,alignment,finalStats,ac,initiative,speed,hpMax,hitDice,profBonus,saves,skills,passivePerc,weapons,spellAbility,spellAtk,spellDC,isCaster,profLangs,features,originFeat,traits,ideals,bonds,flaws,gp,equipment}=sh;
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
          {isCaster&&spellAbility&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:5,textAlign:"center"}}>{[["Ability",spellAbility],["Atk Bonus",spellAtk],["Save DC",spellDC]].map(([l,v])=><div key={l}><div style={{fontSize:13,fontWeight:700,fontFamily:"serif"}}>{v}</div><div style={{...capL,textAlign:"center",fontSize:5.5}}>{l}</div></div>)}</div>}
          <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"sans-serif"}}><thead><tr style={{borderBottom:"1px solid "+RULE}}>{["Weapon","Atk","Dmg","Mastery"].map(h=><th key={h} style={{textAlign:"left",padding:"1px 3px",fontSize:6.5,color:GOLD,fontWeight:600,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{weapons.map((w,i)=><tr key={i} style={{borderBottom:"0.5px solid #ede3cc"}}><td style={{padding:"3px 3px",fontSize:8,fontWeight:600}}>{w.name}</td><td style={{padding:"3px 3px",fontSize:8}}>{w.atk}</td><td style={{padding:"3px 3px",fontSize:7.5,color:"#444"}}>{w.dmg}</td>          <td style={{padding:"3px 3px",fontSize:7.5,color:"#6b4f1a",fontWeight:600}}>{w.mastery||"—"}</td></tr>)}</tbody></table>
        </PSec>
        <PSec title="Proficiencies and Languages"><div style={{fontSize:7.5,whiteSpace:"pre-wrap",lineHeight:1.6,fontFamily:"sans-serif"}}>{profLangs}</div></PSec>
      </div>
    </div>
    <ORul/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:2}}>
      <PSec title="Features, Traits and Feats" style={{display:"flex",flexDirection:"column"}}>
        <div style={{fontSize:7.5,lineHeight:1.45,fontFamily:"sans-serif",flex:1}}>
          {features.split("\n").map((line,i)=>{
            const colon=line.indexOf(":");
            if(colon>0&&colon<40){return <div key={i}><span style={{fontWeight:700}}>{line.slice(0,colon)}</span><span style={{fontWeight:400,opacity:0.85}}>{line.slice(colon)}</span></div>;}
            return <div key={i}>{line||"\u00a0"}</div>;
          })}
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
  return(<div className="page" style={pgStyle}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:"1.5px solid "+GOLD_L,paddingBottom:5,marginBottom:6}}>
      <div><div style={{fontSize:16,fontWeight:700,fontFamily:"serif"}}>{name}</div><div style={{...capL,fontSize:6}}>{classLevel} - {isCaster?t("Features & Spells"):t("Features & Traits")}</div></div>
      {isCaster&&<div style={{display:"flex",gap:12}}>{[["Ability",spellAbility],["Spell Attack",spellAtk],["Save DC",spellDC]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,fontFamily:"serif"}}>{v}</div><div style={{...capL,fontSize:5.5,textAlign:"center"}}>{l}</div></div>)}</div>}
    </div>
    <div style={{marginBottom:8}}>
      <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif",marginBottom:4}}>{t("Features & Traits")}</div>
      <div style={{columnCount:2,columnGap:14}}>{featEntries.map((line,i)=>{const ci=line.indexOf(":");const isHead=/^[A-Z].*:$/.test(line)&&line.length<40;const label=ci>0?line.slice(0,ci):null;const rest=ci>0?line.slice(ci+1):line;return <div key={i} style={{breakInside:"avoid",fontSize:7.5,lineHeight:1.4,fontFamily:"sans-serif",marginBottom:3,color:"#222"}}>{isHead?<span style={{fontWeight:800,color:GOLD}}>{line}</span>:label?<span><b>{label.replace(/^•\s*/,"")}:</b>{rest}</span>:line}</div>;})}</div>
    </div>
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}><span style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif"}}>{t("Inventory")}</span><span style={{fontSize:8,fontWeight:700,fontFamily:"serif"}}>{sh.gp||0} GP</span></div>
      <div style={{border:"1px solid "+RULE,borderRadius:4,padding:"6px 8px",minHeight:"55mm",background:"#fff"}}>
        <div style={{columnCount:2,columnGap:14,fontSize:8,lineHeight:1.7,fontFamily:"sans-serif",color:"#222",whiteSpace:"pre-wrap"}}>{(sh.inventory||"").split("\n").filter(Boolean).map((it,i)=><div key={i} style={{breakInside:"avoid"}}>• {it}</div>)}</div>
        <div style={{marginTop:6,borderTop:"0.5px dashed "+RULE}}>{Array.from({length:6}).map((_,i)=><div key={i} style={{borderBottom:"0.5px dashed #ddd",height:"6mm"}}/>)}</div>
      </div>
    </div>
    {isCaster&&<>
    <div style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,padding:"6px 8px",marginBottom:8}}>
      <div style={{fontSize:7,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700,color:GOLD,fontFamily:"sans-serif",textAlign:"center",borderBottom:"0.5px solid "+RULE,marginBottom:4,paddingBottom:2}}>Spell Slots</div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${spellSlots.filter(s=>s>0).length||1},1fr)`,gap:4,textAlign:"center"}}>
        {spellSlots.map((cnt,i)=>cnt>0?(<div key={i}><div style={{...capL,textAlign:"center",fontSize:5.5,marginBottom:3}}>{LVLL[i+1]}</div><div style={{display:"flex",flexWrap:"wrap",gap:2,justifyContent:"center"}}>{Array.from({length:cnt}).map((_,j)=><div key={j} style={{width:10,height:10,borderRadius:"50%",border:"1px solid "+RULE,background:GOLD_L}}/>)}</div></div>):null)}
      </div>
    </div>
    {LVLL.map((lvl,li)=>{const spells=spellsByLevel[li]||[];if(!spells.length)return null;return <div key={lvl} style={{marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif",whiteSpace:"nowrap"}}>{lvl}</div>{li>0&&<div style={{...capL,fontSize:6,marginBottom:0}}>{spellSlots[li-1]||0} slots</div>}<div style={{flex:1,height:"0.5px",background:RULE}}/></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(115px,1fr))",gap:5}}>{spells.map((sp,i)=><div key={i} style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,padding:"5px 6px"}}><div style={{fontSize:8.5,fontWeight:700,fontFamily:"serif",lineHeight:1.2,marginBottom:2}}>{sp.name}</div><div style={{fontSize:7,lineHeight:1.55,color:"#333",fontFamily:"sans-serif"}}>{sp.desc}</div></div>)}</div></div>;})}
    </>}
    <div style={{marginTop:7,borderTop:"0.5px solid "+RULE,paddingTop:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>D&D 2024 SRD 5.2</span><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>Page 2 of 2</span></div>
  </div>);
}

// ─── UI ───────────────────────────────────────
const G={gold:"#fcd34d",bg:"#020817",card:"#0f172a",border:"#1e293b",muted:"#94a3b8",dim:"#64748b",dimmer:"#475569"};
const inp={width:"100%",background:"transparent",border:"1px solid #334155",color:"#f1f5f9",borderRadius:"0.75rem",padding:"0.5rem 0.75rem",outline:"none",boxSizing:"border-box",fontFamily:"inherit",fontSize:"0.875rem"};
  const CAT_LABEL_COLOR={Origin:"#fbbf24",General:G.muted,"Fighting Style":"#f97316",Species:"#a78bfa",Class:"#60a5fa"};
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
      <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap",marginBottom:"0.7rem"}}>{[[t("Cast"),d.cast],[t("Range"),d.range],[t("Duration"),d.dur]].filter(([,v])=>v).map(([l,v])=><div key={l} style={{background:"#1e293b",borderRadius:"0.4rem",padding:"0.2rem 0.5rem",fontSize:"0.68rem"}}><span style={{color:G.dim}}>{l}: </span><span style={{color:"#e2e8f0",fontWeight:600}}>{v}</span></div>)}</div>
      <div style={{fontSize:"0.85rem",color:"#94a3b8",lineHeight:1.65}}>{d.desc}</div>
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

function EquipmentPanel({cn,dm,sm,pb,equipped,equipItem,gp,setGp,ac,masteredWeapons,setMasteredWeapons}){
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
      {(MASTERY_SLOTS[cn]||0)>0&&(()=>{const slots=MASTERY_SLOTS[cn];const eligible=Object.entries(WD).filter(([,w])=>w.mastery&&w.mastery!=="—"&&(WEAPON_PROF[cn]||[]).includes(w.type));return(<div style={{marginTop:"0.75rem",padding:"0.65rem",background:"#1e293b",borderRadius:"0.75rem",border:"1px solid #334155"}}><div style={{fontSize:"0.72rem",color:"#a78bfa",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.4rem"}}>Weapon Mastery - choose {slots} ({masteredWeapons.length}/{slots})</div><div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>{eligible.map(([wn,w])=>{const sel=masteredWeapons.includes(wn);const atMax=masteredWeapons.length>=slots;return(<button key={wn} onClick={()=>setMasteredWeapons(prev=>prev.includes(wn)?prev.filter(x=>x!==wn):prev.length>=slots?prev:[...prev,wn])} style={{padding:"0.2rem 0.5rem",borderRadius:"0.45rem",fontSize:"0.72rem",border:"1px solid",cursor:(atMax&&!sel)?"not-allowed":"pointer",opacity:(atMax&&!sel)?0.35:1,background:sel?"#581c87":"transparent",color:sel?"#e9d5ff":"#f1f5f9",borderColor:sel?"#a78bfa":"#334155",fontWeight:sel?700:400}}>{wn} <span style={{color:"#a78bfa",fontSize:"0.65rem"}}>{w.mastery}</span></button>);})}</div></div>);})()} 
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
  const [cname,setCname]=useState("");
  const [playerName,setPlayerName]=useState("");
  const [sub,setSub]=useState("");
  const [anotes,setAnotes]=useState("");
  const [inventory,setInventory]=useState(()=>(EQUIP[initChar.cn]||[]).join("\n"));
  const [equipped,setEquipped]=useState(()=>({...CLASS_DEFAULTS[initChar.cn]}));
  const [masteredWeapons,setMasteredWeapons]=useState(()=>defaultMasteredWeaponsForClass(initChar.cn));
  const [featMap,setFeatMap]=useState({});
  const [skilledSkills,setSkilledSkills]=useState([]);
  const [mc,setMc]=useState(false);
  const [cn2,setCn2]=useState("Rogue");
  const [lv2,setLv2]=useState(1);
  const [align,setAlign]=useState("Neutral Good");
  const [traits,setTraits]=useState("");
  const [ideals,setIdeals]=useState("");
  const [bonds,setBonds]=useState("");
  const [flaws,setFlaws]=useState("");
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
  const [panelOrder,setPanelOrder]=useState(["overview","spells","equipment","notes"]);
  const [collapsed,setCollapsed]=useState({});
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
  const saves=mc&&cls2?Array.from(new Set([...cls.saves,...cls2.saves])):cls.saves;
  const allSc=mc&&cls2?Array.from(new Set([...cls.sc,...cls2.sc])):cls.sc;
  const maxSk=mc?cls.ns+1:cls.ns;
  const skProfs=useMemo(()=>Array.from(new Set([...bgo.sk,...selSk,...skilledSkills])),[bgo.sk,selSk,skilledSkills]);
  const miForcedMatch=featBaseName(bgo.feat)==="Magic Initiate"?bgo.feat.match(/\(([^)]+)\)/):null;
  const miForcedClass=miForcedMatch?miForcedMatch[1]:"";
  const hasMagicInitiate=featBaseName(bgo.feat)==="Magic Initiate"||!!featMap["Magic Initiate"];
  const miClassEff=miForcedClass||miClass||MAGIC_INITIATE_CLASSES[0];
  const passPerc=10+wm+(skProfs.includes("Perception")?pb:0);
  const init=dm+(hasAlert?pb:0);
  const speed=(speciesData?.speed||30)+(hasMobile?10:0);
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
  const featsByTab=useMemo(()=>{const tabs={Origin:[],General:[],"Fighting Style":[],Species:[],Class:[]};Object.entries(ALL_FEATS).forEach(([name,feat])=>{const cat=feat.cat||"General";if(tabs[cat])tabs[cat].push(name);});return tabs;},[]);

  React.useEffect(()=>{if(mc&&lv2>level-1)setLv2(Math.max(1,level-1));},[mc,lv2,level]);

  function changeClass(newCn){setCn(newCn);setSub("");setClassOrder(defaultOrder(newCn));setInventory((EQUIP[newCn]||[]).join("\n"));setSelInv([]);setSelRituals([]);setSelTomeCantrips([]);setSelSp({});setSpPrep({});setUsedSlots({});setMstats(assignArr(newCn));setSelSk(CLASSES[newCn].sc.slice(0,CLASSES[newCn].ns));setEquipped({...CLASS_DEFAULTS[newCn]});setMasteredWeapons(defaultMasteredWeaponsForClass(newCn));setSelExpertise([]);}

  function buildW(){
    const weapons=[];const wname=equipped.weapon;const weapProfs=WEAPON_PROF[cn]||[];
    const wd=n=>n==="Unarmed strike"&&hasTavernBrawler?{...WD[n],dmg:"1d4"}:WD[n];
    if(wname&&wd(wname)){const w=wd(wname);const isProf=weapProfs.includes(w.type);const am=w.ab==="fin"?(dm>=sm?dm:sm):w.ab==="DEX"?dm:sm;weapons.push({name:wname,atk:sgn(isProf?am+pb:am),dmg:w.dmg+" "+sgn(am),props:w.pr,mastery:w.mastery||"—"});}
    CW[cn].filter(n=>n!==wname).slice(0,3).forEach(wn=>{const w=wd(wn);if(!w)return;const am=w.ab==="fin"?(dm>=sm?dm:sm):w.ab==="DEX"?dm:sm;weapons.push({name:wn,atk:sgn(am+pb),dmg:w.dmg+" "+sgn(am),props:w.pr,mastery:w.mastery||"—"});});
    return weapons.slice(0,4);
  }

  function exportCharacter(){
    const data={version:1,cname,playerName,level,sp,cn,bg,align,sub,anotes,boost,boost2,boost1,gender,portraitMode,smode,mstats,rstats,selSk,selLangs,selExpertise,miClass,miCantrips,miSpell,skilledSkills,equipped,masteredWeapons,featMap,mc,cn2,lv2,traits,ideals,bonds,flaws,gp,selSp,selInv,selRituals,selTomeCantrips,classOrder,inventory,spPrep,usedSlots};
    const safeName=(cname||"unnamed").replace(/[^a-z0-9_\-]/gi,"_");
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`character-${safeName}.json`;a.style.display="none";document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function importCharacter(e){
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=evt=>{try{const d=JSON.parse(evt.target.result);if(d.cname!==undefined)setCname(d.cname);if(d.playerName!==undefined)setPlayerName(d.playerName);if(d.level!==undefined)setLevel(d.level);if(d.sp!==undefined)setSp(d.sp);if(d.cn!==undefined)changeClass(d.cn);if(d.bg!==undefined)setBg(d.bg);if(d.align!==undefined)setAlign(d.align);if(d.sub!==undefined)setSub(d.sub);if(d.anotes!==undefined)setAnotes(d.anotes);if(d.boost!==undefined)setBoost(d.boost);if(d.boost2!==undefined)setBoost2(d.boost2);if(d.boost1!==undefined)setBoost1(d.boost1);if(d.gender!==undefined)setGender(d.gender);if(d.portraitMode!==undefined)setPortraitMode(d.portraitMode);if(d.smode!==undefined)setSmode(d.smode);if(d.mstats!==undefined)setMstats(d.mstats);if(d.rstats!==undefined)setRstats(d.rstats);if(d.selSk!==undefined)setSelSk(d.selSk);if(d.selLangs!==undefined)setSelLangs(d.selLangs);if(d.selExpertise!==undefined)setSelExpertise(d.selExpertise);if(d.miClass!==undefined)setMiClass(d.miClass);if(d.miCantrips!==undefined)setMiCantrips(d.miCantrips);if(d.miSpell!==undefined)setMiSpell(d.miSpell);if(d.skilledSkills!==undefined)setSkilledSkills(d.skilledSkills);if(d.equipped!==undefined)setEquipped(d.equipped);if(d.masteredWeapons!==undefined)setMasteredWeapons(d.masteredWeapons);if(d.featMap!==undefined)setFeatMap(d.featMap);if(d.mc!==undefined)setMc(d.mc);if(d.cn2!==undefined)setCn2(d.cn2);if(d.lv2!==undefined)setLv2(d.lv2);if(d.traits!==undefined)setTraits(d.traits);if(d.ideals!==undefined)setIdeals(d.ideals);if(d.bonds!==undefined)setBonds(d.bonds);if(d.flaws!==undefined)setFlaws(d.flaws);if(d.gp!==undefined)setGp(d.gp);if(d.selSp!==undefined)setSelSp(d.selSp);if(d.selInv!==undefined)setSelInv(d.selInv);if(d.classOrder!==undefined)setClassOrder(d.classOrder);if(d.inventory!==undefined)setInventory(d.inventory);if(d.selRituals!==undefined)setSelRituals(d.selRituals);if(d.selTomeCantrips!==undefined)setSelTomeCantrips(d.selTomeCantrips);if(d.spPrep!==undefined)setSpPrep(d.spPrep);if(d.usedSlots!==undefined)setUsedSlots(d.usedSlots);}catch(err){alert("Failed to load character file.");}e.target.value="";};
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
    const slots=MASTERY_SLOTS[cn]||0;
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
  function buildSBL(){const res={};Object.entries(selSp).forEach(([lv,names])=>{const li=Number(lv);res[li]=(names||[]).map(name=>{const d=spellD(name)||{};return{name,desc:d.desc||""};});});return res;}

  function genSheet(){
    const nextPortraitSeed=Math.floor(Math.random()*1000000);
    setPortraitSeed(nextPortraitSeed);
    const nextGenderRoll=Math.random()<0.5?"male":"female";
    setGender(nextGenderRoll);
    const da=CURRENT_LANG==="da";
    const featDesc=n=>da?(FEATDESC_DA[n]||ALL_FEATS[n]?.desc||""):(ALL_FEATS[n]?.desc||"");
    const subDesc=(SUBCLASSES[cn]||{})[sub]||"Subclass features from level 3.";
    const orderInfo=CLASS_ORDER[cn]?CLASS_ORDER[cn].options.find(o=>o[0]===classOrder):null;
    const orderLine=orderInfo?CLASS_ORDER[cn].label+": "+orderInfo[0]+" — "+orderInfo[1][da?1:0]:"";
    const subclassLine=sub?sub+": "+(da?(SUBCLASS_DESC_DA[sub]||subDesc):subDesc):"";
    const originWord=da?"Oprindelse":"Origin";
    const originFeatLine=bgo.feat+" ("+originWord+"): "+featDesc(bgo.feat);
    const featsList=[originFeatLine,...activeFeats.map(f=>{const d=featDesc(f);return d?f+": "+d:f;})].join("\n");
    const classFeaturesTxt=(cls.features||[]).filter(f=>!(sub&&/^Subclass\b/i.test(f))).map(f=>{const label=da?(FEATURE_DA[f]||f):f;const d=FEATURE_DESC[f]?.[da?1:0];return d?label+": "+d:label;}).join("\n");
    const racialTraitsTxt=(speciesData.traits||[]).map(tr=>da?(TRAIT_DA[tr]||tr):tr).join("\n");
    const invLine=(isWarlock&&selInv.length)?selInv.map(n=>{const d=ELDRITCH_INVOCATIONS[n]?.[da?1:0];return "• "+n+(d?": "+d:"");}).join("\n"):"";
    const tomeCantripLine=(isWarlock&&selInv.includes("Pact of the Tome")&&selTomeCantrips.length)?selTomeCantrips.map(n=>{const dd=spellD(n)||{};return "• "+n+(dd.desc?": "+dd.desc:"");}).join("\n"):"";
    const ritualLine=(isWarlock&&selInv.includes("Pact of the Tome")&&selRituals.length)?selRituals.map(n=>{const dd=spellD(n)||{};return "• "+n+(dd.desc?": "+dd.desc:"");}).join("\n"):"";
    const invBlock=[invLine?"Eldritch Invocations:\n"+invLine:"",tomeCantripLine?"Tome cantrips:\n"+tomeCantripLine:"",ritualLine?"Ritual spells (Tome):\n"+ritualLine:""].filter(Boolean).join("\n");
    const miLine=hasMagicInitiate&&(miCantrips.length||miSpell)?"Magic Initiate ("+miClassEff+"):\n"+[...miCantrips,miSpell].filter(Boolean).map(n=>{const dd=spellD(n)||{};return "• "+n+(dd.desc?": "+dd.desc:"");}).join("\n"):"";
    const combinedFeatures=[subclassLine,orderLine,featsList,invBlock,miLine,classFeaturesTxt,racialTraitsTxt].filter(Boolean).join("\n\n--\n\n");
    const allLangs=[...new Set([...(speciesData?.languages||["Common"]),...selLangs])];
    const prof=cls.armor+" - "+cls.weapons+"\nTools: "+bgo.tools+"\nLanguages: "+allLangs.join(", ");
    const featuresTxt=[combinedFeatures,anotes?"\n"+anotes:""].join("").trim();
    const charTraits=traits||dispName+" is a "+bg.toLowerCase()+" turned "+cn.toLowerCase()+".";
    const nextGender=nextGenderRoll||gender;
    const nextSheet={name:dispName,playerName,classLevel:clsLvl,background:bg,species:sp,alignment:align,finalStats:fin,ac,initiative:init,speed,hpMax:hp,hitDice:level+"d"+cls.hd,profBonus:pb,saves,skills:skProfs,passivePerc:passPerc,weapons:buildW(),spellAbility:sab,spellAtk:sab?sgn(smod+pb):"",spellDC:sab?String(8+smod+pb):"",isCaster:isCaster&&!!sab&&Object.values(selSp).flat().length>0,spellSlots:slots,spellsByLevel:buildSBL(),profLangs:prof,features:featuresTxt,originFeat:bgo.feat,traits:charTraits,ideals:ideals||"—",bonds:bonds||"—",flaws:flaws||"—",gp,equipment:EQUIP[cn].join("\n"),inventory,portraitSeed:nextPortraitSeed,gender:nextGender,portraitMode,weaponProf:cls.weapons,armorProf:cls.armor,wisSkills:orderWisSkills(cn,classOrder),wisMod:mf(fin.WIS),expertise:selExpertise};
    nextSheet.portraitUrl=pollinationsImageUrl(buildPortraitPromptFromSheet(nextSheet),nextPortraitSeed);
    setSheet(nextSheet);
    setView("sheet");
  }

  if(view==="sheet"&&sheet){
    return <div><div className="no-print" style={{display:"flex",gap:8,padding:"8px 14px",background:"#1a0e00",alignItems:"center"}}><button onClick={()=>setView("gen")} style={{padding:"5px 14px",borderRadius:4,border:"1px solid #c9a84c",background:"#2d1a00",color:"#fcd34d",cursor:"pointer",fontSize:12,fontWeight:600}}>{t("Back")}</button><button onClick={()=>window.print()} style={{padding:"5px 14px",borderRadius:4,border:"1px solid #4ade80",background:"#14532d",color:"#4ade80",cursor:"pointer",fontSize:12,fontWeight:600}}>{t("Print / PDF")}</button><span style={{fontSize:11,color:"#8a6a2a"}}>{t("Set page margins to None.")} {t("2 pages")}</span></div><div className="print-area"><FancySheet sh={sheet}/><Page2 sh={sheet}/></div><style>{`@media print{@page{margin:0;size:A4 portrait}html,body,#root{margin:0!important;padding:0!important;background:white!important;width:210mm!important;min-height:297mm!important}.no-print{display:none!important}.print-area{display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important}.page{width:210mm!important;height:297mm!important;margin:0!important;box-shadow:none!important;break-after:page;page-break-after:always;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;overflow:hidden!important}.page img{display:block!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.page *{box-shadow:none!important}}`}</style></div>;
  }

  const buildOverview=()=>{
    const abilRows=AB.map(a=>{const score=fin[a],mod=mf(score),saveProf=saves.includes(a),saveBonus=mod+(saveProf?pb:0);return{ab:a,score,mod,saveProf,saveBonus};});
    const orderWis=orderWisSkills(cn,classOrder);const wm2=mf(fin.WIS);
    const skillRows=SKILL_LIST.map(sk=>{const prof=skProfs.includes(sk.name),expert=selExpertise.includes(sk.name),fromBg=bgo.sk.includes(sk.name),bonus=mf(fin[sk.ab])+(prof?pb:0)+(expert?pb:0)+(orderWis.includes(sk.name)?wm2:0);return{...sk,prof,expert,fromBg,bonus};});
    const weaponDisplay=buildW();
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
    const tabs=["Origin","General","Fighting Style","Species","Class"];
    // 2024 RAW eligibility: General/Species/Class feats come from ASI levels (4/8/12/16/19; Fighter +6/+14; Rogue +10)
    const asiSlots=(c,l)=>[4,8,12,16,19].filter(x=>x<=l).length+(c==="Fighter"?[6,14].filter(x=>x<=l).length:c==="Rogue"&&l>=10?1:0);
    const featBudget=asiSlots(cn,lv1e)+(mc&&cls2?asiSlots(cn2,lv2c):0)+(sp==="Human"?1:0);
    const FS_UNLOCK={Fighter:1,Paladin:2,Ranger:2};
    const canFS=(FS_UNLOCK[cn]&&lv1e>=FS_UNLOCK[cn])||(mc&&FS_UNLOCK[cn2]&&lv2c>=FS_UNLOCK[cn2]);
    const selFSCount=activeFeats.filter(f=>ALL_FEATS[f]?.cat==="Fighting Style").length;
    const selBudgetCount=activeFeats.filter(f=>ALL_FEATS[f]?.cat!=="Fighting Style").length;
    const atBudget=selBudgetCount>=featBudget;
    const hints={Species:`Feats available to ${sp}`,Class:`Suggested for ${cn}`,Origin:`Your background grants: ${bgo.feat}${sp==="Human"?" — Human (Versatile) may pick 1 extra Origin Feat":""}`,["Fighting Style"]:canFS?"Choose 1 Fighting Style (class feature)":"Only Fighters (lvl 1), Paladins and Rangers (lvl 2) get a Fighting Style"};
    // Each tab lists only the feats the character is entitled to consider
    const currentList=featTab==="Species"?racialFeatSuggestions:featTab==="Class"?classFeatSuggestions.filter(n=>ALL_FEATS[n]):featTab==="Origin"?ORIGIN_FEATS:featsByTab[featTab]||[];
    const suggested=featTab==="Species"?racialFeatSuggestions:featTab==="Class"?classFeatSuggestions:featTab==="Origin"?[bgo.feat]:[];
    const sorted=[...currentList].sort((a,b)=>(suggested.includes(a)?0:1)-(suggested.includes(b)?0:1));
    const featAllowed=name=>{
      if(featMap[name])return true; // always allow deselect
      const cat=ALL_FEATS[name]?.cat;
      if(cat==="Fighting Style")return canFS&&selFSCount<1;
      return !atBudget;
    };
    const miPicker=()=>{
      const cantripList=CS[miClassEff]?.[0]||[];
      const spellList=CS[miClassEff]?.[1]||[];
      return(<div style={{marginTop:"0.5rem",paddingTop:"0.5rem",borderTop:"1px solid "+G.border}}>
        <div style={{fontSize:"0.72rem",color:G.gold,marginBottom:"0.35rem"}}>{t("Choose a class")} (Cleric, Druid, {t("or")} Wizard):</div>
        <div style={{display:"flex",gap:"0.3rem",marginBottom:"0.5rem"}}>{MAGIC_INITIATE_CLASSES.map(c=>(<button key={c} disabled={!!miForcedClass} onClick={()=>chooseMiClass(c)} style={{padding:"0.2rem 0.55rem",borderRadius:"0.45rem",fontSize:"0.72rem",border:"1px solid "+(miClassEff===c?G.gold:"#334155"),cursor:miForcedClass?"default":"pointer",background:miClassEff===c?G.gold:"transparent",color:miClassEff===c?"#020817":"#f1f5f9",fontWeight:miClassEff===c?700:400,opacity:miForcedClass&&miClassEff!==c?0.35:1}}>{c}</button>))}</div>
        <div style={{fontSize:"0.72rem",color:G.gold,marginBottom:"0.35rem"}}>{t("Cantrips")} ({miCantrips.length}/2):</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem",marginBottom:"0.5rem"}}>{cantripList.map(name=>{const sel=miCantrips.includes(name);const atMax=miCantrips.length>=2;return <button key={name} disabled={atMax&&!sel} onClick={()=>togMiCantrip(name)} title={spellD(name)?.desc||""} style={{padding:"0.2rem 0.5rem",borderRadius:"0.45rem",fontSize:"0.7rem",border:"1px solid "+(sel?G.gold:"#334155"),cursor:(atMax&&!sel)?"not-allowed":"pointer",opacity:(atMax&&!sel)?0.35:1,background:sel?G.gold:"transparent",color:sel?"#020817":"#f1f5f9",fontWeight:sel?700:400}}>{name}</button>;})}</div>
        <div style={{fontSize:"0.72rem",color:G.gold,marginBottom:"0.35rem"}}>{t("1st-level spell")}:</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>{spellList.map(name=>{const sel=miSpell===name;return <button key={name} onClick={()=>setMiSpell(sel?"":name)} title={spellD(name)?.desc||""} style={{padding:"0.2rem 0.5rem",borderRadius:"0.45rem",fontSize:"0.7rem",border:"1px solid "+(sel?G.gold:"#334155"),cursor:"pointer",background:sel?G.gold:"transparent",color:sel?"#020817":"#f1f5f9",fontWeight:sel?700:400}}>{name}</button>;})}</div>
      </div>);
    };
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
          if(featTab==="Origin"&&featBaseName(name)===featBaseName(bgo.feat))return(<div key={name} style={{borderRadius:"0.65rem",border:"1px solid #14532d",background:"#052e1644",padding:"0.4rem 0.6rem"}}><div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}><span style={{fontSize:"0.68rem",fontWeight:700,color:"#4ade80",border:"1px solid #4ade80",borderRadius:"0.4rem",padding:"0.1rem 0.4rem"}}>{t("Granted")}</span><span style={{fontSize:"0.8rem",fontWeight:600,color:"#4ade80"}}>{bgo.feat}</span></div><div style={{fontSize:"0.72rem",color:G.muted,marginTop:"0.2rem"}}>{featDescL(name,feat.desc)}</div>{name==="Magic Initiate"&&miPicker()}</div>);
          const sel=!!featMap[name];const sugg=suggested.includes(name);const allowed=featAllowed(name);
          return(<div key={name} style={{outline:sugg?"1px solid #fbbf2444":"none",outlineOffset:"-1px",borderRadius:"0.65rem",opacity:allowed?1:0.35,pointerEvents:allowed?"auto":"none"}}>
            <FeatCard name={name} feat={feat} sel={sel} onToggle={()=>allowed&&togFeat(name)}>
              {name==="Skilled"&&sel&&(<div style={{marginTop:"0.5rem",paddingTop:"0.5rem",borderTop:"1px solid "+G.border}}>
                <div style={{fontSize:"0.72rem",color:G.gold,marginBottom:"0.35rem"}}>Choose 3 additional skills ({skilledSkills.length}/3):</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>{SKILL_LIST.map(sk=>{const picked=skilledSkills.includes(sk.name);const alreadyProf=bgo.sk.includes(sk.name)||selSk.includes(sk.name);const atMax=skilledSkills.length>=3;return <button key={sk.name} onClick={()=>setSkilledSkills(prev=>prev.includes(sk.name)?prev.filter(s=>s!==sk.name):prev.length>=3?prev:[...prev,sk.name])} style={{padding:"0.2rem 0.45rem",borderRadius:"0.45rem",fontSize:"0.7rem",border:"1px solid",cursor:(atMax&&!picked)?"not-allowed":"pointer",opacity:(atMax&&!picked)?0.35:1,background:picked?"#fcd34d":"transparent",color:picked?G.bg:alreadyProf?"#94a3b8":"#f1f5f9",borderColor:picked?"#fcd34d":"#334155",fontWeight:picked?700:400}}>{sk.name}{alreadyProf?" *":""}</button>;})}</div>
              </div>)}
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
      <GFld label={t("Species")}><select value={sp} onChange={e=>{setSp(e.target.value);speciesLockedRef.current=true;setSpeciesLocked(true);}} style={inp}>{Object.keys(SPECIES).map(s=><option key={s}>{s}</option>)}</select>{speciesData&&<div style={{marginTop:"0.4rem",background:G.card,borderRadius:"0.65rem",padding:"0.5rem 0.65rem"}}><div style={{fontSize:"0.65rem",color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.3rem",fontWeight:700}}>{t("Species Traits")}</div>{speciesData.traits.map((tr,i)=><div key={i} style={{fontSize:"0.73rem",color:G.muted,marginBottom:"0.2rem"}}>- {CURRENT_LANG==="da"?(TRAIT_DA[tr]||tr):tr}</div>)}</div>}</GFld>
      <GFld label={t("Class")}><select value={cn} onChange={e=>{changeClass(e.target.value);classLockedRef.current=true;setClassLocked(true);}} style={inp}>{Object.keys(CLASSES).map(c=><option key={c}>{c}</option>)}</select>{cls&&<div style={{marginTop:"0.4rem",background:G.card,borderRadius:"0.65rem",padding:"0.5rem 0.65rem"}}><div style={{fontSize:"0.65rem",color:"#60a5fa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.3rem",fontWeight:700}}>{t("Class Features")}</div>{cls.features.map((f,i)=>{const da=CURRENT_LANG==="da";const label=da?(FEATURE_DA[f]||f):f;const d=FEATURE_DESC[f]?.[da?1:0];return <div key={i} style={{fontSize:"0.73rem",color:G.muted,marginBottom:"0.25rem"}}>- <b style={{color:"#cbd5e1"}}>{label}</b>{d?<span style={{color:G.dim}}> — {d}</span>:""}</div>;})}</div>}
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
  </div>);

  const panelContent={overview:buildOverview(),spells:spellsPanel,equipment:<EquipmentPanel cn={cn} dm={dm} sm={sm} pb={pb} equipped={equipped} equipItem={equipItem} gp={gp} setGp={setGp} ac={ac} masteredWeapons={masteredWeapons} setMasteredWeapons={setMasteredWeapons}/>,notes:notesPanel};
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
        </PanelGroup>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        {panelOrder.map(pid=>(<CPanel key={pid} title={panelMeta[pid].title} icon={panelMeta[pid].icon} collapsed={!!collapsed[pid]} onToggle={()=>togCollapsed(pid)} dragging={draggingPanel===pid} onDragStart={()=>onDragStart(pid)} onDrop={()=>onDrop(pid)}>{panelContent[pid]}</CPanel>))}
      </div>
    </div>
  </div>);
}
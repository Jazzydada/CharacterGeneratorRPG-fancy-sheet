import React,{useMemo,useState,useRef,useCallback,useEffect}from"react";
import{Dice5,RotateCcw,Shield,BookOpen,Zap,Printer,ChevronDown,ChevronUp,GripVertical,Package,Lock,Unlock,RefreshCw}from"lucide-react";
import{SDD,trSchool,trCast,trRange,trDur}from"./spells_da.js";
import{FEATURE_DA,TRAIT_DA,TRAIT_DESC,TRAIT_PG,FEATDESC_DA,SUBCLASS_DESC_DA,FEATURE_DESC}from"./sheet_da.js";

import{syncLang,CURRENT_LANG,RULES_VERSION,DA,t,setLang,ABIL_INFO,abilTag,abilDesc,SKILL_DESC,skillDesc,featDescL,spellD,BG_PERSONALITY,getPersonality,SD,maxSpellLevel,WIZARD_SCHOOL,wizSavantBudget,spellsKnown,CANTRIPS_KNOWN,cantripsKnown,PB_COST,PB_BUDGET,pointBuySpent,METAMAGIC_OPTIONS,metamagicKnown,ELDRITCH_INVOCATIONS,INV_KNOWN,invocationsKnown,CLASS_ORDER,defaultOrder,orderOption,orderCantripBonus,orderWisSkills,EXPERTISE_LEVELS,expertiseSlots,featBaseName,MAGIC_INITIATE_CLASSES,DRACONIC_ANCESTRY,GIANT_ANCESTRY,breathWeaponDice,RITUAL_L1,TOOL_LIST,WILD_MAGIC_SURGE,FAMILIAR_FORMS,WILDSHAPE_BEASTS,wildShapeLimit,wildShapeUses,wildShapeKnownForms,pickWildShapeForms,barbarianRage,clericChannelDivinity,paladinChannelDivinity,sorceryPoints,monkFocusPoints,fighterSecondWindUses,monkUnarmoredMovement,bardicInspirationUses,bardicInspirationDie,RESOURCE_DESC,classResource,weaponMasterySlots,STANDARD_LANGUAGES,RARE_LANGUAGES,AB,AB_FULL,SKILL_LIST,SPECIES,MASTERY_SLOTS,MASTERY_DESC,MASTERY_DESC_DA,CLASS_DEFAULTS,CLASSES,BGS,STD,NAMES,pickName,CASTER_TYPE,CTYPE,SAB,MC_SLOTS,calcCasterLevel,calcMulticlassSlots,SS,WD,ARMOR_ITEMS,ARMOR_PROF,WEAPON_PROF,BARD_MARTIAL,ROGUE_MARTIAL,isWeaponProficient,CW,PACK_CONTENTS,expandPacks,repairPackLines,WEAPON_COST,ARMOR_COST,SHIELD_COST,startingGearNames,ADVENTURING_GEAR,COIN_TO_CP,coinsTotalCP,canAffordCost,coinsWithDeltaCP,deductCost,addCost,EQUIP,baseStartingGoldFor,higherLevelGold,ALL_FEATS,ORIGIN_FEATS,SUBCLASSES,SUBCLASS_SPELLS,subclassSpellsAtLevel,SUBCLASS_FEATURES,SUBCLASS_PG,subclassFeaturesAtLevel,CIRCLE_LAND_SPELLS,circleLandSpellsAtLevel,CS,SPELL_LEVEL_INDEX,spellLevelOf,mf,sgn,pbf,avgHp,pick,r4d6,FALLBACK_ORDER,assignByPriority,assignArr,applyBoosts}from"./data/gameData.js";

// ─── Print styles ─────────────────────────────
const PA="#f7f0e0",INK="#1a1008",GOLD="#7a5c1e",GOLD_L="#c9a84c",RULE="#c4a96a";
const capL={fontSize:6.5,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif",display:"block"};
const pgStyle={background:PA,padding:"11mm 10mm 9mm",maxWidth:"210mm",margin:"0 auto",fontFamily:"serif",color:INK,fontSize:9,boxSizing:"border-box",lineHeight:1.4};
const MM_PX=96/25.4;
const PAGE_W_PX=210*MM_PX;
const PAGE_H_PX=297*MM_PX;
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

function FancySheet({sh,totalPages}){
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
      .orn-bg{position:absolute;inset:0;overflow:hidden;background:#e7dcb8;}
      .orn-bg-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;}
      .orn-bg-tint{position:absolute;inset:0;background:rgba(244,224,170,.34);pointer-events:none;}
      .orn-bg:before{content:"";position:absolute;inset:0;background:
        radial-gradient(circle at 52% 42%,rgba(255,253,245,.91) 0 18%,rgba(255,250,235,.34) 32%,rgba(16,10,5,0) 50%),
        radial-gradient(circle at 18% 76%,rgba(255,220,190,.16),transparent 18%),
        linear-gradient(90deg,rgba(8,5,3,.68),rgba(8,5,3,.08) 18%,rgba(8,5,3,.06) 79%,rgba(8,5,3,.72)),
        linear-gradient(rgba(255,246,212,.22),rgba(69,39,12,.42));pointer-events:none;}
      .orn-veil{position:absolute;inset:7mm;z-index:1;border-radius:2mm;background:rgba(248,237,195,.12);pointer-events:none;}
      .orn-bg:after{content:"";position:absolute;inset:5mm;border:1.15mm solid #6b4616;border-radius:3.2mm;box-shadow:inset 0 0 0 .55mm #d9b86a,inset 0 0 0 1.4mm rgba(41,24,5,.38),inset 0 0 24mm rgba(73,42,12,.24),0 0 18mm rgba(0,0,0,.28);pointer-events:none;}
      /* Theming via a colored tint layer (plain background-color) instead of CSS filter:hue-rotate — filter was unreliable in iOS's print pipeline (photo printed fine once it became an <img>, but the theme color was lost), while a flat tint color is the same technique already confirmed to print correctly everywhere. */
      .theme-cleric .orn-bg-tint{background:rgba(255,235,180,.4)}
      .theme-druid .orn-bg-tint{background:rgba(150,195,130,.44)}
      .theme-wizard .orn-bg-tint,.theme-sorcerer .orn-bg-tint,.theme-warlock .orn-bg-tint{background:rgba(120,140,210,.44)}
      .theme-rogue .orn-bg-tint{background:rgba(70,90,120,.5)}
      .theme-fighter .orn-bg-tint,.theme-barbarian .orn-bg-tint,.theme-paladin .orn-bg-tint{background:rgba(220,140,90,.4)}
      .rune-ring{position:absolute;left:46mm;top:35mm;width:128mm;height:128mm;border-radius:50%;border:.35mm dashed rgba(255,225,145,.42);box-shadow:0 0 18mm rgba(255,202,76,.18),inset 0 0 17mm rgba(255,240,180,.18);z-index:1}.rune-ring:before{content:"✦ ✧ ✧ ✦ ✧ ✧ ✦ ✧ ✧ ✦";position:absolute;inset:5mm;border-radius:50%;font-size:5mm;letter-spacing:2mm;color:rgba(61,42,16,.23);display:flex;align-items:center;justify-content:center;transform:rotate(-17deg)}
      .rune-ring:after{content:"";position:absolute;inset:16mm;border-radius:50%;border:.25mm solid rgba(255,236,181,.25);background:conic-gradient(from 20deg,transparent 0 12deg,rgba(255,226,122,.14) 12deg 14deg,transparent 14deg 40deg,rgba(52,35,12,.12) 40deg 42deg,transparent 42deg 100deg);mask:radial-gradient(circle,transparent 0 45%,#000 46% 48%,transparent 49% 100%)}
      .brand{position:absolute;left:13mm;top:2.6mm;font-family:system-ui,sans-serif;font-size:2.2mm;font-weight:900;letter-spacing:.19em;color:#412807;text-transform:uppercase;z-index:8}.brand:after{content:"";display:block;width:54mm;height:.45mm;margin-top:1mm;background:linear-gradient(90deg,#a77922,transparent)}
      .name-plaque{position:absolute;left:11mm;top:10mm;width:64mm;height:21mm;z-index:10;background:linear-gradient(#fff8df,#e5c98d);border:.9mm solid #6c4718;border-radius:2.5mm;box-shadow:0 1.2mm 3.4mm rgba(31,17,3,.35),inset 0 0 0 .6mm rgba(255,255,255,.72)}.name-plaque:before{content:"";position:absolute;inset:-2.7mm -4mm;border-top:.9mm solid #b98a2e;border-bottom:.9mm solid #b98a2e;pointer-events:none}.name-plaque b{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:7.4mm;line-height:.88;letter-spacing:-.035em;text-shadow:0 .25mm 0 #fff4d5}
      .top-scroll{position:absolute;left:82mm;top:8mm;width:116mm;height:28mm;z-index:10;padding:4mm 8mm;background:linear-gradient(90deg,#b9843d 0,#efd6a3 4%,#fff0c7 14%,#f3ddb0 86%,#b9843d 96%,#7b5423 100%);border:.65mm solid rgba(76,48,16,.72);border-radius:1.5mm;box-shadow:0 1mm 4mm rgba(30,16,0,.28),inset 0 0 0 .5mm rgba(255,255,255,.45);display:grid;grid-template-columns:1fr 1fr 1fr;gap:3.2mm 7mm}.top-scroll:before,.top-scroll:after{content:"";position:absolute;top:-2mm;width:7mm;height:32mm;border-radius:4mm;background:linear-gradient(90deg,#583412,#c09559,#5d3713);box-shadow:inset 0 0 0 .7mm rgba(27,14,3,.25)}.top-scroll:before{left:-5mm}.top-scroll:after{right:-5mm}.field .value{font-size:4.35mm;font-weight:900;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.field .label{font:800 1.65mm/1 system-ui,sans-serif;color:#5c3c13;text-transform:uppercase;letter-spacing:.06em;margin-top:.8mm}
      .ribbon{position:absolute;height:8mm;z-index:13;background:linear-gradient(#6a241f,#270c0b);border:.55mm solid #a67c25;color:#f7df93;box-shadow:0 .8mm 2.2mm rgba(21,10,0,.38),inset 0 0 0 .35mm rgba(255,229,120,.28);display:flex;align-items:center;justify-content:center;font:900 2.2mm/1 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase}.ribbon:before,.ribbon:after{content:"";position:absolute;top:1.1mm;border-top:2.9mm solid transparent;border-bottom:2.9mm solid transparent}.ribbon:before{left:-5mm;border-right:5mm solid #5a1b18}.ribbon:after{right:-5mm;border-left:5mm solid #5a1b18}.insp-label{left:15mm;top:38mm;width:31mm}.prof-label{left:51mm;top:38mm;width:32mm;background:linear-gradient(#7a2777,#371337)}.init-label{right:43mm;top:39mm;width:32mm}
      .small-token{position:absolute;background:radial-gradient(circle,#fff9e9 0 48%,#dbc08a 88%);border:.72mm solid rgba(87,57,16,.78);border-radius:50%;box-shadow:0 .9mm 2.4mm rgba(43,26,6,.24),inset 0 0 0 .5mm rgba(255,255,255,.64);display:flex;align-items:center;justify-content:center;flex-direction:column;font-weight:900;z-index:14}.small-token b{font-size:5.2mm;line-height:.85}.small-token span{font:900 1.45mm/1 system-ui,sans-serif;color:#5d3a0e;text-transform:uppercase;margin-top:.5mm;letter-spacing:.03em}.inspiration{left:40mm;top:40mm;width:12.5mm;height:12.5mm}.prof{left:65mm;top:47mm;width:13mm;height:13mm}.init{right:33mm;top:40mm;width:13mm;height:13mm}.ac{right:12mm;top:38mm;width:21mm;height:21mm;padding-top:2mm}.ac b{font-size:8mm;line-height:.8}.ac span{margin-top:1.2mm}.speed{right:20mm;top:167mm;width:27mm;height:11mm;border-radius:2mm}.speed b{font-size:4.5mm}.speed span{font-size:1.55mm}
      .saving-title{position:absolute;left:18mm;top:58mm;width:52mm;height:7mm;z-index:12;background:linear-gradient(#b89138,#5b370d);color:#1b0b00;border:.5mm solid #9d7524;border-radius:5mm;text-align:center;font:900 2.4mm/6mm system-ui,sans-serif;text-transform:uppercase;text-shadow:0 .2mm #efd28c}.save-row{position:absolute;left:12mm;top:66mm;width:61mm;height:14mm;display:flex;gap:1.3mm;z-index:12}.save-gem{flex:1;border:.55mm solid rgba(76,48,16,.74);border-radius:5mm;background:linear-gradient(#fff4d1,#cda66a);text-align:center;padding-top:1mm;box-shadow:inset 0 0 0 .35mm rgba(255,255,255,.55),0 .6mm 1.7mm rgba(40,22,3,.22)}.save-gem b{font-size:3mm;display:block;line-height:1}.save-gem span{font:900 1.55mm/1 system-ui,sans-serif;color:#751d16}.save-gem:nth-child(2) span{color:#0f635e}.save-gem:nth-child(3) span{color:#446221}.save-gem:nth-child(4) span{color:#612b72}.save-gem:nth-child(5) span{color:#163976}.save-gem:nth-child(6) span{color:#80620e}
      .orn-stat{position:absolute;width:24mm;height:24mm;border-radius:50%;background:radial-gradient(circle,#fffaf0 0 44%,#d8b878 76%,#8a611f 100%);border:.9mm solid rgba(88,58,18,.78);box-shadow:0 1mm 3mm rgba(40,23,4,.28),inset 0 0 0 .75mm rgba(255,255,255,.58);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:11}.orn-stat:after{content:"";position:absolute;inset:-2.4mm;border-radius:50%;border:.6mm solid rgba(143,103,35,.62);clip-path:polygon(50% 0,62% 22%,86% 14%,78% 38%,100% 50%,78% 62%,86% 86%,62% 78%,50% 100%,38% 78%,14% 86%,22% 62%,0 50%,22% 38%,14% 14%,38% 22%)}.orn-score{font-size:8.3mm;font-weight:900;line-height:.78}.orn-label{font:900 1.75mm/1 system-ui,sans-serif;letter-spacing:.03em;color:#f7e7b3;background:#25160a;border:.35mm solid #a37a28;padding:.75mm 1.6mm;border-radius:1mm;text-transform:uppercase;margin-top:1mm}.orn-mod{position:absolute;left:-2.2mm;top:-2.2mm;width:8mm;height:8mm;border-radius:50%;background:#fff7dc;border:.52mm solid #84621f;display:flex;align-items:center;justify-content:center;font-size:2.8mm;font-weight:900;z-index:2}.str{left:82mm;top:51mm}.dex{left:111mm;top:43mm}.con{left:143mm;top:52mm}.int{left:172mm;top:72mm}.wis{left:177mm;top:108mm}.cha{left:176mm;top:139mm}
      .portrait-frame{position:absolute;left:72mm;top:67mm;width:72mm;height:126mm;z-index:5;border-radius:42mm 42mm 4mm 4mm;background:linear-gradient(90deg,#5a350e,#d0a243,#5a350e);padding:1.2mm;box-shadow:0 1.8mm 7mm rgba(5,3,1,.52),0 0 20mm rgba(255,205,85,.16)}.portrait-wrap{width:100%;height:100%;border-radius:40mm 40mm 3mm 3mm;overflow:hidden;background:radial-gradient(circle at 50% 15%,#fff9e8,#d9bf87);box-shadow:inset 0 0 7mm rgba(255,255,255,.75)}.portrait-wrap img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;filter:saturate(1.08) contrast(1.04)}.portrait-loading{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:8mm;color:#6b4b16;font-weight:700;font-size:3mm;line-height:1.5;flex-direction:column;gap:3mm}.portrait-fail{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:8mm;color:#6b4b16;font-weight:900;font-size:3.2mm;line-height:1.35}.portrait-blank{height:100%;background:#fff;display:flex;align-items:flex-end;justify-content:center;text-align:center;padding:6mm;color:#c9b489;font-weight:700;font-size:3mm;letter-spacing:.02em}.portrait-cap{position:absolute;left:72mm;top:191mm;width:72mm;height:9mm;background:linear-gradient(90deg,#2a1809,#574015,#2a1809);border:.7mm solid #a47a28;z-index:14;box-shadow:0 .8mm 3mm rgba(29,15,2,.35);border-radius:0 0 3mm 3mm}.portrait-cap:after{content:"✦";position:absolute;left:50%;transform:translateX(-50%);top:-4.5mm;width:10mm;height:10mm;border-radius:50%;background:#271607;color:#47d17b;border:.6mm solid #9e7628;display:flex;align-items:center;justify-content:center;font-size:4mm}
      .panel{position:absolute;z-index:13;background:linear-gradient(rgba(255,244,211,.93),rgba(232,204,146,.88));backdrop-filter:blur(1.1mm);border:.75mm solid rgba(78,50,16,.82);box-shadow:0 1.4mm 5mm rgba(22,13,3,.38),inset 0 0 0 .55mm rgba(255,255,255,.52);border-radius:1.7mm;padding:4mm;overflow:hidden}.panel:before{content:"";position:absolute;inset:1.3mm;border:.35mm solid rgba(150,109,39,.32);pointer-events:none}.panel h2{position:relative;margin:0 0 3mm;text-align:center;font-size:6.2mm;line-height:.9;color:#221004}.skills{left:10mm;top:86mm;width:55mm;height:105mm;overflow:hidden}.skills h2{font-size:7.2mm}.panel table{position:relative;width:100%;border-collapse:collapse}.panel td{border-bottom:.23mm solid rgba(107,75,22,.25);font-size:2.58mm;line-height:1.02;padding:.48mm 0}.panel td:last-child{text-align:right;font-weight:900}.attacks{left:12mm;bottom:14mm;width:61mm;height:68mm;padding-top:10mm;overflow:hidden}.hp{left:77mm;bottom:14mm;width:56mm;height:68mm;text-align:center;padding:9mm 3.5mm 3mm;overflow:visible;display:flex;flex-direction:column;}.traits{right:12mm;bottom:14mm;width:60mm;height:68mm;padding-top:11mm;overflow:hidden}.panel-titlebar{position:absolute;left:-.8mm;right:-.8mm;top:-.8mm;height:8mm;background:linear-gradient(#2d1d0e,#0f0905);color:#f2d68b;border:.6mm solid #9f7627;box-shadow:inset 0 0 0 .35mm rgba(255,224,133,.25);z-index:2;display:flex;align-items:center;justify-content:center;font:900 3.35mm/1 Georgia,serif;text-shadow:0 .4mm #000}.panel-titlebar.gold{background:linear-gradient(#5b3b12,#1b1005)}.attack-row{position:relative;display:grid;grid-template-columns:1fr 8mm 15mm;gap:1mm;border-bottom:.25mm solid rgba(107,75,22,.27);padding:0.9mm 0;font-size:2.5mm;line-height:1.15;align-items:start}.attack-row b{font-size:2.6mm}.hp-top{display:grid;grid-template-columns:1fr 1fr;gap:1.5mm 3mm;align-items:center;border-bottom:.4mm solid rgba(107,75,22,.35);padding-bottom:2mm;margin-bottom:2mm;flex-shrink:0}.hp-num{font-size:11mm;font-weight:900;line-height:.85;text-align:right}.hp-lab{font:800 1.7mm/1.2 system-ui,sans-serif;text-transform:uppercase;color:#6e4a17}.hp-current{flex:1;min-height:11mm;border-bottom:.5mm solid rgba(107,75,22,.42);display:flex;align-items:center;justify-content:center;color:rgba(70,43,16,.18);font-size:5.5mm;font-weight:900;margin-bottom:2mm}.death{display:flex;justify-content:center;gap:3.5mm;flex-shrink:0;padding-bottom:1mm}.death span{width:4mm;height:4mm;border-radius:50%;border:.5mm solid #7b5118;background:#fff4d3;display:inline-block;margin:0 .4mm}.traits li{position:relative;font-size:2.72mm;line-height:1.08;margin-bottom:.95mm;break-inside:avoid;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.traits ul{position:relative;margin:0;padding-left:4.2mm}.langs{position:absolute;left:9mm;right:9mm;bottom:2mm;height:6mm;background:linear-gradient(90deg,rgba(30,14,2,.92),rgba(60,34,8,.92),rgba(30,14,2,.92));border-top:.55mm solid #9d7524;display:flex;align-items:center;justify-content:center;font-size:2.85mm;color:#f2d68b;z-index:15;padding:0 8mm;letter-spacing:.03em;text-align:center;box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-radius:0 0 2mm 2mm}.subtle-caption{font:800 1.7mm/1 system-ui,sans-serif;color:#6e4a17;text-transform:uppercase;letter-spacing:.08em}.left-sword{position:absolute;left:2.8mm;bottom:19mm;width:7mm;height:78mm;background:linear-gradient(90deg,#411b07,#d09b32,#3d1905);border-radius:3mm;z-index:12;box-shadow:0 0 5mm rgba(255,55,155,.5)}.left-sword:before{content:"";position:absolute;left:1.9mm;top:-14mm;border-left:1.7mm solid transparent;border-right:1.7mm solid transparent;border-bottom:16mm solid #e7c071}.dragon-mark{position:absolute;left:70mm;top:39mm;font-size:38mm;color:rgba(90,50,7,.32);z-index:2;transform:rotate(-10deg)}
      @media print{
        .ornate-sheet{margin:0!important;box-shadow:none!important}
        .portrait-wrap img{display:block!important}
        /* PDF viewers (Preview/Adobe) render glows, clip-path and masks as black boxes — drop them for print */
        .ornate-sheet *{box-shadow:none!important}
        .orn-stat:after,.rune-ring:after,.rune-ring:before{display:none!important}
        /* Some PDF renderers (Preview/Adobe) show a visible seam through CSS gradients (background bleeds through); force flat opaque fills for print on every gradient-backed element */
        .orn-stat{background:#e9d09c!important}
        .name-plaque{background:#efdcb0!important}
        .top-scroll{background:#dcb87c!important}
        .ribbon{background:#3d140f!important}
        .prof-label{background:#551f56!important}
        .small-token{background:#e9d3a0!important}
        .saving-title{background:#835222!important}
        .save-gem{background:#e0bd8c!important}
        .portrait-frame{background:#8a6323!important}
        .portrait-wrap{background:#e9d3a0!important}
        .portrait-cap{background:#3d2810!important}
        .panel{background:#f0e0bd!important;backdrop-filter:none!important}
        .panel-titlebar{background:#1c1208!important}
        .langs{background:#241207!important}
      }
      /* The background photo used to be a CSS background-image, which iOS's print/PDF pipeline (same WebKit engine in both Safari and Chrome on iPad) failed to render, leaving the .orn-bg:before radial-gradient highlight stranded alone as a stark white blob. It's now a real <img> tag instead — <img> elements were confirmed to print fine on iPad (the portrait already did) — so this override just keeps a flat safe fallback fill behind the photo on touch devices in case it still doesn't load, without hiding the highlight or disabling the theme filter anymore. */
      @media print and (pointer: coarse){
        .orn-bg{background:#e7dcb8!important}
      }
    `}</style>
    <div className="orn-bg"><img className="orn-bg-photo" src="/fantasy-sheet-bg.jpg" alt=""/><div className="orn-bg-tint"/></div><div className="orn-veil"/><div className="rune-ring"/><div className="dragon-mark">☽</div><div className="left-sword"/>
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

    <div className="portrait-frame"><div className="portrait-wrap">{sh.portraitMode==="blank"?<div className="portrait-blank">{t("Draw your portrait here")}</div>:sh.portraitMode==="upload"?(sh.uploadedPortrait?<img src={sh.uploadedPortrait} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>:<div className="portrait-blank">{t("No image uploaded")}</div>):<>{portraitFailed?<div className="portrait-fail">{t("Portrait could not load.")}<br/>{t("Try Generate Sheet again.")}</div>:portraitLoading?<div className="portrait-loading"><span style={{fontSize:"6mm"}}>🎨</span><span>{t("Painting portrait…")}</span></div>:null}{!portraitFailed&&<img src={portrait} onLoad={()=>setPortraitLoading(false)} onError={()=>{setPortraitFailed(true);setPortraitLoading(false);}} style={{display:portraitLoading?"none":"block",width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",filter:"saturate(1.08) contrast(1.04)"}}/>}</>}</div></div><div className="portrait-cap"/>

    <div className="panel skills"><h2>{t("Skills")}</h2><table><tbody>{skillRows.map(sk=><tr key={sk.name}><td>{(sh.expertise||[]).includes(sk.name)?"◉":sh.skills?.includes(sk.name)?"●":"○"} {sk.name} ({sk.ab})</td><td>{skillBonus(sk)}</td></tr>)}</tbody></table><div style={{position:"relative",marginTop:"2mm",paddingTop:"1.5mm",borderTop:".3mm solid rgba(107,75,22,.35)",fontSize:"2.55mm"}}>{t("Passive Perception")} <b style={{float:"right"}}>{sh.passivePerc}</b></div></div>

    <div className="panel attacks"><div className="panel-titlebar">{t("Attacks & Spellcasting")}</div>{sh.equippedGear&&<div style={{position:"relative",fontSize:"2.1mm",color:"#6e4a17",marginBottom:"0.6mm",paddingBottom:"0.6mm",borderBottom:".25mm solid rgba(107,75,22,.3)"}}>{t("Equipped")}: {sh.equippedGear}</div>}{sh.acBreakdown&&<div style={{position:"relative",fontSize:"2mm",color:"#6e4a17",marginBottom:"0.8mm",paddingBottom:"0.6mm",borderBottom:".25mm solid rgba(107,75,22,.3)"}}>{t("AC")} {sh.ac}: {sh.acBreakdown}</div>}<div style={{position:"relative",fontSize:"2mm",color:"#6e4a17",marginBottom:"0.8mm",paddingBottom:"0.6mm",borderBottom:".25mm solid rgba(107,75,22,.3)"}}>{t("Grapple/Escape DC")}: {8+statMod("STR")+(sh.profBonus||0)}</div>{!!sh.sneakAttackDice&&<div style={{position:"relative",fontSize:"2mm",color:"#6e4a17",marginBottom:"0.8mm",paddingBottom:"0.6mm",borderBottom:".25mm solid rgba(107,75,22,.3)"}}><b>{t("Sneak Attack")}</b>: {sh.sneakAttackDice}d6</div>}{weaponRows.map((w,i)=>{const showMastery=w.masteredActive&&w.mastery!=="—";const DA=CURRENT_LANG==="da";return <div key={i}>
        <div className="attack-row" style={{borderBottom:showMastery?"none":undefined}}><b>{w.name}</b><span>{w.atk}</span><span>{w.dmg}</span></div>
        {showMastery&&<div style={{position:"relative",fontSize:"1.7mm",lineHeight:1.25,color:"#6e4a17",borderBottom:".25mm solid rgba(107,75,22,.27)",paddingBottom:"0.6mm",marginBottom:"0.6mm"}}><b style={{fontWeight:700,color:"#7c2d12",fontStyle:"normal"}}>{w.mastery}:</b> <span style={{fontStyle:"italic"}}>{(DA?MASTERY_DESC_DA[w.mastery]:MASTERY_DESC[w.mastery])||""}</span></div>}
      </div>;})}
    </div>

    <div className="panel hp"><div className="panel-titlebar gold">{t("Hit Points")}</div><div className="hp-top"><div><div className="hp-lab">{t("Hit Dice")}</div><div style={{fontSize:"4.2mm",fontWeight:900,marginTop:"0.5mm"}}>{sh.hitDice}</div></div><div><div className="hp-lab">{t("HP Max")}</div><div className="hp-num">{sh.hpMax}</div></div></div><div className="hp-current">{t("CURRENT HP")}</div><div className="death"><div style={{textAlign:"center"}}><div className="subtle-caption" style={{marginBottom:"1.5mm"}}>{t("Successes")}</div><div><span/><span/><span/></div></div><div style={{textAlign:"center"}}><div className="subtle-caption" style={{marginBottom:"1.5mm"}}>{t("Failures")}</div><div><span/><span/><span/></div></div></div></div>

    <div className="panel traits"><div className="panel-titlebar">{t("Resources")}</div>
      {(()=>{const resList=[sh.resource,sh.resource2].filter(Boolean);if(!resList.length)return <div style={{position:"relative",fontSize:"2.6mm",fontStyle:"italic",color:"#6e4a17",marginTop:"2mm"}}>{t("No tracked resource pool")}</div>;
        return resList.map((r,i)=><div key={r.name} style={{position:"relative",marginTop:i?"0.8mm":"0.8mm",paddingTop:i?"0.7mm":0,borderTop:i?".25mm solid rgba(107,75,22,.3)":"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}><b style={{fontSize:"2.9mm"}}>{r.name}</b>{r.note&&<span style={{fontSize:"2mm",color:"#6e4a17"}}>{r.note}</span>}</div>
          {r.desc&&<div style={{fontSize:"1.75mm",lineHeight:1.2,color:"#4a3410",marginTop:"0.6mm"}}>{r.desc[CURRENT_LANG==="da"?1:0]}</div>}
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.8mm",marginTop:"1mm"}}>{Array.from({length:Math.min(r.uses,24)}).map((_,j)=><span key={j} style={{width:"3mm",height:"3mm",borderRadius:"50%",border:".45mm solid #7b5118",background:"#fff4d3",display:"inline-block"}}/>)}</div>
          <div style={{fontSize:"1.9mm",color:"#6e4a17",marginTop:"1mm"}}>{r.recharge}</div>
        </div>);})()}
      <div style={{position:"relative",marginTop:"1mm",paddingTop:"0.9mm",borderTop:".3mm solid rgba(107,75,22,.35)"}}>
        <div className="subtle-caption" style={{marginBottom:"0.7mm",fontSize:"1.5mm"}}>{t("Other Notes")}</div>
        <ul style={{margin:0,padding:"0 0 0 3.6mm"}}>{(sh.features||"").split("\n").filter(l=>/^(Second Wind|Action Surge|Ki|Superiority Dice|Psionic|Metamagic|Weapon Mastery)/i.test(l.trim())).filter(l=>{const t2=l.trim().toLowerCase();return(!sh.resource||!t2.startsWith(sh.resource.name.toLowerCase()))&&(!sh.resource2||!t2.startsWith(sh.resource2.name.toLowerCase()));}).slice(0,sh.resource2?1:2).map((line,i)=><li key={i} style={{fontSize:"1.9mm",lineHeight:1.15,marginBottom:"0.5mm"}}>{line.length>70?line.slice(0,70)+"…":line}</li>)}</ul>
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
        <div style={{background:"#fff",border:"1px solid "+RULE,borderRadius:4,padding:"5px 7px"}}><div style={{fontSize:7,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700,color:GOLD,fontFamily:"sans-serif",textAlign:"center",borderBottom:"0.5px solid "+RULE,marginBottom:4,paddingBottom:2}}>Currency</div><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:3,textAlign:"center"}}>{[["cp","CP","#b87333"],["sp","SP","#aaa"],["ep","EP","#8fbc8f"],["gp","GP","#d4af37"],["pp","PP","#e5e4e2"]].map(([k,l,c])=><div key={l} style={{textAlign:"center"}}><div style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid "+RULE,background:c+"22",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,color:INK}}>{(sh.coins&&sh.coins[k])||0}</div><div style={{...capL,textAlign:"center",marginTop:4,fontSize:6}}>{l}</div></div>)}</div></div>
        <PSec title="Equipment" style={{flex:1}}><div style={{fontSize:7,whiteSpace:"pre-wrap",lineHeight:1.5,fontFamily:"sans-serif"}}>{equipment}</div></PSec>
      </div>
    </div>
    <div style={{marginTop:7,borderTop:"0.5px solid "+RULE,paddingTop:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>D&D 2024 SRD 5.2</span><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>Page 1 of {totalPages||(sh.isCaster?2:1)}</span></div>
  </div>);
}

function Page2({sh,totalPages}){
  const{name,classLevel,spellAbility,spellAtk,spellDC,spellSlots,spellsByLevel,isCaster}=sh;
  const LVLL=["Cantrips","1st","2nd","3rd","4th","5th","6th","7th","8th","9th"];
  // Parse the features text into readable entries (bold the label before the colon).
  const featEntries=(sh.features||"").split("\n").map(l=>l.trim()).filter(l=>l&&l!=="--");
  const DAMAGE_RE=/\d+d\d+|\bdamage\b|\bskade\b/i;
  const ALWAYS_CARD_SECTIONS=/^(Metamagic|Eldritch Invocations):$/;
  const cardEntries=[],textEntries=[];
  let forceCard=false;
  featEntries.forEach(line=>{
    const ci=line.indexOf(":");
    const isHead=/^[A-Z].*:$/.test(line)&&line.length<40;
    if(isHead){textEntries.push(line);forceCard=ALWAYS_CARD_SECTIONS.test(line);return;}
    const rest=ci>0?line.slice(ci+1):"";
    (forceCard||DAMAGE_RE.test(rest)?cardEntries:textEntries).push(line);
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
    {LVLL.map((lvl,li)=>{const spells=spellsByLevel[li]||[];if(!spells.length)return null;return <div key={lvl} style={{marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif",whiteSpace:"nowrap"}}>{lvl}</div>{li>0&&<div style={{...capL,fontSize:6,marginBottom:0}}>{spellSlots[li-1]||0} slots</div>}<div style={{flex:1,height:"0.5px",background:RULE}}/></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:5}}>{spells.map((sp,i)=><div key={i} style={{background:sp.source?"#fff8e6":"#fff",border:"1px solid "+(sp.source?"#d4a017":RULE),borderRadius:4,padding:"5px 6px"}}><div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:2,flexWrap:"wrap"}}><span style={{fontSize:8.5,fontWeight:700,fontFamily:"serif",lineHeight:1.2}}>{sp.name}</span>{sp.conc&&<span style={{fontSize:5.5,fontWeight:700,color:"#7c2d12",border:"0.5px solid #7c2d12",borderRadius:2,padding:"0 2px",whiteSpace:"nowrap"}}>C</span>}{sp.source&&<span style={{fontSize:5,fontWeight:700,color:"#8a5a00",border:"0.5px solid #d4a017",borderRadius:2,padding:"0 3px",whiteSpace:"nowrap",textTransform:"uppercase",letterSpacing:"0.03em"}}>{sp.source}</span>}</div>{sp.sc&&<div style={{fontSize:5.5,fontWeight:700,color:"#8a5a2b",fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:1}}>{CURRENT_LANG==="da"?trSchool(sp.sc):sp.sc}</div>}<div style={{fontSize:6,color:"#666",fontFamily:"sans-serif",lineHeight:1.4,marginBottom:2}}>{[sp.cast,sp.range,sp.dur,sp.comp].filter(Boolean).join(" · ")}</div><div style={{fontSize:7,lineHeight:1.55,color:"#333",fontFamily:"sans-serif"}}>{sp.desc}</div>{sp.pg&&<div style={{fontSize:5.5,color:"#999",fontFamily:"sans-serif",marginTop:2}}>PHB p.{sp.pg}</div>}</div>)}</div></div>;})}
    </div>}
    <div style={{flex:"1 1 0",minHeight:0,display:"flex",flexDirection:"column",marginTop:2}}>
      <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif",marginBottom:4,flex:"0 0 auto"}}>{t("Backstory")}</div>
      <div style={{flex:1,minHeight:0,overflow:"hidden",border:"1px solid "+RULE,borderRadius:4,padding:"6px 8px",background:"#fff"}}>
        <div style={{fontSize:7.6,lineHeight:1.6,fontFamily:"sans-serif",color:"#222",whiteSpace:"pre-wrap"}}>{sh.backstory||""}</div>
        {!sh.backstory&&<div>{Array.from({length:8}).map((_,i)=><div key={i} style={{borderBottom:"0.5px dashed #ddd",height:"5.5mm"}}/>)}</div>}
      </div>
    </div>
    <div style={{flex:"0 0 auto",marginTop:5,borderTop:"0.5px solid "+RULE,paddingTop:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>D&D 2024 SRD 5.2</span><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>Page 2 of {totalPages||(sh.subclass==="Wild Magic Sorcery"?4:3)}</span></div>
  </div>);
}

const CREATURE_ABBR=["STR","DEX","CON","INT","WIS","CHA"];
function CreatureCard({name,b,compact}){
  if(!b)return null;
  return(<div style={{background:"#fff",border:"1px solid "+RULE,borderRadius:5,padding:compact?"4px 6px":"6px 8px",breakInside:"avoid"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderBottom:"0.5px solid "+RULE,paddingBottom:2,marginBottom:compact?2:3}}>
      <span style={{fontSize:compact?8.5:10,fontWeight:700,fontFamily:"serif"}}>{name}</span>
      <span style={{fontSize:6,color:"#666",fontFamily:"sans-serif"}}>CR {b.cr}</span>
    </div>
    <div style={{fontSize:compact?6.2:7,fontFamily:"sans-serif",color:"#333",marginBottom:2}}>
      <b>AC</b> {b.ac} · <b>HP</b> {b.hp} · <b>{t("Speed")}</b> {b.speed}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:2,textAlign:"center",marginBottom:compact?2:3,background:"#f7f3e8",borderRadius:3,padding:"2px 0"}}>
      {CREATURE_ABBR.map((ab,i)=><div key={ab}><div style={{fontSize:5,color:GOLD,fontWeight:700}}>{ab}</div><div style={{fontSize:compact?6:7,fontWeight:700}}>{b.stats[i]}</div><div style={{fontSize:5,color:"#666"}}>{sgn(mf(b.stats[i]))}</div></div>)}
    </div>
    <div style={{fontSize:compact?5.8:6.6,fontFamily:"sans-serif",color:"#333",lineHeight:1.4}}>
      {b.skills&&<div><b>{t("Skills")}:</b> {b.skills}</div>}
      {b.resist&&<div><b>Resistances:</b> {b.resist}</div>}
      <div><b>{t("Senses")}:</b> {b.senses}</div>
      {!compact&&<div><b>{t("Languages")}:</b> {b.lang}</div>}
    </div>
    {b.traits.length>0&&<div style={{marginTop:compact?2:3}}>{(compact?b.traits.slice(0,1):b.traits).map(([tn,td])=><div key={tn} style={{fontSize:compact?6:6.8,fontFamily:"sans-serif",color:"#222",lineHeight:1.35,marginBottom:2}}><b style={{fontStyle:"italic"}}>{tn}.</b> {td}</div>)}</div>}
    <div style={{fontSize:compact?6:6.8,fontFamily:"sans-serif",color:"#222",lineHeight:1.35,marginTop:compact?2:3,paddingTop:2,borderTop:"0.5px solid "+RULE}}><b>{t("Attack")}:</b> {b.atk}</div>
  </div>);
}

function parsePackLine(line){
  const m=/^(.+?)\s*\((.+)\)$/.exec(line.trim());
  if(!m)return null;
  const base=m[1].replace(/'/g,"");
  if(!PACK_CONTENTS[base])return null;
  return{name:m[1],contents:m[2].split(", ")};
}
function Page3({sh,forms,totalPages}){
  const invLines=(sh.inventory||"").split("\n").filter(Boolean);
  const packLines=[],normalLines=[];
  invLines.forEach(l=>{const p=parsePackLine(l);if(p)packLines.push(p);else normalLines.push(l);});
  return(<div className="page" style={{...pgStyle,width:"210mm",height:"297mm",display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{flex:"0 0 auto",display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:"1.5px solid "+GOLD_L,paddingBottom:5,marginBottom:8}}>
      <div><div style={{fontSize:16,fontWeight:700,fontFamily:"serif"}}>{sh.name}</div><div style={{...capL,fontSize:6}}>{sh.classLevel} - {forms.length?t("Creature Forms")+" & "+t("Inventory"):t("Inventory")}</div></div>
    </div>
    <div style={{flex:"0 0 auto",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}><span style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:GOLD,fontFamily:"sans-serif"}}>{t("Inventory")}</span><span style={{fontSize:8,fontWeight:700,fontFamily:"serif"}}>{(()=>{const c=sh.coins||{};const parts=[["pp","PP"],["gp","GP"],["ep","EP"],["sp","SP"],["cp","CP"]].filter(([k])=>c[k]).map(([k,l])=>c[k]+" "+l);return parts.length?parts.join(" "):"0 GP";})()}</span></div>
      <div style={{border:"1px solid "+RULE,borderRadius:4,padding:"6px 8px",background:"#fff",height:forms.length?"55mm":"110mm",overflow:"hidden",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{fontSize:8,lineHeight:1.7,fontFamily:"sans-serif",color:"#222"}}>
          {normalLines.map((it,i)=><div key={i} style={{breakInside:"avoid"}}>• {it}</div>)}
          {Array.from({length:forms.length?4:10}).map((_,i)=><div key={"blank"+i} style={{breakInside:"avoid",borderBottom:"0.5px dashed #ccc",height:"5.5mm"}}/>)}
        </div>
        <div style={{fontSize:7.4,lineHeight:1.5,fontFamily:"sans-serif",color:"#222"}}>
          {packLines.map((p,i)=><div key={i} style={{marginBottom:4,breakInside:"avoid"}}>
            <div style={{fontWeight:700,color:"#a37a1c"}}>{p.name}</div>
            {p.contents.map((c,j)=><div key={j} style={{paddingLeft:5}}>✓ {c}</div>)}
          </div>)}
        </div>
      </div>
    </div>
    {forms.length>0&&<div style={{flex:"1 1 0",minHeight:0,overflow:"hidden",display:"grid",gridTemplateColumns:forms.length>2?"1fr 1fr":"1fr",gridAutoRows:"min-content",gap:7,alignContent:"start"}}>
      {forms.map(name=><CreatureCard key={name} name={name} b={WILDSHAPE_BEASTS[name]}/>)}
    </div>}
    <div style={{flex:"0 0 auto",marginTop:5,borderTop:"0.5px solid "+RULE,paddingTop:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>D&D 2024 SRD 5.2</span><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>Page 3 of {totalPages||(sh.subclass==="Wild Magic Sorcery"?4:3)}</span></div>
  </div>);
}

function FormsPage({sh,forms,pageNum,totalPages}){
  return(<div className="page" style={{...pgStyle,width:"210mm",height:"297mm",display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{flex:"0 0 auto",display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:"1.5px solid "+GOLD_L,paddingBottom:5,marginBottom:8}}>
      <div><div style={{fontSize:16,fontWeight:700,fontFamily:"serif"}}>{sh.name}</div><div style={{...capL,fontSize:6}}>{sh.classLevel} - {t("Creature Forms")}</div></div>
    </div>
    <div style={{flex:"1 1 0",minHeight:0,overflow:"hidden",display:"grid",gridTemplateColumns:forms.length>6?"1fr 1fr 1fr":"1fr 1fr",gridAutoRows:"min-content",gap:5,alignContent:"start"}}>
      {forms.map(name=><CreatureCard key={name} name={name} b={WILDSHAPE_BEASTS[name]} compact={forms.length>6}/>)}
    </div>
    <div style={{flex:"0 0 auto",marginTop:5,borderTop:"0.5px solid "+RULE,paddingTop:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>D&D 2024 SRD 5.2</span><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>Page {pageNum} of {totalPages}</span></div>
  </div>);
}

function Page4({sh,pageNum,totalPages}){
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
    <div style={{flex:"0 0 auto",marginTop:5,borderTop:"0.5px solid "+RULE,paddingTop:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>D&D 2024 SRD 5.2, p.150</span><span style={{fontSize:6,color:GOLD,fontFamily:"sans-serif"}}>Page {pageNum||4} of {totalPages||4}</span></div>
  </div>);
}

// ─── UI ───────────────────────────────────────
const G={gold:"#fcd34d",bg:"#020817",card:"#0f172a",border:"#1e293b",muted:"#94a3b8",dim:"#64748b",dimmer:"#475569"};
const inp={width:"100%",background:"transparent",border:"1px solid #334155",color:"#f1f5f9",borderRadius:"0.75rem",padding:"0.5rem 0.75rem",outline:"none",boxSizing:"border-box",fontFamily:"inherit",fontSize:"0.875rem"};
  const CAT_LABEL_COLOR={Origin:"#fbbf24",General:G.muted,"Fighting Style":"#f97316","Epic Boon":"#ef4444",Species:"#a78bfa",Class:"#60a5fa"};
const tabSt=(active,ac="#fcd34d",at="#020817")=>({padding:"0.25rem 0.65rem",borderRadius:"0.6rem",fontSize:"0.75rem",border:"1px solid "+(active?ac:"#334155"),cursor:"pointer",fontWeight:active?700:400,background:active?ac:"transparent",color:active?at:"#f1f5f9"});
function GFld({label,children}){return <div style={{marginBottom:"0.85rem"}}><div style={{fontSize:"0.75rem",color:G.muted,marginBottom:"0.3rem"}}>{label}</div>{children}</div>;}
function GBtn({onClick,children,gold,amber,small}){return <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:small?"0.3rem 0.65rem":"0.5rem 1rem",borderRadius:"0.75rem",border:"1px solid #334155",cursor:"pointer",fontWeight:600,fontSize:small?"0.75rem":"0.85rem",background:gold?G.gold:amber?"#7a5c1e":"transparent",color:gold?G.bg:amber?"#f7f0e0":"#f1f5f9"}}>{children}</button>;}

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
        <div><div style={{fontWeight:800,fontSize:"1.05rem",color:"#f1f5f9"}}>{name}</div>{d.sc&&<div style={{fontSize:"0.7rem",color:"#fcd34d",marginTop:"0.15rem",textTransform:"uppercase"}}>{CURRENT_LANG==="da"?trSchool(d.sc):d.sc}</div>}</div>
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
  const packItems=PACK_CONTENTS[item];
  return <div style={{padding:"3px 6px",borderRadius:6,background:isEq?"#14532d22":"transparent",border:"1px solid "+(isEq?"#4ade8044":G.border),marginBottom:3}}>
    <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{flex:1,fontSize:"0.82rem",color:"#e2e8f0"}}>{item}</span>{canEquip&&<button onClick={onEquip} style={{padding:"0.15rem 0.5rem",borderRadius:"0.4rem",fontSize:"0.7rem",border:"1px solid",cursor:"pointer",fontWeight:600,background:isEq?"#14532d":"transparent",color:isEq?"#4ade80":G.dim,borderColor:isEq?"#4ade80":"#334155",whiteSpace:"nowrap"}}>{isEq?"Unequip":"Equip"}</button>}</div>
    {packItems&&<div style={{fontSize:"0.68rem",color:G.dimmer,marginTop:2}}>{packItems.join(", ")}</div>}
  </div>;
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
        {feat.pg&&<div style={{fontSize:"0.62rem",color:G.dimmer,marginTop:"2px"}}>PHB p.{feat.pg}</div>}
      </div>
    </div>
    {children}
  </div>);
}

function EquipmentPanel({cn,level,dm,sm,pb,equipped,equipItem,coins,setCoins,ac,masteredWeapons,setMasteredWeapons,selWeapons,setSelWeapons,inventory,setInventory,purchases,setPurchases,ownedExtra,setOwnedExtra}){
  const [gearSearch,setGearSearch]=useState("");
  const startingSet=startingGearNames(cn);
  const isOwned=name=>startingSet.has(name)||ownedExtra.includes(name);
  function buyGear(name,weight,amt,denom){
    if(!canAffordCost(coins,amt,denom))return;
    setCoins(c=>deductCost(c,amt,denom));
    const line=PACK_CONTENTS[name.replace(/'/g,"")]?name+" ("+PACK_CONTENTS[name.replace(/'/g,"")].join(", ")+")":name;
    const bulletLine="• "+line;
    setInventory(prev=>(prev?prev+"\n":"")+bulletLine);
    setPurchases(prev=>[...prev,{id:Date.now()+"-"+Math.random(),name,weight,amt,denom,line:bulletLine}]);
  }
  function buyEquipItem(name,amt,denom,kind){
    if(!canAffordCost(coins,amt,denom))return;
    setCoins(c=>deductCost(c,amt,denom));
    const bulletLine="• "+name;
    setInventory(prev=>(prev?prev+"\n":"")+bulletLine);
    setOwnedExtra(prev=>[...prev,name]);
    setPurchases(prev=>[...prev,{id:Date.now()+"-"+Math.random(),name,weight:null,amt,denom,line:bulletLine,kind}]);
  }
  function undoPurchase(p){
    setCoins(c=>addCost(c,p.amt,p.denom));
    setInventory(prev=>{
      const lines=(prev||"").split("\n");
      const idx=lines.lastIndexOf(p.line);
      if(idx===-1)return prev;
      lines.splice(idx,1);
      return lines.join("\n");
    });
    if(p.kind){
      setOwnedExtra(prev=>prev.filter(x=>x!==p.name));
      if(p.kind==="weapon"&&equipped.weapon===p.name)equipItem(p.name);
      if(p.kind==="armor"&&equipped.armor===p.name)equipItem(p.name);
      if(p.kind==="shield"&&equipped.shield)equipItem("Shield");
    }
    setPurchases(prev=>prev.filter(x=>x.id!==p.id));
  }
  const [eqTab,setEqTab]=useState("weapons");
  const [eqSearch,setEqSearch]=useState("");
  const [showNonProf,setShowNonProf]=useState(false);
  const armorProfs=ARMOR_PROF[cn]||[];
  const weapProfs=WEAPON_PROF[cn]||[];
  const canUseArmor=name=>{const a=ARMOR_ITEMS[name];if(!a)return false;if(a.light)return armorProfs.includes("light");if(a.medium)return armorProfs.includes("medium");if(a.heavy)return armorProfs.includes("heavy");return false;};
  const canUseWeapon=name=>isWeaponProficient(weapProfs,name);
  const q=eqSearch.toLowerCase();
  const weaponRows=Object.entries(WD).filter(([n])=>n!=="Unarmed strike").filter(([n])=>{if(q&&!n.toLowerCase().includes(q))return false;if(!showNonProf&&!canUseWeapon(n))return false;return true;}).map(([wn,w])=>{
    const isProf=canUseWeapon(wn);const am=w.ab==="fin"?(dm>=sm?dm:sm):w.ab==="DEX"?dm:sm;const bonus=isProf?am+pb:am;const isEq=equipped.weapon===wn;const inAttacks=selWeapons.includes(wn);
    const owned=isOwned(wn)||!WEAPON_COST[wn];const cost=WEAPON_COST[wn];const afford=cost&&canAffordCost(coins,cost[0],cost[1]);
    return(<div key={wn} style={{display:"grid",gridTemplateColumns:"1fr 52px 64px 60px 70px 60px 64px",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:7,background:isEq?"#14532d22":"transparent",border:"1px solid "+(isEq?"#4ade8044":G.border),marginBottom:4}}>
      <div><span style={{fontSize:"0.82rem",color:isEq?"#4ade80":"#e2e8f0",fontWeight:isEq?700:400}}>{wn}</span>{isProf?<span style={{fontSize:"0.6rem",color:"#4ade80",marginLeft:5,border:"1px solid #4ade80",borderRadius:3,padding:"0 3px",fontWeight:700}}>prof</span>:<span style={{fontSize:"0.6rem",color:"#f87171",marginLeft:5,border:"1px solid #f87171",borderRadius:3,padding:"0 3px"}}>non-prof</span>}<div style={{fontSize:"0.65rem",color:G.dimmer,marginTop:1}}>{w.pr}</div></div>
      <span style={{fontSize:"0.9rem",fontWeight:800,color:G.gold,textAlign:"center"}}>{sgn(bonus)}</span>
      <span style={{fontSize:"0.78rem",color:G.muted,textAlign:"center"}}>{w.dmg}</span>
      <span style={{fontSize:"0.65rem",color:G.dimmer,textAlign:"center",textTransform:"uppercase",letterSpacing:"0.05em"}}>{w.type}</span>
      <div style={{textAlign:"center"}}>              {masteredWeapons.includes(wn)&&w.mastery!=="—"
                ?<span style={{display:"inline-flex",alignItems:"center",gap:"0.35rem"}}><span style={{fontSize:"0.55rem",fontWeight:900,padding:"0.1rem 0.28rem",borderRadius:"0.35rem",background:"#14532d",color:"#4ade80",border:"1px solid #4ade80",letterSpacing:"0.05em"}}>VM</span><span style={{color:"#4ade80"}}><MasteryBtn name={w.mastery}/></span></span>
                :<span style={{fontSize:"0.75rem",color:G.dimmer}}>—</span>
              }</div>
      <div style={{textAlign:"center"}}><input type="checkbox" title={t("Show this weapon under Attacks & Spellcasting")} checked={inAttacks} onChange={()=>setSelWeapons(prev=>prev.includes(wn)?prev.filter(x=>x!==wn):[...prev,wn])} style={{accentColor:G.gold,width:15,height:15,cursor:"pointer"}}/></div>
      {owned?<button onClick={()=>equipItem(wn)} style={{padding:"0.2rem 0.4rem",borderRadius:"0.4rem",fontSize:"0.7rem",border:"1px solid",cursor:"pointer",fontWeight:600,background:isEq?"#14532d":"transparent",color:isEq?"#4ade80":G.dim,borderColor:isEq?"#4ade80":"#334155"}}>{isEq?"Unequip":"Equip"}</button>:
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.15rem"}}><span style={{fontSize:"0.62rem",color:G.dimmer}}>{cost[0]} {cost[1]}</span><button disabled={!afford} onClick={()=>buyEquipItem(wn,cost[0],cost[1],"weapon")} style={{padding:"0.1rem 0.35rem",borderRadius:"0.4rem",fontSize:"0.65rem",border:"1px solid "+(afford?G.gold:"#334155"),cursor:afford?"pointer":"not-allowed",fontWeight:600,background:"transparent",color:afford?G.gold:G.dimmer,opacity:afford?1:0.5}}>{t("Buy")}</button></div>}
    </div>);
  });
  const armorRows=Object.entries(ARMOR_ITEMS).filter(([n])=>{if(q&&!n.toLowerCase().includes(q))return false;if(!showNonProf&&!canUseArmor(n))return false;return true;}).map(([an,a])=>{
    const isProf=canUseArmor(an);const calcAC=a.ac?a.ac:(a.acFn?a.acFn(dm):10);const isEq=equipped.armor===an;const cat=a.light?"Light":a.medium?"Medium":"Heavy";
    const owned=isOwned(an)||!ARMOR_COST[an];const cost=ARMOR_COST[an];const afford=cost&&canAffordCost(coins,cost[0],cost[1]);
    return(<div key={an} style={{display:"grid",gridTemplateColumns:"1fr 52px 60px 60px 64px",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:7,background:isEq?"#1e3a5f44":"transparent",border:"1px solid "+(isEq?"#60a5fa66":G.border),marginBottom:4}}>
      <div><span style={{fontSize:"0.82rem",color:isEq?"#60a5fa":"#e2e8f0",fontWeight:isEq?700:400}}>{an}</span>{!isProf&&<span style={{fontSize:"0.6rem",color:"#f87171",marginLeft:5,border:"1px solid #f87171",borderRadius:3,padding:"0 3px"}}>non-prof</span>}{a.stealth&&<span style={{fontSize:"0.6rem",color:"#fb923c",marginLeft:5,border:"1px solid #fb923c",borderRadius:3,padding:"0 3px"}}>stealth disadv.</span>}</div>
      <span style={{fontSize:"0.9rem",fontWeight:800,color:"#60a5fa",textAlign:"center"}}>AC {calcAC}</span>
      <span style={{fontSize:"0.65rem",color:G.dimmer,textAlign:"center",textTransform:"uppercase",letterSpacing:"0.05em"}}>{cat}</span>
      <span style={{fontSize:"0.65rem",color:G.dimmer,textAlign:"center"}}>{a.medium?"DEX+2":a.light?"DEX":"—"}</span>
      {owned?<button onClick={()=>equipItem(an)} style={{padding:"0.2rem 0.4rem",borderRadius:"0.4rem",fontSize:"0.7rem",border:"1px solid",cursor:"pointer",fontWeight:600,background:isEq?"#1e3a5f":"transparent",color:isEq?"#60a5fa":G.dim,borderColor:isEq?"#60a5fa":"#334155"}}>{isEq?"Unequip":"Equip"}</button>:
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.15rem"}}><span style={{fontSize:"0.62rem",color:G.dimmer}}>{cost[0]} {cost[1]}</span><button disabled={!afford} onClick={()=>buyEquipItem(an,cost[0],cost[1],"armor")} style={{padding:"0.1rem 0.35rem",borderRadius:"0.4rem",fontSize:"0.65rem",border:"1px solid "+(afford?G.gold:"#334155"),cursor:afford?"pointer":"not-allowed",fontWeight:600,background:"transparent",color:afford?G.gold:G.dimmer,opacity:afford?1:0.5}}>{t("Buy")}</button></div>}
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
      {[["weapons","Weapons"],["armor","Armor & Shields"],["gear",t("Gear")],["shop",t("Adventuring Gear")]].map(([id,label])=>(<button key={id} onClick={()=>{setEqTab(id);setEqSearch("");setGearSearch("");}} style={tabSt(eqTab===id)}>{label}</button>))}
      {eqTab!=="gear"&&eqTab!=="shop"&&<><input value={eqSearch} onChange={e=>setEqSearch(e.target.value)} placeholder="Search..." style={{...inp,width:"110px",padding:"0.25rem 0.6rem",fontSize:"0.78rem",marginLeft:"auto"}}/><label style={{display:"flex",alignItems:"center",gap:"0.3rem",fontSize:"0.72rem",color:G.muted,cursor:"pointer",whiteSpace:"nowrap"}}><input type="checkbox" checked={showNonProf} onChange={e=>setShowNonProf(e.target.checked)} style={{accentColor:G.gold}}/>Non-prof</label></>}
    </div>
    {eqTab==="weapons"&&(<div style={{maxHeight:"55vh",overflowY:"auto",paddingRight:4}}>
      <div style={{fontSize:"0.75rem",marginBottom:"0.5rem",padding:"0.35rem 0.65rem",borderRadius:"0.5rem",background:"#14532d22",border:"1px solid #4ade8055",color:"#e2e8f0"}}><span style={{color:"#4ade80",fontWeight:800}}>✓ Proficient:</span> {CLASSES[cn].weapons} <span style={{color:G.dim}}>— {t("green = proficient, red = not proficient")}</span></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 52px 64px 60px 70px 60px 64px",gap:6,padding:"0 8px",marginBottom:4}}>{["Name","Atk","Dmg","Type","Mastery","In attacks",""].map(h=><div key={h} style={{fontSize:"0.6rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>{t(h)}</div>)}</div>
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
        {(isOwned("Shield"))?<button onClick={()=>equipItem("Shield")} style={{padding:"0.2rem 0.4rem",borderRadius:"0.4rem",fontSize:"0.7rem",border:"1px solid",cursor:"pointer",fontWeight:600,background:equipped.shield?"#1e3a5f":"transparent",color:equipped.shield?"#60a5fa":G.dim,borderColor:equipped.shield?"#60a5fa":"#334155"}}>{equipped.shield?"Unequip":"Equip"}</button>:
        (()=>{const afford=canAffordCost(coins,SHIELD_COST[0],SHIELD_COST[1]);return <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.15rem"}}><span style={{fontSize:"0.62rem",color:G.dimmer}}>{SHIELD_COST[0]} {SHIELD_COST[1]}</span><button disabled={!afford} onClick={()=>buyEquipItem("Shield",SHIELD_COST[0],SHIELD_COST[1],"shield")} style={{padding:"0.1rem 0.35rem",borderRadius:"0.4rem",fontSize:"0.65rem",border:"1px solid "+(afford?G.gold:"#334155"),cursor:afford?"pointer":"not-allowed",fontWeight:600,background:"transparent",color:afford?G.gold:G.dimmer,opacity:afford?1:0.5}}>{t("Buy")}</button></div>;})()}
      </div>)}
    </div>)}
    {eqTab==="gear"&&(<div>
      <div style={{marginBottom:"0.75rem",padding:"0.5rem 0.65rem",borderRadius:"0.6rem",background:"#1e293b",border:"1px solid #334155"}}>
        <div style={{fontSize:"0.68rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.35rem"}}>{t("Currency")}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"0.4rem"}}>{["cp","sp","ep","gp","pp"].map(d=><div key={d}><div style={{fontSize:"0.6rem",color:G.dim,textTransform:"uppercase",textAlign:"center",marginBottom:"0.2rem"}}>{d}</div><input type="number" min={0} value={coins[d]||0} onChange={e=>setCoins(c=>({...c,[d]:Math.max(0,Number(e.target.value))}))} style={{...inp,textAlign:"center",padding:"0.35rem"}}/></div>)}</div>
      </div>
      <div style={{fontSize:"0.75rem",color:G.muted,marginBottom:"0.5rem"}}>Starting equipment for {cn}:</div>
      {EQUIP[cn].map((item,i)=><EquipRow key={i} item={item} equipped={equipped} onEquip={()=>equipItem(item)}/>)}
      {purchases.length>0&&<div style={{marginTop:"0.75rem",padding:"0.5rem 0.65rem",borderRadius:"0.6rem",background:"#1e293b",border:"1px solid #334155"}}>
        <div style={{fontSize:"0.68rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.4rem"}}>{t("Purchased")}</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.3rem"}}>{purchases.map(p=><div key={p.id} style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <span style={{fontSize:"0.78rem",color:"#e2e8f0",flex:1}}>{p.name}</span>
          <span style={{fontSize:"0.7rem",color:G.dimmer}}>{p.amt} {p.denom}</span>
          <button onClick={()=>undoPurchase(p)} style={{padding:"0.15rem 0.45rem",borderRadius:"0.4rem",fontSize:"0.68rem",border:"1px solid #f87171",cursor:"pointer",fontWeight:600,background:"transparent",color:"#f87171"}}>{t("Undo")}</button>
        </div>)}</div>
      </div>}
    </div>)}
    {eqTab==="shop"&&(()=>{const gq=gearSearch.toLowerCase();const rows=ADVENTURING_GEAR.filter(([n])=>!gq||n.toLowerCase().includes(gq));return(<div style={{maxHeight:"55vh",overflowY:"auto",paddingRight:4}}>
      <div style={{marginBottom:"0.75rem",padding:"0.5rem 0.65rem",borderRadius:"0.6rem",background:"#1e293b",border:"1px solid #334155"}}>
        <div style={{fontSize:"0.68rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.35rem"}}>{t("Currency")}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"0.4rem"}}>{["cp","sp","ep","gp","pp"].map(d=><div key={d}><div style={{fontSize:"0.6rem",color:G.dim,textTransform:"uppercase",textAlign:"center",marginBottom:"0.2rem"}}>{d}</div><input type="number" min={0} value={coins[d]||0} onChange={e=>setCoins(c=>({...c,[d]:Math.max(0,Number(e.target.value))}))} style={{...inp,textAlign:"center",padding:"0.3rem"}}/></div>)}</div>
      </div>
      <div style={{display:"flex",gap:"0.35rem",marginBottom:"0.5rem",alignItems:"center"}}>
        <input value={gearSearch} onChange={e=>setGearSearch(e.target.value)} placeholder="Search..." style={{...inp,width:"140px",padding:"0.25rem 0.6rem",fontSize:"0.78rem"}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 60px 70px 60px",gap:6,padding:"0 8px",marginBottom:4}}>{["Name","Weight","Cost",""].map(h=><div key={h} style={{fontSize:"0.6rem",color:G.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>{t(h)}</div>)}</div>
      {rows.map(([name,weight,amt,denom])=>{const afford=canAffordCost(coins,amt,denom);return(
        <div key={name} style={{display:"grid",gridTemplateColumns:"1fr 60px 70px 60px",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:7,border:"1px solid "+G.border,marginBottom:4}}>
          <span style={{fontSize:"0.82rem",color:"#e2e8f0"}}>{name}</span>
          <span style={{fontSize:"0.72rem",color:G.dimmer,textAlign:"center"}}>{weight?weight+" lb":"—"}</span>
          <span style={{fontSize:"0.78rem",color:G.muted,textAlign:"center"}}>{amt} {denom}</span>
          <button disabled={!afford} onClick={()=>buyGear(name,weight,amt,denom)} style={{padding:"0.2rem 0.4rem",borderRadius:"0.4rem",fontSize:"0.7rem",border:"1px solid "+(afford?G.gold:"#334155"),cursor:afford?"pointer":"not-allowed",fontWeight:600,background:"transparent",color:afford?G.gold:G.dimmer,opacity:afford?1:0.5}}>{t("Buy")}</button>
        </div>
      );})}
    </div>);})()}
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
  const [giantAncestry,setGiantAncestry]=useState("Stone Giant");
  const [selWildShapes,setSelWildShapes]=useState([]);
  const [landType,setLandType]=useState("Temperate");
  const [cname,setCname]=useState("");
  const [playerName,setPlayerName]=useState("");
  const [sub,setSub]=useState("");
  const [anotes,setAnotes]=useState("");
  const [inventory,setInventory]=useState(()=>expandPacks(EQUIP[initChar.cn]||[]).join("\n"));
  const [equipped,setEquipped]=useState(()=>({...CLASS_DEFAULTS[initChar.cn]}));
  const [masteredWeapons,setMasteredWeapons]=useState(()=>defaultMasteredWeaponsForClass(initChar.cn));
  const [selWeapons,setSelWeapons]=useState(()=>(CW[initChar.cn]||[]).filter(n=>n!=="Unarmed strike"));
  const [savedChars,setSavedChars]=useState(()=>{try{return JSON.parse(localStorage.getItem("cg_saved_characters")||"[]");}catch(e){return[];}});
  const [activeSlotId,setActiveSlotId]=useState(null);
  const [showCharPanel,setShowCharPanel]=useState(false);
  useEffect(()=>{try{localStorage.setItem("cg_saved_characters",JSON.stringify(savedChars));}catch(e){}},[savedChars]);
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
  const [coins,setCoins]=useState(()=>({cp:0,sp:0,ep:0,gp:baseStartingGoldFor(initChar.cn)+higherLevelGold(initChar.level),pp:0}));
  const [purchases,setPurchases]=useState([]);
  const [ownedExtra,setOwnedExtra]=useState([]);
  const [selSp,setSelSp]=useState({});
  const [selInv,setSelInv]=useState([]);
  const [selMetamagic,setSelMetamagic]=useState([]);
  const [selSavant,setSelSavant]=useState([]);
  const [selLore,setSelLore]=useState([]);
  const [lessonsFeat,setLessonsFeat]=useState("");
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
  const [uploadedPortrait,setUploadedPortrait]=useState("");
  function handlePortraitUpload(e){
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=evt=>{
      const img=new Image();
      img.onload=()=>{
        const maxDim=700;
        const scale=Math.min(1,maxDim/Math.max(img.width,img.height));
        const canvas=document.createElement("canvas");
        canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
        const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,canvas.width,canvas.height);
        setUploadedPortrait(canvas.toDataURL("image/jpeg",0.85));
      };
      img.src=evt.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value="";
  }
  const [lang,setLangState]=useState(CURRENT_LANG);
  syncLang(lang);
  const switchLang=l=>{setLang(l);setLangState(l);};
  const [featTab,setFeatTab]=useState("General");
  const [panelOrder,setPanelOrder]=useState(["overview","creator","spells","equipment","notes"]);
  const [collapsed,setCollapsed]=useState({overview:true,creator:true,spells:true,equipment:true,notes:true});
  const [draggingPanel,setDraggingPanel]=useState(null);
  const [vw,setVw]=useState(typeof window!=="undefined"?window.innerWidth:1200);
  useEffect(()=>{const onR=()=>setVw(window.innerWidth);window.addEventListener("resize",onR);return()=>window.removeEventListener("resize",onR);},[]);
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
  const mechFeats=useMemo(()=>{const s=new Set(activeFeats);const originBase=featBaseName(bgo.feat);if(ALL_FEATS[originBase])s.add(originBase);if(lessonsFeat&&ALL_FEATS[lessonsFeat])s.add(lessonsFeat);return s;},[activeFeats,bgo.feat,lessonsFeat]);
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
  const hasLucky=mechFeats.has("Lucky");
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
  const hasMagicInitiate=featBaseName(bgo.feat)==="Magic Initiate"||!!featMap["Magic Initiate"]||lessonsFeat==="Magic Initiate";
  const miClassEff=miClass||miForcedClass||MAGIC_INITIATE_CLASSES[0];
  const hasFindFamiliar=Object.values(selSp).flat().includes("Find Familiar")||miSpell==="Find Familiar"||selRituals.includes("Find Familiar");
  const passPerc=10+wm+(skProfs.includes("Perception")?pb:0);
  const init=dm+(hasAlert?pb:0);
  const armorStrReq=equipped.armor&&ARMOR_ITEMS[equipped.armor]?.str;
  const armorSpeedPenalty=(armorStrReq&&fin.STR<armorStrReq)?10:0;
  const unarmoredMoveBonus=(cn==="Monk"&&!equipped.armor&&!equipped.shield)?monkUnarmoredMovement(level):0;
  const speed=Math.max(0,(speciesData?.speed||30)+(hasMobile?10:0)+unarmoredMoveBonus-armorSpeedPenalty);
  const isCaster=!!CTYPE[cn]||(mc&&!!CTYPE[cn2]);
  const isMcCaster=mc&&!!CTYPE[cn2]&&CTYPE[cn2]!=="warlock"&&!!CTYPE[cn]&&CTYPE[cn]!=="warlock";
  const sab=SAB[cn]||(mc?SAB[cn2]:"");
  const smod=sab?mf(fin[sab]):0;
  const ct=CTYPE[cn];
  const isWarlock=cn==="Warlock"||(mc&&cn2==="Warlock");
  const warlockLvl=cn==="Warlock"?lv1e:(mc&&cn2==="Warlock"?lv2c:0);
  const isSorcerer=cn==="Sorcerer"||(mc&&cn2==="Sorcerer");
  const sorcererLvl=cn==="Sorcerer"?lv1e:(mc&&cn2==="Sorcerer"?lv2c:0);
  const metamagicLimit=isSorcerer?metamagicKnown(sorcererLvl):0;
  function togMetamagic(name){setSelMetamagic(prev=>{if(prev.includes(name))return prev.filter(n=>n!==name);if(prev.length>=metamagicLimit)return prev;return[...prev,name];});}
  const invLimit=isWarlock?invocationsKnown(warlockLvl):0;
  function togInv(name){setSelInv(prev=>{if(prev.includes(name))return prev.filter(n=>n!==name);if(prev.length>=invLimit)return prev;return[...prev,name];});}
  const wizardLvl=cn==="Wizard"?lv1e:(mc&&cn2==="Wizard"?lv2c:0);
  const wizSchool=wizardLvl>0?WIZARD_SCHOOL[sub]:null;
  const savantBudget=wizSchool?wizSavantBudget(wizardLvl):0;
  const savantMaxLvl=wizSchool?maxSpellLevel("full",wizardLvl):0;
  const savantPool=wizSchool?Object.entries(CS.Wizard||{}).filter(([lvl])=>Number(lvl)<=savantMaxLvl).flatMap(([,names])=>names).filter(n=>SD[n]?.sc===wizSchool):[];
  function togSavant(name){setSelSavant(prev=>{if(prev.includes(name))return prev.filter(n=>n!==name);if(prev.length>=savantBudget)return prev;return[...prev,name];});}
  const bardLvl=cn==="Bard"?lv1e:(mc&&cn2==="Bard"?lv2c:0);
  const isLore=bardLvl>0&&sub==="College of Lore"&&bardLvl>=6;
  const loreBudget=isLore?2:0;
  const loreMaxLvl=isLore?maxSpellLevel("full",bardLvl):0;
  const lorePool=isLore?[...new Set(["Cleric","Druid","Wizard"].flatMap(c=>Object.entries(CS[c]||{}).filter(([lvl])=>Number(lvl)<=loreMaxLvl).flatMap(([,names])=>names)))]:[];
  function togLore(name){setSelLore(prev=>{if(prev.includes(name))return prev.filter(n=>n!==name);if(prev.length>=loreBudget)return prev;return[...prev,name];});}
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
  React.useEffect(()=>{setSelSavant([]);setSelLore([]);},[cn,sub]);

  function changeClass(newCn){setCn(newCn);setSub("");setClassOrder(defaultOrder(newCn));setInventory(expandPacks(EQUIP[newCn]||[]).join("\n"));setSelInv([]);setSelRituals([]);setSelTomeCantrips([]);setSelSp({});setSpPrep({});setUsedSlots({});setMstats(assignArr(newCn));setSelSk(CLASSES[newCn].sc.slice(0,CLASSES[newCn].ns));setEquipped({...CLASS_DEFAULTS[newCn]});setMasteredWeapons(defaultMasteredWeaponsForClass(newCn));setSelWeapons((CW[newCn]||[]).filter(n=>n!=="Unarmed strike"));setSelExpertise([]);setSelWildShapes(newCn==="Druid"&&level>=2?pickWildShapeForms(level):[]);setPurchases([]);setOwnedExtra([]);setSelMetamagic([]);}

  function buildW(){
    const weapons=[];const wname=equipped.weapon;const weapProfs=WEAPON_PROF[cn]||[];
    const wd=n=>n==="Unarmed strike"&&hasTavernBrawler?{...WD[n],dmg:"1d4"}:WD[n];
    if(wname&&wd(wname)){const w=wd(wname);const isProf=isWeaponProficient(weapProfs,wname);const am=w.ab==="fin"?(dm>=sm?dm:sm):w.ab==="DEX"?dm:sm;weapons.push({name:wname,atk:sgn(isProf?am+pb:am),dmg:w.dmg+" "+sgn(am),props:w.pr,mastery:w.mastery||"—",masteredActive:masteredWeapons.includes(wname)});}
    selWeapons.filter(n=>n!==wname).slice(0,3).forEach(wn=>{const w=wd(wn);if(!w)return;const isProf=isWeaponProficient(weapProfs,wn);const am=w.ab==="fin"?(dm>=sm?dm:sm):w.ab==="DEX"?dm:sm;weapons.push({name:wn,atk:sgn(isProf?am+pb:am),dmg:w.dmg+" "+sgn(am),props:w.pr,mastery:w.mastery||"—",masteredActive:masteredWeapons.includes(wn)});});
    return weapons.slice(0,4);
  }

  function buildCharacterData(){
    return{version:1,cname,playerName,level,sp,cn,bg,align,sub,anotes,boost,boost2,boost1,gender,portraitMode,uploadedPortrait,smode,mstats,rstats,selSk,selLangs,selExpertise,miClass,miCantrips,miSpell,dragonColor,giantAncestry,selWildShapes,landType,skilledSkills,skilledTools,equipped,masteredWeapons,selWeapons,featMap,mc,cn2,lv2,traits,ideals,bonds,flaws,backstory,coins,purchases,ownedExtra,selSp,selInv,selMetamagic,selSavant,selLore,selRituals,selTomeCantrips,classOrder,inventory,spPrep,usedSlots,lessonsFeat};
  }
  function applyCharacterData(d){
    if(d.cname!==undefined)setCname(d.cname);if(d.playerName!==undefined)setPlayerName(d.playerName);if(d.level!==undefined)setLevel(d.level);if(d.sp!==undefined)setSp(d.sp);if(d.cn!==undefined)changeClass(d.cn);if(d.bg!==undefined)setBg(d.bg);if(d.align!==undefined)setAlign(d.align);if(d.sub!==undefined)setSub(d.sub);if(d.anotes!==undefined)setAnotes(d.anotes);if(d.boost!==undefined)setBoost(d.boost);if(d.boost2!==undefined)setBoost2(d.boost2);if(d.boost1!==undefined)setBoost1(d.boost1);if(d.gender!==undefined)setGender(d.gender);if(d.portraitMode!==undefined)setPortraitMode(d.portraitMode);if(d.uploadedPortrait!==undefined)setUploadedPortrait(d.uploadedPortrait);if(d.smode!==undefined)setSmode(d.smode);if(d.mstats!==undefined)setMstats(d.mstats);if(d.rstats!==undefined)setRstats(d.rstats);if(d.selSk!==undefined)setSelSk(d.selSk);if(d.selLangs!==undefined)setSelLangs(d.selLangs);if(d.selExpertise!==undefined)setSelExpertise(d.selExpertise);if(d.miClass!==undefined)setMiClass(d.miClass);if(d.miCantrips!==undefined)setMiCantrips(d.miCantrips);if(d.miSpell!==undefined)setMiSpell(d.miSpell);if(d.dragonColor!==undefined)setDragonColor(d.dragonColor);if(d.giantAncestry!==undefined)setGiantAncestry(d.giantAncestry);if(d.selWildShapes!==undefined)setSelWildShapes(d.selWildShapes);if(d.landType!==undefined)setLandType(d.landType);if(d.skilledSkills!==undefined)setSkilledSkills(d.skilledSkills);if(d.skilledTools!==undefined)setSkilledTools(d.skilledTools);if(d.equipped!==undefined)setEquipped(d.equipped);if(d.masteredWeapons!==undefined)setMasteredWeapons(d.masteredWeapons);if(d.selWeapons!==undefined)setSelWeapons(d.selWeapons);if(d.featMap!==undefined)setFeatMap(d.featMap);if(d.mc!==undefined)setMc(d.mc);if(d.cn2!==undefined)setCn2(d.cn2);if(d.lv2!==undefined)setLv2(d.lv2);if(d.traits!==undefined)setTraits(d.traits);if(d.ideals!==undefined)setIdeals(d.ideals);if(d.bonds!==undefined)setBonds(d.bonds);if(d.flaws!==undefined)setFlaws(d.flaws);if(d.backstory!==undefined)setBackstory(d.backstory);if(d.coins!==undefined)setCoins(d.coins);else if(d.gp!==undefined)setCoins(c=>({...c,gp:d.gp}));if(d.purchases!==undefined)setPurchases(d.purchases);if(d.ownedExtra!==undefined)setOwnedExtra(d.ownedExtra);if(d.selSp!==undefined)setSelSp(d.selSp);if(d.selInv!==undefined)setSelInv(d.selInv);if(d.selMetamagic!==undefined)setSelMetamagic(d.selMetamagic);if(d.selSavant!==undefined)setSelSavant(d.selSavant);if(d.selLore!==undefined)setSelLore(d.selLore);if(d.classOrder!==undefined)setClassOrder(d.classOrder);if(d.inventory!==undefined)setInventory(repairPackLines(d.inventory));if(d.selRituals!==undefined)setSelRituals(d.selRituals);if(d.selTomeCantrips!==undefined)setSelTomeCantrips(d.selTomeCantrips);if(d.spPrep!==undefined)setSpPrep(d.spPrep);if(d.usedSlots!==undefined)setUsedSlots(d.usedSlots);if(d.lessonsFeat!==undefined)setLessonsFeat(d.lessonsFeat);
  }
  function exportCharacter(){
    const data=buildCharacterData();
    const safeName=(cname||"unnamed").replace(/[^a-z0-9_\-]/gi,"_");
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`character-${safeName}.json`;a.style.display="none";document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function importCharacter(e){
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=evt=>{try{applyCharacterData(JSON.parse(evt.target.result));}catch(err){alert("Failed to load character file.");}e.target.value="";};
    reader.readAsText(file);
  }
  function saveToSlot(){
    const data=buildCharacterData();
    setSavedChars(prev=>{
      const now=Date.now();
      if(activeSlotId){
        return prev.map(s=>s.id===activeSlotId?{...s,name:cname||"Unnamed",classLevel:cn+" "+level,updatedAt:now,data}:s);
      }
      const id=now+"_"+Math.random().toString(36).slice(2,7);
      setActiveSlotId(id);
      return[...prev,{id,name:cname||"Unnamed",classLevel:cn+" "+level,updatedAt:now,data}];
    });
  }
  function saveAsNewSlot(){
    const data=buildCharacterData();
    const id=Date.now()+"_"+Math.random().toString(36).slice(2,7);
    setSavedChars(prev=>[...prev,{id,name:cname||"Unnamed",classLevel:cn+" "+level,updatedAt:Date.now(),data}]);
    setActiveSlotId(id);
  }
  function loadSlot(id){
    const slot=savedChars.find(s=>s.id===id);if(!slot)return;
    applyCharacterData(slot.data);
    setActiveSlotId(id);
  }
  function deleteSlot(id){
    if(!confirm(t("Delete this saved character?")))return;
    setSavedChars(prev=>prev.filter(s=>s.id!==id));
    if(activeSlotId===id)setActiveSlotId(null);
  }
  function levelUpCharacter(){setLevel(prev=>{if(prev>=20){alert("Already level 20.");return prev;}const next=prev+1;const minGoldCP=(baseStartingGoldFor(cn)+higherLevelGold(next))*100;setCoins(c=>coinsTotalCP(c)<minGoldCP?{cp:0,sp:0,ep:0,gp:Math.round(minGoldCP/100),pp:0}:c);return next;});}

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
    setUploadedPortrait("");setPortraitMode("blank");
    const clsLocked=classLockedRef.current,spLocked=speciesLockedRef.current,lvLocked=levelLockedRef.current;
    const rs=pick(Object.keys(SPECIES)),rc=pick(Object.keys(CLASSES)),rb=pick(Object.keys(BGS));
    const rl=Math.ceil(Math.random()*20);
    if(!clsLocked&&!spLocked){setSp(rs);setCn(rc);setBg(rb);setCname(pickName(rs));setSelSk(CLASSES[rc].sc.slice(0,CLASSES[rc].ns));setEquipped({...CLASS_DEFAULTS[rc]});setMasteredWeapons(defaultMasteredWeaponsForClass(rc));}
    else{if(!clsLocked){setCn(rc);setSelSk(CLASSES[rc].sc.slice(0,CLASSES[rc].ns));setEquipped({...CLASS_DEFAULTS[rc]});setMasteredWeapons(defaultMasteredWeaponsForClass(rc));}if(!spLocked)setSp(rs);setBg(rb);setCname(pickName(spLocked?sp:rs));}
    if(!lvLocked)setLevel(rl);
    const useBg=rb,useSp=spLocked?sp:rs,useCn=clsLocked?cn:rc;
    setInventory(expandPacks(EQUIP[useCn]||[]).join("\n"));
    const rolls=Array.from({length:6},r4d6);const ns=assignByPriority(useCn,rolls);
    setRstats(ns);setMstats(ns);setSmode("Rolled");
    // Respect 2024 feat budget: ASI levels 4/8/12/16/19 (+Fighter 6/14, +Rogue 10, +1 Origin for Human)
    const rlvl=lvLocked?level:rl;
    setCoins({cp:0,sp:0,ep:0,gp:baseStartingGoldFor(useCn)+higherLevelGold(rlvl),pp:0});
    setPurchases([]);
    setSelWildShapes(useCn==="Druid"&&rlvl>=2?pickWildShapeForms(rlvl):[]);
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
    const mk=(name,source)=>{const d=spellD(name)||{};return{name,sc:d.sc||"",desc:d.desc||"",cast:d.cast||"",range:d.range||"",dur:d.dur||"",comp:d.comp||"",pg:d.pg||"",conc:/^Conc\.?\b/i.test(d.dur||""),source};};
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
    // Merge Pact of the Tome cantrips/rituals and Magic Initiate spells into the same list, tagged with their source.
    const addBonus=(name,label)=>{
      const lvl=spellLevelOf(name);if(lvl===undefined)return;
      if(!res[lvl])res[lvl]=[];
      if(res[lvl].some(s=>s.name===name))return;
      res[lvl].push(mk(name,label));
    };
    if(isWarlock&&selInv.includes("Pact of the Tome")){
      selTomeCantrips.forEach(name=>addBonus(name,"Pact of the Tome"));
      selRituals.forEach(name=>addBonus(name,"Pact of the Tome"));
    }
    if(hasMagicInitiate){
      [...miCantrips,miSpell].filter(Boolean).forEach(name=>addBonus(name,"Magic Initiate"));
    }
    if(wizSchool){
      selSavant.forEach(name=>addBonus(name,sub));
    }
    if(isLore){
      selLore.forEach(name=>addBonus(name,sub));
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
    const featPgTxt=n=>ALL_FEATS[n]?.pg?" (PHB p."+ALL_FEATS[n].pg+")":"";
    const orderInfo=CLASS_ORDER[cn]?CLASS_ORDER[cn].options.find(o=>o[0]===classOrder):null;
    const orderLine=orderInfo?CLASS_ORDER[cn].label+": "+orderInfo[0]+" — "+orderInfo[1][da?1:0]:"";
    const originWord=da?"Oprindelse":"Origin";
    const originFeatLine=bgo.feat+" ("+originWord+"): "+featDesc(bgo.feat)+featPgTxt(bgo.feat);
    const featsList=[originFeatLine,...activeFeats.map(f=>{const d=featDesc(f);return(d?f+": "+d:f)+featPgTxt(f);})].join("\n");
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
    const goliathTraitDetail={
      "Giant Ancestry":giantAncestry+": "+GIANT_ANCESTRY[giantAncestry][da?1:0]+" ("+pb+"x, "+(da?"genopret alle ved lang hvile":"regain all on Long Rest")+")",
    };
    const racialTraitsTxt=(speciesData.traits||[]).map(tr=>{const label=da?(TRAIT_DA[tr]||tr):tr;const d=(sp==="Dragonborn"?dragonTraitDetail[tr]:sp==="Goliath"?goliathTraitDetail[tr]:null)||TRAIT_DESC[tr]?.[da?1:0];return d?label+": "+d:label;}).join("\n");
    const invLine=(isWarlock&&selInv.length)?selInv.map(n=>{const d=ELDRITCH_INVOCATIONS[n]?.[da?1:0];const extra=(n==="Lessons of the First Ones"&&lessonsFeat)?" — "+lessonsFeat+": "+featDesc(lessonsFeat):"";return "• "+n+(d?": "+d:"")+extra;}).join("\n"):"";
    const invBlock=invLine?"Eldritch Invocations:\n"+invLine:"";
    const metamagicLine=(isSorcerer&&selMetamagic.length)?selMetamagic.map(n=>{const d=METAMAGIC_OPTIONS[n];return "• "+n+" ("+d[2]+"): "+d[da?1:0];}).join("\n"):"";
    const metamagicBlockTxt=metamagicLine?"Metamagic:\n"+metamagicLine:"";
    const wildShapeLine=(cn==="Druid"&&selWildShapes.length)?"Wild Shape ("+wildShapeUses(level)+"/short or long rest):\n"+selWildShapes.map(n=>"• "+n+" — see page 3 for full stat block").join("\n"):"";
    const rageLine=cn==="Barbarian"?(()=>{const r=barbarianRage(level);return "Rage: "+r.rages+" uses (regain 1 per Short Rest, all per Long Rest), +"+r.dmg+" damage on Strength-based hits";})():"";
    const channelDivinityLine=(cn==="Cleric"&&level>=2)?"Channel Divinity: "+clericChannelDivinity(level)+" uses (regain 1 per Short Rest, all per Long Rest)":(cn==="Paladin"&&level>=3)?"Channel Divinity: "+paladinChannelDivinity(level)+" uses (regain 1 per Short Rest, all per Long Rest)":"";
    const sorceryPointsLine=(cn==="Sorcerer"&&level>=2)?"Sorcery Points: "+sorceryPoints(level)+" (regain all per Long Rest)":"";
    const unarmoredMoveLine=(cn==="Monk"&&level>=2)?"Unarmored Movement: +"+monkUnarmoredMovement(level)+" ft Speed while not wearing armor or wielding a Shield":"";
    const combinedFeatures=[orderLine,featsList,invBlock,metamagicBlockTxt,wildShapeLine,rageLine,channelDivinityLine,sorceryPointsLine,unarmoredMoveLine,classFeaturesTxt,racialTraitsTxt].filter(Boolean).join("\n\n--\n\n");
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
    const nextResource2=hasLucky?{name:"Lucky",uses:3,recharge:"all/Long Rest",desc:["Spend a Luck Point to give yourself Advantage on an attack roll, ability check, or saving throw, or to impose Disadvantage on an attack roll against you.","Brug et Luck Point til at give dig selv Advantage på et angrebstjek, ability-tjek eller saving throw, eller til at give Disadvantage på et angrebstjek mod dig."]}:null;
    // Sneak Attack dice (PHB 2024 p.129, Rogue Features table): ceil(Rogue level/2), tracked per the character's actual Rogue level in case of multiclassing.
    const rogueLevel=cn==="Rogue"?lv1e:(mc&&cn2==="Rogue"?lv2c:0);
    const sneakAttackDice=rogueLevel>0?Math.ceil(rogueLevel/2):0;
    const nextSheet={name:dispName,playerName,classLevel:clsLvl,background:bg,species:sp,alignment:align,finalStats:fin,ac,initiative:init,speed,hpMax:hp,hitDice:level+"d"+cls.hd,profBonus:pb,saves,skills:skProfs,passivePerc:passPerc,weapons:[...buildW(),...breathRow],spellAbility:sab,spellAtk:sab?sgn(smod+pb):"",spellDC:sab?String(8+smod+pb):"",isCaster:(isCaster&&!!sab&&Object.values(selSp).flat().length>0)||Object.values(nextSpellsByLevel).flat().length>0,spellSlots:slots,spellsByLevel:nextSpellsByLevel,profLangs:prof,features:featuresTxt,originFeat:bgo.feat,traits:charTraits,ideals:ideals||"—",bonds:bonds||"—",flaws:flaws||"—",backstory,coins,equipment:EQUIP[cn].join("\n"),equippedGear,acBreakdown,resource:nextResource,resource2:nextResource2,inventory,portraitSeed:nextPortraitSeed,gender:nextGender,portraitMode,uploadedPortrait,weaponProf:cls.weapons,armorProf:cls.armor,wisSkills:orderWisSkills(cn,classOrder),wisMod:mf(fin.WIS),expertise:selExpertise,toolProf:allTools,sneakAttackDice,wildShapeForms:[...new Set([...(cn==="Druid"?selWildShapes:[]),...(hasFindFamiliar?FAMILIAR_FORMS:[])])],subclass:sub};
    nextSheet.portraitUrl=pollinationsImageUrl(buildPortraitPromptFromSheet(nextSheet),nextPortraitSeed);
    setSheet(nextSheet);
    setView("sheet");
  }

  if(view==="sheet"&&sheet){
    const allForms=sheet.wildShapeForms||[];
    const page3Forms=[];
    const extraFormPages=allForms.length?[allForms]:[];
    const wildMagic=sheet.subclass==="Wild Magic Sorcery";
    const totalPages=3+extraFormPages.length+(wildMagic?1:0);
    const fitScale=Math.min(1,(vw-24)/PAGE_W_PX);
    return <div><div className="no-print" style={{display:"flex",gap:8,padding:"8px 14px",background:"#1a0e00",alignItems:"center"}}><button onClick={()=>setView("gen")} style={{padding:"5px 14px",borderRadius:4,border:"1px solid #c9a84c",background:"#2d1a00",color:"#fcd34d",cursor:"pointer",fontSize:12,fontWeight:600}}>{t("Back")}</button><button onClick={()=>window.print()} style={{padding:"5px 14px",borderRadius:4,border:"1px solid #4ade80",background:"#14532d",color:"#4ade80",cursor:"pointer",fontSize:12,fontWeight:600}}>{t("Print / PDF")}</button><span style={{fontSize:11,color:"#8a6a2a"}}>{t("Set page margins to None.")} {totalPages+" "+t("pages")}</span></div><div className="sheet-fit-outer" style={{width:PAGE_W_PX*fitScale,height:PAGE_H_PX*totalPages*fitScale,overflow:"hidden",margin:"0 auto"}}><div className="print-area sheet-fit-inner" style={{transform:`scale(${fitScale})`,transformOrigin:"top left"}}><FancySheet sh={sheet} totalPages={totalPages}/><Page2 sh={sheet} totalPages={totalPages}/><Page3 sh={sheet} forms={page3Forms} totalPages={totalPages}/>{extraFormPages.map((chunk,i)=><FormsPage key={i} sh={sheet} forms={chunk} pageNum={4+i} totalPages={totalPages}/>)}{wildMagic&&<Page4 sh={sheet} pageNum={4+extraFormPages.length} totalPages={totalPages}/>}</div></div><style>{`@media print{@page{margin:0;size:A4 portrait}html,body,#root{margin:0!important;padding:0!important;background:white!important;width:210mm!important;min-height:297mm!important}.no-print{display:none!important}.sheet-fit-outer{width:auto!important;height:auto!important;overflow:visible!important}.print-area{display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important}.sheet-fit-inner{transform:none!important}.page{width:210mm!important;height:297mm!important;margin:0!important;box-shadow:none!important;break-after:page;page-break-after:always;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;overflow:hidden!important}.page img{display:block!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.page *{box-shadow:none!important}}`}</style></div>;
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
      <GFld label={t("Portrait")}><div style={{display:"flex",gap:"0.5rem"}}>{[["ai",t("AI image")],["upload",t("Upload Image")],["blank",t("Draw your own")]].map(([m,lbl])=><button key={m} onClick={()=>setPortraitMode(m)} style={{...tabSt(portraitMode===m),flex:1}}>{lbl}</button>)}</div></GFld>
      {portraitMode==="ai"&&<GFld label={t("Portrait Gender")}><div style={{display:"flex",gap:"0.5rem"}}>{["male","female"].map(g=><button key={g} onClick={()=>setGender(g)} style={{...tabSt(gender===g),flex:1,textTransform:"capitalize"}}>{t(g)}</button>)}</div></GFld>}
      {portraitMode==="upload"&&<GFld label={t("Choose an image")}>
        <input type="file" accept="image/*" onChange={handlePortraitUpload} style={{...inp,padding:"0.4rem 0.6rem"}}/>
        {uploadedPortrait&&<div style={{marginTop:"0.5rem",display:"flex",alignItems:"center",gap:"0.6rem"}}><img src={uploadedPortrait} style={{width:"48px",height:"48px",objectFit:"cover",borderRadius:"0.5rem",border:"1px solid "+G.border}}/><button onClick={()=>setUploadedPortrait("")} style={{fontSize:"0.72rem",color:"#f87171",background:"none",border:"1px solid #7f1d1d",borderRadius:"0.4rem",padding:"0.25rem 0.5rem",cursor:"pointer"}}>{t("Remove")}</button></div>}
      </GFld>}
      <GFld label={t("Alignment")}><select value={align} onChange={e=>setAlign(e.target.value)} style={inp}>{["Lawful Good","Neutral Good","Chaotic Good","Lawful Neutral","True Neutral","Chaotic Neutral","Lawful Evil","Neutral Evil","Chaotic Evil","Unaligned"].map(a=><option key={a}>{a}</option>)}</select></GFld>
      <GFld label={"Level: "+level}><input type="range" min="1" max="20" value={level} onChange={e=>{setLevel(Number(e.target.value));levelLockedRef.current=true;setLevelLocked(true);}} style={{width:"100%",accentColor:G.gold}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:"0.7rem",color:G.dim}}><span>1</span><span>10</span><span>20</span></div></GFld>

      <div style={{marginTop:"1rem",marginBottom:"0.85rem",background:"rgba(96,165,250,0.08)",border:"1px solid #60a5fa55",borderRadius:"0.85rem",padding:"0.75rem"}}>
        <div style={{fontSize:"0.7rem",fontWeight:800,color:"#60a5fa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.65rem"}}>1. {t("Class")}</div>
        <GFld label={t("Class")}><select value={cn} onChange={e=>{changeClass(e.target.value);classLockedRef.current=true;setClassLocked(true);}} style={inp}>{Object.keys(CLASSES).map(c=><option key={c}>{c}</option>)}</select>{cls&&<div style={{marginTop:"0.4rem",background:G.card,borderRadius:"0.65rem",padding:"0.5rem 0.65rem"}}><div style={{fontSize:"0.65rem",color:"#60a5fa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.3rem",fontWeight:700}}>{t("Class Features")}</div>{cls.features.filter(f=>{const m=f.match(/Lvl(\d+)/);return(m?parseInt(m[1],10):1)<=level;}).map((f,i)=>{const da=CURRENT_LANG==="da";const label=da?(FEATURE_DA[f]||f):f;const d=FEATURE_DESC[f]?.[da?1:0];return <div key={i} style={{fontSize:"0.73rem",color:G.muted,marginBottom:"0.25rem"}}>- <b style={{color:"#cbd5e1"}}>{label}</b>{d?<span style={{color:G.dim}}> — {d}</span>:""}</div>;})}</div>}
          {CLASS_ORDER[cn]&&<div style={{marginTop:"0.6rem",background:"#2d1a00",border:"1px solid "+G.gold,borderRadius:"0.75rem",padding:"0.6rem 0.7rem"}}><div style={{fontSize:"0.78rem",color:G.gold,marginBottom:"0.4rem",fontWeight:800,display:"flex",alignItems:"center",gap:"0.4rem"}}>⚡ {t("Choose")}: {CLASS_ORDER[cn].label}</div><div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>{CLASS_ORDER[cn].options.map(([nm,desc,cantrip])=>{const sel=classOrder===nm;return <button key={nm} onClick={()=>setClassOrder(nm)} style={{textAlign:"left",padding:"0.45rem 0.6rem",borderRadius:"0.6rem",border:"1px solid "+(sel?G.gold:"#334155"),background:sel?"#4a3800":"#0f172a",cursor:"pointer"}}><div style={{fontSize:"0.8rem",fontWeight:700,color:sel?G.gold:"#e2e8f0"}}>{sel?"✓ ":""}{nm}{cantrip?<span style={{fontSize:"0.6rem",marginLeft:"0.4rem",color:"#4ade80",border:"1px solid #4ade80",borderRadius:"0.3rem",padding:"0 0.3rem"}}>+{cantrip} cantrip</span>:""}</div><div style={{fontSize:"0.7rem",color:G.muted,marginTop:"1px"}}>{desc[CURRENT_LANG==="da"?1:0]}</div></button>;})}</div></div>}</GFld>
        <div style={{marginBottom:"0.85rem",background:G.card,borderRadius:"0.75rem",padding:"0.65rem 0.75rem",border:"1px solid "+(mc?G.gold:G.border)}}>
          <label style={{display:"flex",alignItems:"center",gap:"0.5rem",cursor:"pointer",marginBottom:mc?"0.65rem":"0"}}><input type="checkbox" checked={mc} onChange={e=>setMc(e.target.checked)} style={{accentColor:G.gold,width:15,height:15}}/><span style={{fontSize:"0.8rem",fontWeight:600,color:mc?G.gold:"#e2e8f0"}}>{t("Multiclass")}</span></label>
          {mc&&level>1&&<div className="mob-mc" style={{display:"grid",gridTemplateColumns:"1fr 70px",gap:"0.5rem",alignItems:"end"}}><GFld label={t("Second class")}><select value={cn2} onChange={e=>setCn2(e.target.value)} style={inp}>{Object.keys(CLASSES).filter(c=>c!==cn).map(c=><option key={c}>{c}</option>)}</select></GFld><GFld label={t("Levels")}><select value={lv2c} onChange={e=>setLv2(Number(e.target.value))} style={inp}>{Array.from({length:Math.max(1,level-1)},(_,i)=>i+1).map(l=><option key={l}>{l}</option>)}</select></GFld></div>}
        </div>
        <GFld label={level<3?t("Subclass (available at level 3)"):t("Subclass")}>
          <select value={sub} onChange={e=>setSub(e.target.value)} disabled={level<3} style={{...inp,opacity:level<3?0.45:1}}>
            <option value="">{level<3?t("Unlocks at level 3..."):t("Choose subclass...")}</option>
            {Object.keys(SUBCLASSES[cn]||{}).map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          {sub&&SUBCLASSES[cn]?.[sub]&&<div style={{marginTop:"0.35rem",fontSize:"0.73rem",color:G.muted,fontStyle:"italic",padding:"0.35rem 0.5rem",background:G.card,borderRadius:"0.5rem"}}>{SUBCLASSES[cn][sub]}</div>}
        </GFld>
      </div>

      <div style={{marginBottom:"0.85rem",background:"rgba(251,191,36,0.08)",border:"1px solid #fbbf2455",borderRadius:"0.85rem",padding:"0.75rem"}}>
        <div style={{fontSize:"0.7rem",fontWeight:800,color:"#fbbf24",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.65rem"}}>2. {t("Background")}</div>
        <GFld label={t("Background")}><select value={bg} onChange={e=>setBg(e.target.value)} style={inp}>{Object.keys(BGS).map(b=><option key={b}>{b}</option>)}</select><div style={{marginTop:"0.4rem",background:G.card,borderRadius:"0.65rem",padding:"0.5rem 0.65rem"}}><div style={{fontSize:"0.65rem",color:"#fbbf24",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.25rem",fontWeight:700}}>{t("Origin Feat")}: {bgo.feat}</div><div style={{fontSize:"0.73rem",color:G.muted,fontStyle:"italic"}}>{bgo.flavor}</div></div></GFld>
      </div>

      <div style={{background:"rgba(167,139,250,0.08)",border:"1px solid #a78bfa55",borderRadius:"0.85rem",padding:"0.75rem"}}>
        <div style={{fontSize:"0.7rem",fontWeight:800,color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.65rem"}}>3. {t("Species")}</div>
        <GFld label={t("Species")}><select value={sp} onChange={e=>{setSp(e.target.value);speciesLockedRef.current=true;setSpeciesLocked(true);}} style={inp}>{Object.keys(SPECIES).map(s=><option key={s}>{s}</option>)}</select>{speciesData&&<div style={{marginTop:"0.4rem",background:G.card,borderRadius:"0.65rem",padding:"0.5rem 0.65rem"}}><div style={{fontSize:"0.65rem",color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.3rem",fontWeight:700}}>{t("Species Traits")}</div>{speciesData.traits.map((tr,i)=>{const dd=CURRENT_LANG==="da";const label=dd?(TRAIT_DA[tr]||tr):tr;const desc=TRAIT_DESC[tr]?.[dd?1:0];return <div key={i} style={{fontSize:"0.73rem",color:G.muted,marginBottom:"0.25rem"}}>- <b style={{color:"#cbd5e1"}}>{label}</b>{desc?<span style={{color:G.dim}}> — {desc}</span>:""}{TRAIT_PG[tr]?<span style={{color:G.dimmer}}> (PHB p.{TRAIT_PG[tr]})</span>:""}</div>;})}</div>}
          {sp==="Dragonborn"&&<div style={{marginTop:"0.4rem",background:G.card,borderRadius:"0.65rem",padding:"0.5rem 0.65rem"}}>
            <div style={{fontSize:"0.65rem",color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.3rem",fontWeight:700}}>{t("Draconic Ancestry")}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>{Object.keys(DRACONIC_ANCESTRY).map(c=>{const sel=dragonColor===c;return <button key={c} onClick={()=>setDragonColor(c)} style={{padding:"0.2rem 0.5rem",borderRadius:"0.45rem",fontSize:"0.72rem",border:"1px solid "+(sel?G.gold:"#334155"),cursor:"pointer",background:sel?G.gold:"transparent",color:sel?"#020817":"#f1f5f9",fontWeight:sel?700:400}}>{c} ({DRACONIC_ANCESTRY[c]})</button>;})}</div>
            <div style={{fontSize:"0.68rem",color:G.muted,marginTop:"0.35rem"}}>{t("Breath Weapon")}: {breathWeaponDice(level)} {DRACONIC_ANCESTRY[dragonColor]}</div>
          </div>}
          {sp==="Goliath"&&<div style={{marginTop:"0.4rem",background:G.card,borderRadius:"0.65rem",padding:"0.5rem 0.65rem"}}>
            <div style={{fontSize:"0.65rem",color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.3rem",fontWeight:700}}>{t("Giant Ancestry")}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>{Object.keys(GIANT_ANCESTRY).map(g=>{const sel=giantAncestry===g;return <button key={g} onClick={()=>setGiantAncestry(g)} style={{padding:"0.2rem 0.5rem",borderRadius:"0.45rem",fontSize:"0.72rem",border:"1px solid "+(sel?G.gold:"#334155"),cursor:"pointer",background:sel?G.gold:"transparent",color:sel?"#020817":"#f1f5f9",fontWeight:sel?700:400}}>{t(g)}</button>;})}</div>
            <div style={{fontSize:"0.68rem",color:G.muted,marginTop:"0.35rem"}}>{GIANT_ANCESTRY[giantAncestry][CURRENT_LANG==="da"?1:0]} ({pb}x, {t("regain all on Long Rest")})</div>
          </div>}
        </GFld>
        <div style={{marginTop:"0.6rem"}}>
          <div style={{fontSize:"0.75rem",color:G.muted,marginBottom:"0.5rem"}}>{t("Languages")} — {t("From species")}: {(speciesData?.languages||["Common"]).join(", ")}</div>
          <div style={{fontSize:"0.65rem",color:G.dim,marginBottom:"0.3rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>{t("Standard Languages")}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem",marginBottom:"0.6rem"}}>{STANDARD_LANGUAGES.map(l=>{const fromSpecies=(speciesData?.languages||["Common"]).includes(l);const sel=fromSpecies||selLangs.includes(l);return <button key={l} disabled={fromSpecies} onClick={()=>togLang(l)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px solid "+(sel?G.gold:"#475569"),cursor:fromSpecies?"default":"pointer",background:sel?G.gold:"transparent",color:sel?"#020817":G.dim,fontWeight:sel?700:400,opacity:fromSpecies?0.85:1}}>{l}</button>;})}</div>
          <div style={{fontSize:"0.65rem",color:G.dim,marginBottom:"0.3rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>{t("Rare Languages")}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>{RARE_LANGUAGES.map(l=>{const sel=selLangs.includes(l);return <button key={l} onClick={()=>togLang(l)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px solid "+(sel?G.gold:"#475569"),cursor:"pointer",background:sel?G.gold:"transparent",color:sel?"#020817":G.dim,fontWeight:sel?700:400}}>{l}</button>;})}</div>
        </div>
      </div>
    </div>
  );

  const statsPanel=(
    <div>
      <div style={{display:"flex",gap:"0.5rem",alignItems:"flex-end",marginBottom:"0.85rem"}}>
        <div style={{flex:1}}><div style={{fontSize:"0.75rem",color:G.muted,marginBottom:"0.3rem"}}>{t("Stat Method")}</div><select value={smode} onChange={e=>{const m=e.target.value;if(m==="Manual"){setMstats(prev=>{const legal=Object.values(prev).every(v=>v>=8&&v<=15)&&pointBuySpent(prev)<=PB_BUDGET;return legal?prev:{STR:8,DEX:8,CON:8,INT:8,WIS:8,CHA:8};});}setSmode(m);}} style={inp}><option value="Standard Array">{t("Standard Array")}</option><option value="Rolled">{t("Rolled")}</option><option value="Manual">{t("Point Buy")}</option></select></div>
        <GBtn onClick={()=>{const rolls=Array.from({length:6},r4d6);const ns=assignByPriority(cn,rolls);setRstats(ns);setMstats(ns);setSmode("Rolled");}} gold={smode==="Rolled"} small><RefreshCw size={12}/> {t("Roll 4d6")}</GBtn>
      </div>
      <GFld label={t("Background Ability Boost")}>
        <select value={boost} onChange={e=>setBoost(e.target.value)} style={inp}><option value="+2/+1">+2/+1</option><option value="+1/+1/+1">+1/+1/+1</option><option value="None">{t("None")}</option></select>
        {boost==="None"?null:boost==="+2/+1"?(
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
      <div className="mob-3col" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.5rem"}}>
        {AB.map(a=>(<div key={a} style={{background:a===primaryAb?"#2d2400":G.card,borderRadius:"0.75rem",padding:"0.6rem",border:"1px solid "+(a===primaryAb?G.gold:G.border),textAlign:"center",position:"relative"}}>{a===primaryAb&&<div style={{position:"absolute",top:"-0.55rem",left:"50%",transform:"translateX(-50%)",background:G.gold,color:G.bg,fontSize:"0.5rem",fontWeight:800,padding:"0.05rem 0.35rem",borderRadius:"0.3rem",textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{t("Key ability")}</div>}<div style={{fontSize:"0.65rem",color:a===primaryAb?G.gold:G.dim,letterSpacing:"0.1em",fontWeight:a===primaryAb?800:400}}>{a}</div><input type="number" min={smode==="Manual"?8:3} max={smode==="Manual"?15:smode==="Rolled"?18:20} value={base[a]||8} disabled={smode==="Standard Array"} onFocus={e=>e.target.select()} onChange={e=>{let v=Number(e.target.value)||0;if(smode==="Rolled"){v=Math.max(3,Math.min(18,v));setRstats(prev=>({...prev,[a]:v}));}else{v=Math.max(8,Math.min(15,v));setMstats(prev=>{const next={...prev,[a]:v};if(pointBuySpent(next)>PB_BUDGET)return prev;return next;});}}} style={{...inp,textAlign:"center",padding:"0.3rem",marginTop:"0.25rem",fontSize:"1.1rem",fontWeight:700}}/><div style={{fontSize:"0.7rem",color:G.gold,marginTop:"0.2rem"}}>{fin[a]} ({sgn(mf(fin[a]))})</div><div title={abilDesc(a)} style={{fontSize:"0.55rem",color:G.dim,marginTop:"0.15rem",lineHeight:1.15}}>{abilTag(a)}</div></div>))}
      </div>
      <div style={{marginTop:"1rem",background:G.card,borderRadius:"0.75rem",padding:"0.75rem"}}>
        {(()=>{const effSk=selSk.filter(s=>!bgo.sk.includes(s));const overCount=effSk.filter(s=>!allSc.includes(s)).length+Math.max(0,effSk.filter(s=>allSc.includes(s)).length-maxSk);return <div style={{fontSize:"0.75rem",color:overCount>0?"#f97316":G.muted,marginBottom:"0.5rem"}}>{t("Skills")} ({t("choose")} {maxSk} {t("for")} {cn}){overCount>0?<span style={{fontWeight:700}}> · {overCount} {t("over the rules")} ⚠</span>:""}</div>;})()}
        {(()=>{const effSk=selSk.filter(s=>!bgo.sk.includes(s));const legalSet=new Set(effSk.filter(s=>allSc.includes(s)).slice(0,maxSk));return <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>{SKILL_LIST.map(({name:s})=>{const fromBg=bgo.sk.includes(s);if(fromBg)return <button key={s} disabled title={skillDesc(s)+" — "+t("from Background")+": "+bg} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px solid #3b82f6",cursor:"default",background:"#3b82f6",color:"#020817",fontWeight:700,opacity:0.9}}>◆ {s}</button>;const sel=selSk.includes(s);const inClass=allSc.includes(s);const extra=sel&&!legalSet.has(s);return <button key={s} title={extra?skillDesc(s)+" — "+t("over the rules"):(inClass?skillDesc(s):skillDesc(s)+" — "+t("not a class skill"))} onClick={()=>togSk(s)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px "+(sel||inClass?"solid":"dashed")+" "+(sel?(extra?"#f97316":G.gold):inClass?"#334155":"#475569"),cursor:"pointer",background:sel?(extra?"#f97316":G.gold):"transparent",color:sel?"#020817":inClass?"#f1f5f9":G.dim,fontWeight:sel?700:400}}>{extra?"⚠ ":""}{s}</button>;})}</div>;})()}
        <div style={{marginTop:"0.4rem",fontSize:"0.62rem",color:"#3b82f6"}}>◆ {t("from Background")}</div>
        <div className="mob-2col" style={{marginTop:"0.5rem",fontSize:"0.62rem",color:G.dim,lineHeight:1.4,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.15rem 0.75rem"}}>{SKILL_LIST.map(({name:s})=><div key={s}><b style={{color:G.muted}}>{s}:</b> {skillDesc(s)}</div>)}</div>
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
      {hasFindFamiliar&&(
        <div style={{marginTop:"1rem",background:G.card,borderRadius:"0.75rem",padding:"0.75rem"}}>
          <div style={{fontSize:"0.75rem",color:G.muted}}>{t("Find Familiar: all possible animal forms are shown on the character sheet.")}</div>
        </div>
      )}
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
          <div style={{flex:1}}><div style={{fontSize:"0.8rem",fontWeight:700,color:sel?"#e9d5ff":"#e2e8f0"}}>{name}{info[2]?<span style={{fontSize:"0.6rem",color:"#a78bfa",marginLeft:"0.4rem",border:"1px solid #6d28d9",borderRadius:"0.3rem",padding:"0 0.3rem"}}>{info[2]}</span>:""}</div><div style={{fontSize:"0.72rem",color:G.muted,lineHeight:1.35}}>{info[invLang]}</div>
            {sel&&name==="Lessons of the First Ones"&&<div onClick={e=>e.stopPropagation()} style={{marginTop:"0.5rem",paddingTop:"0.4rem",borderTop:"1px solid #4c1d95"}}>
              <div style={{fontSize:"0.68rem",color:"#c4b5fd",marginBottom:"0.3rem"}}>{t("Choose an Origin feat")}:</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>{ORIGIN_FEATS.map(f=>{const fsel=lessonsFeat===f;return <button key={f} onClick={()=>setLessonsFeat(fsel?"":f)} style={{padding:"0.2rem 0.5rem",borderRadius:"0.45rem",fontSize:"0.7rem",border:"1px solid "+(fsel?"#a78bfa":"#334155"),cursor:"pointer",background:fsel?"#7c3aed":"transparent",color:fsel?"#fff":"#f1f5f9",fontWeight:fsel?700:400}}>{f}</button>;})}</div>
              {lessonsFeat==="Magic Initiate"&&miPicker()}
              {lessonsFeat==="Skilled"&&skilledPicker()}
            </div>}
          </div>
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
  const metamagicBlock=isSorcerer&&sorcererLvl>=2?(<div style={{marginBottom:"1rem",background:"#1a1035",border:"1px solid #4c1d95",borderRadius:"1rem",padding:"0.85rem 1rem"}}>
    <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.6rem"}}>
      <span style={{fontSize:"0.85rem",fontWeight:800,color:"#c4b5fd"}}>{t("Metamagic")}</span>
      <span style={{fontSize:"0.75rem",fontWeight:700,color:selMetamagic.length>=metamagicLimit?"#4ade80":"#c4b5fd",background:"#2e1065",border:"1px solid #6d28d9",borderRadius:"0.5rem",padding:"0.15rem 0.5rem"}}>{selMetamagic.length} / {metamagicLimit}</span>
      <span style={{fontSize:"0.68rem",color:G.dim}}>{t("Spend Sorcery Points to modify spells you cast")}</span>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:"0.3rem",maxHeight:"46vh",overflowY:"auto",paddingRight:"0.25rem"}}>
      {Object.entries(METAMAGIC_OPTIONS).map(([name,info])=>{const sel=selMetamagic.includes(name);const atMax=selMetamagic.length>=metamagicLimit;const blocked=!sel&&atMax;return(
        <div key={name} onClick={()=>!blocked&&togMetamagic(name)} style={{display:"flex",alignItems:"flex-start",gap:"0.5rem",padding:"0.4rem 0.6rem",borderRadius:"0.6rem",cursor:blocked?"not-allowed":"pointer",opacity:blocked?0.4:1,background:sel?"#4c1d9544":"transparent",border:"1px solid "+(sel?"#a78bfa":"#332255")}}>
          <span style={{flexShrink:0,width:"1.1rem",height:"1.1rem",borderRadius:"0.3rem",border:"1px solid "+(sel?"#a78bfa":"#555"),background:sel?"#7c3aed":"transparent",color:"#fff",fontSize:"0.8rem",fontWeight:900,textAlign:"center",lineHeight:"1.05rem",marginTop:"1px"}}>{sel?"✓":""}</span>
          <div style={{flex:1}}><div style={{fontSize:"0.8rem",fontWeight:700,color:sel?"#e9d5ff":"#e2e8f0"}}>{name}<span style={{fontSize:"0.6rem",color:"#a78bfa",marginLeft:"0.4rem",border:"1px solid #6d28d9",borderRadius:"0.3rem",padding:"0 0.3rem"}}>{info[2]}</span></div><div style={{fontSize:"0.72rem",color:G.muted,lineHeight:1.35}}>{info[CURRENT_LANG==="da"?1:0]}</div></div>
        </div>);})}
    </div>
  </div>):null;
  const savantBlock=wizSchool?(<div style={{marginBottom:"1rem",background:"#1a1035",border:"1px solid #4c1d95",borderRadius:"1rem",padding:"0.85rem 1rem"}}>
    <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.6rem"}}>
      <span style={{fontSize:"0.85rem",fontWeight:800,color:"#c4b5fd"}}>{sub} {t("Savant")}</span>
      <span style={{fontSize:"0.75rem",fontWeight:700,color:selSavant.length>=savantBudget?"#4ade80":"#c4b5fd",background:"#2e1065",border:"1px solid #6d28d9",borderRadius:"0.5rem",padding:"0.15rem 0.5rem"}}>{selSavant.length} / {savantBudget}</span>
      <span style={{fontSize:"0.68rem",color:G.dim}}>{t("Free")} {wizSchool} {t("spells added to your spellbook")}</span>
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem",maxHeight:"46vh",overflowY:"auto",paddingRight:"0.25rem"}}>
      {savantPool.map(name=>{const sel=selSavant.includes(name);const atMax=selSavant.length>=savantBudget;const blocked=!sel&&atMax;return(
        <button key={name} disabled={blocked} onClick={()=>togSavant(name)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px solid "+(sel?"#a78bfa":"#332255"),cursor:blocked?"not-allowed":"pointer",opacity:blocked?0.4:1,background:sel?"#4c1d9544":"transparent",color:sel?"#e9d5ff":"#e2e8f0",fontWeight:sel?700:400}}>{name}</button>
      );})}
    </div>
  </div>):null;
  const loreBlock=isLore?(<div style={{marginBottom:"1rem",background:"#1a1035",border:"1px solid #4c1d95",borderRadius:"1rem",padding:"0.85rem 1rem"}}>
    <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.6rem"}}>
      <span style={{fontSize:"0.85rem",fontWeight:800,color:"#c4b5fd"}}>{t("Magical Discoveries")}</span>
      <span style={{fontSize:"0.75rem",fontWeight:700,color:selLore.length>=loreBudget?"#4ade80":"#c4b5fd",background:"#2e1065",border:"1px solid #6d28d9",borderRadius:"0.5rem",padding:"0.15rem 0.5rem"}}>{selLore.length} / {loreBudget}</span>
      <span style={{fontSize:"0.68rem",color:G.dim}}>{t("Always-prepared spells from the Cleric, Druid, or Wizard list")}</span>
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem",maxHeight:"46vh",overflowY:"auto",paddingRight:"0.25rem"}}>
      {lorePool.map(name=>{const sel=selLore.includes(name);const atMax=selLore.length>=loreBudget;const blocked=!sel&&atMax;return(
        <button key={name} disabled={blocked} onClick={()=>togLore(name)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",fontSize:"0.73rem",border:"1px solid "+(sel?"#a78bfa":"#332255"),cursor:blocked?"not-allowed":"pointer",opacity:blocked?0.4:1,background:sel?"#4c1d9544":"transparent",color:sel?"#e9d5ff":"#e2e8f0",fontWeight:sel?700:400}}>{name}</button>
      );})}
    </div>
  </div>):null;
  const spellsPanel=isCaster?(<div>
    {invocationsBlock}
    {savantBlock}
    {loreBlock}
    {metamagicBlock}
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

  const creatorPanel=(<div className="mob-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
    <div style={{background:"rgba(15,23,42,0.8)",border:"1px solid "+G.border,borderRadius:"1rem",padding:"1rem"}}><div style={{fontSize:"0.75rem",fontWeight:700,color:G.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.75rem"}}>{t("Identity")}</div>{identityPanel}</div>
    <div style={{background:"rgba(15,23,42,0.8)",border:"1px solid "+G.border,borderRadius:"1rem",padding:"1rem"}}>
      <div style={{fontSize:"0.75rem",fontWeight:700,color:G.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.75rem"}}>{t("Ability Scores & Skills")}</div>
      {statsPanel}
      <div style={{marginTop:"1rem",borderTop:"1px solid "+G.border,paddingTop:"1rem"}}>
        <div style={{fontSize:"0.75rem",fontWeight:700,color:G.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.75rem"}}>{t("Feats")}</div>
        {buildFeatsPanel()}
      </div>
    </div>
  </div>);
  const panelContent={overview:buildOverview(),creator:creatorPanel,spells:spellsPanel,equipment:<EquipmentPanel cn={cn} level={level} dm={dm} sm={sm} pb={pb} equipped={equipped} equipItem={equipItem} coins={coins} setCoins={setCoins} ac={ac} masteredWeapons={masteredWeapons} setMasteredWeapons={setMasteredWeapons} selWeapons={selWeapons} setSelWeapons={setSelWeapons} inventory={inventory} setInventory={setInventory} purchases={purchases} setPurchases={setPurchases} ownedExtra={ownedExtra} setOwnedExtra={setOwnedExtra}/>,notes:notesPanel};
  const panelMeta={overview:{title:t("Combat Overview"),icon:<Shield size={15}/>},creator:{title:t("Character Creator"),icon:<Shield size={15}/>},spells:{title:t("Spells"),icon:<Zap size={15}/>},equipment:{title:t("Equipment & Weapons"),icon:<Package size={15}/>},notes:{title:t("Personality & Notes"),icon:<BookOpen size={15}/>}};

  return(<div className="mob-page-pad" style={{minHeight:"100vh",background:G.bg,color:"#f1f5f9",padding:"1.5rem",fontFamily:"system-ui,sans-serif",userSelect:"none"}}>
    <style>{`button:active{opacity:1!important}button:focus{outline:none}*{-webkit-tap-highlight-color:transparent}input,textarea,select{user-select:text!important;-webkit-user-select:text!important}
      @media (max-width:720px){
        .mob-page-pad{padding:0.75rem!important}
        .mob-2col{grid-template-columns:1fr!important}
        .mob-3col{grid-template-columns:repeat(2,1fr)!important}
        .mob-mc{grid-template-columns:1fr!important}
      }
      @media (max-width:420px){
        .mob-3col{grid-template-columns:1fr!important}
      }
    `}</style>
    <div style={{maxWidth:"900px",margin:"0 auto"}}>
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"flex-end",justifyContent:"space-between",gap:"1rem",marginBottom:"1.5rem"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",color:G.gold,marginBottom:"0.5rem"}}><Dice5 size={22}/><span style={{fontSize:"0.7rem",letterSpacing:"0.15em",textTransform:"uppercase"}}>{t("D&D 2024-inspired quick builder")}</span></div>
          <h1 style={{fontSize:"clamp(1.6rem,4vw,2.5rem)",fontWeight:900,margin:0,lineHeight:1.1}}>CharacterGeneratorRPG</h1>
          <div style={{fontSize:"0.8rem",color:G.dim,marginTop:"0.3rem"}}>{t("Generate and customize your RPG character with stats, spells and gear — in seconds.")} {t("Made by")} <a href="https://asaheim.dk" target="_blank" rel="noopener noreferrer" style={{color:G.gold,textDecoration:"underline"}}>asaheim.dk</a></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",alignItems:"flex-start"}}>
          <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",border:"1px solid "+G.border,borderRadius:"0.6rem",overflow:"hidden"}}>
              {[["da","DA"],["en","EN"]].map(([code,label])=><button key={code} onClick={()=>switchLang(code)} style={{padding:"0.4rem 0.6rem",fontSize:"0.75rem",fontWeight:800,border:"none",cursor:"pointer",background:lang===code?G.gold:"transparent",color:lang===code?G.bg:G.muted}}>{label}</button>)}
            </div>
            <GBtn onClick={rand} gold><RotateCcw size={15}/> {t("Randomize")}</GBtn>
            <GBtn onClick={genSheet} amber><Printer size={15}/> {t("Generate Sheet")}</GBtn>
            <GBtn onClick={levelUpCharacter} gold><ChevronUp size={15}/> {t("Level Up")}</GBtn>
          </div>
          <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",alignItems:"center"}}>
            <GBtn onClick={saveToSlot} gold><span>👤</span> {t("Save Character")}</GBtn>
            <GBtn onClick={()=>setShowCharPanel(v=>!v)}><span>👥</span> {t("My Characters")} {savedChars.length?"("+savedChars.length+")":""}</GBtn>
            <GBtn onClick={exportCharacter}><span>💾</span> {t("Export JSON")}</GBtn>
            <GBtn onClick={()=>fileInputRef.current.click()}><span>📂</span> {t("Import JSON")}</GBtn>
            <input ref={fileInputRef} type="file" accept=".json" style={{display:"none"}} onChange={importCharacter}/>
          </div>
        </div>
      </div>
      {showCharPanel&&<div style={{background:"rgba(15,23,42,0.95)",border:"1px solid "+G.gold,borderRadius:"1rem",padding:"1rem 1.25rem",marginBottom:"1rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.65rem"}}>
          <span style={{fontWeight:800,color:G.gold,fontSize:"0.9rem"}}>{t("My Characters")}</span>
          <GBtn small onClick={saveAsNewSlot}>+ {t("Save as New")}</GBtn>
        </div>
        {savedChars.length===0?<div style={{fontSize:"0.8rem",color:G.dim,fontStyle:"italic"}}>{t("No saved characters yet. Click \"Save Character\" to store this one in your browser.")}</div>:
        <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
          {[...savedChars].sort((a,b)=>b.updatedAt-a.updatedAt).map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:"0.6rem",padding:"0.5rem 0.7rem",borderRadius:"0.65rem",background:activeSlotId===s.id?"#4a3800":G.card,border:"1px solid "+(activeSlotId===s.id?G.gold:G.border)}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:"0.85rem",color:activeSlotId===s.id?G.gold:"#f1f5f9"}}>{s.name}{activeSlotId===s.id?" ("+t("active")+")":""}</div>
                <div style={{fontSize:"0.68rem",color:G.dim}}>{s.classLevel} · {new Date(s.updatedAt).toLocaleString()}</div>
              </div>
              <GBtn small onClick={()=>{loadSlot(s.id);setShowCharPanel(false);}}>{t("Load")}</GBtn>
              <button onClick={()=>deleteSlot(s.id)} title={t("Delete")} style={{background:"transparent",border:"1px solid #7f1d1d",color:"#f87171",borderRadius:"0.5rem",padding:"0.3rem 0.5rem",cursor:"pointer",fontSize:"0.75rem"}}>🗑</button>
            </div>
          ))}
        </div>}
      </div>}

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

      <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        {panelOrder.filter(pid=>pid!=="spells"||isCaster).map(pid=>(<CPanel key={pid} title={panelMeta[pid].title} icon={panelMeta[pid].icon} collapsed={!!collapsed[pid]} onToggle={()=>togCollapsed(pid)} dragging={draggingPanel===pid} onDragStart={()=>onDragStart(pid)} onDrop={()=>onDrop(pid)}>{panelContent[pid]}</CPanel>))}
      </div>
    </div>
  </div>);
}
// Five shared UI type sizes. The adaptive scale gives compact text extra relative growth.
export const FONT_TIERS=[
 {id:'xs',key:'fontXS',label:'Small · captions and metadata',size:12},
 {id:'sm',key:'fontSM',label:'Compact · controls and navigation',size:14},
 {id:'md',key:'fontMD',label:'Body · entries and paragraphs',size:16},
 {id:'lg',key:'fontLG',label:'Section · cards and dialogs',size:22},
 {id:'xl',key:'fontXL',label:'Display · page titles and totals',size:34}
];
export function fontSizes(settings={}){
 const raw=Number(settings.uiFontScale),scale=Number.isFinite(raw)&&raw>=80&&raw<=150?raw/100:1;
 const bases=FONT_TIERS.map(tier=>{const n=Number(settings[tier.key]);return Number.isFinite(n)&&n>=10&&n<=64?n:tier.size}),smallest=Math.min(...bases),largest=Math.max(...bases);
 return FONT_TIERS.map((tier,i)=>{
  const base=bases[i],weight=largest===smallest?0:(largest-base)/(largest-smallest);
  // The actual largest size scales linearly; the actual smallest gets twice the relative change.
  const multiplier=1+(scale-1)*(1+weight);
  return {...tier,base,value:Math.round(base*multiplier*100)/100};
 });
}
export function applyTypography(settings={},style=document.documentElement.style){
 for(const tier of fontSizes(settings))style.setProperty('--font-'+tier.id,tier.value+'px');
}

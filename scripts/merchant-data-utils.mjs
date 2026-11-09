export const round=n=>Math.round((n+Number.EPSILON)*100)/100;
export const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function packWeight(label){
 const s=normalize(label).replaceAll(',','.');
 const lot=s.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(kg|g)\b/);
 if(lot)return +lot[1]*(+lot[2])/(lot[3]==='g'?1000:1);
 const packs=[...s.matchAll(/(\d+(?:\.\d+)?)\s*(kg|g)\b/g)];
 if(!packs.length)return null;
 if(packs.length>1&&!/\+.*offert/i.test(s))return null;
 return packs.reduce((n,m)=>n+(+m[1])/(m[2]==='g'?1000:1),0);
}
export function zoomaliaValues(record){
 const values={},units={};
 const fields=[[/^proteine/,'proteines'],[/matiere.*grasse/,'matieresGrasses'],[/cendre|inorganique/,'cendres'],[/fibre.*cellulose|cellulose/,'fibres'],[/^humidite/,'humidite'],[/^glucide/,'glucides'],[/^calcium/,'calcium'],[/^phosphore/,'phosphore'],[/^magnesium/,'magnesium'],[/^sodium/,'sodium'],[/^potassium/,'potassium'],[/^omega\s*3/,'omega3'],[/^omega\s*6/,'omega6']];
 for(const [label,raw]of record.analysis||[]){
  if(!/^\d+(?:[.,]\d+)?$/.test(raw||''))continue;
  const n=+raw.replace(',','.');const name=normalize(label);
  if(/energie/.test(name)&&/kg/.test(name)&&n>=1000&&n<=6000){values.energie=n;units.energie='kcal/kg';continue;}
  const field=fields.find(([re])=>re.test(name))?.[1];
  if(field&&/%/.test(label)&&n>=0&&n<=100){values[field]=n;units[field]='%';}
 }
 const ingredients=String(record.ingredients||'');
 const mineralBlock=ingredients.split(/Minéraux et Vitamines/i)[1]||'';
 const mineralFields=[['Magnesium','magnesium','%'],['Magnésium','magnesium','%'],['Sodium','sodium','%'],['Potassium','potassium','%'],['Amidon','amidon','%'],['EPA/DHA','epaDha','%'],['Acides gras DHA','dha','%'],['Acides gras EPA','epa','%'],['Taurine','taurine','mg/kg']];
 for(const [label,field,unit]of mineralFields){
  const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp(escaped+'\\s*\\('+unit.replace('/','\\/')+'\\)\\s*(\\d+(?:[.,]\\d+)?)','i');
  const m=mineralBlock.match(re);if(m){const n=+m[1].replace(',','.');if(n>=0&&(unit==='%'?n<=100:n<=10000)){values[field]=n;units[field]=unit;}}
 }
 return {values,units};
}
export function zoomaliaCopy(record){
 const raw=String(record.ingredients||'');
 const main=raw.split(/\nIngrédients\s*\n/i)[1]||'';
 const composition=main.split(/\nMinéraux et Vitamines\s*\n/i)[0]?.trim()||null;
 return {composition,additifs:raw.split(/\nMinéraux et Vitamines\s*\n/i)[1]?.trim()||null,ration:record.rations?.replace(/^TABLEAU DES RATIONS\s*/,'').trim()||null};
}

import fs from 'node:fs';
import vm from 'node:vm';
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['fabricants.js','catalogue.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const results=JSON.parse(fs.readFileSync('reports/zooplus-price-candidates.json','utf8'));
const pool=[...new Map(results.flatMap(x=>x.candidates).map(x=>[x.url,x])).values()];
export function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/sterili[sz]ed|sterilise/g,' sterilise ').replace(/chicken/g,'poulet').replace(/duck/g,'canard').replace(/lamb/g,'agneau').replace(/salmon/g,'saumon').replace(/rice/g,'riz').replace(/\b(?:and|et)\b|&/g,' ').replace(/\badulte\b/g,'adult').replace(/\bvolaille\b/g,'poulet').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();}
const stop=new Set('pour chien chat chiens chats croquettes avec aux les des de du au a en et and breed races race grande petites petite sans grain free heritage regionals aliment alimentation complet au science plan purina'.split(' '));
const tokens=s=>normalize(s).split(' ').filter(x=>!stop.has(x));
function rank(p,c){
 const species=p.espece==='chien'?'DOGS':'CATS';
 if(!c.species?.includes(species)||!c.url.includes('/croquettes_')||c.unit!=='kg')return -1;
 const brand=tokens(p.marque),ct=tokens(c.title+' '+(c.brands||[]).join(' '));
 if(!brand.every(t=>ct.includes(t)))return -1;
 const pt=tokens(p.recette.replace(/\(ex-[^)]*\)/g,'')),title=tokens(c.title+' '+c.format);
 const unique=[...new Set(pt)],shared=unique.filter(t=>title.includes(t)).length;
let result=0.75*shared/Math.max(1,unique.length)+0.25*shared/Math.max(1,new Set(title.filter(t=>!brand.includes(t))).size);
for(const t of ['puppy','junior','kitten','senior','sterilise','neutered','light','sensitive','hypoallergenic'])if(title.includes(t)&&!pt.includes(t))result-=0.5;
return result;
}
const proposals=ctx.window.CROCamiCatalog.map(p=>{
 const ranked=pool.map(c=>({score:rank(p,c),...c})).filter(c=>c.score>=0).sort((a,b)=>b.score-a.score);
 const seen=new Set();const top=ranked.filter(c=>{if(seen.has(c.title))return false;seen.add(c.title);return true;}).slice(0,4);
 return {id:p.id,name:p.marque+' '+p.recette,candidates:top};
});
fs.writeFileSync('reports/merchant-match-review.json',JSON.stringify(proposals,null,2)+'\n');
for(const p of proposals)console.log(p.id+' | '+p.name+' => '+p.candidates.map((c,i)=>i+':'+c.title+' ['+c.score.toFixed(2)+']').join(' / '));

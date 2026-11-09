import fs from 'node:fs';
import vm from 'node:vm';
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['fabricants.js','catalogue.js','references-complementaires.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const records=JSON.parse(fs.readFileSync('reports/zoomalia-live.json','utf8'));
const pool=[...new Map(records.flatMap(r=>r.candidates||r.links||[]).map(c=>[c.url,c])).values()];
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/œ/g,'oe').replace(/chicken/g,'poulet').replace(/duck/g,'canard').replace(/lamb/g,'agneau').replace(/salmon/g,'saumon').replace(/turkey/g,'dinde').replace(/rice/g,'riz').replace(/sterili[sz]ed|sterilise/g,'sterilise').replace(/\badulte\b/g,'adult').replace(/\band\b|&/g,' ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const stop=new Set('pour chien chiens chat chats croquettes croquette de du au aux avec et and the breed races race heritage regionals science plan natural superpremium sans grain free'.split(' '));
const tokens=s=>norm(s).split(' ').filter(t=>!stop.has(t));
function rank(p,c){
 const text=c.name||'';
 if(/pâtée|mousse|terrine|en sauce|boîte|humide|friandise|sachet fraîcheur|snack|toppers|stew|conserve|complément|housse|panier|coussin/i.test(text))return -1;
 if(p.espece==='chien'&&/\bchat(?:on)?s?\b/i.test(text)||p.espece==='chat'&&/\bchien(?:ne)?s?|\bchiot/i.test(text))return -1;
 const brand=tokens(p.marque.replace(/^Purina (?!One)/i,'').replace(/^Affinity /i,'')),ct=tokens(text);
 if(!brand.every(t=>ct.includes(t)))return -1;
 const pt=tokens(p.recette.replace(/\(ex-[^)]*\)/g,''));const unique=[...new Set(pt)],shared=unique.filter(t=>ct.includes(t)).length;
 let score=.75*shared/Math.max(1,unique.length)+.25*shared/Math.max(1,new Set(ct.filter(t=>!brand.includes(t))).size);
 for(const t of ['puppy','junior','kitten','senior','sterilise','neutered','light','sensitive','hypoallergenic','indoor'])if(ct.includes(t)&&!pt.includes(t))score-=.45;
 return score;
}
const proposals=ctx.window.CROCamiCatalog.map(p=>({id:p.id,name:p.marque+' '+p.recette,candidates:pool.map(c=>({...c,score:rank(p,c)})).filter(c=>c.score>=0).sort((a,b)=>b.score-a.score).slice(0,4)}));
fs.writeFileSync('reports/zoomalia-match-review.json',JSON.stringify(proposals,null,2)+'\n');
for(const p of proposals)console.log(p.id+' | '+p.name+' => '+p.candidates.map((c,i)=>i+':'+c.name+' ['+c.score.toFixed(2)+']').join(' / '));

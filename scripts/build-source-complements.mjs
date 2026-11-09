import fs from 'node:fs';
import assert from 'node:assert/strict';
import {packWeight,round} from './merchant-data-utils.mjs';
const reviewed=JSON.parse(fs.readFileSync('reports/source-complements-reviewed.json','utf8'));
const photos=JSON.parse(fs.readFileSync('reports/photo-optimisation.json','utf8'));
const searches=JSON.parse(fs.readFileSync('reports/price-recheck-results.json','utf8'));
const details=JSON.parse(fs.readFileSync('reports/price-recheck-product-details.json','utf8'));
const priceSelections=[
 {id:'mq-dog-043',title:'Brit Fresh Dinde avec pois light Fit & Slim',species:'DOGS',note:'Offre de nouveau disponible ; recette dinde, pois, riz, pommes et avoine confirmée sur la fiche produit.'},
 {id:'mq-cat-006',title:'ACANA Pacifica pour chat 4,5 kg',note:'Même recette poisson identifiée par la liste des ingrédients et le format explicitement nommé.'},
 {id:'mq-cat-060',title:'Simpsons Premium Adult 90/10 pour chat',note:'La composition détaillée correspond au mélange de viandes et poissons de la fiche principale : poulet 38 %, hareng 9 %, saumon 8 %, dinde 7,5 %.'},
 {id:'mq-cat-011',title:'Alleva - Croquettes Sans Céréales Poulet & Canard pour Chaton',condition:'Formulation actuelle différente de la fiche principale : poulet frais 20 % et canard 12 % chez le marchand. Vérifier le sac.',note:'Même nom et même stade de vie, mais formulation signalée séparément ; ce tarif ne remplace pas le prix de la fiche principale.'}
];
const data=Object.fromEntries(reviewed.map(r=>[r.id,{...r,dateConsultationSources:'2026-11-09'}]));
const addedOffers=[];
for(const item of priceSelections){
 const detail=details.find(d=>d.id===item.id);assert.equal(detail?.status,200);
 const candidates=searches.flatMap(s=>s.candidates).filter(c=>c.title===item.title&&c.available&&c.species?.includes(item.species||'CATS'));
 const seen=new Set();
 for(const c of candidates){
  if(seen.has(c.url))continue;seen.add(c.url);
  const kg=packWeight(c.format);assert.ok(kg>0);
  const unit=round(c.price/kg);assert.ok(Math.abs(unit-c.priceKg)<=0.02,'Published weight/price mismatch');
  const offer={marchand:'Zooplus',vendeur:c.seller||'Zooplus',format:c.format,formatKg:kg,prixSac:c.price,prixKg:unit,url:c.url,disponible:true,datePrix:'2026-11-09',typeReleve:'page produit',...(item.condition?{condition:item.condition}:{})};
  data[item.id]={...(data[item.id]||{}),sourceRevendeur:detail.url,offresComplementaires:[...(data[item.id]?.offresComplementaires||[]),offer]};addedOffers.push({id:item.id,...offer,note:item.note});
 }
}
for(const p of photos){assert.ok(fs.existsSync(p.localPath));assert.ok(p.after>0&&p.after<=p.before);data[p.id]={...(data[p.id]||{}),imageProduit:p.localPath,sourceImageProduit:p.source,imageWidth:p.width||400,imageHeight:p.height||400};}
const apply=`
window.CROCamiCatalog=window.CROCamiCatalog.map(p=>{
 const patch=window.CROCamiSourceComplements[p.id];if(!patch)return p;
 const {offresComplementaires,...fields}=patch;
 const offres=[...(offresComplementaires||[]),...(p.offres||[])].sort((a,b)=>String(b.datePrix||'').localeCompare(String(a.datePrix||''))).filter((o,i,a)=>a.findIndex(x=>[x.marchand,x.vendeur,x.url,x.format].join('|')===[o.marchand,o.vendeur,o.url,o.format].join('|'))===i);
 const regular=offres.filter(o=>o.disponible&&!o.condition&&!o.prixKgRecalcule&&(!p.datePrix||o.datePrix>=p.datePrix));
 const same=regular.filter(o=>o.formatKg===p.formatKg);
 const preferred=(same.length?same:regular.filter(o=>!/[x×]/i.test(o.format))).sort((a,b)=>a.prixKg-b.prixKg)[0];
 return {...p,...fields,offres,...(offresComplementaires?.length?{verificationPrix:{...p.verificationPrix,zooplus:offresComplementaires.some(o=>!o.condition)?'prix vérifié':'offre de formulation actuelle distincte'}}:{}),...(preferred?{prixSac:preferred.prixSac,prixKg:preferred.prixKg,formatKg:preferred.formatKg,vendeur:preferred.marchand+(preferred.vendeur!==preferred.marchand?' — '+preferred.vendeur:''),datePrix:preferred.datePrix,urlVendeur:preferred.url}: {})};
});
`;
fs.writeFileSync('complements-sources.js','/* Sources, prix et visuels vérifiés le 9 novembre 2026. Aucune valeur nutritionnelle remplacée. */\nwindow.CROCamiSourceComplements='+JSON.stringify(data,null,2)+';\n'+apply);
fs.writeFileSync('reports/source-price-additions.json',JSON.stringify({date:'2026-11-09',sources:reviewed,offers:addedOffers,photos:photos.map(p=>({...p,visualChecked:true})),rejected:[{id:'mq-cat-044',reason:'La fiche Zooplus générique Monge Adult décrit le poulet ; la fiche Crocami décrit le saumon.'},{id:'mq-cat-011',reason:'Deux autres annonces Alleva affichent 1,5 kg avec un prix au kilo correspondant à un poids différent : tarifs exclus.'}]},null,2)+'\n');
console.log(JSON.stringify({sourceRecords:reviewed.length,additionalOffers:addedOffers.length,optimisedPhotos:photos.length,photoBytesBefore:photos.reduce((n,p)=>n+p.before,0),photoBytesAfter:photos.reduce((n,p)=>n+p.after,0)}));

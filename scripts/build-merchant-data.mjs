import fs from 'node:fs';
import vm from 'node:vm';
import {round,normalize,packWeight,zoomaliaValues,zoomaliaCopy} from './merchant-data-utils.mjs';
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['fabricants.js','catalogue.js','references-complementaires.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const products=ctx.window.CROCamiCatalog;
const searches=JSON.parse(fs.readFileSync('reports/zooplus-price-candidates.json','utf8'));
const approved=JSON.parse(fs.readFileSync('reports/approved-merchant-products.json','utf8'));
const details=JSON.parse(fs.readFileSync('reports/zooplus-product-details.json','utf8'));
const zRecords=JSON.parse(fs.readFileSync('reports/zoomalia-live.json','utf8'));
const zApproved=JSON.parse(fs.readFileSync('reports/approved-zoomalia-products.json','utf8'));
const photos=JSON.parse(fs.readFileSync('reports/merchant-photo-audit-2026-11-09.json','utf8'));
const pool=[...new Map(searches.flatMap(r=>r.candidates).map(c=>[c.url,c])).values()];
for(const p of products.filter(p=>p.id.startsWith('zp-'))){const c=pool.find(c=>c.url.split('?')[0]===p.sourceRevendeur);if(c)approved.push({id:p.id,title:c.title,url:c.url});}
const additionalTitles={'zm-cat-proplan-sterilised-salmon':'PURINA PRO PLAN Sterilised Adult Renal Plus saumon','zm-cat-proplan-sterilised-rabbit':'PURINA PRO PLAN Sterilised Adult Renal Plus lapin pour chat','zm-cat-hills-sterilised-chicken':" Hill's Science Plan Sterilised Cat Adult 1-6 poulet",'zm-cat-hills-light-chicken':"Hill's Science Plan Adult Light poulet "};
for(const[id,title]of Object.entries(additionalTitles)){const c=pool.find(c=>c.title===title&&c.species?.includes('CATS'));if(c)approved.push({id,title:c.title,url:c.url});}
const zReject={d14:'La fiche du marchand décrit le poulet ; la référence Crocami est au bœuf.',c04:'La fiche mélange poulet et saumon ; les formats génériques ne permettent pas de rattacher la saveur avec certitude.'};
const fieldNames={'protéines brutes':'proteines','matières grasses brutes':'matieresGrasses','cellulose brute':'fibres','cendres brutes':'cendres','humidité':'humidite','calcium':'calcium','phosphore':'phosphore','magnésium':'magnesium','sodium':'sodium','acides gras oméga 3':'omega3','acides gras oméga 6':'omega6','potassium':'potassium','chlorure':'chlorure','amidon':'amidon','extrait non azoté':'glucides'};
const differences=(p,values)=>Object.entries(values).filter(([field,n])=>p[field]!=null&&Math.abs(p[field]-n)>.051).map(([field,n])=>({champ:field,catalogue:p[field],revendeur:n}));
const data={},anomalies=[];
for(const p of products){
 const match=approved.find(m=>m.id===p.id);
 const offers=match?pool.filter(c=>c.title===match.title&&c.species?.includes(p.espece==='chien'?'DOGS':'CATS')).flatMap(c=>{
  const kg=packWeight(c.format);
  if(!kg||!(c.price>0)||!c.priceKg||Math.abs(c.price/kg-c.priceKg)>.025)return [];
  return [{marchand:'Zooplus',vendeur:c.seller,format:c.format,formatKg:kg,prixSac:c.price,prixKg:round(c.price/kg),disponible:c.available===true,url:c.url,datePrix:'2026-11-09',sourceReleve:searches.find(r=>r.candidates.some(x=>x.url===c.url))?.url}];
 }):[];
 const d=match?details.find(d=>d.url===match.url?.split('?')[0]&&d.status===200&&d.title===match.title.trim()):null;
 const releves=[];
 if(d){
  const values={},units={};for(const [label,value]of d.analysis){
   const field=fieldNames[label.toLowerCase()];const m=value?.match(/^(\d+(?:[.,]\d+)?)\s*%$/);
   if(field&&m&&+m[1].replace(',','.')<=100){values[field]=+m[1].replace(',','.');units[field]='%';}
   if(label==='taurine'&&m&&+m[1].replace(',','.')<=.5){values.taurine=round(+m[1].replace(',','.')*10000);units.taurine='mg/kg';}
  }
  const parts=d.ingredients.split(/\bAdditifs\s*:?/i);
  releves.push({marchand:'Zooplus',url:d.url,date:'2026-11-09',valeurs:values,unites:units,ecarts:differences(p,values),composition:parts[0].replace(/^(?:Ingrédients|Composition)\s*:?\s*/i,'').trim(),additifs:parts.length>1?parts.slice(1).join(' Additifs ').trim():null,ration:d.feeding||null});
 }
 const zMatch=zApproved.find(m=>m.id===p.id);
 const live=zMatch&&!zReject[p.id]?zRecords.find(r=>r.offers&&r.url===zMatch.url):null;
 if(live){
  for(const o of live.offers){
   if(!o.price||!o.format)continue;
   const kg=packWeight(o.format),price=o.price.match(/^(\d+)\s*€\s*(\d{2})?/);
   if(!kg||!price){anomalies.push({id:p.id,url:live.url,reference:o.ref,raison:'Format ou prix non exploitable',format:o.format,prix:o.price});continue;}
   const amount=+price[1]+(price[2]?+price[2]/100:0),published=o.price.match(/\(([\d.,]+)€\/kg\)/)?.[1];
   if(!(amount>0))continue;
   const inconsistent=published!=null&&Math.abs(amount/kg-(+published.replace(',','.')))>.025;
   const condition=/reconditionn/i.test(o.format)?'Emballage reconditionné':/dluo/i.test(o.format)?'Date de durabilité spécifique':/ancien packaging|old/i.test(o.format)?'Ancien emballage':null;
   if(inconsistent)anomalies.push({id:p.id,url:live.url,reference:o.ref,raison:'Écart entre prix/kg publié et calculé',format:o.format,prixSac:amount,prixKgPublie:+published.replace(',','.'),prixKgCalcule:round(amount/kg)});
   offers.push({marchand:'Zoomalia',vendeur:'Zoomalia',format:o.format,formatKg:kg,prixSac:amount,prixKg:round(amount/kg),disponible:!/Non disponible|M.alerter|rupture/i.test(o.text||'')&&(o.available||/Acheter/.test(o.text||'')),stockNote:o.text?.match(/Expédié sous [^.Q]+/i)?.[0]?.trim()||null,url:live.url,datePrix:'2026-11-09',reference:o.ref,sourceReleve:live.url,condition,...(inconsistent?{prixKgRecalcule:true,prixKgPublie:+published.replace(',','.')}: {})});
  }
  const {values,units}=zoomaliaValues(live),copy=zoomaliaCopy(live);
  releves.push({marchand:'Zoomalia',url:live.url,date:'2026-11-09',valeurs:values,unites:units,ecarts:differences(p,values),...copy});
 }
 const photo=photos.find(f=>f.id===p.id);
 data[p.id]={offres:offers,relevesRevendeurs:releves,verificationPrix:{zooplus:offers.some(o=>o.marchand==='Zooplus')?'prix vérifié':match?'format ou prix non exploitable':'correspondance exacte non vérifiée',zoomalia:zReject[p.id]?'saveur non vérifiée':offers.some(o=>o.marchand==='Zoomalia')?'prix vérifié':live?'format ou prix non exploitable':'correspondance exacte non vérifiée'},...((!p.imageProduit||['vb-dog-dermatology-support','mq-dog-040'].includes(p.id))&&photo?{imageProduit:photo.localPath,sourceImageProduit:photo.sourceUrl}: {})};
}
const applyData=`
window.CROCamiCatalog = window.CROCamiCatalog.map(p => {
 const m=window.CROCamiMerchantData[p.id]||{};
 const offers=(m.offres||[]).filter(o=>o.disponible&&!o.condition&&!o.prixKgRecalcule);
 const same=offers.filter(o=>o.formatKg===p.formatKg);
 const preferred=(same.length?same:offers.filter(o=>!/[x×]/i.test(o.format))).sort((a,b)=>a.prixKg-b.prixKg)[0];
 return {...p,...m,...(preferred?{prixSac:preferred.prixSac,prixKg:preferred.prixKg,formatKg:preferred.formatKg,vendeur:preferred.marchand+(preferred.vendeur!==preferred.marchand?' — '+preferred.vendeur:''),datePrix:preferred.datePrix,urlVendeur:preferred.url}: {})};
});
`;
fs.writeFileSync('marchands.js','/* Relevés publics du 9 novembre 2026. Prix TTC hors livraison, sans abonnement. */\nwindow.CROCamiMerchantData = '+JSON.stringify(data,null,2)+';\n'+applyData);
const summary={date:'2026-11-09',products:products.length,searchedZooplus:searches.length,searchedZoomalia:zRecords.filter(r=>r.type==='search').length,zoomaliaAdditionalSearches:zRecords.filter(r=>r.type==='fallback-search').length,zoomaliaProductPages:zRecords.filter(r=>r.offers).length,withOffers:Object.values(data).filter(p=>p.offres.length).length,zooplus:Object.values(data).filter(p=>p.offres.some(o=>o.marchand==='Zooplus')).length,zoomalia:Object.values(data).filter(p=>p.offres.some(o=>o.marchand==='Zoomalia')).length,offers:Object.values(data).reduce((n,p)=>n+p.offres.length,0),withNutrition:Object.values(data).filter(p=>p.relevesRevendeurs.some(r=>Object.keys(r.valeurs).length)).length,localPhotos:photos.length,unverified:products.filter(p=>!data[p.id].offres.length).map(p=>({id:p.id,nom:p.marque+' '+p.recette,statut:'Aucune offre exacte vérifiée après recherche. Cela ne prouve pas une indisponibilité chez les marchands.'})),rejectedMatches:zReject};
fs.writeFileSync('reports/merchant-price-summary-2026-11-09.json',JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync('reports/merchant-data-anomalies-2026-11-09.json',JSON.stringify(anomalies,null,2)+'\n');
console.log(JSON.stringify({...summary,unverified:summary.unverified.length,anomalies:anomalies.length}));

import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {packWeight,round} from './merchant-data-utils.mjs';
// Mixed bundles and decimal pack weights affect the actual amount being compared.
assert.ok(Math.abs(packWeight('Lot de 3x 2,8kg')-8.4)<1e-9);
assert.equal(packWeight('10kg + 2kg OFFERTS'),12);
assert.equal(packWeight('1 article'),null);
const ctx={window:{addEventListener:()=>{}},document:{querySelectorAll:()=>[],querySelector:()=>null}};
vm.createContext(ctx);
for(const file of ['fabricants.js','catalogue.js','references-complementaires.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const nutritionalFields=['proteines','matieresGrasses','fibres','cendres','humidite','glucides','calcium','phosphore','magnesium','sodium','omega3','omega6','energie','taurine','compositionComplete','additifs','ration'];
const before=new Map(ctx.window.CROCamiCatalog.map(p=>[p.id,JSON.stringify(nutritionalFields.map(f=>p[f]??null))]));
vm.runInContext(fs.readFileSync('marchands.js','utf8'),ctx);
const products=ctx.window.CROCamiCatalog;
assert.equal(new Set(products.map(p=>p.id)).size,products.length);
const app=fs.readFileSync('app.js','utf8');
vm.runInContext(app.slice(0,app.lastIndexOf('tabs.forEach(t=>')),ctx);
let offers=0,rows=0;
const uniqueOffers=new Set();
for(const p of products){
 assert.equal(JSON.stringify(nutritionalFields.map(f=>p[f]??null)),before.get(p.id),'Merchant data must not overwrite existing nutrition: '+p.id);
 assert.ok(p.imageProduit,'Missing photo: '+p.id);
 for(const o of p.offres||[]){
  assert.ok(o.prixSac>0&&o.formatKg>0&&o.prixKg>0,p.id);
  assert.equal(o.prixKg,round(o.prixSac/o.formatKg),p.id+' inconsistent price/kg');
  assert.equal(typeof o.disponible,'boolean');
  assert.ok(['www.zooplus.fr','www.zoomalia.com'].includes(new URL(o.url).hostname));
  assert.equal(o.typeReleve,undefined,'Indexed offers must not remain in the live dataset');
  uniqueOffers.add(o.marchand+'|'+o.url+'|'+(o.reference||o.format));offers++;
 }
 for(const r of p.relevesRevendeurs||[])for(const[field,n]of Object.entries(r.valeurs)){
  assert.ok(Number.isFinite(n)&&n>=0,p.id+' invalid nutrient '+field);
  if(r.unites[field]==='%')assert.ok(n<=100,p.id+' invalid percentage');
  if(r.unites[field]==='kcal/kg')assert.ok(n>=1000&&n<=6000,p.id+' ambiguous energy unit');
  rows++;
 }
 ctx.__product=p;
 const html=vm.runInContext('productDetailMarkup(__product)',ctx);
 assert.ok(html.includes('PRIX PAR MARCHAND'));
 assert.ok(!/undefined|NaN|Infinity/.test(html),'Invalid rendered value in '+p.id);
}
for(const id of ['c04','d14'])assert.ok(!products.find(p=>p.id===id).offres.some(o=>o.marchand==='Zoomalia'),'Ambiguous flavor must not be attached');
const photos=JSON.parse(fs.readFileSync('reports/merchant-photo-audit-2026-11-09.json','utf8'));
for(const photo of photos){
 const bytes=fs.readFileSync(photo.localPath);
 assert.ok(bytes.length>1000&&bytes[0]===0xff&&bytes[1]===0xd8,'Invalid JPEG '+photo.id);
 assert.equal(photo.visualChecked,true,'Photo was not visually reviewed');
}
const report={checkedAt:new Date().toISOString(),productPagesRendered:products.length,offerRowsChecked:offers,uniqueMerchantOffers:uniqueOffers.size,nutritionalValuesChecked:rows,nutritionPreserved:true,missingPhotos:products.filter(p=>!p.imageProduit).length,localPhotosVerified:photos.length,invalidPrices:0,invalidRenderedValues:0};
fs.writeFileSync('reports/merchant-validation-2026-11-09.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));

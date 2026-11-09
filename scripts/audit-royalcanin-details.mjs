import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const ctx={window:{addEventListener:()=>{}},document:{querySelectorAll:()=>[],querySelector:()=>null}};vm.createContext(ctx);
for(const f of ['fabricants.js','catalogue.js','references-complementaires.js','marchands.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const beforeMerge=new Map(ctx.window.CROCamiCatalog.filter(p=>p.marque==='Royal Canin').map(p=>[p.id,JSON.parse(JSON.stringify(p))]));
vm.runInContext(fs.readFileSync('royalcanin.js','utf8'),ctx);
const royal=ctx.window.CROCamiCatalog.filter(p=>p.marque==='Royal Canin');
assert.equal(royal.length,14,'Three duplicate recipes must be merged');
assert.equal(new Set(royal.map(p=>p.sourceFabricant)).size,14);
const offerKey=o=>[o.marchand,o.vendeur,o.url,o.format,o.reference||'',o.condition||''].join('|');
for(const [alias,id]of Object.entries(ctx.window.CROCamiProductAliases)){
 assert.ok(!ctx.window.CROCamiCatalog.some(p=>p.id===alias));
 const primary=royal.find(p=>p.id===id);assert.ok(primary);
 for(const offer of beforeMerge.get(alias).offres||[])assert.ok(primary.offres.some(o=>offerKey(o)===offerKey(offer)),'Lost offer from '+alias);
}
assert.equal(royal.find(p=>p.id==='c01').energie,3629);
assert.equal(royal.find(p=>p.id==='d06').energie,3451);
assert.equal(royal.find(p=>p.id==='rc-chat-sensible-33').energie,4467);
assert.equal(royal.find(p=>p.id==='d01').energie,4125,'Visible analytical energy takes priority over technical metadata');
const officialSnapshot=JSON.stringify(royal.map(p=>[p.id,p.proteines,p.matieresGrasses,p.fibres,p.cendres,p.calcium,p.phosphore,p.omega3,p.omega6,p.energie]));
vm.runInContext(fs.readFileSync('royalcanin-complements.js','utf8'),ctx);
assert.equal(JSON.stringify(royal.map(p=>[p.id,p.proteines,p.matieresGrasses,p.fibres,p.cendres,p.calcium,p.phosphore,p.omega3,p.omega6,p.energie])),officialSnapshot,'Distinct retailer formulas must not alter primary nutrition or scores');
const puppy=royal.find(p=>p.id==='rc-chien-mini-puppy');
assert.equal(puppy.dha,.17);assert.equal(puppy.omega3,null);assert.equal(puppy.calcium,null);
assert.equal(puppy.complementsNutritionnels[0].valeurs.find(n=>n.nom==='Calcium').valeur,1.14);
assert.equal(puppy.micronutrimentsFabricant.find(n=>n.nom==='Vitamine E').nature,'Teneur analytique publiée');
assert.equal(puppy.micronutrimentsFabricant.find(n=>n.nom==='Zinc').nature,'Additif nutritionnel ajouté');
assert.equal(royal.find(p=>p.id==='c01').micronutrimentsFabricant.find(n=>n.nom==='Fer').valeur,31);
const app=fs.readFileSync('app.js','utf8');vm.runInContext(app.slice(0,app.lastIndexOf('tabs.forEach(t=>')),ctx);
ctx.__product=royal.find(p=>p.id==='c01');
const extra=vm.runInContext('royalRetailerValue(__product,"Calcium","%")',ctx);
assert.equal(extra.value,1.11);assert.equal(extra.marchand,'Zooplus');
assert.equal(ctx.__product.calcium,null,'Retailer display must not become official nutrition');
ctx.__product=royal.find(p=>p.id==='zp-cat-royal-kitten');
assert.equal(vm.runInContext('royalRetailerValue(__product,"Oméga-3","%")',ctx),null,'DHA-only value must not become total omega-3');
let offers=0,micros=0,complements=0;
for(const p of royal){
 assert.ok(p.energie>0&&p.methodeEnergieFabricant&&p.presentationProduit);
 assert.ok(p.micronutrimentsFabricant.length>=8,p.recette+' missing micronutrients');
 assert.ok(p.beneficesFabricant.length>=3);assert.ok(p.referencesFabricant.every(r=>/^\d{13}$/.test(r.ean)));
 for(const n of p.micronutrimentsFabricant){assert.ok(Number.isFinite(n.valeur)&&n.valeur>=0);assert.ok(['mg/kg','UI/kg','g/kg'].includes(n.unite));micros++;}
 for(const o of p.offresFabricant){assert.equal(new URL(o.url).hostname,'www.royalcanin.com');assert.ok(o.prixSac>0&&o.formatKg>0);assert.equal(o.prixKg,Math.round(o.prixSac/o.formatKg*100)/100);offers++;}
 complements+=(p.complementsNutritionnels||[]).reduce((n,r)=>n+r.valeurs.length,0);
 ctx.__product=p;const html=vm.runInContext('productDetailMarkup(__product)',ctx);assert.ok(html.includes('Vitamines, oligo-éléments et bénéfices'));assert.ok(html.includes('Royal Canin</h3>'));assert.ok(!/undefined|NaN|Infinity/.test(html),p.id);
}
for(const [alias,id]of Object.entries(ctx.window.CROCamiProductAliases)){
 ctx.location={hash:'#produit/'+alias,replace:url=>{ctx.redirect=url;}};
 vm.runInContext('routeProductDetail()',ctx);ctx.__product=royal.find(p=>p.id===id);
 assert.equal(ctx.redirect,vm.runInContext('productUrl(__product)',ctx));
}
const count=ctx.window.CROCamiCatalog.length;
vm.runInContext(fs.readFileSync('royalcanin.js','utf8'),ctx);
assert.equal(ctx.window.CROCamiCatalog.length,count,'Reloading official data must not duplicate products');
const report={mergedDuplicates:Object.keys(ctx.window.CROCamiProductAliases).length,allOfficialEnergyAvailable:true,date:'2026-11-09',royalCaninProductPages:royal.length,officialMicronutrientRows:micros,officialOfferRows:offers,distinctRetailerNutrientRows:complements,primaryNutritionUnchangedByRetailerData:true};
fs.writeFileSync('reports/royalcanin-details-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const ctx={window:{addEventListener:()=>{}},document:{querySelectorAll:()=>[],querySelector:()=>null}};vm.createContext(ctx);
for(const f of ['fabricants.js','catalogue.js','references-complementaires.js','marchands.js','royalcanin.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const royal=ctx.window.CROCamiCatalog.filter(p=>p.marque==='Royal Canin');
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
let offers=0,micros=0,complements=0;
for(const p of royal){
 assert.ok(p.micronutrimentsFabricant.length>=8,p.recette+' missing micronutrients');
 assert.ok(p.beneficesFabricant.length>=3);assert.ok(p.referencesFabricant.every(r=>/^\d{13}$/.test(r.ean)));
 for(const n of p.micronutrimentsFabricant){assert.ok(Number.isFinite(n.valeur)&&n.valeur>=0);assert.ok(['mg/kg','UI/kg','g/kg'].includes(n.unite));micros++;}
 for(const o of p.offresFabricant){assert.equal(new URL(o.url).hostname,'www.royalcanin.com');assert.ok(o.prixSac>0&&o.formatKg>0);assert.equal(o.prixKg,Math.round(o.prixSac/o.formatKg*100)/100);offers++;}
 complements+=(p.complementsNutritionnels||[]).reduce((n,r)=>n+r.valeurs.length,0);
 ctx.__product=p;const html=vm.runInContext('productDetailMarkup(__product)',ctx);assert.ok(html.includes('Vitamines, oligo-éléments et bénéfices'));assert.ok(html.includes('Royal Canin</h3>'));assert.ok(!/undefined|NaN|Infinity/.test(html),p.id);
}
const report={date:'2026-11-09',royalCaninProductPages:royal.length,officialMicronutrientRows:micros,officialOfferRows:offers,distinctRetailerNutrientRows:complements,primaryNutritionUnchangedByRetailerData:true};
fs.writeFileSync('reports/royalcanin-details-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

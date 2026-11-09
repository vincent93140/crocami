import fs from 'node:fs';
import vm from 'node:vm';

// Only structured, public merchant data is collected. Matching is reviewed separately.
const context = {window:{}};
vm.createContext(context);
for (const file of ['fabricants.js','catalogue.js','references-complementaires.js']) vm.runInContext(fs.readFileSync(file,'utf8'),context);
const products = context.window.CROCamiCatalog;
const output = 'reports/zooplus-price-candidates.json';
const results = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output,'utf8')) : [];
function extract(html) {
  const flight = [...html.matchAll(/self\.__next_f\.push\((\[.*?\])\)<\/script>/g)].map(m=>{try{return JSON.parse(m[1])[1]||'';}catch{return '';}}).join('');
  const found = new Map();
  function visit(x) {
    if (!x || typeof x !== 'object') return;
    if (x.title && x.variant && x.path) {
      const v=x.variant;
      found.set(v.activeVariantId,{title:x.title,summary:x.summary,url:new URL(x.variantUrl||x.path,'https://www.zooplus.fr').href,species:x.petTypes,format:v.description,price:v.price?.metaPropPrice,priceKg:v.price?.unitPriceValue,unit:v.price?.unit,available:v.available,seller:v.seller?.name||'Zooplus',brands:v.brands,discount:v.articleDiscount?.discountLabel,priceType:v.priceType});
    }
    for (const value of Object.values(x)) visit(value);
  }
  for (const line of flight.split('\n')) {try{visit(JSON.parse(line.slice(line.indexOf(':')+1)));}catch{}}
  return [...found.values()];
}
let index=0;
async function worker() {
  while(index<products.length) {
    const p=products[index++];
    if(results.some(x=>x.id===p.id)) continue;
    const query=(p.marque+' '+p.recette).replace(/\([^)]*\)/g,'').replace(/[—&]/g,' ').trim();
    const url='https://www.zooplus.fr/search/results?q='+encodeURIComponent(query);
    try {
      const r=await fetch(url,{signal:AbortSignal.timeout(45000)});
      const html=await r.text();
      results.push({id:p.id,name:p.marque+' '+p.recette,species:p.espece,query,url,checkedAt:new Date().toISOString(),status:r.status,candidates:extract(html)});
    } catch(e) {results.push({id:p.id,name:p.marque+' '+p.recette,error:e.message,candidates:[]});}
    for(let attempt=0;;attempt++) {
      try {fs.writeFileSync(output,JSON.stringify(results,null,2)+'\n');break;}
      catch(error) {if(attempt>=8)throw error;await new Promise(r=>setTimeout(r,500));}
    }
    console.log(p.id,results.at(-1).candidates.length);
    await new Promise(r=>setTimeout(r,400));
  }
}
await Promise.all([worker(),worker()]);
console.log('Completed',results.length,'products');

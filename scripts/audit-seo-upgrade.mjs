import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {relatedProducts,isDiet,verifiedPrice,verifiedOffers} from './seo-product-utils.mjs';
const app=fs.readFileSync('app.js','utf8');
const definitions=app.slice(0,app.lastIndexOf('tabs.forEach(t=>'));
function context(files){const c={window:{addEventListener(){}},document:{querySelectorAll:()=>[],querySelector:()=>null}};vm.createContext(c);for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),c);vm.runInContext(definitions,c);return c;}
const fullFiles=['fabricants.js','catalogue.js','references-complementaires.js','marchands.js','royalcanin.js','royalcanin-complements.js'];
const full=context(fullFiles),light=context(['catalogue-leger.js']);
const manifest=JSON.parse(fs.readFileSync('reports/product-pages-manifest.json','utf8'));
assert.equal(light.window.CROCamiCatalog.length,manifest.length);
const pages=new Map();let productSchemas=0;
for(const m of manifest){
 const p=full.window.CROCamiCatalog.find(p=>p.id===m.id),q=light.window.CROCamiCatalog.find(p=>p.id===m.id);assert.ok(p&&q);
 pages.set(new URL(m.url).pathname,p);full.p=p;light.p=q;
 assert.equal(JSON.stringify(vm.runInContext('globalNutritionScore(p)',full)),JSON.stringify(vm.runInContext('globalNutritionScore(p)',light)),'Nutrition changed: '+p.id);
 assert.equal(vm.runInContext('productUrl(p)',full),vm.runInContext('productUrl(p)',light),'Product URL changed');
 assert.equal(q.prixStatut,verifiedPrice(p)?'verifie':'indicatif');
 const html=fs.readFileSync(m.path,'utf8');
 if((p.prixSac!=null||p.prixKg!=null)&&!verifiedPrice(p))assert.ok(html.includes('price-indicative'),'Missing indicative price notice '+p.id);
 assert.ok(html.includes('product-reading'),'Missing recipe summary');
 assert.ok(!/<img\b(?![^>]*\bwidth=)[^>]*>/.test(html),'Missing intrinsic image dimensions');
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
  const raw=JSON.parse(match[1]);for(const node of Array.isArray(raw)?raw:[raw])if(node['@type']==='Product'){
   productSchemas++;assert.equal(node.url,m.url);assert.ok(!node.aggregateRating&&!node.review,'Internal score must not become user rating');
   for(const offer of node.offers){assert.ok(verifiedOffers(p).some(o=>o.formatKg===p.formatKg&&o.prixSac===offer.price&&o.url===offer.url),'Offer must match displayed format');}
  }
 }
}
for(const [url,related] of relatedProducts(pages))for(const[,q]of related){const p=pages.get(url);assert.equal(p.espece,q.espece);assert.equal(p.age,q.age);assert.equal(isDiet(p),isDiet(q));if(isDiet(p))assert.ok(p.indication&&p.indication===q.indication);}
const home=fs.readFileSync('index.html','utf8'),scripts=[...home.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);assert.deepEqual(scripts,['catalogue-leger.js','app.js']);
const decodedBytes=scripts.reduce((n,f)=>n+fs.statSync(f).size,0);assert.ok(decodedBytes<300000,'Homepage script budget');
const urls=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);const incoming=new Map(manifest.map(m=>[m.url,new Set()]));
for(const url of urls){const h=fs.readFileSync('.'+new URL(url).pathname+'index.html','utf8');for(const m of h.matchAll(/href="([^"]+)"/g)){const dest=new URL(m[1].replaceAll('&amp;','&'),url).href.split('#')[0];incoming.get(dest)?.add(url);}}
const counts=[...incoming.values()].map(s=>s.size);assert.ok(Math.min(...counts)>=2);assert.ok(Math.max(...counts)<25,'Related links must not concentrate on alphabetical leaders');
const report={checkedAt:new Date().toISOString(),sitemapPages:urls.length,productPages:manifest.length,scoresAndNutritionPreserved:manifest.length,productSchemaPages:productSchemas,homepageScripts: scripts,homepageDecodedBytes:decodedBytes,previousHomepageDecodedBytes:2271043,scriptReductionPercent:Math.round((1-decodedBytes/2271043)*100),minimumIncomingPages:Math.min(...counts),maximumIncomingPages:Math.max(...counts),titlesOver70:manifest.filter(p=>p.title.length>70).length,errors:0};
fs.writeFileSync('reports/seo-upgrade-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

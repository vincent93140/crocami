import fs from 'node:fs';
const approved=JSON.parse(fs.readFileSync('reports/approved-merchant-products.json','utf8'));
const candidates=JSON.parse(fs.readFileSync('reports/zooplus-price-candidates.json','utf8')).flatMap(x=>x.candidates);
const newTitles=['Royal Canin Mini Puppy pour chiot','Royal Canin Maxi Puppy pour chiot','Royal Canin Medium Adult 7+ pour chien','Royal Canin Mini Adult 8+ pour chien','Royal Canin Indoor 27','Royal Canin Kitten','Royal Canin Hairball Care','PURINA PRO PLAN Medium Adult Sensitive Skin saumon'];
for(const title of newTitles){const c=candidates.find(x=>x.title.toLowerCase().trim()===title.toLowerCase());if(c)approved.push({id:'new-'+c.url.match(/\/(\d+)\?/)?.[1],title:c.title,url:c.url,isNew:true});}
const decode=s=>s.replace(/&(?:nbsp|amp|lt|gt|quot|apos|#39);/g,e=>({'&nbsp;':' ','&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'"}[e])).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n));
const plain=s=>decode(s.replace(/<br\s*\/?\s*>|<\/(?:p|tr|li|table|div)>/gi,'\n').replace(/<\/(?:td|th)>/gi,' | ').replace(/<[^>]*>/g,'').replace(/[ \t]+/g,' ').replace(/\n\s*\n/g,'\n').trim());
const output='reports/zooplus-product-details.json';
const records=fs.existsSync(output)?JSON.parse(fs.readFileSync(output,'utf8')):[];
let index=0;
async function worker(){while(index<approved.length){const p=approved[index++];const url=p.url.split('?')[0];if(records.some(x=>x.url===url))continue;
 try{const response=await fetch(url,{signal:AbortSignal.timeout(45000)});const html=await response.text();
 const ingredientHtml=html.match(/data-zta="productIngredients"[^>]*>([\s\S]*?)<\/div>/)?.[1]||'';
 const table=html.match(/data-zta="constituentsTable"[^>]*>([\s\S]*?)<\/table>/)?.[1]||'';
 const analysis=[...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(x=>[...x[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(y=>plain(y[1])));
 const feeding=html.match(/id="feedingrecommendation-panel"[\s\S]*?<div[^>]*>([\s\S]*?)(?:<\/div><\/div>)/)?.[1]||'';
 const rec={url,expectedTitle:p.title,title:plain(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]||''),status:response.status,checkedAt:new Date().toISOString(),ingredients:plain(ingredientHtml),analysis,feeding:plain(feeding),image:decode(html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]||''),isNew:!!p.isNew};
 records.push(rec);console.log(p.id,response.status,analysis.length);
 }catch(e){records.push({url,error:e.message});}
 for(let attempt=0;;attempt++){try{fs.writeFileSync(output,JSON.stringify(records,null,2)+'\n');break;}catch(e){if(attempt>=8)throw e;await new Promise(r=>setTimeout(r,500));}}
 await new Promise(r=>setTimeout(r,400));
}}
await Promise.all([worker(),worker()]);
console.log('Completed',records.length,'unique product pages');

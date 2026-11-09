import fs from 'node:fs';
const queries=JSON.parse(fs.readFileSync('reports/price-recheck-queries.json','utf8'));
const file='reports/price-recheck-results.json',results=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];
const source=fs.readFileSync('scripts/collect-merchant-prices.mjs','utf8');
const extract=new Function(source.slice(source.indexOf('function extract(html)'),source.indexOf('let index=0;'))+'return extract;')();
let i=0;
await Promise.all(Array.from({length:2},async()=>{while(i<queries.length){const q=queries[i++];if(results.some(r=>r.query===q.query))continue;const url='https://www.zooplus.fr/search/results?q='+encodeURIComponent(q.query);try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});const h=await r.text();results.push({...q,url,status:r.status,checkedAt:new Date().toISOString(),candidates:extract(h)});}catch(e){results.push({...q,url,error:e.message,candidates:[]});}fs.writeFileSync(file,JSON.stringify(results,null,2));}}));
console.log(JSON.stringify({queries:results.length,candidates:results.reduce((n,r)=>n+r.candidates.length,0)}));

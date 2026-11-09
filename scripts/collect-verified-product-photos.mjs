import fs from 'node:fs';
import vm from 'node:vm';
const ctx={window:{CROCamiCatalog:[]}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('references-complementaires.js','utf8'),ctx);
const sourcePhotos=JSON.parse(fs.readFileSync('reports/verified-product-photos.json','utf8'));
const mapping={'30741':'zm-cat-hills-sterilised-chicken','11506':'zm-cat-proplan-sterilised-salmon','33450':'zm-cat-proplan-sterilised-rabbit','15795':'zm-cat-hills-light-chicken'};
const records=sourcePhotos.map(url=>({id:mapping[url.match(/prod_img\/(\d+)/)[1]],sourceUrl:url}));
for(const p of ctx.window.CROCamiCatalog.filter(p=>p.id.startsWith('zp-')))records.push({id:p.id,sourceUrl:p.sourceImageProduit||p.imageProduit});
records.push({id:'vb-dog-dermatology-support',sourceUrl:'https://static3.zoomalia.com/cdn-cgi/image/width=800,height=800,format=auto/prod_img/40989/lm_bd2f81726b3036d3d84865c32eab4c98_st3.jpg'});
const boschMatch=JSON.parse(fs.readFileSync('reports/approved-merchant-products.json','utf8')).find(p=>p.id==='mq-dog-040');
const bosch=JSON.parse(fs.readFileSync('reports/zooplus-product-details.json','utf8')).find(p=>p.url===boschMatch.url.split('?')[0]);
records.push({id:'mq-dog-040',sourceUrl:bosch.image});
const previous=fs.existsSync('reports/merchant-photo-audit-2026-11-09.json')?JSON.parse(fs.readFileSync('reports/merchant-photo-audit-2026-11-09.json','utf8')):[];
fs.mkdirSync('images/produits',{recursive:true});
for(const record of records){
 const cached=previous.find(p=>p.id===record.id&&p.sourceUrl===record.sourceUrl&&fs.existsSync(p.localPath));
 if(cached){Object.assign(record,cached);continue;}
 const response=await fetch(record.sourceUrl,{signal:AbortSignal.timeout(30000)});
 const bytes=Buffer.from(await response.arrayBuffer());
 if(response.status!==200||!response.headers.get('content-type')?.startsWith('image/'))throw Error('Invalid photo '+record.id);
 record.localPath='images/produits/'+record.id+'.jpg';record.mime=response.headers.get('content-type');record.bytes=bytes.length;record.checkedAt=new Date().toISOString();
 fs.writeFileSync(record.localPath,bytes);console.log(record.id,response.status,bytes.length);
}
fs.writeFileSync('reports/merchant-photo-audit-2026-11-09.json',JSON.stringify(records,null,2)+'\n');

import fs from 'node:fs';
const targets=[
 ['medium-puppy','dogs','medium-puppy-pour-chiot-3003',['d01'],'Junior','Moyenne',['Croissance']],
 ['medium-sterilised','dogs','sterilised-medium-3034',['d06','mq-dog-079'],'Adulte','Moyenne',['Stérilisé']],
 ['mini-adult','dogs','mini-adult-3001',['d16','mq-dog-078'],'Adulte','Petite',['Adulte']],
 ['sterilised-37','cats','sterilised-37-2537',['c01','mq-cat-057'],'Adulte','Toutes',['Stérilisé']],
 ['sterilised-7','cats','sterilised-7%2B-2560',['c11'],'Senior','Toutes',['Stérilisé','Senior']],
 ['medium-adult','dogs','medium-adult-3004',['mq-dog-076'],'Adulte','Moyenne',['Adulte']],
 ['maxi-adult','dogs','maxi-adult-3007',['mq-dog-077'],'Adulte','Grande',['Adulte']],
 ['medium-adult-7','dogs','medium-adult-7%2B-3005',['zp-dog-royal-medium-adult-7'],'Senior','Moyenne',['Senior']],
 ['kitten','cats','kitten-2522',['zp-cat-royal-kitten'],'Junior','Toutes',['Croissance']],
 ['mini-puppy','dogs','puppy-mini-3000',[],'Junior','Petite',['Croissance']],
 ['maxi-puppy','dogs','puppy---maxi-3006',[],'Junior','Grande',['Croissance']],
 ['indoor-27','cats','fhn--2529',[],'Adulte','Toutes',['Adulte']],
 ['hairball-care','cats','hairball-care-2534',[],'Adulte','Toutes',['Boules de poils']],
 ['sensible-33','cats','sensible-33-2521',[],'Adulte','Toutes',['Sensibilité digestive']]
];
fs.mkdirSync('reports/royalcanin-officiel',{recursive:true});
let i=0;const output=[];
async function worker(){while(i<targets.length){const [key,species,slug,ids,age,gabarit,besoins]=targets[i++];const url=`https://www.royalcanin.com/fr/${species}/products/retail-products/${slug}`;try{
 const r=await fetch(url,{signal:AbortSignal.timeout(45000)}),h=await r.text();const match=h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);if(!r.ok||!match)throw Error('HTTP '+r.status);
 const p=JSON.parse(match[1]).props.pageProps.productData?.response;if(!p?.nutritionalInfo?.length)throw Error('Missing nutrition');
 const record={key,url:r.url,checkedAt:new Date().toISOString(),ids,age,gabarit,besoins,espece:species==='dogs'?'chien':'chat',title:p.title,description:p.description,details:p.details,benefits:p.benefits,nutritionalInfo:p.nutritionalInfo,images:p.images,packs:p.packs,category:p.categoryLabel};
 fs.writeFileSync(`reports/royalcanin-officiel/${key}.json`,JSON.stringify(record,null,2)+'\n');output.push(record);console.log(key,p.title,p.nutritionalInfo.length);
 }catch(e){console.log('ERROR',key,e.message);process.exitCode=1;}}}
await Promise.all([worker(),worker()]);
fs.writeFileSync('reports/royalcanin-officiel/summary.json',JSON.stringify(output.map(p=>({key:p.key,title:p.title,url:p.url,ids:p.ids})),null,2));

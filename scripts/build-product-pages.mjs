import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';
const check=process.argv.includes('--check'),origin='https://crocami.fr';
const ctx={window:{addEventListener:()=>{}},document:{querySelectorAll:()=>[],querySelector:()=>null}};vm.createContext(ctx);
for(const f of ['fabricants.js','catalogue.js','references-complementaires.js','marchands.js','royalcanin.js','royalcanin-complements.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const app=fs.readFileSync('app.js','utf8');vm.runInContext(app.slice(0,app.lastIndexOf('tabs.forEach(t=>')),ctx);
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const absolute=html=>html.replace(/\b(src|href)="(?!https?:|mailto:|data:|#|\/)([^"]*)"/g,'$1="/$2"').replace(/\s+onerror="[^"]*"/g,'');
const home=fs.readFileSync('index.html','utf8');
let head=home.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/\s*<script\b[^>]*>[\s\S]*?<\/script>/g,'');head=absolute(head);
const header=absolute(home.match(/<header\b[\s\S]*?<\/header>/)[0]).replaceAll('href="#','href="/#');
const footer=absolute(home.match(/<footer\b[\s\S]*?<\/footer>/)[0]).replaceAll('href="#','href="/#').replace('<span id="year"></span>','<span id="year">2026</span>');
function pageHead(title,description,url){return head.replace(/<title>[\s\S]*?<\/title>/,'<title>'+escape(title)+'</title>').replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+escape(description)+'">').replace(/<link rel="canonical" href="[^"]*">/,'<link rel="canonical" href="'+url+'">')+'\n<meta property="og:type" content="website"><meta property="og:locale" content="fr_FR"><meta property="og:title" content="'+escape(title)+'"><meta property="og:description" content="'+escape(description)+'"><meta property="og:url" content="'+url+'">\n';}
const products=ctx.window.CROCamiCatalog,pages=new Map();for(const p of products){ctx.__product=p;const url=vm.runInContext('productUrl(__product)',ctx);if(!pages.has(url))pages.set(url,p);}
let outputs=new Map(),manifest=[];
for(const[url,p]of pages){
 ctx.__product=p;let content=absolute(vm.runInContext('productDetailMarkup(__product)',ctx)).replaceAll('href="#comparateur"','href="/#comparateur"');
 const name=p.marque+' '+p.recette,animal=p.espece==='chien'?'chien':'chat';
 content=content.replace(/<h1>[\s\S]*?<\/h1>/,'<h1>'+escape(name)+'</h1>');
 const title=name+' pour '+animal+' : composition et prix | Crocami';
 const description=name+' pour '+animal+' '+p.age.toLowerCase()+'. '+(p.proteines!=null?'Protéines : '+String(p.proteines).replace('.',',')+' %. ':'')+'Composition, analyses, rations, prix au kilo et sources sur Crocami.';
 const canonical=origin+url;
 const json=JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:origin+'/'},{'@type':'ListItem',position:2,name:'Croquettes',item:origin+'/produits/'},{'@type':'ListItem',position:3,name,item:canonical}]}).replaceAll('<','\\u003c');
 const html='<!doctype html>\n<html lang="fr"><head>'+pageHead(title,description,canonical)+'<script type="application/ld+json">'+json+'</script></head><body class="product-view">'+header+'<main><section id="productDetail" class="product-detail-page">'+content+'</section></main>'+footer+'</body></html>\n';
 assert.equal((html.match(/<h1>/g)||[]).length,1);assert.ok(!/undefined|NaN/.test(html));
 const file=url.slice(1)+'index.html';outputs.set(file,html);manifest.push({id:p.id,url:canonical,path:file,title,description});
}
const links=species=>[...pages].filter(([,p])=>p.espece===species).map(([url,p])=>'<li><a href="'+url+'">'+escape(p.marque+' '+p.recette)+'</a></li>').join('');
outputs.set('produits/index.html','<!doctype html><html lang="fr"><head>'+pageHead('Toutes les croquettes pour chiens et chats | Crocami','Consultez les fiches de croquettes pour chiens et chats : ingrédients, analyses nutritionnelles, formats, rations et prix comparés.',origin+'/produits/')+'</head><body>'+header+'<main class="product-directory"><a class="directory-back" href="/#comparateur">← Retour au comparateur</a><h1>Toutes les fiches de croquettes</h1><h2>Pour les chiens</h2><ul>'+links('chien')+'</ul><h2>Pour les chats</h2><ul>'+links('chat')+'</ul></main>'+footer+'</body></html>\n');
outputs.set('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+['/','/produits/',...pages.keys()].map(url=>'  <url><loc>'+origin+escape(url)+'</loc></url>').join('\n')+'\n</urlset>\n');
outputs.set('robots.txt','User-agent: *\nAllow: /\n\nSitemap: https://crocami.fr/sitemap.xml\n');
outputs.set('.nojekyll','');outputs.set('reports/product-pages-manifest.json',JSON.stringify(manifest,null,2)+'\n');
for(const[file,html]of outputs){if(check){assert.ok(fs.existsSync(file),'Missing '+file);assert.equal(fs.readFileSync(file,'utf8'),html,'Regenerate static pages: '+file);}else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html);}}
assert.equal(new Set(manifest.map(p=>p.description)).size,manifest.length,'Duplicate page descriptions');
console.log(JSON.stringify({mode:check?'check':'build',catalogueReferences:products.length,staticProductPages:pages.size,duplicateReferencesSharingOnePage:products.length-pages.size,sitemapUrls:pages.size+2,noJavaScriptRequired:true}));

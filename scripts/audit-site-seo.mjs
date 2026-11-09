import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const origin='https://crocami.fr';
const urls=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const titles=new Set(),descriptions=new Set();let internalLinks=0,structuredBlocks=0;
const errors=[];
for(const address of urls){
 try{
  const url=new URL(address);assert.equal(url.origin,origin);
  const file=path.join('.',decodeURIComponent(url.pathname),'index.html');
  const html=fs.readFileSync(file,'utf8');
  assert.equal((html.match(/<h1(?:\s[^>]*)?>/g)||[]).length,1,'one H1');
  assert.ok(!/content="[^\"]*noindex|http-equiv="refresh"/i.test(html),'indexable sitemap page');
  const canonical=html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];assert.equal(canonical,address,'self canonical');
  const title=html.match(/<title>(.*?)<\/title>/s)?.[1];assert.ok(title);assert.ok(!titles.has(title),'unique title');titles.add(title);
  const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];assert.ok(description);assert.ok(!descriptions.has(description),'unique description');descriptions.add(description);
  for(const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){JSON.parse(block[1]);structuredBlocks++;}
  for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
   const value=m[1].replaceAll('&amp;','&');if(/^(mailto:|tel:|data:|javascript:)/i.test(value))continue;
   const link=new URL(value,address);if(link.origin!==origin)continue;
   let target='.'+decodeURIComponent(link.pathname);if(link.pathname.endsWith('/'))target+='index.html';
   assert.ok(fs.existsSync(target),'missing internal target '+value);internalLinks++;
  }
 }catch(e){errors.push({url:address,error:e.message});}
}
const report={checkedAt:new Date().toISOString(),sitemapPages:urls.length,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,internalLinksChecked:internalLinks,structuredBlocks,errors};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/seo-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));assert.equal(errors.length,0,'SEO audit errors');

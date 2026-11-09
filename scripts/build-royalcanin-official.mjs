import fs from 'node:fs';
const date='2026-11-09';
const decode=s=>s.replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&(?:nbsp|amp|lt|gt|quot|apos|rsquo|eacute);/g,e=>({'&nbsp;':' ','&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&rsquo;':'’','&eacute;':'é'}[e]));
const plain=s=>decode(String(s||'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]*>/g,'')).replace(/\s+/g,' ').trim();
const fields=['proteines','proteinesMS','matieresGrasses','fibres','cendres','humidite','glucides','calcium','phosphore','magnesium','sodium','potassium','chlorure','omega3','omega6','epa','dha','epaDha','amidon','energie','taurine','rpcMacroquette','ratioCalciumPhosphore','fibresAlimentairesTotales'];
const base=Object.fromEntries(fields.map(f=>[f,null]));
const mapping={proteines:'Protéine(?:s)?',matieresGrasses:'(?:Teneur en )?matières grasses',fibres:'Cellulose brute',cendres:'Cendres brutes',humidite:'Humidité',phosphore:'Phosphore',calcium:'Calcium',magnesium:'Magnésium',sodium:'Sodium',epaDha:'EPA\\s*[/+]\\s*DHA',fibresAlimentairesTotales:'Fibres totales'};
const records=fs.readdirSync('reports/royalcanin-officiel').filter(f=>f!=='summary.json').map(f=>JSON.parse(fs.readFileSync('reports/royalcanin-officiel/'+f,'utf8')));
const updates=[],audit=[];fs.mkdirSync('images/produits',{recursive:true});
for(const r of records){
 const values={...base},analytical=r.nutritionalInfo.find(n=>n.title.endsWith('.analyticalConstituants'))?.description||'';
 for(const [field,label] of Object.entries(mapping)){const m=analytical.match(new RegExp(label+'\\s*:\\s*(\\d+(?:[.,]\\d+)?)\\s*%','i'));if(m)values[field]=+m[1].replace(',','.');}
 const energy=analytical.match(/[ÉE]nergie métabolisable\s*:\s*(\d+(?:[.,]\d+)?)\s*kcal\/kg/i);if(energy)values.energie=+energy[1].replace(',','.');
 const dha=analytical.match(/\(DHA\)\s*:\s*(\d+(?:[.,]\d+)?)\s*%/i);if(dha)values.dha=+dha[1].replace(',','.');
 if(!(values.proteines>0&&values.matieresGrasses>0&&values.cendres>0&&values.fibres>=0))throw Error('Incomplete analysis '+r.key);
 const composition=plain(r.nutritionalInfo.find(n=>n.title.endsWith('.composition'))?.description).replace(/^COMPOSITION\s*:\s*/i,'');
 const additives=plain(r.nutritionalInfo.find(n=>n.title.endsWith('.additives'))?.description);
 const feeding=r.nutritionalInfo.find(n=>n.title.endsWith('.nutritionalInformationFeedingGuide'))?.html||'';
 const tables=[...feeding.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)].map(t=>[...t[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(row=>[...row[1].matchAll(/<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>/gi)].map(c=>({texte:plain(c[3]),entete:c[1].toLowerCase()==='th',colonnes:+(c[2].match(/colspan=["']?(\d+)/i)?.[1]||1),lignes:+(c[2].match(/rowspan=["']?(\d+)/i)?.[1]||1)}))));
 if(!composition||!additives||!tables.length)throw Error('Missing details '+r.key);
 const photo=r.images?.[0]?.url;if(!photo||!['marspetcareaprimocdn.petcare.global','cdn.royalcanin-weshare-online.io'].includes(new URL(photo).hostname))throw Error('Unexpected image '+r.key);
 const imagePath='images/produits/rc-official-'+r.key+'.jpg';
 if(!fs.existsSync(imagePath)){const response=await fetch(photo,{signal:AbortSignal.timeout(30000)}),bytes=Buffer.from(await response.arrayBuffer());if(!response.ok||!response.headers.get('content-type')?.startsWith('image/')||bytes.length<1000)throw Error('Invalid photo '+r.key);fs.writeFileSync(imagePath,bytes);}
 const micronutrients=[];
 const nutrientLabels=[['Vitamine A','Vitamine A'],['Vitamine D3','Vitamine D3'],['Vitamine E','Vitamine E'],['Vitamine C','Vitamine C'],['Fer','Fer'],['Iode','Iode'],['Cuivre','Cuivre'],['Manganèse','Manganèse'],['Zinc','Zinc'],['Sélénium','Sélénium'],['L-carnitine','L-carnitine']];
 for(const [nom,label] of nutrientLabels){
  for(const [text,nature] of [[additives,'Additif nutritionnel ajouté'],[analytical,'Teneur analytique publiée']]){
   const match=text.match(new RegExp(label+'\\)?(?:\\s*\\([^)]*\\))?\\s*:\\s*(\\d+(?:[.,]\\d+)?)\\s*(UI|mg|g)\\b','i'));
   if(match)micronutrients.push({nom,valeur:+match[1].replace(',','.'),unite:match[2]+'/kg',nature});
  }
 }
 const officialOffers=r.packs.filter(p=>p.price>0&&/^\d+(?:[.,]\d+)?\s*(?:kg|g)$/.test(p.size)).map(p=>{const m=p.size.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g)$/);const kg=+m[1].replace(',','.')/(m[2]==='g'?1000:1);return {marchand:'Royal Canin',vendeur:'Royal Canin',format:p.size,formatKg:kg,prixSac:p.price,prixKg:Math.round(p.price/kg*100)/100,disponible:p.hasStock===true,url:r.url+'?ean=1-'+p.ean,datePrix:date,sourceReleve:r.url,condition:null};});
 const enrichments={micronutrimentsFabricant:micronutrients,beneficesFabricant:(r.benefits||[]).map(b=>b.label),referencesFabricant:r.packs.map(p=>({format:p.size,ean:p.ean})),offresFabricant:officialOffers,consignesFabricant:r.nutritionalInfo.some(n=>/feedingInstructions|legalNotice/.test(n.title))?'Conserver le sac au sec et au frais. Consulter l’emballage pour la date de durabilité, le numéro de lot et les consignes propres au produit. Garder de l’eau fraîche à disposition.':null};
 const update={...values,...enrichments,recette:r.title.trim().replace(/ pour chiot| pour chaton/gi,''),espece:r.espece,age:r.age,gabarit:r.gabarit,besoins:r.besoins,compositionComplete:composition,premierIngredient:composition.split(',')[0],additifs:additives,ration:tables.map(t=>t.map(row=>row.map(c=>c.texte).join(' | ')).join('\n')).join('\n\n'),tableauxRationFabricant:tables,descriptionFabricant:plain(r.description),formatsDisponibles:r.packs.map(p=>p.size).join(', '),imageProduit:imagePath,sourceImageProduit:photo,sourceFabricant:r.url,sourceFiche:r.url,sourceDonnees:'Fiche officielle Royal Canin France consultée le 9 novembre 2026',dateVerificationFabricant:date,verificationFabricant:'confirmée_partielle',noteFabricant:'Composition, analyse, ration, formats et photo vérifiés sur la fiche officielle française. Seules les teneurs publiées pour cette formule sont retenues. Le DHA ne représente pas les oméga-3 totaux. Les relevés revendeurs sont présentés séparément.',statutDonnees:'Formule officielle française consultée le 9 novembre 2026. Valeurs non publiées : non communiquées.',donneesFabricantActuelles:null,sourceDocumentFabricant:null,noteComposition:null,sourceMacroquette:null,sourceComplementaire:null};
 updates.push({ids:r.ids,newId:r.ids.length?null:'rc-'+r.espece+'-'+r.key,product:update});audit.push({key:r.key,title:r.title,ids:r.ids,newId:r.ids.length?null:'rc-'+r.espece+'-'+r.key,source:r.url,photo,imagePath,bytes:fs.statSync(imagePath).size,analysis:analytical,tables:tables.length});
 console.log(r.key,fs.statSync(imagePath).size,'bytes');
}
const apply=`
for(const entry of window.CROCamiRoyalCaninOfficial){
 for(const id of entry.ids){
  const product=window.CROCamiCatalog.find(p=>p.id===id);
  if(!product)throw new Error('Royal Canin reference missing: '+id);
  Object.assign(product,entry.product);
  product.offres=[...(product.offres||[]).filter(o=>o.marchand!=='Royal Canin'),...(entry.product.offresFabricant||[])];
  product.relevesRevendeurs=(product.relevesRevendeurs||[]).map(r=>({...r,ecarts:Object.entries(r.valeurs||{}).filter(([field,value])=>product[field]!=null&&Math.abs(product[field]-value)>.051).map(([field,value])=>({champ:field,catalogue:product[field],revendeur:value}))}));
 }
 if(entry.newId&&!window.CROCamiCatalog.some(p=>p.id===entry.newId)){
  const offers=entry.product.offresFabricant||[],preferred=offers.filter(o=>o.disponible).sort((a,b)=>a.prixKg-b.prixKg)[0];
  window.CROCamiCatalog.push({id:entry.newId,marque:'Royal Canin',prixSac:null,prixKg:null,formatKg:null,vendeur:null,datePrix:null,...entry.product,offres:offers,...(preferred?{prixSac:preferred.prixSac,prixKg:preferred.prixKg,formatKg:preferred.formatKg,vendeur:'Royal Canin',datePrix:preferred.datePrix,urlVendeur:preferred.url}:{})});
 }
}
`;
fs.writeFileSync('royalcanin.js','/* Sources officielles françaises, vérifiées le 9 novembre 2026. */\nwindow.CROCamiRoyalCaninOfficial = '+JSON.stringify(updates,null,2)+';\n'+apply);
fs.writeFileSync('reports/royalcanin-official-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log('Updated',updates.reduce((n,r)=>n+r.ids.length,0),'Added',updates.filter(r=>r.newId).length);

export const escapeHtml=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const money=n=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(n);
export const isDiet=p=>/diét|diet/i.test(p.typeAliment||'')||/aliment diét|dietetic/i.test(p.indication||'')||/prescription diet|veterinary diets?/i.test(p.recette||'');
export function verifiedOffers(p){return (p.offres||[]).filter(o=>o.disponible&&!o.condition&&!o.prixKgRecalcule&&o.prixSac>0&&o.formatKg>0&&/^https:\/\//.test(o.url||'')&&o.datePrix);}
export function verifiedPrice(p){return verifiedOffers(p).some(o=>o.prixSac===p.prixSac&&o.formatKg===p.formatKg&&o.datePrix===p.datePrix);}
export function relatedProducts(pages){
 const rows=[...pages],incoming=new Map(rows.map(([u])=>[u,0])),result=new Map();
 for(const[url,p]of rows){
  const needs=new Set(p.besoins||[]);
  const candidates=rows.filter(([u,q])=>u!==url&&p.espece===q.espece&&p.age===q.age&&isDiet(p)===isDiet(q)&&(!isDiet(p)||(p.indication&&p.indication===q.indication))&&(!p.gabarit||!q.gabarit||/toutes/i.test(p.gabarit+' '+q.gabarit)||p.gabarit===q.gabarit));
  const score=q=>(q.besoins||[]).filter(n=>needs.has(n)).length*3+(p.gabarit===q.gabarit?2:0);
  candidates.sort((a,b)=>incoming.get(a[0])-incoming.get(b[0])||score(b[1])-score(a[1])||a[0].localeCompare(b[0]));
  const chosen=candidates.slice(0,4);for(const[u]of chosen)incoming.set(u,incoming.get(u)+1);result.set(url,chosen);
 }
 return result;
}
export function productTitle(p){
 const name=(p.marque+' '+p.recette).replace(new RegExp('^('+p.marque.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')\\s+\\1\\s+','i'),'$1 ');
 const label=name+' · '+p.espece;
 return label+(label.length<=53?' : prix | Crocami':'');
}
export function productSummary(p,score){
 const e=escapeHtml,name=p.marque+' '+p.recette,nutrients=['proteines','matieresGrasses','fibres','cendres','humidite','calcium','phosphore','energie','omega3','omega6'],known=nutrients.filter(k=>Number.isFinite(p[k])).length;
 const values=[p.proteines!=null?money(p.proteines)+' % de protéines':null,p.matieresGrasses!=null?money(p.matieresGrasses)+' % de matières grasses':null,p.energie!=null?money(p.energie)+' kcal/kg':null].filter(Boolean);
 const offers=verifiedOffers(p),merchants=[...new Set(offers.map(o=>o.marchand))];
 return '<section class="detail-section product-reading"><p class="eyebrow">REPÈRES POUR CETTE RECETTE</p><h2>Ce que permet de comparer cette fiche</h2><p>'+e(name)+' est présenté pour '+e(p.espece==='chien'?'les chiens':'les chats')+' au stade '+e(String(p.age||'non communiqué').toLowerCase())+(p.gabarit?' · gabarit déclaré : '+e(p.gabarit):'')+'. '+(values.length?'Les données principales indiquent '+e(values.join(', '))+'. ':'')+'</p><p>'+known+' des '+nutrients.length+' données de lecture principales sont renseignées. '+(score.confidence!=null?'La couverture de la note Crocami est de '+score.confidence+' %. ':'')+(p.energie==null?'L’énergie de la recette n’est pas publiée dans la fiche principale : un RPC de référence peut être renseigné séparément. ':'L’énergie publiée permet de mettre les protéines en relation avec la densité énergétique, sans conclure à une adéquation individuelle. ')+'</p><p>'+(offers.length?offers.length+' formats et offres relevés chez '+e(merchants.join(' et '))+'. Comparez un même poids et vérifiez la date et les conditions dans le tableau ci-dessous.':'Aucune offre exacte vérifiée n’est disponible dans ce relevé. Un éventuel prix indicatif ne constitue pas un tarif actuel confirmé.')+'</p><p class="detail-muted">'+(p.sourceFabricant?'Une source de la marque est liée à cette fiche ; vérifiez sa formulation et les éventuelles différences avec les relevés marchands.':'La fiche principale ne dispose pas de lien fabricant : la confirmation de la formulation et des informations manquantes reste à effectuer.')+(isDiet(p)?' Aliment présenté comme diététique : les autres recettes ne sont pas proposées comme substituts sans avis vétérinaire.':'')+'</p></section>';
}
export function productSchema(p,url){
 const offers=verifiedOffers(p).filter(o=>o.formatKg===p.formatKg);
 if(!offers.length)return null;
 return {'@context':'https://schema.org','@type':'Product','@id':url+'#produit',name:p.marque+' '+p.recette+' — '+money(p.formatKg)+' kg',description:'Croquettes pour '+p.espece+' · '+p.age+' · format '+money(p.formatKg)+' kg. Prix relevés le '+offers[0].datePrix+', hors livraison.',image:[new URL(p.imageProduit,'https://crocami.fr/').href],brand:{'@type':'Brand',name:p.marque},sku:p.id+'-'+p.formatKg+'kg',url,offers:offers.map(o=>({'@type':'Offer',url:o.url,price:o.prixSac,priceCurrency:'EUR',seller:{'@type':'Organization',name:o.vendeur||o.marchand},itemCondition:'https://schema.org/NewCondition'}))};
}
export function liteProduct(p){
 const fields=['id','espece','marque','recette','age','besoins','gabarit','formatKg','prixSac','prixKg','datePrix','vendeur','proteines','proteinesMS','matieresGrasses','fibres','fibresAlimentairesTotales','cendres','humidite','glucides','calcium','phosphore','magnesium','omega3','omega6','dha','epaDha','energie','taurine','ratioCalciumPhosphore','rpcReference','noteComposition','imageProduit','verificationFabricant','sourceFabricant','typeAliment'];
 return {...Object.fromEntries(fields.filter(k=>p[k]!==undefined).map(k=>[k,p[k]])),prixStatut:verifiedPrice(p)?'verifie':'indicatif'};
}

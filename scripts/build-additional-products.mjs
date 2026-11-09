import fs from 'node:fs';
import {zoomaliaValues,zoomaliaCopy} from './merchant-data-utils.mjs';
const details=JSON.parse(fs.readFileSync('reports/zooplus-product-details.json','utf8'));
const fields={'protéines brutes':'proteines','matières grasses brutes':'matieresGrasses','cellulose brute':'fibres','cendres brutes':'cendres','humidité':'humidite','calcium':'calcium','phosphore':'phosphore','magnésium':'magnesium','sodium':'sodium','acides gras oméga 3':'omega3','acides gras oméga 6':'omega6'};
const base={formatKg:null,prixSac:null,prixKg:null,vendeur:null,datePrix:null,proteines:null,matieresGrasses:null,fibres:null,cendres:null,humidite:null,glucides:null,calcium:null,phosphore:null,magnesium:null,sodium:null,omega3:null,omega6:null,energie:null,taurine:null,premierIngredient:null,noteComposition:null,scoreCrocami:null,compositionComplete:null,additifs:null,ration:null,sourceFabricant:null,verificationFabricant:'à vérifier',dateVerificationRevendeur:'2026-11-09'};
const products=[];
const photoAudit=JSON.parse(fs.readFileSync('reports/merchant-photo-audit-2026-11-09.json','utf8'));
for(const [title,id,espece,age,gabarit]of [['Royal Canin Medium Adult 7+ pour chien','zp-dog-royal-medium-adult-7','chien','Senior','Moyenne'],['Royal Canin Kitten','zp-cat-royal-kitten','chat','Junior','Toutes']]){
 const d=details.find(x=>x.title===title&&x.status===200);if(!d)throw Error('Missing source '+title);
 const values={};for(const [label,value]of d.analysis){const field=fields[label];const m=value.match(/^(\d+(?:\.\d+)?)\s*%$/);if(field&&m)values[field]=+m[1];}
 const parts=d.ingredients.split(/\bAdditifs\s*:?/i);
 const composition=parts[0].replace(/^Ingrédients\s*:?\s*/i,'');
 products.push({...base,...values,id,espece,marque:'Royal Canin',recette:title.replace(/^Royal Canin /,'').replace(/ pour chien$/,''),age,gabarit,besoins:[age==='Junior'?'Croissance':'Senior'],compositionComplete:composition,premierIngredient:composition.split(',')[0],additifs:parts.length>1?parts.slice(1).join(' Additifs ').trim():null,ration:d.feeding||null,imageProduit:photoAudit.find(p=>p.id===id)?.localPath||d.image||null,sourceImageProduit:d.image,sourceRevendeur:d.url,sourceDonnees:'Fiche produit Zooplus consultée le 9 novembre 2026',statutDonnees:'Composition, analyse et ration publiées par Zooplus. Données fabricant non vérifiées séparément. Les valeurs absentes restent non communiquées.'});
}
const zoomalia=[
 {page:'11506',id:'zm-cat-proplan-sterilised-salmon',marque:'Purina Pro Plan',recette:'Sterilised Adult Renal Plus (saumon)'},
 {page:'33450',id:'zm-cat-proplan-sterilised-rabbit',marque:'Purina Pro Plan',recette:'Sterilised Adult Renal Plus (lapin)'},
 {page:'30741',id:'zm-cat-hills-sterilised-chicken',marque:"Hill's Science Plan",recette:'Adult Sterilised (poulet)'},
 {page:'15795',id:'zm-cat-hills-light-chicken',marque:"Hill's Science Plan",recette:'Adult Light (poulet)'}
];
for(const item of zoomalia){
 const live=JSON.parse(fs.readFileSync('reports/zoomalia-live.json','utf8')).find(r=>r.offers&&r.url.match(/p-(\d+)/)?.[1]===item.page);
 if(!live)throw Error('Missing verified Zoomalia source '+item.page);
 const {values}=zoomaliaValues(live),copy=zoomaliaCopy(live);
 delete values.energie;
 products.push({...base,...values,id:item.id,marque:item.marque,recette:item.recette,espece:'chat',age:'Adulte',gabarit:'Toutes',besoins:[item.recette.includes('Light')?'Contrôle du poids':'Stérilisé'],compositionComplete:copy.composition,premierIngredient:copy.composition?.split(',')[0]||null,additifs:copy.additifs,ration:copy.ration,imageProduit:photoAudit.find(p=>p.id===item.id)?.localPath||null,sourceImageProduit:photoAudit.find(p=>p.id===item.id)?.sourceUrl||null,sourceRevendeur:live.url,sourceDonnees:'Fiche produit Zoomalia consultée le 9 novembre 2026',statutDonnees:'Valeurs publiées par Zoomalia pour cette recette. Données fabricant non vérifiées séparément. Les valeurs absentes restent non communiquées.'});
}
fs.writeFileSync('references-complementaires.js','/* Nouvelles références, sources revendeur vérifiées le 9 novembre 2026. */\nwindow.CROCamiCatalog.push(...'+JSON.stringify(products,null,2)+');\n');
console.log(products.length,'new products');

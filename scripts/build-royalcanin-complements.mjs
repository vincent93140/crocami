import fs from 'node:fs';
const ferme='https://www.lafermedesanimaux.com/';
// Transcriptions de valeurs factuelles consultées le 9 novembre 2026.
// Ces analyses diffèrent des fiches officielles actuelles : elles restent séparées.
const sources=[
 ['mini-puppy','croquettes-royal-canin-mini-junior.html',[['Protéines',31],['Matières grasses',20],['Cellulose brute',1.4],['Cendres',6.8],['Humidité',9.5],['Calcium',1.14],['Phosphore',.9],['Magnésium',.07],['Sodium',.4],['Potassium',.66],['Oméga-3',.6],['Oméga-6',3.21],['EPA + DHA',.25],['Amidon',26.3],['Taurine',1900,'mg/kg']]],
 ['kitten','croquettes-pour-chatons-royal-canin-kitten-36.html',[['Protéines',36],['Matières grasses',18],['Cellulose brute',2.4],['Cendres',7.4],['Humidité',5.5],['Calcium',1.06],['Phosphore',.96],['Magnésium',.08],['Sodium',.6],['Potassium',.6],['Oméga-3',.7],['Oméga-6',4.09],['Amidon',25.8],['Taurine',2200,'mg/kg']]],
 ['sensible-33','croquettes-pour-chats-royal-canin-sensible-33.html',[['Protéines',33],['Matières grasses',22],['Cellulose brute',1.6],['Cendres',6.9],['Humidité',5.5],['Calcium',1.13],['Phosphore',.91],['Magnésium',.07],['Sodium',.5],['Oméga-3',.79],['Oméga-6',4.63],['EPA + DHA',.3],['Amidon',26.3],['Taurine',2300,'mg/kg'],['Énergie métabolisable calculée (NRC85)',4110,'kcal/kg']]],
 ['indoor-27','croquettes-pour-chats-royal-canin-indoor-27.html',[['Protéines',27],['Matières grasses',13],['Cellulose brute',3.9],['Cendres',6.9],['Humidité',5.5],['Calcium',.99],['Phosphore',.85],['Magnésium',.09],['Sodium',.4],['Potassium',.6],['Oméga-3',.53],['Oméga-6',3.39],['Amidon',36],['Taurine',.19],['Énergie métabolisable publiée',3579.5,'kcal/kg']]],
 ['mini-adult','croquettes-royal-canin-mini-adulte.html',[['Protéines',27],['Matières grasses',16],['Cellulose brute',6.5],['Cendres',5.3],['Humidité',9.5],['Calcium',.91],['Phosphore',.7]]],
 ['medium-adult-7','croquettes-royal-canin-medium-adulte-mature-7-sac-15-kg.html',[['Protéines',25],['Matières grasses',14],['Cellulose brute',1.6],['Cendres',4.5],['Humidité',8],['Calcium',.9],['Phosphore',.7]]],
 ['maxi-adult','croquettes-royal-canin-maxi-adulte-sac-15-kg.html',[['Protéines',26],['Matières grasses',17],['Cellulose brute',1.2],['Cendres',6.6],['Humidité',9.5],['Calcium',1.02],['Phosphore',.68],['Oméga-3',.78],['EPA + DHA',.4]]],
 ['sterilised-7','croquettes-pour-chats-royal-canin-sterilised-7.html',[['Protéines',36],['Matières grasses',12],['Cellulose brute',5.5],['Cendres',7.9],['Calcium',1.03],['Phosphore',.8]]],
 ['maxi-puppy','croquettes-royal-canin-maxi-junior-32-sac-15-kg.html',[['Protéines',30],['Matières grasses',16],['Cellulose brute',2.7],['Cendres',8.5],['Calcium',1.2],['Phosphore',.9],['Magnésium',.08]]]
].map(([key,path,rows])=>({key,marchand:'La Ferme des Animaux',url:ferme+path,date:'2026-11-09',statut:'Fiche retirée du catalogue du revendeur. Analyse différente de la fiche officielle actuelle ; ces valeurs ne sont pas utilisées dans la note Crocami.',valeurs:rows.map(([nom,valeur,unite='%'])=>({nom,valeur,unite}))}));
// Extraction depuis la fiche Hairball Care téléchargée directement chez le revendeur.
const values=JSON.parse(fs.readFileSync('reports/royalcanin-complements/hairball-care-table.json','utf8')).valeurs;
if(values.length!==15)throw Error('Unexpected Hairball table '+values.length);
sources.push({key:'hairball-care',marchand:'La Compagnie des Animaux',url:'https://www.lacompagniedesanimaux.com/royal-canin-feline-care-nutrition-hairball-care-10-kg.html',date:'2026-11-09',statut:'Analyse revendeur différente : cellulose 6,9 % et fibres alimentaires 15,1 %, contre 6,7 % et 15 % sur la fiche officielle. Valeurs conservées séparément, sans effet sur la note Crocami.',valeurs:values});
fs.writeFileSync('reports/royalcanin-complements/verified-sources.json',JSON.stringify(sources,null,2)+'\n');
const apply=`
for(const entry of window.CROCamiRoyalCaninOfficial){
 const id=entry.newId||entry.ids[0];
 const key=entry.product.imageProduit.match(/rc-official-(.*)\\.jpg$/)[1];
 for(const product of window.CROCamiCatalog.filter(p=>entry.ids.includes(p.id)||p.id===entry.newId)){
  product.complementsNutritionnels=window.CROCamiRoyalCaninComplements.filter(s=>s.key===key);
 }
}
`;
fs.writeFileSync('royalcanin-complements.js','/* Analyses de revendeurs consultées le 9 novembre 2026, distinctes de la formule officielle. */\nwindow.CROCamiRoyalCaninComplements = '+JSON.stringify(sources,null,2)+';\n'+apply);
console.log(sources.length,'sources;',sources.reduce((n,s)=>n+s.valeurs.length,0),'additional nutritional values');

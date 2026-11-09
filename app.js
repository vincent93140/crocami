const tabs=[...document.querySelectorAll(".animal-tab")];let animal="chien";let selected=new Set();
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const data=window.CROCamiCatalog||[];
const yearNode=$("#year");if(yearNode)yearNode.textContent=new Date().getFullYear();
const fmt=n=>{if(n==null)return "Non communiqué";const value=typeof n==="number"?n:Number(String(n).trim().replace(/\s/g,"").replace(",", "."));return Number.isFinite(value)?new Intl.NumberFormat("fr-FR",{maximumFractionDigits:2,useGrouping:false}).format(value):String(n).replace(".",",");};
const fmtRatio=n=>n==null?"Non communiqué":new Intl.NumberFormat("fr-FR",{maximumFractionDigits:2,useGrouping:false}).format(Number(n));
function extractTaurine(p){
 if(p.taurine!=null)return p.taurine;
 const match=String(p.additifs||"").match(/taurine\s*([\d\s,\.]+)\s*(mg\s*\/\s*kg|%)/i);
 if(!match)return null;
 const amount=Number(match[1].replace(/\s/g,"").replace(",","."));
 return Number.isFinite(amount)?(match[2].includes("%")?amount*10000:amount):null;
}
function globalNutritionScore(p){
 const dog=p.espece==="chien",junior=p.age==="Junior";
 const criteria=[];
 const add=(name,value,weight,detail)=>{if(value!=null&&Number.isFinite(value))criteria.push({name,value:Math.max(0,Math.min(100,value)),weight,detail});};
 const rpc=p.energie>0&&p.proteines!=null?p.proteines*10000/p.energie:(p.rpcMacroquette>0?p.rpcMacroquette:null);
 const rpcMinimum=dog?(junior?62.5:52):(junior?95:83);
 if(rpc!=null){
  const rpcScore=rpc>=rpcMinimum+20?100:rpc>=rpcMinimum?70+(rpc-rpcMinimum)*1.5:Math.max(0,70*rpc/rpcMinimum);
  add("Rapport protido-calorique",rpcScore,30,p.energie>0?"RPC calculé avec les protéines et l’énergie métabolisable de la fiche. Une teneur élevée en protéines n’est pas pénalisée isolément.":"RPC publié par Macroquette ; énergie fabricant non vérifiée pour cette formulation.");
 }
 const proteinPhosphorus=p.proteines>0&&p.phosphore>0?p.proteines/p.phosphore:null;
 if(proteinPhosphorus!=null){
  const v=proteinPhosphorus>=35?100:proteinPhosphorus>=30?90:proteinPhosphorus>=25?80:proteinPhosphorus>=20?65:proteinPhosphorus>=15?45:20;
  add("Indice protéines / phosphore",v,20,"Indice de lecture calculé à partir des valeurs publiées; il ne permet pas à lui seul de juger la digestibilité ni l’origine des protéines.");
 }
 const caP=p.ratioCalciumPhosphore>0?Number(p.ratioCalciumPhosphore):(p.calcium!=null&&p.phosphore>0?p.calcium/p.phosphore:null);
 if(caP!=null){
  const v=caP>=1.2&&caP<=1.8?100:caP>=1&&caP<=2?85:caP>=0.8&&caP<=2.2?55:20;
  add("Ratio calcium / phosphore",v,15,p.ratioCalciumPhosphore>0?"Ratio Ca/P publié directement par le fabricant.":"Rapport calculé lorsque calcium et phosphore sont tous deux communiqués.");
 }
 const omega=p.omega3>0&&p.omega6!=null?p.omega6/p.omega3:null;
 if(omega!=null){
  const v=omega>=5&&omega<=10?100:omega>=3&&omega<=12?85:omega>=2&&omega<=15?60:25;
  add("Rapport oméga 6 / 3",v,10,"Rapport calculé uniquement si les deux teneurs sont disponibles.");
 }
 if(p.glucides!=null){
  const thresholds=dog?[15,20,25,30,35,40]:[10,15,20,25,30,35];
  const v=p.glucides<=thresholds[0]?100:p.glucides<=thresholds[1]?90:p.glucides<=thresholds[2]?80:p.glucides<=thresholds[3]?65:p.glucides<=thresholds[4]?50:p.glucides<=thresholds[5]?30:15;
  add("Glucides estimés",v,15,"Valeur estimée publiée ou calculée; son mode de calcul peut varier selon la source.");
 }
 if(p.fibres!=null){
  const v=p.fibres>=1.5&&p.fibres<=5?100:p.fibres>=1&&p.fibres<=7?80:p.fibres>=0.5&&p.fibres<=9?55:25;
  add("Fibres",v,5,"Repère comparatif indicatif; le type de fibres et la tolérance digestive comptent aussi.");
 }
 const taurine=!dog?extractTaurine(p):null;
 if(taurine!=null){
  const v=taurine>=1000?100:taurine>=800?80:taurine>=500?60:25;
  add("Taurine",v,5,"Nutriment essentiel chez le chat; valeur retenue uniquement lorsqu’elle est publiée.");
 }
 const coverage=criteria.reduce((s,x)=>s+x.weight,0);
 const raw=coverage?criteria.reduce((s,x)=>s+x.value*x.weight,0)/coverage:null;
 const score=raw==null||coverage<20?null:Math.round(raw);
 const reliability=coverage>=70?"Bonne":coverage>=45?"Moyenne":"Limitée";
 return {score,confidence:coverage,reliability,criteria,rpc,proteinPhosphorus,caP,omega,taurine};
}function scoreBubbleMarkup(p){
 const n=globalNutritionScore(p),score=n.score;
 const hue=score==null?0:Math.round(score*1.2),background=score==null?"#85877f":`hsl(${hue} 68% 42%)`;
 return '<div class="score-bubble" style="--score-color:'+background+'" role="img" aria-label="Note Crocami '+(score==null?"non calculable":score+" sur 100")+' · couverture '+n.confidence+' % · fiabilité '+n.reliability+'" title="Note Crocami : '+(score==null?"non calculable":score+"/100")+' · Couverture : '+n.confidence+' % · Fiabilité : '+n.reliability+'"><strong>'+(score==null?"—":score)+'</strong><small>/100</small></div><small class="score-coverage-mini">'+n.confidence+' % de couverture</small>';
}
function scoreStackMarkup(p){
 return '<div class="score-stack">'+scoreBubbleMarkup(p)+'</div>';
}
function globalScoreMarkup(p,compact=false){
 const a=globalNutritionScore(p),cls=a.score==null?"missing":a.score>=80?"good":a.score>=60?"medium":"watch",score=a.score==null?"—":a.score;
 if(compact)return '<div class="global-score-card '+cls+'"><div class="global-score-number"><strong>'+score+'</strong><span>/100</span></div><div class="global-score-copy"><b>Note Crocami</b><small>Couverture des critères : '+a.confidence+' % · fiabilité '+a.reliability.toLowerCase()+'</small></div></div>';
 const dog=p.espece==="chien",junior=p.age==="Junior";
 const rpcMin=dog?(junior?62.5:52):(junior?95:83);
 const actual={
  "Rapport protido-calorique":a.rpc==null?null:fmtRatio(a.rpc)+" g/Mcal"+(p.energie>0?"":" · Macroquette"),
  "Indice protéines / phosphore":a.proteinPhosphorus==null?null:fmtRatio(a.proteinPhosphorus),
  "Ratio calcium / phosphore":a.caP==null?null:fmtRatio(a.caP),
  "Rapport oméga 6 / 3":a.omega==null?null:fmtRatio(a.omega),
  "Glucides estimés":p.glucides==null?null:fmt(p.glucides)+" %",
  "Fibres":p.fibres==null?null:fmt(p.fibres)+" %",
  "Taurine":a.taurine==null?null:fmt(a.taurine)+" mg/kg"
 };
 const targets={
  "Rapport protido-calorique":"≥ "+fmt(rpcMin)+" g/Mcal",
  "Indice protéines / phosphore":"indicateur comparatif, non diagnostique",
  "Ratio calcium / phosphore":"repère indicatif : 1 à 2",
  "Rapport oméga 6 / 3":"repère indicatif : 5 à 10",
  "Glucides estimés":"plus bas est généralement préférable",
  "Fibres":"repère indicatif : 1,5 à 5 %",
  "Taurine":"repère chat : ≥ 1 000 mg/kg"
 };
 const criteria=a.criteria.map(x=>'<div><span>'+x.name+'</span><b>'+(actual[x.name]||"Non communiqué")+'</b><small>Repère : '+targets[x.name]+' · poids '+x.weight+' %</small></div>').join("");
 return '<section class="global-score-detail"><div class="global-score-top"><div><span>NOTE CROCAMI</span><div class="global-score-big">'+score+'<small>/100</small></div></div><div class="global-score-reliability"><b>Fiabilité : '+a.reliability+'</b><span>Couverture : '+a.confidence+' %</span></div></div><div class="global-score-criteria">'+criteria+'</div><p class="global-score-foot">Indice comparatif Crocami. Les critères absents sont exclus du calcul et réduisent la couverture. La protéine brute seule n’est jamais pénalisée; le RPC est calculé depuis l’énergie lorsqu’elle est publiée; à défaut, le RPC Macroquette est affiché séparément et sourcé. Ce score n’est pas un avis vétérinaire.</p></section>';
}function nutritionAudit(p){
 if(p.espece!=="chien")return null;
 const dm=p.humidite==null?null:100-p.humidite;
 const dry=v=>v==null||dm==null||dm<=0?null:v/dm*100;
 const rpc=p.energie>0&&p.proteines!=null?p.proteines*10000/p.energie:(p.rpcMacroquette>0?p.rpcMacroquette:null);
 const rows=[];
 const add=(name,value,unit,reference,status,detail)=>rows.push({name,value,unit,reference,status,detail});
 const adult=p.age!=="Junior",rpcMin=adult?52:62.5;
 add("Rapport protido-calorique",rpc==null?null:Math.round(rpc),"g/Mcal",`≥ ${rpcMin} g/Mcal (repère indicatif ${adult?"adulte":"croissance"})`,rpc==null?"missing":rpc>=rpcMin?"good":"bad",p.energie>0?"RPC calculé à partir des protéines et de l’énergie métabolisable publiées.":p.rpcMacroquette>0?"RPC publié par Macroquette ; l’énergie fabricant reste non communiquée.":"RPC non calculable faute de données.");
 add("Protéines brutes",p.proteines,"% aliment","Aucun seuil isolé : lire avec le RPC","info","Le pourcentage de protéines n’est pas noté seul; il doit être interprété avec la densité énergétique et les autres indicateurs.");
 const carbs=dry(p.glucides);
 add("Glucides estimés",carbs==null?null:Math.round(carbs*10)/10,"% matière sèche","Repère comparatif indicatif",carbs==null?"missing":carbs<15?"good":"watch","Glucides estimés ramenés à la matière sèche lorsque l’humidité est connue.");
 const fiber=dry(p.fibres);
 add("Fibres",fiber==null?null:Math.round(fiber*10)/10,"% matière sèche","Repère indicatif : 1,5 à 5 % MS",fiber==null?"missing":fiber<=5?"good":"watch","Le type de fibres et la tolérance digestive doivent aussi être pris en compte.");
 const ca=dry(p.calcium),ratio=p.ratioCalciumPhosphore>0?Number(p.ratioCalciumPhosphore):(p.calcium!=null&&p.phosphore>0?p.calcium/p.phosphore:null);
 const mineralOk=ca!=null&&ratio!=null&&ca>=1&&ca<=1.7&&ratio>=1&&ratio<=2;
 add("Équilibre minéral Ca/P",ratio,"ratio","Ca : 1–1,7 % MS ; Ca/P : 1–2",ratio==null?"missing":ratio>=1&&ratio<=2?"good":"bad",p.ratioCalciumPhosphore>0?"Ratio Ca/P directement publié par le fabricant; les teneurs individuelles Ca et P ne sont pas communiquées.":"Rapport calculé; les teneurs absolues doivent aussi être interprétées selon l’âge.");
 const omega=p.omega3>0&&p.omega6!=null?p.omega6/p.omega3:null;
 add("Rapport oméga 6 / 3",omega,"ratio","Repère indicatif : 5 à 10",omega==null?"missing":omega>=5&&omega<=10?"good":"watch","Les deux valeurs doivent être publiées pour calculer ce rapport.");
 const proteinPhosphorus=p.proteines>0&&p.phosphore>0?p.proteines/p.phosphore:null;
 add("Indice protéines / phosphore",proteinPhosphorus==null?null:Math.round(proteinPhosphorus*100)/100,"ratio","Indicateur comparatif, non diagnostique",proteinPhosphorus==null?"missing":"info","Cet indice ne permet pas à lui seul de certifier la qualité ou la digestibilité des protéines.");
 const known=rows.filter(x=>x.status!=="missing"),good=rows.filter(x=>x.status==="good").length,bad=rows.filter(x=>x.status==="bad").length;
 return {rows,rpc,good,bad,missing:rows.length-known.length,known:known.length,total:rows.length};
}function auditMarkup(p,compact=false){
 const a=nutritionAudit(p);if(!a)return "";
 const label=a.known===0?"Analyse incomplète":a.bad?"Points à surveiller":a.missing?"Bilan partiel":"Repères couverts";
 const cls=a.bad?"watch":a.known===0?"missing":a.missing?"partial":"good";
 if(compact)return `<div class="audit-summary ${cls}"><b>${label}</b><span>${a.good} repères satisfaisants · ${a.bad} à surveiller · ${a.missing} données manquantes</span></div>`;
 return `<section class="nutrition-audit"><div class="audit-heading"><div><b>Analyse nutritionnelle Crocami</b><small>Comparaison indicative à des repères de lecture, pas un diagnostic vétérinaire.</small></div><strong class="audit-status ${cls}">${label}</strong></div><div class="audit-list">${a.rows.map(x=>`<div class="audit-row"><div class="audit-row-main"><b>${x.name}</b><span class="audit-value ${x.status}">${x.value==null?"Donnée manquante":(x.unit==="ratio"?fmtRatio(x.value):x.value)+" "+x.unit}</span></div><small>Repère : ${x.reference}</small><p>${x.detail}</p><em class="audit-tag ${x.status}">${x.status==="good"?"SATISFAISANT":x.status==="bad"?"NON SATISFAISANT":x.status==="watch"?"À SURVEILLER":x.status==="info"?"INDICATEUR À INTERPRÉTER":"DONNÉE MANQUANTE"}</em></div>`).join("")}</div><p class="audit-foot">Calculs établis uniquement à partir des données disponibles sur cette fiche. Les repères Crocami sont comparatifs et non diagnostiques; ils ne reproduisent pas l’algorithme Macroquette. Les besoins réels varient selon le poids, l’activité, l’état physiologique et la santé du chien.</p></section>`;
}

function initNutritionAdvisor(){
 const animalButtons=$$("[data-advisor-animal]");
 let advisorAnimal="chien";
 function updateAdvisorAnimal(){animalButtons.forEach(b=>b.classList.toggle("active",b.dataset.advisorAnimal===advisorAnimal));}
 function recommend(){
  const age=$("#advisorAge").value,weight=Number($("#advisorWeight").value)||null,sterilized=$("#advisorSterilized").value,activity=$("#advisorActivity").value,budget=Number($("#advisorBudget").value)||null;
  const candidates=data.filter(p=>p.espece===advisorAnimal);
  const ranked=candidates.map(p=>{
   const n=globalNutritionScore(p),reasons=[],cautions=[];let fit=0;
   if(p.age===age){fit+=28;reasons.push("âge correspondant");}
   else if(p.age==="Adulte"&&age==="Senior"){fit+=8;cautions.push("recette adulte, pas spécifiquement senior");}
   else{fit-=35;cautions.push("stade de vie différent");}
   if(weight&&advisorAnimal==="chien"){
    const size=weight<10?"Petite":weight<25?"Moyenne":weight<45?"Grande":"Géante";
    if(p.gabarit==="Toutes"||(p.gabarit||"").split("|").includes(size)){fit+=12;reasons.push("gabarit compatible");}
    else{fit-=12;cautions.push("gabarit non ciblé par la recette");}
   }
   if(sterilized==="oui"){if((p.besoins||[]).includes("Stérilisé")){fit+=14;reasons.push("recette indiquée pour animal stérilisé");}else{fit-=5;cautions.push("pas spécifiquement formulée pour la stérilisation");}}
   if(activity==="active"&&/Energy|Sport|Active|Performance/i.test(p.recette)){fit+=8;reasons.push("recette orientée activité");}
   if(activity==="calm"&&(p.besoins||[]).some(x=>/poids|light|stérilisé/i.test(x))){fit+=7;reasons.push("profil pouvant convenir à une activité réduite");}
   if(budget){if(p.prixKg!=null&&p.prixKg<=budget){fit+=10;reasons.push("dans votre budget");}else if(p.prixKg!=null){fit-=16;cautions.push("au-dessus du budget indiqué");}else cautions.push("prix au kilo indisponible");}
   const total=Math.max(0,Math.min(100,Math.round((n.score??50)*.65+Math.max(0,Math.min(100,50+fit))*.35)));
   return {p,n,total,reasons,cautions};
  }).filter(x=>x.total>=35).sort((a,b)=>b.total-a.total||(b.n.score??0)-(a.n.score??0));
  const results=$("#advisorResults");results.hidden=false;
  if(!ranked.length){results.innerHTML='<div class="advisor-empty"><b>Aucune recette suffisamment proche de ce profil.</b><p>Essayez d’élargir le budget. Le catalogue ne contient peut-être pas encore la recette recherchée.</p></div>';return;}
  const html=ranked.slice(0,5).map((x,i)=>'<article class="advisor-result-card"><div class="advisor-result-rank">#'+(i+1)+'</div><div class="advisor-result-main"><p class="advisor-result-brand">'+escapeProductText(x.p.marque)+'</p><h3>'+escapeProductText(x.p.recette)+'</h3><div class="advisor-result-meta">'+(x.p.prixKg!=null?fmt(x.p.prixKg)+' €/kg':'Prix non communiqué')+' · '+(x.n.score!=null?'Note Crocami '+x.n.score+'/100':'Note non calculable')+' · couverture '+x.n.confidence+' %</div><p class="advisor-reasons">'+(x.reasons.length?x.reasons.map(escapeProductText).join(' · '):'Correspondance générale avec le profil')+'</p>'+(x.cautions.length?'<p class="advisor-cautions">À vérifier : '+x.cautions.map(escapeProductText).join(' · ')+'</p>':'')+'<a href="#produit/'+encodeURIComponent(x.p.id)+'">Voir la fiche complète →</a></div><div class="advisor-match"><strong>'+x.total+'</strong><span>correspondance</span></div></article>').join("");
  results.innerHTML='<div class="advisor-results-heading"><div><p class="eyebrow">VOTRE SÉLECTION</p><h3>Les recettes les plus proches de son profil</h3></div><span>'+Math.min(5,ranked.length)+' suggestions sur '+candidates.length+' références</span></div>'+html+'<p class="advisor-disclaimer">Cette sélection est une aide au tri, pas une prescription vétérinaire. Le poids seul ne permet pas d’évaluer l’état corporel. En cas de maladie, allergie suspectée, surpoids important ou régime thérapeutique, demandez conseil à votre vétérinaire.</p>';
 }
 animalButtons.forEach(b=>b.addEventListener("click",()=>{advisorAnimal=b.dataset.advisorAnimal;updateAdvisorAnimal();$("#advisorResults").hidden=true;}));
 $("#advisorSubmit").addEventListener("click",recommend);updateAdvisorAnimal();
}
const needGroups={
 "Digestion et sensibilités":["Sensibilité digestive","Sensibilité alimentaire"],
 "Poids et mode de vie":["Contrôle du poids","Activité intense","Stérilisé"],
 "Confort et santé":["Soutien articulaire","Soutien peau et pelage","Peau et pelage","Boules de poils","Santé urinaire"]
};
function renderNeedOptions(species){
 const select=$("#need"),field=$("#needField"),speciesLabel=species==="chien"?"chien":"chat";
 const previous=select.value;
 const available=new Set(data.filter(p=>p.espece===species).flatMap(p=>p.besoins||[]));
 const groups=Object.entries(needGroups).map(([label,values])=>[label,values.filter(value=>available.has(value))]).filter(([,values])=>values.length);
 const display=value=>value==="Stérilisé"?"Stérilisation":value==="Soutien articulaire"?"Articulations":value==="Soutien peau et pelage"?"Peau et pelage":value==="Sensibilité digestive"?"Digestion sensible":value==="Sensibilité alimentaire"?"Sensibilité alimentaire":value;
 select.innerHTML='<option value="">Tous les besoins du '+speciesLabel+'</option>'+groups.map(([label,values])=>'<optgroup label="'+label+'">'+values.map(value=>'<option value="'+value+'">'+display(value)+'</option>').join("")+'</optgroup>').join("");
 field.firstChild.textContent="Besoin du "+speciesLabel;
 $("#needHelp").textContent="Catégories adaptées aux "+speciesLabel+"s présents dans le catalogue.";
 if(available.has(previous))select.value=previous;
}
function setAnimal(v){animal=v;renderNeedOptions(v);tabs.forEach(t=>t.classList.toggle("active",t.dataset.animal===v));$("#resultsTitle").textContent=v==="chien"?"Les croquettes pour chien":"Les croquettes pour chat";$("#search").placeholder=v==="chien"?"Ex. : saumon, digestion sensible, marque…":"Ex. : chat stérilisé, saumon, digestion…";
 if(v==="chat"){$("#size").innerHTML='<option value="">Tous les gabarits</option><option value="Toutes">Toutes les tailles</option>';$("#sizeField").querySelector("span")?.remove();$("#sizeHelp").textContent="Les gabarits sont peu discriminants chez le chat ; privilégiez âge et besoins.";}
 else{$("#size").innerHTML='<option value="">Toutes les tailles</option><option value="Petite">Petit</option><option value="Moyenne">Moyen</option><option value="Grande">Grand</option><option value="Géante">Géant</option>';$("#sizeHelp").textContent="Repère basé sur le poids adulte idéal.";}
 selected.clear();render();}
function normalizeSearchText(value){return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("fr").trim();}
function normalizeBrandKey(value){return normalizeSearchText(value).replace(/[^a-z0-9]/g,"");}
function filtered(){
 const query=normalizeSearchText($("#search").value).split(/\s+/).filter(Boolean),age=$("#age").value,need=$("#need").value,size=$("#size").value,brand=$("#brand")?.value||"",sort=$("#sortBy")?.value||"note-desc",maxKg=Number($("#maxPriceKg")?.value)||null,scoreCategory=$("#scoreCategory")?.value||"";
 const score=p=>globalNutritionScore(p).score;
 const matchesScoreCategory=p=>{if(!scoreCategory)return true;const value=score(p);if(value==null)return false;if(scoreCategory==="green")return value>=80;if(scoreCategory==="orange")return value>=60&&value<80;return scoreCategory==="red"&&value<60;};
 const rows=data.filter(p=>{
  const searchable=normalizeSearchText([p.marque,p.recette,p.premierIngredient,(p.besoins||[]).join(" "),p.composition||"",p.compositionComplete||"",p.descriptionFabricant||""].join(" "));
  return p.espece===animal&&query.every(term=>searchable.includes(term))&&(!age||p.age===age)&&(!need||(p.besoins||[]).includes(need))&&(!size||p.gabarit==="Toutes"||(p.gabarit||"").split("|").includes(size))&&(!brand||normalizeBrandKey(p.marque)===brand)&&(!maxKg||(p.prixKg!=null&&p.prixKg<=maxKg))&&matchesScoreCategory(p);
 });
 const keys={"prix-asc":p=>p.prixSac,"prix-desc":p=>p.prixSac,"kg-asc":p=>p.prixKg,"kg-desc":p=>p.prixKg,"note-desc":score,"note-asc":score,"marque":p=>p.marque};
 const key=keys[sort];if(key)rows.sort((x,y)=>{const a=key(x),b=key(y);if(a==null&&b==null)return 0;if(a==null)return 1;if(b==null)return -1;const cmp=typeof a==="string"?a.localeCompare(b,"fr"):a-b;return sort.endsWith("desc")?-cmp:cmp;});
 return rows;
}
function metricStatus(value,min,max){
 if(value==null||!Number.isFinite(value))return "unknown";
 if(min!=null&&max!=null){
  if(value>=min&&value<=max)return "good";
  const tolerance=(max-min)*0.35;
  return value<min?(min-value<=tolerance?"near":"poor"):(value-max<=tolerance?"near":"poor");
 }
 if(min!=null)return value>=min?"good":(min-value<=min*0.10?"near":"poor");
 if(max!=null)return value<=max?"good":(value-max<=max*0.10?"near":"poor");
 return "unknown";
}
function productMetricItems(p){
 const dog=p.espece==="chien",junior=p.age==="Junior",weight=(p.besoins||[]).includes("Contrôle du poids"),sterilised=(p.besoins||[]).includes("Stérilisé");
 const rpc=p.energie>0&&p.proteines!=null?p.proteines*10000/p.energie:(p.rpcMacroquette>0?p.rpcMacroquette:null);
 const rpcMin=dog?(junior?62.5:52):(junior?95:83);
 const fat=dog?(junior?[13,20]:weight?[7,12]:[10,16]):(sterilised?[10,16]:[12,18]);
 const fiber=dog?(weight?[3,10]:[1,4]):[2,5];
 const caP=p.ratioCalciumPhosphore>0?Number(p.ratioCalciumPhosphore):(p.calcium!=null&&p.phosphore>0?p.calcium/p.phosphore:null);
 const omega=p.omega3>0&&p.omega6!=null?p.omega6/p.omega3:null;
 const items=[
  {name:"Protéines",raw:p.proteines,unit:"%",target:rpc!=null?"couleur basée sur le RPC (≥ "+fmt(rpcMin)+" g/Mcal)":(dog?"repère sans RPC : ≥ 28 %":"repère sans RPC : ≥ "+(junior?35:30)+" %"),status:rpc!=null?metricStatus(rpc,rpcMin,null):metricStatus(p.proteines,dog?28:(junior?35:30),null)},
  {name:"RPC",raw:rpc,unit:"g/Mcal",target:p.energie>0?"calculé depuis l’énergie fabricant":"publié par Macroquette",status:metricStatus(rpc,rpcMin,null)},
  {name:"Matières grasses",raw:p.matieresGrasses,unit:"%",target:fmt(fat[0])+"–"+fmt(fat[1])+" %",status:metricStatus(p.matieresGrasses,fat[0],fat[1])},
  {name:"Fibres",raw:p.fibres,unit:"%",target:fmt(fiber[0])+"–"+fmt(fiber[1])+" %",status:metricStatus(p.fibres,fiber[0],fiber[1])},
  {name:"Ratio calcium / phosphore",raw:caP,unit:"ratio",target:dog?"1–2":"1–1,5",status:metricStatus(caP,1,dog?2:1.5)},
  {name:"Oméga 6 / 3",raw:omega,unit:"ratio",target:"5–10",status:metricStatus(omega,5,10)}
 ];
 if(!dog){const taurine=extractTaurine(p);items.push({name:"Taurine",raw:taurine,unit:"mg/kg",target:"≥ 1 000 mg/kg",status:metricStatus(taurine,1000,null)});}
 return items;
}
function cardMetricsMarkup(p){
 const items=productMetricItems(p);
 return '<div class="product-metrics">'+items.map(x=>{
  const value=x.raw==null?null:(x.unit==="ratio"?fmtRatio(x.raw):fmt(x.raw))+(x.unit==="%"?" %":x.unit==="g/Mcal"?" g/Mcal":x.unit==="mg/kg"?" mg/kg":"");
  return '<div class="metric-'+x.status+'"><small>'+x.name+'</small><b>'+(value||"Non communiqué")+'</b><span>'+(x.name==="Protéines"?"Lecture : "+x.target:"Attendu : "+x.target)+'</span></div>';
 }).join("")+'</div>';
}function sourcesMarkup(p){
 const links=[];
 const different=p.verificationFabricant==="formule_actuelle_différente";
 if(p.sourceFabricant)links.push('<a href="'+p.sourceFabricant+'" target="_blank" rel="noopener noreferrer">'+(different?"Fabricant · formule actuelle":"Fabricant")+'</a>');
 if(p.sourceDocumentFabricant)links.push('<a href="'+p.sourceDocumentFabricant+'" target="_blank" rel="noopener noreferrer">Fiche technique</a>');
 if(p.sourceRevendeur)links.push('<a href="'+p.sourceRevendeur+'" target="_blank" rel="noopener noreferrer">Revendeur</a>');
 if(p.sourceMacroquette)links.push('<a href="'+p.sourceMacroquette+'" target="_blank" rel="noopener noreferrer">Macroquette</a>');
 if(p.sourceComplementaire && p.sourceComplementaire!==p.sourceMacroquette && p.sourceComplementaire!==p.sourceRevendeur)links.push('<a href="'+p.sourceComplementaire+'" target="_blank" rel="noopener noreferrer">Source complémentaire</a>');
 const labels={
  "formule_actuelle_différente":"Formule de référence différente — valeurs historiques conservées séparément",
  "confirmée_partielle":"Composition et analyses confirmées partiellement par la source liée",
  "reference_historique_non_retrouvee":"Référence historique non retrouvée dans les sources consultées"
 };
 const label=labels[p.verificationFabricant]||"";
 const note=p.noteFabricant?String(p.noteFabricant).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):"";
 const review=label?'<details class="product-source-review"><summary>'+label+'</summary>'+(note?'<p>'+note+'</p>':"")+'</details>':"";
 const current=p.donneesFabricantActuelles;
 const currentLabels=[["proteines","Protéines","%"],["proteinesMinimum","Protéines · minimum garanti","%"],["matieresGrasses","Matières grasses","%"],["matieresGrassesMinimum","Matières grasses · minimum garanti","%"],["matieresGrassesMaximum","Matières grasses · maximum garanti","%"],["fibres","Fibres","%"],["glucides","Glucides (ENA)","%"],["fibresAlimentairesTotales","Fibres alimentaires totales","%"],["fibresMaximum","Fibres · maximum garanti","%"],["cendres","Cendres","%"],["cendresMaximum","Cendres · maximum garanti","%"],["humidite","Humidité","%"],["humiditeMaximum","Humidité · maximum garanti","%"],["calcium","Calcium","%"],["phosphore","Phosphore","%"],["ratioCalciumPhosphore","Rapport calcium / phosphore calculé",""],["calciumMinimum","Calcium · minimum garanti","%"],["phosphoreMinimum","Phosphore · minimum garanti","%"],["sodium","Sodium","%"],["sodiumMinimum","Sodium · minimum garanti","%"],["potassium","Potassium","%"],["magnesium","Magnésium","%"],["magnesiumMinimum","Magnésium · minimum garanti","%"],["omega3","Oméga-3","%"],["omega3Minimum","Oméga-3 · minimum garanti","%"],["omega6","Oméga-6","%"],["omega6Minimum","Oméga-6 · minimum garanti","%"],["dha","DHA","%"],["dhaMinimum","DHA · minimum garanti","%"],["epa","EPA","%"],["epaMinimum","EPA · minimum garanti","%"],["epaDha","EPA + DHA","%"],["amidon","Amidon","%"],["rpc","RPC publié","g/Mcal"],["energie","Énergie métabolisable calculée","kcal/kg"],["energieMesureeInVivo","Énergie métabolisable mesurée in vivo","kcal/kg"],["taurine","Taurine","mg/kg"],["taurineMinimum","Taurine · minimum garanti","mg/kg"],["taurineAjoutee","Taurine ajoutée (additif)","mg/kg"],["glucosamine","Glucosamine","mg/kg"],["glucosamineChondroitine","Glucosamine + chondroïtine","mg/kg"],["glucosamineMinimum","Glucosamine · minimum garanti","mg/kg"],["chondroitine","Chondroïtine","mg/kg"],["chondroitineMinimum","Chondroïtine · minimum garanti","mg/kg"],["lCarnitine","L-carnitine","mg/kg"],["lCarnitineMinimum","L-carnitine · minimum garanti","mg/kg"]];
 const currentRows=current?currentLabels.filter(x=>current[x[0]]!=null).map(x=>'<div><span>'+x[1]+'</span><b>'+fmt(current[x[0]])+' '+x[2]+'</b></div>').join(""):"";
 const currentFormula=current&&current.formule?String(current.formule).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):"";
 const currentComposition=current&&current.composition?escapeProductText(current.composition):"";
 const currentAdditives=current&&current.additifs?escapeProductText(current.additifs):"";
 const currentFormats=current&&current.formatsDisponibles?escapeProductText(current.formatsDisponibles):"";
 const currentRation=current&&current.ration?escapeProductText(current.ration):"";
 const currentImage=current&&current.imageProduit?'<img class="current-formula-image" src="'+escapeProductText(current.imageProduit)+'" alt="Sac '+escapeProductText(current.formule||p.marque)+'" loading="lazy">':"";
 const currentReview=current?'<details class="product-source-review product-current-formula"><summary>Valeurs publiées · formule de référence actuelle</summary><p><strong>'+currentFormula+'</strong></p>'+currentImage+'<div class="current-formula-values">'+currentRows+'</div>'+(currentFormats?'<p><b>Formats indiqués dans la source :</b> '+currentFormats+'</p>':"")+(currentRation?'<p><b>Ration indiquée dans la source :</b> '+currentRation+'</p>':"")+(currentComposition?'<p><b>Composition publiée :</b> '+currentComposition+'</p>':"")+(currentAdditives?'<p><b>Additifs publiés :</b> '+currentAdditives+'</p>':"")+'<p>Ces valeurs correspondent à la formule identifiée dans la source liée. Elles restent séparées de la recette historique affichée et ne sont pas utilisées pour calculer sa note ni son RPC. Les mentions « minimum garanti » et « maximum garanti » reprennent les seuils publiés, pas des teneurs mesurées.</p></details>':"";
 const archivedReview=archivedNutritionMarkup(p);
 return links.length||review||currentReview||archivedReview?'<div class="product-sources"><small>Sources</small>'+links.join("")+review+currentReview+archivedReview+'</div>':"";
}
function imageErrorFallback(img){const holder=img.parentElement;if(!holder)return;holder.classList.add("pack-missing");const fallback=document.createElement("span");fallback.className=holder.classList.contains("compare-product-pack")?"compare-pack-fallback":"pack-fallback";fallback.textContent=img.dataset.fallback||"🐾";img.replaceWith(fallback);}
function card(p){let checked=selected.has(p.id);const pack=p.imageProduit?'<img data-fallback="'+(p.espece==="chien"?"🐶":"🐱")+'" src="'+p.imageProduit+'" alt="Sac de '+p.marque+' — '+p.recette+'" loading="lazy" onerror="imageErrorFallback(this)">':'<span class="pack-fallback">'+(p.espece==="chien"?"🐶":"🐱")+'</span>';return `<article class="product-card"><div class="product-top"><span class="product-animal">${p.espece==="chien"?"🐶 CHIEN":"🐱 CHAT"}</span><label class="compare-check"><input type="checkbox" data-compare="${p.id}" ${checked?"checked":""}> Comparer</label></div><div class="product-identity"><a class="product-visual product-image-link" href="#produit/${encodeURIComponent(p.id)}" aria-label="Voir la fiche de ${p.marque} ${p.recette}" title="Voir la fiche produit">${pack}<span class="image-open-hint">Voir la fiche ↗</span></a><div class="product-names"><div class="product-name-copy"><a class="product-name-link" href="#produit/${encodeURIComponent(p.id)}" aria-label="Ouvrir la fiche de ${p.marque} ${p.recette}" title="Ouvrir la fiche produit"><p class="product-brand">${p.marque}</p><h3>${p.recette}</h3></a></div>${scoreStackMarkup(p)}</div></div>${cardMetricsMarkup(p)}<div class="product-price"><strong>${p.prixSac!=null?fmt(p.prixSac)+" €":"Prix du sac non communiqué"}</strong><span>${p.prixSac!=null?(p.formatKg!=null?fmt(p.formatKg)+" kg · ":"")+"Prix au kg : "+fmt(p.prixKg)+" €/kg":p.prixKg!=null?"Prix moyen indicatif au kg":"Prix non communiqué"}</span></div><a class="product-open-link" href="#produit/${encodeURIComponent(p.id)}">Voir la fiche complète <span>→</span></a></article>`;}

function escapeProductText(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function royalCaninDetailsMarkup(p){
 if(p.marque!=='Royal Canin'||!p.micronutrimentsFabricant)return '';
 const source='<a href="'+escapeProductText(p.sourceFabricant)+'" target="_blank" rel="noopener noreferrer">Fiche officielle Royal Canin ↗</a>';
 const benefits=(p.beneficesFabricant||[]).map(label=>'<li>'+escapeProductText(label)+'</li>').join('');
 const nutrients=p.micronutrimentsFabricant.map(n=>'<div class="detail-data-row metric-info"><span>'+escapeProductText(n.nom)+'<small>'+escapeProductText(n.nature)+'</small></span><b>'+fmt(n.valeur)+' '+escapeProductText(n.unite)+'</b></div>').join('');
 const refs=(p.referencesFabricant||[]).map(r=>'<tr><th scope="row">'+escapeProductText(r.format)+'</th><td>'+escapeProductText(r.ean)+'</td></tr>').join('');
 return '<section class="detail-section royal-official-details"><div class="detail-section-heading"><p class="eyebrow">DÉTAILS DU FABRICANT</p><h2>Vitamines, oligo-éléments et bénéfices</h2><p>Source : '+source+' · consultée le 09/11/2026.</p></div><h3>Vitamines et oligo-éléments publiés</h3><p class="detail-muted">Les quantités ajoutées comme additifs nutritionnels sont distinguées des teneurs analytiques totales. Elles ne représentent pas nécessairement la quantité totale présente dans l’aliment.</p><div class="detail-data-grid">'+nutrients+'</div>'+(benefits?'<h3>Bénéfices annoncés par Royal Canin</h3><ul class="manufacturer-benefits">'+benefits+'</ul>':'')+(p.consignesFabricant?'<h3>Utilisation et conservation</h3><p class="detail-muted">'+escapeProductText(p.consignesFabricant)+'</p>':'')+(refs?'<h3>Formats et références des sacs</h3><div class="feeding-table-scroll"><table class="feeding-table"><caption>Références de la boutique officielle</caption><thead><tr><th scope="col">Format</th><th scope="col">Code EAN</th></tr></thead><tbody>'+refs+'</tbody></table></div>':'')+'</section>';
}
function royalCaninComplementsMarkup(p){
 const records=p.complementsNutritionnels||[];
 if(!records.length)return '';
 return '<section class="detail-section" id="informations-complementaires"><div class="detail-section-heading"><p class="eyebrow">ANALYSES COMPLÉMENTAIRES</p><h2>Minéraux, oméga et autres nutriments chez les revendeurs</h2><p>Ces tableaux décrivent la formule publiée par chaque revendeur. Ils restent distincts des valeurs officielles et ne modifient pas la note Crocami.</p></div>'+records.map(r=>'<details class="retailer-detail-record" open><summary>'+escapeProductText(r.marchand)+' · analyse distincte</summary><p class="retailer-differences">'+escapeProductText(r.statut)+'</p><div class="detail-data-grid">'+r.valeurs.map(n=>'<div class="detail-data-row metric-info"><span>'+escapeProductText(n.nom)+'</span><b>'+fmt(n.valeur)+' '+escapeProductText(n.unite)+'</b></div>').join('')+'</div><p class="detail-muted">Consulté le 09/11/2026 · <a class="source-text-link" href="'+escapeProductText(r.url)+'" target="_blank" rel="noopener noreferrer">Vérifier ce tableau chez '+escapeProductText(r.marchand)+' ↗</a></p></details>').join('')+'</section>';
}
function manufacturerFeedingMarkup(p){
 const tables=p.tableauxRationFabricant||[];
 if(!tables.length)return p.ration?'<p>'+escapeProductText(p.ration)+'</p>':'<p class="detail-muted">Ration journalière non communiquée dans les données disponibles.</p>';
 return tables.map((rows,i)=>'<div class="feeding-table-scroll" tabindex="0" role="region" aria-label="Ration journalière, tableau '+(i+1)+'"><table class="feeding-table"><caption>Ration fabricant · tableau '+(i+1)+'</caption><tbody>'+rows.map(row=>'<tr>'+row.map(cell=>{const tag=cell.entete?'th':'td';const cols=Number.isInteger(cell.colonnes)&&cell.colonnes>0?cell.colonnes:1;const lines=Number.isInteger(cell.lignes)&&cell.lignes>0?cell.lignes:1;return '<'+tag+' colspan="'+cols+'" rowspan="'+lines+'">'+escapeProductText(cell.texte)+'</'+tag+'>';}).join('')+'</tr>').join('')+'</tbody></table></div>').join('');
}
function detailValue(value,unit=""){return value==null||value===""?"Non communiqué":escapeProductText(typeof value==="number"?fmt(value):value)+(unit?" "+unit:"");}
function archivedNutritionMarkup(p){
 const entries=p.donneesFabricantArchivees||[];
 return entries.map(entry=>{
  const values=(entry.valeurs||[]).map(([label,value,unit])=>'<div><span>'+escapeProductText(label)+'</span><b>'+detailValue(value,unit)+'</b></div>').join("");
  const link=entry.source?'<p><a href="'+escapeProductText(entry.source)+'" target="_blank" rel="noopener noreferrer">Ouvrir la fiche fabricant ↗</a></p>':"";
  return '<details class="product-source-review product-archived-formula"><summary>Fiche fabricant archivée · '+escapeProductText(entry.date||"date non précisée")+'</summary><p><strong>'+escapeProductText(entry.titre||"Formule publiée")+'</strong></p>'+(values?'<div class="current-formula-values">'+values+'</div>':"")+(entry.note?'<p>'+escapeProductText(entry.note)+'</p>':"")+link+'<p>Cette fiche technique datée est conservée séparément des valeurs principales et de la formule actuelle. Elle ne modifie pas la note ni le RPC Crocami.</p></details>';
 }).join("");
}
function merchantOffersMarkup(p){
 const offers=p.offres||[];
 const groups=['Zoomalia','Zooplus',...(offers.some(o=>o.marchand==='Royal Canin')?['Royal Canin']:[])].map(merchant=>{
  const rows=offers.filter(o=>o.marchand===merchant).sort((a,b)=>b.disponible-a.disponible||a.formatKg-b.formatKg||a.prixSac-b.prixSac);
  if(!rows.length)return '<article class="merchant-panel"><h3>'+merchant+'</h3><p class="detail-muted">Prix non vérifié pour cette référence.</p></article>';
  return '<article class="merchant-panel"><h3>'+merchant+'</h3><div class="merchant-table-scroll"><table class="merchant-table"><caption class="sr-only">Formats et prix chez '+merchant+'</caption><thead><tr><th scope="col">Format</th><th scope="col">Prix TTC</th><th scope="col">Au kilo</th><th scope="col">Offre</th></tr></thead><tbody>'+rows.map(o=>'<tr><th scope="row">'+escapeProductText(o.format)+'</th><td>'+fmt(o.prixSac)+' €</td><td>'+fmt(o.prixKg)+' €/kg'+(o.prixKgRecalcule?'<small>Recalculé pour le poids indiqué</small>':'')+'</td><td><a href="'+escapeProductText(o.url)+'" target="_blank" rel="noopener noreferrer">'+(o.disponible?'Voir l’offre':'Vérifier le retour en stock')+' ↗</a><small>'+(o.disponible?'':'Indisponible lors du relevé · ')+(o.condition?escapeProductText(o.condition)+' · ':'')+(o.stockNote?escapeProductText(o.stockNote)+' · ':'')+(o.vendeur!==merchant?'Vendu par '+escapeProductText(o.vendeur)+' · ':'')+'Consulté le '+escapeProductText(o.datePrix.split('-').reverse().join('/'))+'</small></td></tr>').join('')+'</tbody></table></div></article>';
 }).join('');
 return '<section class="detail-section merchant-section"><div class="detail-section-heading"><p class="eyebrow">PRIX PAR MARCHAND</p><h2>Où trouver cette recette ?</h2><p>Prix TTC hors frais de livraison, sans abonnement ni code promo. Chaque ligne correspond au format indiqué ; le prix au kilo est calculé à partir de son poids total. Les prix et les stocks peuvent évoluer : vérifiez l’offre chez le marchand.</p></div><div class="merchant-panels">'+groups+'</div></section>';
}
function retailerNutritionMarkup(p){
 const records=p.relevesRevendeurs||[];
 const labels={proteines:'Protéines',matieresGrasses:'Matières grasses',fibres:'Fibres',cendres:'Cendres',humidite:'Humidité',glucides:'Glucides publiés',calcium:'Calcium',phosphore:'Phosphore',magnesium:'Magnésium',sodium:'Sodium',omega3:'Oméga-3',omega6:'Oméga-6',potassium:'Potassium',chlorure:'Chlorure',amidon:'Amidon',energie:'Énergie publiée',taurine:'Taurine déclarée',epaDha:'EPA + DHA',epa:'EPA',dha:'DHA'};
 return records.map(r=>{
  const unit=key=>(r.unites||{})[key]||'%';
  const rows=Object.entries(r.valeurs||{}).map(([key,value])=>'<div class="detail-data-row"><span>'+escapeProductText(labels[key]||key)+'</span><b>'+detailValue(value,unit(key))+'</b></div>').join('');
  const differences=(r.ecarts||[]).length?'<p class="retailer-differences">Écarts avec les valeurs de la fiche : '+r.ecarts.map(x=>escapeProductText(labels[x.champ]||x.champ)+', '+fmt(x.revendeur)+' '+escapeProductText(unit(x.champ))+' chez le revendeur / '+fmt(x.catalogue)+' '+escapeProductText(unit(x.champ))+' sur la fiche').join(' ; ')+'. Vérifiez la formulation sur le sac avant de comparer ces valeurs.</p>':'';
  const copy=(title,value)=>value?'<details class="retailer-copy-details"><summary>'+title+'</summary><p class="retailer-copy">'+escapeProductText(value)+'</p></details>':'';
  return '<section class="detail-section"><details class="retailer-nutrition"><summary>Relevé nutritionnel complémentaire chez '+escapeProductText(r.marchand)+'</summary><p>Données publiées par le revendeur, consultées le '+escapeProductText(r.date.split('-').reverse().join('/'))+'. Elles sont présentées séparément et ne modifient pas la note Crocami.</p>'+differences+'<div class="detail-data-grid">'+rows+'</div>'+copy('Composition publiée',r.composition)+copy('Additifs publiés',r.additifs)+copy('Ration publiée',r.ration)+'<a href="'+escapeProductText(r.url)+'" target="_blank" rel="noopener noreferrer">Consulter la source nutritionnelle ↗</a></details></section>';
 }).join('');
}
function productDetailMarkup(p){
 const score=globalNutritionScore(p),dog=p.espece==="chien";
 const pack=p.imageProduit?'<img data-fallback="'+(dog?"🐶":"🐱")+'" src="'+escapeProductText(p.imageProduit)+'" alt="Sac de '+escapeProductText(p.marque)+' '+escapeProductText(p.recette)+'" onerror="imageErrorFallback(this)">':'<span class="pack-fallback">'+(dog?"🐶":"🐱")+'</span>';
 const rpc=score.rpc;
 const rows=[["Protéines",p.proteines,"%"],["Protéines sur matière sèche",p.proteinesMS,"%"],["Matières grasses",p.matieresGrasses,"%"],["Fibres",p.fibres,"%"],["Fibres alimentaires totales",p.fibresAlimentairesTotales,"%"],["Humidité",p.humidite,"%"],["Cendres",p.cendres,"%"],["Glucides",p.glucides,"%"],["Calcium",p.calcium,"%"],["Phosphore",p.phosphore,"%"],["Rapport calcium / phosphore",p.ratioCalciumPhosphore!=null?p.ratioCalciumPhosphore:(p.calcium!=null&&p.phosphore>0?p.calcium/p.phosphore:null),""],["Magnésium",p.magnesium,"%"],["Oméga-3",p.omega3,"%"],["Oméga-6",p.omega6,"%"],["DHA",p.dha,"%"],["EPA + DHA",p.epaDha,"%"],["Énergie",p.energie,"kcal/kg"],["RPC",rpc,"g/Mcal"]];
 if(!dog)rows.push(["Taurine",extractTaurine(p),"mg/kg"]);
 const metricItems=productMetricItems(p);
 const analysis=rows.map(([label,value,unit])=>{
  const metric=metricItems.find(x=>x.name===(label==="Rapport calcium / phosphore"?"Ratio calcium / phosphore":label));
  const status=value==null?"unknown":metric?metric.status:"info";
  return '<div class="detail-data-row metric-'+status+'"><span>'+label+'</span><b>'+detailValue(value,unit)+'</b></div>';
 }).join("");
 const criteria=score.criteria.length?'<div class="detail-criteria">'+score.criteria.map(x=>'<div><span>'+escapeProductText(x.name)+'</span><b>'+fmt(x.value)+'/100</b><small>'+escapeProductText(x.detail)+'</small></div>').join("")+'</div>':'<p class="detail-muted">Données insuffisantes pour calculer une note nutritionnelle.</p>';
 const needs=(p.besoins||[]).map(x=>'<span class="detail-chip">'+escapeProductText(x)+'</span>').join("");
 const comp=p.compositionComplete?'<p>'+escapeProductText(p.compositionComplete)+'</p>':'<p class="detail-muted">Composition détaillée non communiquée dans les données disponibles.</p>';
 const additives=p.additifs?'<p>'+escapeProductText(p.additifs)+'</p>':'<p class="detail-muted">Additifs détaillés non communiqués.</p>';
 const ration=manufacturerFeedingMarkup(p);
 const links=[["Fabricant",p.sourceFabricant],["Fiche technique fabricant",p.sourceDocumentFabricant],["Revendeur",p.sourceRevendeur||p.urlVendeur],["Fiche source",p.sourceFiche]].filter((x,i,arr)=>x[1]&&arr.findIndex(y=>y[1]===x[1])===i).map(x=>'<a href="'+escapeProductText(x[1])+'" target="_blank" rel="noopener noreferrer">'+x[0]+' ↗</a>').join("");
 const sources=links?'<section class="detail-section"><div class="detail-section-heading"><p class="eyebrow">VÉRIFICATION</p><h2>Sources consultées</h2></div><div class="product-sources">'+links+'</div></section>':'<section class="detail-section"><p class="detail-muted">Sources détaillées non renseignées pour cette fiche.</p></section>';
 return '<div class="product-detail-wrap"><a class="detail-back" href="#comparateur">← Retour au comparateur</a><div class="detail-hero"><div class="detail-product-image">'+pack+'</div><div class="detail-heading"><p class="eyebrow">'+(dog?"🐶 CROQUETTES POUR CHIEN":"🐱 CROQUETTES POUR CHAT")+'</p><p class="detail-brand">'+escapeProductText(p.marque)+'</p><h1>'+escapeProductText(p.recette)+'</h1>'+(p.descriptionFabricant?'<p class="detail-description">'+escapeProductText(p.descriptionFabricant)+'</p>':"") +'<div class="detail-chips">'+needs+'</div><div class="detail-price-line"><strong>'+(p.prixSac!=null?fmt(p.prixSac)+" €":p.prixKg!=null?fmt(p.prixKg)+" €/kg":"Prix non communiqué")+'</strong><span>'+(p.formatKg!=null?fmt(p.formatKg)+" kg · ":"")+(p.prixKg!=null?fmt(p.prixKg)+" €/kg":"Prix au kilo non communiqué")+'</span></div></div><div class="detail-score"><div class="detail-score-circle">'+(score.score==null?"—":score.score)+'</div><b>Note Crocami /100</b><span>Couverture : '+score.confidence+' %</span><span>Fiabilité : '+score.reliability+'</span></div></div>'+merchantOffersMarkup(p)+'<section class="detail-section"><div class="detail-section-heading"><p class="eyebrow">ANALYSE NUTRITIONNELLE</p><h2>Valeurs disponibles</h2><p>Les champs non publiés restent indiqués comme non communiqués. Le RPC est calculé uniquement si les protéines et l’énergie sont disponibles.</p></div><div class="detail-data-grid">'+analysis+'</div></section>'+royalCaninDetailsMarkup(p)+royalCaninComplementsMarkup(p)+retailerNutritionMarkup(p)+archivedNutritionMarkup(p)+'<section class="detail-section"><div class="detail-section-heading"><p class="eyebrow">COMPOSITION</p><h2>Ingrédients et additifs</h2></div><div class="detail-two-columns"><article><h3>Composition</h3>'+comp+'</article><article><h3>Additifs</h3>'+additives+'</article></div><div class="detail-meta-grid"><div><span>Premier ingrédient</span><b>'+detailValue(p.premierIngredient)+'</b></div><div><span>Âge conseillé</span><b>'+detailValue(p.age)+'</b></div><div><span>Gabarit</span><b>'+detailValue(p.gabarit)+'</b></div><div><span>Format</span><b>'+detailValue(p.formatKg,"kg")+'</b></div>'+(p.formatsDisponibles?'<div><span>Formats disponibles</span><b>'+escapeProductText(p.formatsDisponibles)+'</b></div>':"") +'<div><span>Vendeur / prix relevé</span><b>'+detailValue(p.vendeur)+'</b></div><div><span>Date du prix</span><b>'+detailValue(p.datePrix)+'</b></div></div></section><section class="detail-section"><div class="detail-section-heading"><p class="eyebrow">CONSEILS D’ALIMENTATION</p><h2>Ration journalière</h2><p>Suivez l’indication correspondant au poids et au profil de votre animal, et ajustez selon son activité et son état corporel.</p></div>'+ration+'</section>'+sources+'<section class="detail-section"><div class="detail-section-heading"><p class="eyebrow">TRANSPARENCE</p><h2>Comment la note est-elle calculée ?</h2><p>La note utilise uniquement les critères renseignés. La couverture indique la part des pondérations disponibles ; elle ne représente pas une garantie vétérinaire.</p></div>'+criteria+'</section><a class="detail-back detail-back-bottom" href="#comparateur">← Revenir aux résultats</a></div>';
}
function routeProductDetail(){
 const match=location.hash.match(/^#produit\/(.+)$/);
 const section=$("#productDetail");
 if(!section)return;
 if(!match){document.body.classList.remove("product-view");section.hidden=true;document.title="Crocami — Pour leur gamelle, faites le bon choix";return;}
 const id=decodeURIComponent(match[1]),p=data.find(x=>x.id===id);
 if(!p){section.innerHTML='<p>Cette fiche produit est introuvable. <a href="#comparateur">Retour au comparateur</a></p>';section.hidden=false;document.body.classList.add("product-view");return;}
 section.innerHTML=productDetailMarkup(p);section.hidden=false;document.body.classList.add("product-view");
 document.title=p.marque+" "+p.recette+" : composition, prix et note | Crocami";
 const meta=document.querySelector('meta[name="description"]');if(meta)meta.content="Fiche Crocami de "+p.marque+" "+p.recette+" : composition, valeurs nutritionnelles disponibles, prix au kilo, sources et note indicative.";
 window.scrollTo(0,0);
}
window.addEventListener("hashchange",routeProductDetail);
function render(){let rows=filtered();$("#resultCount").textContent=rows.length+" / "+data.filter(p=>p.espece===animal).length+" références";$("#emptyState").hidden=rows.length>0;$("#results").innerHTML=rows.map(card).join("");$("#results").querySelectorAll("[data-compare]").forEach(el=>el.addEventListener("change",()=>{if(el.checked){if(selected.size>=4){el.checked=false;alert("Vous pouvez comparer 4 produits maximum.");return;}selected.add(el.dataset.compare);}else selected.delete(el.dataset.compare);renderCompare();}));renderCompare();}
function renderCompare(){
 let ps=data.filter(p=>selected.has(p.id));
 $("#compareCount").textContent=ps.length+"/4 sélectionnées";
 const clearButton=$("#clearCompare");if(clearButton)clearButton.disabled=ps.length===0;
 $("#comparison").hidden=ps.length<2;
 const comparisonRows=[
  {label:"Note Crocami",value:p=>globalNutritionScore(p).score,display:p=>{const n=globalNutritionScore(p);return n.score==null?"Données insuffisantes":n.score+"/100 · couverture "+n.confidence+" %";},better:"high"},
  {label:"RPC (énergie fabricant ou Macroquette)",value:p=>p.energie>0&&p.proteines!=null?p.proteines*10000/p.energie:(p.rpcMacroquette>0?p.rpcMacroquette:null),display:p=>p.energie>0&&p.proteines!=null?fmtRatio(p.proteines*10000/p.energie)+" g/Mcal":p.rpcMacroquette>0?fmtRatio(p.rpcMacroquette)+" g/Mcal (Macroquette)":"Non communiqué",better:"high"},
  {label:"Prix du sac",value:p=>p.prixSac,display:p=>p.prixSac==null?"Non communiqué":fmt(p.prixSac)+" €",better:"low"},
  {label:"Format",value:p=>p.formatKg,display:p=>p.formatKg==null?"Non communiqué":fmt(p.formatKg)+" kg",better:"neutral"},
  {label:"Prix au kg",value:p=>p.prixKg,display:p=>p.prixKg==null?"Non communiqué":fmt(p.prixKg)+" €/kg",better:"low"},
  {label:"Protéines",value:p=>p.proteines,display:p=>p.proteines==null?"Non communiqué":fmt(p.proteines)+" %",better:"neutral"},
  {label:"Protéines sur matière sèche",value:p=>p.proteinesMS,display:p=>p.proteinesMS==null?"Non communiqué":fmt(p.proteinesMS)+" %",better:"neutral"},
  {label:"Matières grasses",value:p=>p.matieresGrasses,display:p=>p.matieresGrasses==null?"Non communiqué":fmt(p.matieresGrasses)+" %",better:"neutral"},
  {label:"Fibres",value:p=>p.fibres,display:p=>p.fibres==null?"Non communiqué":fmt(p.fibres)+" %",better:"neutral"},
  {label:"Humidité",value:p=>p.humidite,display:p=>p.humidite==null?"Non communiqué":fmt(p.humidite)+" %",better:"neutral"},
  {label:"Cendres",value:p=>p.cendres,display:p=>p.cendres==null?"Non communiqué":fmt(p.cendres)+" %",better:"neutral"},
  {label:"Glucides",value:p=>p.glucides,display:p=>p.glucides==null?"Non communiqué":fmt(p.glucides)+" %",better:"low"},
  {label:"Calcium / phosphore",value:p=>p.ratioCalciumPhosphore>0?Number(p.ratioCalciumPhosphore):(p.calcium!=null&&p.phosphore>0?p.calcium/p.phosphore:null),display:p=>p.ratioCalciumPhosphore>0?fmt(p.ratioCalciumPhosphore)+" : 1 (fabricant)":p.calcium==null||p.phosphore==null?"Non communiqué":fmt(p.calcium)+" / "+fmt(p.phosphore),better:"range",min:1,max:2},
  {label:"Énergie",value:p=>p.energie,display:p=>p.energie==null?"Non communiqué":fmt(p.energie)+" kcal/kg",better:"neutral"},
  {label:"Premier ingrédient",value:p=>p.premierIngredient,display:p=>p.premierIngredient||"Non communiqué",better:"neutral"},
  {label:"Note source /5",value:p=>p.noteComposition,display:p=>p.noteComposition==null?"Non communiqué":fmt(p.noteComposition)+"/5",better:"high"}
 ];
 const scoreValue=(row,p)=>{
  const v=row.value(p);if(typeof v!=="number"||!Number.isFinite(v))return null;
  if(row.better==="range")return v>=row.min&&v<=row.max?100:Math.max(0,100-Math.min(Math.abs(v-row.min),Math.abs(v-row.max))*100);
  return v;
 };
 const html=ps.length<2?"":'<div class="comparison-legend"><span><i class="comparison-key best"></i> Meilleure valeur parmi les produits sélectionnés</span><span><i class="comparison-key neutral"></i> Valeur informative, sans classement automatique</span></div><div class="comparison-scroll"><table><thead><tr><th>Critère</th>'+ps.map(p=>'<th class="compare-product-head"><div class="compare-product-pack">'+(p.imageProduit?'<img data-fallback="'+(p.espece==="chien"?"🐶":"🐱")+'" src="'+escapeProductText(p.imageProduit)+'" alt="Sac de '+escapeProductText(p.marque)+' '+escapeProductText(p.recette)+'" loading="lazy" onerror="imageErrorFallback(this)">':'<span class="compare-pack-fallback">'+(p.espece==="chien"?"🐶":"🐱")+'</span>')+'</div><span class="compare-brand">'+escapeProductText(p.marque)+'</span><br><small class="compare-recipe">'+escapeProductText(p.recette)+'</small><button data-remove="'+p.id+'" aria-label="Retirer">×</button></th>').join("")+'</tr></thead><tbody>'+comparisonRows.map(row=>{
  const values=ps.map(p=>scoreValue(row,p));
  const valid=values.filter(v=>v!=null);
  const best=row.better==="neutral"||!valid.length?null:row.better==="low"?Math.min(...valid):Math.max(...valid);
  return '<tr class="'+(best==null?"comparison-neutral-row":"comparison-ranked-row")+'"><th>'+row.label+(best==null?'<small class="comparison-row-hint">Comparaison informative</small>':'<small class="comparison-row-hint">Valeur la plus favorable</small>')+'</th>'+ps.map((p,i)=>{
   const v=values[i],isBest=best!=null&&v!=null&&Math.abs(v-best)<0.000001;
   return '<td class="'+(isBest?"comparison-best":"")+'">'+(isBest?'<span class="comparison-best-label">MEILLEUR</span>':"")+row.display(p)+'</td>';
  }).join("")+'</tr>';
 }).join("")+'</tbody></table></div>';
 $("#comparisonTable").innerHTML=html;
 $$("[data-remove]").forEach(b=>b.addEventListener("click",()=>{selected.delete(b.dataset.remove);render();}));
}
tabs.forEach(t=>t.addEventListener("click",()=>setAnimal(t.dataset.animal)));
$("#searchBtn").addEventListener("click",render);$("#search").addEventListener("input",render);$("#search").addEventListener("keydown",e=>{if(e.key==="Enter")render();});
Array.from(document.querySelectorAll(".filter-row select, #sortBy, #maxPriceKg")).forEach(s=>s.addEventListener("change",render));
$("#resetFilters")?.addEventListener("click",()=>{$("#search").value="";["age","size","brand","need","sortBy","maxPriceKg","scoreCategory"].forEach(id=>{const el=$("#"+id);if(el)el.value=id==="sortBy"?"note-desc":"";});render();});
$$("[data-jump-animal]").forEach(a=>a.addEventListener("click",()=>setAnimal(a.dataset.jumpAnimal)));
const brandLabels=new Map();for(const p of data){const key=normalizeBrandKey(p.marque);if(!brandLabels.has(key))brandLabels.set(key,p.marque);}
const brands=[...brandLabels.entries()].sort((a,b)=>a[1].localeCompare(b[1],"fr"));$("#brand").innerHTML='<option value="">Toutes les marques</option>'+brands.map(([key,label])=>'<option value="'+key+'">'+label+'</option>').join("");
renderNeedOptions(animal);
$("#clearCompare")?.addEventListener("click",()=>{selected.clear();render();});
render();
routeProductDetail();

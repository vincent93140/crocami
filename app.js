const tabs=[...document.querySelectorAll(".animal-tab")];let animal="chien";let selected=new Set();
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const data=window.CROCamiCatalog||[];
const yearNode=$("#year");if(yearNode)yearNode.textContent=new Date().getFullYear();
const fmt=n=>{if(n==null)return "Non communiqué";const value=typeof n==="number"?n:Number(String(n).trim().replace(/\\s/g,"").replace(",", "."));return Number.isFinite(value)?new Intl.NumberFormat("fr-FR",{maximumFractionDigits:2,useGrouping:false}).format(value):String(n).replace(".",",");};
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
 const caP=p.calcium!=null&&p.phosphore>0?p.calcium/p.phosphore:null;
 if(caP!=null){
  const v=caP>=1.2&&caP<=1.8?100:caP>=1&&caP<=2?85:caP>=0.8&&caP<=2.2?55:20;
  add("Ratio calcium / phosphore",v,15,"Rapport calculé lorsque calcium et phosphore sont tous deux communiqués.");
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
 return '<div class="score-bubble" style="--score-color:'+background+'" title="Note nutritionnelle Crocami : '+(score==null?"non calculable":score+"/100")+' · Fiabilité : '+n.reliability+'"><strong>'+(score==null?"—":score)+'</strong><small>/100</small></div>';
}
function scoreStackMarkup(p){
 return '<div class="score-stack">'+scoreBubbleMarkup(p)+(p.scoreMacroquette!=null?'<small class="external-score-mini">Macroquette '+fmt(p.scoreMacroquette)+'/100</small>':"")+'</div>';
}
function macroquetteScoreMarkup(p){
 if(p.scoreMacroquette!=null){
  const link=p.sourceMacroquette?'<a href="'+p.sourceMacroquette+'" target="_blank" rel="noopener">Voir la fiche Macroquette</a>':"";
  const date=p.dateScoreMacroquette?' Relevée le '+p.dateScoreMacroquette.split("-").reverse().join("/")+'.':"";
  const warning=p.noteMacroquetteAvertissement?'<p class="external-score-warning">'+p.noteMacroquetteAvertissement+'</p>':"";
  return '<div class="external-score-card"><div><span>NOTE EXTERNE · MACROQUETTE</span><b>'+fmt(p.scoreMacroquette)+' /100</b></div><div class="external-score-copy"><small>Note moyenne publiée sur la fiche Macroquette; elle peut différer de la note obtenue avec leur outil personnalisé.'+date+' '+link+'</small>'+warning+'</div></div>';
 }
 if(p.noteMacroquetteStatut){
  return '<div class="external-score-card missing"><div><span>NOTE EXTERNE · MACROQUETTE</span><b>Non disponible</b></div><small>'+p.noteMacroquetteStatut+'</small></div>';
 }
 return "";
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
 const ca=dry(p.calcium),ratio=p.calcium!=null&&p.phosphore>0?p.calcium/p.phosphore:null;
 const mineralOk=ca!=null&&ratio!=null&&ca>=1&&ca<=1.7&&ratio>=1&&ratio<=2;
 add("Équilibre minéral Ca/P",ratio,"ratio","Ca : 1–1,7 % MS ; Ca/P : 1–2",ratio==null||ca==null?"missing":mineralOk?"good":"bad","Rapport calculé; les teneurs absolues doivent aussi être interprétées selon l’âge.");
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
function setAnimal(v){animal=v;tabs.forEach(t=>t.classList.toggle("active",t.dataset.animal===v));$("#resultsTitle").textContent=v==="chien"?"Les croquettes pour chien":"Les croquettes pour chat";$("#search").placeholder=v==="chien"?"Ex. : saumon, digestion sensible, marque…":"Ex. : chat stérilisé, saumon, digestion…";
 if(v==="chat"){$("#size").innerHTML='<option value="">Tous les gabarits</option><option value="Toutes">Toutes les tailles</option>';$("#sizeField").querySelector("span")?.remove();$("#sizeHelp").textContent="Les gabarits sont peu discriminants chez le chat ; privilégiez âge et besoins.";}
 else{$("#size").innerHTML='<option value="">Toutes les tailles</option><option value="Petite">Petit</option><option value="Moyenne">Moyen</option><option value="Grande">Grand</option><option value="Géante">Géant</option>';$("#sizeHelp").textContent="Repère basé sur le poids adulte idéal.";}
 selected.clear();render();}
function filtered(){let q=$("#search").value.trim().toLocaleLowerCase("fr"),age=$("#age").value,need=$("#need").value,size=$("#size").value,brand=$("#brand")?.value||"",sort=$("#sortBy")?.value||"note-desc";
 const rows=data.filter(p=>p.espece===animal&&(!q||[p.marque,p.recette,p.premierIngredient,(p.besoins||[]).join(" ")].join(" ").toLocaleLowerCase("fr").includes(q))&&(!age||p.age===age)&&(!need||(p.besoins||[]).includes(need))&&(!size||p.gabarit==="Toutes"||p.gabarit.split("|").includes(size))&&(!brand||p.marque===brand));
 const score=p=>globalNutritionScore(p).score;
 const keys={"prix-asc":p=>p.prixSac,"prix-desc":p=>p.prixSac,"kg-asc":p=>p.prixKg,"kg-desc":p=>p.prixKg,"note-desc":score,"note-asc":score,"marque":p=>p.marque};
 const key=keys[sort];if(key)rows.sort((x,y)=>{const a=key(x),b=key(y);if(a==null&&b==null)return 0;if(a==null)return 1;if(b==null)return -1;const cmp=typeof a==="string"?a.localeCompare(b,"fr"):a-b;return sort.endsWith("desc")?-cmp:cmp;});
 return rows;}
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
function cardMetricsMarkup(p){
 const dog=p.espece==="chien",junior=p.age==="Junior",weight=(p.besoins||[]).includes("Contrôle du poids"),sterilised=(p.besoins||[]).includes("Stérilisé");
 const rpc=p.energie>0&&p.proteines!=null?p.proteines*10000/p.energie:(p.rpcMacroquette>0?p.rpcMacroquette:null);
 const rpcMin=dog?(junior?62.5:52):(junior?95:83);
 const fat=dog?(junior?[13,20]:weight?[7,12]:[10,16]):(sterilised?[10,16]:[12,18]);
 const fiber=dog?(weight?[3,10]:[1,4]):[2,5];
 const caP=p.calcium!=null&&p.phosphore>0?p.calcium/p.phosphore:null;
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
 return '<div class="product-metrics">'+items.map(x=>{
  const value=x.raw==null?null:(x.unit==="ratio"?fmtRatio(x.raw):fmt(x.raw))+(x.unit==="%"?" %":x.unit==="g/Mcal"?" g/Mcal":x.unit==="mg/kg"?" mg/kg":"");
  return '<div class="metric-'+x.status+'"><small>'+x.name+'</small><b>'+(value||"Non communiqué")+'</b><span>'+(x.name==="Protéines"?"Lecture : "+x.target:"Attendu : "+x.target)+'</span></div>';
 }).join("")+'</div>';
}function card(p){let checked=selected.has(p.id);const pack=p.imageProduit?'<img src="'+p.imageProduit+'" alt="Sac de '+p.marque+' — '+p.recette+'" loading="lazy" onerror="this.remove();this.parentElement.classList.add(\'pack-missing\')">':'<span class="pack-fallback">'+(p.espece==="chien"?"🐶":"🐱")+'</span>';return `<article class="product-card"><div class="product-top"><span class="product-animal">${p.espece==="chien"?"🐶 CHIEN":"🐱 CHAT"}</span><label class="compare-check"><input type="checkbox" data-compare="${p.id}" ${checked?"checked":""}> Comparer</label></div><div class="product-identity"><div class="product-visual">${pack}</div><div class="product-names"><div class="product-name-copy"><p class="product-brand">${p.marque}</p><h3>${p.recette}</h3></div>${scoreStackMarkup(p)}</div></div>${cardMetricsMarkup(p)}<div class="product-price"><strong>${p.prixSac!=null?fmt(p.prixSac)+" €":p.prixKg!=null?fmt(p.prixKg)+" €/kg":"Prix non communiqué"}</strong><span>${p.prixSac!=null?(p.formatKg!=null?fmt(p.formatKg)+" kg · ":"")+"Prix au kg : "+fmt(p.prixKg)+" €/kg":p.prixKg!=null?"Prix moyen indicatif au kg":"Prix non communiqué"}</span></div></article>`;}
function render(){let rows=filtered();$("#resultCount").textContent=rows.length+" références";$("#emptyState").hidden=rows.length>0;$("#results").innerHTML=rows.map(card).join("");$("#results").querySelectorAll("[data-compare]").forEach(el=>el.addEventListener("change",()=>{if(el.checked){if(selected.size>=4){el.checked=false;alert("Vous pouvez comparer 4 produits maximum.");return;}selected.add(el.dataset.compare);}else selected.delete(el.dataset.compare);renderCompare();}));renderCompare();}
function renderCompare(){
 let ps=data.filter(p=>selected.has(p.id));
 $("#compareCount").textContent=ps.length+"/4 sélectionnées";
 $("#comparison").hidden=ps.length<2;
 const comparisonRows=[
  {label:"Note Crocami",value:p=>globalNutritionScore(p).score,display:p=>{const n=globalNutritionScore(p);return n.score==null?"Données insuffisantes":n.score+"/100 · couverture "+n.confidence+" %";},better:"high"},
  {label:"Note Macroquette (externe)",value:p=>p.scoreMacroquette,display:p=>p.scoreMacroquette==null?"Non disponible":fmt(p.scoreMacroquette)+"/100",better:"high"},
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
  {label:"Calcium / phosphore",value:p=>p.calcium!=null&&p.phosphore>0?p.calcium/p.phosphore:null,display:p=>p.calcium==null||p.phosphore==null?"Non communiqué":fmt(p.calcium)+" / "+fmt(p.phosphore),better:"range",min:1,max:2},
  {label:"Énergie",value:p=>p.energie,display:p=>p.energie==null?"Non communiqué":fmt(p.energie)+" kcal/kg",better:"neutral"},
  {label:"Premier ingrédient",value:p=>p.premierIngredient,display:p=>p.premierIngredient||"Non communiqué",better:"neutral"},
  {label:"Note source /5",value:p=>p.noteComposition,display:p=>p.noteComposition==null?"Non communiqué":fmt(p.noteComposition)+"/5",better:"high"}
 ];
 const scoreValue=(row,p)=>{
  const v=row.value(p);if(typeof v!=="number"||!Number.isFinite(v))return null;
  if(row.better==="range")return v>=row.min&&v<=row.max?100:Math.max(0,100-Math.min(Math.abs(v-row.min),Math.abs(v-row.max))*100);
  return v;
 };
 const html=ps.length<2?"":'<div class="comparison-legend"><span><i class="comparison-key best"></i> Meilleure valeur parmi les produits sélectionnés</span><span><i class="comparison-key neutral"></i> Valeur informative, sans classement automatique</span></div><div class="comparison-scroll"><table><thead><tr><th>Critère</th>'+ps.map(p=>'<th><span class="compare-brand">'+p.marque+'</span><br><small class="compare-recipe">'+p.recette+'</small><button data-remove="'+p.id+'" aria-label="Retirer">×</button></th>').join("")+'</tr></thead><tbody>'+comparisonRows.map(row=>{
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
$("#searchBtn").addEventListener("click",render);$("#search").addEventListener("keydown",e=>{if(e.key==="Enter")render();});
$$(".filter-row select, #sortBy").forEach(s=>s.addEventListener("change",render));
$$("[data-jump-animal]").forEach(a=>a.addEventListener("click",()=>setAnimal(a.dataset.jumpAnimal)));
const brands=[...new Set(data.map(p=>p.marque))].sort();$("#brand").innerHTML='<option value="">Toutes les marques</option>'+brands.map(b=>'<option>'+b+'</option>').join("");
render();
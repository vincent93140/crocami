const tabs=[...document.querySelectorAll(".animal-tab")];let animal="chien";let selected=new Set();
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const data=window.CROCamiCatalog||[];
const yearNode=$("#year");if(yearNode)yearNode.textContent=new Date().getFullYear();
const fmt=n=>n==null?"Non communiqué":String(n).replace(".",",");
function globalNutritionScore(p){
 const isDog=p.espece==="chien",junior=p.age==="Junior";
 const needs=p.besoins||[],weightControl=needs.includes("Contrôle du poids"),sterilised=needs.includes("Stérilisé");
 const criteria=[];
 const add=(name,value,weight,detail)=>{if(value!=null&&Number.isFinite(value))criteria.push({name,value:Math.max(0,Math.min(100,value)),weight,detail});};
 const band=(v,min,max,margin)=>v<min?Math.max(0,100-((min-v)/margin)*100):v>max?Math.max(0,100-((v-max)/margin)*100):100;
 const protein=p.proteines,proteinRange=isDog?(junior?[28,35]:[25,32]):(p.age==="Senior"?[32,45]:[35,45]);
 if(protein!=null)add("Protéines",band(protein,proteinRange[0],proteinRange[1],8),isDog?35:30,"Teneur brute comparée à une plage indicative selon l’espèce et l’âge. Le pourcentage seul ne mesure ni le RPC ni la qualité des protéines.");
 const fat=p.matieresGrasses,fatRange=isDog?(junior?[13,20]:weightControl?[7,12]:[10,16]):(sterilised?[10,16]:[12,18]);
 if(fat!=null)add("Matières grasses",band(fat,fatRange[0],fatRange[1],7),isDog?25:20,"Plage indicative adaptée au stade de vie et au contrôle du poids lorsqu’il est indiqué.");
 const fiber=p.fibres,fiberRange=isDog?(weightControl?[3,10]:[1,4]):[2,5];
 if(fiber!=null)add("Fibres",band(fiber,fiberRange[0],fiberRange[1],5),10,"Teneur brute comparée à une plage indicative ; le type de fibres et la tolérance digestive comptent aussi.");
 if(p.calcium!=null&&p.phosphore>0){const ratio=p.calcium/p.phosphore,range=isDog?[1,2]:[1,1.5];add("Équilibre calcium / phosphore",band(ratio,range[0],range[1],0.8),20,"Rapport calculé à partir des valeurs publiées. Les teneurs absolues et les besoins liés à la croissance doivent aussi être vérifiés.");}
 if(p.omega3>0&&p.omega6!=null){const ratio=p.omega6/p.omega3;add("Rapport oméga 6 / 3",band(ratio,5,10,8),10,"Rapport calculé uniquement si les deux teneurs sont communiquées.");}
 if(!isDog){
  let taurine=p.taurine;
  if(taurine==null&&p.additifs){const match=String(p.additifs).match(/taurine\s*([\d\s,\.]+)\s*(mg\s*\/\s*kg|%)/i);if(match){const amount=Number(match[1].replace(/\s/g,"").replace(",", "."));taurine=match[2].includes("%")?amount*10000:amount;}}
  if(taurine!=null)add("Taurine",taurine>=1000?100:band(taurine,1000,100000,1000),10,"Nutriment essentiel chez le chat. Valeur interprétée à partir de la déclaration fabricant lorsqu’elle est disponible.");
 }
 const totalWeight=criteria.reduce((s,x)=>s+x.weight,0),rawScore=totalWeight?criteria.reduce((s,x)=>s+x.value*x.weight,0)/totalWeight:null,score=rawScore==null?null:Math.min(75,Math.round(10+rawScore*0.65));
 const confidence=Math.round(totalWeight),reliability=confidence>=80?"Bonne":confidence>=60?"Moyenne":"Limitée";
 return {score,confidence,reliability,criteria};
}
function scoreBubbleMarkup(p){
 const n=globalNutritionScore(p),score=n.score;
 const hue=score==null?0:Math.round(score*1.2),background=score==null?"#85877f":`hsl(${hue} 68% 42%)`;
 return '<div class="score-bubble" style="--score-color:'+background+'" title="Note nutritionnelle Crocami : '+(score==null?"non calculable":score+"/100")+' · Fiabilité : '+n.reliability+'"><strong>'+(score==null?"—":score)+'</strong><small>/100</small></div>';
}
function globalScoreMarkup(p,compact=false){
 const a=globalNutritionScore(p),cls=a.score==null?"missing":a.score>=80?"good":a.score>=60?"medium":"watch",score=a.score==null?"—":a.score;
 if(compact)return '<div class="global-score-card '+cls+'"><div class="global-score-number"><strong>'+score+'</strong><span>/100</span></div><div class="global-score-copy"><b>Note nutritionnelle Crocami</b><small>Fiabilité de la note : '+a.reliability.toLowerCase()+' · couverture '+a.confidence+' %</small></div></div>';
 const dog=p.espece==="chien",junior=p.age==="Junior",sterilised=(p.besoins||[]).includes("Stérilisé"),weight=(p.besoins||[]).includes("Contrôle du poids");
 const targets={"Protéines":dog?(junior?"28–35 %":"25–32 %"):(p.age==="Senior"?"32–45 %":"35–45 %"),"Matières grasses":dog?(junior?"13–20 %":weight?"7–12 %":"10–16 %"):(sterilised?"10–16 %":"12–18 %"),"Fibres":dog?(weight?"3–10 %":"1–4 %"):"2–5 %","Équilibre calcium / phosphore":dog?"1–2": "1–1,5","Rapport oméga 6 / 3":"5–10","Taurine":"≥ 1 000 mg/kg"};
 const actual={"Protéines":p.proteines==null?null:fmt(p.proteines)+" %","Matières grasses":p.matieresGrasses==null?null:fmt(p.matieresGrasses)+" %","Fibres":p.fibres==null?null:fmt(p.fibres)+" %","Équilibre calcium / phosphore":p.calcium!=null&&p.phosphore>0?(p.calcium/p.phosphore).toFixed(2).replace(".",","):null,"Rapport oméga 6 / 3":p.omega3>0&&p.omega6!=null?(p.omega6/p.omega3).toFixed(1).replace(".",","):null,"Taurine":p.taurine==null?null:fmt(p.taurine)+" mg/kg"};
 const criteria=a.criteria.map(x=>'<div><span>'+x.name+'</span><b>'+(actual[x.name]||"Non communiqué")+'</b><small>Repère : '+(targets[x.name]||"selon profil")+'</small></div>').join("");
 return '<section class="global-score-detail"><div class="global-score-top"><div><span>NOTE CROCAMI</span><div class="global-score-big">'+score+'<small>/100</small></div></div><div class="global-score-reliability"><b>Fiabilité : '+a.reliability+'</b><span>Données : '+a.confidence+' %</span></div></div><div class="global-score-criteria">'+criteria+'</div><p class="global-score-foot">Repères indicatifs, à adapter à l’animal. Note plafonnée à 75/100.</p></section>';
}
function nutritionAudit(p){
 if(p.espece!=="chien")return null;
 const dm=p.humidite==null?null:100-p.humidite;
 const dry=v=>v==null||dm==null||dm<=0?null:v/dm*100;
 const rpc=p.energie>0&&p.proteines!=null?p.proteines*10000/p.energie:null;
 const rows=[];
 const add=(name,value,unit,reference,status,detail)=>rows.push({name,value,unit,reference,status,detail});
 const adult=p.age!=="Junior",rpcMin=adult?52:62.5;
 add("Rapport protido-calorique",rpc==null?null:Math.round(rpc),"g/Mcal",`≥ ${rpcMin} g/Mcal (repère indicatif ${adult?"adulte":"croissance"})`,rpc==null?"missing":rpc>=rpcMin?"good":"bad", "Le RPC rapporte les grammes de protéines à l’énergie de l’aliment. Il dépend aussi du profil réel du chien.");
 add("Protéines brutes",p.proteines,"% aliment","Repère de lecture : 30 % et plus",p.proteines==null?"missing":p.proteines>=30?"good":"watch","Le pourcentage seul ne suffit pas : il doit être lu avec l’énergie (RPC) et la qualité des protéines.");
 const carbs=dry(p.glucides);
 add("Glucides estimés",carbs==null?null:Math.round(carbs*10)/10,"% matière sèche","< 15 % MS",carbs==null?"missing":carbs<15?"good":"watch","Glucides calculés/estimés : ils ne sont pas toujours déclarés par le fabricant.");
 const fiber=dry(p.fibres);
 add("Fibres",fiber==null?null:Math.round(fiber*10)/10,"% matière sèche","≤ 5 % MS",fiber==null?"missing":fiber<=5?"good":"watch","Repère de lecture repris de l’analyse Macroquette.");
 const ca=dry(p.calcium),ph=dry(p.phosphore),ratio=p.calcium!=null&&p.phosphore>0?p.calcium/p.phosphore:null;
 const mineralOk=ca!=null&&ratio!=null&&ca>=1&&ca<=1.7&&ratio>=1&&ratio<=2;
 add("Équilibre minéral Ca/P",ratio==null?null:Math.round(ratio*100)/100,"ratio", "Ca : 1–1,7 % MS ; Ca/P : 1–2",ratio==null||ca==null?"missing":mineralOk?"good":"bad","Comparaison indicative ; le phosphore doit également être interprété selon l’âge et la densité énergétique.");
 const omega=p.omega3>0&&p.omega6!=null?p.omega6/p.omega3:null;
 add("Rapport oméga 6 / 3",omega==null?null:Math.round(omega*10)/10,"ratio","Repère indicatif : 5 à 10",omega==null?"missing":omega>=5&&omega<=10?"good":"watch","Les deux valeurs doivent être publiées pour calculer ce rapport.");
 const proteinPhosphorus=p.phosphore>0&&p.proteines>0?p.phosphore/p.proteines:null;
 add("Indicateur phosphore / protéines",proteinPhosphorus==null?null:Math.round(proteinPhosphorus*100)/100,"ratio","À interpréter avec la composition et les sources protéiques",proteinPhosphorus==null?"missing":"info","Cet indicateur ne permet pas à lui seul de certifier la qualité ou la digestibilité des protéines.");
 const known=rows.filter(x=>x.status!=="missing"),good=rows.filter(x=>x.status==="good").length,bad=rows.filter(x=>x.status==="bad").length;
 return {rows,rpc,good,bad,missing:rows.length-known.length,known:known.length,total:rows.length};
}
function auditMarkup(p,compact=false){
 const a=nutritionAudit(p);if(!a)return "";
 const label=a.known===0?"Analyse incomplète":a.bad?"Points à surveiller":a.missing?"Bilan partiel":"Repères couverts";
 const cls=a.bad?"watch":a.known===0?"missing":a.missing?"partial":"good";
 if(compact)return `<div class="audit-summary ${cls}"><b>${label}</b><span>${a.good} repères satisfaisants · ${a.bad} à surveiller · ${a.missing} données manquantes</span></div>`;
 return `<section class="nutrition-audit"><div class="audit-heading"><div><b>Analyse nutritionnelle Crocami</b><small>Comparaison indicative à des repères de lecture, pas un diagnostic vétérinaire.</small></div><strong class="audit-status ${cls}">${label}</strong></div><div class="audit-list">${a.rows.map(x=>`<div class="audit-row"><div class="audit-row-main"><b>${x.name}</b><span class="audit-value ${x.status}">${x.value==null?"Donnée manquante":x.value+" "+x.unit}</span></div><small>Repère : ${x.reference}</small><p>${x.detail}</p><em class="audit-tag ${x.status}">${x.status==="good"?"SATISFAISANT":x.status==="bad"?"NON SATISFAISANT":x.status==="watch"?"À SURVEILLER":x.status==="info"?"INDICATEUR À INTERPRÉTER":"DONNÉE MANQUANTE"}</em></div>`).join("")}</div><p class="audit-foot">Calculs établis uniquement à partir des données disponibles sur cette fiche. Les seuils sont des repères de comparaison inspirés des critères décrits par Macroquette ; ils ne reproduisent pas son algorithme propriétaire. Les besoins réels varient selon le poids, l’activité, l’état physiologique et la santé du chien.</p></section>`;
}
function setAnimal(v){animal=v;tabs.forEach(t=>t.classList.toggle("active",t.dataset.animal===v));$("#resultsTitle").textContent=v==="chien"?"Les croquettes pour chien":"Les croquettes pour chat";$("#search").placeholder=v==="chien"?"Ex. : saumon, digestion sensible, marque…":"Ex. : chat stérilisé, saumon, digestion…";
 if(v==="chat"){$("#size").innerHTML='<option value="">Tous les gabarits</option><option value="Toutes">Toutes les tailles</option>';$("#sizeField").querySelector("span")?.remove();$("#sizeHelp").textContent="Les gabarits sont peu discriminants chez le chat ; privilégiez âge et besoins.";}
 else{$("#size").innerHTML='<option value="">Toutes les tailles</option><option value="Petite">Petit</option><option value="Moyenne">Moyen</option><option value="Grande">Grand</option><option value="Géante">Géant</option>';$("#sizeHelp").textContent="Repère basé sur le poids adulte idéal.";}
 selected.clear();render();}
function filtered(){let q=$("#search").value.trim().toLocaleLowerCase("fr"),age=$("#age").value,need=$("#need").value,size=$("#size").value,brand=$("#brand")?.value||"";
 return data.filter(p=>p.espece===animal&&(!q||[p.marque,p.recette,p.premierIngredient,p.besoins.join(" ")].join(" ").toLocaleLowerCase("fr").includes(q))&&(!age||p.age===age)&&(!need||p.besoins.includes(need))&&(!size||p.gabarit==="Toutes"||p.gabarit.split("|").includes(size))&&(!brand||p.marque===brand));}
function card(p){let checked=selected.has(p.id);const pack=p.imageProduit?'<img src="'+p.imageProduit+'" alt="Sac de '+p.marque+' — '+p.recette+'" loading="lazy" onerror="this.remove();this.parentElement.classList.add(\'pack-missing\')">':'<span class="pack-fallback">'+(p.espece==="chien"?"🐶":"🐱")+'</span>';return `<article class="product-card"><div class="product-top"><span class="product-animal">${p.espece==="chien"?"🐶 CHIEN":"🐱 CHAT"}</span><label class="compare-check"><input type="checkbox" data-compare="${p.id}" ${checked?"checked":""}> Comparer</label></div><div class="product-identity"><div class="product-visual">${pack}${scoreBubbleMarkup(p)}</div><div class="product-names"><p class="product-brand">${p.marque}</p><h3>${p.recette}</h3></div></div><div class="product-metrics"><div><b>${fmt(p.proteines)} %</b><small>Protéines</small></div><div><b>${fmt(p.matieresGrasses)} %</b><small>Matières grasses</small></div><div><b>${fmt(p.fibres)} %</b><small>Fibres</small></div></div>${p.espece==="chien"?auditMarkup(p,true):""}<div class="product-price"><strong>${fmt(p.prixSac)} €</strong><span>${fmt(p.formatKg)} kg · ${fmt(p.prixKg)} €/kg</span></div><details class="product-details"><summary>Voir la fiche nutritionnelle détaillée</summary><div class="detail-grid">
 <div><span>Premier ingrédient</span><b>${p.premierIngredient||"Non communiqué"}</b></div><div><span>Protéines brutes</span><b>${fmt(p.proteines)} %</b></div><div><span>Matières grasses</span><b>${fmt(p.matieresGrasses)} %</b></div><div><span>Fibres brutes</span><b>${fmt(p.fibres)} %</b></div><div><span>Humidité</span><b>${fmt(p.humidite)} ${p.humidite==null?"":"%"}</b></div><div><span>Cendres brutes</span><b>${fmt(p.cendres)} ${p.cendres==null?"":"%"}</b></div><div><span>Glucides estimés</span><b>${fmt(p.glucides)} ${p.glucides==null?"":"%"}</b></div><div><span>Calcium / phosphore / magnésium</span><b>${fmt(p.calcium)} / ${fmt(p.phosphore)} / ${fmt(p.magnesium)}</b></div><div><span>Énergie métabolisable</span><b>${fmt(p.energie)} ${p.energie==null?"":"kcal/kg"}</b></div><div><span>Sodium / potassium</span><b>${fmt(p.sodium)} / ${fmt(p.potassium)} ${p.sodium==null&&p.potassium==null?"":"%"}</b></div><div><span>Oméga 3 / oméga 6</span><b>${fmt(p.omega3)} / ${fmt(p.omega6)} ${p.omega3==null&&p.omega6==null?"":"%"}</b></div><div><span>EPA / DHA</span><b>${fmt(p.epaDha??p.dha)} ${p.epaDha==null&&p.dha==null?"":"%"}</b></div><div><span>Composition complète</span><b>${p.compositionComplete||"À relever sur l'étiquette fabricant"}</b></div><div><span>Additifs et vitamines</span><b>${p.additifs||"À relever sur l'étiquette fabricant"}</b></div><div><span>Ration journalière</span><b>${p.ration||"À relever sur le guide fabricant"}</b></div>
 </div>${globalScoreMarkup(p)}${p.espece==="chien"?auditMarkup(p):""}<p class="detail-note">Valeurs fabricant disponibles ; les données absentes ne sont pas estimées.</p><p class="source-line">${p.sourceFabricant?'<a href="'+p.sourceFabricant+'" target="_blank" rel="noopener">Source fabricant</a>':'Source fabricant non disponible'} · Données prix : ${p.vendeur||"marchand non précisé"}</p></details></article>`;}
function render(){let rows=filtered();$("#resultCount").textContent=rows.length+" références";$("#emptyState").hidden=rows.length>0;$("#results").innerHTML=rows.map(card).join("");$("#results").querySelectorAll("[data-compare]").forEach(el=>el.addEventListener("change",()=>{if(el.checked){if(selected.size>=4){el.checked=false;alert("Vous pouvez comparer 4 produits maximum.");return;}selected.add(el.dataset.compare);}else selected.delete(el.dataset.compare);renderCompare();}));renderCompare();}
function renderCompare(){let ps=data.filter(p=>selected.has(p.id));$("#compareCount").textContent=ps.length+"/4 sélectionnées";$("#comparison").hidden=ps.length<2;$("#comparisonTable").innerHTML=ps.length<2?"":`<div class="comparison-scroll"><table><thead><tr><th>Critère</th>${ps.map(p=>`<th><span class="compare-brand">${p.marque}</span><br><small class="compare-recipe">${p.recette}</small><button data-remove="${p.id}" aria-label="Retirer">×</button></th>`).join("")}</tr></thead><tbody>${[["Note Crocami",p=>{const n=globalNutritionScore(p);return n.score==null?"Non calculable":n.score+"/100 · fiabilité "+n.confidence+" %";}],["Prix du sac",p=>fmt(p.prixSac)+" €"],["Format",p=>fmt(p.formatKg)+" kg"],["Prix au kg",p=>fmt(p.prixKg)+" €/kg"],["Protéines",p=>fmt(p.proteines)+" %"],["Protéines sur matière sèche",p=>fmt(p.proteinesMS)+" %"],["Matières grasses",p=>fmt(p.matieresGrasses)+" %"],["Fibres",p=>fmt(p.fibres)+" %"],["Humidité",p=>fmt(p.humidite)+" %"],["Cendres",p=>fmt(p.cendres)+" %"],["Glucides",p=>fmt(p.glucides)+" %"],["Premier ingrédient",p=>p.premierIngredient],["Note source /5",p=>fmt(p.noteComposition)]].map(([k,f])=>`<tr><th>${k}</th>${ps.map(p=>`<td>${f(p)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;$$("[data-remove]").forEach(b=>b.addEventListener("click",()=>{selected.delete(b.dataset.remove);render();}));}
tabs.forEach(t=>t.addEventListener("click",()=>setAnimal(t.dataset.animal)));
$("#searchBtn").addEventListener("click",render);$("#search").addEventListener("keydown",e=>{if(e.key==="Enter")render();});
$$(".filter-row select").forEach(s=>s.addEventListener("change",render));
$$("[data-jump-animal]").forEach(a=>a.addEventListener("click",()=>setAnimal(a.dataset.jumpAnimal)));
const brands=[...new Set(data.map(p=>p.marque))].sort();$("#brand").innerHTML='<option value="">Toutes les marques</option>'+brands.map(b=>'<option>'+b+'</option>').join("");
render();
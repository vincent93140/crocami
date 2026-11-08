/* Configuration des partenariats Crocami — liens de tracking activés uniquement après acceptation. */
(function(){
 const merchants={
  zooplus:{key:"zooplus",name:"Zooplus",network:"Awin",status:"pending",home:"https://www.zooplus.fr/",application:"https://ui.awin.com/merchant-profile/7334",commission:"3 % sur les 3 premières commandes éligibles, puis 1 %",cookie:"30 jours"},
  zoomalia:{key:"zoomalia",name:"Zoomalia",network:"Affilae",status:"pending",home:"https://www.zoomalia.com/",application:"https://app.affilae.com/fr/publisher/marketplace/programme-affiliation-zoomalia",commission:"6 % nouveaux clients, 3 % anciens clients (à confirmer dans le compte)",cookie:"30 jours (à confirmer dans le compte)"}
 };
 /* Renseigner une entrée par produit uniquement avec le deep link de tracking généré par Awin/Affilae. */
 const productLinks={};
 function getOffers(product){
  const id=product&&product.id;
  return Object.values(merchants).map(merchant=>{
   const configured=productLinks[id+"|"+merchant.key];
   const approved=merchant.status==="approved"&&configured&&/^https:\/\//i.test(configured.url||"");
   const supplied=product&&product.urlVendeur||"";
   const suppliedMatches=merchant.key==="zooplus"?/zooplus\.fr/i.test(supplied):/zoomalia\.com/i.test(supplied);
   return {key:merchant.key,name:merchant.name,network:merchant.network,url:approved?configured.url:(suppliedMatches?supplied:merchant.home),isAffiliate:!!approved,status:merchant.status,commission:merchant.commission,cookie:merchant.cookie};
  });
 }
 window.CROCamiAffiliateMerchants=merchants;
 window.CROCamiGetAffiliateOffers=getOffers;
})();
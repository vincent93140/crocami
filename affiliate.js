/* Configuration des partenariats Crocami.
   Ajouter uniquement les URL de tracking/deep links fournis après acceptation par le marchand.
   Ne jamais fabriquer un identifiant affilié ou transformer une URL classique en lien affilié. */
(function(){
 const merchants={
  zooplus:{name:"zooplus",network:"Awin",status:"pending",application:"https://ui.awin.com/merchant-profile/7334"},
  zoomalia:{name:"Zoomalia",network:"Affilae",status:"pending",application:"https://app.affilae.com/fr/publisher/marketplace/programme-affiliation-zoomalia"},
  ultrapremiumdirect:{name:"Ultra Premium Direct",network:"Direct",status:"pending",application:"https://www.ultrapremiumdirect.com/page/affiliation/"}
 };
 /* Clé produit -> {merchant:"zooplus", url:"URL DEEP LINK FOURNIE PAR LE PROGRAMME"} */
 const productLinks={};
 function merchantKey(product){
  const text=[product&&product.vendeur,product&&product.urlVendeur].filter(Boolean).join(" ").toLowerCase();
  if(text.includes("zooplus"))return "zooplus";
  if(text.includes("zoomalia"))return "zoomalia";
  if(text.includes("ultrapremiumdirect")||text.includes("ultra premium"))return "ultrapremiumdirect";
  return null;
 }
 function getOffer(product){
  const configured=productLinks[product&&product.id];
  const key=configured&&configured.merchant?configured.merchant:merchantKey(product);
  const merchant=key?merchants[key]:null;
  if(configured&&configured.url&&merchant&&merchant.status==="approved"&&/^https:\/\//i.test(configured.url)){
   return {key,name:merchant.name,url:configured.url,isAffiliate:true};
  }
  const fallback=product&&product.urlVendeur;
  if(fallback&&/^https:\/\//i.test(fallback)){
   const name=merchant?merchant.name:(product.vendeur||"la boutique référencée");
   return {key:key||"other",name,url:fallback,isAffiliate:false};
  }
  return null;
 }
 window.CROCamiAffiliateMerchants=merchants;
 window.CROCamiGetAffiliateOffer=getOffer;
})();

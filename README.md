# Crocami

Comparateur de croquettes pour chiens et chats : recherche, filtres, comparaison nutritionnelle et transparence des sources.

## Publication et contrôles SEO

L’accueil utilise `catalogue-leger.js`, généré à partir des données complètes. Les compositions et relevés détaillés restent disponibles dans les fiches HTML. Ne pas modifier ce fichier à la main.

Après une mise à jour des données, du modèle HTML ou de l’application :

```text
node scripts/build-product-pages.mjs
node scripts/build-product-pages.mjs --check
node scripts/audit-site-seo.mjs
node scripts/audit-seo-upgrade.mjs
```

Le contrôle compare les notes et leurs critères entre catalogue complet et allégé, les formats du balisage Product et la répartition des liens. Les prix restent des relevés datés, sans synchronisation en temps réel.

La livraison SEO du 9 novembre comprend 236 fiches distinctes, sept articles et leur sommaire, quatre pages de sélection, deux pages de présentation/méthode, l’accueil et l’annuaire : 252 URL dans le sitemap. Les chiffres historiques ci-dessous décrivent les lots collectés avant fusion des références.

## Fonctionnalités
- Catalogue chiens et chats avec recherche par marque, recette et besoin.
- Filtres par espèce, âge, taille/gabarit et besoin.
- Tri par note Crocami, prix du sac, prix au kg et marque.
- Comparaison côte à côte de 2 à 4 références.
- Fiches détaillées avec composition, constituants analytiques, énergie, additifs, rations et sources lorsqu'ils sont publiés.
- Les données absentes restent non communiquées : aucune valeur nutritionnelle ni aucun prix ne sont inventés.
- Offres Zoomalia et Zooplus par format sur les fiches, avec prix TTC, prix au kilo, date, disponibilité et lien direct.
- Relevés nutritionnels des revendeurs consultables séparément, avec signalement des écarts de formulation.

## Catalogue
- Complément du 7 novembre 2026 : tables de rations fabricant ajoutées aux fiches d03, d05, d06, d09, d11, d12, d15, d16, d19 et c19. Les nutriments non publiés par les sources restent non communiqués.
- Les 10 références Virbac ajoutées sont canines : 7 physiologiques et 3 diététiques.
- La fiche Animalis `mq-dog-026` (chien de grande taille au poulet), dont la photo exacte n'était pas disponible, a été retirée du catalogue à la demande de l'utilisateur.
- Photos du 9 novembre 2026 : les 240 fiches ont un visuel. Les six nouvelles photos, le packshot Virbac D1 et le remplacement de l’image Bosch Adult agneau-riz ont été contrôlés visuellement et enregistrés dans `images/produits/`. L’audit technique charge le catalogue complet, contrôle les réponses HTTP des images distantes et les signatures des fichiers locaux ; il ne certifie pas la correspondance visuelle de toutes les anciennes images.

## Prix et compléments du 9 novembre 2026
- Recherche des 240 références sur chaque marchand, dont 93 recherches complémentaires sur Zoomalia pour les noms anciens ou difficiles à retrouver.
- 159 fiches disposent d’au moins une offre exacte vérifiée : 131 chez Zooplus et 130 chez Zoomalia, avec des références présentes chez les deux marchands. Les 841 lignes rattachées aux fiches représentent 731 offres distinctes, tous formats confondus.
- 154 fiches disposent de relevés nutritionnels complémentaires exploitables ; composition, additifs, rations et valeurs publiées sont conservés avec leurs sources. Ces relevés n’écrasent pas les données principales et ne modifient pas les notes existantes.
- Les 81 autres références restent sans offre exacte vérifiée. Une recherche infructueuse ne prouve pas une indisponibilité. Les anciennes recettes, les saveurs ambiguës et les autres espèces ne sont pas assimilées à une correspondance.
- Les prix sont ceux des achats sans abonnement ni code promo, hors livraison. Le prix au kilo est calculé à partir du prix et du poids total affichés. Les écarts avec le prix au kilo du marchand sont signalés et ces lignes sont exclues du prix principal du comparateur.
- Les lots, anciens emballages et emballages reconditionnés sont identifiés par leur format. Les formats conditionnels sont exclus du prix principal du comparateur. Prix et stocks constituent un relevé ponctuel ; ils ne sont pas actualisés automatiquement.
- Nouvelles fiches : Royal Canin Medium Adult 7+, Royal Canin Kitten, Pro Plan Sterilised Renal Plus saumon, Pro Plan Sterilised Renal Plus lapin, Hill’s Adult Sterilised poulet et Hill’s Adult Light poulet.
- Deux fiches Zoomalia n’ont pas été rattachées : la Purina ONE Medium Maxi trouvée est au poulet alors que d14 est au bœuf ; les formats Ultima Sterilised d’une page multi-saveurs ne permettent pas d’identifier la recette poulet avec certitude.

Les sources figées sont conservées dans les rapports. Après relecture des correspondances, les fichiers du site se reconstruisent avec `node scripts/build-additional-products.mjs`, puis `node scripts/build-merchant-data.mjs`. Contrôles : `node scripts/audit-merchant-data.mjs` et `node scripts/audit-product-images.mjs` (ce dernier nécessite l’accès réseau).

## Méthode de notation Crocami

| Critère | Poids maximal |
|---|---:|
| Rapport protido-calorique (RPC) | 30 % |
| Indice protéines / phosphore | 20 % |
| Ratio calcium / phosphore | 15 % |
| Rapport oméga 6 / 3 | 10 % |
| Glucides estimés | 15 % |
| Fibres | 5 % |
| Taurine (chat uniquement) | 5 % |

- Le ratio calcium/phosphore est calculé à partir des teneurs individuelles lorsqu'elles existent; si le fabricant publie uniquement le ratio, cette valeur directe est utilisée et les teneurs individuelles restent non communiquées.
- Le pourcentage de protéines brutes n'est jamais noté isolément : une teneur élevée n'entraîne donc pas automatiquement une pénalité.
- Les critères indisponibles sont exclus du calcul; leur absence réduit la couverture affichée et la fiabilité de la note.
- Si moins de 20 % des critères pondérés sont renseignés, Crocami n'affiche pas de note calculée.
- Les seuils sont des repères de comparaison indicatifs, pas des recommandations médicales ou vétérinaires. Le score ne remplace pas l'avis d'un vétérinaire et doit être lu avec le profil de l'animal.


- Composition complète : 170/170.
- Protéines, matières grasses, fibres et cendres : 170/170.
- Glucides estimés : 163/170.
- Humidité : 16/170.
- Calcium et phosphore individuels : 23/170; une fiche supplémentaire publie seulement le ratio Ca/P (1,11:1).
- Magnésium : 10/170.
- Sodium : 9/170.
- Énergie métabolisable issue d'une source fabricant : 18/170; 152 restent non renseignées faute de valeur fabricant vérifiée pour la formulation exacte.
- Oméga 3 et oméga 6 : 19/170.
- Taurine : 15/170.
- Additifs : 7/170.
- Rations journalières : 3/170.
- Lien fabricant enregistré : 24/170.
- Notes Crocami contrôlées : 169/170 calculables; 1 fiche n'atteint pas le seuil minimal de couverture. Aucun score invalide détecté.
- Couverture moyenne des critères : 55,1 %; fiabilité affichée pour chaque fiche.

Les données publiées par les fabricants priment lorsqu'une fiche officielle actuelle et identifiable est disponible. Lorsqu'une donnée n'est publiée que par un revendeur, la fiche le précise. Les variantes de formule et les écarts entre sources sont signalés; ils ne sont pas fusionnés silencieusement.

## Rapports de contrôle
- `reports/merchant-price-summary-2026-11-09.json` : couverture par marchand, références sans offre et correspondances écartées.
- `reports/merchant-data-anomalies-2026-11-09.json` : formats non exploitables et écarts de prix au kilo publiés par les marchands.
- `reports/merchant-validation-2026-11-09.json` : rendu des 240 fiches, calculs des prix et conservation des données nutritionnelles.
- `reports/merchant-photo-audit-2026-11-09.json` : sources des huit photos locales vérifiées visuellement.
- `reports/nutrition-audit-summary-2026-11-06.json` : résumé des contrôles de notation.
- `reports/product-image-audit.csv` et `reports/product-image-audit-summary.json` : contrôle technique de toutes les URL d'images.

## Sources de départ et publication
- Fiches fabricants et revendeurs citées individuellement dans les fiches produit.
- Publication GitHub Pages : dans **Settings → Pages**, choisir **Deploy from a branch**, branche **main**, dossier **/ (root)**.

## Pages produits et lisibilité mobile

Les fiches statiques sont générées par `node scripts/build-product-pages.mjs` après toute modification des données ou du rendu des fiches. La commande `node scripts/build-product-pages.mjs --check` vérifie que les pages et le sitemap sont à jour. Les références identiques partagent une adresse canonique.

Les pages de `produits/` contiennent leur contenu, leur titre, leur description et leur URL canonique sans dépendre de JavaScript. `sitemap.xml` et `robots.txt` sont générés dans la même opération. Les anciens liens `#produit/…` sont redirigés dans le navigateur vers la nouvelle adresse.

## Calcul du RPC
Le RPC est calculé lorsque les protéines et l’énergie de la même formulation sont disponibles. Sinon, une valeur de référence déjà renseignée est conservée pour maintenir les notes existantes. Sans aucune valeur disponible, le critère est exclu. Les photos du catalogue sont servies localement.

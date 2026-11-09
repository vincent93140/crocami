# Crocami

Comparateur de croquettes pour chiens et chats : recherche, filtres, comparaison nutritionnelle et transparence des sources.

## Fonctionnalités
- Catalogue chiens et chats avec recherche par marque, recette et besoin.
- Filtres par espèce, âge, taille/gabarit et besoin.
- Tri par note Crocami, prix du sac, prix au kg et marque.
- Comparaison côte à côte de 2 à 4 références.
- Fiches détaillées avec composition, constituants analytiques, énergie, additifs, rations et sources lorsqu'ils sont publiés.
- Bulle de note Crocami sur chaque carte; la note Macroquette est présentée séparément lorsqu'une fiche individuelle vérifiable existe.
- Les données absentes restent non communiquées : aucune valeur nutritionnelle ni aucun prix ne sont inventés.
- Offres Zoomalia et Zooplus par format sur les fiches, avec prix TTC, prix au kilo, date, disponibilité et lien direct.
- Relevés nutritionnels des revendeurs consultables séparément, avec signalement des écarts de formulation.

## Catalogue
- 240 références chargées : les 234 références de `catalogue.js` (40 références de départ, 170 issues de Macroquette, 10 Virbac, 8 SPECIFIC / Hill’s et 6 Ownat), plus 6 nouvelles références sourcées dans `references-complementaires.js`. Le catalogue comprend 132 références chien et 108 références chat ; les identifiants sont uniques.
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
La note Crocami est un indice comparatif propre au site, distinct de la note Macroquette. Elle est recalculée à partir des données effectivement disponibles sur chaque fiche.

| Critère | Poids maximal |
|---|---:|
| Rapport protido-calorique (RPC) | 30 % |
| Indice protéines / phosphore | 20 % |
| Ratio calcium / phosphore | 15 % |
| Rapport oméga 6 / 3 | 10 % |
| Glucides estimés | 15 % |
| Fibres | 5 % |
| Taurine (chat uniquement) | 5 % |

- Le RPC est calculé lorsque protéines et énergie fabricant sont connues : protéines (%) × 10 000 / énergie (kcal/kg). Si l'énergie fabricant manque, un RPC directement publié par Macroquette peut être utilisé, clairement identifié comme source externe; aucune énergie n'est déduite ou inventée.
- Le ratio calcium/phosphore est calculé à partir des teneurs individuelles lorsqu'elles existent; si le fabricant publie uniquement le ratio, cette valeur directe est utilisée et les teneurs individuelles restent non communiquées.
- Le pourcentage de protéines brutes n'est jamais noté isolément : une teneur élevée n'entraîne donc pas automatiquement une pénalité.
- Les critères indisponibles sont exclus du calcul; leur absence réduit la couverture affichée et la fiabilité de la note.
- Si moins de 20 % des critères pondérés sont renseignés, Crocami n'affiche pas de note calculée.
- Les seuils sont des repères de comparaison indicatifs, pas des recommandations médicales ou vétérinaires. Le score ne remplace pas l'avis d'un vétérinaire et doit être lu avec le profil de l'animal.

## Note Macroquette (référence externe)
- 161 notes Macroquette ont été relevées sur des fiches produit individuelles et enregistrées séparément de la note Crocami, avec la date de consultation du 6 novembre 2026.
- 9 références Macroquette ne disposent pas d'une note individuelle exploitable dans les sources consultées : liens génériques retirés ou fiche individuelle absente. Aucune note Macroquette n'est inventée.
- La note publiée sur une fiche Macroquette peut être une moyenne indicative et peut différer du résultat de leur outil personnalisé. Elle ne doit pas être confondue avec le score Crocami.
- Huit liens génériques Macroquette menant seulement à une page générale d'analyses ou à une recette différente ont été retirés; deux produits ont retrouvé leur fiche individuelle exacte au lieu d'être présentés comme des fiches produit.

## État des données Macroquette — audit du 6 novembre 2026
Le catalogue contient 234 références au total (40 références de départ + 170 Macroquette + 10 Virbac + 8 SPECIFIC / Hill’s + 6 Ownat). Les statistiques détaillées ci-dessous concernent uniquement les 170 fiches Macroquette et proviennent de l’audit du 6 novembre 2026; elles ne décrivent pas les 64 autres fiches. Les autres données ne sont pas toutes publiées ou vérifiées et restent absentes lorsqu'elles ne sont pas sourcées.
Sur les 170 fiches Macroquette, après les enrichissements du 6 novembre 2026 :
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
- RPC exploitable : 167/170 (18 calculés avec l'énergie fabricant, 149 publiés par Macroquette); 3 fiches restent sans RPC vérifiable.
- Notes Crocami contrôlées : 169/170 calculables; 1 fiche n'atteint pas le seuil minimal de couverture. Aucun score invalide détecté.
- Couverture moyenne des critères : 55,1 %; fiabilité affichée pour chaque fiche.

Les données publiées par les fabricants priment lorsqu'une fiche officielle actuelle et identifiable est disponible. Lorsqu'une donnée n'est publiée que par un revendeur, la fiche le précise. Les variantes de formule et les écarts entre sources sont signalés; ils ne sont pas fusionnés silencieusement.

## Rapports de contrôle
- `reports/merchant-price-summary-2026-11-09.json` : couverture par marchand, références sans offre et correspondances écartées.
- `reports/merchant-data-anomalies-2026-11-09.json` : formats non exploitables et écarts de prix au kilo publiés par les marchands.
- `reports/merchant-validation-2026-11-09.json` : rendu des 240 fiches, calculs des prix et conservation des données nutritionnelles.
- `reports/merchant-photo-audit-2026-11-09.json` : sources des huit photos locales vérifiées visuellement.
- `reports/nutrition-audit-2026-11-06.csv` : RPC, notes, couverture et données manquantes des 170 références Macroquette.
- `reports/nutrition-audit-summary-2026-11-06.json` : résumé des contrôles de notation.
- `reports/product-image-audit.csv` et `reports/product-image-audit-summary.json` : contrôle technique de toutes les URL d'images.

## Sources de départ et publication
- Fiches fabricants et revendeurs citées individuellement dans les fiches produit.
- Publication GitHub Pages : dans **Settings → Pages**, choisir **Deploy from a branch**, branche **main**, dossier **/ (root)**.

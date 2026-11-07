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

## Catalogue
- 234 références présentes dans `catalogue.js` : 40 références de départ, 170 références issues de Macroquette, 10 références Virbac, 8 références SPECIFIC / Hill’s et 6 références Ownat. Le comptage du catalogue donne 131 références chien et 103 références chat; les 234 identifiants sont uniques.
- Les 10 références Virbac ajoutées sont canines : 7 physiologiques et 3 diététiques.
- La fiche Animalis `mq-dog-026` (chien de grande taille au poulet), dont la photo exacte n'était pas disponible, a été retirée du catalogue à la demande de l'utilisateur.
- Audit automatisé des images : 226 URL distinctes contrôlées individuellement par requête HTTP et type MIME; 226 images valides, aucun lien mort. Une fiche Virbac D1 reste sans packshot validé et utilise le visuel de secours. Ce contrôle vérifie l'accessibilité technique, pas la correspondance visuelle manuelle de chaque variante.

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
- `reports/nutrition-audit-2026-11-06.csv` : RPC, notes, couverture et données manquantes des 170 références Macroquette.
- `reports/nutrition-audit-summary-2026-11-06.json` : résumé des contrôles de notation.
- `reports/product-image-audit.csv` et `reports/product-image-audit-summary.json` : contrôle technique de toutes les URL d'images.

## Sources de départ et publication
- Jeu de données MeilleuresCroquettes publié sur data.gouv.fr, licence CC BY 4.0; relevés de prix datés du 1er novembre 2026.
- Fiches fabricants et revendeurs citées individuellement dans les fiches produit.
- Publication GitHub Pages : dans **Settings → Pages**, choisir **Deploy from a branch**, branche **main**, dossier **/ (root)**.

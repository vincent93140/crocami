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
- 220 références présentes dans `catalogue.js` : 40 références de départ, 170 références issues de Macroquette et 10 références Veterinary HPM de Virbac. Le total de 228 indiqué dans une version précédente était erroné et a été corrigé après comptage des identifiants uniques.
- Les 10 références Virbac ajoutées sont canines : 7 physiologiques et 3 diététiques.
- La fiche Animalis `mq-dog-026` (chien de grande taille au poulet), dont la photo exacte n'était pas disponible, a été retirée du catalogue à la demande de l'utilisateur.
- Les 220 fiches disposent d'une image produit déclarée. La présence d'une URL ne vaut toutefois pas validation visuelle ni contrôle de disponibilité de chaque image distante.

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

- Le RPC est calculé uniquement lorsque les protéines et l'énergie métabolisable sont toutes deux connues : protéines (%) × 10 000 / énergie (kcal/kg).
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
Le catalogue contient 220 références au total (40 références de départ + 170 Macroquette + 10 Virbac). Les 170 fiches Macroquette ont chacune une composition complète, les protéines, matières grasses, fibres, cendres et une URL d'image déclarée. Les autres données ne sont pas toutes publiées ou vérifiées et restent absentes lorsqu'elles ne sont pas sourcées.
Sur les 170 fiches Macroquette :
- Composition complète : 170/170.
- Protéines, matières grasses, fibres et cendres : 170/170.
- Glucides estimés : 163/170.
- Humidité : 8/170.
- Calcium et phosphore : 14/170.
- Magnésium : 4/170.
- Énergie métabolisable : 9/170.
- Oméga 3 et oméga 6 : 13/170.
- Taurine : 8/170.
- Additifs : 7/170.
- Rations journalières : 3/170.
- Lien fabricant enregistré : 15/170.\n- Lien fiche revendeur enregistré : 15/170.

Les données publiées par les fabricants priment lorsqu'une fiche officielle actuelle et identifiable est disponible. Lorsqu'une donnée n'est publiée que par un revendeur, la fiche le précise. Les variantes de formule et les écarts entre sources sont signalés; ils ne sont pas fusionnés silencieusement.

## Sources de départ et publication
- Jeu de données MeilleuresCroquettes publié sur data.gouv.fr, licence CC BY 4.0; relevés de prix datés du 1er novembre 2026.
- Fiches fabricants et revendeurs citées individuellement dans les fiches produit.
- Publication GitHub Pages : dans **Settings → Pages**, choisir **Deploy from a branch**, branche **main**, dossier **/ (root)**.

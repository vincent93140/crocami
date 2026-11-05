# Crocami

Premier socle du comparateur français de croquettes pour chiens et chats.

## Fonctionnalités de cette première version
- Page d'accueil responsive
- Entrée chien / chat
- Barre de recherche et filtres de profil (maquette fonctionnelle)
- Présentation du fonctionnement et des engagements de transparence

## Publication GitHub Pages
1. Ouvrir **Settings** dans le dépôt.
2. Aller dans **Pages**.
3. Dans **Build and deployment**, choisir **Deploy from a branch**.
4. Sélectionner la branche **main** et le dossier **/ (root)**, puis enregistrer.

## Catalogue et comparateur — première version
- 40 références de départ : 20 chiens et 20 chats.
- Recherche réelle par marque, recette et premier ingrédient.
- Filtres par espèce, âge, taille/gabarit et besoin.
- Comparaison côte à côte de 2 à 4 références.
- Fiches détaillées avec valeurs disponibles et mention explicite des données manquantes.
- Source de départ : jeu de données MeilleuresCroquettes publié sur data.gouv.fr, licence CC BY 4.0 ; relevés de prix datés du 1er novembre 2026.

## Compléments à réaliser
1. Compléter chaque composition intégrale et la liste d'additifs à partir des fiches fabricants/étiquettes.
2. Vérifier cendres, calcium, phosphore, magnésium, humidité, énergie et rations ; ne pas extrapoler les données absentes.
3. Ajouter les liens marchands exacts et relever les prix chez plusieurs vendeurs avec frais de livraison et date de contrôle.
4. Publier une méthode Crocami distincte de la note de composition fournie par la source de départ.

## Fiabilité des données
Aucun produit, prix ou score fictif n'est présenté comme réel dans cette version. Les recommandations alimentaires ne remplacent pas un avis vétérinaire.

## Audit du catalogue — 5 novembre 2026

Contrôle structurel effectué sur les fichiers publiés :
- 219 fiches au total : 40 références de départ, 8 références Chronovet et 171 références ajoutées depuis Macroquette.
- Les 40 références de départ disposent d'une image produit déclarée dans `fabricants.js`.
- Parmi les 171 références Macroquette, 170 disposent d'une URL d'image ; la référence `mq-dog-026` (Animalis, chien de grande taille au poulet) reste sans photo exacte.
- L'image affichée sur sa page Macroquette correspond visuellement à une recette stérilisée/allégée : elle n'a donc pas été réutilisée pour éviter une photo trompeuse. La fiche conserve le visuel de remplacement chien prévu par l'interface.
- Les champs nutritionnels non publiés par les sources restent non renseignés. Les compositions et valeurs disponibles ne sont pas complétées par estimation.

Cet audit vérifie la présence et la cohérence des données et des références d'images dans le catalogue. Il ne constitue pas une validation visuelle manuelle de chaque image distante ni une nouvelle mesure des prix en temps réel.

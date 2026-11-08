# Dossier d'inscription affiliation — Crocami

Objectif : monétiser le comparateur Crocami (https://vincent93140.github.io/crocami/) avec des liens marchands transparents vers les aliments pour chiens et chats.

## Présentation à utiliser

Crocami est un comparateur indépendant dédié aux croquettes pour chiens et chats. Le site aide les propriétaires à comparer les compositions, les données nutritionnelles disponibles, les formats et les prix au kilo. Les fiches produits indiquent les sources consultées et expliquent les critères de notation. Les liens marchands sont proposés comme une possibilité d'achat, sans influencer les évaluations nutritionnelles ni le classement.

Audience : propriétaires de chiens et de chats en France.
Type de promotion : site éditorial / comparateur / guides d'achat.
Canal : site web, référencement naturel (SEO).
URL : https://vincent93140.github.io/crocami/

## Candidatures prioritaires

### 1. Awin — puis programme Zooplus FR
- Inscription éditeur : https://ui.awin.com/publisher-signup/fr/awin
- Programme Zooplus FR : https://ui.awin.com/merchant-profile/7334
- Dans le profil éditeur, présenter Crocami comme un comparateur éditorial spécialisé animaux, ajouter l'URL ci-dessus et sélectionner les catégories animaux / alimentation pour animaux / contenu éditorial si proposées.
- Après activation du compte, déposer une candidature au programme Zooplus FR.
- Conditions annoncées dans le profil consulté : 3 % sur les trois premières commandes éligibles, puis 1 % à partir de la quatrième ; cookie de 30 jours. Les conditions affichées dans le compte au moment de la candidature prévalent.
- Awin peut demander un acompte lors de l'inscription ; vérifier le montant et les conditions de remboursement à l'écran avant de payer.

### 2. Affilae — programme Zoomalia
- Page programme : https://app.affilae.com/fr/publisher/marketplace/programme-affiliation-zoomalia
- Créer le compte éditeur Affilae, ajouter Crocami comme média/site, puis postuler au programme Zoomalia.
- Les taux rapportés publiquement sont de 6 % nouveaux clients et 3 % clients existants, cookie annoncé de 30 jours ; vérifier les conditions et méthodes promotionnelles dans l'interface officielle avant acceptation.

### 3. Ultra Premium Direct — partenariat direct
- Page officielle : https://www.ultrapremiumdirect.com/page/affiliation/
- Contact : affiliation@ultrapremiumdirect.com
- Demander l'accès à leur programme d'affiliation pour le site Crocami et préciser que les fiches comportent une comparaison nutritionnelle et un lien d'achat transparent.
- La marque indique gérer le partenariat en interne et fournir les informations/visuels après validation.

## Message prêt à envoyer à Ultra Premium Direct

Objet : Demande de partenariat affiliation — comparateur Crocami

Bonjour,

Je développe Crocami (https://vincent93140.github.io/crocami/), un comparateur indépendant de croquettes pour chiens et chats.

Le site permet aux propriétaires de comparer les compositions, les données nutritionnelles publiées par les fabricants, les formats et les prix au kilo. Chaque fiche produit détaille les informations disponibles et les sources consultées. Notre objectif est d'aider les propriétaires à faire un choix éclairé, puis de leur permettre de retrouver facilement les produits auprès des boutiques partenaires.

Je souhaite intégrer Ultra Premium Direct parmi les boutiques proposées et rejoindre votre programme d'affiliation.

Pouvez-vous m'indiquer la procédure d'inscription, la plateforme utilisée, les conditions de commission, la durée d'attribution et les éventuelles exigences concernant les comparateurs ?

Je peux vous transmettre toute information complémentaire sur le site et son fonctionnement.

Bien cordialement,
L'équipe Crocami

## Après acceptation : procédure d'intégration

1. Récupérer les URL de tracking / deep links générées par la plateforme. Ne jamais convertir soi-même une URL classique en URL affiliée.
2. Associer chaque produit au bon marchand et à la bonne URL de produit.
3. Ajouter uniquement les liens dont l'approbation est confirmée.
4. Contrôler les liens sur ordinateur et mobile, puis effectuer un clic test et vérifier son apparition dans le tableau de bord du réseau.
5. Consulter les règles de chaque programme sur les coupons, le SEA, les comparateurs et l'usage des marques.
6. Vérifier les ventes attribuées, les commissions validées et les annulations dans le tableau de bord du réseau.

## Configuration technique Crocami

Le module \`affiliate.js\` contient les statuts des réseaux et une table \`productLinks\` prévue pour les liens affiliés par identifiant produit. Par défaut, tous les partenaires sont en attente et aucun lien affilié n'est activé.

Après approbation, mettre le marchand concerné à \`status:"approved"\` et ajouter dans \`productLinks\` l'URL de tracking/deep link exacte fournie par le réseau. Les liens ordinaires restent identifiés comme non affiliés.

Les clics sont émis sous l'événement \`crocami_affiliate_click\` dans \`dataLayer\` si un gestionnaire de tags est installé, ou sous l'événement GA4 \`affiliate_click\` si \`gtag\` est déjà configuré. Aucun outil d'analyse ni identifiant de mesure n'est créé automatiquement par ce module.

## Points de conformité à finaliser

- Afficher clairement la mention de transparence sur les liens affiliés.
- Utiliser \`rel="sponsored"\` sur les liens rémunérés.
- Ne pas laisser la commission influencer la note Crocami, les seuils ou l'ordre des recommandations.
- Vérifier les obligations légales applicables au statut de l'éditeur et la politique de confidentialité/cookies avant d'activer un outil de mesure d'audience.
- Vérifier les conditions de chaque marchand avant de promouvoir ses produits.

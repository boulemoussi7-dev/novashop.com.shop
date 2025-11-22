# E-Shop Sécurisé - Plateforme E-Commerce avec Code de Retrait

Une plateforme de vente en ligne moderne avec système de retrait physique sécurisé par code de retrait.

## 🎯 Fonctionnalités

### Pour les Clients
- **Boutique en ligne** : Parcourir et ajouter des produits au panier
- **Gestion du panier** : Modifier les quantités, appliquer des codes promo
- **Passer commande** : Formulaire de facturation complet
- **Code de retrait unique** : Chaque commande génère un code unique à présenter en boutique

### Pour la Boutique Physique
- **Scanner les codes** : Interface dédiée pour valider les codes de retrait
- **Vérification d'identité** : Affichage des informations client pour validation
- **Sécurité renforcée** : 
  - Codes uniques et non réutilisables
  - Base de données croisée (code + informations client)
  - Archive des retraits validés
- **Liste des commandes récentes** : Vue d'ensemble des commandes en attente

## 📁 Structure du Projet

```
.
├── index.html          # Page boutique (liste des produits)
├── panier.html         # Page panier
├── commande.html       # Page checkout/commande
├── boutique-scan.html # Page pour scanner les codes en boutique
├── styles.css          # Styles CSS globaux
├── script.js           # Fonctions utilitaires et gestion du panier
├── shop.js             # Logique de la page boutique
├── cart.js             # Logique de la page panier
├── checkout.js         # Logique de la page commande
└── boutique-scan.js    # Logique de scan et validation
```

## 🚀 Utilisation

### Installation
Aucune installation requise ! Ouvrez simplement `index.html` dans votre navigateur.

### Workflow Client
1. Parcourir les produits sur la page **Boutique**
2. Ajouter des produits au panier
3. Aller au **Panier** pour vérifier/modifier
4. Passer la **Commande** en remplissant le formulaire
5. Recevoir un **code de retrait unique** (ex: `RET-XXXXX-XXXXXX`)
6. Se présenter en boutique avec le code et une pièce d'identité

### Workflow Boutique
1. Ouvrir la page **boutique-scan.html**
2. Entrer ou scanner le code de retrait du client
3. Vérifier les informations affichées :
   - Nom, prénom, téléphone, email
   - Articles commandés
   - Total de la commande
4. Vérifier l'identité du client (pièce d'identité)
5. Cocher les cases de validation
6. Valider le retrait (action irréversible)

## 🔒 Sécurité

- **Codes uniques** : Chaque commande génère un code unique non réutilisable
- **Validation d'identité** : Obligation de vérifier l'identité avant validation
- **Base de données locale** : Toutes les données sont stockées dans le localStorage du navigateur
- **Codes non réutilisables** : Une fois utilisé, un code ne peut plus être réutilisé
- **Archive complète** : Historique de toutes les commandes et retraits

## 💾 Stockage des Données

Le site utilise le **localStorage** du navigateur pour stocker :
- Les produits du panier
- Les commandes passées
- Les codes de retrait et leur statut
- Les informations de facturation (optionnel)

**Note** : Pour un environnement de production, il est recommandé d'utiliser une base de données serveur.

## 🎨 Personnalisation

### Modifier les produits
Éditez le tableau `PRODUCTS` dans `script.js` :

```javascript
const PRODUCTS = [
    {
        id: 1,
        name: "Nom du produit",
        price: 100,
        image: "URL_de_l_image"
    },
    // ...
];
```

### Modifier les styles
Toutes les couleurs et styles sont définis dans `styles.css` via des variables CSS :

```css
:root {
    --primary-color: #0073aa;
    --secondary-color: #005a87;
    /* ... */
}
```

## 📱 Responsive

Le site est entièrement responsive et s'adapte aux écrans :
- Desktop
- Tablette
- Mobile

## 🔧 Technologies Utilisées

- HTML5
- CSS3 (Grid, Flexbox)
- JavaScript (ES6+)
- localStorage pour le stockage

## 📝 Notes

- Les codes promo fonctionnels : `PROMO10`, `PROMO20`, `BIENVENUE`
- Le paiement à la livraison est le seul mode de paiement implémenté
- Les images des produits utilisent des URLs Unsplash (peuvent être remplacées)

## 🚧 Améliorations Futures Possibles

- Intégration avec une base de données serveur
- Système d'authentification pour les clients
- Envoi d'emails de confirmation
- Génération de QR codes pour les codes de retrait
- Historique des commandes pour les clients
- Système de recherche de produits
- Filtres par catégorie
- Mode sombre

## 📄 Licence

Copyright © 2025 - E-shop Sécurisé


// Base de données des produits
const PRODUCTS = [
    {
        id: 1,
        name: "Four Électrique Compact",
        description: "Four électrique moderne avec contrôle de température, fonctions multiples et minuterie. Parfait pour cuisiner, griller et réchauffer.",
        price: 45000,
        image: "Img/18966394.jpg"
    },
    {
        id: 2,
        name: "Blender Professionnel",
        description: "Blender haute performance pour smoothies, soupes et préparations. Moteur puissant et pichet en verre résistant.",
        price: 35000,
        image: "Img/33057.jpg"
    },
    {
        id: 3,
        name: "Cafetière Moka Inox",
        description: "Cafetière italienne en acier inoxydable pour un café expresso authentique. Design élégant et durable.",
        price: 12000,
        image: "Img/machine-a-cafe.jpg"
    },
    {
        id: 4,
        name: "Machine à Laver Automatique",
        description: "Machine à laver frontale avec programmes multiples, écran digital et fonction délicat. Capacité optimale pour toute la famille.",
        price: 85000,
        image: "Img/5339845.jpg"
    },
    {
        id: 5,
        name: "Lave-Vaisselle Intégré",
        description: "Lave-vaisselle encastrable avec programmes automatiques. Économique en eau et énergie, parfait pour une cuisine moderne.",
        price: 95000,
        image: "Img/658.jpg"
    },
    {
        id: 6,
        name: "Bouilloire Électrique",
        description: "Bouilloire électrique en acier inoxydable avec arrêt automatique. Chauffage rapide et indicateur de niveau d'eau.",
        price: 15000,
        image: "Img/bouilloire-et-tasse-sur-fond-de-mur.jpg"
    },
    {
        id: 7,
        name: "Réfrigérateur Combi",
        description: "Réfrigérateur combiné avec congélateur intégré. Grandes capacités de stockage et organisation optimale pour vos aliments frais.",
        price: 125000,
        image: "Img/equipements-de-cuisine-image-du-refrigerateur-avec-de-la-nourriture-a-l-interieur.jpg"
    }
];

// Fonctions utilitaires pour le localStorage
const Storage = {
    // Panier
    getCart: () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    },

    saveCart: (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    },

    // Commandes
    getOrders: () => {
        const orders = localStorage.getItem('orders');
        return orders ? JSON.parse(orders) : [];
    },

    saveOrder: (order) => {
        const orders = Storage.getOrders();
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        return order;
    },

    // Codes de retrait
    getPickupCodes: () => {
        const codes = localStorage.getItem('pickupCodes');
        return codes ? JSON.parse(codes) : {};
    },

    savePickupCode: (code, orderData) => {
        const codes = Storage.getPickupCodes();
        codes[code] = orderData;
        localStorage.setItem('pickupCodes', JSON.stringify(codes));
    },

    getOrderByCode: (code) => {
        const codes = Storage.getPickupCodes();
        return codes[code] || null;
    },

    markCodeAsUsed: (code) => {
        const codes = Storage.getPickupCodes();
        if (codes[code]) {
            codes[code].used = true;
            codes[code].usedAt = new Date().toISOString();
            localStorage.setItem('pickupCodes', JSON.stringify(codes));
        }
    }
};

// Gestion du panier
const Cart = {
    add: (productId, quantity = 1) => {
        const cart = Storage.getCart();
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ productId, quantity });
        }

        Storage.saveCart(cart);
        return cart;
    },

    remove: (productId) => {
        const cart = Storage.getCart();
        const newCart = cart.filter(item => item.productId !== productId);
        Storage.saveCart(newCart);
        return newCart;
    },

    updateQuantity: (productId, quantity) => {
        const cart = Storage.getCart();
        const item = cart.find(item => item.productId === productId);
        
        if (item) {
            if (quantity <= 0) {
                return Cart.remove(productId);
            }
            item.quantity = quantity;
        }

        Storage.saveCart(cart);
        return cart;
    },

    clear: () => {
        Storage.saveCart([]);
    },

    getTotal: () => {
        const cart = Storage.getCart();
        return cart.reduce((total, item) => {
            const product = PRODUCTS.find(p => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }
};

// Mise à jour du compteur de panier
function updateCartCount() {
    const cart = Storage.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// Génération de code de retrait unique
function generatePickupCode() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RET-${timestamp.toString(36).toUpperCase()}-${random}`;
}

// Formatage du prix
function formatPrice(price) {
    return `${price} CFA`;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});


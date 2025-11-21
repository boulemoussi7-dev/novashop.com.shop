// Affichage des articles du panier
function displayCartItems() {
    const cart = Storage.getCart();
    const tbody = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (!tbody) return;

    tbody.innerHTML = '';

    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px;">Votre panier est vide</td></tr>';
        subtotalEl.textContent = '0 CFA';
        totalEl.textContent = '0 CFA';
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        if (!product) return;

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="cart-item">
                    <img src="${product.image}" alt="${product.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/80?text=${encodeURIComponent(product.name)}'">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${product.name}</div>
                        <div class="cart-item-price">${formatPrice(product.price)}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="decreaseQuantity(${product.id})">−</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQuantity(${product.id}, this.value)">
                    <button class="quantity-btn" onclick="increaseQuantity(${product.id})">+</button>
                </div>
            </td>
            <td>
                <span>${formatPrice(itemTotal)}</span>
                <button class="remove-btn" onclick="removeFromCart(${product.id})" title="Supprimer">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    subtotalEl.textContent = formatPrice(subtotal);
    totalEl.textContent = formatPrice(subtotal);
}

// Augmenter la quantité
function increaseQuantity(productId) {
    const cart = Storage.getCart();
    const item = cart.find(item => item.productId === productId);
    if (item) {
        Cart.updateQuantity(productId, item.quantity + 1);
        displayCartItems();
    }
}

// Diminuer la quantité
function decreaseQuantity(productId) {
    const cart = Storage.getCart();
    const item = cart.find(item => item.productId === productId);
    if (item && item.quantity > 1) {
        Cart.updateQuantity(productId, item.quantity - 1);
        displayCartItems();
    }
}

// Mettre à jour la quantité
function updateQuantity(productId, quantity) {
    Cart.updateQuantity(productId, parseInt(quantity));
    displayCartItems();
}

// Supprimer du panier
function removeFromCart(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        Cart.remove(productId);
        displayCartItems();
    }
}

// Appliquer le code promo
function applyPromoCode() {
    const codeInput = document.getElementById('promo-code');
    const code = codeInput.value.trim().toUpperCase();
    
    // Codes promo exemple
    const promoCodes = {
        'PROMO10': 0.1,
        'PROMO20': 0.2,
        'BIENVENUE': 0.15
    };

    if (promoCodes[code]) {
        alert(`Code promo "${code}" appliqué ! Réduction de ${promoCodes[code] * 100}%`);
        codeInput.value = '';
        // Ici vous pouvez implémenter la logique de réduction
    } else {
        alert('Code promo invalide');
    }
}

// Mettre à jour le panier
function updateCart() {
    displayCartItems();
    alert('Panier mis à jour');
}

// Redirection vers la commande
function goToCheckout() {
    const cart = Storage.getCart();
    if (cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }
    window.location.href = 'commande.html';
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    displayCartItems();
    
    const applyPromoBtn = document.getElementById('apply-promo');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }

    const updateCartBtn = document.getElementById('update-cart');
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', updateCart);
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', goToCheckout);
    }

    // Charger l'adresse depuis localStorage si disponible
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress && document.getElementById('delivery-address')) {
        document.getElementById('delivery-address').textContent = savedAddress;
    }
});


// Affichage du résumé de commande
function displayOrderSummary() {
    const cart = Storage.getCart();
    const tbody = document.getElementById('order-items');
    const subtotalEl = document.getElementById('order-subtotal');
    const totalEl = document.getElementById('order-total');
    
    if (!tbody) return;

    tbody.innerHTML = '';

    if (cart.length === 0) {
        window.location.href = 'panier.html';
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
            <td>${product.name} x ${item.quantity}</td>
            <td>${formatPrice(itemTotal)}</td>
        `;
        tbody.appendChild(row);
    });

    subtotalEl.textContent = formatPrice(subtotal);
    totalEl.textContent = formatPrice(subtotal);
}

// Valider et créer la commande
function placeOrder() {
    const form = document.getElementById('checkout-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const cart = Storage.getCart();
    if (cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }

    // Récupérer les données du formulaire
    const formData = new FormData(form);
    const orderData = {
        id: Date.now(),
        code: generatePickupCode(),
        date: new Date().toISOString(),
        customer: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            company: formData.get('company'),
            country: formData.get('country'),
            street: formData.get('street'),
            apartment: formData.get('apartment'),
            city: formData.get('city'),
            region: formData.get('region'),
            postalCode: formData.get('postalCode'),
            phone: formData.get('phone'),
            email: formData.get('email')
        },
        items: cart.map(item => {
            const product = PRODUCTS.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                total: product.price * item.quantity
            };
        }),
        subtotal: Cart.getTotal(),
        shipping: 0,
        total: Cart.getTotal(),
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        notes: formData.get('orderNotes'),
        status: 'pending',
        used: false
    };

    // Sauvegarder la commande
    Storage.saveOrder(orderData);
    
    // Sauvegarder le code de retrait
    Storage.savePickupCode(orderData.code, orderData);

    // Sauvegarder l'adresse
    const fullAddress = `${formData.get('street')}, ${formData.get('apartment')}, ${formData.get('city')}, ${formData.get('region')}, ${formData.get('postalCode')}.`;
    localStorage.setItem('deliveryAddress', fullAddress);

    // Vider le panier
    Cart.clear();

    // Rediriger vers la page de confirmation avec le code
    window.location.href = `confirmation.html?code=${orderData.code}`;
}

// Cette fonction n'est plus utilisée - redirection vers confirmation.html

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    displayOrderSummary();
    
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }

    // Charger les données sauvegardées si disponibles
    const savedData = localStorage.getItem('checkoutData');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const input = document.getElementById(key);
            if (input) input.value = data[key];
        });
    }

    // Sauvegarder les données au changement
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('change', () => {
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            localStorage.setItem('checkoutData', JSON.stringify(data));
        });
    }
});


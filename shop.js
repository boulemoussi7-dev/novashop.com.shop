// Affichage des produits (les produits sont maintenant en HTML statique)
// Cette fonction est conservée pour le tri dynamique si nécessaire
function displayProducts(products = PRODUCTS) {
    const grid = document.getElementById('products-grid');
    const countElement = document.getElementById('product-count');
    
    if (!grid) return;

    // Si les produits sont déjà en HTML, on peut juste mettre à jour le compteur
    if (countElement) {
        const productCards = grid.querySelectorAll('.product-card');
        countElement.textContent = productCards.length;
    }
}

// Ajouter au panier
function addToCart(productId) {
    Cart.add(productId, 1);
    
    // Animation de confirmation
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Ajouté !';
    btn.style.backgroundColor = '#46b450';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
    }, 2000);
}

// Tri des produits (tri des éléments HTML existants)
function sortProducts(sortBy) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const products = Array.from(grid.querySelectorAll('.product-card'));
    
    products.sort((a, b) => {
        switch(sortBy) {
            case 'price-asc': {
                const priceA = parseInt(a.querySelector('.product-price').textContent.replace(/[^\d]/g, ''));
                const priceB = parseInt(b.querySelector('.product-price').textContent.replace(/[^\d]/g, ''));
                return priceA - priceB;
            }
            case 'price-desc': {
                const priceA = parseInt(a.querySelector('.product-price').textContent.replace(/[^\d]/g, ''));
                const priceB = parseInt(b.querySelector('.product-price').textContent.replace(/[^\d]/g, ''));
                return priceB - priceA;
            }
            case 'name-asc': {
                const nameA = a.querySelector('.product-title').textContent.trim();
                const nameB = b.querySelector('.product-title').textContent.trim();
                return nameA.localeCompare(nameB);
            }
            default:
                return 0;
        }
    });
    
    // Réorganiser les éléments dans le DOM
    products.forEach(product => grid.appendChild(product));
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Les produits sont maintenant en HTML statique, on met juste à jour le compteur
    displayProducts();
    
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });
    }
});


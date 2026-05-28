// ============================================================
// Product Detail Page - urbangt
// Lógica de página de detalle de producto
// ============================================================

import { getProductById, getProductsByCategory, products } from './database.js';
import { cart } from './cart.js';
import { auth } from './auth.js';

// Obtener ID del producto de la URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

let selectedSize = null;
let selectedColor = null;
let currentProduct = null;

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    initializeProduct();
    setupEventListeners();
    loadRelatedProducts();
    updateCartBadge();
});

// Inicializar producto
function initializeProduct() {
    currentProduct = getProductById(productId);

    if (!currentProduct) {
        window.location.href = 'index.html';
        return;
    }

    // Actualizar información del producto
    document.getElementById('product-image').src = currentProduct.image;
    document.getElementById('product-name').textContent = currentProduct.name;
    document.getElementById('product-name-breadcrumb').textContent = currentProduct.name;
    document.getElementById('product-category').textContent = getCategoryName(currentProduct.category);
    document.getElementById('category-breadcrumb').textContent = getCategoryName(currentProduct.category);
    document.getElementById('product-description').textContent = currentProduct.description;
    document.getElementById('product-material').textContent = currentProduct.material;
    document.getElementById('product-care').textContent = currentProduct.care;
    document.getElementById('product-badge').textContent = currentProduct.badge;
    document.getElementById('product-reviews').textContent = currentProduct.reviews;
    document.getElementById('product-stock').textContent = currentProduct.inStock ? 'En stock' : 'Agotado';

    // Precios
    document.getElementById('product-price').textContent = '$' + currentProduct.price.toFixed(2);
    document.getElementById('product-original-price').textContent = '$' + currentProduct.originalPrice.toFixed(2);
    
    const savings = (currentProduct.originalPrice - currentProduct.price).toFixed(2);
    const discountPercent = Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100);
    document.getElementById('product-savings').textContent = '$' + savings;
    document.getElementById('product-discount').textContent = '-' + discountPercent + '%';

    // Rating
    const stars = Math.round(currentProduct.rating);
    let starHtml = '';
    for (let i = 0; i < 5; i++) {
        starHtml += i < stars ? '★' : '☆';
    }
    document.getElementById('product-rating').innerHTML = '<span class="text-lg text-accent">' + starHtml + '</span>';

    // Opciones de talla
    renderSizeOptions();

    // Opciones de color
    renderColorOptions();

    // Actualizar título de la página
    document.title = currentProduct.name + ' - urbangt';
}

// Obtener nombre de categoría
function getCategoryName(category) {
    const names = {
        'hoodies': 'Suéteres',
        'tshirts': 'Camisetas',
        'pants': 'Pantalones',
        'accessories': 'Accesorios'
    };
    return names[category] || category;
}

// Renderizar opciones de talla
function renderSizeOptions() {
    const container = document.getElementById('size-options');
    container.innerHTML = '';

    currentProduct.sizes.forEach(size => {
        const button = document.createElement('button');
        button.className = 'py-3 px-2 border-2 border-primary/30 dark:border-secondary/30 rounded-lg font-bold text-sm text-primary dark:text-secondary hover:border-accent hover:bg-accent/10 transition-all duration-300';
        button.textContent = size;
        button.onclick = () => selectSize(size, button);
        container.appendChild(button);
    });
}

// Renderizar opciones de color
function renderColorOptions() {
    const container = document.getElementById('color-options');
    container.innerHTML = '';

    currentProduct.colors.forEach(color => {
        const button = document.createElement('button');
        button.className = 'py-3 px-2 border-2 border-primary/30 dark:border-secondary/30 rounded-lg font-bold text-sm text-primary dark:text-secondary hover:border-accent hover:bg-accent/10 transition-all duration-300';
        button.textContent = color;
        button.onclick = () => selectColor(color, button);
        container.appendChild(button);
    });
}

// Seleccionar talla
function selectSize(size, button) {
    document.querySelectorAll('#size-options button').forEach(btn => {
        btn.classList.remove('border-accent', 'bg-accent/10', 'text-accent');
        btn.classList.add('border-primary/30', 'dark:border-secondary/30');
    });

    button.classList.remove('border-primary/30', 'dark:border-secondary/30');
    button.classList.add('border-accent', 'bg-accent/10', 'text-accent');

    selectedSize = size;
}

// Seleccionar color
function selectColor(color, button) {
    document.querySelectorAll('#color-options button').forEach(btn => {
        btn.classList.remove('border-orange-accent', 'bg-orange-accent/10', 'text-orange-accent');
        btn.classList.add('border-primary/30', 'dark:border-secondary/30');
    });

    button.classList.remove('border-primary/30', 'dark:border-secondary/30');
    button.classList.add('border-orange-accent', 'bg-orange-accent/10', 'text-orange-accent');

    selectedColor = color;
}

// Cargar productos relacionados
function loadRelatedProducts() {
    const related = getProductsByCategory(currentProduct.category).filter(p => p.id !== productId).slice(0, 4);
    const container = document.getElementById('related-products');

    related.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// Crear tarjeta de producto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'group product-card rounded-2xl overflow-hidden border-2 border-accent/30 bg-white dark:bg-primary/50 hover:border-accent transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer';

    card.innerHTML = `
        <div class="relative h-64 bg-gradient-to-br from-accent/10 to-orange-accent/10 flex items-center justify-center overflow-hidden">
            <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-125 transition-transform duration-300">
            <span class="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-orange-accent to-accent text-primary font-bold text-xs rounded-full">
                ${product.badge}
            </span>
        </div>
        <div class="p-4 space-y-3">
            <p class="text-xs uppercase font-bold text-accent tracking-wider">${getCategoryName(product.category)}</p>
            <h3 class="text-lg font-bold text-primary dark:text-secondary">${product.name}</h3>
            <div class="flex items-center gap-1">
                <span class="text-accent">${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}</span>
                <span class="text-xs text-primary/50 dark:text-secondary/50">(${product.reviews})</span>
            </div>
            <div class="flex items-center justify-between pt-2">
                <div>
                    <p class="text-sm line-through text-primary/40 dark:text-secondary/40">$${product.originalPrice.toFixed(2)}</p>
                    <p class="text-2xl font-bold bg-gradient-to-r from-accent to-orange-accent bg-clip-text text-transparent">$${product.price.toFixed(2)}</p>
                </div>
            </div>
        </div>
    `;

    card.onclick = () => {
        window.location.href = 'product-detail.html?id=' + product.id;
    };

    return card;
}

// Configurar event listeners
function setupEventListeners() {
    // Cantidad
    const qtyInput = document.getElementById('qty-input');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');

    qtyMinus.addEventListener('click', () => {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
    });

    qtyPlus.addEventListener('click', () => {
        qtyInput.value = Math.min(10, parseInt(qtyInput.value) + 1);
    });

    // Añadir al carrito
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    addToCartBtn.addEventListener('click', addToCart);

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Añadir al carrito
function addToCart() {
    if (!selectedSize) {
        showNotification('Por favor selecciona una talla', 'error');
        return;
    }

    if (!selectedColor) {
        showNotification('Por favor selecciona un color', 'error');
        return;
    }

    const quantity = parseInt(document.getElementById('qty-input').value);

    if (cart.addItem(currentProduct, quantity, selectedSize, selectedColor)) {
        showNotification('✓ Producto añadido al carrito', 'success');
        updateCartBadge();
        
        // Animar botón
        const btn = document.getElementById('add-to-cart-btn');
        btn.classList.add('scale-95');
        setTimeout(() => {
            btn.classList.remove('scale-95');
        }, 200);
    }
}

// Actualizar badge del carrito
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const totalItems = cart.getTotalItems();

    if (totalItems > 0) {
        badge.classList.remove('hidden');
        badge.textContent = totalItems > 99 ? '99+' : totalItems;
    } else {
        badge.classList.add('hidden');
    }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 px-6 py-3 rounded-full text-white font-bold text-sm z-50 animate-bounce ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Toggle tema
function toggleTheme() {
    const htmlElement = document.documentElement;
    
    if (htmlElement.classList.contains('dark')) {
        htmlElement.classList.remove('dark');
        localStorage.setItem('urbangt-theme', 'light');
    } else {
        htmlElement.classList.add('dark');
        localStorage.setItem('urbangt-theme', 'dark');
    }
}

// Hacer scroll suave en anclajes
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

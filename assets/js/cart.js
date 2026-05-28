// ============================================================
// Cart Management - urbangt
// Gestión completa del carrito con localStorage
// ============================================================

export class ShoppingCart {
    constructor() {
        this.items = this.loadFromStorage();
        this.updateUI();
    }

    // Cargar carrito desde localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('urbangt-cart');
        return saved ? JSON.parse(saved) : [];
    }

    // Guardar carrito en localStorage
    saveToStorage() {
        localStorage.setItem('urbangt-cart', JSON.stringify(this.items));
        this.updateUI();
    }

    // Agregar producto al carrito
    addItem(product, quantity = 1, selectedSize = null, selectedColor = null) {
        const existingItem = this.items.find(item => 
            item.id === product.id && 
            item.size === selectedSize && 
            item.color === selectedColor
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                size: selectedSize,
                color: selectedColor,
                category: product.category
            });
        }

        this.saveToStorage();
        return true;
    }

    // Eliminar producto del carrito
    removeItem(id, size, color) {
        this.items = this.items.filter(item => 
            !(item.id === id && item.size === size && item.color === color)
        );
        this.saveToStorage();
    }

    // Actualizar cantidad
    updateQuantity(id, size, color, quantity) {
        const item = this.items.find(item => 
            item.id === id && item.size === size && item.color === color
        );
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveToStorage();
        }
    }

    // Obtener total de items
    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Obtener total del carrito
    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Vaciar carrito
    clear() {
        this.items = [];
        this.saveToStorage();
    }

    // Obtener todos los items
    getItems() {
        return this.items;
    }

    // Actualizar UI del carrito
    updateUI() {
        const badge = document.getElementById('cart-badge');
        const totalItems = this.getTotalItems();

        if (totalItems > 0) {
            badge.classList.remove('hidden');
            badge.textContent = totalItems > 99 ? '99+' : totalItems;
        } else {
            badge.classList.add('hidden');
        }
    }

    // Validar carrito
    isValid() {
        return this.items.length > 0;
    }
}

// Instancia global del carrito
export const cart = new ShoppingCart();

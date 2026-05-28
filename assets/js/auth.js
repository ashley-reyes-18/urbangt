// ============================================================
// Authentication System - urbangt
// Sistema de login y registro con localStorage
// ============================================================

export class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
    }

    // Cargar usuarios desde localStorage
    loadUsers() {
        const saved = localStorage.getItem('urbangt-users');
        return saved ? JSON.parse(saved) : [];
    }

    // Cargar usuario actual
    loadCurrentUser() {
        const saved = localStorage.getItem('urbangt-current-user');
        return saved ? JSON.parse(saved) : null;
    }

    // Guardar usuarios
    saveUsers() {
        localStorage.setItem('urbangt-users', JSON.stringify(this.users));
    }

    // Guardar usuario actual
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem('urbangt-current-user', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('urbangt-current-user');
        }
    }

    // Validar email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar contraseña
    isValidPassword(password) {
        return password.length >= 6;
    }

    // Registrar nuevo usuario
    register(username, email, password, passwordConfirm) {
        // Validaciones
        if (!username || username.length < 3) {
            return { success: false, message: 'El usuario debe tener al menos 3 caracteres' };
        }

        if (!this.isValidEmail(email)) {
            return { success: false, message: 'Email inválido' };
        }

        if (!this.isValidPassword(password)) {
            return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }

        if (password !== passwordConfirm) {
            return { success: false, message: 'Las contraseñas no coinciden' };
        }

        // Verificar si el email ya existe
        if (this.users.some(u => u.email === email)) {
            return { success: false, message: 'El email ya está registrado' };
        }

        // Crear nuevo usuario
        const newUser = {
            id: Date.now(),
            username,
            email,
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            profile: {
                firstName: '',
                lastName: '',
                phone: '',
                address: '',
                city: '',
                country: '',
                zipCode: ''
            }
        };

        this.users.push(newUser);
        this.saveUsers();

        return { success: true, message: 'Registro exitoso. Por favor inicia sesión' };
    }

    // Login de usuario
    login(email, password) {
        // Validaciones
        if (!this.isValidEmail(email)) {
            return { success: false, message: 'Email inválido' };
        }

        if (!password) {
            return { success: false, message: 'Contraseña requerida' };
        }

        // Buscar usuario
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, message: 'Email o contraseña incorrectos' };
        }

        // Verificar contraseña
        if (!this.verifyPassword(password, user.password)) {
            return { success: false, message: 'Email o contraseña incorrectos' };
        }

        // Establecer usuario actual
        this.currentUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            loginTime: new Date().toISOString()
        };

        this.saveCurrentUser();
        return { success: true, message: 'Bienvenido ' + user.username };
    }

    // Logout
    logout() {
        this.currentUser = null;
        this.saveCurrentUser();
        return { success: true, message: 'Sesión cerrada' };
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar si está logueado
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Actualizar perfil de usuario
    updateProfile(updates) {
        if (!this.currentUser) {
            return { success: false, message: 'No hay usuario logueado' };
        }

        const user = this.users.find(u => u.id === this.currentUser.id);
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        // Actualizar perfil
        user.profile = { ...user.profile, ...updates };
        this.currentUser.profile = user.profile;

        this.saveUsers();
        this.saveCurrentUser();

        return { success: true, message: 'Perfil actualizado' };
    }

    // Hash simple de contraseña (en producción usar bcrypt)
    hashPassword(password) {
        // En producción, usar una librería como bcrypt
        return btoa(password); // Base64 encoding (NO SEGURO para producción)
    }

    // Verificar contraseña
    verifyPassword(password, hash) {
        return btoa(password) === hash;
    }

    // Cambiar contraseña
    changePassword(currentPassword, newPassword, confirmPassword) {
        if (!this.currentUser) {
            return { success: false, message: 'No hay usuario logueado' };
        }

        const user = this.users.find(u => u.id === this.currentUser.id);
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        // Verificar contraseña actual
        if (!this.verifyPassword(currentPassword, user.password)) {
            return { success: false, message: 'Contraseña actual incorrecta' };
        }

        // Validar nueva contraseña
        if (!this.isValidPassword(newPassword)) {
            return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }

        if (newPassword !== confirmPassword) {
            return { success: false, message: 'Las contraseñas no coinciden' };
        }

        // Actualizar contraseña
        user.password = this.hashPassword(newPassword);
        this.saveUsers();

        return { success: true, message: 'Contraseña actualizada' };
    }

    // Obtener historial de órdenes del usuario
    getOrderHistory() {
        if (!this.currentUser) {
            return [];
        }

        const saved = localStorage.getItem('urbangt-orders');
        const orders = saved ? JSON.parse(saved) : [];
        return orders.filter(o => o.userId === this.currentUser.id);
    }

    // Agregar orden al historial
    addOrder(orderData) {
        if (!this.currentUser) {
            return { success: false, message: 'Usuario no logueado' };
        }

        const orders = localStorage.getItem('urbangt-orders');
        const ordersList = orders ? JSON.parse(orders) : [];

        const newOrder = {
            id: Date.now(),
            userId: this.currentUser.id,
            items: orderData.items,
            total: orderData.total,
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            status: 'pending',
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        };

        ordersList.push(newOrder);
        localStorage.setItem('urbangt-orders', JSON.stringify(ordersList));

        return { success: true, message: 'Orden registrada', orderId: newOrder.id };
    }
}

// Instancia global de autenticación
export const auth = new AuthSystem();

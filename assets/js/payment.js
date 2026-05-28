// ============================================================
// Payment System - urbangt
// Sistema de pagos con múltiples métodos
// ============================================================

export class PaymentSystem {
    constructor() {
        this.paymentMethods = ['credit-card', 'debit-card', 'paypal', 'bank-transfer', 'cryptocurrency'];
        this.transactions = this.loadTransactions();
    }

    // Cargar transacciones
    loadTransactions() {
        const saved = localStorage.getItem('urbangt-transactions');
        return saved ? JSON.parse(saved) : [];
    }

    // Guardar transacciones
    saveTransactions() {
        localStorage.setItem('urbangt-transactions', JSON.stringify(this.transactions));
    }

    // Validar número de tarjeta (Luhn algorithm)
    validateCardNumber(cardNumber) {
        const sanitized = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(sanitized)) return false;

        let sum = 0;
        let isEven = false;

        for (let i = sanitized.length - 1; i >= 0; i--) {
            let digit = parseInt(sanitized.charAt(i), 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    // Validar CVV
    validateCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    // Validar fecha de expiración
    validateExpiryDate(month, year) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const expYear = parseInt(year);
        const expMonth = parseInt(month);

        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;

        return true;
    }

    // Procesar pago con tarjeta de crédito
    processCardPayment(cardData) {
        // Validaciones
        if (!this.validateCardNumber(cardData.cardNumber)) {
            return { success: false, message: 'Número de tarjeta inválido' };
        }

        if (!this.validateExpiryDate(cardData.expiryMonth, cardData.expiryYear)) {
            return { success: false, message: 'Fecha de expiración inválida' };
        }

        if (!this.validateCVV(cardData.cvv)) {
            return { success: false, message: 'CVV inválido' };
        }

        if (!cardData.cardholderName || cardData.cardholderName.length < 3) {
            return { success: false, message: 'Nombre del titular inválido' };
        }

        // Simular procesamiento (en producción conectar a API)
        return this.createTransaction({
            method: 'credit-card',
            amount: cardData.amount,
            cardLast4: cardData.cardNumber.slice(-4),
            status: 'completed'
        });
    }

    // Procesar pago con PayPal
    processPayPalPayment(email, amount) {
        if (!this.isValidEmail(email)) {
            return { success: false, message: 'Email de PayPal inválido' };
        }

        // En producción, redirigir a PayPal API
        return this.createTransaction({
            method: 'paypal',
            email: email,
            amount: amount,
            status: 'pending'
        });
    }

    // Procesar transferencia bancaria
    processBankTransfer(bankData) {
        if (!bankData.accountNumber || bankData.accountNumber.length < 8) {
            return { success: false, message: 'Número de cuenta inválido' };
        }

        if (!bankData.routingNumber || bankData.routingNumber.length < 8) {
            return { success: false, message: 'Número de ruta inválido' };
        }

        return this.createTransaction({
            method: 'bank-transfer',
            accountLast4: bankData.accountNumber.slice(-4),
            amount: bankData.amount,
            status: 'pending'
        });
    }

    // Procesar criptomoneda
    processCryptoPayment(cryptoData) {
        const validCryptos = ['bitcoin', 'ethereum', 'litecoin'];
        
        if (!validCryptos.includes(cryptoData.cryptoType.toLowerCase())) {
            return { success: false, message: 'Criptomoneda no válida' };
        }

        if (!cryptoData.walletAddress || cryptoData.walletAddress.length < 26) {
            return { success: false, message: 'Dirección de billetera inválida' };
        }

        return this.createTransaction({
            method: 'cryptocurrency',
            cryptoType: cryptoData.cryptoType,
            walletAddress: cryptoData.walletAddress,
            amount: cryptoData.amount,
            status: 'pending'
        });
    }

    // Crear transacción
    createTransaction(transactionData) {
        const transaction = {
            id: 'TXN-' + Date.now(),
            ...transactionData,
            timestamp: new Date().toISOString(),
            reference: Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        this.transactions.push(transaction);
        this.saveTransactions();

        return {
            success: true,
            message: 'Pago procesado exitosamente',
            transactionId: transaction.id,
            reference: transaction.reference
        };
    }

    // Validar email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Obtener transacciones
    getTransactions(userId = null) {
        if (userId) {
            return this.transactions.filter(t => t.userId === userId);
        }
        return this.transactions;
    }

    // Obtener transacción por ID
    getTransactionById(transactionId) {
        return this.transactions.find(t => t.id === transactionId);
    }

    // Calcular impuestos
    calculateTax(amount, taxRate = 0.15) {
        return parseFloat((amount * taxRate).toFixed(2));
    }

    // Calcular envío
    calculateShipping(amount, shippingCost = 10) {
        if (amount > 100) {
            return 0; // Envío gratis para órdenes > $100
        }
        return shippingCost;
    }

    // Calcular total con impuestos y envío
    calculateTotal(subtotal, taxRate = 0.15, shippingCost = 10) {
        const tax = this.calculateTax(subtotal, taxRate);
        const shipping = this.calculateShipping(subtotal, shippingCost);
        const total = subtotal + tax + shipping;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: tax,
            shipping: shipping,
            total: parseFloat(total.toFixed(2))
        };
    }

    // Aplicar cupón de descuento
    applyCoupon(couponCode, amount) {
        const coupons = {
            'URBANGT10': 0.10,
            'URBANGT20': 0.20,
            'SUMMER50': 0.50,
            'NEWYEAR30': 0.30,
            'VIP25': 0.25
        };

        const discount = coupons[couponCode.toUpperCase()];
        if (!discount) {
            return { success: false, message: 'Cupón inválido' };
        }

        const discountAmount = amount * discount;
        const newTotal = amount - discountAmount;

        return {
            success: true,
            discountPercent: discount * 100,
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            newTotal: parseFloat(newTotal.toFixed(2))
        };
    }

    // Generar recibo
    generateReceipt(transaction, orderDetails) {
        return {
            receiptNumber: transaction.reference,
            transactionId: transaction.id,
            date: new Date(transaction.timestamp).toLocaleDateString('es-MX'),
            time: new Date(transaction.timestamp).toLocaleTimeString('es-MX'),
            paymentMethod: this.getPaymentMethodName(transaction.method),
            amount: transaction.amount,
            items: orderDetails.items,
            shippingAddress: orderDetails.shippingAddress,
            status: transaction.status
        };
    }

    // Obtener nombre del método de pago
    getPaymentMethodName(method) {
        const names = {
            'credit-card': 'Tarjeta de Crédito',
            'debit-card': 'Tarjeta de Débito',
            'paypal': 'PayPal',
            'bank-transfer': 'Transferencia Bancaria',
            'cryptocurrency': 'Criptomoneda'
        };
        return names[method] || method;
    }

    // Reembolsar pago
    refundPayment(transactionId, reason) {
        const transaction = this.getTransactionById(transactionId);
        
        if (!transaction) {
            return { success: false, message: 'Transacción no encontrada' };
        }

        if (transaction.status === 'refunded') {
            return { success: false, message: 'Transacción ya reembolsada' };
        }

        transaction.status = 'refunded';
        transaction.refundReason = reason;
        transaction.refundDate = new Date().toISOString();

        this.saveTransactions();

        return {
            success: true,
            message: 'Reembolso procesado',
            refundId: 'RFD-' + Date.now()
        };
    }
}

// Instancia global del sistema de pagos
export const payment = new PaymentSystem();

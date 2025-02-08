const mongoose = require('mongoose');
const Product = require('../models/product.model');



// Definir el esquema del carrito en MongoDB
const cartSchema = new mongoose.Schema({
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, default: 1 },
        }
    ]
});

// Crear el modelo del carrito basado en el esquema
const Cart = mongoose.model('Cart', cartSchema);

class CartManager {
    // Obtener un carrito por ID
    async getCartById(cid) {
        try {
            return await Cart.findById(cid).populate('products.product');
        } catch (error) {
            console.error('🔴 Error al obtener el carrito:', error);
            return null;
        }
    }

    // Crear un nuevo carrito vacío
    async createCart() {
        try {
            const newCart = new Cart({ products: [] });
            return await newCart.save();
        } catch (error) {
            console.error('🔴 Error al crear el carrito:', error);
            throw error;
        }
    }

    // Agregar un producto a un carrito
    async addProductToCart(cid, pid, quantity = 1) {
        try {
            // Verificacion de IDs
            if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
                return { error: '🔴 ID de carrito o producto inválido' };
            }
    
            // Busqueda del carrito
            const cart = await Cart.findById(cid);
            if (!cart) return { error: '🔴 Carrito no encontrado' };
    
            // Busqueda del producto en la base de datos
            const product = await Product.findById(pid);
            if (!product) return { error: '🔴 Producto no encontrado' };
    
            // Verificacion de stock
            if (product.stock < quantity) {
                return { error: `🔴 Stock insuficiente. Solo quedan ${product.stock} unidades disponibles.` };
            }
    
            // verificacion de existencia de producto
            const existingProduct = cart.products.find(p => p.product.toString() === pid);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ product: pid, quantity });
            }
    
            // Resta del stock disponible
            product.stock -= quantity;
    
            // Guardar los cambios en la base de datos
            await product.save();
            await cart.save();
    
            return cart;
        } catch (error) {
            console.error('🔴 Error al agregar producto al carrito:', error);
            return { error: '🔴 Error interno del servidor' };
        }
    }
    

    // Put para actualizacion de carrito
    async updateCart(cid, newProducts) {
        try {
            const cart = await Cart.findById(cid);
            if (!cart) return { error: '🔴 Carrito no encontrado' };

            // Reemplazar todos los productos del carrito con los nuevos productos
            cart.products = newProducts;
            await cart.save();
            return cart;
        } catch (error) {
            console.error('🔴 Error al actualizar carrito:', error);
            throw error;
        }
    }

    // Delete para eliminar un producto del carrito
    async removeProductFromCart(cid, pid) {
        try {
            const cart = await Cart.findById(cid);
            if (!cart) return { error: '🔴 Carrito no encontrado' };
    
            const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
            if (productIndex === -1) {
                return { error: '🔴 Producto no encontrado en el carrito' };
            }
    
            cart.products.splice(productIndex, 1);
            await cart.save();

            return cart;
        } catch (error) {
            console.error('🔴 Error al eliminar producto del carrito:', error);
            return { error: '🔴 Error interno del servidor' };
        }
    }    
}

module.exports = CartManager;


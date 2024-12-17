const fs = require('fs').promises; // Módulo File System con Promesas

class CartManager {
    #carts;
    #path;

    constructor() {
        this.#path = './src/data/carrito.json'; // Ruta al archivo cart.json
        this.#carts = []; // Almacén temporal en memoria
        this.#loadCarts(); // Carga inicial de carritos
    }

    // Método privado para cargar carritos desde el archivo
    async #loadCarts() {
        try {
            const data = await fs.readFile(this.#path, 'utf-8');
            this.#carts = JSON.parse(data);
        } catch (error) {
            this.#carts = [];
        }
    }

    // Método privado para guardar carritos en el archivo
    async #saveCarts() {
        await fs.writeFile(this.#path, JSON.stringify(this.#carts, null, 2));
    }

    // Método para crear un carrito
    async createCart() {
        const newCart = {
            id: this.#carts.length > 0 ? this.#carts[this.#carts.length - 1].id + 1 : 1,
            products: []
        };
        this.#carts.push(newCart);
        await this.#saveCarts();
        return newCart;
    }

    // Método para obtener todos los carritos
    async getCarts() {
        return this.#carts;
    }

    // Método para obtener un carrito por ID
    async getCartById(id) {
        return this.#carts.find(cart => cart.id === Number(id));
    }

    // Método para agregar un producto a un carrito
    async addProductToCart(cartId, productId) {
        await this.#loadCarts(); // Asegura que se tenga la última versión de los carritos
        const cart = this.#carts.find(c => c.id === Number(cartId));
        if (!cart) return null;

        // Busca el producto en el carrito
        const productInCart = cart.products.find(p => p.id === Number(productId));

        if (productInCart) {
            productInCart.quantity++; // Incrementa la cantidad si ya existe
        } else {
            cart.products.push({ id: Number(productId), quantity: 1 }); // Agrega un nuevo producto
        }

        await this.#saveCarts(); // Guarda los cambios en cart.json
        return cart;
    }
}

module.exports = CartManager;


const fs = require('fs').promises;

class ProductManager {
    #products;
    #path;

    constructor() {
        this.#path = './src/data/productos.json'; // Ruta al archivo products.json
        this.#products = [];
        this.#loadProducts(); // Cargar productos al iniciar
    }

    // Método privado para cargar productos desde el archivo
    async #loadProducts() {
        try {
            const data = await fs.readFile(this.#path, 'utf-8');
            this.#products = JSON.parse(data);
        } catch (error) {
            this.#products = [];
        }
    }

    // Método privado para guardar productos en el archivo
    async #saveProducts() {
        await fs.writeFile(this.#path, JSON.stringify(this.#products, null, 2));
    }

    // Método para agregar un producto
    async addProduct({ title, description, code, price, stock, category, thumbnails }) {
        // Validaciones
        if (!title || !description || !code || price === undefined || stock === undefined || !category) {
            throw new Error('Todos los campos son obligatorios excepto thumbnails');
        }

        // Verifica si el producto con el mismo código ya existe
        await this.#loadProducts(); // Asegura que se trabaje con la última versión del archivo
        const exists = this.#products.find(product => product.code === code);
        if (exists) throw new Error('Ya existe un producto con ese código');

        // Generación de ID autoincremental
        const id = this.#products.length > 0 ? this.#products[this.#products.length - 1].id + 1 : 1;

        const newProduct = {
            id,
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails: thumbnails || []
        };

        this.#products.push(newProduct);
        await this.#saveProducts();
        return newProduct;
    }

    // Método para obtener todos los productos (con limit opcional)
    async getProducts(limit) {
        await this.#loadProducts();
        return limit ? this.#products.slice(0, Number(limit)) : this.#products;
    }

    // Método para obtener un producto por ID
    async getProductById(id) {
        await this.#loadProducts();
        const product = this.#products.find(product => product.id === Number(id));
        return product || null;
    }

    // Método para actualizar un producto
    async updateProduct(id, updateFields) {
        await this.#loadProducts();
        const productIndex = this.#products.findIndex(product => product.id === Number(id));

        if (productIndex === -1) return null;

        // No permite actualizar el ID
        delete updateFields.id;

        // Actualiza los campos proporcionados
        this.#products[productIndex] = {
            ...this.#products[productIndex],
            ...updateFields
        };

        await this.#saveProducts();
        return this.#products[productIndex];
    }

    // Método para eliminar un producto por ID
    async deleteProduct(id) {
        await this.#loadProducts();
        const productIndex = this.#products.findIndex(product => product.id === Number(id));

        if (productIndex === -1) return false;

        this.#products.splice(productIndex, 1);
        await this.#saveProducts();
        return true;
    }
}

module.exports = ProductManager;
